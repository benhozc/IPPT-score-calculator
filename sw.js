// Keeps the calculator available offline.
// Serves the saved copy instantly, then quietly fetches the latest version in the background,
// so an update you upload shows up the next time the app is opened.
const CACHE = "ippt-calculator";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const key = req.mode === "navigate" ? "./index.html" : req;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(req).then((res) => {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) { event.waitUntil(network); return cached; }
    return network;
  }));
});
