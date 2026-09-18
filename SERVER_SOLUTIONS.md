# Soluções de Servidor para ProF Controller

## 📋 Problema

A verificação de alertas de preço **só funciona com o app aberto**. Para notificações 24/7, é necessário um servidor.

---

## 🎯 Objetivos de um Servidor

1. ✅ Verificar alertas **a cada minuto** (24/7)
2. ✅ Enviar notificações por **email** ou **push**
3. ✅ Sincronizar dados entre dispositivos
4. ✅ Manter histórico de alertas
5. ✅ Suportar múltiplos usuários

---

## 🏗️ Arquitetura Recomendada

### Stack Sugerida

```
Frontend (Cliente)
    ↓ (HTTPS)
Backend API (Node.js/Express)
    ├─ Autenticação (JWT)
    ├─ CRUD de Alertas
    ├─ Sincronização de Dados
    └─ Webhooks para Notificações
    ↓
Worker (Cron/Queue)
    ├─ Verificação de Preços (a cada 60s)
    ├─ Disparo de Notificas
    └─ Retry em caso de falha
    ↓
Database (PostgreSQL/MongoDB)
    ├─ Usuários
    ├─ Alertas
    ├─ Histórico
    └─ Logs
    ↓
Email Service (SendGrid/Mailgun)
    └─ Envio de notificações por email
    ↓
Push Service (Firebase Cloud Messaging)
    └─ Envio de notificações push
```

---

## 🔧 Opção 1: Node.js + Express + Redis

### Tempo de Implementação
⏱️ **2-3 semanas** (desenvolvimento + testes)

### Custo
- **Hosting**: $5-20/mês (Heroku, DigitalOcean, AWS)
- **Database**: $5-15/mês (PostgreSQL)
- **Email**: $0-10/mês (SendGrid free tier)
- **Total**: ~$20-45/mês

### Stack Detalhado

```javascript
// servidor/package.json
{
  "dependencies": {
    "express": "4.18.2",
    "jwt": "0.1.3",
    "pg": "8.10.0",           // PostgreSQL
    "redis": "4.6.8",         // Cache + Queue
    "bull": "4.11.3",         // Job Queue
    "node-cron": "3.0.2",     // Scheduler
    "axios": "1.6.2",         // HTTP client
    "firebase-admin": "12.0.0",
    "dotenv": "16.3.1"
  }
}
```

### Fluxo de Execução

```
1. Usuário cria alerta via app
   ↓ POST /api/alerts
2. Servidor salva em PostgreSQL
   ↓
3. Alerta adicionado à fila Redis
   ↓
4. Worker verifica a cada 60 segundos
   ├─ Busca cotação na API
   ├─ Compara com preço-alvo
   └─ Se disparar:
       ├─ Marcar como "triggered"
       ├─ Enviar email
       ├─ Enviar push notification
       └─ Salvar log
5. Cliente sincroniza status do alerta
```

### Exemplo: Arquivo Principal do Servidor

```javascript
// servidor/index.js
const express = require('express');
const { Pool } = require('pg');
const Queue = require('bull');
const cron = require('node-cron');

const app = express();
const db = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Fila de verificação de alertas
const alertQueue = new Queue('price-alerts', {
  redis: { url: process.env.REDIS_URL }
});

// CRUD: Criar alerta
app.post('/api/alerts', authenticateToken, async (req, res) => {
  const { userId, assetCode, type, targetPrice, currency } = req.body;
  
  const query = `
    INSERT INTO alerts (user_id, asset_code, type, target_price, currency, status)
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING id
  `;
  
  const result = await db.query(query, [userId, assetCode, type, targetPrice, currency]);
  const alertId = result.rows[0].id;
  
  // Adicionar à fila de verificação
  await alertQueue.add({ alertId }, { repeat: { every: 60000 } });
  
  res.json({ success: true, alertId });
});

// Worker: Verificar alertas a cada minuto
alertQueue.process(async (job) => {
  const { alertId } = job.data;
  
  // Buscar alerta do banco
  const alert = await db.query(
    'SELECT * FROM alerts WHERE id = $1',
    [alertId]
  );
  
  if (!alert.rows[0]) return; // Alerta deletado
  
  const { asset_code, target_price, type, user_id, status } = alert.rows[0];
  
  if (status === 'triggered') return; // Já disparou
  
  // Buscar preço atual (com fallback de APIs)
  const currentPrice = await fetchPrice(asset_code);
  
  // Verificar se deve disparar
  const shouldTrigger = (
    (type === 'above' && currentPrice >= target_price) ||
    (type === 'below' && currentPrice <= target_price)
  );
  
  if (shouldTrigger) {
    // Marcar como disparado
    await db.query(
      'UPDATE alerts SET status = $1 WHERE id = $2',
      ['triggered', alertId]
    );
    
    // Enviar notificações
    const user = await db.query(
      'SELECT email, push_token FROM users WHERE id = $1',
      [user_id]
    );
    
    await sendEmail(user.rows[0].email, {
      subject: `Alerta: ${asset_code} ${type === 'above' ? '↑' : '↓'} ${target_price}`,
      body: `Preço atual: ${currentPrice}`
    });
    
    await sendPush(user.rows[0].push_token, {
      title: 'Alerta de Preço',
      body: `${asset_code} atingiu ${currentPrice}`
    });
  }
});

// Cron: Limpar alertas disparados há 30 dias
cron.schedule('0 0 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
  await db.query(
    'DELETE FROM alerts WHERE status = $1 AND triggered_at < $2',
    ['triggered', thirtyDaysAgo]
  );
});

app.listen(process.env.PORT || 3000);
```

