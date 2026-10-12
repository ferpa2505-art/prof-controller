# Guia de Integração do Frontend React

## 📋 Sumário

Este guia descreve como integrar o sistema de assinatura React no ProF Controller.

## 🎯 Objetivo

Adicionar página de assinatura ao ProF Controller com:
- Login via Google OAuth + Apple Sign-In
- Seleção de planos (mensal/anual)
- Integração Stripe para pagamento
- Dashboard de assinatura
- Histórico de pagamentos

## 📦 O que foi criado

### Estrutura de Componentes React
```
src/subscription/
├── components/  (4 componentes principais)
├── pages/       (SubscriptionPage)
├── context/     (2 contexts: Auth, Subscription)
├── hooks/       (3 custom hooks)
├── services/    (API service)
└── styles/      (5 arquivos CSS)
```

### Total de 22 arquivos criados

## 🚀 Como Integrar

### Opção 1: Integração Rápida (Recomendado)

#### 1. Adicionar Providers ao seu App.jsx

```jsx
// App.jsx
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

#### 2. Criar arquivo `.env` na raiz do projeto

```bash
# .env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxx
REACT_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

#### 3. Adicionar scripts ao index.html

```html
<!-- index.html -->
<script async src="https://accounts.google.com/gsi/client"></script>
<script async src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js"></script>
<script async src="https://js.stripe.com/v3/"></script>
```

#### 4. Instalar dependências (se necessário)

```bash
npm install react-dom
```

#### 5. Testar localmente

```bash
npm start
```

Abrir `http://localhost:3000`

---

### Opção 2: Integração Customizada

Se você quer integrar apenas alguns componentes:

#### Exemplo 1: Apenas botão de checkout

```jsx
import { AuthProvider } from './subscription/context/AuthContext';
import { SubscriptionProvider } from './subscription/context/SubscriptionContext';
import CheckoutButton from './subscription/components/CheckoutButton';

function MyApp() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <CheckoutButton />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
```

#### Exemplo 2: Apenas cards de plano

```jsx
import { SubscriptionProvider } from './subscription/context/SubscriptionContext';
import PlanCards from './subscription/components/PlanCards';

function MyApp() {
  return (
    <SubscriptionProvider>
      <PlanCards />
    </SubscriptionProvider>
  );
}
```

#### Exemplo 3: Apenas login

```jsx
import { AuthProvider } from './subscription/context/AuthContext';
import LoginButtons from './subscription/components/LoginButtons';

function MyApp() {
  return (
    <AuthProvider>
      <LoginButtons />
    </AuthProvider>
  );
}
```

---

## 🔧 Configuração Detalhada

### 1. Backend API

Certifique-se de que o backend está rodando:

```bash
cd server
npm install
node index.js
```

Servidor deve estar em `http://localhost:3001`

### 2. Variáveis de Ambiente (.env)

```bash
# Obrigatório
REACT_APP_API_URL=http://localhost:3001

# Stripe (obter em https://stripe.com)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Google OAuth (obter em https://console.cloud.google.com)
REACT_APP_GOOGLE_CLIENT_ID=....apps.googleusercontent.com

# Apple Sign-In (obter em https://developer.apple.com)
REACT_APP_APPLE_CLIENT_ID=com.profcontroller.web
REACT_APP_APPLE_TEAM_ID=...
REACT_APP_APPLE_KEY_ID=...
```

### 3. Scripts HTML

O React vai carregar esses scripts automaticamente, mas você pode adicionar ao index.html:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ProF Controller</title>
    
    <!-- Scripts externos -->
    <script async src="https://accounts.google.com/gsi/client"></script>
    <script async src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js"></script>
    <script async src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

## 🔑 Obtendo as Chaves Necessárias

### Stripe

1. Ir para https://stripe.com
2. Login ou criar conta
3. Dashboard → API keys
4. Copiar `Publishable key` → `REACT_APP_STRIPE_PUBLIC_KEY`

**Dados de teste (não cobram):**
- Card: 4242 4242 4242 4242
- Exp: 12/34
- CVC: 123

### Google OAuth

1. Ir para https://console.cloud.google.com
2. Criar projeto
3. Ativar "Google+ API"
4. Credentials → OAuth 2.0 Client ID
5. Tipo: Web application
6. Copiar Client ID → `REACT_APP_GOOGLE_CLIENT_ID`

**URIs autorizadas:**
- `http://localhost:3000`
- `https://ferpa2505-art.github.io`

