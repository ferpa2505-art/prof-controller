/**
 * Floating Action Buttons (FAB)
 * UI para acessar formulários de cadastro
 */

class FABContainer {
  constructor() {
    this.isExpanded = false;
  }

  /**
   * Criar HTML dos botões flutuantes
   */
  createFAB() {
    const fab = document.createElement('div');
    fab.className = 'fab-container';
    fab.id = 'fab-container';
    fab.innerHTML = `
      <!-- Investimentos -->
      <div class="fab-group hidden" id="fab-investments">
        <button class="fab-button fab-secondary" id="fab-add-investment" title="Adicionar Investimento">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <span class="fab-label">Investimento</span>
      </div>

      <!-- Receitas -->
      <div class="fab-group hidden" id="fab-income">
        <button class="fab-button fab-secondary" id="fab-add-income" title="Adicionar Receita">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
        <span class="fab-label">Receita</span>
      </div>

      <!-- Despesas -->
      <div class="fab-group hidden" id="fab-expenses">
        <button class="fab-button fab-secondary" id="fab-add-expense" title="Adicionar Despesa">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <span class="fab-label">Despesa</span>
      </div>

      <!-- Imóveis -->
      <div class="fab-group hidden" id="fab-properties">
        <button class="fab-button fab-secondary" id="fab-add-property" title="Adicionar Imóvel">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        <span class="fab-label">Imóvel</span>
      </div>

      <!-- Veículos -->
      <div class="fab-group hidden" id="fab-vehicles">
        <button class="fab-button fab-secondary" id="fab-add-vehicle" title="Adicionar Veículo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </button>
        <span class="fab-label">Veículo</span>
      </div>

      <!-- Main button -->
      <button class="fab-button fab-primary" id="fab-main" title="Adicionar dados">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      </button>
    `;
    return fab;
  }

  /**
   * Inicializar FAB
   */
  init() {
    // Criar e adicionar FAB ao DOM
    if (!document.getElementById('fab-container')) {
      const fab = this.createFAB();
      document.body.appendChild(fab);
    }

    this.mainBtn = document.getElementById('fab-main');
    this.investmentBtn = document.getElementById('fab-add-investment');
    this.incomeBtn = document.getElementById('fab-add-income');
    this.expenseBtn = document.getElementById('fab-add-expense');
    this.propertyBtn = document.getElementById('fab-add-property');
    this.vehicleBtn = document.getElementById('fab-add-vehicle');

    // Event listeners
    this.mainBtn.addEventListener('click', () => this.toggleFAB());
    
    this.investmentBtn.addEventListener('click', () => {
      this.closeFAB();
      if (window.investmentForm) {
        window.investmentForm.open();
      }
    });

    this.incomeBtn.addEventListener('click', () => {
      this.closeFAB();
      if (window.incomeForm) {
        window.incomeForm.open();
      }
    });

    this.expenseBtn.addEventListener('click', () => {
      this.closeFAB();
      if (window.expenseForm) {
        window.expenseForm.open();
      }
    });

    this.propertyBtn.addEventListener('click', () => {
      this.closeFAB();
      if (window.propertyForm) {
        window.propertyForm.open();
      }
    });

    this.vehicleBtn.addEventListener('click', () => {
      this.closeFAB();
      if (window.vehicleForm) {
        window.vehicleForm.open();
      }
    });

    // Fechar FAB quando clicar fora
    document.addEventListener('click', (e) => {
      const fab = document.getElementById('fab-container');
      if (fab && !fab.contains(e.target) && this.isExpanded) {
        this.closeFAB();
      }
    });

    console.log('✅ FAB Container initialized');
  }

  /**
   * Toggle FAB expansion
   */
  toggleFAB() {
    if (this.isExpanded) {
      this.closeFAB();
    } else {
      this.openFAB();
    }
  }

  /**
   * Open FAB
   */
  openFAB() {
    this.isExpanded = true;
    this.mainBtn.style.transform = 'rotate(45deg)';
    
    const groups = ['fab-investments', 'fab-income', 'fab-expenses', 'fab-properties', 'fab-vehicles'];
    groups.forEach(id => {
      const group = document.getElementById(id);
      if (group) {
        group.classList.remove('hidden');
      }
    });
  }

  /**
   * Close FAB
   */
  closeFAB() {
    this.isExpanded = false;
    this.mainBtn.style.transform = 'rotate(0deg)';
    
    const groups = ['fab-investments', 'fab-income', 'fab-expenses', 'fab-properties', 'fab-vehicles'];
    groups.forEach(id => {
      const group = document.getElementById(id);
      if (group) {
        group.classList.add('hidden');
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.fabContainer = new FABContainer();
    window.fabContainer.init();
  });
} else {
  window.fabContainer = new FABContainer();
  window.fabContainer.init();
}
