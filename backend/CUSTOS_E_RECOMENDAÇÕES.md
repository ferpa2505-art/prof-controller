# 💰 Custos e Recomendações - IA Backend

## 🎯 Solução Escolhida: Google Vision + Cloudflare Workers

**Por quê?**
- ✅ Google Vision: GRATUITA até 1000 req/mês (grátis por 1-2 anos para maioria dos apps)
- ✅ Cloudflare: Extremamente barato ($0.50/1M req)
- ✅ Sem manutenção de servidor
- ✅ Escalável: De 1 usuário a 1M usuários sem mudanças
- ✅ Segurança: API key nunca exposta no app

---

## 💵 Breakdown de Custos

### Cenário 1: Pequeno (100 usuários ativos)
```
Uso/mês:
- 100 usuários × 3 análises/dia = 9,000 requisições/mês

Custos:
┌─────────────────────────────────────┐
│ Google Vision: $0 (free tier)        │
│ Cloudflare:   $0.0045 (9k req)       │
├─────────────────────────────────────┤
│ TOTAL/MÊS:    $0.0045                │
│ TOTAL/ANO:    $0.05                  │
└─────────────────────────────────────┘
```

### Cenário 2: Médio (10.000 usuários)
```
Uso/mês:
- 10k usuários × 3 análises/dia = 900,000 requisições/mês

Custos:
┌─────────────────────────────────────┐
│ Google Vision: $1350 (850k req)      │
│ Cloudflare:   $0.45 (900k req)       │
├─────────────────────────────────────┤
│ TOTAL/MÊS:    $1,350.45              │
│ TOTAL/ANO:    $16,205                │
└─────────────────────────────────────┘
```

### Cenário 3: Grande (100.000 usuários)
```
Uso/mês:
- 100k usuários × 3 análises/dia = 9,000,000 requisições/mês

Custos:
┌─────────────────────────────────────┐
│ Google Vision: $13,500 (8M+ req)     │
│ Cloudflare:   $4.50 (9M req)         │
├─────────────────────────────────────┤
│ TOTAL/MÊS:    $13,504.50             │
│ TOTAL/ANO:    $162,054               │
└─────────────────────────────────────┘
```

---

## 🤔 Alternativas Consideradas (e Por que não usar)

### ❌ Claude Vision API (Anthropic)
**Preço**: $0.003/imagem (modelo 3.5 Sonnet)
**Problema**: 
- 100 usuários × 3/dia = $0.27/dia = $81/mês (vs $0.0045 Google)
- 27.000x mais caro que Google!
- Melhor qualidade, mas custoso

**Use quando**: 
- Precisar de qualidade superior (descrição de receitas complexas)
- Tiver budget
- Implementar como tier premium ($0.99/análise extra)

### ❌ AWS Rekognition
**Preço**: $1/1000 imagens
**Problema**:
- Não tem tão boa análise de texto (OCR fraco)
- Custa 2x mais que Google

### ❌ OpenAI GPT-4V
**Preço**: $0.01/imagem
**Problema**:
- 3x mais caro que Google
- Mais lento (latência)
- Melhor para conversas, não tão bom para detecção de alimentos

---

## 📊 Recomendação Final

### ✅ Fase A (Agora)
```
Google Vision API + Cloudflare Workers

✓ 3 análises/dia grátis para todos
✓ Custos mínimos (<$0.01 para 100 usuários)
✓ Não precisa criar login/pagamento
```

### ✅ Fase 8 (Premium)
```
Quando tiver 1000+ usuários paying:

- Manter Google Vision para tier grátis
- Adicionar Claude Vision para tier premium ($0.99/análise)
- Integrar RevenueCat com Apple/Google IAP

Fluxo:
1. Usuário clica "Análise premium"
2. Abre tela RevenueCat
3. Usuário compra por app (iOS/Android)
4. Desbloqueado: 20 análises/dia com Claude
5. Backend escolhe modelo baseado em subscription
```

---

