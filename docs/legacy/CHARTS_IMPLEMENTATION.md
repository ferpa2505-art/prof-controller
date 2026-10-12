# 📊 Chart.js Implementation Guide - ProF Controller

## 📋 Visão Geral

Este documento descreve a implementação de gráficos interativos usando Chart.js no dashboard do ProF Controller.

## 🎯 Objetivo

Fornecer visualizações de dados financeiros em tempo real através de gráficos modernos e responsivos:
- 📈 Evolução do patrimônio ao longo do tempo
- 🥧 Distribuição de tipos de investimento
- 📊 Comparativo de receitas vs despesas
- 🍩 Composição de ativos

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
prof-controller/
├── index.html                       # Containers dos gráficos + CDN
├── src/
│   ├── charts-data.js               # Transformação de dados
│   └── charts.js                    # Inicialização de gráficos
├── modern-dashboard.css             # Estilos dos containers
└── CHARTS_IMPLEMENTATION.md         # Este arquivo
```

### Fluxo de Dados

```
localStorage (dados)
        ↓
charts-data.js (getPatrimonioData, etc)
        ↓
charts.js (initAllCharts)
        ↓
Chart.js (renderização)
        ↓
DOM (canvas elements)
```

## 📦 Módulos

### 1. `src/charts-data.js`

Responsável por transformar dados do localStorage em formato Chart.js.

#### Funções Disponíveis

**`getPatrimonioData()`**
- Retorna dados de evolução do patrimônio
- Tipo: Line chart
- Período: Últimos 6 meses
- Formato:
```javascript
{
  labels: ['Junho', 'Julho', ...],
  datasets: [{
    label: 'Patrimônio Total (R$)',
    data: [125000, 128500, ...],
    borderColor: '#0099FF',
    ...
  }]
}
```

**`getInvestimentosData()`**
- Retorna distribuição de investimentos por tipo
- Tipo: Pie chart
- Categorias: Ações, Fundos, Cripto, Renda Fixa
- Formato:
```javascript
{
  labels: ['Ações', 'Fundos', 'Cripto', 'Renda Fixa'],
  datasets: [{
    data: [45000, 30000, 35000, 30200],
    backgroundColor: [...],
    ...
  }]
}
```

**`getReceitasDespesasData()`**
- Retorna comparativo de receitas vs despesas
- Tipo: Bar chart
- Período: Últimos 3 meses
- Formato:
```javascript
{
  labels: ['Setembro', 'Outubro', 'Novembro'],
  datasets: [
    {
      label: 'Receitas (R$)',
      data: [8500, 9200, 8800],
      ...
    },
    {
      label: 'Despesas (R$)',
      data: [3200, 2800, 3100],
      ...
    }
  ]
}
```

**`getAtivosData()`**
- Retorna composição de ativos
- Tipo: Doughnut chart
- Categorias: Ações, ETFs, Cripto, Fundos, Renda Fixa
- Formato: Similar ao Pie chart

#### Funções Utilitárias

**`getChartDefaults()`**
- Retorna configurações padrão para todos os gráficos
- Inclui: responsive, legend, tooltip, cores, fontes

**`formatCurrency(value)`**
- Formata números como moeda brasileira
- Entrada: `125000`
- Saída: `"R$ 125.000"`

**`formatPercent(value)`**
- Formata números como percentual
- Entrada: `75`
- Saída: `"75,0%"`

### 2. `src/charts.js`

Responsável pela inicialização e gerenciamento de gráficos Chart.js.

#### Funções Principais

**`initAllCharts()`** ⭐ (Função Principal)
- Inicializa todos os 4 gráficos
- Chamada automaticamente ao carregar a página
- Retorna: Dicionário com todas as instâncias

```javascript
// Chamada automática em index.html
document.addEventListener('DOMContentLoaded', function() {
  initAllCharts();
});
```

**`initPatrimonioChart()`**
- Inicializa gráfico de evolução do patrimônio
- Tipo: Line chart
- Canvas: `#patrimonio-chart`

**`initInvestimentosChart()`**
- Inicializa gráfico de distribuição
- Tipo: Pie chart
- Canvas: `#investimentos-chart`

**`initReceitasDespesasChart()`**
- Inicializa gráfico de receitas vs despesas
- Tipo: Bar chart
- Canvas: `#receitas-despesas-chart`

**`initAtivosChart()`**
- Inicializa gráfico de composição de ativos
- Tipo: Doughnut chart
- Canvas: `#ativos-chart`

#### Funções de Utilidade

**`updateChart(chartName, newData)`**
- Atualiza dados de um gráfico específico
- Parâmetros:
  - `chartName`: 'patrimonio', 'investimentos', 'receitasDespesas', 'ativos'
  - `newData`: Novo objeto de dados no formato Chart.js
- Exemplo:
```javascript
const novosDados = getPatrimonioData(); // com dados atualizados
updateChart('patrimonio', novosDados);
```

**`destroyAllCharts()`**
- Destroi todos os gráficos
- Útil para limpeza de memória

**`redrawAllCharts()`**
- Recria todos os gráficos
- Útil para responsividade (ao mudar tamanho da tela)

## 🎨 Paleta de Cores

