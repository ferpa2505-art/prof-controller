# Publicar na App Store (iOS)

## O que já está pronto

- Projeto `ios/` (Capacitor 8, iOS 15+, Swift Package Manager — não usa CocoaPods).
- Ícones e tela de abertura gerados (`ios/App/App/Assets.xcassets`).
- `Info.plist` com texto do Face ID, idiomas pt-BR/en/es e declaração de criptografia.
- `PrivacyInfo.xcprivacy` (manifesto de privacidade exigido pela Apple): sem rastreamento, sem coleta.
- Face ID com o segredo no Keychain preso à biometria; lembretes locais de vencimento;
  links externos no Safari; exportação de backup pela folha de compartilhamento.
- Workflow **App iOS (verificação)** compila o app num Mac do GitHub a cada push.

## O que só você pode fazer

1. **Conta Apple Developer** — https://developer.apple.com/programs/ (US$ 99/ano).
   Pessoa física funciona; o nome que aparece na loja é o seu.
2. **Um Mac para o primeiro envio.** Opções, da mais barata para a mais simples:
   - Mac emprestado por uma tarde (qualquer Mac com macOS recente e Xcode 26);
   - Mac na nuvem por hora (MacinCloud, Scaleway Apple Silicon etc.);
   - Codemagic (tem plano grátis com minutos de Mac e faz a assinatura sozinho).
   Depois do primeiro envio, dá para automatizar tudo pelo GitHub Actions com uma chave da
   App Store Connect API — me peça quando chegar nessa fase.

## Passo a passo no Mac

```bash
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller
npm install
npm run ios:open        # monta www/, sincroniza e abre o Xcode
```

No Xcode:
1. Clique em **App** (projeto) → aba **Signing & Capabilities** → marque *Automatically manage signing*
   e escolha seu **Team**.
2. Confira o *Bundle Identifier* (`com.profcontroller.app` — o mesmo do Android; muda só antes do 1º envio).
3. Escolha um iPhone de verdade conectado e clique ▶ para testar (Face ID, notificações, exportar backup).
4. **Product → Archive** → **Distribute App → App Store Connect → Upload**.

## App Store Connect

https://appstoreconnect.apple.com → **Meus apps → +**.

- **Categoria:** Finanças. **Classificação etária:** 4+ (sem conteúdo sensível) — ou 17+ se preferir, não é exigido.
- **URL da política de privacidade:** `https://ferpa2505-art.github.io/prof-controller/privacy.html`
- **Privacidade do app (nutrition label):** "Dados não coletados".
- **Conformidade de exportação (criptografia):** o app usa criptografia padrão (AES/PBKDF2 do sistema)
  só para proteger os dados do próprio usuário no aparelho. O `Info.plist` já declara
  `ITSAppUsesNonExemptEncryption = NO` (isenção). Confirme no questionário se a Apple perguntar.
- **Notas para o revisor** (importante para não cair na regra 4.2 "é só um site"):
  > O ProF Controller funciona 100% offline, sem conta. Recursos nativos: desbloqueio por Face ID com
  > chave no Keychain, lembretes locais de vencimento de contas, exportação de backup pela folha de
  > compartilhamento do iOS. Cotações automáticas usam chaves gratuitas que o próprio usuário cadastra
  > (Finnhub, Twelve Data, brapi.dev); sem elas, o restante do app funciona normalmente.
- **Capturas de tela:** iPhone 6,9" (1320×2868) obrigatórias; iPad só se marcar suporte a iPad.
  Use dados de exemplo.

## Risco principal: regra 4.2 (funcionalidade mínima)

A Apple rejeita apps que parecem "um site dentro de um app". Os recursos nativos acima são a defesa.
Se vier rejeição mesmo assim, responda pela Central de Resolução listando esses recursos — e me chame
para reforçarmos (por exemplo, widget na tela inicial com o patrimônio total).
