# Frontend React - Sistema de Assinatura

Sistema de assinatura com React integrando Google OAuth, Apple Sign-In e Stripe.

## 📁 Estrutura

```
src/subscription/
├── components/          # Componentes React reutilizáveis
│   ├── LoginButtons.jsx        # Botões de login (Google + Apple)
│   ├── PlanCards.jsx           # Cards de planos (mensal/anual)
│   ├── CheckoutButton.jsx      # Botão de checkout Stripe
│   └── SubscriptionDashboard.jsx # Dashboard de assinatura
├── pages/              # Páginas
│   └── SubscriptionPage.jsx    # Página principal
├── context/            # Context API
│   ├── AuthContext.js          # Contexto de autenticação
│   └── SubscriptionContext.js  # Contexto de assinatura
├── hooks/              # Custom hooks
│   ├── useGoogleLogin.js       # Hook para login Google
│   ├── useAppleLogin.js        # Hook para login Apple
│   └── useStripe.js            # Hook para Stripe checkout
├── services/           # Serviços HTTP
│   └── api.js                  # Comunicação com backend
└── styles/             # CSS
    ├── SubscriptionPage.css
    ├── PlanCards.css
    ├── CheckoutButton.css
    ├── LoginButtons.css
    └── SubscriptionDashboard.css
```

## 🚀 Instalação

### 1. Adicionar ao seu projeto React

Se você está usando React 18+:

```bash
# Copiar pasta subscription para src/
cp -r src/subscription /seu/projeto/react/src/
```

### 2. Instalar dependências

```bash
npm install react-dom
```

## 🔧 Configuração

### 1. Criar arquivo `.env` na raiz do projeto

```bash
# Backend
REACT_APP_API_URL=http://localhost:3001

# Stripe
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_seu_chave_publica

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com

# Apple Sign-In
REACT_APP_APPLE_CLIENT_ID=com.profcontroller.web
REACT_APP_APPLE_TEAM_ID=seu_team_id
REACT_APP_APPLE_KEY_ID=seu_key_id
```

### 2. Envolver aplicação com Providers

No seu `App.jsx` ou `App.tsx`:

```jsx
import { AuthProvider } from './subscription/context/AuthContext';
import { SubscriptionProvider } from './subscription/context/SubscriptionContext';
import SubscriptionPage from './subscription/pages/SubscriptionPage';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <SubscriptionPage />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
```

### 3. Adicionar scripts no HTML (index.html)

Se usando HTML puro:

```html
<!-- Google Sign-In -->
<script async src="https://accounts.google.com/gsi/client"></script>

<!-- Apple Sign-In -->
<script async src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js"></script>

<!-- Stripe -->
<script async src="https://js.stripe.com/v3/"></script>
```

## 📊 Fluxo de Autenticação

### Google Login
```
1. Usuário clica "Login com Google"
2. Google SDK abre modal
3. Usuário autentica
4. Frontend recebe idToken
5. Backend valida e cria usuário
6. Backend retorna JWT token
7. Frontend salva token + dados do usuário
8. Usuário é redirecionado para planos
```

### Apple Sign-In
```
1. Usuário clica "Login com Apple"
2. Apple SDK abre modal
3. Usuário autentica
4. Frontend recebe identityToken
5. Backend valida e cria usuário
6. Backend retorna JWT token
7. Frontend salva token + dados do usuário
8. Usuário é redirecionado para planos
```

## 💳 Fluxo de Pagamento

```
1. Usuário seleciona plano (mensal/anual)
2. Usuário seleciona moeda (BRL/EUR)
3. Usuário clica "Pagar"
4. Frontend chama POST /subscription/checkout
5. Backend cria sessão Stripe
6. Frontend redireciona para Stripe checkout page
7. Usuário insere cartão
8. Stripe processa pagamento
9. Redirecionado para /subscription/success
10. Backend processa webhook
11. Usuário recebe email de confirmação
12. Assinatura ativada
```

## 🎨 Componentes

### LoginButtons
Botões de login com Google e Apple.

```jsx
<LoginButtons onLoginSuccess={(user) => console.log(user)} />
```

### PlanCards
Cards para seleção de plano.

```jsx
<PlanCards />
```

### CheckoutButton
Botão para iniciar checkout.

```jsx
<CheckoutButton />
```

### SubscriptionDashboard
Dashboard com informações de assinatura.

```jsx
<SubscriptionDashboard />
```

## 🪝 Custom Hooks

### useGoogleLogin
```jsx
const { renderGoogleButton, handleGoogleSuccess } = useGoogleLogin();

// Renderizar botão
useEffect(() => {
  renderGoogleButton('google-button-id');
}, [renderGoogleButton]);
```

### useAppleLogin
```jsx
const { renderAppleButton } = useAppleLogin();

// Renderizar botão
useEffect(() => {
  renderAppleButton('apple-button-id');
}, [renderAppleButton]);
```

### useStripe
```jsx
const { startCheckout, checkSessionStatus } = useStripe();

// Iniciar checkout
await startCheckout();

// Verificar status da sessão
const session = await checkSessionStatus(sessionId);
```

## 🔗 Context Hooks

### useAuth
```jsx
const { user, token, loading, login, logout } = useAuth();

if (!user) return <div>Faça login</div>;
```

### useSubscription
```jsx
const { 
  selectedPlan, 
  setSelectedPlan,
  selectedCurrency,
  setSelectedCurrency,
  getPrice,
  getAnnualSavings
} = useSubscription();
```

## 📱 Responsividade

Todos os componentes são responsivos:
- Desktop: Grid com múltiplas colunas
- Tablet: Grid com 2-3 colunas
- Mobile: Single column

## 🔐 Segurança

- ✅ JWT tokens com expiração automática
- ✅ Dados sensíveis armazenados em localStorage
- ✅ HTTPS obrigatório em produção
- ✅ CORS configurado no backend
- ✅ Validação no servidor de todos os tokens

## 🎯 Próximos Passos

1. **Integrar com seu app:**
   ```jsx
   // Em seu App.jsx
   import SubscriptionPage from './subscription/pages/SubscriptionPage';
   
   <AuthProvider>
     <SubscriptionProvider>
       <SubscriptionPage />
     </SubscriptionProvider>
   </AuthProvider>
   ```

2. **Configurar variáveis de ambiente**

3. **Testar fluxo de login**

4. **Testar fluxo de pagamento (modo teste Stripe)**

5. **Customizar estilos se necessário**

## 📧 Suporte

Para problemas:
- Documentação Stripe: https://stripe.com/docs
- Google OAuth: https://developers.google.com/identity
- Apple Sign-In: https://developer.apple.com/sign-in-with-apple
