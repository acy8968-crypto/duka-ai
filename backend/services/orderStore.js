/**
 * orderStore.js
 * ------------------------------------------------------------------
 * PostgreSQL-backed order log, per business. Same function names as
 * the old in-memory version; now async since they hit the database.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

function rowToRecord(row) {
  return {
    id: row.id,
    receivedAt: row.received_at,
    raw: row.raw_text,
    customerWaId: row.customer_wa_id,
  };
}

async function addOrder(businessId, orderData) {
  const id = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const result = await pool.query(
    `INSERT INTO orders (id, business_id, customer_wa_id, raw_text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, businessId, orderData.customerWaId, orderData.raw]
  );

  return rowToRecord(result.rows[0]);
}

async function getOrders(businessId) {
  const result = await pool.query(
    "SELECT * FROM orders WHERE business_id = $1 ORDER BY received_at ASC",
    [businessId]
  );
  return result.rows.map(rowToRecord);
}

module.exports = { addOrder, getOrders };
