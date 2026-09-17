# 🔧 Ajustes Recomendados - PHASE13_PLAN.md
## Baseado em VOCABULARY_REVIEW.md

**Data:** 2026-09-17  
**Status:** Pronto para aprovação

---

## 📋 Alterações por Seção

### 1. **Objetivo** (Seção "📋 Objetivo")

#### ❌ Atual:
```markdown
1. **Compara portfólio do usuário com índices** (Ibovespa, B3, CDI, Dólar)
```

#### ✅ Recomendado:
```markdown
1. **Compara seu portfólio com índices** (IBOV, B3, CDI, Dólar)
```

**Razão:** Capitalização de nomes próprios (IBOV, não Ibovespa)

---

### 2. **Estrutura de Dados** (Seção "📊 Estrutura de Dados")

#### ❌ Atual:
```javascript
// benchmarks: Índices e cotações históricas
{
  id: "ibov-2024-01-01",
  symbol: "IBOV",  // IBOV, CDI, SELIC, DOLAR
  date: "2024-01-01",
  value: 131000,   // pontos ou valor
  type: "index",   // index, currency, rate
  source: "B3"
}
```

#### ✅ Recomendado:
```javascript
// benchmarks: Histórico de cotações de índices
{
  id: "ibov-2024-01-01",
  symbol: "IBOV",  // IBOV, CDI, SELIC, USD (preferir "USD" para Dólar)
  date: "2024-01-01",
  value: 131000,   // pontos ou valor
  type: "index",   // index, currency, rate
  source: "B3"
}
```

**Razões:**
- "Histórico de cotações" é mais natural em PT-BR
- "USD" para Dólar (padrão ISO)
- Evitar "DOLAR" em maiúsculas

---

#### ❌ Atual:
```javascript
// marketEvents: Eventos corporativos
{
  id: "evt-petr4-div-2024",
  symbol: "PETR4",
  type: "dividend",  // dividend, split, earnings, ipo
  date: "2024-02-15",
  description: "Dividendo R$ 0.50",
  amount: 0.50,
  status: "announced"  // announced, paid, pending
}
```

#### ✅ Recomendado:
```javascript
// marketEvents: Eventos corporativos
{
  id: "evt-petr4-div-2024",
  symbol: "PETR4",
  type: "dividend",  // dividend, split, reverseplit, earnings, ipo
  date: "2024-02-15",
  description: "Dividendo R$ 0.50 por ação",  // Mais específico
  amount: 0.50,
  status: "announced"  // announced, paid, pending
}
```

**Razões:**
- Adicionar "reverseplit" (agrupamento)
- Descrição mais clara ("por ação")

---

#### ❌ Atual:
```javascript
// portfolioMetrics: Métricas calculadas
{
  id: "metrics-2024-01-31",
  date: "2024-01-31",
  sharpeRatio: 1.2,
  beta: 0.95,
  sortinoRatio: 1.5,
  volatility: 12.5,  // percentual ao ano
  maxDrawdown: -8.3,  // percentual
  yearReturn: 25.5,   // percentual
  benchmarkReturn: 18.2  // IBOV return
}
```

#### ✅ Recomendado:
```javascript
// portfolioMetrics: Métricas de desempenho (diárias ou mensais)
{
  id: "metrics-2024-01-31",
  date: "2024-01-31",
  sharpeRatio: 1.2,      // Índice de Sharpe
  beta: 0.95,            // Beta em relação ao IBOV
  sortinoRatio: 1.5,     // Razão de Sortino
  volatility: 12.5,      // % a.a. (volatilidade anualizada)
  maxDrawdown: -8.3,     // % (queda máxima desde pico)
  yearReturn: 25.5,      // % (retorno no período)
  benchmarkReturn: 18.2  // % (retorno do IBOV no período)
}
```

**Razões:**
- Comentários explicativos para cada métrica
- Clareza sobre o que é medido (em relação ao IBOV)
- Especificar "a.a." (ao ano) para volatilidade

---

### 3. **Arquitetura da UI** (Seção "🏗️ Arquitetura da UI")

#### ❌ Atual:
```markdown
├─ Resumo Executivo (cards)
│  ├─ Patrimônio: R$ 500k
│  ├─ Rentabilidade: +25.5% YTD (vs IBOV +18%)
│  ├─ Beta: 0.95 (alinhado)
│  └─ Próximo evento: Dividendo PETR4 em 15 dias
```

