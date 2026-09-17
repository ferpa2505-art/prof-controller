const CACHE = 'prof-controller-v36'; // SEMPRE incremente ao publicar mudanças
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=36',
  './app.js?v=36',
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

// Notificações push do navegador
self.addEventListener('push', (e) => {
  console.log('[Service Worker] Push recebido:', e.data);
  
  if (e.data) {
    try {
      const data = e.data.json();
      const title = data.title || 'ProF Controller';
      const options = {
        body: data.body || 'Nova notificação',
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/icon-192.png',
        tag: data.tag || 'prof-notification',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {}
      };

      e.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.error('[Service Worker] Erro ao processar push:', err);
    }
  }
});

self.addEventListener('notificationclick', (e) => {
  console.log('[Service Worker] Notificação clicada:', e.notification.tag);
  e.notification.close();
  
  if (e.notification.data && e.notification.data.url) {
    e.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === e.notification.data.url) {
            return client.focus();
          }
        }
        return clients.openWindow(e.notification.data.url);
      })
    );
  }
});

self.addEventListener('notificationclose', (e) => {
  console.log('[Service Worker] Notificação fechada:', e.notification.tag);
});
