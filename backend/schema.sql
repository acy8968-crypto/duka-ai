-- ============================================================
-- Duka AI — Database Schema
-- Run this once against a fresh PostgreSQL database to set up
-- all the tables the backend needs.
--
-- Usage:
--   psql -U your_user -d your_database -f schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS businesses (
  id                        TEXT PRIMARY KEY,
  business_name             TEXT NOT NULL,
  business_type             TEXT,
  owner_contact             TEXT,
  description               TEXT,
  system_prompt             TEXT,
  whatsapp_phone_number_id  TEXT UNIQUE,
  whatsapp_waba_id          TEXT,
  whatsapp_access_token     TEXT, -- NOTE: encrypt this column in production (e.g. pgcrypto)
  whatsapp_connected        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup for the webhook, which routes incoming messages by
-- phone_number_id (already unique-indexed via the UNIQUE constraint above,
-- but an explicit index name makes the intent clear).
CREATE INDEX IF NOT EXISTS idx_businesses_phone_number_id
  ON businesses (whatsapp_phone_number_id);

CREATE TABLE IF NOT EXISTS conversation_turns (
  id            BIGSERIAL PRIMARY KEY,
  business_id   TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_wa_id TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('user', 'model')),
  message_text  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_turns_lookup
  ON conversation_turns (business_id, customer_wa_id, created_at);

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  business_id     TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_wa_id  TEXT,
  raw_text        TEXT NOT NULL, -- the text after "ORDER_CONFIRMED:" in the AI's reply
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_business_id
  ON orders (business_id, received_at);

-- Dedup table for webhook message IDs, so retried/duplicate deliveries
-- from Meta don't get processed twice. TTL cleanup is handled by the
-- application (see db.js), not by Postgres itself.
CREATE TABLE IF NOT EXISTS processed_message_ids (
  message_id  TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M-Pesa STK Push payment attempts and their eventual result, used for
-- subscription billing.
CREATE TABLE IF NOT EXISTS payments (
  checkout_request_id  TEXT PRIMARY KEY, -- Daraja's ID for this specific STK Push attempt
  business_id          TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number         TEXT NOT NULL,
  amount               NUMERIC NOT NULL,
  account_reference    TEXT,
  status               TEXT NOT NULL DEFAULT 'pending', -- pending | completed | failed
  result_code          INTEGER,
  result_desc          TEXT,
  mpesa_receipt_number TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_business_id
  ON payments (business_id, created_at);

-- Per-call AI token usage, logged against the business that triggered it.
-- Powers the admin panel's per-client usage tracking.
CREATE TABLE IF NOT EXISTS token_usage (
  id                 BIGSERIAL PRIMARY KEY,
  business_id        TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_type          TEXT NOT NULL, -- 'prompt_generation' | 'chat_reply'
  model              TEXT,
  prompt_tokens      INTEGER NOT NULL DEFAULT 0,
  completion_tokens  INTEGER NOT NULL DEFAULT 0,
  total_tokens       INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_business_id
  ON token_usage (business_id, created_at);
