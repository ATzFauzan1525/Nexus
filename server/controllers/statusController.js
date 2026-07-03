const pool = require('../config/db');
const { emitToUser, emitToRole, emitToRoom } = require('../socket');
const { log: auditLog } = require('../helpers/auditLog');

const BIDANG_LIST = ['Kurikulum', 'Kesiswaan', 'SaranaPrasarana', 'Humas', 'Keuangan'];

exports.updateStatus = async (req, res) => {
  const { surat_id, status, catatan } = req.body;

  if (!surat_id || !status) {
    return res.status(400).json({ message: 'Surat ID dan status wajib diisi' });
  }

  const validStatuses = ['Diterima', 'Didisposisi', 'Diproses', 'Selesai'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check current status
    const suratCheck = await client.query('SELECT status, nomor_surat FROM surat_masuk WHERE id = $1', [surat_id]);
    if (suratCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    const currentStatus = suratCheck.rows[0].status;
    const nomorSurat = suratCheck.rows[0].nomor_surat;

    // BR-12: Selesai cannot be changed
    if (currentStatus === 'Selesai') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Surat yang sudah Selesai tidak dapat diubah' });
    }

    // BR-03: Status must follow order
    const statusOrder = { 'Diterima': 0, 'Didisposisi': 1, 'Diproses': 2, 'Selesai': 3 };
    if (statusOrder[status] <= statusOrder[currentStatus]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Status tidak boleh mundur' });
    }

    // Update surat status
    await client.query(
      'UPDATE surat_masuk SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, surat_id]
    );

    // Add status entry (event sourcing - BR-08)
    await client.query(
      `INSERT INTO status_surat (surat_id, status, catatan, diubah_oleh)
       VALUES ($1, $2, $3, $4)`,
      [surat_id, status, catatan || '', req.user.id]
    );

    // --- Notifications ---
    // Notify Kepala Sekolah
    const kepalaResult = await client.query(
      "SELECT id FROM pengguna WHERE role = 'KEPALA_SEKOLAH' AND is_active = true"
    );
    for (const kepala of kepalaResult.rows) {
      await client.query(
        `INSERT INTO notifikasi (user_id, judul, pesan, tipe, reference_id)
         VALUES ($1, 'Status Surat Diperbarui', $2, 'status_update', $3)`,
        [kepala.id, `Surat ${nomorSurat} telah diperbarui ke status: ${status}`, surat_id]
      );
    }

    // Notify Admin TU (who originally input the surat)
    const suratCreator = await client.query(
      'SELECT created_by FROM surat_masuk WHERE id = $1',
      [surat_id]
    );
    if (suratCreator.rows[0]?.created_by) {
      await client.query(
        `INSERT INTO notifikasi (user_id, judul, pesan, tipe, reference_id)
         VALUES ($1, 'Status Surat Diperbarui', $2, 'status_update', $3)`,
        [suratCreator.rows[0].created_by, `Surat ${nomorSurat} telah diperbarui ke status: ${status}`, surat_id]
      );
    }

    await client.query('COMMIT');

    // --- Realtime Events (per IA section 5) ---

    // notifikasi:baru → user:{idPenerima} for each notified user
    for (const kepala of kepalaResult.rows) {
      emitToUser(kepala.id, 'notifikasi:baru', {
        judul: 'Status Surat Diperbarui',
        pesan: `Surat ${nomorSurat} telah diperbarui ke status: ${status}`,
        tipe: 'status_update',
        reference_id: surat_id,
      });
    }
    if (suratCreator.rows[0]?.created_by) {
      emitToUser(suratCreator.rows[0].created_by, 'notifikasi:baru', {
        judul: 'Status Surat Diperbarui',
        pesan: `Surat ${nomorSurat} telah diperbarui ke status: ${status}`,
        tipe: 'status_update',
        reference_id: surat_id,
      });
    }

    // status:update → role:KEPALA_SEKOLAH, user:{idAdminTU}, role:WAKASEK_BIDANG:{bidang}
    emitToRole('KEPALA_SEKOLAH', 'status:update', { surat_id, status, nomorSurat });
    if (suratCreator.rows[0]?.created_by) {
      emitToUser(suratCreator.rows[0].created_by, 'status:update', { surat_id, status, nomorSurat });
    }
    // Emit to all WAKASEK_BIDANG rooms
    for (const bidang of BIDANG_LIST) {
      emitToRoom(`role:WAKASEK_BIDANG:${bidang}`, 'status:update', { surat_id, status, nomorSurat });
    }

    // dashboard:refresh → role:KEPALA_SEKOLAH, role:WAKASEK
    emitToRole('KEPALA_SEKOLAH', 'dashboard:refresh', {});
    emitToRole('WAKASEK', 'dashboard:refresh', {});

    // lacak:update → room lacak:{nomorSurat} with limited payload only (BR-16)
    let posisiSaatIni = 'Unit TU Sekolah';
    if (status === 'Selesai') {
      posisiSaatIni = 'Selesai Diproses';
    } else if (status === 'Didisposisi' || status === 'Diproses') {
      const disposisiResult = await pool.query(
        `SELECT p.nama_lengkap, p.bidang FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id
         WHERE d.surat_id = $1 ORDER BY d.created_at DESC LIMIT 1`,
        [surat_id]
      );
      if (disposisiResult.rows.length > 0) {
        const d = disposisiResult.rows[0];
        posisiSaatIni = `${d.nama_lengkap} (${d.bidang || 'Guru/Staf'})`;
      }
    }
    emitToRoom(`lacak:${nomorSurat}`, 'lacak:update', { status, posisiSaatIni });

    await auditLog(req.user.id, 'UPDATE_STATUS', 'surat_masuk', surat_id, `Status diubah ke ${status}`, req.ip);

    res.json({ message: 'Status berhasil diperbarui', status });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    client.release();
  }
};
