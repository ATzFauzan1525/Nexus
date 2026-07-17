const pool = require('../config/db');
const { emitToRole, emitToUser, emitToRoom } = require('../socket');
const { log: auditLog } = require('../helpers/auditLog');

exports.getAll = async (req, res) => {
  const { search, status, tanggal_mulai, tanggal_akhir, pengirim, perihal, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM surat_masuk WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Role-based filtering
    if (req.user.role === 'GURU_STAF') {
      query += ` AND id IN (SELECT surat_id FROM disposisi WHERE diberikan_kepada = $${paramIndex})`;
      params.push(req.user.id);
      paramIndex++;
    } else if (req.user.role === 'WAKASEK' && req.user.bidang) {
      query += ` AND id IN (SELECT surat_id FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id WHERE p.bidang = $${paramIndex})`;
      params.push(req.user.bidang);
      paramIndex++;
    }

    if (search) {
      query += ` AND (nomor_surat ILIKE $${paramIndex} OR pengirim ILIKE $${paramIndex} OR perihal ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tanggal_mulai) {
      query += ` AND tanggal_diterima >= $${paramIndex}`;
      params.push(tanggal_mulai);
      paramIndex++;
    }

    if (tanggal_akhir) {
      query += ` AND tanggal_diterima <= $${paramIndex}`;
      params.push(tanggal_akhir);
      paramIndex++;
    }

    if (pengirim) {
      query += ` AND pengirim ILIKE $${paramIndex}`;
      params.push(`%${pengirim}%`);
      paramIndex++;
    }

    if (perihal) {
      query += ` AND perihal ILIKE $${paramIndex}`;
      params.push(`%${perihal}%`);
      paramIndex++;
    }

    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ data: result.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get surat error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.nama_lengkap as pembuat_nama
       FROM surat_masuk s LEFT JOIN pengguna p ON s.created_by = p.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    const surat = result.rows[0];

    // GURU_STAF can only see surat that have disposisi to them
    if (req.user.role === 'GURU_STAF') {
      const accessCheck = await pool.query(
        'SELECT 1 FROM disposisi WHERE surat_id = $1 AND diberikan_kepada = $2',
        [req.params.id, req.user.id]
      );
      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Anda tidak memiliki akses ke surat ini' });
      }
    }

    // Get timeline
    const timeline = await pool.query(
      `SELECT ss.*, p.nama_lengkap as diubah_oleh_nama
       FROM status_surat ss LEFT JOIN pengguna p ON ss.diubah_oleh = p.id
       WHERE ss.surat_id = $1 ORDER BY ss.created_at ASC`,
      [req.params.id]
    );

    // Get disposisi
    const disposisi = await pool.query(
      `SELECT d.*, pk.nama_lengkap as pemberi_nama, pp.nama_lengkap as penerima_nama
       FROM disposisi d
       LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
       LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
       WHERE d.surat_id = $1 ORDER BY d.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...surat,
      timeline: timeline.rows,
      disposisi: disposisi.rows,
    });
  } catch (err) {
    console.error('Get surat by id error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.create = async (req, res) => {
  const { nomor_surat, tanggal_diterima, pengirim, perihal } = req.body;
  const trimmedNomor = nomor_surat?.trim();
  const file_scan = req.file ? req.file.originalname : null;
  const file_data = req.file ? req.file.buffer : null;
  const file_mime = req.file ? req.file.mimetype : null;

  if (!trimmedNomor || !tanggal_diterima || !pengirim || !perihal) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check duplicate nomor surat
    const existing = await client.query('SELECT id FROM surat_masuk WHERE TRIM(nomor_surat) = $1', [trimmedNomor]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Nomor surat sudah ada' });
    }

    // Insert surat masuk
    const suratResult = await client.query(
      `INSERT INTO surat_masuk (nomor_surat, tanggal_diterima, pengirim, perihal, file_scan, file_data, file_mime, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Diterima', $8) RETURNING *`,
      [trimmedNomor, tanggal_diterima, pengirim, perihal, file_scan, file_data, file_mime, req.user.id]
    );
    const surat = suratResult.rows[0];

    // Insert first status entry
    await client.query(
      `INSERT INTO status_surat (surat_id, status, catatan, diubah_oleh)
       VALUES ($1, 'Diterima', 'Surat diterima oleh Admin TU', $2)`,
      [surat.id, req.user.id]
    );

    // Create notification for Kepala Sekolah
    const kepalaResult = await client.query(
      "SELECT id FROM pengguna WHERE role = 'KEPALA_SEKOLAH' AND is_active = true"
    );
    for (const kepala of kepalaResult.rows) {
      await client.query(
        `INSERT INTO notifikasi (user_id, judul, pesan, tipe, reference_id)
         VALUES ($1, 'Surat Masuk Baru', $2, 'surat_baru', $3)`,
        [kepala.id, `Surat nomor ${nomor_surat} dari ${pengirim} telah diterima`, surat.id]
      );
    }

    await client.query('COMMIT');

    // Emit realtime events
    for (const kepala of kepalaResult.rows) {
      emitToUser(kepala.id, 'notifikasi:baru', {
        judul: 'Surat Masuk Baru',
        pesan: `Surat nomor ${nomor_surat} dari ${pengirim} telah diterima`,
        tipe: 'surat_baru',
        reference_id: surat.id,
      });
    }
    emitToRole('KEPALA_SEKOLAH', 'surat:baru', surat);
    emitToRole('KEPALA_SEKOLAH', 'dashboard:refresh', {});
    emitToRole('WAKASEK', 'dashboard:refresh', {});

    await auditLog(req.user.id, 'CREATE', 'surat_masuk', surat.id, `Surat ${surat.nomor_surat} dari ${surat.pengirim}`, req.ip);

    res.status(201).json(surat);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create surat error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    client.release();
  }
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let stats, recentSurat;

    if (req.user.role === 'GURU_STAF') {
      // Guru/Staf: scoped to disposisi addressed to them
      stats = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.tanggal_diterima = $2 AND s.id IN (SELECT surat_id FROM disposisi WHERE diberikan_kepada = $1)) as total_hari_ini,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai' AND s.id IN (SELECT surat_id FROM disposisi WHERE diberikan_kepada = $1)) as belum_selesai,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai' AND s.id IN (SELECT surat_id FROM disposisi WHERE deadline < CURRENT_DATE AND diberikan_kepada = $1)) as overdue,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.id IN (SELECT surat_id FROM disposisi WHERE diberikan_kepada = $1)) as total_semua`,
        [req.user.id, today]
      );
      recentSurat = await pool.query(
        `SELECT s.*, p.nama_lengkap as pembuat_nama
         FROM surat_masuk s LEFT JOIN pengguna p ON s.created_by = p.id
         WHERE s.id IN (SELECT surat_id FROM disposisi WHERE diberikan_kepada = $1)
         ORDER BY s.created_at DESC LIMIT 5`,
        [req.user.id]
      );
    } else if (req.user.role === 'WAKASEK' && req.user.bidang) {
      // Wakasek: scoped to disposisi in their bidang
      stats = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.tanggal_diterima = $2 AND s.id IN (SELECT d.surat_id FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id WHERE p.bidang = $1)) as total_hari_ini,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai' AND s.id IN (SELECT d.surat_id FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id WHERE p.bidang = $1)) as belum_selesai,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai' AND s.id IN (SELECT d.surat_id FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id WHERE d.deadline < CURRENT_DATE AND p.bidang = $1)) as overdue,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.id IN (SELECT d.surat_id FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id WHERE p.bidang = $1)) as total_semua`,
        [req.user.bidang, today]
      );
      recentSurat = await pool.query(
        `SELECT s.*, p.nama_lengkap as pembuat_nama
         FROM surat_masuk s LEFT JOIN pengguna p ON s.created_by = p.id
         WHERE s.id IN (SELECT d.surat_id FROM disposisi d JOIN pengguna pg ON d.diberikan_kepada = pg.id WHERE pg.bidang = $1)
         ORDER BY s.created_at DESC LIMIT 5`,
        [req.user.bidang]
      );
    } else {
      // Admin TU / Kepala Sekolah: all data
      stats = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.tanggal_diterima = $1) as total_hari_ini,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai') as belum_selesai,
          (SELECT COUNT(*) FROM surat_masuk s WHERE s.status != 'Selesai' AND s.id IN (SELECT surat_id FROM disposisi WHERE deadline < CURRENT_DATE)) as overdue,
          (SELECT COUNT(*) FROM surat_masuk s) as total_semua`,
        [today]
      );
      recentSurat = await pool.query(
        `SELECT s.*, p.nama_lengkap as pembuat_nama
         FROM surat_masuk s LEFT JOIN pengguna p ON s.created_by = p.id
         ORDER BY s.created_at DESC LIMIT 5`
      );
    }

    res.json({
      stats: stats.rows[0],
      recentSurat: recentSurat.rows,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Public tracking - limited data, no auth needed
exports.trackByNomor = async (req, res) => {
  const { nomorSurat } = req.query;

  if (!nomorSurat) {
    return res.status(400).json({ message: 'Nomor surat wajib diisi' });
  }

  try {
    const result = await pool.query(
      `SELECT s.id, s.nomor_surat, s.status, s.tanggal_diterima, s.pengirim, s.perihal
       FROM surat_masuk s WHERE TRIM(s.nomor_surat) = TRIM($1)`,
      [nomorSurat]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nomor surat tidak ditemukan' });
    }

    const surat = result.rows[0];

    // Determine position based on status
    let posisiSaatIni = 'Unit TU Sekolah';
    if (surat.status === 'Didisposisi' || surat.status === 'Diproses' || surat.status === 'Selesai') {
      const disposisiResult = await pool.query(
        `SELECT d.*, p.nama_lengkap, p.bidang
         FROM disposisi d JOIN pengguna p ON d.diberikan_kepada = p.id
         WHERE d.surat_id = $1 ORDER BY d.created_at DESC LIMIT 1`,
        [surat.id]
      );
      if (disposisiResult.rows.length > 0) {
        const d = disposisiResult.rows[0];
        posisiSaatIni = surat.status === 'Selesai' ? 'Selesai Diproses' : `${d.nama_lengkap} (${d.bidang || 'Guru/Staf'})`;
      }
    } else if (surat.status === 'Diterima') {
      posisiSaatIni = 'Menunggu Disposisi Kepala Sekolah';
    }

    // Get timeline (status history) — show role title + bidang, not person names
    const timelineResult = await pool.query(
      `SELECT ss.status, ss.catatan, ss.created_at,
              CASE
                WHEN ss.status = 'Didisposisi' THEN
                  'Kepala Sekolah → ' || COALESCE(
                    (SELECT pp.bidang::text FROM disposisi d
                     JOIN pengguna pp ON d.diberikan_kepada = pp.id
                     WHERE d.surat_id = ss.surat_id ORDER BY d.created_at DESC LIMIT 1),
                    'Guru/Staf'
                  )
                WHEN ss.status = 'Diproses' THEN COALESCE(p.bidang::text, 'Guru/Staf')
                WHEN ss.status = 'Selesai' THEN COALESCE(p.bidang::text, 'Guru/Staf')
                WHEN p.role = 'KEPALA_SEKOLAH' THEN 'Kepala Sekolah'
                WHEN p.role = 'ADMIN_TU' THEN 'Admin TU'
                WHEN p.role = 'WAKASEK' THEN 'Wakasek ' || COALESCE(p.bidang::text, '')
                ELSE COALESCE(p.bidang::text, 'Guru/Staf')
              END as diubah_oleh_nama
       FROM status_surat ss LEFT JOIN pengguna p ON ss.diubah_oleh = p.id
       WHERE ss.surat_id = $1 ORDER BY ss.created_at ASC`,
      [surat.id]
    );

    // Get disposisi history
    const disposisiHistoryResult = await pool.query(
      `SELECT d.instruksi, d.deadline, d.created_at, p.nama_lengkap as penerima_nama, p.bidang,
              pk.nama_lengkap as pemberi_nama
       FROM disposisi d
       JOIN pengguna p ON d.diberikan_kepada = p.id
       LEFT JOIN pengguna pk ON d.diberikan_oleh = pk.id
       WHERE d.surat_id = $1 ORDER BY d.created_at ASC`,
      [surat.id]
    );

    res.json({
      nomorSurat: surat.nomor_surat,
      status: surat.status,
      posisiSaatIni,
      tanggalDiterima: surat.tanggal_diterima,
      pengirim: surat.pengirim,
      perihal: surat.perihal,
      timeline: timelineResult.rows,
      disposisiHistory: disposisiHistoryResult.rows,
    });
  } catch (err) {
    console.error('Track surat error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Live position of all surat (for Admin & Kepala & Wakasek dashboard)
exports.getPosisiAll = async (req, res) => {
  try {
    let query = `SELECT s.id, s.nomor_surat, s.perihal, s.pengirim, s.status, s.tanggal_diterima, s.updated_at,
              d.instruksi, d.deadline,
              pp.nama_lengkap as penerima_nama, pp.bidang::text as penerima_bidang,
              CASE
                WHEN s.status = 'Selesai' THEN 'Selesai Diproses'
                WHEN s.status = 'Diterima' THEN 'Menunggu Disposisi'
                WHEN s.status IN ('Didisposisi','Diproses') AND pp.nama_lengkap IS NOT NULL
                  THEN pp.nama_lengkap || ' (' || COALESCE(pp.bidang::text, 'Guru/Staf') || ')'
                ELSE 'Unit TU Sekolah'
              END as posisi_saat_ini
       FROM surat_masuk s
       LEFT JOIN disposisi d ON d.surat_id = s.id
       LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id`;
    const params = [];

    // Wakasek: only surat disposed to their bidang
    if (req.user.role === 'WAKASEK' && req.user.bidang) {
      query += ` WHERE pp.bidang = $1`;
      params.push(req.user.bidang);
    }

    query += ' ORDER BY s.updated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get posisi all error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT file_scan, file_data, file_mime FROM surat_masuk WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0 || !result.rows[0].file_data) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }
    const { file_scan, file_data, file_mime } = result.rows[0];
    res.set({
      'Content-Type': file_mime,
      'Content-Disposition': `inline; filename="${file_scan}"`,
    });
    res.send(file_data);
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
