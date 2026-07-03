const pool = require('../config/db');

exports.getBySurat = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.*, p.nama_lengkap as user_nama, p.role as user_role
       FROM komentar k
       LEFT JOIN pengguna p ON k.user_id = p.id
       WHERE k.surat_id = $1
       ORDER BY k.created_at ASC`,
      [req.params.suratId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get komentar error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.create = async (req, res) => {
  const { suratId } = req.params;
  const { isi } = req.body;

  if (!isi || !isi.trim()) {
    return res.status(400).json({ message: 'Isi komentar wajib diisi' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO komentar (surat_id, user_id, isi)
       VALUES ($1, $2, $3) RETURNING *`,
      [suratId, req.user.id, isi.trim()]
    );

    const full = await pool.query(
      `SELECT k.*, p.nama_lengkap as user_nama, p.role as user_role
       FROM komentar k LEFT JOIN pengguna p ON k.user_id = p.id
       WHERE k.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error('Create komentar error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.delete = async (req, res) => {
  try {
    const check = await pool.query('SELECT user_id FROM komentar WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }
    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'ADMIN_TU' && req.user.role !== 'KEPALA_SEKOLAH') {
      return res.status(403).json({ message: 'Tidak bisa menghapus komentar ini' });
    }
    await pool.query('DELETE FROM komentar WHERE id = $1', [req.params.id]);
    res.json({ message: 'Komentar dihapus' });
  } catch (err) {
    console.error('Delete komentar error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
