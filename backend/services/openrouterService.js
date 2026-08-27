/**
 * openrouterService.js
 * ------------------------------------------------------------------
 * Replaces geminiService.js as the AI provider. Same job (generate a
 * WhatsApp AI system prompt from a business description, and generate
 * live chat replies), but routed through OpenRouter instead of calling
 * Gemini directly.
 *
 * Why: OpenRouter gives a single API for many models, a real prepaid
 * credit balance you can query (unlike Gemini's free-tier rate limits),
 * and per-request token usage in every response - which is what powers
 * the admin panel's per-client usage tracking.
 *
 * Docs: https://openrouter.ai/docs
 * ------------------------------------------------------------------
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_CREDITS_URL = "https://openrouter.ai/api/v1/credits";

// Change this to try a different model - OpenRouter uses "provider/model" naming.
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

function buildMetaPrompt({ businessName, businessType, description }) {
  return `You are an expert at writing system prompts for WhatsApp customer-service AI agents used by small businesses in Kenya.

Given the business details below, write a COMPLETE system prompt that will be used to power a WhatsApp AI agent for this business. The system prompt you write must:

1. Open by telling the AI which business it represents and what it sells/does.
2. Define the tone of voice to use (friendly, professional, matching how the owner described talking to customers). Support natural mixing of English and Swahili if the business description suggests that.
3. List the concrete facts the AI must know: products/services, prices, delivery areas/fees, working hours, and any FAQs implied by the description.
4. Give clear instructions for taking orders: what details to collect (item, quantity, size/variant if relevant, customer name, delivery location, phone number), and to confirm the order back to the customer before finalizing it.
5. Instruct the AI to output a clearly-marked structured order block (e.g. a line starting with "ORDER_CONFIRMED:" followed by item, quantity, price, customer name, phone, delivery area) whenever an order is finalized, so a separate system can detect it and log it to a spreadsheet.
6. Instruct the AI on what to do when it doesn't know an answer (e.g. tell the customer a human will follow up, and flag it).
7. Keep replies short and natural, the way a real shop attendant would text on WhatsApp - not long paragraphs.

Business name: ${businessName}
Business type: ${businessType || "Not specified"}
Business description (in the owner's own words): """${description}"""

Write ONLY the final system prompt text, ready to paste directly into an AI agent's configuration. Do not include any preamble, explanation, or markdown formatting/backticks around it.`;
}

/**
 * Shared low-level call to OpenRouter's chat completions endpoint.
 * Returns both the text and token usage, since every caller in this
 * file needs usage for the admin panel's tracking.
 */
async function callOpenRouter({ systemPrompt, messages, temperature, maxTokens }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Add it to your .env file.");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter uses these for its own analytics/rankings - not required, but good practice
      "HTTP-Referer": process.env.APP_PUBLIC_URL || "https://duka-ai.example.com",
      "X-Title": "Duka AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: systemPrompt ? [{ role: "system", content: systemPrompt }, ...messages] : messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 800,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`OpenRouter API error (${res.status}): ${JSON.stringify(data)}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenRouter returned no usable text. Full response: " + JSON.stringify(data));
  }

  const usage = {
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    totalTokens: data.usage?.total_tokens ?? 0,
    model: data.model || MODEL,
  };

  return { text: text.trim(), usage };
}

/**
 * Generates the WhatsApp AI system prompt for a new business.
 * Returns { systemPrompt, usage } - server.js should log usage via
 * tokenUsageStore.js against the new business's ID once it's created.
 */
async function generateSystemPrompt({ businessName, businessType, description }) {
  const metaPrompt = buildMetaPrompt({ businessName, businessType, description });
  const { text, usage } = await callOpenRouter({
    messages: [{ role: "user", content: metaPrompt }],
    temperature: 0.6,
    maxTokens: 1200,
  });
  return { systemPrompt: text, usage };
}

/**
 * Generates the AI's reply to a single incoming customer message.
 * Returns { replyText, usage } instead of a plain string (this is a
 * deliberate change from geminiService.js) so server.js can log token
 * usage per business on every single customer message.
 */
async function generateReply({ systemPrompt, history = [], customerMessage }) {
  const messages = [
    ...history.map((turn) => ({
      role: turn.role === "model" ? "assistant" : "user",
      content: turn.text,
    })),
    { role: "user", content: customerMessage },
  ];

  const { text, usage } = await callOpenRouter({
    systemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 400,
  });

  return { replyText: text, usage };
}

/**
 * Fetches your current OpenRouter prepaid credit balance - powers the
 * admin panel's live balance display.
 */
async function getCreditBalance() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Add it to your .env file.");
  }

  // First try the user auth/key endpoint
  try {
    const keyRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (keyRes.ok) {
      const keyData = await keyRes.json();
      const d = keyData?.data;
      if (d) {
        return {
          totalCredits: d.limit ?? null,
          totalUsage: d.usage ?? 0,
          remaining: d.limit_remaining ?? null,
          usageDaily: d.usage_daily ?? 0,
          usageWeekly: d.usage_weekly ?? 0,
          usageMonthly: d.usage_monthly ?? 0,
          isFreeTier: d.is_free_tier ?? false,
        };
      }
    }
  } catch (err) {
    // fallback to credits URL
  }

  const res = await fetch(OPENROUTER_CREDITS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`OpenRouter credits check failed: ${JSON.stringify(data)}`);
  }

  const totalCredits = data?.data?.total_credits ?? null;
  const totalUsage = data?.data?.total_usage ?? null;
  const remaining = totalCredits !== null && totalUsage !== null ? totalCredits - totalUsage : null;

  return { totalCredits, totalUsage, remaining };
}

module.exports = { generateSystemPrompt, generateReply, buildMetaPrompt, getCreditBalance };
