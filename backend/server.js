require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { generateSystemPrompt, generateReply, getCreditBalance } = require("./services/openrouterService");
const { logUsage, getUsageSummaryPerBusiness, getTotalUsage, getDailyUsage } = require("./services/tokenUsageStore");
const {
  getOverviewStats,
  listBusinessesWithStats,
  listRecentPayments,
  getRevenueByDay,
  getRecentActivity,
} = require("./services/adminService");
const subscriptionStore = require("./services/subscriptionStore");
const { runBillingCycle } = require("./services/billingService");
const { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber } = require("./services/businessStore");
const { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba } = require("./services/metaService");
const { sendTextMessage } = require("./services/whatsappService");
const { getHistory, appendTurn } = require("./services/conversationStore");
const { addOrder, getOrders } = require("./services/orderStore");
const { buildOrdersWorkbook } = require("./services/exportService");
const { markProcessedIfNew, cleanupOlderThan } = require("./services/dedupStore");
const { initiateStkPush } = require("./services/mpesaService");
const { createPaymentAttempt, recordPaymentResult, getPaymentsForBusiness, findPaymentByCheckoutRequestId } = require("./services/paymentStore");

const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // allow GitHub Pages / inline styles if served
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiters
const promptGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 prompt generations per IP per 15 min
  message: { error: "Too many prompt generation requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const stkPushLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 STK pushes per IP per 10 min
  message: { error: "Too many payment requests. Please wait a few minutes before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 admin calls per IP per 15 min
  message: { error: "Too many admin requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Supports a comma-separated list of allowed origins in production
// (e.g. your GitHub Pages frontend + a custom domain), while staying
// permissive during local development if ALLOWED_ORIGIN isn't set.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow non-browser requests (no Origin header, e.g. curl, Daraja callbacks)
      if (!requestOrigin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(requestOrigin)) {
        return callback(null, true);
      }
      callback(new Error("CORS_ORIGIN_REJECTED"));
    },
  })
);

// Converts a rejected CORS origin into a clean 403, instead of letting it
// fall through to Express's default error handler (which returns a
// generic 500 - technically "it works" since the browser still blocks
// the response either way, but a 500 wrongly suggests a real server
// error rather than an expected "this origin isn't allowed" case, and
// would show up as noise in error monitoring/logs).
app.use((err, req, res, next) => {
  if (err && err.message === "CORS_ORIGIN_REJECTED") {
    return res.status(403).json({ error: "This origin is not allowed to access this API." });
  }
  next(err);
});

// Capture raw body for webhook HMAC signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

/* ------------------------------------------------------------------
   Health check
   ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------------------------------------------------------
   POST /api/generate-prompt
   Body: { businessName, businessType, ownerContact, description }
   -> generates the WhatsApp AI system prompt via Gemini,
      stores it against a new business record, and returns both.
   ------------------------------------------------------------------ */
app.post("/api/generate-prompt", promptGenLimiter, async (req, res) => {
  const { businessName, businessType, ownerContact, description } = req.body || {};

  if (!businessName || !description) {
    return res.status(400).json({
      error: "businessName and description are required.",
    });
  }

  try {
    const { systemPrompt, usage } = await generateSystemPrompt({ businessName, businessType, description });

    const business = await createBusiness({
      businessName,
      businessType,
      ownerContact,
      description,
      systemPrompt,
    });

    // Log token usage against the business now that it has an ID
    await logUsage(business.id, "prompt_generation", usage);

    res.json({
      businessId: business.id,
      systemPrompt: business.systemPrompt,
    });
  } catch (err) {
    console.error("generate-prompt failed:", err.message);
    res.status(502).json({
      error: "Could not generate the AI prompt right now. Please try again.",
      detail: err.message,
    });
  }
});

/* ------------------------------------------------------------------
   GET /api/business/:id
   -> fetch a stored business record (used for debugging / step 3 summary)
   ------------------------------------------------------------------ */
app.get("/api/business/:id", async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json(business);
});

