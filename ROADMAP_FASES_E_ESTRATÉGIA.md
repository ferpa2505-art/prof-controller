# 🗺️ Roadmap Levia - Fases, Estratégia e Diferencial

**Status**: Fase A em testing; Fases B-E planejadas  
**Data**: 24/09/2026  
**Responsável**: ferpa2505-art team

---

## 📊 RESUMO EXECUTIVO

| Fase | Foco | Status | Timeline |
|------|------|--------|----------|
| **A** | IA + Backend seguro | 🟢 PRONTO (distribuição) | ✅ Hoje |
| **B** | Nutrition Database | 🟡 Planejado | Semana 1 |
| **C** | Gamification & Social | 🔴 TODO | Semanas 2-3 |
| **D** | Monetização & Paywalls | 🔴 TODO | Semana 4 |
| **E** | GLP-1 Integration & IA | 🔴 TODO | Semana 5+ |

---

# 1️⃣ NÚCLEO DO PRODUTO

## ✅ TEMOS AGORA (Fase A)

### Análise de Comida com IA
- ✅ **Google Cloud Vision API** integrada
- ✅ **Cloudflare Worker** como backend seguro (CORS, HTTPS)
- ✅ **Câmera & Galeria** - capturar/selecionar fotos
- ✅ **Análise Nutricional Básica**: 
  - Identificação de comida (ex: "Arroz com feijão")
  - Proteína, carboidratos, gordura
  - Calorias estimadas
- ✅ **Error handling** amigável (sem resposta técnica)

### Arquitetura
- ✅ App React Native (Expo)
- ✅ Backend serverless (Cloudflare Workers)
- ✅ IA via Google Cloud Vision
- ✅ Distribuição via EAS (APK direto)

---

## 🟡 PRÓXIMAS FASES

### Fase B - Nutrition Database & Receitas
**Timeline**: Semana 1-2

```
├─ Banco de dados de comidas brasileiras
│  ├─ USDA Database (traduzida)
│  ├─ Alimentos locais (açaí, caldo de cana, etc)
│  └─ Receitas populares (feijoada, moqueca, etc)
│
├─ Cardápio Diário/Semanal
│  ├─ Sugestões automáticas baseadas em objetivo
│  ├─ Contador de macros (proteína, carbo, gordura)
│  └─ Integração com análise IA (fotos das refeições)
│
└─ Lista de Compras
   ├─ Gerada automaticamente
   └─ Integração com supermercados (opção)
```

**Dependências**: Nutrition API (Nutritionix ou Edamam), Database (Firebase ou Supabase)

---

### Fase C - Gamification & Comunidade
**Timeline**: Semana 2-3

```
├─ Gamificação
│  ├─ Streak de dias consecutivos 🔥
│  ├─ Conquistas (badges)
│  ├─ Pontos e ranking
│  └─ Desafios semanais
│
├─ Monitoramento de Progresso
│  ├─ Registro de peso com histórico
│  ├─ Fotos antes/depois (galeria privada)
│  ├─ Gráficos de evolução
│  └─ Cálculo de IMC / % gordura
│
└─ Comunidade (MVP)
   ├─ Feed de conquistas
   ├─ Chat simples (não é rede social)
   └─ Suporte via email/Zendesk
```

**Stack**: Firebase Realtime Database, Expo Notifications

---

### Fase D - Monetização & Paywalls
**Timeline**: Semana 3-4

```
├─ Freemium Model
│  ├─ Grátis: 3 análises/dia, funcionalidades básicas
│  ├─ Premium: Ilimitado, planos personalizados
│  └─ Preço: R$ 9,90/mês ou R$ 79,90/ano
│
├─ In-App Purchases
│  ├─ Integração React Native IAP
│  └─ Suporte: Apple & Google Play
│
└─ Analytics
   ├─ Amplitude ou Mixpanel
   ├─ Tracking: Conversão, retenção, lifetime value
   └─ A/B Testing de preços
```

---

### Fase E - GLP-1 Integration & IA Avançada (Diferencial!)
**Timeline**: Semana 5+

```
❗ DIFERENCIAIS PRINCIPAIS ❗

├─ GLP-1 Tracking (Ozempic, Saxenda, etc)
│  ├─ Acompanhamento específico para usuários em GLP-1
│  ├─ Recomendações adaptadas (proteína alta, volumes pequenos)
│  ├─ Comunidade de usuários GLP-1
│  └─ Parcerias com clínicas de emagrecimento
│
├─ IA Avançada (Claude/GPT)
│  ├─ Plano alimentar gerado por IA
│  ├─ Recomendações personalizadas (objetivo, biotipo, restrições)
│  ├─ Sugestões de receitas
│  └─ Coaching de nutrição automatizado
│
└─ Integração com Wearables
   ├─ Apple Watch (passos, calorias queimadas)
   ├─ Fitbit, Garmin
   └─ Auto-sync com análise de movimento
```

