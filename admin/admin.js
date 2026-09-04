/**
 * admin.js — Duka AI Admin Dashboard
 * ------------------------------------------------------------------
 * Talks to the /api/admin/* routes built and tested in the backend.
 * Every response shape here matches what those routes actually return
 * (verified during backend testing), not guessed.
 * ------------------------------------------------------------------
 */

// Matches current hostname (localhost vs 127.0.0.1) to prevent Private Network Access restrictions
const API_BASE_URL =
  window.location.port === "3000"
    ? ""
    : window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://duka-ai-backend.onrender.com";

const REFRESH_INTERVAL_MS = 30000; // auto-refresh every 30s

let adminKey = localStorage.getItem("dukaAdminKey") || "";
let refreshTimer = null;
let revenueChart = null;
let tokenChart = null;
let lastAuthError = "";

document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  wireLoginForm();

  if (adminKey) {
    tryEnterDashboard();
  }
});

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  }
}

/* ============================================================
   AUTH
   ============================================================ */

function wireLoginForm() {
  const input = document.getElementById("adminKeyInput");
  const btn = document.getElementById("loginBtn");
  const error = document.getElementById("loginError");

  const attempt = async () => {
    const key = input.value.trim();
    if (!key) return;

    btn.disabled = true;
    btn.textContent = "Checking…";
    error.classList.remove("visible");

    adminKey = key;
    const ok = await tryEnterDashboard();

    if (!ok) {
      if (lastAuthError === "NETWORK_ERROR") {
        error.textContent = "Cannot reach backend. Make sure the server is running.";
      } else {
        error.textContent = "That key isn't correct. Check it and try again.";
      }
      error.classList.add("visible");
      adminKey = "";
      localStorage.removeItem("dukaAdminKey");
    }

    btn.disabled = false;
    btn.textContent = "View dashboard";
  };

  btn.addEventListener("click", attempt);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attempt();
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("dukaAdminKey");
    adminKey = "";
    if (refreshTimer) clearInterval(refreshTimer);
    document.getElementById("app").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminKeyInput").value = "";
  });

  document.getElementById("refreshBtn").addEventListener("click", () => loadDashboard());
}

async function apiGet(path) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "x-admin-key": adminKey },
    });
  } catch (netErr) {
    lastAuthError = "NETWORK_ERROR";
    throw new Error("NETWORK_ERROR");
  }

  if (res.status === 401) {
    lastAuthError = "UNAUTHORIZED";
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  lastAuthError = "";
  return res.json();
}

