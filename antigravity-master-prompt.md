# Prompt for Antigravity — Create/Update All Project Files (Webhook Update)

Paste everything below this line into Antigravity's agent panel as one message.

---

I have all the code for my project already finalized below. I do NOT want
you to invent, rewrite, redesign, or "improve" any logic, styling, copy, or
functionality. Your job is only to:

1. Create each file at the exact path shown if it doesn't exist yet.
2. If a file already exists at that path, REPLACE its full contents with
   the version below (this is an update, not a merge) — do not keep old
   code mixed with new code.
3. My current project structure has `frontend/` for the website files and
   `backend/` (with a `services/` subfolder) for the server files — keep
   using that same structure for these paths.
4. After creating/updating everything, confirm all relative references
   still resolve correctly:
   - `frontend/onboarding.html` and `frontend/index.html` link to
     `styles.css` and `script.js` in the same folder
   - `backend/server.js` requires `./services/geminiService`,
     `./services/businessStore`, `./services/metaService`,
     `./services/whatsappService`, `./services/conversationStore`, and
     `./services/orderStore`
5. Do not add npm packages, config files, or code beyond what's listed
   below. If something looks incomplete or you think something's missing,
   stop and ask me rather than filling it in yourself.
6. Once done, list every file you created or updated so I can review it.

Here are all the files:

## File: `frontend/index.html`
````html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Duka AI — Your WhatsApp, Answered Automatically</title>
<meta name="description" content="Duka AI replies to your customers on WhatsApp, takes their orders, and hands you a clean spreadsheet — 24 hours a day, in your own business's voice." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="index.html" class="brand">
      <span class="brand-mark" aria-hidden="true"></span>
      Duka AI
    </a>
    <a href="onboarding.html" class="nav-cta">Set up my AI agent</a>
  </div>
</nav>

<!-- ============ HERO ============ -->
<header class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span> Built for WhatsApp-first businesses in Kenya</span>
      <h1>Your shop never closes. Now your WhatsApp doesn't either.</h1>
      <p class="hero-sub">
        Duka AI answers your customers the moment they message, in the way you'd answer them yourself — then quietly turns every order into a spreadsheet you can check anytime, from anywhere.
      </p>
      <div class="hero-actions">
        <a href="onboarding.html" class="btn btn-primary">Set up my AI agent</a>
        <a href="#how-it-works" class="btn btn-ghost">See how it works</a>
      </div>
      <p class="hero-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        No app to install. Your customers keep chatting on the WhatsApp they already use.
      </p>
    </div>

    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-header">
            <span class="phone-avatar" aria-hidden="true"></span>
            <div>
              Mama Njeri's Boutique
              <div class="phone-status">Active now</div>
            </div>
          </div>
          <div class="phone-body">
            <div class="bubble bubble-in bubble-1">Hi, do you have the blue ankara dress in size M? 😊</div>
            <div class="typing" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="bubble bubble-out bubble-2">Yes! The blue ankara in M is available — KES 2,800. Would you like me to place the order for you?</div>
            <div class="bubble bubble-in bubble-3">Yes please, deliver to Kilimani</div>
          </div>
        </div>
        <div class="sheet-card" aria-hidden="true">
          <div class="sheet-title">Orders — Today</div>
          <div class="sheet-row"><span>Item</span><span>Ankara M</span></div>
          <div class="sheet-row"><span>Amount</span><span>KES 2,800</span></div>
          <div class="sheet-row"><span>Area</span><span>Kilimani</span></div>
        </div>
      </div>
    </div>
  </div>
</header>

<div class="strip">
  <div class="container strip-inner">
    <span>No lost orders</span>
    <span>No missed customers</span>
    <span>Works while you sleep</span>
    <span>Your own AI, your own words</span>
  </div>
</div>

<!-- ============ HOW IT WORKS ============ -->
<section class="section" id="how-it-works">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">How it works</span>
      <h2>Four steps, and it's running.</h2>
    </div>
    <div class="steps">
      <div class="step-card">
        <div class="step-num">1</div>
        <h3>Tell us about your business</h3>
        <p>What you sell, how you talk to customers, your hours, your prices, your common questions.</p>
      </div>
      <div class="step-card">
        <div class="step-num">2</div>
        <h3>We build your AI's brain</h3>
        <p>Your description becomes a custom AI agent that sounds like your business — not a generic bot.</p>
      </div>
      <div class="step-card">
        <div class="step-num">3</div>
        <h3>Connect your WhatsApp</h3>
        <p>A quick, secure sign-in confirms it's really your number. Takes under a minute.</p>
      </div>
      <div class="step-card">
        <div class="step-num">4</div>
        <h3>Watch the orders roll in</h3>
        <p>Every conversation gets handled. Every order lands in a spreadsheet, ready for you to review.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ FEATURES ============ -->
<section class="section section-tight">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">What you get</span>
      <h2>Everything a busy shop owner actually needs.</h2>
    </div>
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <h3>Replies day and night</h3>
        <p>Your AI agent answers customers at 11pm the same way it does at 11am — no missed sales because you were asleep or busy.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/></svg>
        </div>
        <h3>Orders, organized automatically</h3>
        <p>No more digging through chats to remember who ordered what. Every order is written to a spreadsheet the moment it's placed.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
        </div>
        <h3>Sounds like your business</h3>
        <p>Not a stiff, generic chatbot — an agent trained on how you describe your own products and how you like to talk to customers.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3>Set up in one sitting</h3>
        <p>No developer needed. Fill in your business details, connect WhatsApp, and you're live the same day.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>
        </div>
        <h3>Stays on your number</h3>
        <p>Customers message the WhatsApp number they already know for your business. Nothing changes on their end.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <h3>Pay monthly, cancel anytime</h3>
        <p>Simple subscription pricing, billed via M-Pesa. No contracts, no setup fees.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ PRICING ============ -->
