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