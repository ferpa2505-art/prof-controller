/**
 * Charts Manager - Real Data Only
 * Gerencia TODOS os gráficos com dados 100% do banco de dados
 *
 * Os textos vêm do I18N do app.js (função global t()). Como o Chart.js
 * desenha no canvas, trocar o idioma exige redesenhar: applyLang() chama
 * window.chartsManager.initialize().
 */

// Tradução com fallback: funciona mesmo se o app.js ainda não tiver carregado
function chartT(key, fallback) {
  if (typeof t === 'function') {
    const v = t(key);
    if (v && v !== key) return v;
  }
  return fallback;
}

function chartLang() {
  try {
    return (typeof state !== 'undefined' && state.settings && state.settings.lang) || 'pt-BR';
  } catch (e) {
    return 'pt-BR';
  }
}

class ChartsManager {
  constructor() {
    this.charts = {};
    this.autoRefreshInterval = null;
  }

  /**
   * Initialize all charts with real data
   */
  async initialize() {
    console.log('📊 Inicializando gráficos com dados reais...');

    try {
      await this.loadPatrimonyChart();
      await this.loadDistributionChart();
      await this.loadCashFlowChart();
      await this.loadAssetsChart();
    } catch (error) {
      console.error('Erro ao inicializar gráficos:', error);
    }
  }

  /**
   * Load Patrimony Evolution Chart (Evolução do Patrimônio)
   */
  async loadPatrimonyChart() {
    try {
      const response = await fetch('/api/financial/patrimony');

      if (!response.ok) {
        console.warn('Erro ao buscar patrimony:', response.status);
        this.showEmptyState('patrimonio-chart');
        return;
      }

      const result = await response.json();

      const chartCanvas = document.getElementById('patrimonio-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState('patrimonio-chart', chartCard);
        return;
      }

      // Remover mensagem de "sem dados"
      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => this.formatMonth(d.month)),
        datasets: [
          {
            label: chartT('charts.ds.netWorth', 'Patrimônio Líquido'),
            data: result.data.map(d => d.netWorth),
            borderColor: '#0099FF',
            backgroundColor: 'rgba(0, 153, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#0099FF',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointHoverRadius: 7
          }
        ]
      };