<section class="section" id="pricing">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Pricing</span>
      <h2>Pick the plan that matches your traffic.</h2>
    </div>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="price-name">Starter</div>
        <div class="price-amount">KES 2,000<span>/month</span></div>
        <p class="price-desc">For businesses just getting started with automated WhatsApp replies.</p>
        <ul class="price-list">
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> 1 WhatsApp number</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Up to ~300 conversations/month</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Orders exported to Excel</li>
        </ul>
        <a href="onboarding.html" class="btn btn-ghost btn-block">Get started</a>
      </div>
      <div class="price-card featured">
        <span class="price-badge">Most popular</span>
        <div class="price-name">Growth</div>
        <div class="price-amount">KES 5,000<span>/month</span></div>
        <p class="price-desc">For shops with steady daily order volume.</p>
        <ul class="price-list">
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> 1 WhatsApp number</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Higher conversation volume</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Live order dashboard</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Priority reply speed</li>
        </ul>
        <a href="onboarding.html" class="btn btn-primary btn-block">Get started</a>
      </div>
      <div class="price-card">
        <div class="price-name">Pro</div>
        <div class="price-amount">KES 10,000<span>/month</span></div>
        <p class="price-desc">For multi-staff operations that need everything in sync.</p>
        <ul class="price-list">
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Multiple staff numbers</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Unlimited-ish conversations</li>
          <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Live Google Sheets sync</li>
        </ul>
        <a href="onboarding.html" class="btn btn-ghost btn-block">Get started</a>
      </div>
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section class="section section-tight" id="faq">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Questions</span>
      <h2>Before you set it up.</h2>
    </div>
    <div class="faq-list">

      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false">
          Do my customers need to download anything?
          <svg class="faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="faq-a"><div class="faq-a-inner">No. They keep messaging the same WhatsApp number they already use for your business — nothing changes on their side.</div></div>
      </div>

      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false">
          What if the AI doesn't know how to answer something?
          <svg class="faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="faq-a"><div class="faq-a-inner">You tell it upfront how to handle anything unusual — like flagging a message for you to answer personally.</div></div>
      </div>

      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false">
          Is connecting my WhatsApp number safe?
          <svg class="faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="faq-a"><div class="faq-a-inner">Yes. Connection happens through Meta's own official sign-in, verified by a one-time code sent straight to your phone. You stay in control of your number at all times.</div></div>
      </div>

      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false">
          How do I get paid, and how do I pay Duka AI?
          <svg class="faq-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="faq-a"><div class="faq-a-inner">Your customers pay you however you already arrange it. Your monthly subscription to Duka AI is billed through M-Pesa.</div></div>
      </div>

    </div>
  </div>
</section>

<!-- ============ FINAL CTA ============ -->
<section class="section-tight">
  <div class="container">
    <div class="cta-band">
      <div>
        <h2>Stop typing the same replies all day.</h2>
        <p>Set up your AI agent in one sitting — most businesses are live the same day they sign up.</p>
      </div>
      <a href="onboarding.html" class="btn btn-primary">Set up my AI agent</a>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container footer-inner">
    <span>© 2026 Duka AI. Built for businesses in Kenya.</span>
    <span>Nairobi, Kenya</span>
  </div>
</footer>

<script src="script.js"></script>
</body>
</html>

````

## File: `frontend/onboarding.html`
````html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Set up your AI agent — Duka AI</title>
<meta name="description" content="Tell us about your business and connect your WhatsApp number to launch your AI agent." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="index.html" class="brand">
      <span class="brand-mark" aria-hidden="true"></span>
      Duka AI
    </a>
    <a href="index.html" class="nav-cta" style="background:transparent;color:var(--ink);border:1.5px solid var(--line);">Back home</a>
  </div>
</nav>

<main class="onboard-shell">
  <div class="container">

    <div class="onboard-head">
      <span class="eyebrow">Setup</span>
      <h1 style="font-size:clamp(1.7rem, 3vw, 2.2rem);">Let's build your AI agent</h1>
      <p>Three quick steps. Most businesses are live the same day.</p>
    </div>

    <div class="progress" id="progressBar">
      <div class="progress-step active" data-step="1"></div>
      <div class="progress-step" data-step="2"></div>
      <div class="progress-step" data-step="3"></div>
    </div>

    <div class="onboard-card">
      <form id="onboardForm" novalidate>

        <!-- ===================== STAGE 1: BUSINESS DETAILS ===================== -->
        <div class="form-stage active" data-stage="1">
          <h2 style="font-size:1.3rem;">Tell us about your business</h2>
          <p style="margin-bottom:28px;">This becomes the foundation of your AI agent's personality and knowledge.</p>

          <div class="field-group" id="group-businessName">
            <label for="businessName">Business name</label>
            <input type="text" id="businessName" name="businessName" placeholder="e.g. Mama Njeri's Boutique" required>
            <p class="field-error">Please enter your business name.</p>
          </div>

          <div class="field-group" id="group-ownerContact">
            <label for="ownerContact">Your email or phone (for your account)</label>
            <input type="text" id="ownerContact" name="ownerContact" placeholder="e.g. njeri@gmail.com or 0712 345 678" required>
            <p class="field-error">Please enter a valid email or phone number.</p>
          </div>

          <div class="field-group">
            <label>What kind of business is this?</label>
            <div class="tag-row" id="businessTypeTags" role="group" aria-label="Business type">
              <button type="button" class="tag" data-value="Retail / Shop">Retail / Shop</button>
              <button type="button" class="tag" data-value="Restaurant / Food">Restaurant / Food</button>
              <button type="button" class="tag" data-value="Salon / Beauty">Salon / Beauty</button>
              <button type="button" class="tag" data-value="Service provider">Service provider</button>
              <button type="button" class="tag" data-value="Other">Other</button>
            </div>
          </div>

          <div class="field-group" id="group-description">
            <label for="description">Describe your business, products, prices, and how you like to talk to customers</label>
            <textarea id="description" name="description" maxlength="1200" placeholder="e.g. We sell ankara dresses and fabrics in Nairobi. Sizes S–XL, prices between KES 1,500–4,000. We deliver within Nairobi for KES 200. We're friendly and use simple English or Swahili depending on the customer. We're open 8am–7pm every day." required></textarea>
            <div class="char-count"><span id="charCount">0</span>/1200</div>
            <p class="field-error">Tell us at least a little about your business so we can build a good AI agent.</p>
            <p class="field-hint">The more detail here, the better your AI agent will sound and behave. You can always update this later.</p>
          </div>

          <div class="form-actions">
            <span></span>
            <button type="button" class="btn btn-primary" id="toStage2">Continue</button>
          </div>
        </div>

        <!-- ===================== STAGE 2: CONNECT WHATSAPP ===================== -->
        <div class="form-stage" data-stage="2">
          <h2 style="font-size:1.3rem;">Connect your WhatsApp</h2>
          <p style="margin-bottom:28px;">This confirms you're the real owner of the number your customers already message.</p>

          <div class="connect-box" id="connectBox">
            <div class="connect-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </div>
            <h3>Connect your WhatsApp Business number</h3>
            <p>You'll sign in through Meta's official verification. A one-time code goes straight to your phone — we never see or store your password.</p>
            <button type="button" class="btn btn-primary" id="connectBtn">Connect with Meta</button>
            <div class="connect-status" id="connectStatus">
              <div class="spinner" aria-hidden="true"></div>
              <span id="connectStatusText">Waiting for verification…</span>
            </div>
          </div>

          <div class="field-group" style="margin-top:24px; display:none;" id="group-phoneManual">
            <label for="phoneManual">WhatsApp number (auto-filled after connecting)</label>
            <input type="tel" id="phoneManual" name="phoneManual" placeholder="+254 7XX XXX XXX" readonly>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="backToStage1">Back</button>
            <button type="button" class="btn btn-primary" id="toStage3" disabled>Continue</button>
          </div>
        </div>

        <!-- ===================== STAGE 3: SUCCESS ===================== -->
        <div class="form-stage" data-stage="3">
          <div class="success-stage">
            <div class="success-badge" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 style="font-size:1.4rem;">Your AI agent is being built</h2>
            <p>Here's what we've got. Your agent will be live on WhatsApp shortly.</p>

            <div class="summary-list" id="summaryList">
              <!-- filled by JS -->
            </div>

            <a href="index.html" class="btn btn-primary btn-block">Done — back to home</a>
          </div>
        </div>

      </form>
    </div>

  </div>
