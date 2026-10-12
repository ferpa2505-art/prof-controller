# 💳 Sistema de Assinatura ProF Controller - Plano Completo

## 📋 Requisitos do Projeto

### 🔐 Autenticação
- ✅ Google Login (Gmail)
- ✅ Apple ID (iCloud)
- ✅ Cada login gera número serial único
- ✅ Serial = assinatura do usuário

### 💰 Preços

#### Brasil (BRL)
| Período | Preço Normal | Desconto | Preço Final |
|---------|-------------|----------|------------|
| Mensal | R$ 9,67 | - | R$ 9,67 |
| Anual | R$ 116,12 | -20% | R$ 92,90 |

#### Exterior (EUR)
| Período | Preço Normal | Desconto | Preço Final |
|---------|-------------|----------|------------|
| Mensal | €9,67 | - | €9,67 |
| Anual | €116,12 | -20% | €92,90 |

### 📧 Notificações
- ✅ Email mensal (renovação + comprovante)
- ✅ Email anual (renovação + comprovante)
- ✅ Email de confirmação (primeira compra)
- ✅ Email de cancelamento

---

## 🔍 Plataformas de Pagamento - PESQUISA

### 1. **Stripe** ⭐⭐⭐⭐⭐
**Melhor opção para assinatura recorrente**

```
✅ Suporta:
- Assinatura mensal/anual
- Google Pay + Apple Pay
- Cartão de crédito
- Cobrança em múltiplas moedas
- Webhooks para automação
- SDK para iOS e Android

💰 Custos:
- Taxa: 2,9% + R$ 0,30 por transação
- Sem custo de setup
- Sem custo mensal
- Cobra apenas o que vender

❌ Limitações:
- Cobra taxa em toda transação
- Requer integração com backend

📖 Docs: https://stripe.com/docs/billing/subscriptions
```

---

### 2. **RevenueCat** ⭐⭐⭐⭐⭐
**RECOMENDADO - Especificamente para apps**

```
✅ Suporta:
- Integração nativa com App Store e Google Play
- Assinatura mensal/anual
- Gerenciamento de serial automático
- Webhooks para notificações
- Dashboard de analytics
- Suporte a múltiplas moedas

💰 Custos:
- Grátis até $10k MRR
- Depois: 1% das receitas
- Sem custo de setup

❌ Limitações:
- Não processa pagamentos direto
- Usa App Store e Google Play (take rate ~30%)

📖 Docs: https://www.revenuecat.com
✅ Recomendado para: Apps iOS/Android
```

---

### 3. **Paddle** ⭐⭐⭐⭐
**Boa opção multi-região**

```
✅ Suporta:
- Assinatura mensal/anual
- 170+ países
- Google Pay + Apple Pay
- Cobrança em múltiplas moedas
- Webhooks automáticas
- Conformidade GDPR

💰 Custos:
- Taxa: 5,8% + $ 0,50 por transação (EUA)
- Taxa: 2% + € 0,5 por transação (Europa)
- Sem custo mensal

❌ Limitações:
- Taxa mais alta que Stripe
- Menos documentação

📖 Docs: https://developer.paddle.com
✅ Recomendado para: Web + Desktop
```

---

### 4. **Google Play Billing** ⭐⭐⭐⭐
**Obrigatório para Google Play Store**

```
✅ Suporta:
- Assinatura nativa no Android
- Integração direta na Google Play
- Cobrança automática
- 30% de take rate (padrão lojas)

💰 Custos:
- 30% de take rate (padrão indústria)
- Sem custo de integração

❌ Limitações:
- Obrigatório para Play Store
- Não pode processar fora do app

📖 Docs: https://developer.android.com/google/play/billing
✅ Obrigatório para: Android App
```

---

### 5. **App Store Server API** ⭐⭐⭐⭐
**Obrigatório para Apple App Store**

```
✅ Suporta:
- Assinatura nativa no iOS
- Integração direta na App Store
- Cobrança automática
- 30% de take rate (padrão lojas)

💰 Custos:
- 30% de take rate (padrão indústria)
- Sem custo de integração

❌ Limitações:
- Obrigatório para App Store
- Não pode processar fora do app

📖 Docs: https://developer.apple.com/app-store-server-api
✅ Obrigatório para: iOS App
```

---

### 6. **Asaas** ⭐⭐⭐
**Especializado em Brasil**

```
✅ Suporta:
- Assinatura mensal/anual
- PIX
- Boleto
- Cartão de crédito
- Cobrança em BRL

💰 Custos:
- Taxa: 1,99% (PIX) a 2,99% (crédito)
- Sem custo mensal

❌ Limitações:
- Principalmente Brasil
- Menos suporte a moedas estrangeiras

📖 Docs: https://asaas.com
✅ Recomendado para: Brasil
```

---

## 🎯 Recomendação Final

### Para Implementação em 3 Etapas:

