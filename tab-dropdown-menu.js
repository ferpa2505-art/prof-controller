/**
 * 🎯 TAB DROPDOWN MENU SYSTEM
 * Sistema de dropdown para tabs com submenus
 */

function initTabDropdowns() {
  const tabsWithDropdowns = [
    {
      selector: '[data-group="investments"]',
      label: 'Investimentos',
      items: [
        { label: 'Investimentos', key: 'tabs.investments', action: () => switchTab('investments') },
        { label: 'Calculadora', key: 'tabs.calculator', action: () => switchTab('calculator') },
        { label: 'Impostos', key: 'tabs.taxes', action: () => switchTab('taxes') }
      ]
    }
  ];

  tabsWithDropdowns.forEach(config => {
    const button = document.querySelector(config.selector);
    if (!button) return;

    // Criar wrapper para dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'tab-with-dropdown';
    button.parentNode.insertBefore(wrapper, button);
    wrapper.appendChild(button);

    // Adicionar classe ao botão
    button.classList.add('tab-dropdown-trigger');

    // Criar dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'tab-dropdown';
    
    config.items.forEach(item => {
      const itemBtn = document.createElement('button');
      itemBtn.textContent = item.label;
      // applyLang() traduz todo elemento com data-i18n
      if (item.key) {
        itemBtn.dataset.i18n = item.key;
        if (typeof t === 'function') itemBtn.textContent = t(item.key);
      }
      itemBtn.className = 'tab-dropdown-item';
      itemBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action();
        dropdown.classList.remove('visible');
      });
      dropdown.appendChild(itemBtn);
    });

    wrapper.appendChild(dropdown);

    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('visible');
      
      // Fechar outros dropdowns
      document.querySelectorAll('.tab-dropdown.visible').forEach(d => {
        if (d !== dropdown) d.classList.remove('visible');
      });
    });
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', () => {
    document.querySelectorAll('.tab-dropdown.visible').forEach(d => {
      d.classList.remove('visible');
    });
  });
}

function switchTab(tabName) {
  console.log('Switching to tab:', tabName);
  // Implementação do switch de abas
  // Isso será conectado ao sistema de tabs existente
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabDropdowns);
} else {
  initTabDropdowns();
}
