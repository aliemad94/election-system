// PWA Service Worker — Election Machine Offline Support
const CACHE = "election-machine-v1";
const ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install: cache core assets
self.addEventListener("install", (event) => {
  (event as any).waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  (event as any).waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// Fetch: network-first for data API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const req = (event as FetchEvent).request;
  const url = new URL(req.url);

  // API calls: network-only (real-time data matters)
  if (url.pathname.startsWith("/api/")) {
    return; // let browser handle normally
  }

  // Static assets: network-first with cache fallback
  (event as any).respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
