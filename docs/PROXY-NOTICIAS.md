# Notícias do Brasil e da Europa no navegador (proxy opcional)

**Situação:** as manchetes do Brasil, da Europa e as notícias por ativo vêm do Google Notícias.

| Versão | Como lê o Google Notícias | Funciona? |
|---|---|---|
| App Android / iOS | direto do aparelho (HTTP nativo) | sim |
| Windows (Electron) | direto, pelo processo principal | sim |
| Site e app da Microsoft Store | pelo rss2json | **instável**: o Google recusa o rss2json ("Internal error") |

As notícias dos EUA vêm da Finnhub e funcionam em todas as versões.

## Corrigir no navegador: proxy próprio no Cloudflare (grátis)

1. Crie conta em https://dash.cloudflare.com (grátis).
2. **Workers & Pages → Create → Create Worker** → nome `prof-noticias` → **Deploy**.
3. **Edit code** → apague tudo → cole o conteúdo de `proxy/news-worker.js` → **Deploy**.
4. Copie o endereço do Worker (ex.: `https://prof-noticias.SEU-USUARIO.workers.dev`).
5. Me mande esse endereço: eu coloco no app (constante `NEWS_PROXY_URL` em `app.js`).

O Worker só aceita pedidos do seu site e só para `news.google.com`, não guarda nada e faz
cache de 15 minutos. Ao ativá-lo, a política de privacidade ganha uma linha citando o Cloudflare.
