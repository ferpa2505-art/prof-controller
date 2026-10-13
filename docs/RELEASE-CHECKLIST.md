# Checklist de release: smoke test e rollback

Use este roteiro antes de cada envio ao Google Play e depois de cada merge na `main`.
Tudo aqui pode ser feito pelo navegador e pelo celular, sem instalar nada no PC.

## 1. Antes do merge (automático)

O PR só entra na `main` com estes checks verdes:

- `build (22.x)` – instala e monta o `www/`
- `Security gates / Build and syntax`
- `Security gates / npm audit` – nenhuma vulnerabilidade high/critical
- `Security gates / Secret scan` – nenhum segredo no histórico
- `Security gates / Security regression tests` – build seguro, FileProvider, CSP, service worker
- `Security gates / Workflow policy` – Actions fixadas por SHA e `permissions` declaradas

Em branches `loja/**` o workflow **App Android** também roda `cap sync android`,
`assembleDebug` e `bundleRelease`. O build de release **falha** se o manifest
mesclado deixar o FileProvider exportado ou sem `@xml/file_paths`.

## 2. Smoke test do site (GitHub Pages), depois de cada merge na `main`

Espere o workflow **Publicar no GitHub Pages** terminar (aba Actions) e abra
<https://ferpa2505-art.github.io/prof-controller/> numa aba anônima:

1. A tela inicial (Dashboard) carrega, com logo e gráficos.
2. Troque o tema em Preferências (⚙️): claro, escuro e Profit C.
3. Crie uma conta de teste e um lançamento; recarregue a página e confira que continuam lá.
4. Abra **Notícias** e **Cotações**: se algo não carregar, abra o console (F12) e procure
   mensagens `Content-Security-Policy` – isso indica um domínio que precisa entrar na CSP.
5. Exporte um backup (JSON) e importe de volta.
6. Apague a conta de teste.

## 3. Smoke test do Android (APK de debug)

1. Na aba **Actions**, abra a última execução de **App Android** da branch `loja/...`.
2. Em **Artifacts**, baixe `prof-controller-android-N` e extraia `prof-controller-debug.apk`.
3. Instale no celular (permitir "fontes desconhecidas" só para esse arquivo).
4. Repita os passos 1–6 do smoke test do site e também:
   - **Exportar backup**: a folha de compartilhamento do Android precisa abrir
     (isso testa o FileProvider restrito a `cache/shared/`).
   - **Biometria** (se o aparelho tiver): ativar, bloquear e desbloquear.
   - **Lembrete**: criar uma conta a pagar com vencimento em 2 minutos e ver a notificação.
   - Botão **voltar** do Android fecha modais antes de minimizar o app.
5. Desinstale o APK de debug antes de instalar a versão da Play (assinaturas diferentes).

## 4. Rollback

### Site (GitHub Pages)

O site é sempre o conteúdo da `main`. Para voltar:

1. Abra o PR que causou o problema (aba **Pull requests → Closed**).
2. Clique em **Revert** (fim da página). O GitHub cria um PR que desfaz as mudanças.
3. Espere os checks ficarem verdes e clique em **Merge**.
4. O Pages republica a versão anterior em ~2 minutos. Faça o smoke test do site.

Os dados do usuário ficam no IndexedDB do próprio navegador e não são afetados.
O service worker troca o cache sozinho quando o `BUILD_ID` muda.

**Ensaio de rollback (fazer 1 vez):** em qualquer PR já mergeado, clique em **Revert**,
confira que o PR de reversão abre e os checks rodam, e então **feche sem mergear**.

### Android (Google Play)

A Play **não aceita** `versionCode` menor que um já enviado, então rollback no Android
é sempre "para frente":

1. Se a versão nova estiver em lançamento gradual, **pause/interrompa** o rollout no Play Console
   (Versão → Produção → Interromper lançamento). Quem não atualizou fica na versão antiga.
2. Faça o revert do código como no site (passos 1–3).
3. Suba o `version` do `package.json` (ex.: `1.2.1` → `1.2.2`), o que gera um `versionCode` maior.
4. Gere o AAB e envie. Para reenviar a **mesma** versão com outro build, use `BUILD_NUMBER=1..99`.

### Tabela de versionCode

`versionCode = MAJOR*1000000 + MINOR*10000 + PATCH*100 + BUILD`

| package.json | BUILD | versionCode |
|---|---|---|
| 1.2.0 | 0 | 1020000 |
| 1.2.0 | 1 | 1020001 |
| 1.2.1 | 0 | 1020100 |
| 1.3.0 | 0 | 1030000 |
| 2.0.0 | 0 | 2000000 |