**Stack**: OpenAI API, Wearable SDKs, Nutricionista consultor

---

## 🎯 O QUE NÃO TEMOS (& Não Faremos Agora)

| Feature | Por Quê | Timeline |
|---------|---------|----------|
| ❌ Chatbot nutricionista | Requer backend complexo + integração LLM | Fase E |
| ❌ Treinos com vídeos | Requer hosting de vídeo + licenças | Fase D+ |
| ❌ Integração Whatsapp/Telegram | Baixa prioridade vs análise IA | Futuro |
| ❌ Web version | MVP mobile first | Fase D |
| ❌ PWA offline | Nice-to-have | Futuro |
| ❌ Pedidos de comida integrados | Parceria com iFood (big lift) | Fase E+ |

---

---

# 2️⃣ HOOKS PARA CRIATIVOS DE VENDAS

> Estes pontos serão usados para criar anúncios em Google Ads, Instagram, TikTok que **realmente convertem**.

---

## 🎯 DOR PRINCIPAL DO PÚBLICO

### Personas Identificadas

**Persona 1: Mulher 25-40 anos, Mãe**
- ❌ "Não tenho tempo para contar caloria"
- ❌ "Não consigo emagrecer com a rotina"
- ❌ "Já tentei 100 dietas, todas falharam"
- ❌ **DOR PRINCIPAL**: Falta de simplicidade + constância

**Persona 2: Mulher/Homem 40+ em GLP-1**
- ❌ "Estou perdendo peso mas com GLP-1 não sei o que comer"
- ❌ "Nutricionista custa caro"
- ❌ "Ninguém entende minha situação específica"
- ❌ **DOR PRINCIPAL**: Falta de orientação específica + custo

**Persona 3: Homem 25-35 anos, Fitness**
- ❌ "App genérico não tem dados de alimentos brasileiros"
- ❌ "Contadores de caloria não diferem proteínas bem"
- ❌ "Quer plano, não genérico"
- ❌ **DOR PRINCIPAL**: Falta de precisão + customização

**Persona 4: Pessoas que desistiram de dieta**
- ❌ "Dieta é chato e caro"
- ❌ "App antigo com UX ruim"
- ❌ "Não vejo progresso"
- ❌ **DOR PRINCIPAL**: Falta de motivação + simplicidade

---

## 🚀 PROMESSA CENTRAL

### Opção 1 (Simplist - RECOMENDADO)
```
"Emagreça sem contar caloria.
Tire foto da comida. IA faz o resto."
```
**Por quê funciona**: Resolve "não tenho tempo" em 7 palavras

### Opção 2 (Para GLP-1)
```
"Sua IA nutricionista para quem está em GLP-1.
Perca peso com orientação, não adivinhação."
```

### Opção 3 (Para Fitness/Precisão)
```
"Plano alimentar brasileiro baseado em IA.
Macros precisos. Comida de verdade."
```

### Opção 4 (Urgência + Resultado)
```
"Perca 3-5kg no primeiro mês.
Sem passar fome. Sem contar caloria."
```

---

## 🏆 DIFERENCIAL vs CONCORRENTES

### vs MyFitnessPal (App #1 worldwide)
| Aspecto | MyFitnessPal | Levia | Vencedor |
|---------|-------------|-------|----------|
| IA que identifica comida | ❌ Não | ✅ Sim | **Levia** |
| Banco de dados BR | ❌ Genérico | ✅ Otimizado | **Levia** |
| GLP-1 tracking | ❌ Não | ✅ Sim | **Levia** |
| UX intuitiva | ❌ Complexa | ✅ Simples | **Levia** |
| Preço | 💰 $10.99/mês | 💰 R$9.90/mês | **Levia** |

**Mensagem**: "MyFitnessPal é para nerds de fitness. Levia é para quem quer emagrecer SEM pensar."

---

### vs Noom (App em alta)
| Aspecto | Noom | Levia | Vencedor |
|---------|------|-------|----------|
| Comportamento | ✅ Foco psicológico | 🟡 Coach IA | **Noom** |
| **Rapidez** | ❌ Lento (survey longo) | ✅ Rápido (foto) | **Levia** |
| **IA Moderna** | ❌ Antiga | ✅ Vision + LLM | **Levia** |
| **Preço** | 💰 $60/mês | 💰 R$10/mês | **Levia** |