### Schema do Banco de Dados

```sql
-- usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  push_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- alertas
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  asset_code VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL,      -- 'above' | 'below'
  target_price DECIMAL(20,2),
  currency VARCHAR(3),
  status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'triggered'
  created_at TIMESTAMP DEFAULT NOW(),
  triggered_at TIMESTAMP,
  UNIQUE(user_id, asset_code, type, target_price)
);

-- historico
CREATE TABLE alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id),
  fired_at TIMESTAMP DEFAULT NOW(),
  price_at_time DECIMAL(20,2),
  notified_via VARCHAR(50)  -- 'email' | 'push' | 'both'
);

-- logs
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10),  -- 'INFO' | 'WARN' | 'ERROR'
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Opção 2: Serverless (AWS Lambda + DynamoDB)

### Tempo de Implementação
⏱️ **3-4 semanas**

### Custo
- **Lambda**: $0-1/mês (free tier 1M invocações)
- **DynamoDB**: $1-5/mês (pay-per-use)
- **EventBridge**: Grátis
- **SES Email**: $0-1/mês
- **Total**: ~$5-10/mês

### Vantagens
- ✅ Escalável automaticamente
- ✅ Sem servidor para gerenciar
- ✅ Paga apenas pelo uso

### Desvantagens
- ❌ Cold start (delay inicial)
- ❌ Curva de aprendizado AWS
- ❌ Mais caro com muitos usuários

### Stack

```
Frontend App
    ↓ HTTPS (API Gateway)
AWS Lambda (Node.js 18)
    ├─ GET /alerts
    ├─ POST /alerts
    ├─ DELETE /alerts/:id
    └─ PUT /alerts/:id
    ↓
DynamoDB (NoSQL)
    ├─ Table: users
    ├─ Table: alerts
    └─ Table: alert-history
    ↓
EventBridge (Cron)
    └─ Trigger Lambda a cada 60s
    ↓
SNS (Simple Notification Service)
    ├─ Email notifications
    └─ SMS alerts (opcional)
```

---

## 🔧 Opção 3: Firebase (Simples, Sem Backend)

### Tempo de Implementação
⏱️ **1-2 semanas**

### Custo
- **Firestore**: $0-15/mês (read/write)
- **Cloud Functions**: $0-1/mês (free tier)
- **Cloud Messaging**: Grátis
- **Total**: ~$5-20/mês

### Vantagens
- ✅ Muito simples (sem servidor Node.js)
- ✅ Integração fácil com cliente
- ✅ Realtime sync automática
- ✅ Excelente para startups

### Desvantagens
- ❌ Menos controle
- ❌ Vendor lock-in Google
- ❌ Pode ficar caro com crescimento

### Arquitetura

```
Frontend (ProF App)
    ↓ Firebase SDK
Firestore (Database)
    ├─ /users/{uid}/alerts
    └─ /users/{uid}/alert-history
    ↓
Cloud Functions (Node.js)
    ├─ Verificação a cada 60s
    ├─ Disparo de notificações
    └─ Limpeza de dados antigos
    ↓
Firebase Cloud Messaging
    └─ Push notifications
```

### Exemplo: Cloud Function

```javascript
// firebase/functions/checkAlerts.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cron: Verificar alertas a cada 60 segundos
exports.checkAlerts = functions.pubsub
  .schedule('every 60 seconds')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Buscar todos os alertas ativos
    const snapshot = await db.collectionGroup('alerts')
      .where('status', '==', 'active')
      .get();
    
    snapshot.forEach(async (doc) => {
      const alert = doc.data();
      const currentPrice = await fetchPrice(alert.assetCode);
      
      // Verificar se deve disparar
      const shouldFire = (
        (alert.type === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.type === 'below' && currentPrice <= alert.targetPrice)
      );
      
      if (shouldFire) {
        // Marcar como disparado
        await doc.ref.update({
          status: 'triggered',
          triggeredAt: new Date(),
          priceAtFire: currentPrice
        });
        
        // Enviar notificação
        const userId = doc.ref.parent.parent.id;
        const user = await db.collection('users').doc(userId).get();
        
        await admin.messaging().sendToDevice(user.data().pushToken, {
          notification: {
            title: 'Alerta de Preço',
            body: `${alert.assetCode}: ${currentPrice}`
          }
        });
      }
    });
  });