/* ------------------------------------------------------------------
   POST /api/business/:id/connect-whatsapp
   Body: { code, wabaId, phoneNumberId }
     - `code`: the short-lived code the frontend got back from
        FB.login() when Embedded Signup completed
     - `wabaId`, `phoneNumberId`: captured from the postMessage event
        Meta sends to the frontend during the same flow

   This completes the REAL Embedded Signup handshake:
     1. Exchange the code for a business access token
     2. Register the phone number for Cloud API use
     3. Subscribe your app to the business's WABA (so webhooks start
        flowing once the webhook endpoint from the next build step exists)
     4. Store everything against the business record
   ------------------------------------------------------------------ */
app.post("/api/business/:id/connect-whatsapp", async (req, res) => {
  const { code, wabaId, phoneNumberId } = req.body || {};

  if (!code || !wabaId || !phoneNumberId) {
    return res.status(400).json({ error: "code, wabaId, and phoneNumberId are all required." });
  }

  const business = await getBusiness(req.params.id);
  if (!business) {
    return res.status(404).json({ error: "Business not found." });
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    await registerPhoneNumber({ phoneNumberId, accessToken });
    await subscribeAppToWaba({ wabaId, accessToken });

    const updated = await attachWhatsappNumber(req.params.id, { phoneNumberId, wabaId, accessToken });

    res.json({
      businessId: updated.id,
      whatsappConnected: true,
      whatsappPhoneNumberId: updated.whatsappPhoneNumberId,
    });
  } catch (err) {
    console.error("connect-whatsapp failed:", err.message);
    res.status(502).json({
      error: "Could not connect WhatsApp right now. Please try again.",
      detail: err.message,
    });
  }
});

/* ====================================================================
   This is the piece that actually receives customer messages.

   IMPORTANT: Meta requires a public HTTPS URL with a valid (non
   self-signed) certificate — plain localhost will NOT work. For local
   testing, run this server, then expose it with a tool like ngrok
   (e.g. `ngrok http 3000`) and use the ngrok HTTPS URL + "/webhook" as
   your callback URL in the Meta App Dashboard.
   ==================================================================== */

// Duplicate webhook deliveries (WhatsApp sends "at-least-once") are caught
// via markProcessedIfNew() in dedupStore.js, backed by Postgres so it
// survives restarts. Old dedup records are cleaned up periodically below.
setInterval(() => {
  cleanupOlderThan(24).catch((err) => console.error("Dedup cleanup failed:", err.message));
}, 60 * 60 * 1000); // every hour

/* --------------------------------------------------------------------
   GET /webhook
   Meta calls this once when you save your webhook config, to confirm
   you control this URL. Must echo back hub.challenge if the verify
   token matches.
   -------------------------------------------------------------------- */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

function verifyMetaSignature(req, res, next) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    // If not configured (e.g. initial dev), warn but allow
    return next();
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    console.warn("Rejected incoming webhook: missing x-hub-signature-256 header");
    return res.status(401).json({ error: "Missing webhook signature." });
  }

  const [algo, signatureHash] = signature.split("=");
  if (algo !== "sha256" || !signatureHash) {
    return res.status(401).json({ error: "Invalid signature format." });
  }

  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(req.rawBody || "")
    .digest("hex");

  const sigBuf = Buffer.from(signatureHash, "hex");
  const expBuf = Buffer.from(expectedHash, "hex");

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.warn("Rejected incoming webhook: HMAC signature mismatch");
    return res.status(401).json({ error: "Invalid webhook signature." });
  }

  next();
}

/* --------------------------------------------------------------------
   POST /webhook
   Meta calls this for every incoming message / status update.

   Best practice: respond 200 immediately, then process afterward, so
   a slow AI reply never causes Meta to time out and retry the delivery.
   -------------------------------------------------------------------- */
app.post("/webhook", verifyMetaSignature, (req, res) => {
  res.sendStatus(200); // acknowledge immediately, per Meta's guidance

  handleIncomingWebhook(req.body).catch((err) => {
    console.error("Error processing webhook payload:", err);
  });
});

async function handleIncomingWebhook(payload) {
  const entries = payload?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];

    for (const change of changes) {
      const value = change?.value;
      if (!value || !Array.isArray(value.messages)) continue; // e.g. status updates, skip

      const phoneNumberId = value.metadata?.phone_number_id;
      const business = await findByPhoneNumberId(phoneNumberId);

      if (!business) {
        console.warn(`No business found for phone_number_id ${phoneNumberId} - ignoring message.`);
        continue;
      }

      for (const message of value.messages) {
        const isNew = await markProcessedIfNew(message.id);
        if (!isNew) continue; // duplicate delivery, skip

        if (message.type !== "text") continue; // MVP: handle text only for now

        await handleCustomerMessage({
          business,
          customerWaId: message.from,
          messageText: message.text?.body || "",
        });
      }
    }
  }
}

