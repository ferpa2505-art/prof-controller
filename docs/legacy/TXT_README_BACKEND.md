# ProF Controller Backend

Backend Node.js + Express para gerenciar assinatura e pagamentos do ProF Controller com Stripe.

## 📋 Estrutura

```
server/
├── config/              # Configurações (banco, Stripe, SendGrid)
├── middleware/          # Middlewares (autenticação, erro)
├── models/             # Modelos de dados (User, Payment)
├── routes/             # Rotas (auth, subscription, user, webhook)
├── services/           # Serviços (Stripe, email)
├── utils/              # Funções utilitárias (serial generator)
├── index.js            # Servidor principal
├── package.json        # Dependências
├── .env.example        # Variáveis de exemplo
└── config/init-db.sql  # Script de inicialização do banco
```

## 🚀 Setup Rápido

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Banco de Dados

#### PostgreSQL (Recomendado)

```bash
# Criar banco de dados
createdb prof_controller

# Executar script de inicialização
psql -U postgres -d prof_controller -f config/init-db.sql
```

#### SQLite (Desenvolvimento Rápido)

Para usar SQLite em desenvolvimento, instale:
```bash
npm install sqlite3
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas chaves
nano .env
```

**Variáveis necessárias:**

```bash
# Banco de dados
DATABASE_HOST=localhost
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=prof_controller

# JWT (gerar com: openssl rand -base64 32)
JWT_SECRET=seu_secret_aqui

# Stripe (obter em https://stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (obter em https://sendgrid.com)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@profcontroller.app

# Google OAuth (obter em Google Cloud Console)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Apple Sign-In (obter em Apple Developer)
APPLE_CLIENT_ID=com.profcontroller.web
APPLE_TEAM_ID=xxxxx
APPLE_KEY_ID=xxxxx
APPLE_KEY_CONTENT=xxxxx

# URLs
FRONTEND_URL=https://ferpa2505-art.github.io/prof-controller
```

## 🏃 Executar

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

Servidor rodando em `http://localhost:3001`

### Produção

```bash
npm start
```

## 📚 API Endpoints

### Autenticação (sem token)

```bash
# Login com Google
POST /auth/google
Body: { "idToken": "google_id_token" }

# Login com Apple
POST /auth/apple
Body: { "identityToken": "apple_token", "userIdentifier": "...", "email": "...", "name": "..." }
```

### Assinatura (com token JWT)

```bash
# Criar sessão de checkout
POST /subscription/checkout
Header: Authorization: Bearer {token}
Body: { "plan": "monthly" | "annual", "currency": "BRL" | "EUR" }

# Recuperar detalhes da sessão
GET /subscription/session/:sessionId
Header: Authorization: Bearer {token}

# Listar histórico de pagamentos
GET /subscription/payments
Header: Authorization: Bearer {token}

# Criar portal de gerenciamento
POST /subscription/portal
Header: Authorization: Bearer {token}
```

### Usuário (com token JWT)

```bash
# Perfil do usuário
GET /user/profile
Header: Authorization: Bearer {token}

# Status da assinatura
GET /user/subscription-status
Header: Authorization: Bearer {token}

# Cancelar assinatura
POST /user/cancel-subscription
Header: Authorization: Bearer {token}
```

### Webhook (sem token)

```bash
# Eventos do Stripe
POST /webhook/stripe
Header: stripe-signature: {signature}
Body: {event_object}
```

## 🔑 Configurar Stripe

### 1. Criar Conta

