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
 * Retorna barras verticais 3D com linhas de média sugerida e real
 * @returns {Object} Dados formatados para Chart.js Mixed Chart (Bar + Line)
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
  
  // Calcular total e percentuais
  const total = data.reduce((a, b) => a + b, 0);
  const percentuais = data.map(v => (v / total) * 100);
  
  // Média sugerida (distribuição uniforme)
  const mediasugerida = data.map(() => 25);
  
  // Cores com gradiente para efeito 3D (versão escura para sombra)
  const colores3D = colors.map(color => ({
    light: color,
    dark: adjustBrightness(color, -30)
  }));
  
  return {
    labels: labels,
    datasets: [
      // Dataset 1: Barras verticais com efeito 3D
      {
        type: 'bar',
        label: 'Percentual Real (%)',
        data: percentuais,
        backgroundColor: colors.map(color => {
          // Criar gradiente para efeito 3D
          return color;
        }),
        borderColor: colors.map(color => adjustBrightness(color, -40)),
        borderWidth: 2,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: '#FFFFFF',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: function(value) {
            return value.toFixed(1) + '%';
          }
        }
      },
      // Dataset 2: Linha de média sugerida
      {
        type: 'line',
        label: 'Média Sugerida (25%)',
        data: mediasugerida,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        tension: 0.4
      },
      // Dataset 3: Linha de investimento real (suavizada)
      {
        type: 'line',
        label: 'Tendência Real',
        data: percentuais,
        borderColor: '#00FF88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        borderWidth: 2,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#00FF88',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        tension: 0.4
      }
    ]
  };
}

/**
 * Função auxiliar para ajustar brilho de uma cor hex
 * @param {string} color - Cor em formato #RRGGBB
 * @param {number} percent - Percentual de ajuste (-100 a 100)
 * @returns {string} Cor ajustada em formato #RRGGBB
 */
function adjustBrightness(color, percent) {
  const num = parseInt(color.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255))
    .toString(16).slice(1);
}

/**
 * Função auxiliar para converter cor hex para rgba
 * @param {string} hex - Cor em formato #RRGGBB
 * @param {number} alpha - Transparência (0-1)
 * @returns {string} Cor em formato rgba
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
