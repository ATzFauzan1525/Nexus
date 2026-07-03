const pool = require('../config/db');

const log = async (userId, aksi, entitas, entitasId, detail, ipAddress) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, aksi, entitas, entitasId || null, detail || null, ipAddress || null]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { log };
