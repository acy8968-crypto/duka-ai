/**
 * dedupStore.js
 * ------------------------------------------------------------------
 * Tracks which WhatsApp webhook message IDs have already been processed,
 * so retried/duplicate deliveries (Meta sends "at-least-once") don't get
 * handled twice. Backed by Postgres instead of an in-memory Set, so it
 * survives restarts and multiple server instances share the same view.
 *
 * Old entries are cleaned up periodically so this table doesn't grow
 * forever (see startCleanupSchedule below).
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

/**
 * Attempts to record a message ID as processed.
 * @returns {boolean} true if this is the FIRST time we've seen this ID
 *                    (i.e. safe to process), false if it's a duplicate.
 */
async function markProcessedIfNew(messageId) {
  try {
    await pool.query(
      "INSERT INTO processed_message_ids (message_id) VALUES ($1)",
      [messageId]
    );
    return true; // insert succeeded -> first time seeing this message
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation -> we've already processed this message ID
      return false;
    }
    throw err;
  }
}

/**
 * Deletes dedup records older than the given number of hours.
 * Call this on an interval (see server.js) so the table stays small.
 */
async function cleanupOlderThan(hours = 24) {
  await pool.query(
    `DELETE FROM processed_message_ids WHERE processed_at < now() - INTERVAL '${Number(hours)} hours'`
  );
}

module.exports = { markProcessedIfNew, cleanupOlderThan };