async function handleCustomerMessage({ business, customerWaId, messageText }) {
  try {
    const history = await getHistory(business.id, customerWaId);

    const { replyText, usage } = await generateReply({
      systemPrompt: business.systemPrompt,
      history,
      customerMessage: messageText,
    });

    // Log token usage for this reply against the business
    await logUsage(business.id, "chat_reply", usage);

    // Update conversation history with both sides of this exchange
    await appendTurn(business.id, customerWaId, "user", messageText);
    await appendTurn(business.id, customerWaId, "model", replyText);

    // Detect a finalized order in the AI's reply (matches the
    // "ORDER_CONFIRMED:" instruction baked into the generated system prompt)
    const orderMatch = replyText.match(/ORDER_CONFIRMED:\s*(.+)/i);
    if (orderMatch) {
      await addOrder(business.id, { raw: orderMatch[1].trim(), customerWaId });
      console.log(`Order detected for business ${business.id}: ${orderMatch[1].trim()}`);
    }

    await sendTextMessage({
      phoneNumberId: business.whatsappPhoneNumberId,
      accessToken: business.whatsappAccessToken,
      to: customerWaId,
      body: replyText,
    });
  } catch (err) {
    console.error(`Failed to handle message for business ${business.id}:`, err.message);
    // In production: alert the business owner / retry / fall back to a
    // generic "we'll get back to you" message here instead of failing silently.
  }
}

/* ------------------------------------------------------------------
   GET /api/business/:id/orders
   Preview of orders detected so far for this business, as raw JSON.
   Protected by admin key to prevent unauthorized access to customer orders.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders", requireAdminKey, async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json({ businessId: business.id, orders: await getOrders(business.id) });
});

/* ------------------------------------------------------------------
   GET /api/business/:id/orders/export
   Downloads all detected orders for this business as a real .xlsx file,
   ready to open in Excel, Google Sheets, or any spreadsheet app.
   Protected by admin key to prevent unauthorized PII downloads.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders/export", requireAdminKey, async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });

  const orders = await getOrders(business.id);
  const workbookBuffer = buildOrdersWorkbook(orders);

  const safeName = business.businessName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const filename = `${safeName}-orders.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(workbookBuffer);
});

/* ====================================================================
   M-PESA / DARAJA - SANDBOX TESTING (subscription billing)
   Currently pointed at Safaricom's SANDBOX environment via
   MPESA_BASE_URL in mpesaService.js. No real money moves in sandbox.
   ==================================================================== */

/* ------------------------------------------------------------------
   POST /api/business/:id/subscribe/initiate
   Body: { phoneNumber, amount }
     - phoneNumber format: 2547XXXXXXXX (sandbox test number: 254708374149)
     - amount: whole KES number
   Triggers a real STK Push prompt to that phone (sandbox = no real money).
   ------------------------------------------------------------------ */
app.post("/api/business/:id/subscribe/initiate", stkPushLimiter, async (req, res) => {
  const { phoneNumber, amount } = req.body || {};

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "phoneNumber and amount are required." });
  }

  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });

  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!callbackUrl) {
    return res.status(500).json({ error: "MPESA_CALLBACK_URL is not configured on the server." });
  }

  try {
    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference: business.businessName,
      transactionDesc: "Duka AI monthly subscription",
      callbackUrl,
    });

    await createPaymentAttempt({
      businessId: business.id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      phoneNumber,
      amount,
      accountReference: business.businessName,
    });

    res.json({
      message: "STK Push sent. Check the customer's phone to complete payment.",
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (err) {
    console.error("STK Push initiation failed:", err.message);
    res.status(502).json({ error: "Could not initiate payment.", detail: err.message });
  }
});

/* ------------------------------------------------------------------
   POST /api/mpesa/callback
   Daraja calls this automatically once the customer completes (or
   cancels/fails) the STK Push prompt. Must respond 200 quickly.
   ------------------------------------------------------------------ */
