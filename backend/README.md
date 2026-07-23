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
