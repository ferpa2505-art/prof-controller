# 🔧 Implementação de Sistema de Assinatura - Guia Técnico

## 🎯 Visão Geral

```
Usuário registra com Google/Apple
    ↓
Sistema gera Serial único
    ↓
Escolhe Plano (Mensal/Anual)
    ↓
Paga via Stripe
    ↓
Recebe Email com Serial
    ↓
Acesso ao app premium
```

---

## 📦 Tecnologias Necessárias

### Backend (Node.js/Express)
```bash
npm install stripe
npm install firebase-admin          # Google Sign-In
npm install apple-signin           # Apple Sign-In
npm install sendgrid               # Email
npm install jwt-simple             # Tokens
npm install dotenv                 # Config
```

### Frontend (React/Vue)
```bash
npm install stripe-react           # Payment form
npm install @react-oauth/google    # Google auth
npm install appleid-signin         # Apple auth
```

---

## 🔐 Passo 1: Autenticação Google/Apple

### Backend - Rota de Login

```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jwt-simple');
const router = express.Router();

// Login com Google
router.post('/auth/google', async (req, res) => {
  const { idToken, email } = req.body;
  
  try {
    // Verificar token Google
    const ticket = await google.auth.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const userId = payload['sub']; // ID único do Google
    
    // Buscar ou criar usuário
    let user = await db.query(
      'SELECT * FROM users WHERE google_id = ?',
      [userId]
    );
    
    if (!user) {
      // Primeiro login - criar usuário
      const serial = generateSerial(); // PC-2026-XX-XXXXX-XXXXX
      
      await db.query(
        `INSERT INTO users (google_id, email, serial, created_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, email, serial]
      );
    }
    
    // Gerar JWT token
    const token = jwt.encode({
      googleId: userId,
      email: email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
    }, process.env.JWT_SECRET);
    
    res.json({ token, serial: user?.serial });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Login com Apple