app.post("/api/mpesa/callback", async (req, res) => {
  res.sendStatus(200); // acknowledge immediately, per Daraja's expectations

  // Optional shared secret verification if configured in MPESA_CALLBACK_URL query string (?secret=...)
  const expectedSecret = process.env.MPESA_CALLBACK_SECRET;
  if (expectedSecret && req.query.secret !== expectedSecret) {
    console.warn("M-Pesa callback rejected: secret token mismatch");
    return;
  }

  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) {
      console.warn("M-Pesa callback received with unexpected shape:", JSON.stringify(req.body));
      return;
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    // Verify this checkoutRequestId exists in our records and was in 'pending' status
    const existingPayment = await findPaymentByCheckoutRequestId(checkoutRequestId);
    if (!existingPayment) {
      console.warn(`Untrusted M-Pesa callback: CheckoutRequestID ${checkoutRequestId} not found in database.`);
      return;
    }

    if (existingPayment.status !== "pending") {
      console.warn(`Ignoring duplicate/replayed M-Pesa callback for ${checkoutRequestId} (status: ${existingPayment.status}).`);
      return;
    }

    let mpesaReceiptNumber = null;
    if (resultCode === 0 && Array.isArray(callback.CallbackMetadata?.Item)) {
      const receiptItem = callback.CallbackMetadata.Item.find((item) => item.Name === "MpesaReceiptNumber");
      mpesaReceiptNumber = receiptItem?.Value || null;
    }

    const payment = await recordPaymentResult({ checkoutRequestId, resultCode, resultDesc, mpesaReceiptNumber });
    console.log(
      `M-Pesa payment ${checkoutRequestId} -> ${resultCode === 0 ? "COMPLETED" : "FAILED"} (${resultDesc})`
    );

    // If this payment came from a subscription (trial conversion or
    // renewal, via billingService.js), update that subscription's status.
    if (payment?.subscription_id) {
      if (resultCode === 0) {
        await subscriptionStore.activateAfterPayment(payment.subscription_id);
        console.log(`Subscription ${payment.subscription_id} activated.`);
      } else {
        await subscriptionStore.markPastDue(payment.subscription_id);
        console.log(`Subscription ${payment.subscription_id} marked past_due.`);
      }
    }
  } catch (err) {
    console.error("Failed to process M-Pesa callback:", err.message);
  }
});

/* ------------------------------------------------------------------
   GET /api/business/:id/payments
   Preview of this business's subscription payment history.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/payments", async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json({ businessId: business.id, payments: await getPaymentsForBusiness(business.id) });
});

/* ====================================================================
   ADMIN PANEL API
   Everything under /api/admin/* requires a simple shared-secret key,
   sent as the "x-admin-key" header. This is a lightweight guard fit
   for a solo-operator dashboard - swap for real auth (sessions/JWT)
   before adding more admin users.
   ==================================================================== */

function requireAdminKey(req, res, next) {
  const providedKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: "ADMIN_API_KEY is not configured on the server." });
  }

  if (!providedKey) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  // Timing-safe equality check to prevent side-channel timing attacks
  const providedBuf = Buffer.from(String(providedKey));
  const expectedBuf = Buffer.from(String(expectedKey));

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  next();
}

app.use("/api/admin", adminAuthLimiter, requireAdminKey);

/* GET /api/admin/stats - overview numbers for the dashboard's stat cards */
app.get("/api/admin/stats", async (req, res) => {
  try {
    res.json(await getOverviewStats());
  } catch (err) {
    console.error("admin/stats failed:", err.message);
    res.status(500).json({ error: "Could not load stats.", detail: err.message });
  }
});

/* GET /api/admin/businesses - businesses list with order/payment totals */
app.get("/api/admin/businesses", async (req, res) => {
  try {
    res.json({ businesses: await listBusinessesWithStats() });
  } catch (err) {
    console.error("admin/businesses failed:", err.message);
    res.status(500).json({ error: "Could not load businesses.", detail: err.message });
  }
});

/* GET /api/admin/payments - recent payments across all businesses */
app.get("/api/admin/payments", async (req, res) => {
  try {
    res.json({ payments: await listRecentPayments() });
  } catch (err) {
    console.error("admin/payments failed:", err.message);
    res.status(500).json({ error: "Could not load payments.", detail: err.message });
  }
});

