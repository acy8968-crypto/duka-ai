/**
 * paymentStore.js
 * ------------------------------------------------------------------
 * Tracks M-Pesa STK Push payment attempts and their eventual result,
 * so a business's subscription payment history is queryable and the
 * callback has somewhere to record what happened.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

async function createPaymentAttempt({ businessId, checkoutRequestId, phoneNumber, amount, accountReference }) {
  const result = await pool.query(
    `INSERT INTO payments (checkout_request_id, business_id, phone_number, amount, account_reference, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [checkoutRequestId, businessId, phoneNumber, amount, accountReference]
  );
  return result.rows[0];
}

async function recordPaymentResult({ checkoutRequestId, resultCode, resultDesc, mpesaReceiptNumber }) {
  const status = resultCode === 0 ? "completed" : "failed";

  const result = await pool.query(
    `UPDATE payments
     SET status = $2, result_code = $3, result_desc = $4, mpesa_receipt_number = $5, completed_at = now()
     WHERE checkout_request_id = $1
     RETURNING *`,
    [checkoutRequestId, status, resultCode, resultDesc, mpesaReceiptNumber || null]
  );
  return result.rows[0];
}

async function getPaymentsForBusiness(businessId) {
  const result = await pool.query(
    "SELECT * FROM payments WHERE business_id = $1 ORDER BY created_at DESC",
    [businessId]
  );
  return result.rows;
}

module.exports = { createPaymentAttempt, recordPaymentResult, getPaymentsForBusiness };
