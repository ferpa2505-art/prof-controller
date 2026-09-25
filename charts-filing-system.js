/**
 * 📊 CHARTS FILING SYSTEM
 * Sistema de fichário para gráficos - permite visualização em stack
 * com tabs para alternar entre diferentes gráficos
 * 
 * ✅ Cada gráfico ocupa 100% do container (sobrepostos)
 * ✅ Apenas o ativo é visível
 * ✅ Animação suave entre gráficos
 */

function initChartsFiling() {
  const tabs = document.querySelectorAll('.chart-tab');
  const cards = document.querySelectorAll('.chart-card');

  if (!tabs.length || !cards.length) return;

  console.log('📊 Inicializando sistema de fichário com', tabs.length, 'abas e', cards.length, 'gráficos');

  // Garantir que o primeiro gráfico está ativo
  if (cards.length > 0 && !document.querySelector('.chart-card.active')) {
    cards[0].classList.add('active');
    tabs[0].classList.add('active');
  }

  // Event listener para cada aba
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const chartId = this.getAttribute('data-chart');
      console.log('📌 Clicou na aba:', chartId);
      switchChart(chartId, tabs, cards);
    });

    // Keyboard navigation (Tab + Arrow Keys)
    tab.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = index + 1;
        if (nextIndex < tabs.length) {
          tabs[nextIndex].click();
          tabs[nextIndex].focus();
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = index - 1;
        if (prevIndex >= 0) {
          tabs[prevIndex].click();
          tabs[prevIndex].focus();
        }
      }
    });
  });
}

function switchChart(chartId, tabs, cards) {
  // Remove active de todos os tabs
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Remove active de todos os cards
  cards.forEach(card => {
    card.classList.remove('active');
    card.style.opacity = '0';
    card.style.visibility = 'hidden';
  });

  // Adiciona active ao selecionado
  const activeTab = document.querySelector(`[data-chart="${chartId}"]`);
  const activeCard = document.querySelector(`.chart-card[data-chart="${chartId}"]`);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.style.opacity = '1';
    activeCard.style.visibility = 'visible';
  }

  // Redraw dos gráficos Chart.js
  setTimeout(() => {
    if (window.chartInstances && window.chartInstances[chartId]) {
      const chart = window.chartInstances[chartId];
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
        chart.update();
      }
    }
  }, 100);
}

function redrawChartsIfNeeded() {
  if (typeof Chart !== 'undefined' && window.chartInstances) {
    Object.values(window.chartInstances).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initChartsFiling, 100);
});

// Também inicializar quando houver mudança de tema (para compatibilidade)
window.addEventListener('theme-changed', initChartsFiling);
