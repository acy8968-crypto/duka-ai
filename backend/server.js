require("dotenv").config({ override: true });
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
const { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber } = require("./services/businessStore");
const { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba } = require("./services/metaService");
const { sendTextMessage } = require("./services/whatsappService");
const { getHistory, appendTurn } = require("./services/conversationStore");
const { addOrder, getOrders } = require("./services/orderStore");
const { buildOrdersWorkbook } = require("./services/exportService");
const { markProcessedIfNew, cleanupOlderThan } = require("./services/dedupStore");
const { initiateStkPush } = require("./services/mpesaService");
const { createPaymentAttempt, recordPaymentResult, getPaymentsForBusiness } = require("./services/paymentStore");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

/* ------------------------------------------------------------------
   Health check
   ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------------------------------------------------------
   POST /api/generate-prompt
   Body: { businessName, businessType, ownerContact, description }
   -> generates the WhatsApp AI system prompt via OpenRouter,
      stores it against a new business record, and returns both.
   ------------------------------------------------------------------ */
app.post("/api/generate-prompt", async (req, res) => {
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

/* --------------------------------------------------------------------
   POST /webhook
   Meta calls this for every incoming message / status update.

   Best practice: respond 200 immediately, then process afterward, so
   a slow AI reply never causes Meta to time out and retry the delivery.
   -------------------------------------------------------------------- */
app.post("/webhook", (req, res) => {
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
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders", async (req, res) => {
  const business = await getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json({ businessId: business.id, orders: await getOrders(business.id) });
});

/* ------------------------------------------------------------------
   GET /api/business/:id/orders/export
   Downloads all detected orders for this business as a real .xlsx file,
   ready to open in Excel, Google Sheets, or any spreadsheet app.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders/export", async (req, res) => {
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
app.post("/api/business/:id/subscribe/initiate", async (req, res) => {
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

  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) {
      console.warn("M-Pesa callback received with unexpected shape:", JSON.stringify(req.body));
      return;
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    let mpesaReceiptNumber = null;
    if (resultCode === 0 && Array.isArray(callback.CallbackMetadata?.Item)) {
      const receiptItem = callback.CallbackMetadata.Item.find((item) => item.Name === "MpesaReceiptNumber");
      mpesaReceiptNumber = receiptItem?.Value || null;
    }

    await recordPaymentResult({ checkoutRequestId, resultCode, resultDesc, mpesaReceiptNumber });
    console.log(
      `M-Pesa payment ${checkoutRequestId} -> ${resultCode === 0 ? "COMPLETED" : "FAILED"} (${resultDesc})`
    );
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
  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  next();
}

app.use("/api/admin", requireAdminKey);

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

app.listen(PORT, () => {
  console.log(`Duka AI backend running at http://localhost:${PORT}`);
});