### Apple Sign-In

1. Ir para https://developer.apple.com
2. Registrar app como "Web"
3. Configurar "Sign in with Apple"
4. Copiar valores para .env

---

## 📁 Estrutura de Arquivos Mínima

Para que tudo funcione, você precisa de:

```
seu-projeto-react/
├── src/
│   ├── subscription/          ← Copiar pasta inteira daqui
│   └── App.jsx                ← Modificar (adicionar providers)
├── .env                       ← Criar com variáveis
└── index.html                 ← Adicionar scripts
```

---

## 🔄 Fluxo de Dados

### Quando usuário faz login com Google:

```
1. GoogleButton clicado
   ↓
2. Google SDK abre modal
   ↓
3. Usuário autentica
   ↓
4. useGoogleLogin() recebe idToken
   ↓
5. Chama apiService.loginWithGoogle(idToken)
   ↓
6. Backend valida token
   ↓
7. Backend cria/atualiza usuário
   ↓
8. Backend retorna { token, user }
   ↓
9. useAuth() salva em localStorage
   ↓
10. SubscriptionPage renderiza PlanCards
```

### Quando usuário faz checkout:

```
1. CheckoutButton clicado
   ↓
2. useStripe.startCheckout() chamado
   ↓
3. Chama apiService.createCheckoutSession()
   ↓
4. Backend cria sessão Stripe
   ↓
5. Frontend redireciona para Stripe checkout
   ↓
6. Usuário insere cartão (em domínio Stripe)
   ↓
7. Stripe processa pagamento
   ↓
8. Redireciona para /subscription/success
   ↓
9. Backend recebe webhook
   ↓
10. User.subscription_status = 'active'
   ↓
11. Email de confirmação enviado
```

---

## 🧪 Testando Localmente

### Terminal 1: Backend

```bash
cd server
npm install
npm run dev
```

Deve exibir: `🚀 Backend rodando em http://localhost:3001`

### Terminal 2: Frontend

```bash
npm install
npm start
```

Deve abrir `http://localhost:3000`

### Testar fluxo:

1. ✅ Página carrega sem erros
2. ✅ Botão Google aparece
3. ✅ Clica em Google → modal abre
4. ✅ Simular login (teste)
5. ✅ Vê cards de plano
6. ✅ Clica "Pagar" → redireciona para Stripe
7. ✅ Usa card de teste 4242 4242 4242 4242
8. ✅ Pagamento é processado
9. ✅ Redirecionado para sucesso

---

## 🐛 Troubleshooting

### Erro: "Google SDK not loaded"

**Solução:**
```html
<!-- Adicionar ao index.html -->
<script async src="https://accounts.google.com/gsi/client"></script>
```

### Erro: "STRIPE_PUBLIC_KEY is undefined"

**Solução:**
```bash
# .env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

Reiniciar: `npm start`

### Erro: "CORS error"

**Solução:**
Certifique-se que backend tem CORS configurado:

```javascript
// server/index.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Erro: "Cannot find module 'subscription'"

**Solução:**
Copiar pasta `src/subscription/` do repo para seu projeto.

---

## 📚 Recursos Adicionais

- **Frontend README:** `src/subscription/README.md`
- **Backend README:** `server/README.md`
- **Rotas API:** `server/README.md#-endpoints-da-api`

---

## ✅ Checklist de Implementação

- [ ] Copiar pasta `src/subscription/`
- [ ] Atualizar `App.jsx` com providers
- [ ] Criar arquivo `.env`
- [ ] Preencher variáveis de ambiente
- [ ] Adicionar scripts ao `index.html`
- [ ] Backend rodando em `localhost:3001`
- [ ] Frontend rodando em `localhost:3000`
- [ ] Testar login com Google
- [ ] Testar login com Apple
- [ ] Testar seleção de plano
- [ ] Testar checkout Stripe
- [ ] Testar webhook (opcional)
- [ ] Customizar estilos CSS
- [ ] Deploy em produção

---

## 🚀 Deploy em Produção

### Frontend

```bash
# Build
npm run build

# Deploy no GitHub Pages
npm run deploy
```

### Backend

Opções:
- Heroku
- AWS Lambda
- DigitalOcean
- Railway.app
- Render.com

---

## 📞 Suporte

Para dúvidas, consulte:
- `src/subscription/README.md`
- `server/README.md`
- IMPLEMENTATION_ROADMAP.md