```
ETAPA 1 (MVP - Agora):
├── Stripe para web/desktop
├── Cobrança em BRL e EUR
├── Email automático
└── Serial gerado no backend

ETAPA 2 (Lojas):
├── Google Play Billing para Android
├── App Store Server API para iOS
└── RevenueCat para gerenciar ambos

ETAPA 3 (Otimização):
├── PIX/Asaas para Brasil
├── Dashboard de admin
└── Analytics de conversão
```

---

## 🏗️ Arquitetura Proposta

```
Frontend (App)
    ↓
[Login Google/Apple] → Serial gerado
    ↓
[Seleção Plano] (Mensal/Anual)
    ↓
[Gateway Pagamento]
    ├─ Stripe (Web/Desktop)
    ├─ Google Play (Android)
    └─ App Store (iOS)
    ↓
[Confirmação + Email]
    ↓
[Dashboard do Usuário]
    └─ Ver assinatura + Serial
```

---

## 📧 Sistema de Email

### Email Necessário
```
Criar: assinatura@profcontroller.app

Usar serviço:
- SendGrid (Grátis até 100 emails/dia)
- AWS SES (Muito barato)
- Mailgun (Boa relação custo/benefício)
```

### Emails Automáticos

#### 1. Confirmação de Assinatura
```
De: assinatura@profcontroller.app
Para: usuario@gmail.com

Assunto: ✅ Bem-vindo ao ProF Controller Premium!

Seu serial: PC-2026-XXX-XXXX-XXXXX
Plano: Mensal / Anual
Próxima cobrança: DD/MM/YYYY
Valor: R$ 9,67 / €9,67
```

#### 2. Renovação Mensal/Anual
```
De: assinatura@profcontroller.app
Para: usuario@gmail.com

Assunto: 📄 Comprovante de Renovação - ProF Controller

Serial: PC-2026-XXX-XXXX-XXXXX
Período: 01/10/2026 - 31/10/2026 (Mensal)
Valor cobrado: R$ 9,67 / €9,67
Data cobrança: 01/10/2026
```

#### 3. Cancelamento
```
De: assinatura@profcontroller.app
Para: usuario@gmail.com

Assunto: Sua assinatura foi cancelada

Serial: PC-2026-XXX-XXXX-XXXXX
Data cancelamento: 19/09/2026
Acesso até: 19/10/2026
```

---

## 🗄️ Banco de Dados - Estrutura

```sql
-- Usuários com assinatura
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  serial TEXT UNIQUE,           -- PC-2026-XXX-XXXX-XXXXX
  google_id TEXT,              -- ou null
  apple_id TEXT,               -- ou null
  email TEXT NOT NULL,
  country TEXT,                -- BR, DE, etc
  currency TEXT,               -- BRL, EUR
  plan TEXT,                   -- monthly, yearly
  price DECIMAL(10,2),
  status TEXT,                 -- active, cancelled, expired
  stripe_subscription_id TEXT,
  payment_method TEXT,         -- stripe, google_play, app_store
  start_date DATETIME,
  next_billing_date DATETIME,
  cancellation_date DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY,
  subscription_id UUID,
  amount DECIMAL(10,2),
  currency TEXT,
  payment_gateway TEXT,
  status TEXT,                 -- success, failed, pending
  transaction_id TEXT,
  created_at DATETIME,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

---

## 🔑 Chave de Acesso

### Serial Format
```
PC-{YYYY}-{MM}-{XXXXX}-{YYYYY}

Exemplo:
PC-2026-09-19-AB123-CD456

Gerado como:
const serial = `PC-${year}-${month}-${randomHex(5)}-${randomHex(5)}`;
```

---

## 🚀 Timeline de Implementação

```
Semana 1:
├─ Pesquisa (completa)
├─ Definir plataforma pagamento
└─ Setup inicial Stripe

Semana 2:
├─ Backend API de assinatura
├─ Sistema de geração serial
└─ Integração email

Semana 3:
├─ Frontend de pagamento
├─ Dashboard de assinatura
└─ Testes

Semana 4:
├─ Deploy web
├─ Android (Google Play)
└─ iOS (App Store)
```

---

## ✅ Checklist de Próximos Passos

- [ ] Definir plataforma de pagamento (Stripe recomendado)
- [ ] Criar email assinatura@profcontroller.app
- [ ] Setup Stripe account (leva 30 min)
- [ ] Definir moeda (BRL + EUR)
- [ ] Criar estrutura banco de dados
- [ ] Implementar geração serial
- [ ] Setup email automático
- [ ] Implementar login Google/Apple
- [ ] Criar API de assinatura
- [ ] Testes e debug

---

## 📞 Próximos Passos

1. **Confirme:** Stripe + Email (SendGrid ou AWS SES)?
2. **Pesquise:** Conta Stripe
3. **Pesquise:** Email service
4. **Comece:** Backend de assinatura

---

**Importante:** Lojas (Play Store, App Store) têm próprios sistemas de pagamento que são obrigatórios para apps nativos (take rate 30%). A web/desktop pode usar Stripe com taxa menor (2,9%).
