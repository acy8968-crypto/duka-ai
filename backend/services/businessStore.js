/**
 * businessStore.js
 * ------------------------------------------------------------------
 * PostgreSQL-backed business records. Same function names/signatures
 * as the old in-memory version, so server.js didn't need to change at
 * all when this was swapped in.
 * ------------------------------------------------------------------
 */

const { pool } = require("../db");

function rowToRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessName: row.business_name,
    businessType: row.business_type,
    ownerContact: row.owner_contact,
    description: row.description,
    systemPrompt: row.system_prompt,
    whatsappPhoneNumberId: row.whatsapp_phone_number_id,
    whatsappWabaId: row.whatsapp_waba_id,
    whatsappAccessToken: row.whatsapp_access_token,
    whatsappConnected: row.whatsapp_connected,
    createdAt: row.created_at,
  };
}

async function createBusiness({ businessName, businessType, ownerContact, description, systemPrompt }) {
  const id = `biz_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const result = await pool.query(
    `INSERT INTO businesses (id, business_name, business_type, owner_contact, description, system_prompt)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, businessName, businessType, ownerContact, description, systemPrompt]
  );

  return rowToRecord(result.rows[0]);
}

async function getBusiness(id) {
  const result = await pool.query("SELECT * FROM businesses WHERE id = $1", [id]);
  return rowToRecord(result.rows[0]);
}

/**
 * Finds the business that owns a given WhatsApp phone number ID.
 * The webhook uses this to figure out which business's AI prompt to use
 * for an incoming message.
 */
async function findByPhoneNumberId(phoneNumberId) {
  const result = await pool.query(
    "SELECT * FROM businesses WHERE whatsapp_phone_number_id = $1",
    [phoneNumberId]
  );
  return rowToRecord(result.rows[0]);
}

async function attachWhatsappNumber(id, { phoneNumberId, wabaId, accessToken }) {
  const result = await pool.query(
    `UPDATE businesses
     SET whatsapp_phone_number_id = $2,
         whatsapp_waba_id = $3,
         whatsapp_access_token = $4, -- NOTE: encrypt this column in production
         whatsapp_connected = TRUE
     WHERE id = $1
     RETURNING *`,
    [id, phoneNumberId, wabaId, accessToken]
  );
  return rowToRecord(result.rows[0]);
}

module.exports = { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber };
