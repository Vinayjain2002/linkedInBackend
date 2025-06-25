const { pool } = require('../config/db');

// Create a new connection request
async function create({ requesterId, addresseeId }) {
  const result = await pool.query(
    `INSERT INTO connections (requester_id, addressee_id, status, created_at, updated_at)
     VALUES ($1, $2, 'pending', NOW(), NOW())
     RETURNING *`,
    [requesterId, addresseeId]
  );
  return result.rows[0];
}

// Find one connection by requester and addressee
async function findOne({ requesterId, addresseeId }) {
  const result = await pool.query(
    `SELECT * FROM connections WHERE requester_id = $1 AND addressee_id = $2 LIMIT 1`,
    [requesterId, addresseeId]
  );
  return result.rows[0];
}

// Find by primary key (id)
async function findByPk(id) {
  const result = await pool.query(
    `SELECT * FROM connections WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0];
}

// Update status (accept/reject)
async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE connections SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

// Find all connections by criteria
async function findAll({ userId, status, pendingForUser }) {
  let query, params;
  if (pendingForUser) {
    query = `SELECT * FROM connections WHERE addressee_id = $1 AND status = 'pending'`;
    params = [userId];
  } else {
    query = `SELECT * FROM connections WHERE status = $1 AND (requester_id = $2 OR addressee_id = $2)`;
    params = [status, userId];
  }
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  create,
  findOne,
  findByPk,
  updateStatus,
  findAll,
};