#### ✅ Recomendado:
```markdown
├─ Resumo Executivo (cards)
│  ├─ Patrimônio: R$ 500.000
│  ├─ Retorno YTD: +25.5% (vs IBOV +18%)
│  ├─ Beta: 0.95 (Risco: Abaixo do mercado) [Tooltip]
│  └─ Próximo Evento: Dividendo PETR4 em 15 dias
```

**Razões:**
- "Retorno" em vez de "Rentabilidade" (mais preciso)
- Adicionar contexto de risco (com tooltip)
- Capitalização de "Próximo Evento"

---

#### ❌ Atual:
```markdown
├─ Tabelas
│  ├─ Ativos: símbolo, setor, preço, PU médio, rentabilidade
│  └─ Benchmarks: IBOV, CDI, Dólar, SELIC (últimos 12 meses)
```

#### ✅ Recomendado:
```markdown
├─ Tabelas
│  ├─ Ativos: Símbolo, Setor, Preço Atual, PU Médio, Retorno (%)
│  ├─ Benchmarks: IBOV, CDI, USD, SELIC (últimos 12 meses)
│  └─ Eventos: Tipo, Data, Descrição, Status
```

**Razões:**
- Capitalização consistente em títulos de coluna
- "Retorno (%)" em vez de "rentabilidade"
- "USD" em vez de "Dólar"
- Adicionar coluna de eventos

---

#### ❌ Atual:
```markdown
├─ Gráficos
│  ├─ Performance (seu portfólio vs IBOV vs CDI)
│  │  └─ Linha dupla ou área stackada
│  ├─ Alocação (real vs ideal)
│  │  └─ Gráfico de pizza lado a lado
│  └─ Draw-down máximo
```

#### ✅ Recomendado:
```markdown
├─ Gráficos (Chart.js)
│  ├─ Desempenho (Seu Portfólio vs IBOV vs CDI)
│  │  └─ Linha (últimos 12 meses, retorno acumulado)
│  ├─ Alocação (Atual vs Objetivo)
│  │  └─ Pizza lado a lado (% por setor ou ativo)
│  └─ Volatilidade e Drawdown
│     └─ Área (flutuações de curto prazo)
```

**Razões:**
- "Desempenho" em vez de "Performance"
- "Seu Portfólio" em vez de "seu portfólio"
- "Atual vs Objetivo" em vez de "real vs ideal"
- Adicionar descrições de tipo de gráfico
- Corrigir "Draw-down" para "Drawdown"

---

#### ❌ Atual:
```markdown
├─ Eventos Próximos
│  ├─ Dividendos a pagar
│  ├─ Splits próximos
│  ├─ Vencimentos (bonds, opções)
│  └─ Earnings calls
```

#### ✅ Recomendado:
```markdown
├─ Eventos Próximos (30 dias)
│  ├─ Dividendos a receber
│  ├─ Desdobramentos (Splits) anunciados
│  ├─ Earnings Calls
│  └─ IPOs próximos (se aplicável)
```

**Razões:**
- "Dividendos a receber" (usuário recebe, não paga)
- "Desdobramentos (Splits)" com tradução e termo em inglês
- Ordenação por importância
- Remover "Vencimentos" (fora de escopo para Fase 13)
- Adicionar IPOs

---

#### ❌ Atual:
```markdown
└─ Assistente de IR
   ├─ Base de cálculo por ativo
   ├─ Sugestões de tax loss harvesting
   └─ Planejamento de realizações
```

#### ✅ Recomendado:
```markdown
└─ Assistente de Imposto de Renda
   ├─ Preço Unitário Médio (PU Médio) por ativo
   ├─ Sugestões de Tax Loss Harvesting
   ├─ Planejamento de Realizações (quando vender)
   └─ Resumo de Tributação (estimativa anual)
```

**Razões:**
- "Assistente de Imposto de Renda" (mais específico que "IR")
- "PU Médio" (padrão financeiro)
- "Tax Loss Harvesting" (termo aceito globalmente)
- Adicionar "Resumo de Tributação"

---

### 4. **Implementação por Tarefa** (Seção "💻 Implementação por Tarefa")

#### Tarefa 2: API de Cotações

#### ❌ Atual:
```markdown
**Integração com:**
- Alpha Vantage (ações internacionais)
- Dados B3 (ações BR, índices)
- BCB (SELIC, CDI, câmbio)
```

#### ✅ Recomendado:
```markdown
**Integração com (Prioridade):**
1. **BCB (Banco Central do Brasil)** - SELIC, CDI, taxa de câmbio - API grátis, sem limite
2. **B3 (Bovespa)** - Ações BR, IBOV, índices - dados históricos
3. **Alpha Vantage** - Ações internacionais (opcional) - requer chave de API gratuita

**Decisão:** Começar com BCB + B3 (fase inicial), adicionar Alpha Vantage em fase 2 se houver demanda por ações internacionais.
```

