(function(root, factory) {
  const policy = factory();
  if (typeof module === 'object' && module.exports) module.exports = policy;
  if (root) root.ProfNavigationPolicy = policy;
})(typeof globalThis === 'object' ? globalThis : this, function() {
  const APPROVED_HOSTS = new Set([
    'brapi.dev',
    'br.investing.com',
    'es.investing.com',
    'www.investing.com',
    'finnhub.io',
    'twelvedata.com',
    'finance.yahoo.com',
    'investidor10.com.br',
    'news.google.com',
    'infomoney.com.br',
    'www.investidor.b3.com.br',
    'github.com',
    'ferpa2505-art.github.io'
  ]);

  function parseUrl(value, baseUrl) {
    try {
      const url = new URL(String(value), baseUrl);
      return url.username || url.password ? null : url;
    } catch {
      return null;
    }
  }

  function isApprovedExternalUrl(value, baseUrl) {
    const url = parseUrl(value, baseUrl);
    return !!url && url.protocol === 'https:' && url.origin !== new URL(baseUrl).origin && APPROVED_HOSTS.has(url.hostname);
  }

  function sameOriginUrl(value, baseUrl, fallback = './') {
    const base = new URL(baseUrl);
    const safeFallback = new URL(fallback, base.href).href;
    if (typeof value !== 'string' || !value.trim()) return safeFallback;
    const url = parseUrl(value, base.href);
    if (url && /^https?:$/.test(url.protocol) && url.origin === base.origin) return url.href;
    return safeFallback;
  }

  return { isApprovedExternalUrl, sameOriginUrl };
});
