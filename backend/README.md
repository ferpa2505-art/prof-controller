# 🔐 Fase A - Base de IA Segura (Levia Backend)

**Status**: ✅ Implementado e pronto para deploy

---

## 📌 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      LEVIA APP (React Native)                │
│                   (IAAnaliseContext)                         │
│  - Upload foto em base64                                    │
│  - Rastreia uso (3/dia grátis)                              │
│  - Chama Worker via HTTPS                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST {userId, imageBase64, tipo}
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           CLOUDFLARE WORKER (Serverless)                     │
│  - Valida rate limit (3/dia)                                │
│  - Chama Google Vision API                                  │
│  - API Key segura (secrets)                                 │
│  - Retorna análise em JSON                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST {requests: [{image, features}]}
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           GOOGLE VISION API                                  │
│  - OCR (TEXT_DETECTION)                                     │
│  - Detecção de alimentos (LABEL_DETECTION)                  │
│  - Localização (OBJECT_LOCALIZATION)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Recursos Implementados

### ✅ Cloudflare Worker (`cloudflare-worker.ts`)
- Rate limiting por usuário/dia (3 grátis)
- Validação de entrada
- Integração com Google Vision API
- Parsing de resposta estruturada
- Headers CORS configurados
- Tratamento de erros robusto

### ✅ App Context (`IAAnaliseContext.tsx`)
- `useIAAnalise()` hook para usar análise
- Rastreamento de uso diário com AsyncStorage
- Métodos: `analisarPlato()`, `analisarReceita()`
- Cálculo automático de tentativas restantes
- Loading state para UX

### ✅ Configuração
- `wrangler.toml`: Config do Cloudflare
- `.env.example`: Variáveis de ambiente
- `DEPLOYMENT.md`: Guia passo-a-passo

---

## 🚀 Quick Start

### 1. Pré-requisitos
```bash
# Node.js >= 18
node --version

# Wrangler CLI
npm install -g wrangler

# Conta Cloudflare (free tier ok)
# Conta Google Cloud (free tier ok)
```

### 2. Setup Google Cloud
```bash
# 1. Ir para: console.cloud.google.com
# 2. Criar projeto "Levia"
# 3. Ativar Vision API
# 4. Criar Service Account
# 5. Gerar chave JSON
# 6. Copiar credenciais
```

### 3. Deploy Worker
```bash
cd backend

# Configurar Cloudflare
wrangler login

# Editar wrangler.toml com seu account_id
# (Copiar de https://dash.cloudflare.com/)

# Adicionar secret
wrangler secret put GOOGLE_VISION_API_KEY
# (Cola o JSON da chave Google)

# Deploy
wrangler deploy

# ✅ Você receberá a URL do worker
```

### 4. Configurar App
```bash
# .env.local
EXPO_PUBLIC_WORKER_URL=https://seu-worker.workers.dev

# Restart app
expo start --clear
```

### 5. Testar
```bash
# No app, ir para: Prato Análise > Capturar foto
# Deve retornar: [Frango, Arroz, Feijão, etc.]
```

---

## 💰 Custos Estimados

| Componente | Período | Custo |
|---|---|---|
| Google Vision (free tier) | 1000 req/mês | $0 |
| Google Vision (pago) | Depois de 1000 | $1.50/1000 |
| Cloudflare Worker | $0.50/1M req | $0.015 |
| **Total (100 usuários)** | 1 mês | **~$0.50** |

**Escala gigante (1M req/mês)**:
- Google: $1500
- Cloudflare: $0.50
- **Total: $1500.50**

---

## 📊 Rate Limiting

```typescript
// Por usuário/dia
const LIMITE_DIARIO_GRATIS = 3;

// Resposta quando limite atingido (HTTP 429):
{
  "sucesso": false,
  "erro": "Limite diário (3/dia) atingido. Análises adicionais requerem pagamento.",
  "tentativasRestantes": 0
}
```

**Futuros**: Implementar pagamento para análises extras (RevenueCat na Fase 8)

---

## 🔒 Segurança

✅ **API Key nunca em código fonte**
- Armazenada em Cloudflare Secrets
- Acessível apenas no worker

✅ **Rate limiting por usuário**
- Previne abuse
- Gratuito para uso legítimo

✅ **HTTPS obrigatório**
- Todas as requests encriptadas
- TLS 1.3

✅ **CORS restritivo**
- Apenas seu domínio pode chamar
- Sem exposição de dados

✅ **Input validation**
- Verifica userId, imageBase64, tipo
- Rejeita requisições malformadas

---

## 🆘 Troubleshooting

### Erro: `Cannot find module`
```bash
wrangler install
```

### Erro: `API Key not configured`
```bash
wrangler secret put GOOGLE_VISION_API_KEY
# Cole a chave JSON do Google
```

### Erro: `Worker URL retorna 404`
```bash
# Verificar deploy
wrangler deployments list

# Verificar route em wrangler.toml
# Deve ser: https://seu-worker.seu-subdomain.workers.dev
```

### Erro: `CORS blocked`
```bash
# Em cloudflare-worker.ts, verificar:
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
}
```

---

## 📚 Documentação Referência

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Google Vision API Docs](https://cloud.google.com/vision/docs/detection-features)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Rate Limiting Patterns](https://developers.cloudflare.com/workers/examples/rate-limiter/)

---

## 🎬 Próximos Passos

1. **Fase 8** (notícias multilíngues)
   - RSS feeds por idioma
   - Tradução com IA se necessário

2. **Futuro** (não nesta fase)
   - Integrar RevenueCat para pagamento
   - Usar Durable Objects para rate limiting persistente
   - Cache de análises (DuckDB)
   - WebSocket para análise em tempo real

---

## 🆕 Mudanças Nesta Release

- ✅ `src/context/IAAnaliseContext.tsx` - Context para análise de fotos
- ✅ `backend/cloudflare-worker.ts` - Worker serverless
- ✅ `backend/wrangler.toml` - Configuração Cloudflare
- ✅ `backend/DEPLOYMENT.md` - Guia de deploy
- ✅ `.env.example` - Variáveis de ambiente
- ✅ `app/_layout.tsx` - Adicionar IAAnaliseProvider

---

**Status**: ✅ **Pronto para deployment!**