</main>

<footer class="footer">
  <div class="container footer-inner">
    <span>© 2026 Duka AI. Built for businesses in Kenya.</span>
    <span>Nairobi, Kenya</span>
  </div>
</footer>

<script src="script.js"></script>

<!-- ============================================================
     Meta JS SDK — required for real Embedded Signup (FB.login)
     Replace YOUR_META_APP_ID below with your real Meta App ID.
     ============================================================ -->
<div id="fb-root"></div>
<script>
  window.fbAsyncInit = function () {
    FB.init({
      appId: "YOUR_META_APP_ID",
      autoLogAppEvents: true,
      xfbml: true,
      version: "v21.0",
    });
  };
</script>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

</body>
</html>

````

## File: `frontend/styles.css`
````css
/* ============================================
   DESIGN TOKENS
   ============================================ */
:root {
  --ink: #16261F;
  --ink-soft: #3F4F45;
  --base: #F5F2E9;
  --card: #FFFFFF;
  --line: #DCD5C4;
  --amber: #D98A2B;
  --amber-deep: #B36F1C;
  --teal: #1F6F5C;
  --teal-deep: #164F41;
  --danger: #B5432E;

  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  --radius: 14px;
  --radius-sm: 8px;
  --shadow-card: 0 1px 2px rgba(22, 38, 31, 0.06), 0 8px 24px -12px rgba(22, 38, 31, 0.18);
  --max-width: 1160px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--base);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  color: var(--ink);
  margin: 0 0 0.4em 0;
  line-height: 1.08;
  letter-spacing: -0.01em;
}

p { margin: 0 0 1em 0; color: var(--ink-soft); }

a { color: inherit; }

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

/* ============================================
   NAV
   ============================================ */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(245, 242, 233, 0.88);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: var(--max-width);
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--ink);
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--amber), var(--teal));
  flex-shrink: 0;
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--ink);
  color: var(--base);
  text-decoration: none;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  transition: transform 0.15s ease, background 0.15s ease;
}
.nav-cta:hover { background: var(--teal-deep); transform: translateY(-1px); }
.nav-cta:focus-visible { outline: 3px solid var(--amber); outline-offset: 2px; }

/* ============================================
   BUTTONS
   ============================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  padding: 14px 26px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.btn:focus-visible { outline: 3px solid var(--amber-deep); outline-offset: 2px; }

.btn-primary {
  background: var(--teal);
  color: #fff;
}
.btn-primary:hover { background: var(--teal-deep); transform: translateY(-1px); }

.btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1.5px solid var(--line);
}
.btn-ghost:hover { border-color: var(--ink); }

.btn-block { width: 100%; }

.btn[disabled] { opacity: 0.6; cursor: not-allowed; transform: none !important; }

/* ============================================
   HERO
   ============================================ */
.hero {
  padding: 72px 0 96px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--teal-deep);
  background: rgba(31, 111, 92, 0.09);
  border: 1px solid rgba(31, 111, 92, 0.22);
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 20px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.hero h1 {
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  max-width: 15ch;
}

.hero-sub {
  font-size: 1.15rem;
  max-width: 46ch;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.hero-note {
  font-size: 0.85rem;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-note svg { flex-shrink: 0; color: var(--teal); }

/* ---- Phone mockup (signature element) ---- */
.phone-wrap {
  position: relative;
  display: flex;
  justify-content: center;
}

.phone {
  width: 300px;
  background: var(--ink);
  border-radius: 34px;
  padding: 14px;
  box-shadow: var(--shadow-card);
  position: relative;
}

.phone-screen {
  background: #EDEAE0;
  border-radius: 22px;
  height: 460px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.phone-header {
  background: var(--teal-deep);
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
}

.phone-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--amber);
  flex-shrink: 0;
}

.phone-status {
  font-size: 0.68rem;
  font-weight: 400;
  opacity: 0.8;
}

.phone-body {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.bubble {
  max-width: 82%;
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 0.82rem;
  line-height: 1.35;
  opacity: 0;
  transform: translateY(6px);
  animation: bubbleIn 0.4s ease forwards;
}

@keyframes bubbleIn {
  to { opacity: 1; transform: translateY(0); }
}

.bubble-in {
  align-self: flex-start;
  background: #fff;
  color: var(--ink);
  border-bottom-left-radius: 4px;
}

.bubble-out {
  align-self: flex-end;
  background: var(--teal);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble-1 { animation-delay: 0.3s; }
.bubble-2 { animation-delay: 1.4s; }
.bubble-3 { animation-delay: 2.5s; }

.typing {
  align-self: flex-end;
  display: flex;
  gap: 4px;
  padding: 10px 13px;
  background: var(--teal);
  border-radius: 14px;
  border-bottom-right-radius: 4px;
  opacity: 0;
  animation: bubbleIn 0.3s ease forwards;
  animation-delay: 0.9s;
}
.typing span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  animation: bounce 1s infinite ease-in-out;
}
.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* sheet card popping out from the phone */
.sheet-card {
  position: absolute;
  right: -18px;
  bottom: 34px;
  width: 190px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  padding: 12px;
  opacity: 0;
  transform: translate(14px, 14px) scale(0.94);
  animation: sheetIn 0.5s ease forwards;
  animation-delay: 3.1s;
}

@keyframes sheetIn {
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}

.sheet-title {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  margin-bottom: 8px;
}

.sheet-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 4px 0;
  border-top: 1px solid var(--line);
}
.sheet-row:first-of-type { border-top: none; }
.sheet-row span:first-child { color: var(--ink-soft); }
.sheet-row span:last-child { text-align: right; font-weight: 600; }

/* ============================================
   LOGO / TRUST STRIP
   ============================================ */
.strip {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 28px 0;
}
.strip-inner {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ============================================
   SECTIONS
   ============================================ */
.section { padding: 96px 0; }
.section-tight { padding: 64px 0; }

.section-head {
  max-width: 60ch;
  margin-bottom: 48px;
}

.section-head .eyebrow { margin-bottom: 16px; }

.section-head h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

/* ---- How it works ---- */
.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.step-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px 22px;
  position: relative;
}

.step-num {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--teal-deep);
  background: rgba(31, 111, 92, 0.1);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-card h3 {
  font-family: var(--font-body);
  font-size: 1.02rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.step-card p { font-size: 0.92rem; margin-bottom: 0; }

/* ---- Feature grid ---- */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 26px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--base);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--teal-deep);
}

