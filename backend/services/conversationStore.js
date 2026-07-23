/**
 * conversationStore.js
 * ------------------------------------------------------------------
 * PostgreSQL-backed conversation history per customer, so the AI has
 * context across a back-and-forth conversation instead of only ever
 * seeing one message in isolation.
 *
 * Same function names as the old in-memory version; now async since
 * they hit the database.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

const MAX_TURNS = 12; // keep the last N messages (both sides combined) for context

async function getHistory(businessId, customerWaId) {
  const result = await pool.query(
    `SELECT role, message_text
     FROM conversation_turns
     WHERE business_id = $1 AND customer_wa_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [businessId, customerWaId, MAX_TURNS]
  );

  // reverse back to oldest-first, since we queried newest-first to LIMIT correctly
  return result.rows.reverse().map((row) => ({ role: row.role, text: row.message_text }));
}

async function appendTurn(businessId, customerWaId, role, text) {
  await pool.query(
    `INSERT INTO conversation_turns (business_id, customer_wa_id, role, message_text)
     VALUES ($1, $2, $3, $4)`,
    [businessId, customerWaId, role, text]
  );
}

module.exports = { getHistory, appendTurn };
