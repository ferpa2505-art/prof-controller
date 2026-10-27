# ProF Controller — instruções para o Claude

Gestor de patrimônio pessoal multi-moeda, offline e 100% local (sem servidor, sem conta).
Dados financeiros do usuário ficam só no aparelho, com criptografia opcional (AES-GCM 256 + PBKDF2).
Dono: Luís Fernando. Responda em português do Brasil.

## Stack

- HTML/CSS/JS puro, sem framework e sem bundler. Não introduza React, TypeScript ou bundler.
- PWA publicada no GitHub Pages; Android/iOS via Capacitor 8; desktop via Electron.
- Chart.js embutido em `vendor/` (o app precisa funcionar offline: nada de CDN em runtime).
- Node 22+.

## Comandos

```bash
npm install          # obrigatório antes de testar (os testes importam o pacote `yaml`)
npm start            # http://localhost:8000, direto da raiz
npm run build        # monta www/ (o que vai para Pages, Android, iOS e Windows)
npm test             # testes de segurança (node --test scripts/security.test.mjs)
```

Antes de dizer que algo está pronto: `npm run build` e `npm test` precisam passar.

## Onde está cada coisa

- `app.js` tem ~12 mil linhas (~600 KB). **Nunca leia o arquivo inteiro.** Use busca (grep) e leia só o trecho.
  Seções principais (procure pelo cabeçalho `/* ================= FASE`):
  - FASE 11 — segurança: senha, criptografia e biometria
  - FASE 8 — mercado: ISIN/ticker, cotações, watchlist
  - FASES 9 e 10 — cores por ativo, comparativo, notícias
  - FASE 15 — impostos · FASE 14 — metas e aporte · FASE 13 — calculadora
  - FASE 12 — importador da B3 e proventos · assistente de chaves de API
  - FASE 5 — dashboard de NAV
- `index.html` — estrutura das telas. `src/` — módulos de interface. `styles/`, `themes/` — estilos.
- `native.js` — ponte com recursos nativos (biometria, notificações). `service-worker.js` — cache offline.
- `scripts/build-www.mjs` — build. `proxy/news-worker.js` — proxy de notícias (Cloudflare Worker).
- `docs/` — guias de publicação e checklist de release.

## Ignorar

`legacy/`, `docs/legacy/`, `tools/legacy-tests/`, `vendor/`, `www/`, `release/`, `android/` e `ios/`
(gerados pelo Capacitor) — não leia nem edite, salvo pedido explícito.

## Regras

- Mudanças mínimas: resolva com o menor código possível, sem dependência nova sem perguntar.
- Nunca commitar direto na `main`: um push na `main` publica o site. Use branch + pull request.
- Não incremente a versão do service worker à mão: o build calcula o `BUILD_ID`.
- Segredos nunca no código nem no repositório (`.env`, `*.jks`, `*.keystore`, `*.p12`, chaves de API).
  Chaves de API do usuário ficam só no aparelho dele.
- Mantenha os três idiomas (pt-BR, en, es) ao adicionar texto de interface.
- Mudou criptografia, senha, biometria, importação de arquivos ou chamadas de rede? Rode `/security-review`.
- Workflows do GitHub: ações sempre fixadas por SHA completo e permissões explícitas
  (é verificado por `scripts/check-workflow-security.mjs`).
