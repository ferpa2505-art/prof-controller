# CHANGELOG

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2026-11-20

### 🔒 Segurança — Principais Avanços

- **SHA-pinning obrigatório em todas as GitHub Actions**: Todas as actions externas agora fixadas por commit SHA completo (ex.: `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1`), impedindo supply-chain attacks. Verificação automatizada via `scripts/check-workflow-security.mjs`.
- **Permissões explícitas em todos os workflows**: Cada workflow declara `permissions:` no nível raiz; jobs não herdam mais permissões amplas.
- **Deploy no Pages restrito à `main`**: O job de deploy possui guarda `if: github.ref == 'refs/heads/main'`, impedindo publicação acidental a partir de outras branches (incluindo `workflow_dispatch`).
- **CSP estrito sem `unsafe-eval`**: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://cdn.jsdelivr.net https://api.exchangerate.host https://brapi.dev https://newsapi.org; frame-src https://cdn.jsdelivr.net; base-uri 'self'; form-action 'self'; object-src 'none'`. Validado por `scripts/csp.mjs` e testado.
- **Proteção DOM XSS completa**: 7 sinks `innerHTML` auditados; todos usam `escapeHtml()` + validação de moeda (`/^[A-Z]{3}$/`). 5 alertas CodeQL corrigidos (#57, #58).
- **Service Worker apenas mesma origem**: Rejeita `GET` cross-origin; notificações push validadas para `origin === self.location.origin`.
- **FileProvider Android restrito a `CACHE/shared/`**: Caminhos absolutos e travessia de diretório bloqueados; `build.gradle` verifica caminho no manifesto mesclado.
- **`versionCode` Android monótono e sem overflow**: Fórmula `versionCode = major * 1000000 + minor * 10000 + patch * 100 + buildNumber` validada no workflow Android e no script de verificação.
- **Eliminação de vulnerabilidades npm audit high/critical**: `tar` fixado em `7.5.22` via `overrides`; dependências não usadas removidas (`@capacitor/assets`, `nodemon`, `jest`); `uuid` atualizado para v11.
- **Validação robusta de workflows YAML**: Parse com `yaml.parseDocument` (resolution de aliases `*ref`, merge keys `<<`), falha fechada em `uses` não-string. Comentários HTML no CSP lidos como o navegador (sem regex frágil).

### 📱 Plataforma & Build

- **Capacitor 8** (`@capacitor/cli@8.6.2`, `android@8.5.3`, `ios@8.5.3`).
- **Electron 44** (`electron@44.10.2`, `electron-builder@26.15.3`): build Windows NSIS (x64 + arm64), macOS DMG, Linux AppImage.
- **Build único para todas as plataformas**: `npm run build` monta `www/` com `BUILD_ID = SHA-256` dos arquivos; service worker atualiza cache automaticamente.
- **Proteção contra path traversal no build**: `scripts/build-www.mjs` normaliza caminhos e ignora `..` antes de copiar.

### 🔐 Criptografia & Autenticação (FASE 11 — `app.js`)

- **AES-GCM 256 + PBKDF2**: Chave derivada do PIN (600.000 iterações) ou recovery phrase (150.000 iterações); salt 16 bytes, IV 12 bytes por registro.
- **WebAuthn PRF + Biometria nativa**: Android Keystore / iOS Keychain via `@capgo/capacitor-native-biometric@8.8.1`; fallback para PIN.
- **HMAC-SHA-256 para ofuscação de chaves de cache**: Nomes de ativos no Cache Storage não vazam metadados.
- **Auto-lock com backoff exponencial**: 30s → 1min → 2min → 5min → 15min → 30min → 1h → 4h → 12h → 24h (máx).
- **Tentativas máximas e wipe opcional**: 10 falhas consecutivas → opção de apagar vault.

### 🌐 Internacionalização

- **Três idiomas completos**: pt-BR (padrão), en, es — todos os textos de interface, mensagens de erro e notificações.

### 🧪 Qualidade & Testes

- **75 testes de segurança automatizados** (`scripts/security.test.mjs`): CSP, DOM XSS, SW, criptografia, workflows, Android, Electron, dependências.
- **`npm test` passa (73 pass, 2 skipped no Windows — symlink + Android signing)**.
- **`npm audit --production --audit-level=moderate`: 0 vulnerabilidades**.
- **CI executa `check-workflow-security`, `csp.mjs`, `security.test.mjs`, build, audit** em cada PR.

### 🗑️ Removido

- **`legacy/server/`**: Código de servidor nunca publicado removido (#59).
- **Referências a manifest legado no CI** (#59).

### 🛠️ Correções & Ajustes

- **NSIS**: Instalação por usuário sem exigir administrador (e6fed16).
- **CSP parser**: Leitura de comentários HTML sem regex de substituição; comparação exata de diretivas (7363bcf, 90219b8).
- **Dependabot**: `fast-uri@3.1.9`, `qs@6.17.1` e múltiplas atualizações processadas.

---

## [1.3.2] - 2025-xx-xx

### ✨ Adicionado
- Simulador de câmbio com IOF e comparativo de empresas (#45, #46).
- Painel próprio do simulador, destaque da opção mais barata, tema Escuro padrão (b3525ce).
- Atualização de todos os dados, botão X nos painéis, gráficos recolhidos (f7f2c73).

### 🔧 Corrigido
- Escape de HTML no simulador + validação de valores da tela (6e642a2).

---

## [1.3.0] - 2025-xx-xx

### ✨ Adicionado
- Simulador de troca de moeda com IOF e comparativo de empresas (9a1776d).

---

## [1.x.x] - Versões Anteriores

Histórico resumido das principais fases implementadas antes do versionamento semântico formal:

- **FASE 1–4**: Base do app, navegação, persistência local (IndexedDB), dashboard de NAV.
- **FASE 5**: Dashboard de NAV completo.
- **FASE 6–7**: Importação B3, proventos, assistente de chaves de API.
- **FASE 8**: Mercado — ISIN/ticker, cotações (brapi.dev, exchangerate.host), watchlist.
- **FASE 9–10**: Cores por ativo, comparativo, notícias (newsapi.org via proxy Cloudflare Worker).
- **FASE 11**: Segurança — senha, criptografia AES-GCM, biometria, auto-lock.
- **FASE 12**: Importador B3 e proventos.
- **FASE 13**: Calculadora financeira.
- **FASE 14**: Metas e aporte programado.
- **FASE 15**: Impostos (ganho de capital, DARF).

---

## Como Atualizar

### Web (GitHub Pages)
Atualização automática ao abrir o app; service worker detecta novo `BUILD_ID` e recarrega.

### Android / iOS (Capacitor)
```bash
npm run cap:sync   # sincroniza www/ e plugins nativos
npx cap open android   # ou: npx cap open ios
# compile e gere o bundle/APK/IPA no Android Studio / Xcode
```

### Desktop (Electron)
```bash
npm run electron:build:win   # .exe NSIS (x64 + arm64)
npm run electron:build:mac   # .dmg
npm run electron:build:linux # .AppImage
```

---

## Verificações de Segurança (Checklist de Release)

Todas estas passam no CI antes de qualquer merge na `main`:

- [x] `npm run build` — monta `www/` sem erros
- [x] `npm test` — 75 testes de segurança passam
- [x] `npm audit --production --audit-level=moderate` — 0 vulnerabilidades
- [x] `scripts/check-workflow-security.mjs` — actions com SHA, permissions, deploy só `main`
- [x] `scripts/csp.mjs` — CSP do `index.html` corresponde exatamente ao esperado
- [x] Build Android: `versionCode` monótono, FileProvider restrito
- [x] Build Electron: `electron-builder` assina (se certificado configurado)
- [x] Workflows: `checks.yml`, `security-gates.yml`, `pages.yml`, `android.yml`, `ios.yml`, `windows.yml` — todos verdes

---

## Links Úteis

- **Repositório**: https://github.com/ferpa2505-art/prof-controller
- **Issues**: https://github.com/ferpa2505-art/prof-controller/issues
- **Releases**: https://github.com/ferpa2505-art/prof-controller/releases
- **GitHub Pages (produção)**: https://ferpa2505-art.github.io/prof-controller/
- **Documentação de release**: `docs/release-checklist.md`, `docs/publish-android.md`, `docs/publish-ios.md`, `docs/publish-windows.md`