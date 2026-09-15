const CACHE = 'prof-controller-v21'; // SEMPRE incremente ao publicar mudanças
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=21',
  './app.js?v=21',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Requisições para outros domínios (ex.: API de câmbio) passam direto,
  // sem cache: taxa financeira antiga é pior do que taxa nenhuma.
  if (new URL(e.request.url).origin !== self.location.origin) return;

  // Página principal e app.js: REDE PRIMEIRO, cache só como fallback
  if (e.request.mode === 'navigate' || e.request.url.includes('/app.js')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Demais assets (css, ícones, manifest): cache primeiro, atualiza em segundo plano
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
