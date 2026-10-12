// Proxy de notícias do ProF Controller — Cloudflare Worker (plano grátis: 100 mil pedidos/dia).
//
// Para quê: no navegador (site e app da Microsoft Store) o Google Notícias não pode ser
// lido direto (CORS) e recusa o rss2json. Este Worker busca o RSS e devolve com CORS liberado
// SÓ para o seu site. No Android/iOS/Electron ele não é usado (lá a leitura é direta).
//
// Não guarda nada, não registra nada: repassa o feed e pronto.
//
// Como publicar (uma vez, ~5 min): veja docs/PROXY-NOTICIAS.md

const ORIGENS = ['https://ferpa2505-art.github.io'];
const HOSTS = ['news.google.com'];

export default {
  async fetch(request) {
    const origem = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGENS.includes(origem) ? origem : ORIGENS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'GET') return new Response('Método não permitido', { status: 405, headers: cors });

    const alvo = new URL(request.url).searchParams.get('url') || '';
    let u;
    try { u = new URL(alvo); } catch { return new Response('URL inválida', { status: 400, headers: cors }); }
    if (u.protocol !== 'https:' || !HOSTS.includes(u.hostname)) return new Response('Host não permitido', { status: 403, headers: cors });

    const res = await fetch(u.href, {
      headers: { 'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.5', 'User-Agent': 'Mozilla/5.0 (ProF Controller news proxy)' },
      cf: { cacheTtl: 900, cacheEverything: true }, // 15 min de cache na borda: menos pedidos ao Google
    });
    const corpo = await res.text();
    return new Response(corpo, {
      status: res.status,
      headers: { ...cors, 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' },
    });
  },
};
