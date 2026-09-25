/* ============================================================
   📊 CHARTS DATA MODULE - ProF Controller
   Transformação de dados do localStorage em formato Chart.js
   ============================================================ */

/**
 * Gera dados mockados para o gráfico de evolução do patrimônio
 * @returns {Object} Dados formatados para Chart.js Line
 */
function getPatrimonioData() {
  // Dados mockados: últimos 6 meses
  const months = ['Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro'];
  const patrimonio = [125000, 128500, 131200, 129800, 135400, 140200];
  
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
 * Gera dados mockados para o gráfico de distribuição de investimentos
 * @returns {Object} Dados formatados para Chart.js Pie
 */
function getInvestimentosData() {
  return {
    labels: ['Ações', 'Fundos', 'Cripto', 'Renda Fixa'],
    datasets: [{
      data: [45000, 30000, 35000, 30200],
      backgroundColor: [
        '#0099FF',  // Azul primário
        '#00D77E',  // Verde
        '#00D4FF',  // Ciano
        '#FFB800'   // Amarelo
      ],
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 2
    }]
  };
}

/**
 * Gera dados mockados para o gráfico de receitas vs despesas
 * @returns {Object} Dados formatados para Chart.js Bar
 */
function getReceitasDespesasData() {
  const months = ['Setembro', 'Outubro', 'Novembro'];
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Receitas (R$)',
        data: [8500, 9200, 8800],
        backgroundColor: '#00D77E',
        borderColor: '#00B86B',
        borderWidth: 1
      },
      {
        label: 'Despesas (R$)',
        data: [3200, 2800, 3100],
        backgroundColor: '#FF4757',
        borderColor: '#C81D25',
        borderWidth: 1
      }
    ]
  };
}

/**
 * Gera dados mockados para o gráfico de composição de ativos
 * @returns {Object} Dados formatados para Chart.js Doughnut
 */
function getAtivosData() {
  return {
    labels: ['Ações Brasileiras', 'ETFs', 'Criptomoedas', 'Fundos de Investimento', 'Renda Fixa'],
    datasets: [{
      data: [42000, 28000, 35000, 22000, 15200],
      backgroundColor: [
        '#0099FF',  // Azul
        '#00D4FF',  // Ciano
        '#FF6B35',  // Laranja
        '#F7B801',  // Amarelo
        '#00D77E'   // Verde
      ],
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
