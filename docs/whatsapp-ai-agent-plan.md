# WhatsApp AI Agent for Business — Kenya
### Full Plan (Business Model + Technical Build Plan)

---

## 1. The Idea, One Sentence

A website where any small business in Kenya signs up, describes their business, connects their WhatsApp number, and instantly gets an AI agent that auto-replies to customers, takes orders, and hands the business owner a clean Excel/Sheet of every order — for a monthly subscription.

---

## 2. Target Customer

Any small business in Kenya that gets customer inquiries/orders over WhatsApp — shops, boutiques, restaurants, salons, service providers, online sellers, etc. (general market, not locked to one niche).

---

## 3. Monetization

**Monthly subscription**, tiered by message volume / features:

| Tier | Price (KES/month) | Includes |
|---|---|---|
| Starter | 1,500–2,500 | 1 WhatsApp number, moderate message volume, Excel order export |
| Growth | 4,000–6,000 | Higher volume, basic analytics, priority replies |
| Pro | 8,000–12,000 | Multiple staff numbers, live Google Sheets sync, unlimited-ish messages |

Key cost advantage: because your AI only *replies* to customers who message first, this counts as a **"service conversation"** on WhatsApp — which is free and unlimited on Meta's side. Your real costs are just Gemini API calls + hosting, so subscription revenue is close to pure margin early on.

Collect payments via **M-Pesa Daraja API** (Kenyans expect M-Pesa over cards).

---

## 4. The Website Flow

**Page 1 — Landing/Explainer**
- What the AI agent does (24/7 auto-replies, order-taking, no missed customers)
- Simple, benefit-led copy
- CTA: "Get Started"

**Page 2 — Onboarding**
1. Form fields: business name, business description (products/services, tone, hours, FAQs, pricing), owner email/contact
2. **"Connect Your WhatsApp"** button — this opens Meta's **Embedded Signup** widget
3. Owner logs into their own Meta/Facebook Business account inside the popup, confirms their WhatsApp number, and verifies it with an OTP sent to their phone (this step can never be skipped — it's Meta's security requirement, not our limitation)
4. Once verified, Meta hands your backend the verified phone number ID automatically — no manual work needed after that

---

## 5. What Happens Behind the Scenes

1. **Business description → Gemini** (free tier, Google AI Studio): a meta-prompt turns the raw description into a complete WhatsApp AI system prompt (handles greetings, FAQs, order-taking logic, tone).
2. **Generated prompt is stored** in your database, linked to that business.
3. **WhatsApp number is registered** to Meta's Cloud API via Embedded Signup + your backend's registration call.
4. **Every incoming customer message** → your backend receives it via Meta's webhook → sends it to Gemini along with that business's stored system prompt → Gemini's reply → sent back to the customer via the Cloud API.
5. **Order detection**: when the AI recognizes an order (product + quantity + customer name + phone), your backend writes a row into that business's Excel file (or a live Google Sheet) which the owner can view/download anytime.

---

## 6. Tech Stack

| Piece | Tool |
|---|---|
| Frontend (2 pages) | React or plain HTML/CSS/JS |
| Backend | Node.js or Python (FastAPI/Flask) |
| Database | PostgreSQL, or Google Sheets as a lightweight DB for MVP |
| AI (prompt generation + chat replies) | Gemini API (free tier) |
| WhatsApp connection | **Meta Cloud API directly, via Embedded Signup** (no paid BSP needed) |
| Orders export | Python `openpyxl`/`pandas` for .xlsx, or Google Sheets API for live sync |
| Payments | M-Pesa Daraja API |

---

## 7. Why Meta Cloud API Directly (Not a Paid BSP)

- No infrastructure to run, 1–3 day provisioning
- Customer-initiated ("service") conversations are free and unlimited
- You only pay Meta if *you* initiate contact with marketing/template messages (not your use case)
- Embedded Signup automates the number-verification handshake, so onboarding feels seamless to the business owner
- Caveat: new developer accounts are capped at ~10 new business customers per rolling 7-day window at first — this limit increases as your account matures, so it won't block your pilot phase

**Fallback option** if Meta's verification/setup is too slow for an early pilot: Celcom Africa's Kenya-based WhatsApp API (~KES 0.25/message, CAK-compliant, free trial on signup).

**Avoid**: unofficial libraries (Baileys, whatsapp-web.js) — free but risk account bans once you have paying customers depending on uptime.

---

## 8. Kenya-Specific Compliance To Sort Out Early

- **Data Protection Act 2019** — register with the ODPC as a data controller/processor since you'll handle customer phone numbers and order data on behalf of businesses
- **Business registration** — at least a sole proprietorship, needed for invoicing and M-Pesa business payment collection
- **M-Pesa Daraja API** setup for subscription billing

---

## 9. Build Order (MVP First) — What To Do Today

1. **Landing page + onboarding form** (static, simple) — business name, description, contact fields
2. **Gemini prompt-generation script** — test manually first (paste a sample business description in, check the generated system prompt quality) before wiring it to WhatsApp
3. **Meta Developer account + WhatsApp Business app** (free) — set up Embedded Signup using Meta's test number first
4. **Webhook + Cloud API connection** — one test business number, wired to a Gemini-generated prompt
5. **Order detection + Excel/Sheets export**
6. **M-Pesa subscription/payment layer** — add once the core loop works
7. **Pilot with 2–3 real small businesses** before opening it up publicly

---

## 10. Immediate Next Steps (Today)

- [ ] Create Google AI Studio account → get free Gemini API key
- [ ] Create Meta Developer account → create a WhatsApp Business app → get a free test number
- [ ] Scaffold the two web pages (landing + onboarding form)
- [ ] Write the Gemini "meta-prompt" script that turns a business description into a full AI system prompt
- [ ] Wire up the webhook to receive/send WhatsApp messages via the test number
- [ ] Build the order-detection → Excel export piece

---

*Next: start scaffolding the actual code — landing/onboarding pages, the Gemini prompt-generation backend, and the Meta webhook connection.*
