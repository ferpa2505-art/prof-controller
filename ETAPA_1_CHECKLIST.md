# ✅ ETAPA 1 — Esqueleto do App

## O que foi criado:

### Estrutura de Pastas
```
pesos-app/
├── app/                           # Rotas (Expo Router)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Layout com abas
│   │   ├── index.tsx             # Tela de Início
│   │   ├── journal.tsx           # Tela de Diário (vazia)
│   │   └── profile.tsx           # Tela de Perfil (vazia)
│   └── _layout.tsx               # Layout raiz
│
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── Button.tsx           # Botão com variantes
│   │   ├── ThemedText.tsx       # Texto com variantes
│   │   └── ThemedView.tsx       # View com variantes
│   │
│   ├── constants/
│   │   └── colors.ts            # Cores, tipografia, espaçamento
│   │
│   ├── hooks/
│   │   └── useColorScheme.ts    # Hook de tema
│   │
│   ├── types/                   # (pronto para TypeScript)
│   └── assets/                  # (pronto para ícones e fontes)
│
├── package.json
├── app.json
├── tsconfig.json
├── babel.config.js
└── .gitignore
```

### Funcionalidades Implementadas

✅ **Navegação com abas:**
- Tela de Início com cards de resumo
- Tela de Diário (estrutura pronta)
- Tela de Perfil (estrutura pronta)

✅ **Sistema de Design:**
- Paleta de cores (verde, pêssego, rosa)
- 4 componentes base (Button, ThemedText, ThemedView, useColorScheme)
- Tipografia padronizada (6 variantes)
- Espaçamento e border-radius consistentes

✅ **TypeScript + Expo Router:**
- Configuração pronta
- Path aliases (`@components`, `@constants`, etc.)

## ⚠️ PRÓXIMOS PASSOS (quando `npm install` terminar):

### Teste imediato (15 min):
1. Abra um terminal e rode: `npm start`
2. Digite `i` (iOS) ou `a` (Android)
3. Abra o app Expo Go no seu celular
4. Leia o QR code
5. Deve aparecer a tela com "Olá! 👋"

### O que você deve ver na tela:
- [ ] "Olá! 👋" em verde grande
- [ ] 3 cards: "Resumo de Hoje" (calorias, proteína, água), "Seu Peso"
- [ ] Botão "Começar Configuração" em verde
- [ ] 3 abas na base: Início | Diário | Perfil
- [ ] Cores suaves (verde #10B981, pêssego #F59E0B)

## Arquivos principais:

| Arquivo | Função |
|---------|--------|
| `app/(tabs)/_layout.tsx` | Define as 3 abas |
| `app/(tabs)/index.tsx` | Tela inicial com cards |
| `src/constants/colors.ts` | Todas as cores, fontes, espaçamento |
| `src/components/Button.tsx` | Botão reutilizável |
| `src/components/ThemedText.tsx` | Texto com 6 variantes |

## Stack técnico:

- React Native 0.74
- Expo 51
- TypeScript 5.3
- Expo Router 3.5 (navegação)
- React Native 18.2

## Próxima Etapa (2):

**Onboarding em Quiz** — 8-10 telas que perguntam:
- Objetivo (emagrecer, ganhar massa, etc)
- Sexo, idade, altura, peso
- Meta de peso
- Nível de atividade
- Se faz tratamento GLP-1
- Resultado: calcula meta calórica + mostra paywall

---

**Status:** ✅ Pronto para testar no Expo Go
