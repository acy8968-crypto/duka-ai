/**
 * adminService.js
 * ------------------------------------------------------------------
 * Aggregated queries powering the admin panel: overview stats, business
 * list, payment history, and a merged recent-activity feed (the
 * dashboard's live ticker).
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

/**
 * Top-level overview numbers for the dashboard's stat cards.
 */
async function getOverviewStats() {
  const [businesses, orders, payments, revenue] = await Promise.all([
    pool.query(`
      SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE whatsapp_connected) AS connected
      FROM businesses
    `),
    pool.query(`SELECT COUNT(*) AS total FROM orders`),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'failed') AS failed
      FROM payments
    `),
    pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'`),
  ]);

  return {
    totalBusinesses: Number(businesses.rows[0].total),
    connectedBusinesses: Number(businesses.rows[0].connected),
    totalOrders: Number(orders.rows[0].total),
    paymentsCompleted: Number(payments.rows[0].completed),
    paymentsPending: Number(payments.rows[0].pending),
    paymentsFailed: Number(payments.rows[0].failed),
    totalRevenue: Number(revenue.rows[0].total),
  };
}

/**
 * List of businesses with a quick order/connection status, for the
 * dashboard's businesses table.
 */
async function listBusinessesWithStats(limit = 50) {
  const result = await pool.query(
    `
    SELECT
      b.id, b.business_name, b.business_type, b.whatsapp_connected, b.created_at,
      COUNT(DISTINCT o.id) AS order_count,
      COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_paid
    FROM businesses b
    LEFT JOIN orders o ON o.business_id = b.id
    LEFT JOIN payments p ON p.business_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT $1
  `,
    [limit]
  );
  return result.rows;
}

/**
 * Recent payment history across all businesses.
 */
async function listRecentPayments(limit = 50) {
  const result = await pool.query(
    `
    SELECT p.*, b.business_name
    FROM payments p
    JOIN businesses b ON b.id = p.business_id
    ORDER BY p.created_at DESC
    LIMIT $1
  `,
    [limit]
  );
  return result.rows;
}

/**
 * Revenue per day for the last N days - powers a simple revenue chart.
 */
async function getRevenueByDay(days = 14) {
  const result = await pool.query(
    `
    SELECT date_trunc('day', completed_at) AS day, COALESCE(SUM(amount), 0) AS total
    FROM payments
    WHERE status = 'completed' AND completed_at > now() - ($1 || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
  `,
    [days]
  );
  return result.rows;
}

/**
 * Merges recent businesses, orders, and payments into one time-ordered
 * feed - powers the dashboard's live activity ticker.
 */
async function getRecentActivity(limit = 20) {
  const [newBusinesses, newOrders, newPayments] = await Promise.all([
    pool.query(
      `SELECT id, business_name, created_at FROM businesses ORDER BY created_at DESC LIMIT $1`,
      [limit]
    ),
    pool.query(
      `SELECT o.id, o.raw_text, o.received_at, b.business_name
       FROM orders o JOIN businesses b ON b.id = o.business_id
       ORDER BY o.received_at DESC LIMIT $1`,
      [limit]
    ),
    pool.query(
      `SELECT p.checkout_request_id, p.status, p.amount, p.created_at, b.business_name
       FROM payments p JOIN businesses b ON b.id = p.business_id
       WHERE p.status = 'completed'
       ORDER BY p.created_at DESC LIMIT $1`,
      [limit]
    ),
  ]);

  const events = [
    ...newBusinesses.rows.map((b) => ({
      type: "signup",
      text: `New business joined: ${b.business_name}`,
      timestamp: b.created_at,
    })),
    ...newOrders.rows.map((o) => ({
      type: "order",
      text: `New order — ${o.business_name}`,
      timestamp: o.received_at,
    })),
    ...newPayments.rows.map((p) => ({
      type: "payment",
      text: `Payment received — ${p.business_name} (KES ${p.amount})`,
      timestamp: p.created_at,
    })),
  ];

  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return events.slice(0, limit);
}

module.exports = {
  getOverviewStats,
  listBusinessesWithStats,
  listRecentPayments,
  getRevenueByDay,
  getRecentActivity,
};