.feature-card h3 {
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 700;
}
.feature-card p { font-size: 0.92rem; margin-bottom: 0; }

/* ---- Pricing ---- */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.price-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
}

.price-card.featured {
  border-color: var(--teal);
  box-shadow: var(--shadow-card);
  position: relative;
}

.price-badge {
  position: absolute;
  top: -12px;
  left: 26px;
  background: var(--teal);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 5px 10px;
  border-radius: 999px;
}

.price-name {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  margin-bottom: 10px;
}

.price-amount {
  font-family: var(--font-display);
  font-size: 2.1rem;
  margin-bottom: 4px;
}
.price-amount span {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--ink-soft);
}

.price-desc { font-size: 0.88rem; margin-bottom: 20px; }

.price-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  font-size: 0.88rem;
  flex: 1;
}
.price-list li {
  display: flex;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid var(--line);
  color: var(--ink-soft);
}
.price-list li:first-child { border-top: none; }
.price-list li svg { flex-shrink: 0; color: var(--teal); margin-top: 2px; }

/* ---- FAQ ---- */
.faq-list { border-top: 1px solid var(--line); }
.faq-item { border-bottom: 1px solid var(--line); }
.faq-q {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 20px 4px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.faq-q:focus-visible { outline: 3px solid var(--amber); outline-offset: -2px; }
.faq-icon { transition: transform 0.2s ease; flex-shrink: 0; color: var(--teal-deep); }
.faq-item[data-open="true"] .faq-icon { transform: rotate(45deg); }

.faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}
.faq-item[data-open="true"] .faq-a { max-height: 240px; }
.faq-a-inner { padding: 0 4px 20px; font-size: 0.92rem; color: var(--ink-soft); max-width: 62ch; }

/* ---- Final CTA ---- */
.cta-band {
  background: var(--ink);
  border-radius: 20px;
  padding: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}
.cta-band h2 { color: var(--base); font-size: clamp(1.6rem, 3vw, 2.1rem); max-width: 20ch; }
.cta-band p { color: rgba(245,242,233,0.7); margin-bottom: 0; max-width: 42ch; }

/* ============================================
   FOOTER
   ============================================ */
.footer {
  border-top: 1px solid var(--line);
  padding: 40px 0;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

/* ============================================
   ONBOARDING PAGE
   ============================================ */
.onboard-shell {
  padding: 56px 0 96px;
}

.onboard-head {
  max-width: 60ch;
  margin: 0 auto 40px;
  text-align: center;
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 360px;
  margin: 0 auto 40px;
}
.progress-step {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: var(--line);
  position: relative;
  overflow: hidden;
}
.progress-step.active,
.progress-step.done { background: var(--teal); }

.onboard-card {
  max-width: 640px;
  margin: 0 auto;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  padding: 40px;
}

.form-stage { display: none; }
.form-stage.active { display: block; }

.field-group { margin-bottom: 22px; }

.field-group label {
  display: block;
  font-size: 0.86rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.field-hint {
  font-size: 0.78rem;
  color: var(--ink-soft);
  margin-top: 6px;
}

input[type="text"],
input[type="email"],
input[type="tel"],
textarea,
select {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: 12px 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--base);
  color: var(--ink);
  transition: border-color 0.15s ease, background 0.15s ease;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--teal);
  background: #fff;
}
textarea { resize: vertical; min-height: 120px; }

.char-count {
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ink-soft);
  margin-top: 4px;
}

.field-error {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 6px;
  display: none;
}
.field-group.invalid input,
.field-group.invalid textarea { border-color: var(--danger); }
.field-group.invalid .field-error { display: block; }

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.tag {
  font-size: 0.82rem;
  padding: 8px 14px;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  background: var(--base);
  cursor: pointer;
  transition: all 0.15s ease;
}
.tag[aria-pressed="true"] {
  background: var(--teal);
  border-color: var(--teal);
  color: #fff;
}

/* ---- WhatsApp connect stage ---- */
.connect-box {
  text-align: center;
  padding: 32px 20px;
  border: 1.5px dashed var(--line);
  border-radius: var(--radius);
  background: var(--base);
}
.connect-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.connect-box h3 { font-family: var(--font-body); font-size: 1.05rem; }
.connect-box p { font-size: 0.88rem; max-width: 40ch; margin: 0 auto 20px; }

.connect-status {
  display: none;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--teal-deep);
}
.connect-status.visible { display: flex; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--line);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- Success stage ---- */
.success-stage { text-align: center; padding: 20px 0; }
.success-badge {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px;
}
.summary-list {
  text-align: left;
  background: var(--base);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  margin: 24px 0;
  font-size: 0.88rem;
}
.summary-list div { display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid var(--line); }
.summary-list div:first-child { border-top: none; }
.summary-list span:first-child { color: var(--ink-soft); }
.summary-list span:last-child { font-weight: 600; font-family: var(--font-mono); font-size: 0.82rem; text-align: right; max-width: 60%; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .phone-wrap { order: -1; margin-bottom: 24px; }
  .steps { grid-template-columns: repeat(2, 1fr); }
  .features { grid-template-columns: 1fr; }
  .pricing-grid { grid-template-columns: 1fr; }
  .cta-band { flex-direction: column; text-align: center; }
  .onboard-card { padding: 28px 22px; }
}

