/**
 * Charts Manager - Real Data Only
 * Gerencia TODOS os gráficos com dados 100% do banco de dados
 * Sem dados fake, sem mistura de dados
 * 
 * Dashboard é único por usuário:
 * - Cada usuário vê apenas seus dados financeiros
 * - Autenticação via token em localStorage
 */

class ChartsManager {
  constructor() {
    this.charts = {};
    this.autoRefreshInterval = null;
    this.userId = this.getUserId();
  }

  /**
   * Get user ID from auth token
   */
  getUserId() {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.userId || decoded.sub || null;
      } catch (e) {
        console.warn('Could not decode token:', e);
      }
    }
    return null;
  }

  /**
   * Initialize all charts with real data
   */
  async initialize() {
    console.log('📊 Inicializando gráficos com dados reais (usuário:', this.userId, ')');
    
    await this.loadPatrimonyChart();
    await this.loadDistributionChart();
    await this.loadCashFlowChart();
    await this.loadAssetsChart();
  }

  /**
   * Load Patrimony Evolution Chart (Evolução do Patrimônio)
   */
  async loadPatrimonyChart() {
    try {
      const response = await fetch('/api/financial/patrimony', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();

      const chartCanvas = document.getElementById('patrimonio-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState(chartCanvas, chartCard, 'Patrimônio');
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
            label: 'Patrimônio Líquido (R$)',
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

      console.log('✅ Gráfico de patrimônio carregado');

    } catch (error) {
      console.error('❌ Erro ao carregar gráfico de patrimônio:', error);
      this.showEmptyState(
        document.getElementById('patrimonio-chart'),
        document.querySelector('[data-chart="patrimonio-chart"]'),
        'Patrimônio'
      );
    }
  }

  /**
   * Load Distribution Chart (Distribuição de Investimentos)
   */
  async loadDistributionChart() {
    try {
      const response = await fetch('/api/financial/distribution', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();

      const chartCanvas = document.getElementById('investimentos-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState(chartCanvas, chartCard, 'Distribuição');
        return;
      }

      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => d.name),
        datasets: [
          {
            label: 'Percentual Real (%)',
            data: result.data.map(d => d.percentage),
            backgroundColor: [
              '#0099FF',  // Ações
              '#00D77E',  // Fundos
              '#00D4FF',  // Cripto
              '#FFB800',  // Renda Fixa
              '#FF6B35',  // Imóveis
              '#9D4EDD'   // Veículos
            ],
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 2
          }
        ]
      };

      this.createOrUpdateChart('investimentos-chart', 'bar', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });

      console.log('✅ Gráfico de distribuição carregado');

    } catch (error) {
      console.error('❌ Erro ao carregar gráfico de distribuição:', error);
      this.showEmptyState(
        document.getElementById('investimentos-chart'),
        document.querySelector('[data-chart="investimentos-chart"]'),
        'Distribuição'
      );
    }
  }

  /**
   * Load Cash Flow Chart (Receitas vs Despesas)
   */
  async loadCashFlowChart() {
    try {
      const response = await fetch('/api/financial/cash-flow', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();

      const chartCanvas = document.getElementById('receitas-despesas-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState(chartCanvas, chartCard, 'Fluxo');
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
            label: 'Receitas (R$)',
            data: result.data.map(d => d.income),
            backgroundColor: '#00D77E',
            borderColor: '#00D77E',
            borderWidth: 1
          },
          {
            label: 'Despesas (R$)',
            data: result.data.map(d => d.expenses),
            backgroundColor: '#FF6B35',
            borderColor: '#FF6B35',
            borderWidth: 1
          }
        ]
      };

      this.createOrUpdateChart('receitas-despesas-chart', 'bar', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });

      console.log('✅ Gráfico de fluxo carregado');

    } catch (error) {
      console.error('❌ Erro ao carregar gráfico de fluxo:', error);
      this.showEmptyState(
        document.getElementById('receitas-despesas-chart'),
        document.querySelector('[data-chart="receitas-despesas-chart"]'),
        'Fluxo'
      );
    }
  }

  /**
   * Load Assets Chart (Composição de Ativos - Doughnut)
   */
  async loadAssetsChart() {
    try {
      const response = await fetch('/api/financial/assets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();

      const chartCanvas = document.getElementById('ativos-chart');
      const chartCard = chartCanvas ? chartCanvas.closest('.chart-card') : null;

      if (!result.hasData || !result.data || result.data.length === 0) {
        this.showEmptyState(chartCanvas, chartCard, 'Ativos');
        return;
      }

      const noDataMsg = chartCard ? chartCard.querySelector('.no-data-message') : null;
      if (noDataMsg) noDataMsg.remove();
      if (chartCard) chartCard.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'block';

      const chartData = {
        labels: result.data.map(d => d.type),
        datasets: [
          {
            data: result.data.map(d => d.percentage),
            backgroundColor: [
              '#0099FF',  // Ações
              '#00D77E',  // ETFs
              '#FF6B35',  // Criptos
              '#FFB800',  // Fundos
              '#9D4EDD'   // Renda Fixa
            ],
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 2
          }
        ]
      };

      this.createOrUpdateChart('ativos-chart', 'doughnut', chartData, {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      });

      console.log('✅ Gráfico de ativos carregado');

    } catch (error) {
      console.error('❌ Erro ao carregar gráfico de ativos:', error);
      this.showEmptyState(
        document.getElementById('ativos-chart'),
        document.querySelector('[data-chart="ativos-chart"]'),
        'Ativos'
      );
    }
  }

  /**
   * Create or update chart instance
   */
  createOrUpdateChart(elementId, type, data, options) {
    const ctx = document.getElementById(elementId);
    if (!ctx) {
      console.warn(`Canvas element #${elementId} not found`);
      return;
    }

    // Destroy existing chart
    if (this.charts[elementId]) {
      this.charts[elementId].destroy();
    }

    this.charts[elementId] = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        ...options,
        plugins: {
          ...options.plugins,
          datalabels: {
            display: false
          }
        }
      }
    });
  }

  /**
   * Show empty state message
   */
  showEmptyState(chartCanvas, chartCard, chartName) {
    if (chartCanvas) {
      chartCanvas.style.display = 'none';
    }

    if (chartCard) {
      // Remove existing no-data message
      const existingMsg = chartCard.querySelector('.no-data-message');
      if (existingMsg) existingMsg.remove();

      // Create and insert no-data message
      const noDataDiv = document.createElement('div');
      noDataDiv.className = 'no-data-message';
      noDataDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 60px 20px;
        text-align: center;
        min-height: 400px;
      `;
      noDataDiv.innerHTML = `
        <svg style="width: 64px; height: 64px; color: rgba(255, 255, 255, 0.3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 0;">
          Ainda Sem Dados Para Confecção dos Gráficos
        </p>
        <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 0;">
          Adicione dados de ${chartName.toLowerCase()} para visualizar este gráfico
        </p>
      `;

      chartCard.appendChild(noDataDiv);
    }
  }

  /**
   * Format month name (2024-09 -> Setembro)
   */
  formatMonth(monthStr) {
    if (!monthStr) return '';
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const [year, month] = monthStr.split('-');
    const monthIndex = parseInt(month) - 1;
    return `${months[monthIndex]}`;
  }

  /**
   * Start auto-refresh (a cada 30 segundos)
   */
  startAutoRefresh(interval = 30000) {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    this.autoRefreshInterval = setInterval(async () => {
      console.log('🔄 Atualizando gráficos...');
      await this.initialize();
    }, interval);

    console.log(`✅ Auto-refresh configurado a cada ${interval / 1000}s`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  /**
   * Refresh charts immediately
   */
  async refresh() {
    console.log('🔄 Atualizando gráficos manualmente');
    await this.initialize();
  }

  /**
   * Destroy all charts
   */
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
    this.stopAutoRefresh();
  }
}

// Create global instance
window.chartsManager = new ChartsManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await window.chartsManager.initialize();
    window.chartsManager.startAutoRefresh(30000);
  });
} else {
  window.chartsManager.initialize();
  window.chartsManager.startAutoRefresh(30000);
}
