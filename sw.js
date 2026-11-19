// Service worker: работа без интернета. Меняйте VERSION при каждом обновлении сайта.
const VERSION = 'quiz-v1';
const CORE = ['./', 'index.html', 'manifest.json', 'favicon-32.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш, в фоне обновление (в том числе для библиотеки mammoth и шрифтов с CDN)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
      return hit || net;
    })
  );
});
