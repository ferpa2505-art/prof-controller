/**
 * API Integration for Financial Charts
 * Busca dados reais do backend para alimentar os gráficos
 */

const API_BASE = '/api/financial';

/**
 * Fetch Patrimony Evolution (Mês a mês)
 */
async function fetchPatrimonyData() {
  try {
    const response = await fetch(`${API_BASE}/patrimony`);
    const result = await response.json();
    
    if (!result.hasData) {
      return {
        hasData: false,
        message: result.message
      };
    }

    // Transformar dados para formato do gráfico
    const labels = result.data.map(item => item.month);
    const netWorthData = result.data.map(item => item.netWorth);
    const assetsData = result.data.map(item => item.totalAssets);
    const liabilitiesData = result.data.map(item => item.totalLiabilities);

    return {
      hasData: true,
      labels,
      datasets: [
        {
          label: 'Patrimônio Líquido',
          data: netWorthData,
          borderColor: '#0099FF',
          backgroundColor: 'rgba(0, 153, 255, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total de Ativos',
          data: assetsData,
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total de Passivos',
          data: liabilitiesData,
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.05)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching patrimony data:', error);
    return {
      hasData: false,
      message: 'Ainda Sem Dados Para Confecção dos Gráficos'
    };
  }
}

/**
 * Fetch Distribution (Investimentos + Imóveis + Veículos + Contas)
 */
async function fetchDistributionData() {
  try {
    const response = await fetch(`${API_BASE}/distribution`);
    const result = await response.json();
    
    if (!result.hasData) {
      return {
        hasData: false,
        message: result.message
      };
    }

    // Transformar para formato do gráfico
    const labels = result.data.map(item => item.name);
    const data = result.data.map(item => item.value);
    const colors = [
      '#0099FF', // Investimentos (azul)
      '#FF6B35', // Imóveis (laranja)
      '#FFC107', // Veículos (amarelo)
      '#00D4FF'  // Contas (ciano)
    ];

    return {
      hasData: true,
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching distribution data:', error);
    return {
      hasData: false,
      message: 'Ainda Sem Dados Para Confecção dos Gráficos'
    };
  }
}

/**
 * Fetch Cash Flow (Receitas vs Despesas efetivas)
 */
async function fetchCashFlowData() {
  try {
    const response = await fetch(`${API_BASE}/cash-flow`);
    const result = await response.json();
    
    if (!result.hasData) {
      return {
        hasData: false,
        message: result.message
      };
    }

    // Transformar para formato do gráfico
    const labels = result.data.map(item => item.month);
    const incomeData = result.data.map(item => item.income);
    const expenseData = result.data.map(item => item.expense);

    return {
      hasData: true,
      labels,
      datasets: [
        {
          label: 'Receitas Efetivas',
          data: incomeData,
          backgroundColor: '#00D4FF',
          borderColor: '#00D4FF',
          borderWidth: 2,
          type: 'bar'
        },
        {
          label: 'Despesas Efetivas',
          data: expenseData,
          backgroundColor: '#FF6B35',
          borderColor: '#FF6B35',
          borderWidth: 2,
          type: 'bar'
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
    return {
      hasData: false,
      message: 'Ainda Sem Dados Para Confecção dos Gráficos'
    };
  }
}

/**
 * Fetch Assets Composition (por tipo de investimento)
 */
async function fetchAssetsData() {
  try {
    const response = await fetch(`${API_BASE}/assets`);
    const result = await response.json();
    
    if (!result.hasData) {
      return {
        hasData: false,
        message: result.message
      };
    }

    // Transformar para formato do gráfico
    const labels = result.data.map(item => item.name);
    const data = result.data.map(item => item.value);
    
    const colors = [
      '#0099FF', // Ações
      '#FF6B35', // Criptos
      '#FFC107', // ETFs
      '#00D4FF', // FIIs
      '#A3FF5B', // Dividendos
      '#FF8C42', // Tesouro Direto
      '#9C27B0'  // Outros
    ];

    return {
      hasData: true,
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching assets data:', error);
    return {
      hasData: false,
      message: 'Ainda Sem Dados Para Confecção dos Gráficos'
    };
  }
}

/**
 * Show "No Data" message in chart container
 */
function showNoDataMessage(chartContainer, message) {
  const card = chartContainer.closest('.chart-card');
  if (card) {
    // Hide all existing content
    const canvas = card.querySelector('canvas');
    if (canvas) canvas.style.display = 'none';

    // Create or update no-data message
    let messageEl = card.querySelector('.no-data-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'no-data-message';
      card.appendChild(messageEl);
    }

    messageEl.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 380px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
        text-align: center;
        padding: 24px;
      ">
        <svg style="width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="15"></line>
          <line x1="15" y1="9" x2="9" y2="15"></line>
        </svg>
        <p>${message}</p>
      </div>
    `;
    messageEl.style.display = 'flex';
  }
}

/**
 * Initialize all charts with real data
 */
async function initializeChartsWithData() {
  console.log('🚀 Iniciando gráficos com dados reais...');

  // Fetch all data in parallel
  const [patrimonyResult, distributionResult, cashFlowResult, assetsResult] = await Promise.all([
    fetchPatrimonyData(),
    fetchDistributionData(),
    fetchCashFlowData(),
    fetchAssetsData()
  ]);

  // Update or initialize each chart based on data availability
  updateChartIfNeeded('patrimonio', patrimonyResult);
  updateChartIfNeeded('investimentos', distributionResult);
  updateChartIfNeeded('receitasDespesas', cashFlowResult);
  updateChartIfNeeded('ativos', assetsResult);

  console.log('✅ Gráficos inicializados com dados reais');
}

/**
 * Update chart or show no-data message
 */
function updateChartIfNeeded(chartKey, dataResult) {
  const canvasId = {
    'patrimonio': 'patrimonio-chart',
    'investimentos': 'investimentos-chart',
    'receitasDespesas': 'receitas-despesas-chart',
    'ativos': 'ativos-chart'
  }[chartKey];

  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl) {
    console.warn(`Canvas #${canvasId} não encontrado`);
    return;
  }

  if (!dataResult.hasData) {
    showNoDataMessage(canvasEl, dataResult.message);
    return;
  }

  // If chart instance exists, update it
  if (window.chartInstances && window.chartInstances[chartKey]) {
    const chart = window.chartInstances[chartKey];
    chart.data.labels = dataResult.labels;
    chart.data.datasets = dataResult.datasets;
    chart.update();
    console.log(`✅ ${chartKey} atualizado com dados reais`);
  } else {
    console.warn(`Instância do gráfico ${chartKey} não encontrada`);
  }
}

/**
 * Refresh charts periodically (a cada 30 segundos)
 */
function startChartsAutoRefresh(interval = 30000) {
  setInterval(() => {
    console.log('🔄 Atualizando gráficos...');
    initializeChartsWithData();
  }, interval);
}

// Export functions for global use
if (typeof window !== 'undefined') {
  window.fetchPatrimonyData = fetchPatrimonyData;
  window.fetchDistributionData = fetchDistributionData;
  window.fetchCashFlowData = fetchCashFlowData;
  window.fetchAssetsData = fetchAssetsData;
  window.initializeChartsWithData = initializeChartsWithData;
  window.startChartsAutoRefresh = startChartsAutoRefresh;
}
