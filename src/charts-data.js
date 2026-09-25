/* ============================================================
   📊 CHARTS DATA MODULE - ProF Controller
   Transformação de dados do localStorage em formato Chart.js
   ============================================================ */

/**
 * Pula dados reais do patrimônio do localStorage/app
 * @returns {Object} Dados formatados para Chart.js Line
 */
function getPatrimonioData() {
  // Tentar puxar dados reais do app
  let patrimonio = [125000, 128500, 131200, 129800, 135400, 140200];
  let months = ['Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro'];
  
  try {
    // Procura por dados reais no localStorage ou window.app
    if (window.financialData && window.financialData.patrimonio) {
      const realData = window.financialData.patrimonio;
      patrimonio = realData.values || patrimonio;
      months = realData.labels || months;
    }
  } catch (e) {
    console.log('Usando dados de demonstração para patrimônio');
  }
  
  return {
    labels: months,
    datasets: [{
      label: 'Patrimônio Total (R$)',
      data: patrimonio,
      borderColor: '#0099FF',
      backgroundColor: 'rgba(0, 153, 255, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#0099FF',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#00D4FF'
    }]
  };
}

/**
 * Puxa dados reais de investimentos do localStorage/app
 * @returns {Object} Dados formatados para Chart.js Pie
 */
function getInvestimentosData() {
  let labels = ['Ações', 'Fundos', 'Cripto', 'Renda Fixa'];
  let data = [45000, 30000, 35000, 30200];
  let colors = ['#0099FF', '#00D77E', '#00D4FF', '#FFB800'];
  
  try {
    // Procura por dados reais
    if (window.financialData && window.financialData.investimentos) {
      const realData = window.financialData.investimentos;
      labels = realData.labels || labels;
      data = realData.values || data;
      colors = realData.colors || colors;
    }
  } catch (e) {
    console.log('Usando dados de demonstração para investimentos');
  }
  
  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 2
    }]
  };
}

/**
 * Puxa dados reais de receitas vs despesas do localStorage/app
 * @returns {Object} Dados formatados para Chart.js Bar
 */
function getReceitasDespesasData() {
  let months = ['Setembro', 'Outubro', 'Novembro'];
  let receitas = [8500, 9200, 8800];
  let despesas = [3200, 2800, 3100];
  
  try {
    // Procura por dados reais
    if (window.financialData && window.financialData.receitasDespesas) {
      const realData = window.financialData.receitasDespesas;
      months = realData.labels || months;
      receitas = realData.receitas || receitas;
      despesas = realData.despesas || despesas;
    }
  } catch (e) {
    console.log('Usando dados de demonstração para receitas/despesas');
  }
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Receitas (R$)',
        data: receitas,
        backgroundColor: '#00D77E',
        borderColor: '#00B86B',
        borderWidth: 1
      },
      {
        label: 'Despesas (R$)',
        data: despesas,
        backgroundColor: '#FF4757',
        borderColor: '#C81D25',
        borderWidth: 1
      }
    ]
  };
}

/**
 * Puxa dados reais de ativos do localStorage/app
 * @returns {Object} Dados formatados para Chart.js Doughnut
 */
function getAtivosData() {
  let labels = ['Ações Brasileiras', 'ETFs', 'Criptomoedas', 'Fundos de Investimento', 'Renda Fixa'];
  let data = [42000, 28000, 35000, 22000, 15200];
  let colors = ['#0099FF', '#00D4FF', '#FF6B35', '#F7B801', '#00D77E'];
  
  try {
    // Procura por dados reais
    if (window.financialData && window.financialData.ativos) {
      const realData = window.financialData.ativos;
      labels = realData.labels || labels;
      data = realData.values || data;
      colors = realData.colors || colors;
    }
  } catch (e) {
    console.log('Usando dados de demonstração para ativos');
  }
  
  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 2
    }]
  };
}

/**
 * Configurações padrão para Chart.js
 * @returns {Object} Configurações globais
 */
function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 41, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(0, 153, 255, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    }
  };
}

/**
 * Função auxiliar para formatar valores monetários em gráficos
 * @param {number} value - Valor a formatar
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Função auxiliar para formatar percentuais
 * @param {number} value - Valor a formatar (0-100)
 * @returns {string} Valor formatado com %
 */
function formatPercent(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

/**
 * Exporta todas as funções
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPatrimonioData,
    getInvestimentosData,
    getReceitasDespesasData,
    getAtivosData,
    getChartDefaults,
    formatCurrency,
    formatPercent
  };
}
