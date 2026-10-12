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

Depois: aba **Actions → App Android → Run workflow** (ou crie uma tag `v*`, ex.: `v1.2.0`).
O workflow possui duas etapas separadas:
1. **Validação e APK de Debug** (roda em PRs, branches e tags):
   - Valida os testes unitários (`npm test`) e a regra monotônica do `versionCode`.
   - Gera `prof-controller-debug.apk` (disponível em *Artifacts* para instalar direto no celular).
   - Não utiliza nem expõe segredos de assinatura.
2. **Release AAB para Google Play** (roda apenas em tags `v*` ou disparo manual com `build_release: true`):
   - Executa validação estrita de monotonicidade contra o histórico de releases (`scripts/validate-version-code.mjs --release`).
   - Gera `prof-controller-release.aab` assinado (se os segredos estiverem cadastrados).

O nome de versão visível na Play Console (`versionName`) vem do `package.json` (`"version": "1.2.0"`).
O código interno (`versionCode`) segue a estratégia monotônica calculada a partir do semver, explicada na seção 6.

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

## 6. Atualizações e Estratégia Monotônica de versionCode

### Por que a regra de monotonicidade é obrigatória na Google Play
A Google Play exige que cada novo pacote (`.aab` ou `.apk`) enviado para a Play Console tenha um `versionCode` **estritamente maior** que qualquer versão anteriormente carregada (em qualquer faixa: interna, fechada, aberta ou produção). Além disso:
- O `versionCode` precisa ser um **número inteiro positivo** (entre `1` e `2.100.000.000`).
- Reutilizar um `versionCode` já enviado ou tentar enviar um número menor gera rejeição imediata pela Play Console.
- Usar `github.run_number` era inseguro porque o número de execuções é atrelado ao histórico do workflow do GitHub Actions (podendo reiniciar se o workflow for recriado, gerar conflitos entre branches/PRs ou não refletir as versões de fato enviadas à loja).

### Mapeamento: `package.json` version ➔ Play Console (`versionName` e `versionCode`)

| `package.json` (`version`) | `versionName` (loja) | BUILD | `versionCode` (Android) | Propósito |
|---|---|---|---|---|
| `1.0.0` | `1.0.0` | 0 | `1000000` | Lançamento inicial |
| `1.1.0` | `1.1.0` | 0 | `1010000` | Atualização minor |
| `1.2.0` | `1.2.0` | 0 | `1020000` | Versão atual |
| `1.2.0` | `1.2.0` | 1 | `1020001` | Ressubmissão/correção interna de build (mesmo semver) |
| `1.2.1` | `1.2.1` | 0 | `1020100` | Patch release |
| `1.3.0` | `1.3.0` | 0 | `1030000` | Minor release |
| `2.0.0` | `2.0.0` | 0 | `2000000` | Major release |

### Fórmula de Cálculo
Para cada versão SemVer `MAJOR.MINOR.PATCH` e revisão `BUILD` (0 a 99):
```
versionCode = (MAJOR * 1.000.000) + (MINOR * 10.000) + (PATCH * 100) + BUILD
```
- **MAJOR** (0 a 2.100): aloca dígitos superiores (até 2,1 bilhões, teto da Google Play).
- **MINOR** (0 a 99): aloca 2 dígitos decimais.
- **PATCH** (0 a 99): aloca 2 dígitos decimais.
- **BUILD** (0 a 99): aloca 2 dígitos para rebuilds da mesma versão sem precisar alterar o `versionName` público.

### Validação Local e no CI
O repositório possui verificações automáticas para garantir a monotonicidade e rejeitar regressões:

```bash
# Executa a suite de testes unitários de versionamento
npm test

# Valida o versionCode atual contra o histórico do repositório
npm run check:version

# Validação estrita de release (exige estritamente > que todas as releases anteriores)
npm run check:version:release
```

O arquivo `android/release-history.json` registra as versões lançadas e atua como livro-razão confiável para os workflows de CI.

### Passo a passo para lançar uma nova versão

1. **Atualize o SemVer no `package.json`**:
   Exemplo: de `"version": "1.2.0"` para `"version": "1.2.1"`.
2. **Execute as validações locais**:
   ```bash
   npm test
   npm run check:version:release
   ```
3. **Commit e Tag**:
   ```bash
   git commit -am "chore: bump version to 1.2.1"
   git tag v1.2.1
   git push origin v1.2.1
   ```
4. **Build Automático**:
   A criação da tag `v*` dispara o job `build-release` no GitHub Actions, que valida a monotonicidade estrita, monta o app, assina o `.aab` e disponibiliza o artefato para download seguro nos Artifacts da execução.
5. **Envio para a Play Console**:
   Baixe o arquivo `prof-controller-release.aab` gerado e faça o upload na faixa desejada no Play Console.

## Rodar no Android Studio (opcional)

```bash
npm install
npm run android:open   # monta www/, sincroniza e abre o Android Studio
```

## O que muda para quem já usa o site

O app instalado guarda os dados num banco separado do navegador. Para levar os dados:
no site, **Preferências → Configurações avançadas → Exportar backup (JSON)**; no app, **Importar backup**.
