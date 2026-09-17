# 🎯 Fase 13: Você x Mercado
## Plano de Implementação - Smart Portfolio Insights

---

## 📋 Objetivo

Criar um painel inteligente que:
1. **Compara seu portfólio com índices globais** (IBOV, CDI, SELIC, USD)
2. **Mostra alocação atual vs objetivo** para o perfil
3. **Fornece insights** sobre desempenho e risco (Sharpe, Beta, Sortino)
4. **Alertas automáticos** para eventos corporativos (dividendos, desdobramentos, IPOs)
5. **Assistente de Imposto de Renda** com cálculos de PU Médio, Tax Loss Harvesting e planejamento tributário

---

## 📊 Estrutura de Dados

### Novos Stores IndexedDB

```javascript
// benchmarks: Histórico de cotações de índices
{
  id: "ibov-2024-01-01",
  symbol: "IBOV",  // IBOV, CDI, SELIC, USD
  date: "2024-01-01",
  value: 131000,   // pontos ou valor
  type: "index",   // index, currency, rate
  source: "B3"
}

// marketEvents: Eventos corporativos
{
  id: "evt-petr4-div-2024",
  symbol: "PETR4",
  type: "dividend",  // dividend, split, reverseplit, earnings, ipo
  date: "2024-02-15",
  description: "Dividendo R$ 0.50 por ação",
  amount: 0.50,
  status: "announced"  // announced, paid, pending
}

// portfolioMetrics: Métricas de desempenho
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

---

## 🏗️ Arquitetura da UI

### Nova Aba: "Você x Mercado"

```
Você x Mercado
├─ Resumo Executivo (cards)
│  ├─ Patrimônio: R$ 500.000
│  ├─ Retorno YTD: +25.5% (vs IBOV +18%)
│  ├─ Beta: 0.95 (Risco: Abaixo do mercado) [Tooltip]
│  └─ Próximo Evento: Dividendo PETR4 em 15 dias
│
├─ Gráficos (Chart.js)
│  ├─ Desempenho (Seu Portfólio vs IBOV vs CDI)
│  │  └─ Linha (últimos 12 meses, retorno acumulado)
│  ├─ Alocação (Atual vs Objetivo)
│  │  └─ Pizza lado a lado (% por setor ou ativo)
│  └─ Volatilidade e Drawdown
│     └─ Área (flutuações de curto prazo)
│
├─ Tabelas
│  ├─ Ativos: Símbolo, Setor, Preço Atual, PU Médio, Retorno (%)
│  ├─ Benchmarks: IBOV, CDI, USD, SELIC (últimos 12 meses)
│  └─ Eventos: Tipo, Data, Descrição, Status
│
├─ Eventos Próximos (30 dias)
│  ├─ Dividendos a receber
│  ├─ Desdobramentos (Splits) anunciados
│  ├─ Earnings Calls
│  └─ IPOs próximos (se aplicável)
│
└─ Assistente de Imposto de Renda
   ├─ Preço Unitário Médio (PU Médio) por ativo
   ├─ Sugestões de Tax Loss Harvesting
   ├─ Planejamento de Realizações (quando vender)
   └─ Resumo de Tributação (estimativa anual)
```

---

## 💻 Implementação por Tarefa

### Tarefa 1: Stores IndexedDB

```javascript
// Adicionar ao initDB()
[
  {
    name: 'benchmarks',
    keyPath: 'id',
    indexes: [
      { name: 'symbol', keyPath: 'symbol' },
      { name: 'date', keyPath: 'date' }
    ]
  },
  {
    name: 'marketEvents',
    keyPath: 'id',
    indexes: [
      { name: 'symbol', keyPath: 'symbol' },
      { name: 'date', keyPath: 'date' },
      { name: 'type', keyPath: 'type' }
    ]
  },
  {
    name: 'portfolioMetrics',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' }
    ]
  }
]
```

### Tarefa 2: APIs de Cotações

**Integração com (Prioridade):**
1. **BCB (Banco Central do Brasil)** - SELIC, CDI, taxa de câmbio - API grátis, sem limite
2. **B3 (Bovespa)** - Ações BR, IBOV, índices - dados históricos
3. **Alpha Vantage** - Ações internacionais (opcional) - requer chave de API gratuita

**Decisão:** Começar com BCB + B3 (fase inicial), adicionar Alpha Vantage em fase 2 se houver demanda por ações internacionais.

```javascript
async function fetchBenchmarkData() {
  // 1. Buscar IBOV dos últimos 12 meses
  // 2. Buscar CDI acumulado
  // 3. Buscar SELIC
  // 4. Buscar DOLAR
  // 5. Armazenar em IndexedDB
}