1. Ir para [stripe.com](https://stripe.com)
2. Criar conta
3. Ir para Dashboard → API keys
4. Copiar chaves de teste:
   - `STRIPE_SECRET_KEY` (sk_test_...)
   - `STRIPE_PUBLIC_KEY` (pk_test_...)

### 2. Configurar Webhook

1. Ir para Dashboard → Webhooks
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seu-dominio.com/webhook/stripe`
4. Eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copiar "Signing secret" → `STRIPE_WEBHOOK_SECRET`

**Testar webhook localmente com Stripe CLI:**

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: seguir docs.stripe.com/stripe-cli/install

# Login
stripe login

# Forward events
stripe listen --forward-to localhost:3001/webhook/stripe

# Em outro terminal, testar evento
stripe trigger payment_intent.succeeded
```

## 📧 Configurar SendGrid

### 1. Criar Conta

1. Ir para [sendgrid.com](https://sendgrid.com)
2. Criar conta
3. Ir para Settings → API Keys
4. Criar nova API key
5. Copiar → `SENDGRID_API_KEY`

### 2. Configurar Remetente

1. Ir para Settings → Sender Authentication
2. Verificar domínio ou email
3. Usar em `SENDGRID_FROM_EMAIL`

## 🔐 Configurar Google OAuth

### 1. Google Cloud Console

1. Ir para [console.cloud.google.com](https://console.cloud.google.com)
2. Criar novo projeto
3. Ativar API: Google+ API
4. Ir para Credentials → Create OAuth 2.0 Client ID
5. Tipo: Web application
6. Origins autorizadas:
   - `http://localhost:3000`
   - `https://ferpa2505-art.github.io`
7. URIs redirect:
   - `http://localhost:3000/subscription/success`
   - `https://ferpa2505-art.github.io/subscription/success`
8. Copiar:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## 🍎 Configurar Apple Sign-In

### 1. Apple Developer Account

1. Ir para [developer.apple.com](https://developer.apple.com)
2. Registrar domínio: profcontroller.app
3. Criar Service ID para web
4. Ir para Certificates, Identifiers & Profiles → Keys
5. Criar nova chave (Sign in with Apple)
6. Download chave privada
7. Copiar:
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`
   - `APPLE_KEY_CONTENT` (base64 do arquivo p8)

## 🧪 Testes

```bash
# Executar testes
npm test

# Com coverage
npm test -- --coverage
```

## 📝 Logs

Todos os logs são enviados para console. Em produção, integrar com serviço de logging:
- Datadog
- Sentry
- LogRocket
- CloudWatch

## 🚨 Tratamento de Erros

Todos os erros retornam formato JSON:

```json
{
  "error": "Descrição do erro"
}
```

Status codes:
- `200`: Sucesso
- `400`: Erro de validação
- `401`: Não autenticado
- `404`: Não encontrado
- `500`: Erro interno

## 🔄 Fluxo de Pagamento

```
1. Frontend: Usuário clica "Assinar"
   ↓
2. Backend: POST /subscription/checkout
   ↓
3. Stripe: Redireciona para checkout page
   ↓
4. Usuário: Insere cartão
   ↓
5. Stripe: Processa pagamento
   ↓
6. Backend: Webhook checkout.session.completed
   ↓
7. Backend: Atualiza user.subscription_status = 'active'
   ↓
8. Backend: Envia email de comprovante
   ↓
9. Frontend: Redireciona para /subscription/success
```

## 🔐 Segurança

- ✅ JWT tokens com expiração de 30 dias
- ✅ HTTPS obrigatório em produção
- ✅ Validação de webhook com assinatura Stripe
- ✅ Senhas/chaves em variáveis de ambiente
- ✅ CORS configurado
- ✅ Rate limiting recomendado em produção

## 📞 Suporte

Para dúvidas:
- Docs Stripe: [stripe.com/docs](https://stripe.com/docs)
- Docs SendGrid: [sendgrid.com/docs](https://sendgrid.com/docs)
- Docs Google OAuth: [developers.google.com](https://developers.google.com)
- Docs Apple: [developer.apple.com](https://developer.apple.com)

## 🔄 Próximos Passos

- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Setup de logging centralizado
- [ ] Testes de integração Stripe
- [ ] Testes de envio de email
- [ ] Deploy em AWS/Heroku
- [ ] Monitoramento com Sentry