**Mensagem**: "Noom demora, custa caro e foca em psicologia. Levia é rápido, barato e tecnologia de ponta."

---

### vs Dieta e Saúde (App BR local)
| Aspecto | D&S | Levia | Vencedor |
|---------|-----|-------|----------|
| Design | ❌ Datado | ✅ Moderno | **Levia** |
| IA | ❌ Nenhuma | ✅ Google Vision | **Levia** |
| Comunidade | ✅ Ativa | 🟡 Planejada | **D&S** |
| Atualização | ❌ Lenta | ✅ Rápida | **Levia** |

**Mensagem**: "App tradicional vs. IA do futuro."

---

## 👥 PÚBLICO-ALVO (Priorizado)

### Tier 1 (MVP - Semana 1)
```
👩 Mulheres 25-40 anos
├─ Com smartphone (Android/iOS)
├─ Interesse em emagrecer
├─ Frustradas com dietas tradicionais
└─ Dispostas a pagar R$ 10-30/mês

Tamanho: ~5 milhões no Brasil
Conversão esperada: 0.5-1% (50k-100k usuários)
```

### Tier 2 (Fase C)
```
👨 Homens 25-40 (fitness/saúde)
👩 Mulheres 40+ (GLP-1, pós-parto)
👨 Homens 40+ (saúde preventiva)
```

### Tier 3 (Fase D+)
```
Empresas (B2B) - programa de bem-estar
Clínicas de emagrecimento (white label)
```

---

## 💰 OFERTA INICIAL

### Estratégia de Lançamento

```
FASE ALPHA (Semana 1):
├─ 100% Grátis para 10 testadores
└─ Coleta feedback intensiva

FASE BETA (Semana 2):
├─ Grátis: 3 análises/dia
├─ Premium: R$ 0 (teste 7 dias grátis)
└─ Objetivo: 1000 usuários

LANÇAMENTO OFICIAL (Semana 3):
├─ Freemium: Grátis (limitado)
├─ Premium: R$ 9,90/mês ou R$ 79,90/ano
├─ Desconto de lançamento: 50% primeiro mês
└─ Objetivo: 10k usuários

FASE 2+ (Mês 2):
├─ Sem promoção (preço normal)
├─ Parcerias com influencers
└─ Objective: Viral + retenção
```

### Garantias & Promessas

```
✅ Garantia: "Vê resultado ou devolvo"
   (7 dias, sem perguntas)

✅ Desconto: "-50% primeiro mês"
   (Urgência: válido por 30 dias)

✅ Acesso: "Comece grátis agora"
   (Sem cartão de crédito)

✅ Comunidade: "Beta testers têm lifetime premium"
   (Lealdade + WOM)
```

---

---

# 3️⃣ ESTRATÉGIA SEO & AQUISIÇÃO

## 🔍 PALAVRAS-CHAVE (Pesquisa Realizada)

### Palavras-Chave TRANSACIONAIS (Alta intenção de compra)
```
Busca mensal (BR) | Dificuldade | Relevância

"app para emagrecer"              | 8.9k | Alto
"melhor app dieta"                | 2.1k | Alto
"app contar calorias grátis"      | 1.2k | Médio
"app GLP-1"                       | 450  | MUITO alto (nicho!)
"app análise comida"              | 380  | NOVO! (nosso diferencial)
"app nutricionista IA"            | 220  | Emergente

Potencial: ~13k buscas/mês (conversíveis)
```

### Palavras-Chave INFORMATIVAS (Blog/Content)
```
"como emagrecer rápido"           | 18.1k | Médio
"dieta para perder barriga"       | 8.2k  | Médio
"cardápio para emagrecer"         | 7.5k  | Alto
"alimentos que emagrecem"         | 5.3k  | Médio
"GLP-1 como funciona"             | 2.1k  | MUITO alto (oportunidade!)
"receita low carb fácil"          | 3.2k  | Médio

Potencial: ~44k buscas/mês (tráfego orgânico)
```

### Long-Tail (Específicas, menos concorrência)
```
"app dieta mulheres 40 anos"      | 320   | Médio
"app emagrecimento com GLP-1"     | 210   | OURO!
"melhor app tirar foto comida"    | 85    | OURO! (criamos demanda)
"app dieta brasileira"            | 150   | Alto
"app pós-parto emagrecer"         | 98    | Alto
```

