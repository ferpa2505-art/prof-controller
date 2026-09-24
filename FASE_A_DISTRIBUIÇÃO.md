# Fase A - Plano de Distribuição para Testadores

## 📋 Status Geral

| Item | Status | Notas |
|------|--------|-------|
| Backend (Google Cloud + Cloudflare) | ✅ PRONTO | Worker em `https://levia-ia-worker.b83728bc9c4578e9408302d151c53ffb.workers.dev` |
| EAS Build (APK) | 🔄 EM PROGRESSO | Build ID: `d5e23a14-01d3-4f69-b106-e05d817f004f` |
| App.json configurado | ✅ PRONTO | Project ID: `0fcd4db3-d733-47c3-9989-8e64ce865fce` |
| .env.local | ✅ PRONTO | `EXPO_PUBLIC_WORKER_URL` configurada |

---

## 🏗️ Arquitetura Phase A

```
┌─────────────────────────────────────────────────────┐
│          React Native App (Levia)                   │
│  - Camera / Photo Picker                            │
│  - Base64 encoding                                  │
│  - Error handling & UI feedback                     │
└──────────────────┬──────────────────────────────────┘
                   │
         EXPO_PUBLIC_WORKER_URL
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Cloudflare Worker (Edge)                         │
│  - HTTPS + CORS handling                            │
│  - Vision API orchestration                         │
│  - Response formatting                              │
└──────────────────┬──────────────────────────────────┘
                   │
          Google Cloud Vision API
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│      Google Cloud (levia-ia-worker project)         │
│  - Vision API enabled                               │
│  - Service Account: levia-ia-service                │
│  - Quota: 1000 requests/day (free tier)             │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Distribuição para Testadores

### Opção 1: QR Code Direct (RECOMENDADO)
```
Link direto para download do APK:
https://expo.dev/accounts/ferpa2505-art/projects/pesos-app/builds/<BUILD_ID>

Testadores apenas abrem o link no celular e instalam o APK.
```

### Opção 2: Google Play Store Beta
```
Requere: Google Play Developer Account ($25/ano)
Tempo: 2-3 horas de aprovação
Vantagem: Updates automáticas
```

### Opção 3: Firebase App Distribution (RECOMENDADO PARA TESTING)
```
Gratuito, integrado com Firebase
Via email para testadores
Exemplo: https://appdistribution.firebase.dev/<BUILD_ID>
```

---

## ✅ Checklist de Testes

Para cada testador, verificar:

- [ ] **Instalação**
  - [ ] APK instalou sem erros
  - [ ] App abre sem crashes
  - [ ] Não precisa de terceiros (Expo Go, etc)

- [ ] **Camera & Upload**
  - [ ] Câmera acessa (permissão solicitada)
  - [ ] Foto capturada com sucesso
  - [ ] Imagem enviada para o worker

- [ ] **Vision API Integration**
  - [ ] Resposta recebida do Google Cloud
  - [ ] Resultado exibido na UI
  - [ ] Tempo de resposta < 5 segundos

- [ ] **Error Handling**
  - [ ] Erro de permissão tratado
  - [ ] Network error exibe mensagem amigável
  - [ ] Rate limit (>1000/dia) é comunicado

- [ ] **Performance**
  - [ ] App não congela durante upload
  - [ ] Memória estável (sem memory leaks)
  - [ ] Battery usage razoável

---

## 🔧 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "App não inicia" | Limpar cache: `Settings > Apps > Levia > Storage > Clear Cache` |
| "Worker não responde" | Verificar: https://dash.cloudflare.com (status do worker) |
| "Vision API returns null" | Verificar cota Google Cloud (max 1000/dia free) |
| "Network timeout" | Aumentar timeout em `src/context/...Context.tsx` |

---

## 📝 Próximas Etapas (Pós-Distribuição)

1. **Coletar Feedback**
   - Criar Google Form com perguntas específicas
   - Rastrear crashes via Sentry.io (opcional)

2. **Iterar & Deploy v2**
   - Ajustar UI/UX baseado em feedback
   - Otimizar Vision API parsing
   - Melhorar error messages

3. **Escalar para Fase B/C**
   - Adicionar nutrient database
   - Integrar com receitas
   - Dados de emagrecimento

---

## 🎯 Métricas de Sucesso

- ✅ 10/10 testadores conseguem instalar e usar
- ✅ Vision API responde corretamente
- ✅ Sem crashes relatados
- ✅ Feedback de UX coletado

---

**Build Dashboard**: https://expo.dev/accounts/ferpa2505-art/projects/pesos-app/builds/d5e23a14-01d3-4f69-b106-e05d817f004f

**Data Início Build**: 24/09/2026 09:45 BRT
**Tempo Estimado**: 15-30 minutos
**Próxima Check**: 10:15 BRT
