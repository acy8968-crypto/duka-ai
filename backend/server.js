require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { generateSystemPrompt, generateReply } = require("./services/geminiService");
const { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber } = require("./services/businessStore");
const { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba } = require("./services/metaService");
const { sendTextMessage } = require("./services/whatsappService");
const { getHistory, appendTurn } = require("./services/conversationStore");
const { addOrder, getOrders } = require("./services/orderStore");

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
   -> generates the WhatsApp AI system prompt via Gemini,
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
    const systemPrompt = await generateSystemPrompt({ businessName, businessType, description });

    const business = createBusiness({
      businessName,
      businessType,
      ownerContact,
      description,
      systemPrompt,
    });

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
app.get("/api/business/:id", (req, res) => {
  const business = getBusiness(req.params.id);
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

  const business = getBusiness(req.params.id);
  if (!business) {
    return res.status(404).json({ error: "Business not found." });
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    await registerPhoneNumber({ phoneNumberId, accessToken });
    await subscribeAppToWaba({ wabaId, accessToken });

    const updated = attachWhatsappNumber(req.params.id, { phoneNumberId, wabaId, accessToken });

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

// Simple in-memory dedup so retried/duplicate webhook deliveries
// (WhatsApp sends "at-least-once") don't get processed twice.
const processedMessageIds = new Set();

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
      const business = findByPhoneNumberId(phoneNumberId);

      if (!business) {
        console.warn(`No business found for phone_number_id ${phoneNumberId} - ignoring message.`);
        continue;
      }

      for (const message of value.messages) {
        if (processedMessageIds.has(message.id)) continue; // duplicate delivery, skip
        processedMessageIds.add(message.id);

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
    const history = getHistory(business.id, customerWaId);

    const replyText = await generateReply({
      systemPrompt: business.systemPrompt,
      history,
      customerMessage: messageText,
    });

    // Update conversation history with both sides of this exchange
    appendTurn(business.id, customerWaId, "user", messageText);
    appendTurn(business.id, customerWaId, "model", replyText);

    // Detect a finalized order in the AI's reply (matches the
    // "ORDER_CONFIRMED:" instruction baked into the generated system prompt)
    const orderMatch = replyText.match(/ORDER_CONFIRMED:\s*(.+)/i);
    if (orderMatch) {
      addOrder(business.id, { raw: orderMatch[1].trim(), customerWaId });
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
   Preview of orders detected so far for this business. The next
   build step (Excel/Sheets export) will turn this into a downloadable
   spreadsheet instead of raw JSON.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders", (req, res) => {
  const business = getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json({ businessId: business.id, orders: getOrders(business.id) });
});

app.listen(PORT, () => {
  console.log(`Duka AI backend running at http://localhost:${PORT}`);
});
