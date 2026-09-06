/**
 * sw.js — Admin panel service worker
 * ------------------------------------------------------------------
 * Caches the static app shell (HTML/CSS/JS/icons) so the dashboard's
 * layout loads instantly and works offline. API calls (/api/...) are
 * deliberately NEVER cached — this is a live operations dashboard, so
 * data must always be fresh from the network, never served stale.
 *
 * CACHE STRATEGY: Network-first for HTML (so updates deploy instantly),
 * Cache-first for CSS/JS/icons (fast load after first visit).
 * Bump CACHE_VERSION any time you deploy a breaking change to admin.js
 * or admin.css — old caches are automatically deleted on activate.
 * ------------------------------------------------------------------
 */

const CACHE_VERSION = "v3"; // ← bump this on every significant deploy
const CACHE_NAME = `duka-admin-shell-${CACHE_VERSION}`;

const SHELL_FILES = [
  "./index.html",
  "./admin.css",
  "./admin.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

/* ---------- INSTALL: pre-cache all shell files ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

/* ---------- ACTIVATE: delete every old cache ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

/* ---------- FETCH ---------- */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Never cache API calls — always live network.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 2. Network-first for HTML so new deployments take effect immediately.
  //    Falls back to cache only when offline.
  if (url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/admin/")) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          const cloned = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Cache-first for static assets (CSS, JS, icons).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkRes) => {
        const cloned = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return networkRes;
      });
    })
  );
});
