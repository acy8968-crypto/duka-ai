# Duka AI — Project README

A WhatsApp AI agent platform for small businesses in Kenya. Full plan is
in `docs/whatsapp-ai-agent-plan.md`.

---

## 📋 For Antigravity: How to Apply Code Updates

Read this before making any change to this project.

**Your role is to apply code exactly as given — not to write, rewrite, or
improve it.** Claude (outside this IDE) writes and tests all logic; you
place it correctly in this project and keep the file structure consistent.

When I paste in new or updated code for this project, follow these rules:

1. **Create or replace files exactly as given.** If a file doesn't exist
   at the stated path, create it. If it already exists, replace its full
   contents — don't merge old code with new code.
2. **Never invent, rewrite, or "improve" logic, styling, copy, or
   functionality** that wasn't explicitly given to you, even if it looks
   incomplete or you think you know a better way. This includes not adding
   error handling, refactoring, renaming variables, or adding comments
   beyond what's provided.
3. **Keep the existing folder structure** — don't reorganize files into a
   different layout than what's described below, and don't rename files
   or folders unless explicitly told to.
4. **Fix only what's necessary for the new code to work** — e.g. relative
   import paths or `<script>`/`<link>` references that break because of
   where a file lives. Nothing else.
5. **If anything is ambiguous, incomplete, or you're unsure whether a
   change affects behavior — stop and ask me before proceeding.** Guessing
   is worse than asking.
6. **When you're done, list every file you created or updated** so I can
   review the changes before running anything.

---

## 📁 Project Structure

```
/frontend
  index.html          — landing/explainer page
  onboarding.html      — 3-step signup form (business details → connect WhatsApp → success)
  styles.css           — shared design system
  script.js            — form logic, validation, Meta Embedded Signup flow

/backend
  server.js            — Express server: all API routes + WhatsApp webhook
  db.js                — shared PostgreSQL connection pool
  schema.sql           — database schema (run once to set up tables)
  package.json
  .env.example          — copy to .env and fill in real keys/secrets
  README.md            — backend setup instructions (Gemini, Meta, webhook, database)
  /services
    openrouterService.js  — generates AI system prompts + live chat replies via OpenRouter (current AI provider)
    geminiService.js      — DEPRECATED, superseded by openrouterService.js, kept for reference
    tokenUsageStore.js    — logs per-business AI token usage (PostgreSQL-backed)
    adminService.js       — aggregated queries for the admin panel (stats, activity feed, revenue)
    subscriptionStore.js  — manages trial periods and billing cycle status (PostgreSQL-backed)
    billingService.js     — orchestrates automatic trial-to-paid conversion and monthly renewals
    businessStore.js      — business records (PostgreSQL-backed)
    metaService.js        — Meta OAuth token exchange + phone number registration
    whatsappService.js    — sends outbound WhatsApp messages
    conversationStore.js  — per-customer chat history (PostgreSQL-backed)
    orderStore.js         — detected-orders log (PostgreSQL-backed)
    dedupStore.js         — webhook message dedup (PostgreSQL-backed)
    exportService.js      — builds downloadable .xlsx order exports

/docs
  whatsapp-ai-agent-plan.md   — full business + technical plan
```

## ✅ Build Status

| Step | Status |
|---|---|
| Business plan | Done |
| Landing + onboarding website | Done |
| Gemini prompt generation (backend) | Done |
| Meta Embedded Signup (connect WhatsApp) | Done |
| WhatsApp webhook (receive + reply + detect orders) | Done |
| Excel / Sheets order export | Done |
| Real database (replace in-memory stores) | Done |
| M-Pesa subscription billing (sandbox) | Done |
| M-Pesa production Paybill | In review with Safaricom |
| AI provider switched to OpenRouter | Done |
| Per-client token usage tracking | Done |
| Free trial + automatic billing | Done |
| Website copy honesty pass (real claims only) | Done |
| Admin panel (PWA) | Not started |
| Deployment | Not started |

See `backend/README.md` for setup instructions on everything built so far
(Gemini API key, Meta App Dashboard setup, ngrok for webhook testing, etc).
