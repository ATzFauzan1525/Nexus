const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, nama_lengkap, role, bidang, is_active, created_at FROM pengguna ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, nama_lengkap, role, bidang, is_active, created_at FROM pengguna WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.create = async (req, res) => {
  const { username, password, nama_lengkap, role, bidang } = req.body;

  if (!username || !password || !nama_lengkap || !role) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const existing = await pool.query('SELECT id FROM pengguna WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, nama_lengkap, role, bidang, is_active, created_at`,
      [username, hashedPassword, nama_lengkap, role, bidang || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.update = async (req, res) => {
  const { nama_lengkap, role, bidang, is_active } = req.body;
  const { id } = req.params;

  try {
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat mengubah akun sendiri' });
    }

    const result = await pool.query(
      `UPDATE pengguna SET nama_lengkap = COALESCE($1, nama_lengkap), role = COALESCE($2, role),
       bidang = $3, is_active = COALESCE($4, is_active), updated_at = NOW()
       WHERE id = $5 RETURNING id, username, nama_lengkap, role, bidang, is_active, created_at`,
      [nama_lengkap, role, bidang, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;

  if (!password) {
    return res.status(400).json({ message: 'Password wajib diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE pengguna SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username',
      [hashedPassword, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    const result = await pool.query(
      'UPDATE pengguna SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getGuruStaf = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, nama_lengkap, role, bidang FROM pengguna WHERE role = 'GURU_STAF' AND is_active = true ORDER BY nama_lengkap"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
