# Publicar na Google Play

Tudo o que dá para automatizar já está no repositório. Falta o que só você pode fazer:
conta, chave de assinatura, testadores e o formulário da loja.

## 0. Antes de tudo: o ID do app

O ID está como `com.profcontroller.app` (em `capacitor.config.json` e `android/app/build.gradle`).
**Depois do primeiro envio para a Play ele não muda nunca mais.** Se quiser outro (por exemplo,
com um domínio seu), troque nos dois arquivos e em `ios/App/App.xcodeproj/project.pbxproj`
antes do primeiro upload.

## 1. Conta de desenvolvedor

1. Acesse https://play.google.com/console e crie a conta (taxa única de US$ 25).
2. Conta **pessoal** criada depois de nov/2023: antes de publicar em produção, a Google exige
   um **teste fechado com pelo menos 12 testadores, inscritos por 14 dias seguidos**.
   Comece a juntar esses 12 e-mails (amigos, família, colegas) já — é o que define o prazo.

## 2. Chave de assinatura (uma vez só)

Rode num computador com Java instalado (o Android Studio já traz):

```bash
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

- Guarde `upload.jks` e as senhas num lugar seguro (gerenciador de senhas + cópia offline).
  Perder a chave de upload dá para resolver com a Google, mas dá trabalho.
- **Nunca** coloque esse arquivo no repositório (o `.gitignore` já bloqueia `*.jks`).
- Na Play, ative o **Play App Signing** (padrão): a Google guarda a chave final; a sua é só de envio.

## 3. Deixar o GitHub gerar o arquivo assinado

Em **GitHub → Settings → Secrets and variables → Actions → New repository secret**, crie:

| Nome | Valor |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | conteúdo de `upload.jks` em base64 (Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.jks")) \| Set-Clipboard`) |
| `ANDROID_KEYSTORE_PASSWORD` | senha do keystore |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | senha da chave |

Depois: aba **Actions → App Android → Run workflow**. Ao terminar, baixe em *Artifacts*:
- `prof-controller-debug.apk` — instale no seu celular para testar;
- `prof-controller-release.aab` — é este que vai para a Play.

O número de versão (`versionCode`) é o número da execução do workflow, então cresce sozinho.
O nome da versão vem do `package.json` (`"version": "1.2.0"`).

## 4. Criar o app no Play Console

1. **Criar app** → nome "ProF Controller", idioma padrão Português (Brasil), App, Gratuito.
2. **Painel → Configurar o app**, preencha:
   - **Política de privacidade:** `https://ferpa2505-art.github.io/prof-controller/privacy.html`
   - **Acesso ao app:** "Todas as funcionalidades estão disponíveis sem acesso especial".
     (Cotações pedem chave de API grátis; explique nas notas: *"O app funciona sem chave.
     Cotações automáticas usam chaves gratuitas que o próprio usuário cadastra (Finnhub,
     Twelve Data, brapi.dev)."*)
   - **Anúncios:** Não.
   - **Classificação de conteúdo:** questionário → categoria "Utilitário/Produtividade"; respostas "não" para tudo.
   - **Público-alvo:** 18+.
   - **Recursos financeiros:** marque **"Gerenciamento de finanças pessoais"** (sem empréstimos,
     sem transações, sem criptomoedas como serviço).
   - **App de notícias:** Não (a aba só mostra links para outros sites).
   - **Segurança dos dados** — respostas, conforme o código atual:
     - Coleta ou compartilha dados de usuário? **Não.**
       (Nada é enviado a servidor do desenvolvedor. As consultas de cotação mandam só o código do
       ativo direto ao provedor escolhido pelo usuário — a Google considera isso fora de "coleta"
       quando não identifica o usuário. Se preferir ser conservador, declare "Atividade no app →
       Outras ações" como *compartilhado, não obrigatório, para funcionalidade*.)
     - Dados criptografados em trânsito? **Sim** (todas as APIs usam HTTPS).
     - Usuário pode pedir exclusão? Não há conta; os dados ficam no aparelho e somem ao desinstalar.
3. **Ficha da loja principal:** use os textos de `docs/FICHA-LOJA.md`. Precisa de:
   - ícone 512×512 → `assets/icon-only.png` (redimensione para 512);
   - imagem de destaque 1024×500;
   - de 2 a 8 capturas de tela de celular (tire com dados de exemplo, nunca com seus dados reais).

## 5. Teste fechado (os 14 dias)

1. **Testes → Teste fechado → Criar faixa** → envie o `.aab`.
2. Adicione os e-mails dos testadores (lista) e compartilhe o link de inscrição.
3. Todos precisam **aceitar o convite e instalar** pelo link. Conte 14 dias a partir do 12º inscrito.
4. Depois: **Painel → Solicitar acesso à produção**. A Google pergunta como foi o teste; responda com
   o que os testadores relataram.

## 6. Atualizações

1. Mude `"version"` no `package.json` (ex.: `1.2.1`).
2. Faça push na `main` (o site atualiza sozinho) e rode o workflow **App Android**.
3. Envie o novo `.aab` na faixa desejada.

## Rodar no Android Studio (opcional)

```bash
npm install
npm run android:open   # monta www/, sincroniza e abre o Android Studio
```

## O que muda para quem já usa o site

O app instalado guarda os dados num banco separado do navegador. Para levar os dados:
no site, **Preferências → Configurações avançadas → Exportar backup (JSON)**; no app, **Importar backup**.
