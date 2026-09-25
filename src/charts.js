/* ============================================================
   📊 CHARTS MODULE - ProF Controller
   Inicialização e gerenciamento de gráficos Chart.js
   ============================================================ */

// Registro de instâncias dos gráficos
const chartInstances = {
  patrimonio: null,
  investimentos: null,
  receitasDespesas: null,
  ativos: null
};

/**
 * Inicializa o gráfico de evolução do patrimônio
 * @returns {Chart} Instância do gráfico
 */
function initPatrimonioChart() {
  const ctx = document.getElementById('patrimonio-chart');
  if (!ctx) {
    console.warn('Canvas #patrimonio-chart não encontrado');
    return null;
  }

  // Destruir gráfico anterior se existir
  if (chartInstances.patrimonio) {
    chartInstances.patrimonio.destroy();
  }

  const data = getPatrimonioData();
  const defaults = getChartDefaults();

  const config = {
    type: 'line',
    data: data,
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        datalabels: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 11
            },
            callback: function(value) {
              return 'R$ ' + (value / 1000).toFixed(0) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 11
            }
          }
        }
      }
    }
  };

  chartInstances.patrimonio = new Chart(ctx, config);
  return chartInstances.patrimonio;
}

/**
 * Inicializa o gráfico de distribuição de investimentos
 * @returns {Chart} Instância do gráfico
 */
function initInvestimentosChart() {
  const ctx = document.getElementById('investimentos-chart');
  if (!ctx) {
    console.warn('Canvas #investimentos-chart não encontrado');
    return null;
  }

  // Destruir gráfico anterior se existir
  if (chartInstances.investimentos) {
    chartInstances.investimentos.destroy();
  }

  const data = getInvestimentosData();
  const defaults = getChartDefaults();

  const config = {
    type: 'pie',
    data: data,
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        datalabels: {
          color: '#FFFFFF',
          font: {
            size: 12,
            weight: 'bold'
          },
          formatter: function(value, context) {
            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value * 100) / sum).toFixed(1);
            return percentage + '%';
          }
        }
      }
    }
  };

  // Registrar plugin datalabels se disponível
  if (typeof Chart !== 'undefined' && Chart.plugins) {
    Chart.register(ChartDataLabels);
  }

  chartInstances.investimentos = new Chart(ctx, config);
  return chartInstances.investimentos;
}

/**
 * Inicializa o gráfico de receitas vs despesas
 * @returns {Chart} Instância do gráfico
 */
function initReceitasDespesasChart() {
  const ctx = document.getElementById('receitas-despesas-chart');
  if (!ctx) {
    console.warn('Canvas #receitas-despesas-chart não encontrado');
    return null;
  }

  // Destruir gráfico anterior se existir
  if (chartInstances.receitasDespesas) {
    chartInstances.receitasDespesas.destroy();
  }

  const data = getReceitasDespesasData();
  const defaults = getChartDefaults();

  const config = {
    type: 'bar',
    data: data,
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        datalabels: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 11
            },
            callback: function(value) {
              return 'R$ ' + (value / 1000).toFixed(1) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 11
            }
          }
        }
      }
    }
  };

  chartInstances.receitasDespesas = new Chart(ctx, config);
  return chartInstances.receitasDespesas;
}

/**
 * Inicializa o gráfico de composição de ativos
 * @returns {Chart} Instância do gráfico
 */
function initAtivosChart() {
  const ctx = document.getElementById('ativos-chart');
  if (!ctx) {
    console.warn('Canvas #ativos-chart não encontrado');
    return null;
  }

  // Destruir gráfico anterior se existir
  if (chartInstances.ativos) {
    chartInstances.ativos.destroy();
  }

  const data = getAtivosData();
  const defaults = getChartDefaults();

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        datalabels: {
          color: '#FFFFFF',
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: function(value, context) {
            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value * 100) / sum).toFixed(1);
            return percentage + '%';
          }
        }
      }
    }
  };

  // Registrar plugin datalabels se disponível
  if (typeof Chart !== 'undefined' && Chart.plugins) {
    Chart.register(ChartDataLabels);
  }

  chartInstances.ativos = new Chart(ctx, config);
  return chartInstances.ativos;
}

/**
 * Inicializa todos os gráficos
 * @returns {Object} Dicionário com todas as instâncias
 */
function initAllCharts() {
  console.log('Inicializando gráficos Chart.js...');
  
  try {
    // Esperar que o Chart.js esteja carregado
    if (typeof Chart === 'undefined') {
      console.error('Chart.js não foi carregado. Verifique o CDN.');
      return null;
    }

    // Registrar plugin datalabels globalmente
    if (typeof ChartDataLabels !== 'undefined') {
      Chart.register(ChartDataLabels);
    }

    // Inicializar cada gráfico
    initPatrimonioChart();
    initInvestimentosChart();
    initReceitasDespesasChart();
    initAtivosChart();

    console.log('✅ Todos os gráficos inicializados com sucesso!');
    return chartInstances;
  } catch (error) {
    console.error('❌ Erro ao inicializar gráficos:', error);
    return null;
  }
}

/**
 * Atualiza os dados de um gráfico específico
 * @param {string} chartName - Nome do gráfico (patrimonio, investimentos, etc)
 * @param {Object} newData - Novos dados no formato Chart.js
 */
function updateChart(chartName, newData) {
  const chart = chartInstances[chartName];
  if (!chart) {
    console.warn(`Gráfico ${chartName} não inicializado`);
    return;
  }

  chart.data = newData;
  chart.update('active');
}

/**
 * Destroi todos os gráficos (útil para limpeza)
 */
function destroyAllCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });
  Object.keys(chartInstances).forEach(key => {
    chartInstances[key] = null;
  });
}

/**
 * Recria todos os gráficos (útil para resize de tela)
 */
function redrawAllCharts() {
  destroyAllCharts();
  initAllCharts();
}

/**
 * Exporta funções públicas
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPatrimonioChart,
    initInvestimentosChart,
    initReceitasDespesasChart,
    initAtivosChart,
    initAllCharts,
    updateChart,
    destroyAllCharts,
    redrawAllCharts
  };
}