async function tryEnterDashboard() {
  try {
    await apiGet("/api/admin/stats");
    localStorage.setItem("dukaAdminKey", adminKey);
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadDashboard();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(loadDashboard, REFRESH_INTERVAL_MS);
    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
}

/* ============================================================
   DATA LOADING
   ============================================================ */

async function loadDashboard() {
  try {
    const results = await Promise.allSettled([
      apiGet("/api/admin/stats"),
      apiGet("/api/admin/businesses"),
      apiGet("/api/admin/payments"),
      apiGet("/api/admin/revenue-by-day"),
      apiGet("/api/admin/activity"),
      apiGet("/api/admin/token-usage"),
      apiGet("/api/admin/openrouter-credits"),
    ]);

    const [statsRes, bizRes, payRes, revRes, actRes, tokRes, credRes] = results;

    // Check for 401 unauthorized
    const unauthorized = results.find(
      (r) => r.status === "rejected" && r.reason && r.reason.message === "UNAUTHORIZED"
    );
    if (unauthorized) {
      localStorage.removeItem("dukaAdminKey");
      adminKey = "";
      if (refreshTimer) clearInterval(refreshTimer);
      document.getElementById("app").style.display = "none";
      document.getElementById("loginScreen").style.display = "flex";
      return;
    }

    if (statsRes.status === "fulfilled") renderStats(statsRes.value);
    if (bizRes.status === "fulfilled") renderBusinesses(bizRes.value.businesses || []);
    if (payRes.status === "fulfilled") renderPayments(payRes.value.payments || []);

    // Always update ticker — never leave stuck on 'Loading recent activity…'
    if (actRes.status === "fulfilled") {
      renderTicker(actRes.value.activity || []);
    } else {
      renderTicker([]);
    }

    if (credRes.status === "fulfilled") {
      renderCredits(credRes.value);
    } else {
      renderCredits(null);
    }

    if (revRes.status === "fulfilled") renderRevenueChart(revRes.value.revenue || []);
    if (tokRes.status === "fulfilled") renderTokenUsage(tokRes.value);

    const failedCount = results.filter((r) => r.status === "rejected").length;
    if (failedCount === 0) {
      document.getElementById("lastUpdatedText").textContent =
        "Updated " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else if (failedCount === results.length) {
      document.getElementById("lastUpdatedText").textContent = "Couldn't refresh — check backend is running.";
    } else {
      document.getElementById("lastUpdatedText").textContent =
        "Updated " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
  } catch (err) {
    console.error("Dashboard load failed:", err);
    document.getElementById("lastUpdatedText").textContent = "Couldn't refresh — check backend is running.";
  }
}

/* ============================================================
   RENDERING
   ============================================================ */

function formatKES(amount) {
  return "KES " + Number(amount).toLocaleString("en-KE", { maximumFractionDigits: 0 });
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderStats(stats) {
  document.getElementById("statTotalBusinesses").textContent = stats.totalBusinesses;
  document.getElementById("statConnected").textContent = stats.connectedBusinesses;
  document.getElementById("statOrders").textContent = stats.totalOrders;
  document.getElementById("statRevenue").textContent = formatKES(stats.totalRevenue);

  document.getElementById("statPaymentsSummary").textContent = stats.paymentsCompleted + " completed";
  document.getElementById("statPaymentsBreakdown").textContent =
    `${stats.paymentsPending} pending · ${stats.paymentsFailed} failed`;
}

function statusBadge(status) {
  const map = {
    completed: ["green", "Completed"],
    active: ["green", "Active"],
    pending: ["amber", "Pending"],
    trialing: ["amber", "Trialing"],
    failed: ["red", "Failed"],
    past_due: ["red", "Past due"],
    canceled: ["neutral", "Canceled"],
  };
  const [tone, label] = map[status] || ["neutral", status];
  return `<span class="badge ${tone}"><span class="badge-dot"></span>${label}</span>`;
}

function renderBusinesses(businesses) {
  const tbody = document.getElementById("businessesTableBody");
  document.getElementById("businessesCount").textContent = businesses.length;

  if (businesses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="panel-empty">No businesses yet. New signups will show up here as soon as they connect.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = businesses
    .map(
      (b) => `
    <tr>
      <td>${escapeHtml(b.business_name)}</td>
      <td>${escapeHtml(b.business_type || "—")}</td>
      <td>${b.whatsapp_connected ? statusBadge("active") : statusBadge("pending")}</td>
      <td class="num">${b.order_count}</td>
      <td class="num">${formatKES(b.total_paid)}</td>
      <td>${formatDate(b.created_at)}</td>
    </tr>`
    )
    .join("");
}

function renderPayments(payments) {
  const tbody = document.getElementById("paymentsTableBody");
  document.getElementById("paymentsCount").textContent = payments.length;

  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="panel-empty">No payments yet. Trial conversions and manual payments will appear here.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = payments
    .map(
      (p) => `
    <tr>
      <td>${escapeHtml(p.business_name)}</td>
      <td class="num">${formatKES(p.amount)}</td>
      <td>${statusBadge(p.status)}</td>
      <td class="mono">${p.mpesa_receipt_number || "—"}</td>
      <td>${formatDate(p.created_at)}</td>
    </tr>`
    )
    .join("");
}

function renderTokenUsage(tokenUsage) {
  const tbody = document.getElementById("tokenUsageTableBody");
  const perBusiness = tokenUsage.perBusiness || [];
  document.getElementById("tokenUsageCount").textContent = tokenUsage.total?.total_tokens
    ? Number(tokenUsage.total.total_tokens).toLocaleString() + " tokens total"
    : "";

  if (perBusiness.length === 0 || Number(tokenUsage.total?.call_count || 0) === 0) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="panel-empty">No AI usage yet.</div></td></tr>`;
  } else {
    tbody.innerHTML = perBusiness
      .filter((b) => Number(b.call_count) > 0)
      .map(
        (b) => `
      <tr>
        <td>${escapeHtml(b.business_name)}</td>
        <td class="num">${b.call_count}</td>
        <td class="num">${Number(b.total_tokens).toLocaleString()}</td>
      </tr>`
      )
      .join("");
  }

  // Token usage chart
  const daily = tokenUsage.daily || [];
  const ctx = document.getElementById("tokenChart");
  const labels = daily.map((d) => new Date(d.day).toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  const values = daily.map((d) => Number(d.total_tokens));

  if (typeof Chart !== "undefined") {
    if (tokenChart) tokenChart.destroy();
    tokenChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.length ? labels : ["No data yet"],
        datasets: [
          {
            data: values.length ? values : [0],
            backgroundColor: "#4F46E5",
            borderRadius: 3,
            maxBarThickness: 22,
          },
        ],
      },
      options: chartOptions(),
    });
  }
}

function renderRevenueChart(revenue) {
  const ctx = document.getElementById("revenueChart");
  const labels = revenue.map((r) => new Date(r.day).toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
  const values = revenue.map((r) => Number(r.total));

  if (typeof Chart !== "undefined") {
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length ? labels : ["No revenue yet"],
        datasets: [
          {
            data: values.length ? values : [0],
            borderColor: "#16A34A",
            backgroundColor: "rgba(22, 163, 74, 0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: chartOptions(),
    });
  }
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Mono", size: 10 }, color: "#5B6478" } },
      y: {
        grid: { color: "#DCE1EA" },
        ticks: { font: { family: "IBM Plex Mono", size: 10 }, color: "#5B6478" },
        beginAtZero: true,
      },
    },
  };
}

function renderTicker(activity) {
  const track = document.getElementById("tickerTrack");

  if (!activity || activity.length === 0) {
    track.innerHTML = `<span class="ticker-empty">No activity yet — new signups, orders, and payments will show up here live.</span>`;
    track.style.animation = "none";
    return;
  }

  const icons = { signup: "＋", order: "🛒", payment: "✓" };
  const items = activity.map((e) => `<span>${icons[e.type] || "•"} ${escapeHtml(e.text)}</span>`).join("");

  // Duplicate the content so the CSS scroll loop is seamless
  track.innerHTML = items + items;
  track.style.animation = "";
}

function renderCredits(credits) {
  const remainingEl = document.getElementById("balanceRemaining");
  const metaEl = document.getElementById("balanceMeta");

  if (!credits || credits.remaining === null || credits.remaining === undefined) {
    remainingEl.textContent = "—";
    metaEl.textContent = "Couldn't reach OpenRouter.";
    return;
  }

  remainingEl.textContent = "$" + Number(credits.remaining).toFixed(4);
  const usageParts = [];
  if (credits.usageDaily !== undefined) usageParts.push(`$${Number(credits.usageDaily).toFixed(4)} today`);
  if (credits.totalUsage !== undefined) usageParts.push(`$${Number(credits.totalUsage).toFixed(4)} all-time`);
  metaEl.textContent = usageParts.join(" · ");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
