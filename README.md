# Pesos App 🏃‍♀️

App de emagrecimento e acompanhamento de saúde para brasileiros com suporte a GLP-1.

## Etapa 1 — Esqueleto

Status: ✅ Pronto para rodar

### Como testar no seu celular:

1. **Instale o Expo Go:**
   - iOS: App Store, procure "Expo Go"
   - Android: Google Play, procure "Expo Go"

2. **Clone e instale dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   Vai abrir um menu. Digite `i` para iOS ou `a` para Android.

4. **Leia o QR code** com o Expo Go (iOS abre câmera, Android tem botão)

5. **Você deve ver:**
   - Tela inicial com "Olá! 👋"
   - 3 abas na base: Início, Diário, Perfil
   - Cores verde e pêssego, modo escuro automático

### Estrutura de pastas:

```
pesos-app/
├── app/                  # Rotas (Expo Router)
│   ├── (tabs)/          # Abas principais
│   ├── _layout.tsx      # Layout raiz
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── constants/       # Cores, tipografia, espaçamento
│   ├── hooks/           # Hooks customizados
│   ├── types/           # Tipos TypeScript
│   └── assets/          # Ícones, fontes, imagens
├── app.json             # Config Expo
├── tsconfig.json        # Config TypeScript
└── package.json         # Dependências
```

### Próximo passo (Etapa 2):

Vamos implementar o **onboarding em quiz** — as telas de cadastro que calculam sua meta calórica e mostram o paywall.

### Stack técnico:

- ✅ Expo 51 + React Native 0.74
- ✅ TypeScript 5.3
- ✅ Expo Router (navegação)
- ✅ Sistema de tema (cores, tipografia, espaçamento)
- ⏳ Supabase (próxima etapa)
- ⏳ Assinaturas (próxima etapa)
