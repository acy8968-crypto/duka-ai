# Duka AI — Backend (Prompt Generation Service)

This is step 2 of the build: a small Node.js server that takes a business's
description from the onboarding form and turns it into a complete WhatsApp
AI system prompt using Gemini's free-tier API.

## What this does right now

- `POST /api/generate-prompt` — takes business details, calls Gemini, returns
  a ready-to-use system prompt, and stores it in memory against a new
  business record.
- `GET /api/business/:id` — fetch a stored business record.
- `POST /api/business/:id/connect-whatsapp` — placeholder endpoint for the
  **next** build step (Meta Embedded Signup), so the shape is already there.

## What this does NOT do yet

- Nothing is saved to a real database — it resets every time the server
  restarts. Swap `services/businessStore.js` for real database calls
  (e.g. PostgreSQL) before onboarding real customers.
- No WhatsApp connection yet — that's the next build step.
- No order detection / Excel export yet — that comes after WhatsApp.

## Setup

1. Get a free Gemini API key: https://aistudio.google.com/apikey
2. Copy the environment template and add your key:
   ```bash
   cp .env.example .env
   # then edit .env and paste your key into GEMINI_API_KEY=
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the server:
   ```bash
   npm start
   ```
   You should see: `Duka AI backend running at http://localhost:3000`

## Testing it

With the server running:

```bash
curl -X POST http://localhost:3000/api/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Mama Njeri Boutique",
    "businessType": "Retail / Shop",
    "ownerContact": "njeri@gmail.com",
    "description": "We sell ankara dresses and fabrics in Nairobi. Sizes S-XL, prices between KES 1500-4000. We deliver within Nairobi for KES 200. Friendly tone, mix of English and Swahili. Open 8am-7pm every day."
  }'
```

You should get back JSON with a `businessId` and a full `systemPrompt`
written by Gemini, tailored to that business description.

## Connecting it to the frontend

The onboarding page (`onboarding.html` / `script.js`) is already wired to
call `http://localhost:3000/api/generate-prompt` when the business-details
step is submitted. If you run the backend on a different port or host,
update the `API_BASE_URL` constant near the top of `script.js`.

Because this is a plain `fetch()` call from the browser to a different
origin, **CORS must allow your frontend's origin** — set `ALLOWED_ORIGIN`
in `.env` to match wherever you're serving the HTML/CSS/JS from (e.g. a
Live Server URL like `http://localhost:5500`).

## Next build step

Once this is working end to end, the next piece is connecting Meta's
Embedded Signup so `connect-whatsapp` receives a real, verified phone
number instead of the simulated one currently in `script.js`.

---

## Testing With Your Own Free Meta Test Number (before Business Verification)

If you don't have Business Verification yet, you can still fully test the
entire product using Meta's free test WhatsApp number — no verification,
no cost.

### Setup

1. Go to **Meta App Dashboard > WhatsApp > API Setup** (the "Try it out" page).
2. Note down your **Phone Number ID** (a long numeric ID) and generate a
   **permanent access token** (System Users > Generate Token, with
   `whatsapp_business_messaging` permission - a temporary 24-hour token
   also works fine for one testing session).
3. Add your own real phone number as a verified test recipient on that
   same page (Meta will text you a code to confirm it).
4. Add both values to `.env`:
   ```
   META_ACCESS_TOKEN=your_token_here
   META_TEST_PHONE_NUMBER_ID=your_phone_number_id_here
   ```
5. Edit the business details inside `scripts/seedTestBusiness.js` (name,
   description, etc.) to whatever you want to test with.
6. Run it:
   ```bash
   node scripts/seedTestBusiness.js
   ```
   This creates a business in your database, generates its AI system
   prompt via Gemini, and attaches your real test phone number + token —
   skipping Embedded Signup entirely, since that requires Business
   Verification you don't have yet.

### Set up the webhook so messages actually arrive

1. Run your server: `npm start`
2. In a separate terminal, expose it publicly: `ngrok http 3000`
3. Copy the `https://...ngrok.app` URL ngrok gives you.
4. In **Meta App Dashboard > WhatsApp > Configuration > Webhook**, set:
   - **Callback URL**: `https://YOUR_NGROK_URL/webhook`
   - **Verify Token**: whatever you set as `META_WEBHOOK_VERIFY_TOKEN` in `.env`
5. Click **Verify and Save**, then subscribe to the **messages** field.

### Try it

From your own WhatsApp, message your Meta test number. You should see
your server log receive it, generate a Gemini reply, and message you
back. Check detected orders with:
```bash
curl http://localhost:3000/api/business/YOUR_BUSINESS_ID/orders
```

### Important limitations of this test setup

- Meta's free test number can usually only message a small number of
  **verified recipient numbers** (the ones you manually added) - it's not
  for messaging the general public.
- This bypasses Embedded Signup entirely - it's meant only for you to
  test your own product, not a real customer onboarding path.
- When your Business Verification comes through, real businesses will
  connect via the actual Embedded Signup flow (already built) instead of
  this script.

---

## Step 3: Meta Embedded Signup (WhatsApp connection) — now built