```

---

## 📱 Integração com Cliente (ProF App)

### Modificações Necessárias em `app.js`

```javascript
// 1. Autenticação
async function loginToServer(email, password) {
  const response = await fetch('https://api.profcontroller.app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const { token } = await response.json();
  localStorage.setItem('serverToken', token);
  
  return token;
}

// 2. Sincronizar alertas com servidor
async function syncAlertsToServer() {
  const alerts = await getAll('alerts');
  
  await fetch('https://api.profcontroller.app/alerts/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('serverToken')}`
    },
    body: JSON.stringify({ alerts })
  });
}

// 3. Receber notificações via Firebase Messaging
async function registerPushNotifications() {
  const messaging = firebase.messaging();
  
  const token = await messaging.getToken({
    vapidKey: 'YOUR_VAPID_KEY'
  });
  
  // Enviar token ao servidor
  await fetch('https://api.profcontroller.app/users/push-token', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('serverToken')}` },
    body: JSON.stringify({ pushToken: token })
  });
}

// 4. Listener para mensagens push
firebase.messaging().onMessage((payload) => {
  console.log('Notificação recebida:', payload);
  showToast(payload.notification.body);
});
```

---

## 🚀 Plano de Migração

### Fase 1: Preparação (Semana 1)
- [ ] Escolher solução (Node.js recomendado)
- [ ] Configurar repositório `prof-controller-api`
- [ ] Criar schema de banco de dados
- [ ] Setup CI/CD (GitHub Actions)

### Fase 2: Backend (Semanas 2-3)
- [ ] Implementar autenticação JWT
- [ ] CRUD de alertas
- [ ] Worker de verificação de preços
- [ ] Sistema de notificações (email + push)
- [ ] Testes unitários

### Fase 3: Frontend (Semana 3-4)
- [ ] Integrar login/logout
- [ ] Sincronização de alertas
- [ ] Receber push notifications
- [ ] UI para configurações de servidor

### Fase 4: Deploy (Semana 4-5)
- [ ] Staging deployment
- [ ] Testes de carga
- [ ] Migração de dados de usuários beta
- [ ] Deploy em produção

### Fase 5: Monitoramento (Ongoing)
- [ ] Logs centralizados (Sentry, LogRocket)
- [ ] Alertas de erro
- [ ] Análise de performance

---

## 💰 Comparação de Custos (Anual)

| Solução | Setup | Mensal | Anual | Escalabilidade |
|---------|-------|--------|-------|----------------|
| Node.js + VPS | $500 | $30 | $860 | Média |
| AWS Lambda | $200 | $10 | $320 | Alta |
| Firebase | $100 | $15 | $280 | Alta |

*Assumindo ~10k usuários ativos*

---

## 🔐 Considerações de Segurança

### 1. Autenticação
```javascript
// JWT com expiração
const token = jwt.sign(
  { userId, email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### 2. Rate Limiting
```javascript
// Máximo 100 alertas por usuário
// Máximo 10 verificações por minuto
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: 'Muitas requisições. Tente novamente mais tarde.'
});

app.get('/api/alerts', limiter, (req, res) => { /* ... */ });
```

### 3. Criptografia de Chaves de API
```javascript
// Armazenar chaves criptografadas
const crypto = require('crypto');

function encryptApiKey(key) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(key, 'utf8', 'hex') + cipher.final('hex');
}

function decryptApiKey(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
```

### 4. Validação de Entrada
```javascript
// Validar dados antes de salvar
function validateAlert(alert) {
  const errors = [];
  
  if (!alert.assetCode || !/^[A-Z0-9]{1,10}$/.test(alert.assetCode)) {
    errors.push('Código de ativo inválido');
  }
  
  if (alert.targetPrice <= 0 || alert.targetPrice > 999999999) {
    errors.push('Preço-alvo inválido');
  }
  
  if (!['above', 'below'].includes(alert.type)) {
    errors.push('Tipo de alerta inválido');
  }
  
  return errors.length === 0 ? null : errors;
}
```

---

## 📊 Monitoramento e Logs

### Métricas Importantes
- Tempo de verificação de alertas
- Taxa de sucesso de notificações
- Latência de API
- Uso de banco de dados

### Exemplo: Logs Estruturados
```javascript
logger.info({
  level: 'INFO',
  timestamp: new Date().toISOString(),
  alertId: 'alert-123',
  assetCode: 'BTC',
  currentPrice: 98500,
  targetPrice: 100000,
  action: 'ALERT_CHECKED',
  status: 'NO_TRIGGER'
});
```

---

## 🎯 Próximos Passos

1. **Escolher arquitetura** (recomendação: Node.js + PostgreSQL)
2. **Criar repositório separado** (`prof-controller-api`)
3. **Especificar API** (OpenAPI/Swagger)
4. **Implementar MVP** (versão mínima)
5. **Testar com beta testers**
6. **Deploy inicial em staging**
7. **Lançar para usuários**

---

## 📚 Recursos Úteis

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Firebase Setup](https://firebase.google.com/docs/functions)
- [AWS Lambda Guide](https://docs.aws.amazon.com/lambda/)
- [JWT Authentication](https://jwt.io/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**Última atualização**: 2026-09-18  
**Status**: Documentação para Fase 2.0  
**Mantido por**: Copilot App
