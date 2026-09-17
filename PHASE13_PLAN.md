# 🎯 Fase 13: Você x Mercado
## Plano de Implementação - Smart Portfolio Insights

---

## 📋 Objetivo

Criar um painel inteligente que:
1. **Compara portfólio do usuário com índices** (Ibovespa, B3, CDI, Dólar)
2. **Mostra alocação real vs ideal** para o perfil
3. **Fornece insights** sobre performance e risco
4. **Alertas automáticos** para eventos corporativos (dividendos, splits, IPOs)
5. **Assistente de IR** com perguntas sobre tributação

---

## 📊 Estrutura de Dados

### Novos Stores IndexedDB

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

---

## 🏗️ Arquitetura da UI

### Nova Aba: "Você x Mercado"

```
Você x Mercado
├─ Resumo Executivo (cards)
│  ├─ Patrimônio: R$ 500k
│  ├─ Rentabilidade: +25.5% YTD (vs IBOV +18%)
│  ├─ Beta: 0.95 (alinhado)
│  └─ Próximo evento: Dividendo PETR4 em 15 dias
│
├─ Gráficos
│  ├─ Performance (seu portfólio vs IBOV vs CDI)
│  │  └─ Linha dupla ou área stackada
│  ├─ Alocação (real vs ideal)
│  │  └─ Gráfico de pizza lado a lado
│  └─ Draw-down máximo
│
├─ Tabelas
│  ├─ Ativos: símbolo, setor, preço, PU médio, rentabilidade
│  └─ Benchmarks: IBOV, CDI, Dólar, SELIC (últimos 12 meses)
│
├─ Eventos Próximos
│  ├─ Dividendos a pagar
│  ├─ Splits próximos
│  ├─ Vencimentos (bonds, opções)
│  └─ Earnings calls
│
└─ Assistente de IR
   ├─ Base de cálculo por ativo
   ├─ Sugestões de tax loss harvesting
   └─ Planejamento de realizações
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

### Tarefa 2: API de Cotações

**Integração com:**
- Alpha Vantage (ações internacionais)
- Dados B3 (ações BR, índices)
- BCB (SELIC, CDI, câmbio)

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

### Tarefa 4: Cálculos de Performance

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

### Tarefa 5: Assistente de IR

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
- **B3**: Ações BR, índices (via API ou web scraping)
- **Alpha Vantage**: Ações internacionais (chave de API)
- **BCB**: SELIC, CDI, câmbio (API REST livre)

### Performance
- Cálculos podem ser pesados (12 meses de dados)
- Executar em background via Web Worker (opcional)
- Cachear resultados por 1 dia

### UX
- Painel pode ser confuso para usuários não-técnicos
- Adicionar tooltips explicativos
- Exemplo: "Beta mede risco relativo ao mercado (1.0 = igual IBOV)"

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