This lets a business owner connect their real WhatsApp number by logging
into their own Meta account and verifying it with an OTP, right inside
your onboarding page.

### One-time setup in Meta's dashboard (required, can't be skipped)

1. Go to https://developers.facebook.com/apps and create a new app using
   the **"Connect with customers through WhatsApp"** use case.
2. Copy your **App ID** and **App Secret** from App Settings > Basic, and
   put them in `.env` as `META_APP_ID` and `META_APP_SECRET`.
3. Go to **App Dashboard > WhatsApp > Embedded Signup Builder** and create
   a configuration. Copy the resulting **Configuration ID**.
4. Paste that Configuration ID into `META_EMBEDDED_SIGNUP_CONFIG_ID` near
   the top of `script.js` (frontend file, not `.env` - it's used client-side).
5. Paste your **App ID** into the `fbAsyncInit` block at the bottom of
   `onboarding.html` (replace `YOUR_META_APP_ID`).
6. While testing, use **App Dashboard > WhatsApp > Quickstart > Testing
   Integrations > Claim sandbox account** so you don't need a real
   business phone number yet.

### How the flow works now

1. Business owner clicks "Connect with Meta" on the onboarding page.
2. Meta's JS SDK (`FB.login`) opens their real signup popup — they log in
   and verify their number with an OTP sent to their phone.
3. Meta sends back an OAuth `code` (via the FB.login callback) and a
   `waba_id` + `phone_number_id` (via a `postMessage` event) — both are
   already wired up in `script.js`.
4. The frontend sends all three to `POST /api/business/:id/connect-whatsapp`.
5. The backend (`metaService.js`) exchanges the code for an access token,
   registers the phone number for Cloud API use, and subscribes your app
   to that business's WABA so webhooks can start flowing.
6. The business record is updated with the verified phone number ID.

### What's still simulated / not done

- There's no webhook endpoint yet to actually *receive* incoming WhatsApp
  messages — that's the next build step.
- The PIN used in `registerPhoneNumber` defaults to `"123456"` — replace
  this with a securely generated PIN per business in production.
- Access tokens are stored in plain text in the in-memory store — encrypt
  these before using a real database.

### Next build step

Build the WhatsApp webhook: receive incoming customer messages, send them
to Gemini using the business's stored system prompt, and send the reply
back via the Cloud API.

---

## Step 4: WhatsApp Webhook (receiving + replying to messages) — now built

This is the piece that makes the AI agent actually work: it receives every
customer message, generates a reply using that business's stored system
prompt and recent conversation history, sends the reply back, and detects
finalized orders along the way.

### One-time setup in Meta's dashboard (required)

1. **Get a public HTTPS URL.** Meta requires a valid (non self-signed) TLS
   certificate — plain `localhost` will not work, even for testing.
   - For local development, install [ngrok](https://ngrok.com) and run:
     ```bash
     ngrok http 3000
     ```
     This gives you a temporary HTTPS URL (e.g. `https://abcd1234.ngrok.app`)
     that forwards to your local server.
   - For a real deployment, use your actual server's HTTPS domain instead.
2. In `.env`, set `META_WEBHOOK_VERIFY_TOKEN` to any secret string you make up.
3. Go to **App Dashboard > WhatsApp > Configuration > Webhook**, click Edit, and enter:
   - **Callback URL**: `https://YOUR_PUBLIC_URL/webhook`
   - **Verify Token**: the exact same string you put in `META_WEBHOOK_VERIFY_TOKEN`
4. Click **Verify and Save** — Meta immediately sends a test GET request;
   your server should confirm it automatically (this is what the `GET /webhook`
   route below handles).
5. Subscribe to the **`messages`** webhook field so incoming messages are delivered.

### How it works now

1. Meta sends every incoming customer message to `POST /webhook`.
2. The server responds `200 OK` immediately (required — Meta retries if this
   takes too long or fails), then processes the message afterward.
3. It looks up which business owns the number the message arrived on
   (`metadata.phone_number_id`), pulls that business's stored system prompt
   and recent conversation history, and asks Gemini for a reply.
4. If the AI's reply contains an `ORDER_CONFIRMED:` line (as instructed in
   the generated system prompt), the order is logged via `orderStore.js` —
   viewable at `GET /api/business/:id/orders` for now, until the Excel/Sheets
   export step replaces this with a real spreadsheet.
5. The reply is sent back to the customer via the Cloud API.
6. Duplicate deliveries (Meta sends "at-least-once") are ignored using the
   message ID as a dedup key.

### What's still simplified / not done

- **Text messages only** for now — images, audio, documents are ignored
  (`message.type !== "text"` is skipped). Worth adding once the core loop
  is solid.
- **No signature verification yet** — production should validate the
  `X-Hub-Signature-256` header on every webhook POST to confirm it really
  came from Meta. Not yet implemented here.
- **In-memory conversation history and order log** — both reset on server
  restart. Move to a real database before onboarding real businesses.
- **Dedup set grows forever** — fine for testing, but should be replaced
  with a TTL-based store (e.g. Redis) in production so memory doesn't grow
  unbounded over time.

### Next build step

Excel/Sheets export: turn the orders currently sitting in `orderStore.js`
into an actual downloadable spreadsheet (or live Google Sheets sync) for
the business owner.

---

## Step 5: Excel Export (orders as a downloadable spreadsheet) — now built

Business owners can now download all their detected orders as a real
`.xlsx` file, ready to open in Excel, Google Sheets, or any spreadsheet app.

### Setup

Install the new dependency:
```bash
npm install
```
(`xlsx` was added to `package.json` — this pulls it in.)

### How it works

- `GET /api/business/:id/orders/export` builds an `.xlsx` file on the fly
  from whatever's currently in `orderStore.js` and sends it as a download.
- Each order's `raw` text (the part after `ORDER_CONFIRMED:` in the AI's
  reply) is split by commas into: **Item, Quantity, Price, Customer Name,
  Phone, Delivery Area** — matching exactly what the generated system
  prompt instructs the AI to output.
