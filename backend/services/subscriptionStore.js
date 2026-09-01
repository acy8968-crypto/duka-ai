/**
 * subscriptionStore.js
 * ------------------------------------------------------------------
 * Tracks each business's plan, trial period, and billing cycle.
 * The billingService.js scheduler reads from this to know who needs
 * to be charged and when.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

const TRIAL_DAYS = 7;
const BILLING_PERIOD_DAYS = 30;

function rowToRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessId: row.business_id,
    plan: row.plan,
    monthlyAmount: Number(row.monthly_amount),
    phoneNumber: row.phone_number,
    status: row.status,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    canceledAt: row.canceled_at,
  };
}

/**
 * Starts a new trial subscription for a business. Called once, right
 * after a business picks a plan and connects their WhatsApp number.
 */
async function createSubscription({ businessId, plan, monthlyAmount, phoneNumber }) {
  const id = `sub_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const result = await pool.query(
    `INSERT INTO subscriptions (id, business_id, plan, monthly_amount, phone_number, status, trial_ends_at)
     VALUES ($1, $2, $3, $4, $5, 'trialing', now() + ($6 || ' days')::interval)
     RETURNING *`,
    [id, businessId, plan, monthlyAmount, phoneNumber, TRIAL_DAYS]
  );

  return rowToRecord(result.rows[0]);
}

async function getSubscriptionByBusiness(businessId) {
  const result = await pool.query(
    `SELECT * FROM subscriptions WHERE business_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [businessId]
  );
  return rowToRecord(result.rows[0]);
}

async function getSubscriptionById(id) {
  const result = await pool.query(`SELECT * FROM subscriptions WHERE id = $1`, [id]);
  return rowToRecord(result.rows[0]);
}

/**
 * Trials that have run out and need their first real charge attempted.
 * Read by billingService.js on each billing cycle run.
 */
async function getExpiredTrials() {
  const result = await pool.query(
    `SELECT * FROM subscriptions WHERE status = 'trialing' AND trial_ends_at <= now()`
  );
  return result.rows.map(rowToRecord);
}

/**
 * Active subscriptions whose current billing period has ended and need
 * their next monthly charge attempted.
 */
async function getDueForRenewal() {
  const result = await pool.query(
    `SELECT * FROM subscriptions WHERE status = 'active' AND current_period_end <= now()`
  );
  return result.rows.map(rowToRecord);
}

/**
 * Marks a subscription active and extends its period after a successful
 * payment (whether this was the first post-trial charge, or a renewal).
 */
async function activateAfterPayment(subscriptionId) {
  const result = await pool.query(
    `UPDATE subscriptions
     SET status = 'active', current_period_end = now() + ($2 || ' days')::interval
     WHERE id = $1
     RETURNING *`,
    [subscriptionId, BILLING_PERIOD_DAYS]
  );
  return rowToRecord(result.rows[0]);
}

/**
 * Marks a subscription past_due after a failed charge attempt (trial
 * expiry or renewal). Does NOT cancel automatically - that's a
 * deliberate choice to avoid instantly cutting off a business over one
 * failed payment (e.g. insufficient funds that day).
 */
async function markPastDue(subscriptionId) {
  const result = await pool.query(
    `UPDATE subscriptions SET status = 'past_due' WHERE id = $1 RETURNING *`,
    [subscriptionId]
  );
  return rowToRecord(result.rows[0]);
}

async function cancelSubscription(subscriptionId) {
  const result = await pool.query(
    `UPDATE subscriptions SET status = 'canceled', canceled_at = now() WHERE id = $1 RETURNING *`,
    [subscriptionId]
  );
  return rowToRecord(result.rows[0]);
}

module.exports = {
  createSubscription,
  getSubscriptionByBusiness,
  getSubscriptionById,
  getExpiredTrials,
  getDueForRenewal,
  activateAfterPayment,
  markPastDue,
  cancelSubscription,
  TRIAL_DAYS,
  BILLING_PERIOD_DAYS,
};
