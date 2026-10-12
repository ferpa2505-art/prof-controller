# 🗺️ Roadmap de Implementação - Sistema de Assinatura

## 📊 Status Atual (v1.0.0)

```
✅ COMPLETO:
- App web funcional
- Notificações + Recorrência
- Calculadora financeira
- News tab
- Versioning system
- Build multiplataforma (Windows, Linux, Web)

🔄 EM PROGRESSO:
- Sistema de assinatura (planejado)
```

---

## 🎯 Plano de Implementação (4 Semanas)

### SEMANA 1: Setup e Pesquisa (Já iniciado ✅)

**Status:** 80% Completo

```
✅ Pesquisa de plataformas:
   - Stripe (WEB/DESKTOP) ← RECOMENDADO
   - RevenueCat (APPS)
   - Google Play Billing (Android)
   - App Store Server API (iOS)
   - Asaas (Brasil)
   - Paddle (Multi-região)

✅ Documentação criada:
   - SUBSCRIPTION_PLAN.md
   - SUBSCRIPTION_IMPLEMENTATION.md
   - SUBSCRIPTION_SUMMARY.txt

⏳ Próximos passos:
   - [ ] Criar conta Stripe
   - [ ] Criar conta SendGrid
   - [ ] Setup Google OAuth
   - [ ] Setup Apple Sign-In
```

---

### SEMANA 2: Backend de Assinatura

**Timeline:** Começar segunda-feira

#### Fase 2.1: Autenticação (2-3 dias)
```javascript
✓ Login Google
  ├─ Implementar rota POST /auth/google
  ├─ Verificar idToken
  ├─ Criar usuário se não existe
  └─ Gerar JWT token

✓ Login Apple
  ├─ Implementar rota POST /auth/apple
  ├─ Verificar identityToken
  ├─ Criar usuário se não existe
  └─ Gerar JWT token

✓ Geração de Serial
  ├─ Formato: PC-{YYYY}-{MM}-{XXXXX}-{YYYYY}
  ├─ Guardar no banco de dados
  └─ Retornar ao usuário
```

**Código a usar:**
- `SUBSCRIPTION_IMPLEMENTATION.md` → Seção "Backend - Rota de Login"

#### Fase 2.2: Banco de Dados (1 dia)
```sql
✓ Tabela users
  ├─ google_id, apple_id
  ├─ serial (único)
  ├─ email
  ├─ subscription_status
  ├─ stripe_customer_id
  └─ next_billing_date

✓ Tabela payment_history
  ├─ user_id
  ├─ amount, currency
  ├─ transaction_id
  └─ status
```

**Código a usar:**
- `SUBSCRIPTION_IMPLEMENTATION.md` → Seção "Banco de Dados - Schema"

#### Fase 2.3: Integração Stripe (2-3 dias)
```javascript
✓ Rota de checkout
  ├─ POST /subscription/checkout
  ├─ Criar sessão Stripe
  ├─ Retornar sessionId

✓ Webhook de pagamento
  ├─ POST /webhook/stripe
  ├─ Validar assinatura
  ├─ Atualizar status usuario
  └─ Enviar email

✓ Processamento de pagamentos
  ├─ Suporte a múltiplas moedas (BRL, EUR)
  ├─ Assinatura recorrente
  └─ Renovação automática
```

**Código a usar:**
- `SUBSCRIPTION_IMPLEMENTATION.md` → Seção "Backend - Rota de Checkout"

---

### SEMANA 3: Frontend + Email

**Timeline:** Começar segunda-feira

#### Fase 3.1: Email Automático (1-2 dias)
```javascript
✓ Setup SendGrid
  ├─ Criar conta em https://sendgrid.com
  ├─ Gerar API key
  └─ Configurar em .env

✓ Templates de email
  ├─ Bem-vindo (primeira compra)
  ├─ Renovação mensal
  ├─ Renovação anual
  └─ Cancelamento

✓ Envio automático via webhook Stripe
  ├─ checkout.session.completed
  ├─ invoice.payment_succeeded
  └─ customer.subscription.deleted
```

**Código a usar:**
- `SUBSCRIPTION_IMPLEMENTATION.md` → Seção "Backend - Sistema de Email"

#### Fase 3.2: Frontend de Pagamento (2-3 dias)
```javascript
✓ Página de assinatura
  ├─ Botão "Login com Google"
  ├─ Botão "Login com Apple"
  └─ Exibir serial do usuário

✓ Seleção de plano
  ├─ Card: Mensal (R$ 9,67)
  ├─ Card: Anual (R$ 92,90 com -20%)
  └─ Seletor de país (BRL/EUR)

✓ Checkout
  ├─ Integração Stripe
  ├─ Redirecionamento para sucesso
  └─ Tratamento de erros
```

**Código a usar:**
- `SUBSCRIPTION_IMPLEMENTATION.md` → Seção "Frontend - Página de Assinatura"

