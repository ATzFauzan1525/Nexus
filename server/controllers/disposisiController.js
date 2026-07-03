const pool = require('../config/db');
const { emitToUser, emitToRole, emitToRoom } = require('../socket');
const { log: auditLog } = require('../helpers/auditLog');

const BIDANG_LIST = ['Kurikulum', 'Kesiswaan', 'SaranaPrasarana', 'Humas', 'Keuangan'];

exports.getAll = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = '';
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'GURU_STAF') {
      query = `SELECT d.*, s.nomor_surat, s.perihal, s.status as surat_status,
               pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama
               FROM disposisi d
               JOIN surat_masuk s ON d.surat_id = s.id
               LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
               LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
               WHERE d.diberikan_kepada = $${paramIndex}`;
      params.push(req.user.id);
      paramIndex++;
    } else if (req.user.role === 'KEPALA_SEKOLAH') {
      query = `SELECT d.*, s.nomor_surat, s.perihal, s.status as surat_status,
               pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama,
               ss.catatan as catatan_selesai, ss.created_at as selesai_at
               FROM disposisi d
               JOIN surat_masuk s ON d.surat_id = s.id
               LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
               LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
               LEFT JOIN LATERAL (
                 SELECT catatan, created_at FROM status_surat
                 WHERE surat_id = d.surat_id AND status = 'Selesai'
                 ORDER BY created_at DESC LIMIT 1
               ) ss ON true
               WHERE d.diberikan_oleh = $${paramIndex}`;
      params.push(req.user.id);
      paramIndex++;
    } else if (req.user.role === 'WAKASEK') {
      query = `SELECT d.*, s.nomor_surat, s.perihal, s.status as surat_status,
               pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama
               FROM disposisi d
               JOIN surat_masuk s ON d.surat_id = s.id
               LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
               LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
               WHERE pp.bidang = $${paramIndex}`;
      params.push(req.user.bidang);
      paramIndex++;
    } else {
      query = `SELECT d.*, s.nomor_surat, s.perihal, s.status as surat_status,
               pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama
               FROM disposisi d
               JOIN surat_masuk s ON d.surat_id = s.id
               LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
               LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) sub`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ data: result.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get disposisi error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, s.id as surat_id, s.nomor_surat, s.perihal, s.pengirim, s.tanggal_diterima, s.status as surat_status, s.file_scan,
       pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama, pp.bidang::text as penerima_bidang
       FROM disposisi d
       JOIN surat_masuk s ON d.surat_id = s.id
       LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
       LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Disposisi tidak ditemukan' });
    }

    const disposisi = result.rows[0];

    // GURU_STAF can only see their own disposisi
    if (req.user.role === 'GURU_STAF' && disposisi.diberikan_kepada !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke disposisi ini' });
    }

    // Get latest status_surat catatan (for "Selesai" notes from Guru)
    const statusResult = await pool.query(
      `SELECT ss.catatan, ss.status, ss.diubah_oleh, ss.created_at, p.nama_lengkap as pengubah_nama
       FROM status_surat ss
       LEFT JOIN pengguna p ON ss.diubah_oleh = p.id
       WHERE ss.surat_id = $1
       ORDER BY ss.created_at DESC LIMIT 1`,
      [disposisi.surat_id]
    );

    res.json({
      ...disposisi,
      status_terakhir: statusResult.rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.create = async (req, res) => {
  const { surat_id, diberikan_kepada, instruksi, deadline } = req.body;

  if (!surat_id || !diberikan_kepada || !instruksi || !deadline) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify surat exists
    const suratCheck = await client.query('SELECT status FROM surat_masuk WHERE id = $1', [surat_id]);
    if (suratCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    // Create disposisi
    const result = await client.query(
      `INSERT INTO disposisi (surat_id, diberikan_oleh, diberikan_kepada, instruksi, deadline)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [surat_id, req.user.id, diberikan_kepada, instruksi, deadline]
    );
    const disposisi = result.rows[0];

    // Update surat status to Didisposisi
    await client.query(
      "UPDATE surat_masuk SET status = 'Didisposisi', updated_at = NOW() WHERE id = $1",
      [surat_id]
    );

    // Add status entry (event sourcing - BR-08)
    await client.query(
      `INSERT INTO status_surat (surat_id, status, catatan, diubah_oleh)
       VALUES ($1, 'Didisposisi', $2, $3)`,
      [surat_id, `Surat didisposisikan ke penerima`, req.user.id]
    );

    // Get penerima and surat info for notifications/events
    const penerimaResult = await client.query(
      'SELECT nama_lengkap, bidang FROM pengguna WHERE id = $1',
      [diberikan_kepada]
    );
    const suratInfo = await client.query(
      'SELECT nomor_surat, perihal FROM surat_masuk WHERE id = $1',
      [surat_id]
    );

    // Create notification for penerima (BR-07)
    await client.query(
      `INSERT INTO notifikasi (user_id, judul, pesan, tipe, reference_id)
       VALUES ($1, 'Disposisi Baru', $2, 'disposisi_baru', $3)`,
      [diberikan_kepada, `Anda menerima disposisi surat ${suratInfo.rows[0].nomor_surat} - ${suratInfo.rows[0].perihal}`, disposisi.id]
    );

    await client.query('COMMIT');

    // --- Realtime Events (per IA section 5) ---

    const penerimaData = penerimaResult.rows[0];

    // disposisi:baru → user:{idPenerima} (Guru/Staf terkait)
    emitToUser(diberikan_kepada, 'disposisi:baru', {
      ...disposisi,
      nomor_surat: suratInfo.rows[0].nomor_surat,
      perihal: suratInfo.rows[0].perihal,
      pemberi_nama: req.user.nama_lengkap,
      penerima_nama: penerimaData.nama_lengkap,
    });

    // notifikasi:baru → user:{idPenerima}
    emitToUser(diberikan_kepada, 'notifikasi:baru', {
      judul: 'Disposisi Baru',
      pesan: `Anda menerima disposisi surat ${suratInfo.rows[0].nomor_surat} - ${suratInfo.rows[0].perihal}`,
      tipe: 'disposisi_baru',
      reference_id: disposisi.id,
    });

    // status:update → role:KEPALA_SEKOLAH + all WAKASEK_BIDANG rooms
    emitToRole('KEPALA_SEKOLAH', 'status:update', { surat_id, status: 'Didisposisi', nomorSurat: suratInfo.rows[0].nomor_surat });
    for (const bidang of BIDANG_LIST) {
      emitToRoom(`role:WAKASEK_BIDANG:${bidang}`, 'status:update', { surat_id, status: 'Didisposisi', nomorSurat: suratInfo.rows[0].nomor_surat });
    }

    // dashboard:refresh → role:KEPALA_SEKOLAH, role:WAKASEK
    emitToRole('KEPALA_SEKOLAH', 'dashboard:refresh', {});
    emitToRole('WAKASEK', 'dashboard:refresh', {});

    // lacak:update → room lacak:{nomorSurat} with limited payload only (BR-16)
    emitToRoom(`lacak:${suratInfo.rows[0].nomor_surat}`, 'lacak:update', {
      status: 'Didisposisi',
      posisiSaatIni: penerimaData.nama_lengkap,
    });

    await auditLog(req.user.id, 'CREATE', 'disposisi', disposisi.id, `Disposisi surat ${suratInfo.rows[0].nomor_surat} ke ${penerimaData.nama_lengkap}`, req.ip);

    res.status(201).json(disposisi);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create disposisi error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    client.release();
  }
};