**Razões:**
- Priorização de APIs mais confiáveis
- Clareza sobre APIs gratuitas vs pagas
- Esclarecimento de escopo (fase 1 vs 2)

---

#### Tarefa 4: Cálculos de Performance

#### ❌ Atual:
```javascript
function calculateMetrics() {
  // Para cada data no histórico:
  // 1. Retorno acumulado do portfólio
  // 2. Retorno do IBOV
  // 3. Retorno do CDI
  
  // Calcular:
  // - Sharpe Ratio = (retorno - taxa livre) / volatilidade
  // - Beta = covariância(portfólio, IBOV) / variância(IBOV)
  // - Sortino = (retorno - taxa livre) / downside volatility
  // - Max Drawdown = máxima queda desde pico
```

#### ✅ Recomendado:
```javascript
function calculateMetrics() {
  // Para cada data no histórico:
  // 1. Retorno acumulado do portfólio
  // 2. Retorno do IBOV (ou CDI, conforme perfil)
  
  // Calcular (Simplificado para usuários leigos):
  // - Índice de Sharpe = (retorno - CDI) / volatilidade
  //   → Interpretação: Quanto retorno por unidade de risco
  // - Beta = regressão(portfólio, IBOV)
  //   → Interpretação: 1.0 = igual IBOV, <1 = menos volátil, >1 = mais volátil
  // - Razão de Sortino = (retorno - CDI) / downside volatility
  //   → Interpretação: Como Sharpe, mas ignora ganhos (apenas penaliza quedas)
  // - Drawdown Máximo = % máxima de queda desde pico histórico
  //   → Interpretação: Pior período vivido no portfólio
  
  // Simplificações para Fase 1:
  // - Usar CDI como taxa livre de risco (não taxa SELIC)
  // - Beta calculado apenas vs IBOV (não múltiplos benchmarks)
  // - Sortino usa 0% downside threshold (não target return)
```

**Razões:**
- Adicionar interpretações em linguagem simples
- Esclarecer simplificações (requer menos dados)
- Facilitar implementação

---

#### Tarefa 5: Assistente de IR

#### ❌ Atual:
```javascript
// Perguntas sobre IR
function taxAssistant() {
  const questions = [
    {
      type: 'pua',
      title: 'Qual é meu PU médio por ativo?',
      handler: () => calculatePUA()
    },
    {
      type: 'taxLoss',
      title: 'Devo fazer tax loss harvesting?',
      handler: () => suggestTaxLoss()
    },
    {
      type: 'realization',
      title: 'Quando devo realizar ganhos/perdas?',
      handler: () => planRealizations()
    }
  ];
}
```

#### ✅ Recomendado:
```javascript
// Assistente de Imposto de Renda - Perguntas
function taxAssistant() {
  const questions = [
    {
      type: 'pua',
      title: 'Qual é meu Preço Unitário Médio (PU Médio)?',
      description: 'Calcula o preço médio de compra de cada ação',
      handler: () => calculatePUA()
    },
    {
      type: 'taxLoss',
      title: 'Posso usar Tax Loss Harvesting?',
      description: 'Identifica posições com perda para compensar ganhos',
      handler: () => suggestTaxLoss()
    },
    {
      type: 'realization',
      title: 'Como planejar realizações de ganhos/perdas?',
      description: 'Sugestões de quando vender para otimizar impostos',
      handler: () => planRealizations()
    },
    {
      type: 'summary',
      title: 'Qual é minha estimativa de tributação?',
      description: 'Simulação de impostos a pagar no ano',
      handler: () => estimateTaxes()
    }
  ];
}
```

**Razões:**
- Adicionar descrições de cada pergunta
- Usar "Imposto de Renda" em vez de "IR"
- Adicionar "Estimativa de Tributação"
- "PU Médio" com explicação entre parênteses (primeira vez)

---

### 5. **Timeline Estimada** (Seção "📅 Timeline Estimada")

#### ❌ Atual:
```markdown
| Tarefa | Dias | Status |
|--------|------|--------|
| 1. Stores IndexedDB | 0.5 | ⏳ |
| 2. API de Cotações | 2-3 | ⏳ |
| 3. Painel UI | 2 | ⏳ |
| 4. Cálculos | 1.5 | ⏳ |
| 5. Tax Assistant | 1 | ⏳ |
| 6. Notificações | 0.5 | ⏳ |
| 7. Gráficos | 1.5 | ⏳ |
| 8. Testes | 1 | ⏳ |
| **Total** | **10 dias** | ⏳ |
```

