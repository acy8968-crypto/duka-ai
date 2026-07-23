/**
 * metaService.js
 * ------------------------------------------------------------------
 * Handles the backend half of Meta's Embedded Signup flow:
 *   1. Exchange the short-lived "code" returned by the frontend for
 *      an access token (OAuth code exchange).
 *   2. Register the business's phone number for Cloud API use.
 *   3. (Optional but recommended) Subscribe your app to that WABA's
 *      webhooks so you start receiving messages.
 *
 * Docs:
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration
 * ------------------------------------------------------------------
 */

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Step 1: exchange the Embedded Signup "code" for a business access token.
 * This code comes from the frontend after FB.login() completes.
 */
async function exchangeCodeForToken(code) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET are not set in .env");
  }

  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  // data.access_token is the business token you use for all subsequent
  // calls on behalf of this business's WABA.
  return data.access_token;
}

/**
 * Step 2: register the verified phone number for Cloud API use.
 * A 6-digit PIN is required by Meta for two-step verification on the number.
 */
async function registerPhoneNumber({ phoneNumberId, accessToken, pin = "123456" }) {
  const url = `${GRAPH_BASE}/${phoneNumberId}/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      pin,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Phone number registration failed: ${JSON.stringify(data)}`);
  }

  return data; // { success: true } on success
}

/**
 * Step 3 (optional, do this once per WABA): subscribe your app to the
 * business's WABA so incoming messages start hitting your webhook.
 */
async function subscribeAppToWaba({ wabaId, accessToken }) {
  const url = `${GRAPH_BASE}/${wabaId}/subscribed_apps`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`App subscription to WABA failed: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba };
