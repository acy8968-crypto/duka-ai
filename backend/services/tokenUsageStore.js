/**
 * tokenUsageStore.js
 * ------------------------------------------------------------------
 * Logs every AI call's token usage against the business that triggered
 * it, so the admin panel can show per-client usage and help you spot
 * which businesses are costing the most in API usage.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

/**
 * Logs one AI call's token usage.
 * @param {string} businessId
 * @param {"prompt_generation"|"chat_reply"} callType - what kind of call this was
 * @param {{promptTokens:number, completionTokens:number, totalTokens:number, model:string}} usage
 */
async function logUsage(businessId, callType, usage) {
  await pool.query(
    `INSERT INTO token_usage (business_id, call_type, model, prompt_tokens, completion_tokens, total_tokens)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [businessId, callType, usage.model, usage.promptTokens, usage.completionTokens, usage.totalTokens]
  );
}

/**
 * Total tokens used, broken down per business - powers the admin panel's
 * "usage by client" table.
 */
async function getUsageSummaryPerBusiness() {
  const result = await pool.query(`
    SELECT
      b.id AS business_id,
      b.business_name,
      COUNT(t.id) AS call_count,
      COALESCE(SUM(t.prompt_tokens), 0) AS total_prompt_tokens,
      COALESCE(SUM(t.completion_tokens), 0) AS total_completion_tokens,
      COALESCE(SUM(t.total_tokens), 0) AS total_tokens
    FROM businesses b
    LEFT JOIN token_usage t ON t.business_id = b.id
    GROUP BY b.id, b.business_name
    ORDER BY total_tokens DESC
  `);
  return result.rows;
}

/**
 * Total tokens used across ALL businesses - for the admin panel's
 * top-level summary card.
 */
async function getTotalUsage() {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS call_count,
      COALESCE(SUM(prompt_tokens), 0) AS total_prompt_tokens,
      COALESCE(SUM(completion_tokens), 0) AS total_completion_tokens,
      COALESCE(SUM(total_tokens), 0) AS total_tokens
    FROM token_usage
  `);
  return result.rows[0];
}

/**
 * Daily token usage for the last N days - powers a usage trend chart.
 */
async function getDailyUsage(days = 14) {
  const result = await pool.query(
    `
    SELECT
      date_trunc('day', created_at) AS day,
      COALESCE(SUM(total_tokens), 0) AS total_tokens
    FROM token_usage
    WHERE created_at > now() - ($1 || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
  `,
    [days]
  );
  return result.rows;
}

module.exports = { logUsage, getUsageSummaryPerBusiness, getTotalUsage, getDailyUsage };
