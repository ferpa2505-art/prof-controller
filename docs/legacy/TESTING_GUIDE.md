# 🧪 Guia Completo de Testes - Backend + Frontend

## 📋 Pré-requisitos

### Sistema
- Node.js 18+ instalado
- PostgreSQL 12+ instalado (ou usar Docker)
- Git instalado

### Verificar instalação

```bash
node --version   # v18.x.x ou maior
npm --version    # 9.x.x ou maior
psql --version   # PostgreSQL 12+ (opcional se usar Docker)
```

---

## 🗄️ Passo 1: Setup do Banco de Dados

### Opção A: PostgreSQL Local

#### macOS (com Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
- Download: https://www.postgresql.org/download/windows/
- Instalar com `password: postgres`
- Verificar: `psql -U postgres`

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Opção B: Docker (Recomendado)

```bash
# Pull image
docker pull postgres:15

# Rodar container
docker run -d \
  --name prof-controller-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=prof_controller \
  -p 5432:5432 \
  postgres:15

# Verificar se está rodando
docker ps
```

### Criar Banco de Dados

#### Usando psql
```bash
# Conectar
psql -U postgres

# No prompt psql:
CREATE DATABASE prof_controller;
\c prof_controller
\i server/config/init-db.sql
\q
```

#### Usando Docker
```bash
docker exec -it prof-controller-db psql -U postgres -d prof_controller -f /config/init-db.sql
```

### Verificar Criação

```bash
psql -U postgres -d prof_controller -c "\dt"
```

Deve mostrar as tabelas:
- `users`
- `payment_history`
- `webhook_events`

---

## 🔧 Passo 2: Setup do Backend

### 1. Instalar Dependências

```bash
cd server
npm install
```

Deve exibir:
```
added XXX packages in Xs
```

### 2. Configurar Variáveis de Ambiente

Criar arquivo `server/.env`:

```bash
# Copiar template
cp server/.env.example server/.env

# Editar
nano server/.env
```

**Valores para teste local:**

```bash
# Environment
NODE_ENV=development
PORT=3001

# Frontend
FRONTEND_URL=http://localhost:3000

# Database (local)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=prof_controller
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=test_secret_key_change_in_production

# Stripe (chaves de TESTE)
STRIPE_SECRET_KEY=sk_test_51234567890...
STRIPE_PUBLIC_KEY=pk_test_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_1234567890...

# SendGrid (opcional para teste)
SENDGRID_API_KEY=SG.test_key_here
SENDGRID_FROM_EMAIL=test@profcontroller.app

# Google OAuth
GOOGLE_CLIENT_ID=test_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=test_secret

# Apple Sign-In
APPLE_CLIENT_ID=com.profcontroller.test
APPLE_TEAM_ID=test_team_id
APPLE_KEY_ID=test_key_id
APPLE_KEY_CONTENT=test_key_content
```

### 3. Testar Conexão

```bash
npm run dev
```

Esperado:
```
🚀 Backend rodando em http://localhost:3001
Environment: development
```

Se houver erro de conexão:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

→ Verificar se PostgreSQL está rodando: `psql -U postgres`

---

## 🧪 Passo 3: Testar Rotas da API

Manter o backend rodando em outro terminal.

### Health Check

```bash
curl http://localhost:3001/health
```

**Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-19T..."
}
```

### Teste de Login Google

```bash
# Gerar um mock ID token para teste
# (Em produção, usar token real do Google)

curl -X POST http://localhost:3001/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "test_google_token_123"
  }'
```

**Esperado (com erro porque token é fake):**
```json
{
  "error": "Falha na autenticação Google"
}
```

### Criar Checkout Session (com token)

```bash
# Primeiro fazer login com Google real ou gerar um token JWT

# Gerar token JWT para teste
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 1, email: 'test@example.com' },
  'test_secret_key_change_in_production',
  { expiresIn: '30d' }
);
console.log(token);
"
```

Copiar o token retornado e usar:

```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3001/subscription/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "plan": "monthly",
    "currency": "BRL"
  }'
```

**Esperado:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

## 💳 Passo 4: Testar com Stripe (Modo Teste)

### 1. Criar Conta Stripe

1. Ir para https://stripe.com
2. Criar conta
3. Acessar Dashboard → API keys
4. Copiar chaves de **TESTE** (começam com `sk_test_` e `pk_test_`)
5. Atualizar `server/.env`

### 2. Testar Pagamento

No navegador:
1. Abrir `http://localhost:3001/subscription/checkout`
2. Será redirecionado para Stripe Checkout
3. Usar cartão de teste: `4242 4242 4242 4242`
4. Data: `12/34`
5. CVC: `123`
6. Nome: Qualquer um
7. Clicar "Pay"

**Esperado:**
- Pagamento é processado
- Redirecionado para `/subscription/success`
- Email de confirmação é enviado (se SendGrid configurado)

### 3. Testar Webhook com Stripe CLI

#### Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
curl https://files.stripe.com/stripe-cli/releases/latest/linux/x86_64/stripe_linux_x86_64.tar.gz | tar xz -C /usr/local/bin

# Windows
# Download: https://github.com/stripe/stripe-cli/releases
```

#### Testar Webhook

**Terminal 1: Ouvir eventos**
```bash
stripe login  # Fazer login com conta Stripe
stripe listen --forward-to localhost:3001/webhook/stripe
```

**Terminal 2: Enviar evento de teste**
```bash
stripe trigger payment_intent.succeeded
```

**Esperado em Terminal 1:**
```
> Forwarding events from acct_... to http://localhost:3001/webhook/stripe
> Webhook signature: whsec_...

2026-09-19 10:30:45 payment_intent.succeeded [evt_...]
```

**Esperado no servidor (Terminal 3):**
```
Webhook recebido e processado
```

---

## 🔐 Passo 5: Testar Autenticação

### Teste Manual de JWT

```bash
# Criar token
TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId:1,email:'test@test.com'}, 'test_secret_key_change_in_production', {expiresIn:'30d'}))")

# Usar em rota protegida
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/user/profile
```

**Esperado:**
```json
{
  "user": {
    "id": 1,
    "email": "test@test.com",
    "serial": "PC-2026-09-ABCDE-FGHIJ",
    "subscriptionStatus": "free",
    ...
  }
}
```

### Testar Token Expirado

```bash
# Criar token com expiração curta
EXPIRED_TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId:1,email:'test@test.com'}, 'test_secret_key_change_in_production', {expiresIn:'0s'}))")

# Esperar 1 segundo e tentar usar
sleep 1
curl -H "Authorization: Bearer $EXPIRED_TOKEN" \
  http://localhost:3001/user/profile
```

**Esperado:**
```json
{
  "error": "Token inválido"
}
```

---

## 📧 Passo 6: Testar SendGrid (Email)

### Configurar SendGrid

1. Ir para https://sendgrid.com
2. Criar conta gratuita
3. Settings → API Keys → Create API Key
4. Copiar chave → `SENDGRID_API_KEY` no `.env`

### Testar Envio de Email

```bash
TOKEN="seu_jwt_token"

curl -X POST http://localhost:3001/subscription/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "plan": "monthly",
    "currency": "BRL"
  }'
```

Após pagamento bem-sucedido:
- Verificar email configurado em SendGrid
- Deve receber email de confirmação

---

## 📊 Passo 7: Monitorar Banco de Dados

### Ver Usuários Criados

```bash
psql -U postgres -d prof_controller -c "SELECT id, email, serial, subscription_status FROM users;"
```

**Esperado:**
```
 id |     email      |       serial        | subscription_status
----+----------------+---------------------+---------------------
  1 | test@test.com  | PC-2026-09-ABCDE... | active
```

### Ver Histórico de Pagamentos

```bash
psql -U postgres -d prof_controller -c "SELECT * FROM payment_history ORDER BY created_at DESC;"
```

### Ver Eventos de Webhook

```bash
psql -U postgres -d prof_controller -c "SELECT event_type, processed, created_at FROM webhook_events ORDER BY created_at DESC LIMIT 10;"
```

---

## 🔍 Debugging

### Ativar Logs Detalhados

```bash
NODE_DEBUG=* npm run dev
```

### Verificar Porta em Uso

```bash
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001
```

### Limpar Database e Recomeçar

```bash
# Deletar dados
psql -U postgres -d prof_controller -c "DELETE FROM webhook_events; DELETE FROM payment_history; DELETE FROM users;"

# Ou deletar e recriar tudo
dropdb -U postgres prof_controller
createdb -U postgres prof_controller
psql -U postgres -d prof_controller -f server/config/init-db.sql
```

---

## ✅ Checklist de Teste

### Backend

- [ ] PostgreSQL rodando
- [ ] npm install ok
- [ ] .env configurado
- [ ] Backend iniciando sem erros
- [ ] Health check retorna 200
- [ ] Conecta ao banco de dados
- [ ] Stripe CLI recebendo webhooks

### Rotas

- [ ] GET /health → 200
- [ ] POST /auth/google → 401 (sem token válido)
- [ ] POST /auth/apple → 401 (sem token válido)
- [ ] POST /subscription/checkout → 401 (sem JWT)
- [ ] POST /subscription/checkout (com JWT) → 200

### Banco de Dados

- [ ] Tabelas criadas
- [ ] Usuários sendo inseridos
- [ ] Pagamentos sendo registrados
- [ ] Webhooks sendo recebidos

### Integração

- [ ] Stripe checkout carregando
- [ ] Pagamento com cartão de teste
- [ ] Webhook sendo processado
- [ ] Usuário marcado como 'active'

---

## 📚 Próximas Etapas

1. **Testar Frontend:**
   - Configurar REACT_APP_API_URL=http://localhost:3001
   - Testar fluxo de login
   - Testar fluxo de checkout

2. **Testes Automatizados:**
   - Criar testes unitários
   - Testar cada rota
   - Testar validações

3. **Deploy:**
   - Setup ambiente de produção
   - Configurar variáveis secretas
   - Deploy backend
   - Deploy frontend

---

## 🆘 Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| ECONNREFUSED 5432 | PostgreSQL não rodando | `docker run -d --name prof-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15` |
| Token inválido | JWT_SECRET errado | Usar mesmo secret em .env e geração de token |
| 401 Unauthorized | Falta Authorization header | Adicionar `-H "Authorization: Bearer $TOKEN"` |
| Stripe payment failed | Chaves de teste inválidas | Copiar sk_test_ e pk_test_ de https://stripe.com |
| Email não chega | SendGrid não configurado | Ir em https://sendgrid.com e copiar API key |

---

## 📞 Suporte

Dúvidas?
- Documentação Stripe: https://stripe.com/docs
- Postgres: https://www.postgresql.org/docs
- Node.js: https://nodejs.org/docs
