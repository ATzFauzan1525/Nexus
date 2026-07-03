const pool = require('../config/db');

exports.getAll = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifikasi WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM notifikasi WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const unreadCount = await pool.query(
      'SELECT COUNT(*) FROM notifikasi WHERE user_id = $1 AND dibaca = false',
      [req.user.id]
    );

    res.json({
      data: result.rows,
      total,
      unread: parseInt(unreadCount.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get notifikasi error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifikasi WHERE user_id = $1 AND dibaca = false',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifikasi SET dibaca = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifikasi SET dibaca = true WHERE user_id = $1 AND dibaca = false',
      [req.user.id]
    );
    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
