# ProF Controller

Gestor de patrimônio pessoal multi-moeda, **100% local e privado**: contas, saldos diários, lançamentos,
orçamentos, câmbio, imóveis, veículos, carteira de investimentos e NAV consolidado. Sem servidor, sem conta
de usuário — os dados ficam só no aparelho, com criptografia opcional (AES-GCM 256 + PBKDF2).

- App web: https://ferpa2505-art.github.io/prof-controller/
- Política de privacidade: https://ferpa2505-art.github.io/prof-controller/privacy.html
- Idiomas: português (Brasil), inglês e espanhol

## Plataformas

| Plataforma | Como é gerado | Onde |
|---|---|---|
| Web (PWA) | `npm run build` → pasta `www/` | GitHub Pages (automático a cada push na `main`) |
| Android | Capacitor 8 → `android/` | Google Play — veja `docs/PUBLICAR-ANDROID.md` |
| iOS | Capacitor 8 → `ios/` | App Store — veja `docs/PUBLICAR-IOS.md` |
| Windows | Microsoft Store via PWABuilder (recomendado) ou Electron | veja `docs/PUBLICAR-WINDOWS.md` |

## Estrutura

```
index.html, app.js, *.css, *.js   código do app (HTML/CSS/JS puro, sem framework)
src/                              módulos de interface (gráficos, botões, tabelas)
styles/, themes/                  estilos e temas
vendor/                           bibliotecas embutidas (Chart.js) — o app funciona offline
native.js                         ponte com recursos nativos (biometria, notificações, links) no Android/iOS
privacy.html                      política de privacidade (pt/en/es)
service-worker.js                 cache offline; versão preenchida automaticamente no build
scripts/build-www.mjs             monta www/ só com o que o app usa
android/, ios/                    projetos nativos (Capacitor)
electron/                         versão desktop (Electron)
docs/                             guias de publicação; docs/legacy guarda documentação antiga
legacy/                           código antigo não usado pelo app (servidor Express/Stripe, React)
tools/                            scripts auxiliares (ícones etc.)
```

## Desenvolvimento

```bash
npm install          # uma vez
npm start            # abre em http://localhost:8000 direto da raiz (sem cache agressivo)
npm run build        # monta www/ (o que vai para Pages, Android, iOS e Windows)
```

Não é mais preciso incrementar a versão do cache do service worker à mão: o build calcula um `BUILD_ID`
a partir do conteúdo dos arquivos e grava no `www/service-worker.js`.

## Licença

MIT.
