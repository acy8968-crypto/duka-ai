/**
 * mpesaService.js
 * ------------------------------------------------------------------
 * Handles Safaricom Daraja API calls for M-Pesa STK Push (Lipa Na
 * M-Pesa Online) - the "enter your PIN" payment prompt sent directly
 * to a customer's phone.
 *
 * SANDBOX vs PRODUCTION:
 * This is currently pointed at Safaricom's sandbox (test) environment.
 * To go live later, change MPESA_BASE_URL to
 * "https://api.safaricom.co.ke" and swap in real production credentials
 * - everything else in this file stays the same.
 *
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 * ------------------------------------------------------------------
 */

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";

/**
 * Step 1: get an OAuth access token. Valid for 1 hour - callers should
 * request a fresh one per STK Push rather than trying to cache it here,
 * to keep this module simple and stateless.
 */
async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET are not set in .env");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: { Authorization: `Basic ${credentials}` },
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(`M-Pesa OAuth failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Builds the timestamp + password Daraja requires for STK Push requests.
 * Password = base64(ShortCode + Passkey + Timestamp)
 */
function buildTimestampAndPassword() {
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    throw new Error("MPESA_SHORTCODE / MPESA_PASSKEY are not set in .env");
  }

  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  return { timestamp, password, shortCode };
}

/**
 * Step 2: trigger the actual STK Push - the payment prompt that appears
 * on the customer's phone.
 *
 * @param {string} phoneNumber - format 2547XXXXXXXX (no leading + or 0)
 * @param {number} amount - whole KES amount (sandbox often only accepts small test amounts)
 * @param {string} accountReference - shows on the customer's prompt (e.g. business name)
 * @param {string} transactionDesc - short description of what this payment is for
 * @param {string} callbackUrl - your public HTTPS endpoint Daraja will POST the result to
 */
async function initiateStkPush({ phoneNumber, amount, accountReference, transactionDesc, callbackUrl }) {
  const accessToken = await getAccessToken();
  const { timestamp, password, shortCode } = buildTimestampAndPassword();

  const res = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`STK Push failed: ${JSON.stringify(data)}`);
  }

  // Contains CheckoutRequestID - the ID you match against the later callback
  return data;
}

module.exports = { getAccessToken, initiateStkPush };
