/**
 * sw.js — Admin panel service worker
 * ------------------------------------------------------------------
 * Caches the static app shell (HTML/CSS/JS/icons) so the dashboard's
 * layout loads instantly and works offline. API calls (/api/...) are
 * deliberately NEVER cached - this is a live operations dashboard, so
 * data must always be fresh from the network, never served stale.
 * ------------------------------------------------------------------
 */

const CACHE_NAME = "duka-admin-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./admin.css",
  "./admin.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls - always go to the network for live data.
  if (url.pathname.startsWith("/api/")) {
    return; // let the browser handle it normally
  }

  // Cache-first for the static shell, falling back to network.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
