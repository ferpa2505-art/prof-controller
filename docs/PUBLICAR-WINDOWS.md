# Publicar no Windows

## Rota recomendada: Microsoft Store via PWABuilder

Por quê:
- conta de desenvolvedor individual na Microsoft Store é **gratuita**;
- a Store assina o pacote — **não precisa comprar certificado** de assinatura de código;
- o app instalado carrega o site do GitHub Pages e **se atualiza sozinho** a cada push na `main`;
- funciona offline (service worker com pré-cache completo).

Passo a passo:
1. Crie a conta em https://storedeveloper.microsoft.com (opção *Individual*).
2. No Partner Center, **Apps e jogos → Novo produto → Aplicativo MSIX ou PWA** → reserve o nome
   **ProF Controller**. Anote em *Identidade do produto*: `Package/Identity/Name`,
   `Publisher` e `PublisherDisplayName`.
3. Acesse https://www.pwabuilder.com, cole `https://ferpa2505-art.github.io/prof-controller/`
   e clique em **Start**. O manifesto já está pronto (nome, ícones normais e "maskable", cores,
   categorias, política de privacidade).
4. **Package for stores → Windows** → preencha com os dados do passo 2 → baixe o pacote.
5. No Partner Center, envie o `.msixbundle` em *Pacotes*, preencha a ficha (textos em
   `docs/FICHA-LOJA.md`), classificação etária e a URL da política de privacidade.

Dados no Windows: o app da Store usa o mesmo armazenamento do site no Edge. Quem já usa o site
no Edge continua vendo os mesmos dados.

## Alternativa: instalador .exe (Electron)

Para distribuir um `.exe` fora da Store:
- **Actions → App Windows (Electron) → Run workflow** → baixe o instalador em *Artifacts*.
- Ou localmente, no Windows: `npm install` e depois `npm run electron:build:win` (sai em `release/`).

Sem certificado de assinatura, o Windows mostra o aviso "O Windows protegeu o computador"
(SmartScreen). Certificado custa de € 200 a € 400 por ano, ou cerca de US$ 10/mês no Azure Trusted Signing.
Por isso a Store via PWABuilder é a rota recomendada.

O que foi corrigido no Electron: o `preload.js` usava `ipcMain` (só existe no processo principal) e
quebrava ao abrir; a lista de arquivos empacotados deixava de fora quase todo o CSS; links externos
abriam janelas do Electron em vez do navegador. Agora o Electron carrega a pasta `www/` completa.