async function fetchMarketEvents() {
  // 1. Buscar dividendos próximos
  // 2. Buscar splits
  // 3. Buscar earnings calls
  // 4. Armazenar em IndexedDB
}
```

### Tarefa 3: Painel de Análise

```javascript
function renderYouVsMarket() {
  const portfolio = state.positions;  // ações, FII, cripto
  const benchmarks = state.benchmarks;
  const metrics = calculateMetrics();
  
  // 1. Renderizar cards de resumo
  // 2. Renderizar gráficos (Chart.js)
  // 3. Renderizar tabelas
  // 4. Renderizar eventos próximos
}
```

### Tarefa 4: Cálculos Financeiros

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
  
  return {
    sharpeRatio: 1.2,
    beta: 0.95,
    sortinoRatio: 1.5,
    volatility: 12.5,
    maxDrawdown: -8.3,
    yearReturn: 25.5,
    benchmarkReturn: 18.2
  };
}
```

### Tarefa 5: Assistente de Imposto de Renda

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

function calculatePUA() {
  // PU médio = somatório(quantidade * preço) / quantidade total
  // Resultado = preço médio de aquisição
}

function suggestTaxLoss() {
  // Identificar posições com loss
  // Sugerir venda para compensar ganhos
  // Alertar sobre wash-sale rules
}
```

### Tarefa 6: Notificações de Eventos

```javascript
async function checkMarketEvents() {
  // A cada dia, verificar:
  // 1. Dividendos pagáveis (próximos 30 dias)
  // 2. Splits anunciados
  // 3. Vencimentos de papéis
  // 4. Earnings calls
  
  // Se há evento, criar notificação
  for (const event of upcomingEvents) {
    const notif = {
      id: uid(),
      type: 'market_event',
      title: event.description,
      message: `${event.symbol}: ${event.type}`,
      relatedId: event.id,
      date: event.date,
      read: false
    };
    state.notifications.push(notif);
  }
}
```

### Tarefa 7: Gráficos

**Usar Chart.js:**

```html
<!-- Performance vs Índices -->
<canvas id="performanceChart"></canvas>

<!-- Alocação Real vs Ideal -->
<canvas id="allocationChart"></canvas>

<!-- Volatilidade e Risco -->
<canvas id="volatilityChart"></canvas>
```

```javascript
function renderPerformanceChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,  // últimos 12 meses
      datasets: [
        {
          label: 'Seu Portfólio',
          data: portfolioReturns,
          borderColor: '#0066cc'
        },
        {
          label: 'IBOV',
          data: ibovReturns,
          borderColor: '#ff6600'
        },
        {
          label: 'CDI',
          data: cdiReturns,
          borderColor: '#00cc66'
        }
      ]
    }
  });
}
```

### Tarefa 8: Testes

```
Teste 1: Dados de benchmark carregam
Teste 2: Métricas calculam corretamente
Teste 3: Gráficos renderizam
Teste 4: Eventos aparecem
Teste 5: Assistente de IR fornece respostas úteis
```

---

## 📅 Timeline Estimada

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

---

## 🔗 Dependências

```
Fase 13 (Você x Mercado) ← independente
    ↓
Fase 14 (Hub de Notícias) ← pode usar dados de Fase 13
    ↓
Fase 15 (Cloud Sync) ← sincroniza ambas
```

---

## 📝 Considerações Técnicas

### Complexidade Matemática
- Sharpe Ratio: moderada (média móvel + volatilidade)
- Beta: alta (covariância, regressão)
- Sortino: moderada (semelhante a Sharpe)

### Fontes de Dados
- **BCB (Banco Central)**: SELIC, CDI, câmbio (API REST gratuita) ✅
- **B3 (Bovespa)**: Ações BR, IBOV, índices (via API ou web scraping)
- **Alpha Vantage**: Ações internacionais (API gratuita com limite: 5 req/min)

**Recomendação:** Usar BCB + B3 na Fase 13.1. Adicionar Alpha Vantage em Fase 13.2 se houver demanda por ações globais.

### Performance
- Cálculos podem ser pesados (12 meses de dados)
- Executar em background via Web Worker (opcional)
- Cachear resultados por 1 dia

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

---

## 🎯 Critério de Sucesso

- ✅ Painel renderiza sem erros
- ✅ Métricas calculam corretamente
- ✅ Gráficos mostram dados precisos
- ✅ Eventos aparecem com antecedência
- ✅ Assistente responde perguntas úteis
- ✅ Notificações funcionam corretamente
- ✅ Performance aceitável (< 2s para carregar)

---

## 🚀 Começar Agora?

Confirme e vou:
1. Criar nova branch para Fase 13
2. Adicionar os stores IndexedDB
3. Implementar tarefa 1-2
4. Ir avançando progressivamente

**Quer começar?** [SIM / DEPOIS]
