/* ============================================================
   ProF Controller — Service Worker
   ------------------------------------------------------------
   COMO PUBLICAR UMA ATUALIZAÇÃO:
   1) Suba a VERSION abaixo em +1
   2) Commit / deploy normal
   Nada mais precisa ser alterado — o cache antigo é apagado sozinho.
   ============================================================ */

const VERSION = 29; // <<< INCREMENTE SOMENTE AQUI ao publicar mudanças

const CACHE = `prof-controller-v${VERSION}`;

// Assets pré-cacheados (sem ?v= — o versionamento é feito pelo CACHE acima)
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* ---------------- INSTALL ---------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          // cache: 'reload' ignora o cache HTTP do navegador.
          // Cada asset falha isolado: um 404 não derruba a instalação toda.
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] Não foi possível pré-cachear:', url, err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

/* ---------------- ACTIVATE ---------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/* ---------------- FETCH ---------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só tratamos GET
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Fora do nosso domínio (APIs de câmbio, cotações, Google News, etc.):
  // passa direto, sem cache. Dado financeiro antigo é pior que dado nenhum.
  if (url.origin !== self.location.origin) return;

  const isAppJs = url.pathname.endsWith('/app.js');

  // Navegação (index.html) e app.js -> REDE PRIMEIRO, cache como fallback
  if (request.mode === 'navigate' || isAppJs) {
    event.respondWith(
      networkFirst(request, request.mode === 'navigate' ? './index.html' : null)
    );
    return;
  }

  // Demais assets (CSS, ícones, manifest) -> CACHE PRIMEIRO + atualização em bg
  event.respondWith(cacheFirst(normalizeKey(request)));
});

/* ---------------- ESTRATÉGIAS ---------------- */

// Uma única chave por arquivo, ignorando parâmetros de query (?v=...).
function normalizeKey(request) {
  const u = new URL(request.url);
  u.search = '';
  return u.toString();
}

// Rede primeiro; em caso de falha, usa o cache (e o fallback informado).
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return offlineResponse();
  }
}

// Cache primeiro; dispara atualização em segundo plano (stale-while-revalidate).
async function cacheFirst(key) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(key);

  const update = fetch(key)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(key, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;

  const fresh = await update;
  if (fresh) return fresh;

  return offlineResponse();
}

function offlineResponse() {
  return new Response(
    'Você está offline e este recurso ainda não foi baixado.',
    {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    }
  );
}

/* ---------------- MENSAGENS ---------------- */
// Permite forçar atualização do SW a partir da página, se precisar.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
