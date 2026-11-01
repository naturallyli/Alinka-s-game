// Garde une copie de Deutsch Party sur l'appareil pour qu'il marche sans internet.
// Augmenter VERSION à chaque mise à jour (nouveaux mots, etc.).
const VERSION = 'deutsch-v2';
const FILES = ['./', 'index.html', 'app.js', 'scenes.js', 'words.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('deutsch-') && k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// En ligne : prend la version la plus récente et en garde une copie. Hors ligne : utilise la copie.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