## 🔐 Implementação Segura (Agora)

```typescript
// Seu app NUNCA vê a API key

Cliente (App):
├─ POST /worker {userId, imageBase64, tipo}
│
└─ Cloudflare Worker (API key aqui ✓)
   ├─ Verifica rate limit (3/dia por userId)
   ├─ POST Google Vision API (com key)
   └─ Retorna: {sucesso, alimentos, calorias, proteina}

Resultado: Você dorme tranquilo, sem API key no código!
```

---

## 🚨 Quando Escalar (e como)

### 1. Atingir 1000 req/dia (100 usuários)
```
✓ Nenhuma mudança necessária
Google free tier ainda cobre
```

### 2. Atingir 1M req/mês (13k análises/dia)
```
⚠️ Google começa a cobrar $1.50/1000 req
📊 Então custa: ~$1,500/mês

Soluções:
a) Aceitar o custo ($18k/ano é viável)
b) Implementar pagamento e restringir grátis para 1/dia
c) Integrar Claude Vision só para usuários premium
```

### 3. Atingir 10M req/mês
```
⚠️ Custo = $15,000/mês

AÇÃO NECESSÁRIA:
- [ ] Implementar subscription (RevenueCat)
- [ ] Tier grátis: 1 análise/dia (Google)
- [ ] Tier premium: 20 análises/dia (Claude)
- [ ] Preço sugerido: $4.99/mês

Resultado:
- Se 20% de usuários pagam: 2000 usuários × $4.99 = $9,980/mês
- Lucro: $9,980 - $15,000 = -$5,020 (prejuízo)
- Aumentar preço para $9.99/mês ou Premium++ em $19.99
```

---

## 📈 Projeção de Receita (com Subscription)

### Exemplo: 50.000 usuários

```
Usuários: 50.000
├─ 49.500 (99%) - Tier grátis (1 análise/dia)
└─ 500 (1%) - Premium ($4.99/mês)

Receita/mês:
└─ 500 × $4.99 = $2,495

Custos/mês:
├─ Google Vision: ~$2,000 (40M req)
├─ Cloudflare:   $20
└─ Total:        $2,020

LUCRO: $475/mês (muito baixo!)

SOLUÇÃO: 
- Aumentar % de conversão (5%)
- Ou preço ($9.99)
- Ou ambos

Com 5% conversão @ $9.99:
└─ 2,500 × $9.99 = $24,975 (✓ viável!)
```

---

## 🎁 Bônus: Otimizações Futuras

### 1. Cache de análises (DuckDB)
```
Problema: Mesmo usuário analisa mesma foto 2x
Solução: Hash da imagem + guardar resultado
Economia: Até 30% de requisições
```

### 2. Batch processing
```
Problema: 1 requisição por foto (lento)
Solução: Enviar 5 fotos de uma vez
Economia: 20% de requisições
```

### 3. Compressão de imagem
```
Problema: Arquivo grande = mais caro em bandwidth
Solução: Reduzir para 640x480 (suficiente para Vision)
Economia: Até 50% de traffic, mais rápido
```

### 4. Usar Google Cloud's Batch API
```
Problema: 1 imagem = 1 request
Solução: Batch 100 imagens por vez
Economia: 10x mais barato!
Mas: Latência aumenta (batch overnight)
Use para: Análise de histórico, não real-time
```

---

## ✅ Checklist: Antes de Publicar

- [ ] Google Cloud Project criado
- [ ] Vision API ativada
- [ ] Service Account key gerado
- [ ] Cloudflare Worker deployado
- [ ] WORKER_URL configurado em .env
- [ ] Testado com 10+ imagens reais
- [ ] Rate limiting funcionando (teste 4ª análise)
- [ ] AsyncStorage persistindo uso
- [ ] Mensagens de erro claras
- [ ] Notificação quando limite atingido

---

## 📞 Suporte

**Dúvidas?**
- [Google Vision Docs](https://cloud.google.com/vision/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
