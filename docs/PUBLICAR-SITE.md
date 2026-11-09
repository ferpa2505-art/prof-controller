# Publicar o site (GitHub Pages)

O site é o conteúdo de `www/`, montado por `scripts/build-www.mjs` a cada push na
`main`. **Ele não é a raiz do repositório**: a raiz tem documentação, `legacy/`,
`proxy/` e `package.json`, que não devem ir para o site.

## Como tem de estar configurado (uma vez)

Em **Settings → Pages → Build and deployment**:

- **Source:** `GitHub Actions` (não "Deploy from a branch").
- Nada de branch/folder: quem publica é o workflow **Publicar no GitHub Pages**.

Com isso, cada push na `main` roda o build, publica o artefato `www/` e depois
confere o que o site está servindo de verdade.

## Como saber se está certo

O build grava um `BUILD_ID` (versão + hash do conteúdo) no `service-worker.js`.
No site publicado:

| Verificação | Resultado esperado |
|---|---|
| `https://ferpa2505-art.github.io/prof-controller/service-worker.js` | `const BUILD_ID = "1.3.2-xxxxxxxxxx"` (nunca `"dev"`) |
| `https://ferpa2505-art.github.io/prof-controller/package.json` | **404** |
| `https://ferpa2505-art.github.io/prof-controller/www/` | **404** |
| DevTools → Application → Service Workers | um worker ativo, controle do escopo `/prof-controller/` |

No navegador: abra o site, espere o service worker instalar
(DevTools → Application → Cache Storage → `prof-controller-1.3.2-...` deve ter
41 entradas), dê reload e use **Application → Service Workers → Offline** +
reload. A tela tem de abrir sem rede.

## Se o job "verificar" falhar

Sintoma: o deploy diz `success`, mas `service-worker.js` continua com
`BUILD_ID = "dev"` e `package.json` responde 200. Isso significa que o Pages está
servindo a **raiz da branch**, não o artefato:

1. **Settings → Pages → Source** = `GitHub Actions` e salve.
2. Aba **Actions → Publicar no GitHub Pages → Run workflow** (branch `main`).
3. Espere o job `verificar` ficar verde.
4. Se continuar servindo a raiz, confira se existe uma custom domain ou um site
   de usuário (`ferpa2505-art.github.io`) ocupando o caminho `/prof-controller/`;
   remova a duplicata e rode o workflow de novo.

O deploy do Pages leva ~1–2 minutos e o CDN pode segurar o arquivo antigo por
alguns minutos; o job `verificar` tenta por até ~3 minutos antes de falhar.

## Por que isso importa

Com o service worker em modo `dev`, o site **não pré-carrega** os 41 arquivos do
app e não troca de cache quando sai versão nova — o app abre offline só se todas
as telas já tiverem sido visitadas naquela sessão. Com o `www/` publicado, o
pré-cache completo acontece na primeira abertura e cada publicação invalida o
cache antigo sozinha.

## Rollback

O site é sempre o conteúdo da `main` publicada pelo workflow. Para voltar uma
versão, use **Revert** no PR que causou o problema (ver
`docs/RELEASE-CHECKLIST.md`). Os dados das pessoas ficam no IndexedDB do
navegador e não são afetados.