router.post('/auth/apple', async (req, res) => {
  const { identityToken, email } = req.body;
  
  try {
    // Verificar token Apple
    const ticket = await apple.verifyIdToken(identityToken);
    const userId = ticket.sub; // ID único da Apple
    
    // Mesmo processo do Google
    let user = await db.query(
      'SELECT * FROM users WHERE apple_id = ?',
      [userId]
    );
    
    if (!user) {
      const serial = generateSerial();
      await db.query(
        `INSERT INTO users (apple_id, email, serial, created_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, email, serial]
      );
    }
    
    const token = jwt.encode({
      appleId: userId,
      email: email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    }, process.env.JWT_SECRET);
    
    res.json({ token, serial: user?.serial });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Função para gerar serial único
function generateSerial() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random1 = Math.random().toString(16).substr(2, 5).toUpperCase();
  const random2 = Math.random().toString(16).substr(2, 5).toUpperCase();
  return `PC-${year}-${month}-${random1}-${random2}`;
}

module.exports = router;
```

---

## 💳 Passo 2: Sistema de Pagamento (Stripe)

### Backend - Rota de Checkout

```javascript
// routes/subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definir preços por país
const PRICES = {
  'BR': { monthly: 967, annual: 9290, currency: 'brl' },      // R$ 9,67 e 92,90
  'DE': { monthly: 967, annual: 9290, currency: 'eur' },      // € 9,67 e 92,90
  'US': { monthly: 967, annual: 9290, currency: 'usd' }       // Converter para USD
};

router.post('/subscription/checkout', authenticateUser, async (req, res) => {
  const { plan, country } = req.body;
  const user = req.user; // De middleware JWT
  
  try {
    const pricing = PRICES[country] || PRICES['US'];
    const amount = plan === 'monthly' ? pricing.monthly : pricing.annual;
    
    // Criar sessão Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: pricing.currency,
          product_data: {
            name: `ProF Controller ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
            description: `Serial: ${user.serial}`
          },
          unit_amount: amount
        },
        quantity: 1
      }],
      mode: 'subscription',
      recurring: {
        interval: plan === 'monthly' ? 'month' : 'year',
        interval_count: 1
      },
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        user_id: user.id,
        serial: user.serial,
        plan: plan,
        country: country
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook Stripe (confirmação de pagamento)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch(event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Atualizar banco de dados
        await db.query(
          `UPDATE users SET subscription_status = 'active',
                           stripe_customer_id = ?,
                           subscription_plan = ?,
                           next_billing_date = DATE_ADD(NOW(), INTERVAL 1 MONTH)
           WHERE id = ?`,
          [session.customer, session.metadata.plan, session.metadata.user_id]
        );
        
        // Registrar pagamento
        await db.query(
          `INSERT INTO payment_history (user_id, amount, currency, status, transaction_id)
           VALUES (?, ?, ?, 'success', ?)`,
          [session.metadata.user_id, session.amount_total / 100, 
           session.currency, session.payment_intent]
        );
        
        // Enviar email de confirmação
        await sendEmail({
          to: session.customer_email,
          subject: '✅ Bem-vindo ao ProF Controller Premium!',
          template: 'subscription_welcome',
          data: {
            serial: session.metadata.serial,
            plan: session.metadata.plan,
            amount: session.amount_total / 100
          }
        });
        
        break;
        
      case 'invoice.payment_succeeded':
        // Renovação mensal/anual
        await sendEmail({
          to: event.data.object.customer_email,
          subject: '📄 Comprovante de Renovação - ProF Controller',
          template: 'subscription_renewal',
          data: {
            amount: event.data.object.amount_paid / 100,
            period: event.data.object.period_start
          }
        });
        break;
        
      case 'customer.subscription.deleted':
        // Cancelamento
        await db.query(
          `UPDATE users SET subscription_status = 'cancelled',
                           cancellation_date = NOW()
           WHERE stripe_customer_id = ?`,
          [event.data.object.customer]
        );
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
```

---

## 📧 Passo 3: Sistema de Email

### SendGrid Setup

```javascript
// services/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, template, data }) {
  const templates = {
    'subscription_welcome': `
      <h1>✅ Bem-vindo ao ProF Controller Premium!</h1>
      <p>Obrigado por assinar conosco!</p>
      <p><strong>Seu Serial:</strong> ${data.serial}</p>
      <p><strong>Plano:</strong> ${data.plan === 'monthly' ? 'Mensal' : 'Anual'}</p>
      <p><strong>Valor:</strong> ${data.amount}</p>
      <p>Guarde este número com segurança. É sua chave de acesso ao ProF Controller!</p>
    `,
    'subscription_renewal': `
      <h1>📄 Comprovante de Renovação</h1>
      <p>Sua assinatura foi renovada com sucesso!</p>
      <p><strong>Valor cobrado:</strong> ${data.amount}</p>
      <p>Acesso continua ativo até a próxima renovação.</p>
    `,
    'subscription_cancelled': `
      <h1>Assinatura Cancelada</h1>
      <p>Sua assinatura foi cancelada.</p>
      <p>Você pode reativar a qualquer momento.</p>
    `
  };
  
  const msg = {
    to,
    from: 'assinatura@profcontroller.app',
    subject,
    html: templates[template]
  };
  
  try {
    await sgMail.send(msg);
    console.log(`Email enviado para: ${to}`);
  } catch (error) {
    console.error(`Erro ao enviar email: ${error}`);
  }
}

module.exports = { sendEmail };
```

---

## 🎨 Passo 4: Frontend - Página de Assinatura

```javascript
// components/SubscriptionPage.jsx
import { GoogleLogin } from '@react-oauth/google';
import { AppleSignin } from 'appleid-signin';
import { loadStripe } from '@stripe/stripe-js';

export default function SubscriptionPage() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [country, setCountry] = useState('BR');
  
  const prices = {
    'BR': { monthly: 9.67, annual: 92.90 },
    'DE': { monthly: 9.67, annual: 92.90 },
    'US': { monthly: 9.67, annual: 92.90 }
  };
  
  const handleGoogleLogin = async (credentialResponse) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: credentialResponse.credential,
        email: credentialResponse.email
      })
    });
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data);
  };
  
  const handleCheckout = async () => {
    const response = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        plan: selectedPlan,
        country: country
      })
    });
    
    const { sessionId } = await response.json();
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    stripe.redirectToCheckout({ sessionId });
  };
  
  return (
    <div className="subscription-page">
      {!user ? (
        <div className="login-section">
          <h1>Acesso Premium</h1>
          
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log('Login Failed')}
          />
          
          <AppleSignin
            clientID={process.env.REACT_APP_APPLE_CLIENT_ID}
            teamID={process.env.REACT_APP_APPLE_TEAM_ID}
            keyID={process.env.REACT_APP_APPLE_KEY_ID}
            onSuccess={handleAppleLogin}
          />
        </div>
      ) : (
        <div className="plans-section">
          <h2>Serial: {user.serial}</h2>
          
          <label>
            País:
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="BR">Brasil (R$)</option>
              <option value="DE">Europa (€)</option>
              <option value="US">EUA ($)</option>
            </select>
          </label>
          
          <div className="plans">
            <div 
              className={`plan ${selectedPlan === 'monthly' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <h3>Mensal</h3>
              <p className="price">{prices[country]?.monthly}/mês</p>
              <button onClick={handleCheckout}>Assinar</button>
            </div>
            
            <div 
              className={`plan popular ${selectedPlan === 'annual' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('annual')}
            >
              <span className="badge">-20% de desconto</span>
              <h3>Anual</h3>
              <p className="price">{prices[country]?.annual}/ano</p>
              <p className="save">Economize {(prices[country]?.monthly * 12 * 0.2).toFixed(2)}</p>
              <button onClick={handleCheckout}>Assinar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🗄️ Banco de Dados - Schema

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  serial VARCHAR(50) NOT NULL UNIQUE,
  country VARCHAR(2),
  subscription_status VARCHAR(20),     -- active, cancelled, expired
  subscription_plan VARCHAR(20),       -- monthly, annual
  stripe_customer_id VARCHAR(255),
  next_billing_date DATETIME,
  cancellation_date DATETIME,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(20),                 -- success, failed, pending
  transaction_id VARCHAR(255),
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 Passos Iniciais

1. **Criar conta Stripe:** https://stripe.com
2. **Criar conta SendGrid:** https://sendgrid.com
3. **Setup Google OAuth:** https://console.cloud.google.com
4. **Setup Apple Sign-In:** https://developer.apple.com
5. **Criar email:** assinatura@profcontroller.app
6. **Copiar código acima**
7. **Deploy backend**
8. **Testar em produção**

---

## 🧪 Checklist de Testes

- [ ] Login Google funciona
- [ ] Login Apple funciona
- [ ] Serial é gerado corretamente
- [ ] Checkout Stripe abre
- [ ] Pagamento é processado
- [ ] Email de confirmação é enviado
- [ ] Renovação automática funciona
- [ ] Cancelamento funciona
- [ ] Preços estão corretos (BRL/EUR)

---

Pronto para começar a implementação? 🚀
