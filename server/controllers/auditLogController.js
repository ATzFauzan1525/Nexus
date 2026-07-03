const pool = require('../config/db');

exports.getAll = async (req, res) => {
  const { page = 1, limit = 20, aksi, entitas, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM audit_log WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (aksi) {
      query += ` AND aksi = $${paramIndex}`;
      params.push(aksi);
      paramIndex++;
    }
    if (entitas) {
      query += ` AND entitas = $${paramIndex}`;
      params.push(entitas);
      paramIndex++;
    }
    if (user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Join user names
    const userIds = [...new Set(result.rows.map(r => r.user_id).filter(Boolean))];
    let usersMap = {};
    if (userIds.length > 0) {
      const usersResult = await pool.query(
        `SELECT id, nama_lengkap, role FROM pengguna WHERE id = ANY($1)`,
        [userIds]
      );
      usersResult.rows.forEach(u => { usersMap[u.id] = u; });
    }

    const enriched = result.rows.map(r => ({
      ...r,
      user_nama: usersMap[r.user_id]?.nama_lengkap || 'System',
      user_role: usersMap[r.user_id]?.role || '-',
    }));

    res.json({ data: enriched, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get audit log error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