Cores usadas nos gráficos (reutilizadas de `modern-ui.css`):

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Primário | #0099FF | Patrimônio, Ações |
| Ciano | #00D4FF | Gráficos secundários |
| Verde | #00D77E | Receitas, sucesso |
| Vermelho | #FF4757 | Despesas, alerta |
| Amarelo | #FFB800 | Renda Fixa, aviso |
| Laranja | #FF6B35 | Criptomoedas |

## 🔧 Como Adicionar um Novo Gráfico

### Passo 1: Criar função de dados em `src/charts-data.js`

```javascript
function getNovoGraficoData() {
  return {
    labels: [...],
    datasets: [{
      label: 'Novo Gráfico',
      data: [...],
      backgroundColor: '#0099FF',
      ...
    }]
  };
}
```

### Passo 2: Criar função de inicialização em `src/charts.js`

```javascript
function initNovoGrafico() {
  const ctx = document.getElementById('novo-grafico-chart');
  if (!ctx) return null;
  
  if (chartInstances.novoGrafico) {
    chartInstances.novoGrafico.destroy();
  }
  
  const data = getNovoGraficoData();
  const config = {
    type: 'bar', // ou 'line', 'pie', 'doughnut'
    data: data,
    options: { ...getChartDefaults(), ... }
  };
  
  chartInstances.novoGrafico = new Chart(ctx, config);
  return chartInstances.novoGrafico;
}
```

### Passo 3: Adicionar container em `index.html`

```html
<div class="chart-container">
  <h3>Novo Gráfico</h3>
  <canvas id="novo-grafico-chart"></canvas>
</div>
```

### Passo 4: Chamar no `initAllCharts()`

```javascript
function initAllCharts() {
  // ... gráficos existentes ...
  initNovoGrafico();
}
```

## 📱 Responsividade

Os gráficos são totalmente responsivos graças ao:

1. **CSS Grid**: Adapta-se a 1, 2 ou 4 colunas conforme tamanho da tela
2. **Chart.js responsive option**: Mantém proporção ao redimensionar
3. **Breakpoints**:
   - Mobile (<768px): 1 coluna
   - Tablet (768-1200px): 2 colunas
   - Desktop (>1200px): 4 colunas (2x2 grid)

## 🔗 Integração com Dados Reais

### Como conectar com localStorage

Para usar dados reais do localStorage:

```javascript
// Em src/charts-data.js
function getPatrimonioData() {
  // Carregar dados do localStorage
  const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  
  // Processar dados...
  const labels = ['Jun', 'Jul', ...];
  const values = [125000, 128500, ...];
  
  return {
    labels: labels,
    datasets: [{
      label: 'Patrimônio Total (R$)',
      data: values,
      ...
    }]
  };
}
```

## 📊 Tipos de Gráficos Chart.js Suportados

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `line` | Séries temporais, tendências | Patrimônio ao longo do tempo |
| `bar` | Comparações, categorias | Receitas vs Despesas |
| `pie` | Proporções, partes do todo | Distribuição de investimentos |
| `doughnut` | Proporções (variação do pie) | Composição de ativos |
| `area` | Preenchimento em linha | Variação de saldo |
| `radar` | Múltiplas dimensões | Análise de risco |

## ⚙️ Configurações Avançadas

### Alterar Cores

```javascript
// Em getPatrimonioData()
datasets: [{
  borderColor: '#FF6B35',        // Cor da linha
  backgroundColor: 'rgba(...)',  // Cor do preenchimento
  pointBackgroundColor: '#...',  // Cor dos pontos
  ...
}]
```

### Alterar Período

```javascript
// Modificar labels e data arrays
const labels = ['Ago', 'Set', 'Out', 'Nov', 'Dez'];
const data = [120000, 125000, 128500, 131200, 129800];
```

### Adicionar Tooltip Customizado

```javascript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          return 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

### "Chart.js não foi carregado"
**Solução**: Verificar se o CDN está acessível
```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
```

### Gráficos não aparecem
**Solução**: Verificar se os canvas IDs correspondem
```javascript
// Deve existir em index.html
<canvas id="patrimonio-chart"></canvas>
```

### Erro de plugin datalabels
**Solução**: Registrar plugin antes de usar
```javascript
Chart.register(ChartDataLabels);
```

### Performance lenta
**Solução**: Reduzir frequência de atualização
```javascript
// Ao invés de atualizar a cada mudança
setInterval(() => updateChart(...), 5000); // A cada 5s
```

## 📈 Roadmap Futuro

### Fase 2: Interatividade Avançada
- [ ] Range picker para seleção de datas
- [ ] Filtros por categoria/tipo
- [ ] Zoom e pan nos gráficos
- [ ] Export como PNG/PDF

### Fase 3: Dados em Tempo Real
- [ ] Sincronização com API backend
- [ ] WebSocket para atualizações
- [ ] Animações de mudança de dados

### Fase 4: Temas e Personalização
- [ ] Light/Dark mode
- [ ] Seletor de período (1m, 3m, 6m, 1a, all)
- [ ] Customização de cores por usuário

## 📚 Referências

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js Plugin Registry](https://www.chartjs.org/docs/latest/plugins/)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar console.log() para erros
2. Abrir DevTools (F12) e verificar aba Console
3. Consultar documentação do Chart.js
4. Criar issue no GitHub

---

**Versão**: 1.0.0  
**Última Atualização**: 2026-09-25  
**Status**: ✅ Completo e Testado  
**Licença**: MIT  
