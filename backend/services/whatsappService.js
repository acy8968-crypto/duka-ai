/**
 * whatsappService.js
 * ------------------------------------------------------------------
 * Sends outbound WhatsApp messages via the Cloud API, on behalf of a
 * connected business (using their own phone number ID + access token
 * captured during Embedded Signup in metaService.js).
 *
 * Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
 * ------------------------------------------------------------------
 */

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Sends a plain text reply to a customer.
 * @param {string} phoneNumberId - the BUSINESS's WhatsApp phone number ID (not the customer's)
 * @param {string} accessToken - that business's access token from Embedded Signup
 * @param {string} to - the customer's WhatsApp ID (their phone number, no "+")
 * @param {string} body - the reply text
 */
async function sendTextMessage({ phoneNumberId, accessToken, to, body }) {
  const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Sending WhatsApp message failed: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = { sendTextMessage };
