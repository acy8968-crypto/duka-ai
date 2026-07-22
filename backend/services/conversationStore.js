/**
 * conversationStore.js
 * ------------------------------------------------------------------
 * TEMPORARY in-memory store of recent chat history per customer, so the
 * AI has context across a back-and-forth conversation instead of only
 * ever seeing one message in isolation.
 *
 * Keyed by `${businessId}:${customerWaId}` so the same customer texting
 * two different client businesses gets two separate conversations.
 *
 * Swap for a real database before production - this resets on restart
 * and will grow unbounded in memory over a long-running process.
 * ------------------------------------------------------------------
 */

const MAX_TURNS = 12; // keep the last N messages (both sides combined)

const conversations = new Map(); // key -> [{ role: "user"|"model", text }]

function conversationKey(businessId, customerWaId) {
  return `${businessId}:${customerWaId}`;
}

function getHistory(businessId, customerWaId) {
  return conversations.get(conversationKey(businessId, customerWaId)) || [];
}

function appendTurn(businessId, customerWaId, role, text) {
  const key = conversationKey(businessId, customerWaId);
  const history = conversations.get(key) || [];
  history.push({ role, text });
  // trim to the last MAX_TURNS entries so memory/prompt size stays bounded
  while (history.length > MAX_TURNS) history.shift();
  conversations.set(key, history);
}

module.exports = { getHistory, appendTurn };
