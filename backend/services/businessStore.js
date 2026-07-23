/**
 * businessStore.js
 * ------------------------------------------------------------------
 * TEMPORARY in-memory store standing in for a real database.
 * Everything here resets when the server restarts - swap this out for
 * PostgreSQL (or similar) before you have real paying customers.
 * ------------------------------------------------------------------
 */

const businesses = new Map(); // id -> business record

function createBusiness({ businessName, businessType, ownerContact, description, systemPrompt }) {
  const id = `biz_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const record = {
    id,
    businessName,
    businessType,
    ownerContact,
    description,
    systemPrompt,
    whatsappPhoneNumberId: null, // filled in once Embedded Signup completes
    whatsappWabaId: null,
    whatsappAccessToken: null,
    whatsappConnected: false,
    createdAt: new Date().toISOString(),
  };
  businesses.set(id, record);
  return record;
}

function getBusiness(id) {
  return businesses.get(id) || null;
}

/**
 * Finds the business that owns a given WhatsApp phone number ID.
 * The webhook uses this to figure out which business's AI prompt to use
 * for an incoming message (Meta tells us the phone_number_id it arrived on,
 * not the business ID directly).
 */
function findByPhoneNumberId(phoneNumberId) {
  for (const record of businesses.values()) {
    if (record.whatsappPhoneNumberId === phoneNumberId) return record;
  }
  return null;
}

function attachWhatsappNumber(id, { phoneNumberId, wabaId, accessToken }) {
  const record = businesses.get(id);
  if (!record) return null;
  record.whatsappPhoneNumberId = phoneNumberId;
  record.whatsappWabaId = wabaId;
  record.whatsappAccessToken = accessToken; // NOTE: encrypt this in a real DB
  record.whatsappConnected = true;
  return record;
}

module.exports = { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber };
