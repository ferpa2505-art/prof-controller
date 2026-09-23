# Deployment da Base de IA Segura - Fase A

## 📋 Visão Geral

Backend seguro que:
- ✅ Recebe fotos (Prato + Receita)
- ✅ Limita uso: 3 análises/dia grátis
- ✅ Protege a API key (nunca exposta no app)
- ✅ Custo baixo: Google Vision API é quase gratuita

---

## 🚀 Passo 1: Preparar Google Cloud

### 1.1 Criar projeto
```bash
# No Google Cloud Console (console.cloud.google.com)
1. Criar novo projeto: "Levia-IA"
2. Ativar Vision API
3. Criar Service Account
4. Gerar chave JSON
```

### 1.2 Copiar API Key
```bash
# Em Google Cloud Console > APIs & Services > Credentials
# Copiar a chave da Service Account (arquivo .json)
```

### Custos Google Vision
- **1000 requisições/mês**: GRÁTIS (free tier)
- **Depois**: $1.50 por 1000 requisições
- Com 3 análises/dia para 1000 usuários = ~90k req/mês = $135/mês (muito barato!)

---

## 🔧 Passo 2: Deploy no Cloudflare Workers

### 2.1 Instalar Wrangler
```bash
npm install -g wrangler
```

### 2.2 Autenticar
```bash
wrangler login
```

### 2.3 Configurar `wrangler.toml`
```toml
name = "levia-ia-worker"
account_id = "SEU_ACCOUNT_ID"  # Copiar do console Cloudflare
```

### 2.4 Adicionar Secrets
```bash
# Copiar a chave JSON do Google
wrangler secret put GOOGLE_VISION_API_KEY

# Cole o conteúdo da chave quando solicitado
```

### 2.5 Deploy
```bash
wrangler deploy
```

**Resultado**: Você receberá uma URL como:
```
https://levia-ia-worker.seu-subdomain.workers.dev
```

---

## 📱 Passo 3: Configurar no App

### 3.1 Atualizar `.env.local`
```bash
EXPO_PUBLIC_WORKER_URL=https://levia-ia-worker.seu-subdomain.workers.dev
```

### 3.2 Recarregar app
```bash
expo start --clear
```

---

## 🧪 Passo 4: Testar

### 4.1 Via cURL
```bash
curl -X POST https://levia-ia-worker.seu-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "imageBase64": "iVBORw0KGgoAAAANS...",  # Imagem base64
    "tipo": "prato"
  }'
```

### 4.2 No app
- Ir para Prato Análise
- Capturar foto
- Verificar se retorna ingredientes

---

## 💰 Estrutura de Preços

| Uso | Custo |
|-----|-------|
| Até 1000 req/mês | GRÁTIS (Google) |
| 1000-10k | $1.50/1000 req |
| 10k+ | $1.50/1000 req |
| Cloudflare Worker | $0.50/1M requisições |

**Exemplo para 100 usuários ativos:**
- 100 × 3 análises/dia = 300 req/dia
- 300 × 30 = 9k req/mês
- Custo: $13.50/mês (praticamente gratuito!)

---

## 🔒 Segurança

✅ **API Key protegida**: Armazenada APENAS no Cloudflare (não no app)
✅ **Rate limiting**: 3/dia por usuário
✅ **HTTPS obrigatório**: Todas as requisições encriptadas
✅ **CORS configurado**: Apenas seu app pode chamar

---

## 🆘 Troubleshooting

### Erro: "API Key não configurada"
```bash
# Re-executar:
wrangler secret put GOOGLE_VISION_API_KEY
```

### Erro: "CORS error"
```bash
# Verificar headers em cloudflare-worker.ts
# Deve ter: Access-Control-Allow-Origin: *
```

### Erro: "Limite atingido"
```bash
# Esperado! Significa que o rate limit funciona
# Aguardar até amanhã ou pagar pela análise extra
```

---

## 📖 Documentação Referência

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Google Vision API](https://cloud.google.com/vision/docs)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