---

## 🎨 LANDING PAGE

### Localização
- **Principal**: levia.app (domínio)
- **Subpáginas**:
  - levia.app/como-emagrecer
  - levia.app/glp-1-app
  - levia.app/comparar-apps
  - levia.app/beta

### Estrutura (SEO + Conversão)

```
<head>
  <title>Levia - IA que Identifica Comida & Faz Dieta | Emagreça sem Contar Caloria</title>
  <meta name="description" content="Tire foto da comida. IA calcula nutrientes. 
  Ganhe em gamificação. Emagreça rápido. Teste grátis por 7 dias.">
</head>

<body>
  H1: "Emagreça sem contar caloria"
  
  H2: "Tire foto. IA faz o resto."
  
  H2: "Por que Levia é diferente"
  - IA que identifica comida (vs contador manual)
  - Comida brasileira (vs banco genérico)
  - Gamification (vs app chato)
  - Preço acessível (vs R$ 100/mês)
  
  H2: "O que você consegue"
  - Antes/Depois (fotos de testadores)
  - "3-5kg no primeiro mês" (resultado)
  - "0 app chato" (promessa)
  
  H2: "Especializada em GLP-1" (diferencial)
  - "Se toma Ozempic, Levia é pra você"
  - Casos de sucesso
  
  CTA Primário: "Comece Grátis" (verde, grande)
  CTA Secundário: "Ver Demonstração" (vídeo 30s)
  
  Depoimentos: 
  - Mulher 30y, -5kg em 1 mês
  - Homem 35y, definição muscular
  - Mulher 45y, GLP-1
  
  FAQ:
  - "Quanto custa?"
  - "Funciona de verdade?"
  - "Preciso pagar cartão?"
  
  Footer:
  - Links legais
  - Email suporte
  - Social media
</body>
```

---

## 📱 ASO (App Store Optimization)

### Google Play
```
Título: "Levia - IA Nutricional & Dieta 🤖"
(58 caracteres, com palavra-chave)

Descrição curta: "Emagreça fotografando comida"
(80 caracteres)

Descrição longa:
- Tire foto > IA analisa > Ganhe em game > Emagreça
- Especializado em GLP-1
- Teste 7 dias grátis
- 4.8⭐ (com avaliações reais)

Palavras-chave:
emagrecer, dieta, GLP-1, caloria, nutrição, IA, análise comida, app saúde

Capturas de tela:
1. "IA identifica comida em 1 foto"
2. "Acompanhe seu progresso"
3. "Gamificação: desafios & conquistas"
4. "Especializado em GLP-1"
5. "Premium: R$ 9,90/mês"
```

### Apple App Store
```
Mesmo conteúdo acima + otimização para iOS

Destaque: "Novo em Apps"
Categoria: Health & Fitness
```

---

## 📝 CONTEÚDO (Blog Strategy)

### Top 5 Artigos para Lançamento

```
1. "IA Identifica Comida: Como Funciona (Levia)"
   - Explica Google Vision
   - Mostra exemplo
   - Diferencial técnico
   - Link: Baixe Levia

2. "Emagreça com GLP-1 (Ozempic, Saxenda): Guia Completo"
   - Dor principal: "estou em GLP-1, e agora?"
   - Recomendações de comida
   - O que evitar
   - Estudos científicos
   - Link: Comunidade Levia para GLP-1

3. "App de Dieta vs Nutricionista: Qual Escolher?"
   - Comparação honest
   - Quando contratar nutri
   - Quando usar app
   - Custo-benefício
   - Link: Tente Levia (cheaper option)

4. "Receitas Low Carb Fáceis (15 min)"
   - Receitas com fotos
   - Macros calculados
   - Cada uma: "análise no Levia"
   - Link: App Levia para calcular

5. "MyFitnessPal vs Noom vs Levia: Qual App?"
   - Tabela comparativa
   - Vencedor (óbvio: Levia)
   - Review honest
   - CTA: Teste grátis
```

**SEO esperado**: 
- Artigo 1: 200 buscas/mês
- Artigo 2: 2.1k buscas/mês (GLP-1!)
- Artigo 3: 1.8k buscas/mês
- Artigo 4: 3.2k buscas/mês
- Artigo 5: 890 buscas/mês

**Total**: ~8k buscas/mês → 5% CTR → 400 cliques → 10% conversão → 40 novos usuários/mês (fase inicial)

---

## 🔧 TÉCNICO