/* GET /api/admin/revenue-by-day - for the dashboard revenue chart */
app.get("/api/admin/revenue-by-day", async (req, res) => {
  try {
    res.json({ revenue: await getRevenueByDay(14) });
  } catch (err) {
    console.error("admin/revenue-by-day failed:", err.message);
    res.status(500).json({ error: "Could not load revenue.", detail: err.message });
  }
});

/* GET /api/admin/activity - merged recent-events feed for the live ticker */
app.get("/api/admin/activity", async (req, res) => {
  try {
    res.json({ activity: await getRecentActivity(20) });
  } catch (err) {
    console.error("admin/activity failed:", err.message);
    res.status(500).json({ error: "Could not load activity.", detail: err.message });
  }
});

/* GET /api/admin/token-usage - per-business AI token usage breakdown */
app.get("/api/admin/token-usage", async (req, res) => {
  try {
    const [perBusiness, total, daily] = await Promise.all([
      getUsageSummaryPerBusiness(),
      getTotalUsage(),
      getDailyUsage(14),
    ]);
    res.json({ perBusiness, total, daily });
  } catch (err) {
    console.error("admin/token-usage failed:", err.message);
    res.status(500).json({ error: "Could not load token usage.", detail: err.message });
  }
});

/* GET /api/admin/openrouter-credits - live OpenRouter prepaid balance */
app.get("/api/admin/openrouter-credits", async (req, res) => {
  try {
    res.json(await getCreditBalance());
  } catch (err) {
    console.error("admin/openrouter-credits failed:", err.message);
    res.status(502).json({ error: "Could not fetch OpenRouter balance.", detail: err.message });
  }
});

/* ====================================================================
   SUBSCRIPTIONS & AUTOMATIC BILLING
   Backs the "free 7-day trial, then billed automatically" promise on
   the website - without this, trials would never actually convert.
   ==================================================================== */

const PLAN_PRICES = { starter: 1999, growth: 4999, pro: 9999 };

/* ------------------------------------------------------------------
   POST /api/business/:id/subscription
   Body: { plan, phoneNumber }
   Starts a 7-day free trial for this business on the given plan. Call
   this once, right after a business connects their WhatsApp number.
   ------------------------------------------------------------------ */
app.post("/api/business/:id/subscription", async (req, res) => {
  const { plan, phoneNumber } = req.body || {};

  if (!plan || !PLAN_PRICES[plan]) {
    return res.status(400).json({ error: `plan must be one of: ${Object.keys(PLAN_PRICES).join(", ")}` });
  }
  if (!phoneNumber) {
    return res.status(400).json({ error: "phoneNumber is required." });
  }

  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });

  const existing = await subscriptionStore.getSubscriptionByBusiness(business.id);
  if (existing) {
    return res.status(409).json({ error: "This business already has a subscription.", subscription: existing });
  }

  try {
    const subscription = await subscriptionStore.createSubscription({
      businessId: business.id,
      plan,
      monthlyAmount: PLAN_PRICES[plan],
      phoneNumber,
    });
    res.json(subscription);
  } catch (err) {
    console.error("create-subscription failed:", err.message);
    res.status(500).json({ error: "Could not start subscription.", detail: err.message });
  }
});

/* ------------------------------------------------------------------
   GET /api/business/:id/subscription
   Fetch the current subscription/trial status for a business - used by
   the website to show "trial ends in N days" style messaging.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/subscription", async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });

  const subscription = await subscriptionStore.getSubscriptionByBusiness(business.id);
  if (!subscription) return res.status(404).json({ error: "No subscription found for this business." });

  res.json(subscription);
});

/* ------------------------------------------------------------------
   Billing scheduler - periodically checks for expired trials and
   subscriptions due for renewal, and charges them automatically.

   NOTE: this in-process setInterval is fine for a single server
   instance, but won't work correctly if you ever run multiple server
   processes/instances (each would run its own billing cycle and could
   double-charge). Move to a proper external cron/worker before scaling
   past one instance.
   ------------------------------------------------------------------ */
const BILLING_CYCLE_INTERVAL_MS = Number(process.env.BILLING_CYCLE_INTERVAL_MS) || 60 * 60 * 1000; // hourly by default

setInterval(() => {
  runBillingCycle().catch((err) => console.error("Billing cycle failed:", err.message));
}, BILLING_CYCLE_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`Duka AI backend running at http://localhost:${PORT}`);
});
