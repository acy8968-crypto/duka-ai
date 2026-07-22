/**
 * geminiService.js
 * ------------------------------------------------------------------
 * Turns a business owner's raw description into a complete, ready-to-use
 * WhatsApp AI system prompt, using Gemini's free-tier API.
 *
 * Model: gemini-2.5-flash (fast, cheap, generous free tier as of 2026)
 * Docs: https://ai.google.dev/gemini-api/docs
 * ------------------------------------------------------------------
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * The meta-prompt: instructions telling Gemini HOW to write the
 * business's WhatsApp AI system prompt. This is the piece you'll
 * want to tune the most as you learn what makes a good agent.
 */
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
 * Calls Gemini to generate the WhatsApp AI system prompt.
 * @returns {Promise<string>} the generated system prompt
 */
async function generateSystemPrompt({ businessName, businessType, description }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  const metaPrompt = buildMetaPrompt({ businessName, businessType, description });

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: metaPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error("Gemini returned no usable text. Full response: " + JSON.stringify(data));
  }

  return generatedText.trim();
}

module.exports = { generateSystemPrompt, buildMetaPrompt };