#### Fase 3.3: Dashboard de Assinatura (1-2 dias)
```
✓ Painel do usuário
  ├─ Serial do usuário
  ├─ Status da assinatura
  ├─ Próxima data de renovação
  ├─ Botão para cancelar
  └─ Histórico de pagamentos
```

---

### SEMANA 4: Testes e Deploy

**Timeline:** Começar segunda-feira

#### Fase 4.1: Testes (2-3 dias)
```
✓ Testes unitários
  ├─ Autenticação Google/Apple
  ├─ Geração de serial
  ├─ Cálculo de preços

✓ Testes de integração
  ├─ Fluxo de checkout Stripe
  ├─ Webhook de pagamento
  ├─ Envio de email

✓ Testes de usuário
  ├─ Login funciona?
  ├─ Pagamento funciona?
  ├─ Email chega?
  ├─ Renovação automática?
```

#### Fase 4.2: Deploy (1-2 dias)
```
✓ Ambiente de produção
  ├─ Deploy backend
  ├─ Configurar variáveis de ambiente
  ├─ Setupar banco de dados
  └─ Testar webhooks

✓ Go-live
  ├─ Comunicar aos usuários
  ├─ Monitorar erros
  ├─ Suporte 24/7
```

---

## 💾 Arquivos Necessários

### Frontend (React)
```
src/
├── pages/
│   └── SubscriptionPage.jsx
├── components/
│   ├── LoginButtons.jsx
│   ├── PlanCards.jsx
│   ├── Checkout.jsx
│   └── SubscriptionDashboard.jsx
└── hooks/
    └── useStripe.js
```

### Backend (Node.js)
```
server/
├── routes/
│   ├── auth.js           # Google/Apple login
│   ├── subscription.js   # Checkout e webhook
│   └── user.js           # Dashboard
├── models/
│   ├── User.js
│   └── Payment.js
├── services/
│   ├── stripe.js         # Stripe SDK
│   ├── email.js          # SendGrid
│   └── serial.js         # Geração de serial
└── .env                  # Variáveis sensíveis
```

---

## 🔑 Variáveis de Ambiente Necessárias

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Apple Sign-In
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_KEY_CONTENT=...

# JWT
JWT_SECRET=seu_secret_super_secreto

# Database
DATABASE_URL=postgresql://...
DATABASE_USER=...
DATABASE_PASSWORD=...

# URLs
FRONTEND_URL=https://ferpa2505-art.github.io/prof-controller
BACKEND_URL=https://api.profcontroller.app
```

---

## 📱 Próximas Fases (Após v1.0.1)

### v1.1.0: Google Play + App Store (Semana 5-6)
```
- Google Play Billing API
- App Store Server API
- RevenueCat integração
- APK + IPA com assinatura
```

### v1.2.0: Dashboard Admin (Semana 7-8)
```
- Analytics de assinantes
- MRR (Monthly Recurring Revenue)
- Churn rate
- Controle de cancelamentos
```

### v1.3.0: Melhorias (Semana 9+)
```
- PIX/Asaas para Brasil
- Renovação manual
- Múltiplos planos (Pro, Enterprise)
- Cupons e promocodes
```

---

## ✅ Checklist de Implementação

### Antes de Começar
- [ ] Conta Stripe criada
- [ ] Chaves Stripe anotadas
- [ ] Conta SendGrid criada
- [ ] Email assinatura@profcontroller.app criado
- [ ] OAuth Google/Apple configurado
- [ ] Banco de dados preparado

### Semana 1
- [ ] SUBSCRIPTION_PLAN.md lido
- [ ] SUBSCRIPTION_IMPLEMENTATION.md estudado
- [ ] Contas criadas e configuradas
- [ ] .env preparado

### Semana 2
- [ ] Rota /auth/google implementada
- [ ] Rota /auth/apple implementada
- [ ] Serial generation funcionando
- [ ] Tabelas criadas no banco
- [ ] Rota /subscription/checkout implementada
- [ ] Webhook Stripe configurado

### Semana 3
- [ ] SendGrid templates criados
- [ ] Envio de email funcionando
- [ ] SubscriptionPage.jsx criada
- [ ] Botões Google/Apple funcionando
- [ ] Cards de plano mostrando preços corretos
- [ ] Checkout Stripe redirecionando

### Semana 4
- [ ] Testes passando
- [ ] Deploy em produção
- [ ] Webhooks funcionando
- [ ] Email sendo enviado
- [ ] Usuários conseguindo renovar automaticamente

---

## 📞 Próximo Passo

**Confirme uma das opções:**

1. **Começar agora:** Você quer implementar a Semana 2 (Backend)?
2. **Setup primeiro:** Você quer que eu ajude com setup de contas (Stripe/SendGrid)?
3. **Criar backend:** Você quer que eu crie a estrutura Node.js com todas as rotas?
4. **Parar aqui:** Você prefere parar no planejamento por enquanto?

---

**Status: PRONTO PARA COMEÇAR SEMANA 2** ✅