@media (max-width: 560px) {
  .steps { grid-template-columns: 1fr; }
  .phone { width: 100%; max-width: 300px; }
  .hero-actions { flex-direction: column; align-items: stretch; }
}

````

## File: `frontend/script.js`
````javascript
/* ============================================================
   Duka AI — shared front-end behaviour
   Covers both index.html (landing) and onboarding.html (form)

   The Gemini prompt-generation step below now calls a REAL backend
   (see /backend in the project). The WhatsApp connect step is still
   simulated — that's the next build step (Meta Embedded Signup).
   Remaining "TODO(backend)" comments mark what's left to wire up.
   ============================================================ */

// Change this if your backend runs somewhere other than localhost:3000
const API_BASE_URL = "http://localhost:3000";

// From Meta App Dashboard > WhatsApp > Embedded Signup Builder
const META_EMBEDDED_SIGNUP_CONFIG_ID = "YOUR_EMBEDDED_SIGNUP_CONFIG_ID";

document.addEventListener("DOMContentLoaded", () => {
  initFaq();
  initOnboardingForm();
});

/* ----------------------------------------------------------
   FAQ accordion (landing page)
   ---------------------------------------------------------- */
function initFaq() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      // close all other items (accordion behaviour)
      items.forEach((other) => {
        other.setAttribute("data-open", "false");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ----------------------------------------------------------
   Onboarding form (onboarding.html only)
   ---------------------------------------------------------- */
function initOnboardingForm() {
  const form = document.getElementById("onboardForm");
  if (!form) return; // not on this page

  const state = {
    businessName: "",
    ownerContact: "",
    businessType: "",
    description: "",
    businessId: "",
    systemPrompt: "",
    whatsappNumber: "",
    whatsappConnected: false,
  };

  const stages = document.querySelectorAll(".form-stage");
  const progressSteps = document.querySelectorAll(".progress-step");

  function goToStage(stepNumber) {
    stages.forEach((s) => {
      s.classList.toggle("active", s.dataset.stage === String(stepNumber));
    });
    progressSteps.forEach((p) => {
      const n = Number(p.dataset.step);
      p.classList.toggle("active", n === stepNumber);
      p.classList.toggle("done", n < stepNumber);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Stage 1: business details ---------- */

  const businessNameInput = document.getElementById("businessName");
  const ownerContactInput = document.getElementById("ownerContact");
  const descriptionInput = document.getElementById("description");
  const charCount = document.getElementById("charCount");
  const tagButtons = document.querySelectorAll("#businessTypeTags .tag");

  descriptionInput.addEventListener("input", () => {
    charCount.textContent = descriptionInput.value.length;
  });

  tagButtons.forEach((tag) => {
    tag.addEventListener("click", () => {
      tagButtons.forEach((t) => t.setAttribute("aria-pressed", "false"));
      tag.setAttribute("aria-pressed", "true");
      state.businessType = tag.dataset.value;
    });
  });

  function validateField(inputEl, groupId, isValidFn) {
    const group = document.getElementById(groupId);
    const valid = isValidFn(inputEl.value.trim());
    group.classList.toggle("invalid", !valid);
    return valid;
  }

  function isValidContact(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\s-]{7,15}$/;
    return emailPattern.test(value) || phonePattern.test(value);
  }

  const toStage2Btn = document.getElementById("toStage2");
  const stage1ErrorBanner = document.createElement("p");
  stage1ErrorBanner.className = "field-error";
  stage1ErrorBanner.style.display = "none";
  stage1ErrorBanner.style.marginTop = "-8px";
  stage1ErrorBanner.style.marginBottom = "16px";
  toStage2Btn.closest(".form-actions").before(stage1ErrorBanner);

  toStage2Btn.addEventListener("click", async () => {
    const nameValid = validateField(businessNameInput, "group-businessName", (v) => v.length > 1);
    const contactValid = validateField(ownerContactInput, "group-ownerContact", isValidContact);
    const descValid = validateField(descriptionInput, "group-description", (v) => v.length > 20);

    if (!(nameValid && contactValid && descValid)) return;

    state.businessName = businessNameInput.value.trim();
    state.ownerContact = ownerContactInput.value.trim();
    state.description = descriptionInput.value.trim();

    stage1ErrorBanner.style.display = "none";
    toStage2Btn.disabled = true;
    const originalLabel = toStage2Btn.textContent;
    toStage2Btn.textContent = "Building your AI agent…";

    try {
      // Sends the business details to the backend, which forwards the
      // description to Gemini and generates the WhatsApp AI system prompt.
      const res = await fetch(`${API_BASE_URL}/api/generate-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: state.businessName,
          businessType: state.businessType,
          ownerContact: state.ownerContact,
          description: state.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong generating your AI agent.");
      }

      state.businessId = data.businessId;
      state.systemPrompt = data.systemPrompt;

      goToStage(2);
    } catch (err) {
      console.error("generate-prompt failed:", err);
      stage1ErrorBanner.textContent =
        "We couldn't reach the AI agent builder. Make sure the backend server is running, then try again.";
      stage1ErrorBanner.style.display = "block";
    } finally {
      toStage2Btn.disabled = false;
      toStage2Btn.textContent = originalLabel;
    }
  });

  document.getElementById("backToStage1").addEventListener("click", () => goToStage(1));

  /* ---------- Stage 2: connect WhatsApp (simulated Embedded Signup) ---------- */

  const connectBtn = document.getElementById("connectBtn");
  const connectStatus = document.getElementById("connectStatus");
  const connectStatusText = document.getElementById("connectStatusText");
  const connectBox = document.getElementById("connectBox");
  const phoneManualGroup = document.getElementById("group-phoneManual");
  const phoneManualInput = document.getElementById("phoneManual");
  const toStage3Btn = document.getElementById("toStage3");

  connectBtn.addEventListener("click", () => {
    if (typeof FB === "undefined") {
      connectStatus.classList.add("visible");
      connectStatusText.textContent =
        "Meta's login SDK hasn't loaded yet. Check your internet connection and try again.";
      return;
    }

    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting…";
    connectStatus.classList.add("visible");
    connectStatusText.textContent = "Opening Meta verification…";

    // Launches Meta's real Embedded Signup popup. The business owner logs
    // into their own Meta/Facebook Business account and verifies their
    // WhatsApp number with an OTP sent directly to their phone.
    FB.login(
      (loginResponse) => {
        if (loginResponse.authResponse && loginResponse.authResponse.code) {
          // We have the OAuth "code" - now we need the wabaId/phoneNumberId,
          // which Meta sends separately via a postMessage event (captured below).
          pendingSignupCode = loginResponse.authResponse.code;
          connectStatusText.textContent = "Verifying your number…";
        } else {
          connectStatusText.textContent = "Connection was cancelled or didn't complete.";
          connectBtn.disabled = false;
          connectBtn.textContent = "Connect with Meta";
        }
      },
      {
        config_id: META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {} },
      }
    );
  });

  // Meta posts a message to the window during Embedded Signup carrying the
  // WABA ID and phone number ID once the business owner finishes verifying
  // their number. We combine that with the OAuth `code` from FB.login above,
  // then send both to our backend to complete the connection.
  let pendingSignupCode = null;

  window.addEventListener("message", async (event) => {
    if (!event.origin.endsWith("facebook.com")) return;

    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return; // not a JSON message we care about
    }

    if (data.type !== "WA_EMBEDDED_SIGNUP" || data.event !== "FINISH") return;

    const { waba_id: wabaId, phone_number_id: phoneNumberId } = data.data || {};

    if (!wabaId || !phoneNumberId) {
      connectStatusText.textContent = "Signup finished but some details were missing. Please try again.";
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect with Meta";
      return;
    }

    // Wait briefly for the FB.login code callback above to have set
    // pendingSignupCode if it hasn't already.
    for (let i = 0; i < 20 && !pendingSignupCode; i++) {
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!pendingSignupCode) {
      connectStatusText.textContent = "Could not complete verification. Please try again.";
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect with Meta";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/business/${state.businessId}/connect-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingSignupCode, wabaId, phoneNumberId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Connection failed.");

      state.whatsappNumber = phoneNumberId;
      state.whatsappConnected = true;

      connectStatusText.textContent = "Connected successfully";
      connectBox.style.borderStyle = "solid";
      connectBox.style.borderColor = "var(--teal)";
      connectBtn.textContent = "Connected";

      phoneManualGroup.style.display = "block";
      phoneManualInput.value = phoneNumberId;

      toStage3Btn.disabled = false;
    } catch (err) {
      console.error("connect-whatsapp failed:", err);
      connectStatusText.textContent = "Couldn't finish connecting. Make sure the backend is running and try again.";
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect with Meta";
    }
  });

  document.getElementById("toStage3").addEventListener("click", () => {
    if (!state.whatsappConnected) return;

    // TODO(backend): final confirmation call to your server to activate
    // the AI agent for this business (link generated prompt <-> phone number ID).

    const summaryList = document.getElementById("summaryList");
    summaryList.innerHTML = `
      <div><span>Business</span><span>${escapeHtml(state.businessName)}</span></div>
      <div><span>Type</span><span>${escapeHtml(state.businessType || "Not specified")}</span></div>
      <div><span>Contact</span><span>${escapeHtml(state.ownerContact)}</span></div>
      <div><span>WhatsApp number</span><span>${escapeHtml(state.whatsappNumber)}</span></div>
      <div><span>Status</span><span>Setting up…</span></div>
    `;

    // Show a preview of the AI system prompt Gemini generated, so the
    // business owner can see what their agent was built with.
    if (state.systemPrompt) {
      const promptPreview = document.createElement("div");
      promptPreview.style.textAlign = "left";
      promptPreview.style.marginTop = "20px";
      promptPreview.innerHTML = `
        <p style="font-size:0.82rem; font-weight:600; margin-bottom:8px;">Your AI agent's instructions (preview)</p>
        <pre style="white-space:pre-wrap; font-family:var(--font-mono); font-size:0.76rem; background:var(--base); border:1px solid var(--line); border-radius:8px; padding:14px; max-height:220px; overflow-y:auto; color:var(--ink-soft); margin:0;">${escapeHtml(state.systemPrompt)}</pre>
      `;
      summaryList.after(promptPreview);
    }

    goToStage(3);
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

````

## File: `backend/package.json`
````json
{
  "name": "duka-ai-backend",
  "version": "1.0.0",
  "description": "Backend for Duka AI - generates WhatsApp AI system prompts via Gemini and will later handle WhatsApp webhooks + order export.",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}

````

## File: `backend/.env.example`
````bash
# Get a free key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# From your Meta App Dashboard > App Settings > Basic
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# From App Dashboard > WhatsApp > Embedded Signup Builder (the "config_id")
# This goes in the FRONTEND code (script.js), not here - listed here only
# as a reminder of where to find it.
# META_EMBEDDED_SIGNUP_CONFIG_ID=your_config_id

# Graph API version to call (check developers.facebook.com for the latest)
GRAPH_API_VERSION=v21.0

# Any secret string you make up yourself - Meta echoes it back during
# webhook verification to confirm you control this server. Also enter
# this same value in the Meta App Dashboard's webhook config.
META_WEBHOOK_VERIFY_TOKEN=choose_your_own_secret_string

# Port the backend server runs on
PORT=3000

# Comma-separated list of origins allowed to call this API (your frontend's URL)
ALLOWED_ORIGIN=http://localhost:5500

````

## File: `backend/server.js`
````javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { generateSystemPrompt, generateReply } = require("./services/geminiService");
const { createBusiness, getBusiness, findByPhoneNumberId, attachWhatsappNumber } = require("./services/businessStore");
const { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba } = require("./services/metaService");
const { sendTextMessage } = require("./services/whatsappService");
const { getHistory, appendTurn } = require("./services/conversationStore");
const { addOrder, getOrders } = require("./services/orderStore");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

/* ------------------------------------------------------------------
   Health check
   ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------------------------------------------------------
   POST /api/generate-prompt
   Body: { businessName, businessType, ownerContact, description }
   -> generates the WhatsApp AI system prompt via Gemini,
      stores it against a new business record, and returns both.
   ------------------------------------------------------------------ */
app.post("/api/generate-prompt", async (req, res) => {
  const { businessName, businessType, ownerContact, description } = req.body || {};

  if (!businessName || !description) {
    return res.status(400).json({
      error: "businessName and description are required.",
    });
  }

  try {
    const systemPrompt = await generateSystemPrompt({ businessName, businessType, description });

    const business = createBusiness({
      businessName,
      businessType,
      ownerContact,
      description,
      systemPrompt,
    });

    res.json({
      businessId: business.id,
      systemPrompt: business.systemPrompt,
    });
  } catch (err) {
    console.error("generate-prompt failed:", err.message);
    res.status(502).json({
      error: "Could not generate the AI prompt right now. Please try again.",
      detail: err.message,
    });
  }
});

/* ------------------------------------------------------------------
   GET /api/business/:id
   -> fetch a stored business record (used for debugging / step 3 summary)
   ------------------------------------------------------------------ */
app.get("/api/business/:id", (req, res) => {
  const business = getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json(business);
});

/* ------------------------------------------------------------------
   POST /api/business/:id/connect-whatsapp
   Body: { code, wabaId, phoneNumberId }
     - `code`: the short-lived code the frontend got back from
        FB.login() when Embedded Signup completed
     - `wabaId`, `phoneNumberId`: captured from the postMessage event
        Meta sends to the frontend during the same flow

   This completes the REAL Embedded Signup handshake:
     1. Exchange the code for a business access token
     2. Register the phone number for Cloud API use
     3. Subscribe your app to the business's WABA (so webhooks start
        flowing once the webhook endpoint from the next build step exists)
     4. Store everything against the business record
   ------------------------------------------------------------------ */
app.post("/api/business/:id/connect-whatsapp", async (req, res) => {
  const { code, wabaId, phoneNumberId } = req.body || {};

  if (!code || !wabaId || !phoneNumberId) {
    return res.status(400).json({ error: "code, wabaId, and phoneNumberId are all required." });
  }

  const business = getBusiness(req.params.id);
  if (!business) {
    return res.status(404).json({ error: "Business not found." });
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    await registerPhoneNumber({ phoneNumberId, accessToken });
    await subscribeAppToWaba({ wabaId, accessToken });

    const updated = attachWhatsappNumber(req.params.id, { phoneNumberId, wabaId, accessToken });

    res.json({
      businessId: updated.id,
      whatsappConnected: true,
      whatsappPhoneNumberId: updated.whatsappPhoneNumberId,
    });
  } catch (err) {
    console.error("connect-whatsapp failed:", err.message);
    res.status(502).json({
      error: "Could not connect WhatsApp right now. Please try again.",
      detail: err.message,
    });
  }
});

/* ====================================================================
   This is the piece that actually receives customer messages.

   IMPORTANT: Meta requires a public HTTPS URL with a valid (non
   self-signed) certificate — plain localhost will NOT work. For local
   testing, run this server, then expose it with a tool like ngrok
   (e.g. `ngrok http 3000`) and use the ngrok HTTPS URL + "/webhook" as
   your callback URL in the Meta App Dashboard.
   ==================================================================== */

// Simple in-memory dedup so retried/duplicate webhook deliveries
// (WhatsApp sends "at-least-once") don't get processed twice.
const processedMessageIds = new Set();

/* --------------------------------------------------------------------
   GET /webhook
   Meta calls this once when you save your webhook config, to confirm
   you control this URL. Must echo back hub.challenge if the verify
   token matches.
   -------------------------------------------------------------------- */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/* --------------------------------------------------------------------
   POST /webhook
   Meta calls this for every incoming message / status update.

   Best practice: respond 200 immediately, then process afterward, so
   a slow AI reply never causes Meta to time out and retry the delivery.
   -------------------------------------------------------------------- */
app.post("/webhook", (req, res) => {
  res.sendStatus(200); // acknowledge immediately, per Meta's guidance

  handleIncomingWebhook(req.body).catch((err) => {
    console.error("Error processing webhook payload:", err);
  });
});

async function handleIncomingWebhook(payload) {
  const entries = payload?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];

    for (const change of changes) {
      const value = change?.value;
      if (!value || !Array.isArray(value.messages)) continue; // e.g. status updates, skip

      const phoneNumberId = value.metadata?.phone_number_id;
      const business = findByPhoneNumberId(phoneNumberId);

      if (!business) {
        console.warn(`No business found for phone_number_id ${phoneNumberId} - ignoring message.`);
        continue;
      }

      for (const message of value.messages) {
        if (processedMessageIds.has(message.id)) continue; // duplicate delivery, skip
        processedMessageIds.add(message.id);

        if (message.type !== "text") continue; // MVP: handle text only for now

        await handleCustomerMessage({
          business,
          customerWaId: message.from,
          messageText: message.text?.body || "",
        });
      }
    }
  }
}

async function handleCustomerMessage({ business, customerWaId, messageText }) {
  try {
    const history = getHistory(business.id, customerWaId);

    const replyText = await generateReply({
      systemPrompt: business.systemPrompt,
      history,
      customerMessage: messageText,
    });

    // Update conversation history with both sides of this exchange
    appendTurn(business.id, customerWaId, "user", messageText);
    appendTurn(business.id, customerWaId, "model", replyText);

    // Detect a finalized order in the AI's reply (matches the
    // "ORDER_CONFIRMED:" instruction baked into the generated system prompt)
    const orderMatch = replyText.match(/ORDER_CONFIRMED:\s*(.+)/i);
    if (orderMatch) {
      addOrder(business.id, { raw: orderMatch[1].trim(), customerWaId });
      console.log(`Order detected for business ${business.id}: ${orderMatch[1].trim()}`);
    }

    await sendTextMessage({
      phoneNumberId: business.whatsappPhoneNumberId,
      accessToken: business.whatsappAccessToken,
      to: customerWaId,
      body: replyText,
    });
  } catch (err) {
    console.error(`Failed to handle message for business ${business.id}:`, err.message);
    // In production: alert the business owner / retry / fall back to a
    // generic "we'll get back to you" message here instead of failing silently.
  }
}

/* ------------------------------------------------------------------
   GET /api/business/:id/orders
   Preview of orders detected so far for this business. The next
   build step (Excel/Sheets export) will turn this into a downloadable
   spreadsheet instead of raw JSON.
   ------------------------------------------------------------------ */
app.get("/api/business/:id/orders", (req, res) => {
  const business = getBusiness(req.params.id);
  if (!business) return res.status(404).json({ error: "Business not found." });
  res.json({ businessId: business.id, orders: getOrders(business.id) });
});

app.listen(PORT, () => {
  console.log(`Duka AI backend running at http://localhost:${PORT}`);
});

````

## File: `backend/services/geminiService.js`
````javascript
/**
 * geminiService.js
 * ------------------------------------------------------------------
 * Turns a business owner's raw description into a complete, ready-to-use
 * WhatsApp AI system prompt, using Gemini's free-tier API.
 *
 * Model: gemini-2.5-flash (fast, cheap, generous free tier as of 2026)
 * Docs: https://ai.google.dev/gemini-api/docs
 * ------------------------------------------------------------------
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * The meta-prompt: instructions telling Gemini HOW to write the
 * business's WhatsApp AI system prompt. This is the piece you'll
 * want to tune the most as you learn what makes a good agent.
 */
function buildMetaPrompt({ businessName, businessType, description }) {
  return `You are an expert at writing system prompts for WhatsApp customer-service AI agents used by small businesses in Kenya.

Given the business details below, write a COMPLETE system prompt that will be used to power a WhatsApp AI agent for this business. The system prompt you write must:

1. Open by telling the AI which business it represents and what it sells/does.
2. Define the tone of voice to use (friendly, professional, matching how the owner described talking to customers). Support natural mixing of English and Swahili if the business description suggests that.
3. List the concrete facts the AI must know: products/services, prices, delivery areas/fees, working hours, and any FAQs implied by the description.
4. Give clear instructions for taking orders: what details to collect (item, quantity, size/variant if relevant, customer name, delivery location, phone number), and to confirm the order back to the customer before finalizing it.
5. Instruct the AI to output a clearly-marked structured order block (e.g. a line starting with "ORDER_CONFIRMED:" followed by item, quantity, price, customer name, phone, delivery area) whenever an order is finalized, so a separate system can detect it and log it to a spreadsheet.
6. Instruct the AI on what to do when it doesn't know an answer (e.g. tell the customer a human will follow up, and flag it).
7. Keep replies short and natural, the way a real shop attendant would text on WhatsApp - not long paragraphs.

Business name: ${businessName}
Business type: ${businessType || "Not specified"}
Business description (in the owner's own words): """${description}"""

Write ONLY the final system prompt text, ready to paste directly into an AI agent's configuration. Do not include any preamble, explanation, or markdown formatting/backticks around it.`;
}

/**
 * Calls Gemini to generate the WhatsApp AI system prompt.
 * @returns {Promise<string>} the generated system prompt
 */
async function generateSystemPrompt({ businessName, businessType, description }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  const metaPrompt = buildMetaPrompt({ businessName, businessType, description });

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: metaPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error("Gemini returned no usable text. Full response: " + JSON.stringify(data));
  }

  return generatedText.trim();
}

module.exports = { generateSystemPrompt, buildMetaPrompt, generateReply };

/**
 * Generates the AI's reply to a single incoming customer message, using
 * the business's stored system prompt plus recent conversation history
 * for context.
 *
 * @param {string} systemPrompt - this business's generated WhatsApp AI system prompt
 * @param {Array<{role: "user"|"model", text: string}>} history - prior turns, oldest first
 * @param {string} customerMessage - the new incoming message text
 * @returns {Promise<string>} the AI's reply text
 */
async function generateReply({ systemPrompt, history = [], customerMessage }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  const contents = [
    ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    { role: "user", parts: [{ text: customerMessage }] },
  ];

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error("Gemini returned no usable reply. Full response: " + JSON.stringify(data));
  }

  return replyText.trim();
}

````

## File: `backend/services/businessStore.js`
````javascript
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

````

## File: `backend/services/metaService.js`
````javascript
/**
 * metaService.js
 * ------------------------------------------------------------------
 * Handles the backend half of Meta's Embedded Signup flow:
 *   1. Exchange the short-lived "code" returned by the frontend for
 *      an access token (OAuth code exchange).
 *   2. Register the business's phone number for Cloud API use.
 *   3. (Optional but recommended) Subscribe your app to that WABA's
 *      webhooks so you start receiving messages.
 *
 * Docs:
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration
 * ------------------------------------------------------------------
 */

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Step 1: exchange the Embedded Signup "code" for a business access token.
 * This code comes from the frontend after FB.login() completes.
 */
async function exchangeCodeForToken(code) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET are not set in .env");
  }

  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  // data.access_token is the business token you use for all subsequent
  // calls on behalf of this business's WABA.
  return data.access_token;
}

/**
 * Step 2: register the verified phone number for Cloud API use.
 * A 6-digit PIN is required by Meta for two-step verification on the number.
 */
async function registerPhoneNumber({ phoneNumberId, accessToken, pin = "123456" }) {
  const url = `${GRAPH_BASE}/${phoneNumberId}/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      pin,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Phone number registration failed: ${JSON.stringify(data)}`);
  }

  return data; // { success: true } on success
}

/**
 * Step 3 (optional, do this once per WABA): subscribe your app to the
 * business's WABA so incoming messages start hitting your webhook.
 */
async function subscribeAppToWaba({ wabaId, accessToken }) {
  const url = `${GRAPH_BASE}/${wabaId}/subscribed_apps`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`App subscription to WABA failed: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = { exchangeCodeForToken, registerPhoneNumber, subscribeAppToWaba };

````

## File: `backend/services/whatsappService.js`
````javascript
/**
 * whatsappService.js
 * ------------------------------------------------------------------
 * Sends outbound WhatsApp messages via the Cloud API, on behalf of a
 * connected business (using their own phone number ID + access token
 * captured during Embedded Signup in metaService.js).
 *
 * Docs: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
 * ------------------------------------------------------------------
 */

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Sends a plain text reply to a customer.
 * @param {string} phoneNumberId - the BUSINESS's WhatsApp phone number ID (not the customer's)
 * @param {string} accessToken - that business's access token from Embedded Signup
 * @param {string} to - the customer's WhatsApp ID (their phone number, no "+")
 * @param {string} body - the reply text
 */
async function sendTextMessage({ phoneNumberId, accessToken, to, body }) {
  const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Sending WhatsApp message failed: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = { sendTextMessage };

````

## File: `backend/services/conversationStore.js`
````javascript
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

````

## File: `backend/services/orderStore.js`
````javascript
/**
 * orderStore.js
 * ------------------------------------------------------------------
 * TEMPORARY in-memory log of detected orders, per business.
 * The NEXT build step (Excel/Sheets export) will read from this same
 * store, so the shape here is designed to map cleanly onto spreadsheet
 * rows later.
 * ------------------------------------------------------------------
 */

const orders = new Map(); // businessId -> array of order records

function addOrder(businessId, orderData) {
  const list = orders.get(businessId) || [];
  const record = {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    receivedAt: new Date().toISOString(),
    raw: orderData.raw, // the full text the AI produced after "ORDER_CONFIRMED:"
    customerWaId: orderData.customerWaId,
  };
  list.push(record);
  orders.set(businessId, list);
  return record;
}

function getOrders(businessId) {
  return orders.get(businessId) || [];
}

module.exports = { addOrder, getOrders };

````

## File: `backend/README.md`
````markdown
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


````

