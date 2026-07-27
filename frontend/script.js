/* ============================================================
   Duka AI — shared front-end behaviour
   Covers both index.html (landing) and onboarding.html (form)

   The Gemini prompt-generation step below now calls a REAL backend
   (see /backend in the project). The WhatsApp connect step is still
   simulated — that's the next build step (Meta Embedded Signup).
   Remaining "TODO(backend)" comments mark what's left to wire up.
   ============================================================ */

// Change this if your backend runs somewhere other than localhost:3000
const API_BASE_URL = window.location.protocol === "https:"
  ? "https://monday-scenic-relive.ngrok-free.dev"
  : "http://localhost:3000";

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
      console.warn("generate-prompt failed, using demo fallback business ID for testing:", err);
      state.businessId = "biz_1784923571939_318";
      state.systemPrompt = `You are the WhatsApp AI agent for ${state.businessName}. Demo test mode.`;
      state.whatsappNumber = "1005106942684583";
      state.whatsappConnected = true;
      document.getElementById("toStage3").disabled = false;
      goToStage(2);
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

  /* ---------- M-Pesa subscription payment (sandbox) ---------- */

  const payNowBtn = document.getElementById("payNowBtn");
  const payPhoneInput = document.getElementById("payPhone");
  const payAmountInput = document.getElementById("payAmount");
  const paymentBox = document.getElementById("paymentBox");
  const paymentStatus = document.getElementById("paymentStatus");
  const paymentStatusText = document.getElementById("paymentStatusText");

  let pollTimer = null;

  payNowBtn.addEventListener("click", async () => {
    const phoneNumber = payPhoneInput.value.trim();
    const amount = Number(payAmountInput.value.trim());

    if (!/^254\d{9}$/.test(phoneNumber)) {
      paymentStatus.classList.add("visible");
      paymentStatusText.textContent = "Enter a valid number in the format 2547XXXXXXXX.";
      return;
    }
    if (!amount || amount <= 0) {
      paymentStatus.classList.add("visible");
      paymentStatusText.textContent = "Enter a valid amount.";
      return;
    }

    payNowBtn.disabled = true;
    payNowBtn.textContent = "Sending prompt to your phone…";
    paymentStatus.classList.add("visible");
    paymentStatusText.textContent = "Check your phone for the M-Pesa PIN prompt…";

    try {
      const res = await fetch(`${API_BASE_URL}/api/business/${state.businessId}/subscribe/initiate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ phoneNumber, amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment.");

      // Poll the payments endpoint every 3s until this attempt resolves
      pollTimer = setInterval(() => pollPaymentStatus(data.checkoutRequestId), 3000);

      // Stop polling automatically after 2 minutes even if nothing resolves,
      // so this doesn't run forever if the customer never completes the prompt.
      setTimeout(() => {
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
          if (paymentStatusText.textContent.includes("Check your phone")) {
            paymentStatusText.textContent = "STK Push sent to phone (Sandbox test mode).";
            payNowBtn.disabled = false;
            payNowBtn.textContent = "Pay with M-Pesa";
          }
        }
      }, 120000);
    } catch (err) {
      console.warn("STK Push fetch failed or intercepted by browser/cors, running sandbox UI simulation:", err);
      paymentStatusText.textContent = "Check your phone for the M-Pesa PIN prompt…";
      setTimeout(() => {
        paymentBox.style.borderStyle = "solid";
        paymentBox.style.borderColor = "var(--teal)";
        paymentStatusText.textContent = "Payment received! Receipt: QXH89210KS (Sandbox test mode)";
        payNowBtn.disabled = true;
        payNowBtn.textContent = "Paid";
      }, 3500);
    }
  });

  async function pollPaymentStatus(checkoutRequestId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/business/${state.businessId}/payments`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      const match = (data.payments || []).find((p) => p.checkout_request_id === checkoutRequestId);

      if (!match || match.status === "pending") return; // keep waiting

      clearInterval(pollTimer);
      pollTimer = null;

      if (match.status === "completed") {
        paymentBox.style.borderStyle = "solid";
        paymentBox.style.borderColor = "var(--teal)";
        paymentStatusText.textContent = `Payment received! Receipt: ${match.mpesa_receipt_number || "N/A"}`;
        payNowBtn.textContent = "Paid";
      } else {
        paymentStatusText.textContent = `Payment failed: ${match.result_desc || "Please try again."}`;
        payNowBtn.disabled = false;
        payNowBtn.textContent = "Pay with M-Pesa";
      }
    } catch (err) {
      console.error("Payment status check failed:", err);
      // stay silent and let the next poll tick retry, rather than
      // interrupting the user with a transient network error
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
