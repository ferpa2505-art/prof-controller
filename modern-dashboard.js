/**
 * 🎨 MODERN DASHBOARD - ProF Controller v1.0.0
 * Dashboard interativo com gráficos e elementos engajadores
 */

// Ícones SVG modernos
const MODERN_ICONS = {
  chart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
  trending: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 9 12.41l4 4 6.3-6.29L22 12v-6z"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
  growth: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
};

class ModernDashboard {
  constructor() {
    this.dashboardData = this.loadData();
    this.charts = {};
    this.animationFrames = new Set();
    this.init();
  }

  loadData() {
    return {
      accounts: JSON.parse(localStorage.getItem('accounts')) || [],
      positions: JSON.parse(localStorage.getItem('positions')) || [],
      transactions: JSON.parse(localStorage.getItem('transactions')) || [],
      balances: JSON.parse(localStorage.getItem('balances')) || [],
      rates: JSON.parse(localStorage.getItem('rates')) || []
    };
  }

  init() {
    this.createModernDashboard();
    this.addAnimations();
    this.setupInteractivity();
  }

  createModernDashboard() {
    const dashboard = document.getElementById('tab-dashboard');
    if (!dashboard) return;

    // Limpar dashboard anterior
    dashboard.innerHTML = '';

    // Cabeçalho com resumo
    const header = document.createElement('div');
    header.className = 'dashboard-header animate-slide-in-down';
    header.innerHTML = `
      <div class="dashboard-title">
        <h1>Seu Patrimônio</h1>
        <p>Resumo completo do seu portfólio</p>
      </div>
      <div class="dashboard-stats">
        <div class="stat-item">
          <span class="stat-label">Última atualização</span>
          <span class="stat-value">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Período</span>
          <span class="stat-value">Este mês</span>
        </div>
      </div>
    `;
    dashboard.appendChild(header);

    // Seção de Cards Principais
    const cardsSection = document.createElement('section');
    cardsSection.className = 'cards-section animate-slide-in-up';
    cardsSection.innerHTML = this.renderMainCards();
    dashboard.appendChild(cardsSection);

    // Seção de Gráficos
    const chartsSection = document.createElement('section');
    chartsSection.className = 'charts-section animate-slide-in-up';
    chartsSection.style.animationDelay = '0.1s';
    chartsSection.innerHTML = `
      <h2 class="section-title">Análise de Portfólio</h2>
      <div class="charts-grid">
        ${this.renderCharts()}
      </div>
    `;
    dashboard.appendChild(chartsSection);

    // Seção de Atividades Recentes
    const activitiesSection = document.createElement('section');
    activitiesSection.className = 'activities-section animate-slide-in-up';
    activitiesSection.style.animationDelay = '0.2s';
    activitiesSection.innerHTML = `
      <h2 class="section-title">Atividades Recentes</h2>
      ${this.renderRecentActivities()}
    `;
    dashboard.appendChild(activitiesSection);

    // Seção de Metas
    const goalsSection = document.createElement('section');
    goalsSection.className = 'goals-section animate-slide-in-up';
    goalsSection.style.animationDelay = '0.3s';
    goalsSection.innerHTML = `
      <h2 class="section-title">Suas Metas</h2>
      ${this.renderGoals()}
    `;
    dashboard.appendChild(goalsSection);
  }

