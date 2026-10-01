/**
 * Charts Manager — gráficos do fichário
 *
 * Os dados vêm do próprio app (IndexedDB, já carregado em `state` pelo app.js).
 * Nada sai do aparelho: não há servidor nem API. Os cálculos reaproveitam o
 * motor do app.js (buildNAVSeries, buildCashflowSeries, positionValue, toBase),
 * então estes gráficos mostram exatamente os mesmos números das outras telas.
 *
 * Os textos vêm do I18N do app.js (função global t()). Como o Chart.js
 * desenha no canvas, trocar o idioma ou os dados exige redesenhar: o renderAll()
 * do app.js chama window.chartsManager.initialize() ao final.
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

// O app.js ainda não carregou (ou o cofre está bloqueado e o state está vazio)
function appReady() {
  return typeof state !== 'undefined' && typeof buildNAVSeries === 'function' &&
    typeof buildCashflowSeries === 'function' && typeof positionValue === 'function' &&
    typeof toBase === 'function';
}

// Valor em moeda base; conversão impossível conta como zero em vez de NaN
function baseValue(amount, currency, date) {
  const v = toBase(amount, currency, date);
  return Number.isFinite(v) ? v : 0;
}

class ChartsManager {
  constructor() {
    this.charts = {};
  }

  /**
   * Redesenha os 4 gráficos a partir do estado atual do app
   */
  initialize() {
    const nav = this.safe(() => (appReady() ? buildNAVSeries() : null), null);
    const points = (nav && nav.points) || [];

    this.safe(() => this.loadPatrimonyChart(points));
    this.safe(() => this.loadDistributionChart());
    this.safe(() => this.loadCashFlowChart());
    this.safe(() => this.loadAssetsChart(points));
  }

  safe(fn, fallback) {
    try {
      return fn();
    } catch (error) {
      console.error('Erro ao montar gráfico:', error);
      return fallback;
    }
  }

  /**
   * Evolução do Patrimônio Líquido, mês a mês
   */
  loadPatrimonyChart(points) {
    const id = 'patrimonio-chart';
    const temDado = points.some((p) => Math.abs(p.net) > 0.005);
    if (!temDado) { this.showEmptyState(id); return; }

    this.createOrUpdateChart(id, 'line', {
      labels: points.map((p) => this.formatMonth(p.date.slice(0, 7))),
      datasets: [{
        label: chartT('charts.ds.netWorth', 'Patrimônio Líquido'),
        data: points.map((p) => Math.round(p.net * 100) / 100),
        borderColor: '#0099FF',
        backgroundColor: 'rgba(0, 153, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0099FF',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    }, {
      plugins: { legend: { display: true, position: 'bottom' } }
    });
  }

  /**
   * Distribuição dos investimentos por tipo (ações, FII, CDB...), em %
   */
  loadDistributionChart() {
    const id = 'investimentos-chart';
    if (!appReady()) { this.showEmptyState(id); return; }

    const hoje = todayISO();
    const porTipo = {};
    state.positions.forEach((pos) => {
      const v = baseValue(positionValue(pos, hoje), pos.currency, hoje);
      if (v <= 0) return;
      const tipo = pos.assetType || 'other';
      porTipo[tipo] = (porTipo[tipo] || 0) + v;
    });
    const total = Object.values(porTipo).reduce((s, v) => s + v, 0);
    if (total <= 0) { this.showEmptyState(id); return; }

    const itens = Object.entries(porTipo).sort((a, b) => b[1] - a[1]);
    this.createOrUpdateChart(id, 'doughnut', {
      labels: itens.map(([tipo]) => chartT('inv.ty.' + tipo, tipo)),
      datasets: [{
        label: chartT('charts.ds.distribution', 'Distribuição (%)'),
        data: itens.map(([, v]) => Math.round((v / total) * 1000) / 10),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
          '#FFEAA7', '#DDA15E', '#BC6C25', '#D4A574', '#8E9AAF'
        ],
        borderWidth: 2,
        borderColor: '#FFF'
      }]
    }, {
      plugins: { legend: { display: true, position: 'right' } }
    });
  }

  /**
   * Receitas x Despesas realizadas nos últimos 6 meses (moeda base)
   */
  loadCashFlowChart() {
    const id = 'receitas-despesas-chart';
    if (!appReady()) { this.showEmptyState(id); return; }

    const serie = buildCashflowSeries(5, 0, 'monthly');
    const temDado = serie.some((m) => m.inReal > 0 || m.outReal > 0);
    if (!temDado) { this.showEmptyState(id); return; }

    this.createOrUpdateChart(id, 'bar', {
      labels: serie.map((m) => this.formatMonth(m.month)),
      datasets: [
        {
          label: chartT('charts.ds.income', 'Receitas'),
          data: serie.map((m) => Math.round(m.inReal * 100) / 100),
          backgroundColor: '#52B788',
          barPercentage: 0.7
        },
        {
          label: chartT('charts.ds.expense', 'Despesas'),
          data: serie.map((m) => Math.round(m.outReal * 100) / 100),
          backgroundColor: '#E63946',
          barPercentage: 0.7
        }
      ]
    }, {
      scales: { x: { stacked: false }, y: { stacked: false } },
      plugins: { legend: { display: true, position: 'bottom' } }
    });
  }

  /**
   * Composição dos ativos hoje: contas, investimentos, imóveis e veículos.
   * Dívidas não entram na pizza (não são fatia de um todo positivo).
   */
  loadAssetsChart(points) {
    const id = 'ativos-chart';
    const ultimo = points[points.length - 1];
    if (!ultimo) { this.showEmptyState(id); return; }

    const itens = [
      [chartT('nav.financial', 'Financeiro'), ultimo.financial],
      [chartT('dashboard.investments', 'Investimentos'), ultimo.investments],
      [chartT('nav.properties', 'Imóveis'), ultimo.properties],
      [chartT('nav.vehicles', 'Veículos'), ultimo.vehicles]
    ].filter(([, v]) => v > 0.005);
    if (!itens.length) { this.showEmptyState(id); return; }

    this.createOrUpdateChart(id, 'pie', {
      labels: itens.map(([label]) => label),
      datasets: [{
        label: chartT('charts.ds.value', 'Valor'),
        data: itens.map(([, v]) => Math.round(v * 100) / 100),
        backgroundColor: ['#1abc9c', '#3498db', '#9b59b6', '#e74c3c'],
        borderWidth: 2,
        borderColor: '#FFF'
      }]
    }, {
      plugins: { legend: { display: true, position: 'bottom' } }
    });
  }

  /**
   * Create or update a chart
   */
  createOrUpdateChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    const card = canvas.closest('.chart-card');
    const noDataMsg = card ? card.querySelector('.no-data-message') : null;
    if (noDataMsg) noDataMsg.remove();
    canvas.style.display = 'block';

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(canvas.getContext('2d'), {
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
  }

  /**
   * Show empty state message
   */
  showEmptyState(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
    }
    canvas.style.display = 'none';

    const card = canvas.closest('.chart-card');
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

// Exposto em window: o renderAll() do app.js redesenha os gráficos após cada mudança
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chartsManager = new ChartsManager();
    window.chartsManager.initialize();
  });
} else {
  window.chartsManager = new ChartsManager();
  window.chartsManager.initialize();
}
