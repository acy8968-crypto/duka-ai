# Production Go-Live Checklist — Duka AI

This is the single checklist to follow the moment BRS issues your BN2
certificate and Safaricom grants your production Paybill. Everything
technical is already built and tested — this is about **configuration
and cutover**, not new code.

Work through this top to bottom. Don't skip ahead — several steps
depend on the one before it.

---

## Phase 0 — Prerequisites (you're waiting on these already)

- [ ] BRS BN2 certificate issued for AUTOPAL SOFTWARE SERVICES
- [ ] Safaricom production Paybill number + passkey received from Hilda
- [ ] Meta Business Verification approved (needed before real Embedded
      Signup works for real customers — your own test number setup
      still works fine without this)

---

## Phase 1 — Deploy the backend

Pick ONE hosting option:

### Option A: Render (recommended — simplest)
1. Push the latest code to GitHub (should already be done via Antigravity)
2. In Render: **New +** → **Blueprint** → connect your `duka-ai` repo
3. Render reads `backend/render.yaml` and proposes the service — review, then deploy
4. In the Render dashboard, fill in every environment variable marked
   `sync: false` in `render.yaml` — use real values from
   `backend/.env.production.example` as your reference for what each one needs
5. Wait for the first deploy to finish. Note your service URL
   (e.g. `https://duka-ai-backend.onrender.com`)

### Option B: Railway
1. Push latest code to GitHub
2. In Railway: **New Project** → **Deploy from GitHub repo**
3. Set the root directory to `backend`
4. Railway auto-detects `railway.json` and Node — review the proposed config
5. Add all environment variables from `.env.production.example` in the Railway dashboard
6. Deploy, then note your service URL

### Option C: VPS with Docker
1. Provision a VPS (DigitalOcean, Linode, etc.) with Docker installed
2. Copy the `backend/` folder to the server (or `git clone` your repo there)
3. Create a real `.env` file on the server using `.env.production.example` as the template
4. Build and run:
   ```bash
   docker build -t duka-ai-backend .
   docker run -d -p 3000:3000 --env-file .env --restart unless-stopped --name duka-ai duka-ai-backend
   ```
5. Set up a reverse proxy (nginx/Caddy) with a real SSL certificate
   (e.g. via Let's Encrypt) in front of it, since Meta and Daraja both
   require valid HTTPS — a bare Docker container on a raw port isn't enough

**Not tested by Claude:** the actual Docker build was not run in the
environment these files were prepared in (no Docker available there).
The Dockerfile's logic was reviewed carefully and its healthcheck
command was verified separately against a real running server, but
building the image itself should be your first real test — try it early,
not for the first time during a live cutover.

- [ ] Backend deployed and reachable at a real HTTPS URL
- [ ] `GET https://your-real-url/api/health` returns `{"status":"ok"}`

---

## Phase 2 — Wire up the real webhooks (replaces ngrok entirely)

Your permanent hosting URL replaces ngrok — no more URLs that expire
when you close your laptop.

### M-Pesa callback
- [ ] Set `MPESA_CALLBACK_URL` in your host's environment variables to
      `https://your-real-url/api/mpesa/callback`
- [ ] Redeploy/restart so the new value takes effect

### Meta WhatsApp webhook
- [ ] Go to **Meta App Dashboard → WhatsApp → Configuration → Webhook**
- [ ] Update Callback URL to `https://your-real-url/webhook`
- [ ] Verify Token must match your production `META_WEBHOOK_VERIFY_TOKEN` exactly
- [ ] Click **Verify and Save** and confirm it succeeds
- [ ] Re-subscribe to the `messages` field if it's not already checked

---

## Phase 3 — Swap sandbox credentials for real ones

- [ ] `MPESA_BASE_URL` = `https://api.safaricom.co.ke` (not sandbox)
- [ ] `MPESA_SHORTCODE` = your real Paybill number (not `174379`)
- [ ] `MPESA_PASSKEY` = your real production passkey (not the shared sandbox one)
- [ ] `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` = from a **production**
      Daraja app, not the sandbox app you built with
- [ ] Double-check pricing in `frontend/index.html` still shows the real
      intended prices (1,999 / 4,999 / 9,999) — confirm nothing was left
      at a testing value like Ksh 1

---

## Phase 4 — Lock down access

- [ ] Generate a brand-new `ADMIN_API_KEY` for production — don't reuse
      your local development key
- [ ] Set `ALLOWED_ORIGIN` to your real frontend origin(s), comma-separated
      if more than one (e.g. your GitHub Pages URL). Never leave this as `*`
      in production
- [ ] Set `BILLING_CYCLE_INTERVAL_MS=3600000` (1 hour) — confirm it is
      NOT still set to a fast testing value like `60000`
- [ ] Confirm `.env` (or your host's secret manager) is not committed to
      git anywhere, including old commit history — see the note below

---

## Phase 5 — Frontend

- [ ] Confirm `API_BASE_URL` in `frontend/script.js` and `admin/admin.js`
      points to your real backend URL, not `http://localhost:3000`
- [ ] Confirm the Meta `appId` in `onboarding.html`'s `fbAsyncInit` is
      your real, live App ID (already fixed once before — just re-confirm)
- [ ] If your frontend is on GitHub Pages, confirm it's been redeployed
      with these updated values

---

## Phase 6 — Real end-to-end smoke test (do this before announcing anything)

Repeat the exact tests you already did in sandbox, but now against
production infrastructure:

- [ ] Sign up as a fresh test business through the real live website
- [ ] Connect a real WhatsApp number (yours) through the real Embedded Signup
- [ ] Message it and confirm you get a real AI reply
- [ ] Place a test order and confirm it's detected and exportable to Excel
- [ ] Start a real trial subscription and let a real (small) production
      M-Pesa charge go through — this uses REAL MONEY now, not sandbox,
      so use a small real amount you're comfortable with, or manually
      test via the admin dashboard's data rather than a live customer
- [ ] Confirm the payment lands correctly in the admin dashboard with a
      real M-Pesa receipt number
- [ ] Delete/clean up this final test business afterward, same as the
      sandbox cleanup you did before

---

## Phase 7 — Announce and monitor

- [ ] Open the admin dashboard and confirm it shows real, live production data
- [ ] Keep an eye on it for the first few real signups
- [ ] Known limitations to keep in mind (see `backend/README.md` for full
      detail): no plan-limit enforcement yet, single-instance billing
      scheduler (don't run multiple backend instances), no dunning/retry
      escalation on failed payments beyond the 30-minute cooldown retry

---

## A reminder on the git history question

Before this checklist, you confirmed no personal KYC documents were ever
pushed to GitHub. Worth one more explicit check right before going live:
ask Antigravity to run
`git log --all --full-history -- archive/ backend/.env "*.env"`
and confirm the output is empty. An empty result means none of those
paths exist anywhere in your git history — the strongest possible
confirmation, not just "the current state looks clean."