- If an order doesn't match that 6-field shape (the AI phrased something
  unexpectedly), nothing is dropped — the full raw text is kept in an
  **Order Details** column instead, so you never silently lose an order.
- Every row also includes Order ID, Received At, and the customer's
  WhatsApp number for traceability.
- Tested end-to-end: seeded sample orders (including a deliberately messy
  one), downloaded the file over HTTP, and confirmed the resulting
  spreadsheet opens with correct columns and values.

### Try it

With the server running and at least one order detected for a business:
```bash
curl -o orders.xlsx http://localhost:3000/api/business/YOUR_BUSINESS_ID/orders/export
```

### What's still simplified / not done

- This is a **pull/download** model, not live sync — the business owner
  has to hit the export link to get a fresh file. A Pro-tier feature
  (per the business plan) would be live Google Sheets sync instead.
- No authentication yet on this endpoint — anyone with a business ID can
  download its orders. Add an auth check before this goes live with real
  customers.

### Next build step

Replace the in-memory stores (`businessStore.js`, `conversationStore.js`,
`orderStore.js`) with a real database (e.g. PostgreSQL), so data survives
a server restart — needed before onboarding real paying businesses.

---

## Step 6: Real Database (PostgreSQL) — now built

All data (businesses, conversation history, orders, and webhook dedup
records) now lives in PostgreSQL instead of resetting every time the
server restarts. `businessStore.js`, `conversationStore.js`, and
`orderStore.js` were rewritten to use Postgres, but kept the **exact same
function names**, so `server.js`'s route logic barely changed — only
`await` was added, since database calls are asynchronous.

### Setup

1. **Install PostgreSQL** if you don't have it already:
   - Mac: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - Or use a hosted option (Supabase, Railway, Neon, Render all have free
     Postgres tiers - easiest if you don't want to manage a server yourself).
2. **Create a database:**
   ```bash
   createdb dukaai
   ```
3. **Apply the schema:**
   ```bash
   psql -d dukaai -f schema.sql
   ```
   This creates 4 tables: `businesses`, `conversation_turns`, `orders`,
   and `processed_message_ids` (webhook dedup).
4. **Set `DATABASE_URL` in `.env`:**
   ```
   DATABASE_URL=postgresql://your_user:your_password@localhost:5432/dukaai
   ```
5. **Install the new dependency:**
   ```bash
   npm install
   ```
   (`pg`, the PostgreSQL driver, was added to `package.json`.)

### What changed under the hood

- **`db.js`** (new) — a shared connection pool that every store module uses.
- **`businessStore.js`** — same 4 functions as before
  (`createBusiness`, `getBusiness`, `findByPhoneNumberId`,
  `attachWhatsappNumber`), now backed by a `businesses` table.
- **`conversationStore.js`** — same 2 functions (`getHistory`,
  `appendTurn`), now backed by a `conversation_turns` table.
- **`orderStore.js`** — same 2 functions (`addOrder`, `getOrders`), now
  backed by an `orders` table.
- **`dedupStore.js`** (new) — replaces the old in-memory `Set` used for
  webhook message deduplication with a `processed_message_ids` table.
  Old records are cleaned up automatically once an hour so the table
  doesn't grow forever.

### Tested

This was verified against a real local PostgreSQL 16 instance, not just
checked for syntax: created a business, connected a fake WhatsApp number,
appended conversation turns, logged an order, tested webhook dedup logic,
and re-fetched everything to confirm it round-trips correctly. Also
re-ran the Excel export endpoint against database-backed order data to
confirm the earlier export step still works unchanged.

### What's still simplified / not done

- **No connection retry/backoff logic** — if Postgres is briefly
  unreachable, requests will fail rather than retry. Fine for early
  testing, worth hardening before production traffic.
- **Access tokens are still stored in plain text** (now in a database
  column instead of memory) — encrypt this column (e.g. with `pgcrypto`
  or application-level encryption) before handling real customer data.
- **No database migrations tool** — `schema.sql` is applied manually.
  Consider a migration tool (e.g. `node-pg-migrate`) once the schema
  starts changing often.

### Next build step

M-Pesa subscription billing — charge businesses monthly via the Daraja API.