#### ✅ Recomendado:
```markdown
| Tarefa | Dias | Dependências | Status |
|--------|------|--------------|--------|
| 1. Stores IndexedDB | 0.5 | Nenhuma | ⏳ |
| 2. APIs de Cotações | 2-3 | Tarefa 1 | ⏳ |
| 3. Painel UI | 2 | Tarefa 2 | ⏳ |
| 4. Cálculos Financeiros | 1.5 | Tarefa 2 | ⏳ |
| 5. Assistente de IR | 1 | Tarefa 1, 4 | ⏳ |
| 6. Notificações de Eventos | 0.5 | Tarefa 2 | ⏳ |
| 7. Gráficos (Chart.js) | 1.5 | Tarefa 3, 4 | ⏳ |
| 8. Testes & Validação | 1 | Todas | ⏳ |
| **Total** | **~11 dias** | - | ⏳ |

*Nota: Pode haver paralelismo entre Tarefas 3, 4, 6 após Tarefa 2 concluída.*
```

**Razões:**
- Adicionar coluna de dependências
- Ajustar timeline total (11 dias, não 10)
- Indicar potencial de paralelismo

---

### 6. **Considerações Técnicas** (Seção "📝 Considerações Técnicas")

#### ❌ Atual:
```markdown
### Fontes de Dados
- **B3**: Ações BR, índices (via API ou web scraping)
- **Alpha Vantage**: Ações internacionais (chave de API)
- **BCB**: SELIC, CDI, câmbio (API REST livre)
```

#### ✅ Recomendado:
```markdown
### Fontes de Dados
- **BCB (Banco Central)**: SELIC, CDI, câmbio (API REST gratuita) ✅
- **B3 (Bovespa)**: Ações BR, IBOV, índices (via API ou web scraping)
- **Alpha Vantage**: Ações internacionais (API gratuita com limite: 5 req/min)

**Recomendação:** Usar BCB + B3 na Fase 13.1. Adicionar Alpha Vantage em Fase 13.2 se houver demanda por ações globais.
```

---

#### ❌ Atual:
```markdown
### UX
- Painel pode ser confuso para usuários não-técnicos
- Adicionar tooltips explicativos
- Exemplo: "Beta mede risco relativo ao mercado (1.0 = igual IBOV)"
```

#### ✅ Recomendado:
```markdown
### UX & Acessibilidade
- **Problema:** Métricas financeiras (Sharpe, Beta, Sortino) podem confundir leigos
- **Solução:** 
  - Adicionar tooltips explicativos em cada métrica
  - Usar linguagem simples + interpretação junto ao número
  - Exemplo: "Beta: 0.95 (Risco: Abaixo do mercado)" com tooltip: "Seu portfólio varia 95% com o IBOV"
  - Glossário integrado na app (Help > Glossário)
  
**Checklist:**
- [ ] Cada métrica tem tooltip explicativo
- [ ] Interpretação de risco/eficiência ao lado do número
- [ ] Cores indicam desempenho (verde=bom, vermelho=ruim)
- [ ] Glossário acessível em Help
```

---

## 📋 Resumo de Alterações

| Item | Tipo | Alteração |
|------|------|-----------|
| Capitalização | Naming | IBOV, CDI, SELIC, USD (não "Dólar") |
| Retorno vs Rentabilidade | Semantics | "Retorno" para %, "Rendimento" para dividendos |
| Sharpe/Sortino | Terminology | "Índice de Sharpe" / "Razão de Sortino" |
| Desempenho | Translations | "Desempenho" (não "Performance") |
| Dividendos | Direction | "a receber" (não "a pagar") |
| Assistente | Naming | "Assistente de Imposto de Renda" |
| Gráficos | Description | Adicionar tipos e períodos |
| APIs | Priorização | BCB+B3 (Fase 1), Alpha Vantage (Fase 2) |
| UX | Accessibility | Tooltips, interpretações simples, glossário |

---

## ✅ Próximo Passo

- [ ] **Aprovar alterações** no PHASE13_PLAN.md
- [ ] **Aplicar mudanças** (reescrever seções)
- [ ] **Integrar i18n** do VOCABULARY_REVIEW.md ao app.js
- [ ] **Começar Tarefa 1** (IndexedDB stores)

---

**Data de Geração:** 2026-09-17 23:02  
**Próxima Revisão:** Após aplicação de alterações
