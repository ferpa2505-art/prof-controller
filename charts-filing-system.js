/**
 * 📊 CHARTS FILING SYSTEM
 * Sistema de fichário para gráficos - permite visualização em stack
 * com tabs para alternar entre diferentes gráficos
 */

function initChartsFiling() {
  const tabs = document.querySelectorAll('.chart-tab');
  const cards = document.querySelectorAll('.chart-card');

  if (!tabs.length || !cards.length) return;

  // Event listener para cada aba
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const chartId = this.getAttribute('data-chart');
      switchChart(chartId, tabs, cards);
    });

    // Keyboard navigation (Tab + Arrow Keys)
    tab.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextTab = this.nextElementSibling;
        if (nextTab?.classList.contains('chart-tab')) {
          nextTab.click();
          nextTab.focus();
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevTab = this.previousElementSibling;
        if (prevTab?.classList.contains('chart-tab')) {
          prevTab.click();
          prevTab.focus();
        }
      }
    });
  });

  // Reinicializar gráficos quando a aba fica visível
  cards.forEach(card => {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class' && card.classList.contains('active')) {
          // Gráfico ficou visível, redraw
          redrawChartsIfNeeded();
        }
      });
    });
    observer.observe(card, { attributes: true });
  });
}

function switchChart(chartId, tabs, cards) {
  // Remove active de todos
  tabs.forEach(tab => tab.classList.remove('active'));
  cards.forEach(card => card.classList.remove('active'));

  // Adiciona active ao selecionado
  document.querySelector(`[data-chart="${chartId}"]`).classList.add('active');
  document.querySelector(`.chart-card[data-chart="${chartId}"]`).classList.add('active');

  // Redraw dos gráficos Chart.js
  setTimeout(() => {
    redrawChartsIfNeeded();
  }, 50);
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