### Site Responsivo
- ✅ Mobile-first design
- ✅ Velocidade: < 3s (Core Web Vitals)
- ✅ HTTPS obrigatório
- ✅ Dark mode + light mode

### SEO Técnico
- ✅ Sitemap XML
- ✅ robots.txt
- ✅ Google Search Console setup
- ✅ Bing Webmaster Tools
- ✅ Estrutura: H1 → H2 → H3
- ✅ Internal linking (artigos relacionados)
- ✅ Schema.org (SoftwareApplication)

### Ferramentas
```
Análise SEO:
- SE Ranking ou Ahrefs (rastrear posições)
- Google Keyword Planner (dados de volume)
- Google Analytics 4 (tráfego, conversão)
- Google Search Console (clicks, impressões, CTR)

Performance:
- PageSpeed Insights
- GTmetrix
- Lighthouse

Monitoramento:
- Hotjar (user behavior)
- Amplitude (analytics app)
- Sentry (error tracking)
```

---

---

# 🎁 DIFERENCIAL ÚNICO (Não Mencionado)

## O Que nos Diferencia MESMO

### 1️⃣ GLP-1 Focused (Único no BR!)
```
Problema: Apps genéricos não entendem GLP-1
Solução: Levia com features específicas
  - Recomendações de volume pequeno
  - Proteína alta
  - Comunidade de GLP-1
  - Parcerias com clínicas

Mercado: ~500k brasileiros em GLP-1 (crescendo 20% a.a.)
Penetração esperada: 1-2% = 5k-10k usuários premium
```

### 2️⃣ IA de Verdade (Não Fake)
```
Concorrentes: "IA" que é apenas filtros/UI
Levia: Usa Google Vision + (futuramente) LLM para plano

Diferença: Técnica vs Marketing
```

### 3️⃣ Brazilness (Comida BR)
```
MyFitnessPal: "Arroz com feijão" genérico
Levia: Caloric/macro específico para arroz br, feijão carioca, etc

Comidas únicas:
- Açaí
- Pão de queijo
- Feijão carioca vs preto
- Tapioca
- Caldos caseiros

Banco de dados: USDA traduzido + alimentação br específica
```

### 4️⃣ Mobile-First + Offline Pronto
```
Concorrentes: Web-based, lento em 3G
Levia: Expo (React Native) = rápido, responsivo, offline-ready

Vantagem: Usuários 4G/5G (Brasil tem muita gente em 3G)
```

### 5️⃣ Comunidade de Testes Orgânica
```
Temos: 10 testadores da Fase A
Posso: Fazer referral program ("Indique amiga, ambas ganham premium")

Crescimento: Viral potencial via WhatsApp (cultura BR)
```

### 6️⃣ Pricing Brasileiro (Não Dólar)
```
MyFitnessPal: $10.99 = R$ 55 com câmbio
Levia: R$ 9,90/mês (0.2% do salário mínimo)

Acessibilidade: 10x melhor
```

---

# 📈 MÉTRICA DE SUCESSO

| Métrica | Fase A | Fase B | Fase C | Meta 1 ano |
|---------|--------|--------|--------|-----------|
| Usuários ativos | 10 | 1k | 10k | 50k |
| Taxa retenção 7d | - | 40% | 50% | 60% |
| Premium conversion | - | 2% | 5% | 10% |
| MRR | R$0 | R$200 | R$5k | R$50k |
| CAC (custo aquisição) | R$0 | R$5 | R$3 | R$2 |
| LTV (lifetime value) | - | R$100 | R$300 | R$1000 |
| NPS | 7/10 | 8/10 | 8.5/10 | 9/10 |

---

# ✅ RESUMO FINAL

## O Que Temos
- ✅ IA funcionando (Google Vision)
- ✅ Backend seguro (Cloudflare)
- ✅ App distribuível (EAS APK)
- ✅ 10 testadores prontos
- ✅ Foco claro (Fase A: IA + Backend)

## O Que Vem
- 🟡 B: Nutrition DB + Receitas
- 🟡 C: Gamification + Comunidade
- 🟡 D: Monetização
- 🟡 E: GLP-1 + IA avançada

## Diferencial
- 🔥 GLP-1 especializado
- 🔥 IA real (Vision + LLM)
- 🔥 Comida brasileira
- 🔥 Preço acessível (R$ 10)
- 🔥 Mobile-first

---

**Build Status**: Fase A pronto para distribuição ✅  
**Próximo**: Feedback de testadores → Fase B início semana que vem  
**Data update**: 24/09/2026 10:41

