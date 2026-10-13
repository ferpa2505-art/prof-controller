// ProF Controller — service worker
//
// A versão do cache e a lista de arquivos são preenchidas AUTOMATICAMENTE pelo
// script de build (scripts/build-www.mjs) a cada publicação. Não é mais preciso
// incrementar a versão à mão: qualquer mudança em qualquer arquivo gera um
// BUILD_ID novo, o navegador instala o service worker novo e apaga o cache velho.
//
// Rodando direto da raiz do repositório (desenvolvimento), os valores abaixo
// ficam como estão e o app funciona normalmente, só sem o pré-cache completo.

const BUILD_ID = 'dev'; /*__BUILD_ID__*/
const ASSETS = ['./', './index.html', './manifest.json']; /*__ASSETS__*/

const CACHE = 'prof-controller-' + BUILD_ID;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('prof-controller') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// O HTML pede os arquivos com "?v=N" no fim. O pré-cache guarda sem o "?v=".
// ignoreSearch faz os dois baterem, então o app abre offline já na primeira vez.
const match = (req) => caches.match(req, { ignoreSearch: true });

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Outros domínios (cotações, câmbio, notícias) passam direto, sem cache:
  // taxa financeira antiga é pior do que taxa nenhuma.
  if (new URL(e.request.url).origin !== self.location.origin) return;

  // Página principal: rede primeiro, cache só como reserva (sem internet).
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', clone));
          }
          return res;
        })
        .catch(() => match('./index.html'))
    );
    return;
  }

  // Desenvolvimento (rodando da raiz, sem build): sempre rede primeiro, para
  // nunca servir CSS/JS velho enquanto você edita.
  if (BUILD_ID === 'dev') {
    e.respondWith(fetch(e.request).catch(() => match(e.request)));
    return;
  }

  // Demais arquivos do app: cache primeiro (é a versão desta publicação),
  // rede como reserva para algo que ficou fora da lista.
  e.respondWith(
    match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      if (res && res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return res;
    }))
  );
});

// Notificações enviadas pelo próprio app (lembretes de vencimento etc.)
self.addEventListener('push', (e) => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    e.waitUntil(self.registration.showNotification(data.title || 'ProF Controller', {
      body: data.body || '',
      icon: data.icon || 'icon-192.png',
      badge: data.badge || 'icon-192.png',
      tag: data.tag || 'prof-notification',
      requireInteraction: !!data.requireInteraction,
      data: data.data || {}
    }));
  } catch (err) {
    console.error('[SW] push inválido:', err);
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const requestedUrl = (e.notification.data && e.notification.data.url) || './';
  let url = './';
  try {
    const parsed = new URL(requestedUrl, self.location.href);
    if (parsed.origin === self.location.origin) url = parsed.href;
  } catch {}
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return clients.openWindow(url);
    })
  );
});