      this.createOrUpdateChart('patrimonio-chart', 'line', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar gráfico de patrimônio:', error);
      this.showEmptyState('patrimonio-chart');
    }
  }

  /**
   * Load Distribution Chart (Distribuição de Investimentos)
   */
  async loadDistributionChart() {
    try {
      const response = await fetch('/api/financial/distribution');

      if (!response.ok) {
        console.warn('Erro ao buscar distribution:', response.status);
        this.showEmptyState('investimentos-chart');
        return;
      }

      const result = await response.json();

      const chartCanvas = document.getElementById('investimentos-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState('investimentos-chart', chartCard);
        return;
      }

      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => this.typeLabel(d.type)),
        datasets: [{
          label: chartT('charts.ds.distribution', 'Distribuição (%)'),
          data: result.data.map(d => d.percentage),
          backgroundColor: [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA15E', '#BC6C25', '#D4A574'
          ],
          borderWidth: 2,
          borderColor: '#FFF'
        }]
      };

      this.createOrUpdateChart('investimentos-chart', 'doughnut', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar gráfico de distribuição:', error);
      this.showEmptyState('investimentos-chart');
    }
  }

  /**
   * Load Cash Flow Chart (Fluxo de Caixa)
   */
  async loadCashFlowChart() {
    try {
      const response = await fetch('/api/financial/cashflow');

      if (!response.ok) {
        console.warn('Erro ao buscar cashflow:', response.status);
        this.showEmptyState('receitas-despesas-chart');
        return;
      }

      const result = await response.json();

      const chartCanvas = document.getElementById('receitas-despesas-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState('receitas-despesas-chart', chartCard);
        return;
      }

      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => this.formatMonth(d.month)),
        datasets: [
          {
            label: chartT('charts.ds.income', 'Receitas'),
            data: result.data.map(d => d.income),
            backgroundColor: '#52B788',
            barPercentage: 0.7
          },
          {
            label: chartT('charts.ds.expense', 'Despesas'),
            data: result.data.map(d => d.expense),
            backgroundColor: '#E63946',
            barPercentage: 0.7
          }
        ]
      };

      this.createOrUpdateChart('receitas-despesas-chart', 'bar', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar gráfico de fluxo:', error);
      this.showEmptyState('receitas-despesas-chart');
    }
  }

  /**
   * Load Assets Composition Chart (Composição de Ativos)
   */
  async loadAssetsChart() {
    try {
      const response = await fetch('/api/financial/assets');

      if (!response.ok) {
        console.warn('Erro ao buscar assets:', response.status);
        this.showEmptyState('ativos-chart');
        return;
      }

      const result = await response.json();

      const chartCanvas = document.getElementById('ativos-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState('ativos-chart', chartCard);
        return;
      }

      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => this.typeLabel(d.type)),
        datasets: [{
          label: chartT('charts.ds.value', 'Valor'),
          data: result.data.map(d => d.value),
          backgroundColor: [
            '#1abc9c', '#3498db', '#9b59b6', '#e74c3c',
            '#f39c12', '#16a085', '#2980b9', '#8e44ad'
          ],
          borderWidth: 2,
          borderColor: '#FFF'
        }]
      };

      this.createOrUpdateChart('ativos-chart', 'pie', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar gráfico de ativos:', error);
      this.showEmptyState('ativos-chart');
    }
  }

  /**
   * Create or update a chart
   */
  createOrUpdateChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} não encontrado`);
      return;
    }

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    this.charts[canvasId] = new Chart(ctx, {
      type,
      data,
      options: {
        // Números dos eixos e tooltips no formato do idioma escolhido
        locale: chartLang(),
        ...options,
        responsive: true,
        maintainAspectRatio: false
      }
    });

    console.log(`✅ Gráfico ${canvasId} criado com sucesso`);
  }

  /**
   * Show empty state message
   */
  showEmptyState(canvasOrId, chartCard) {
    const canvas = typeof canvasOrId === 'string'
      ? document.getElementById(canvasOrId)
      : canvasOrId;

    if (!canvas) return;

    canvas.style.display = 'none';

    const card = chartCard || canvas.closest('.chart-card');
    if (!card) return;

    let noDataMsg = card.querySelector('.no-data-message');
    if (!noDataMsg) {
      noDataMsg = document.createElement('div');
      noDataMsg.className = 'no-data-message';
      noDataMsg.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        font-size: 16px;
        color: #999;
        background: #f5f5f5;
        border-radius: 8px;
        margin-top: 10px;
      `;
      card.appendChild(noDataMsg);
    }
    // Atualiza sempre, para acompanhar a troca de idioma
    noDataMsg.textContent = chartT('charts.empty', 'Ainda sem dados para montar os gráficos');
  }

  /**
   * Traduz o tipo vindo da API ("Acoes", "Renda Fixa"...). Tipos sem
   * tradução aparecem como vieram.
   */
  typeLabel(type) {
    return chartT('charts.type.' + String(type || '').toLowerCase(), type);
  }

  /**
   * Format month for display ("Abr '24", "Apr '24", "Abr '24")
   */
  formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const name = new Date(Number(year), Number(month) - 1, 1)
      .toLocaleDateString(chartLang(), { month: 'short' })
      .replace('.', '');
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} '${year.slice(-2)}`;
  }
}

// Initialize charts when DOM is ready
// Exposto em window para o applyLang() redesenhar ao trocar de idioma
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chartsManager = new ChartsManager();
    window.chartsManager.initialize();
  });
} else {
  window.chartsManager = new ChartsManager();
  window.chartsManager.initialize();
}