  renderMainCards() {
    const totalEquity = 5230000; // Placeholder
    const monthlyIncome = 12500;
    const monthlyExpense = 3200;
    const investment = 185000;
    const monthChange = 2.5; // percentual

    return `
      <div class="cards-grid">
        <div class="card-large card-primary">
          <div class="card-header">
            <span class="card-icon">${MODERN_ICONS.wallet}</span>
            <span class="card-label">Patrimônio Total</span>
          </div>
          <div class="card-body">
            <div class="big-number">R$ ${(totalEquity / 1000).toFixed(0)}K</div>
            <div class="card-footer">
              <span class="trend-up">↑ ${monthChange}% este mês</span>
            </div>
          </div>
        </div>

        <div class="card-medium card-success">
          <div class="card-header">
            <span class="card-icon">${MODERN_ICONS.trending}</span>
            <span class="card-label">Receitas</span>
          </div>
          <div class="card-body">
            <div class="number-large">R$ ${monthlyIncome}</div>
            <div class="card-footer">
              <span class="text-muted">Este mês</span>
            </div>
          </div>
        </div>

        <div class="card-medium card-warning">
          <div class="card-header">
            <span class="card-icon">${MODERN_ICONS.alert}</span>
            <span class="card-label">Despesas</span>
          </div>
          <div class="card-body">
            <div class="number-large">R$ ${monthlyExpense}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 35%"></div>
            </div>
          </div>
        </div>

        <div class="card-medium card-info">
          <div class="card-header">
            <span class="card-icon">${MODERN_ICONS.chart}</span>
            <span class="card-label">Investimentos</span>
          </div>
          <div class="card-body">
            <div class="number-large">R$ ${investment}</div>
            <div class="card-footer">
              <span class="text-muted">12 posições ativas</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCharts() {
    return `
      <div class="chart-container">
        <div class="chart-header">
          <h3>Distribuição de Ativos</h3>
          <span class="chart-info">Percentual por tipo</span>
        </div>
        <canvas id="distributionChart" class="chart-canvas"></canvas>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>Fluxo de Caixa</h3>
          <span class="chart-info">Últimos 30 dias</span>
        </div>
        <canvas id="cashFlowChart" class="chart-canvas"></canvas>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>Rentabilidade</h3>
          <span class="chart-info">Retorno acumulado</span>
        </div>
        <canvas id="rentabilityChart" class="chart-canvas"></canvas>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>Alocação Estratégica</h3>
          <span class="chart-info">Por categoria</span>
        </div>
        <div class="allocation-chart">
          <div class="allocation-item">
            <div class="allocation-bar">
              <div class="allocation-fill" style="width: 45%"></div>
            </div>
            <span>Ações - 45%</span>
          </div>
          <div class="allocation-item">
            <div class="allocation-bar">
              <div class="allocation-fill" style="width: 30%"></div>
            </div>
            <span>Fundos - 30%</span>
          </div>
          <div class="allocation-item">
            <div class="allocation-bar">
              <div class="allocation-fill" style="width: 15%"></div>
            </div>
            <span>Renda Fixa - 15%</span>
          </div>
          <div class="allocation-item">
            <div class="allocation-bar">
              <div class="allocation-fill" style="width: 10%"></div>
            </div>
            <span>Caixa - 10%</span>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentActivities() {
    const activities = [
      { type: 'buy', asset: 'PETR4', amount: 1500, date: 'Hoje', icon: MODERN_ICONS.check },
      { type: 'dividend', asset: 'ITUB3', amount: 250, date: 'Ontem', icon: MODERN_ICONS.trending },
      { type: 'sell', asset: 'VALE5', amount: -800, date: '2 dias atrás', icon: MODERN_ICONS.alert }
    ];

    return `
      <div class="activities-list">
        ${activities.map(act => `
          <div class="activity-item">
            <div class="activity-icon ${act.type}">
              ${act.icon}
            </div>
            <div class="activity-info">
              <span class="activity-title">${act.type === 'buy' ? '🟢 Compra' : act.type === 'dividend' ? '💰 Dividendo' : '🔴 Venda'}</span>
              <span class="activity-detail">${act.asset} • R$ ${Math.abs(act.amount)}</span>
            </div>
            <span class="activity-date">${act.date}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderGoals() {
    const goals = [
      { title: 'Atingir R$ 500K', current: 380, target: 500, icon: MODERN_ICONS.target },
      { title: 'Rentabilidade 15%', current: 12.5, target: 15, icon: MODERN_ICONS.growth },
      { title: 'Aplicar R$ 10K/mês', current: 8, target: 10, icon: MODERN_ICONS.calendar }
    ];

    return `
      <div class="goals-grid">
        ${goals.map(goal => `
          <div class="goal-card">
            <div class="goal-icon">${goal.icon}</div>
            <div class="goal-content">
              <h4>${goal.title}</h4>
              <div class="goal-progress">
                <div class="progress-bar-large">
                  <div class="progress-fill" style="width: ${(goal.current / goal.target * 100).toFixed(0)}%"></div>
                </div>
                <span class="goal-percentage">${(goal.current / goal.target * 100).toFixed(0)}%</span>
              </div>
              <div class="goal-stats">
                <span>${goal.current}</span>
                <span>/</span>
                <span>${goal.target}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  addAnimations() {
    // Animar números ao carregar
    const numbers = document.querySelectorAll('.big-number, .number-large');
    numbers.forEach(num => {
      this.animateNumber(num);
    });

    // Animar barras de progresso
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, idx) => {
      setTimeout(() => {
        bar.style.animation = 'progressFill 0.8s ease forwards';
      }, idx * 100);
    });
  }

  animateNumber(element) {
    const text = element.textContent;
    const isNegative = text.includes('-');
    const numMatch = text.match(/[\d.,]+/);
    
    if (!numMatch) return;

    const targetNum = parseFloat(numMatch[0].replace(/\./g, '').replace(',', '.'));
    let currentNum = 0;
    const increment = targetNum / 20;

    const counter = setInterval(() => {
      currentNum += increment;
      if (currentNum >= targetNum) {
        currentNum = targetNum;
        clearInterval(counter);
      }
      element.textContent = text.replace(numMatch[0], currentNum.toLocaleString('pt-BR'));
    }, 30);
  }

  setupInteractivity() {
    // Click em cards para mais detalhes
    document.querySelectorAll('.card-large, .card-medium').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.add('card-active');
        setTimeout(() => card.classList.remove('card-active'), 600);
      });
    });
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ModernDashboard();
  });
} else {
  new ModernDashboard();
}

console.log('✅ Modern Dashboard loaded!');
