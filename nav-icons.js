/* ============================================================
   🧭 NAVIGATION ICONS MODULE - ProF Controller
   Sistema de navegação com ícones e subtítulos
   ============================================================ */

/**
 * Definição de abas com ícones e subtítulos
 * Cada aba tem: id, ícone SVG, chaves i18n para título e subtítulo
 */
const NAV_TABS = [
  {
    id: 'dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3h7v7H3V3z"/><path d="M14 3h7v7h-7V3z"/>
      <path d="M3 14h7v7H3v-7z"/><path d="M14 14h7v7h-7v-7z"/>
    </svg>`,
    titleKey: 'tabs.dashboard',
    subtitleKey: 'dashboard.subtitle'
  },
  {
    id: 'investments',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12h2M9 6h2m-2 12h2m6-10h2"/><polyline points="3 19 3 5 21 5 21 19"/><line x1="3" y1="9" x2="21" y2="9"/>
    </svg>`,
    titleKey: 'tabs.investments',
    subtitleKey: 'dashboard.investments'
  },
  {
    id: 'registry',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/>
    </svg>`,
    titleKey: 'tabs.registry',
    subtitleKey: 'accounts.title'
  },
  {
    id: 'flows',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="21 8 21 21 3 21 3 10"/><path d="M16 5l-5.5-2.5L5 5M16 5h2a2 2 0 0 1 2 2v2"/><path d="M3 11h6v2H3z"/><path d="M15 11h6v2h-6z"/>
    </svg>`,
    titleKey: 'tabs.flows',
    subtitleKey: 'tx.title'
  },
  {
    id: 'news',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16v16H4V4z"/><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/>
    </svg>`,
    titleKey: 'tabs.news',
    subtitleKey: 'help.news'
  }
];

/**
 * Inicializa os ícones nas abas
 * Chama quando o DOM está pronto
 */
function initNavIcons() {
  console.log('[NAV-ICONS] Iniciando initNavIcons()');
  
  const tabsContainer = document.getElementById('mainTabs');
  if (!tabsContainer) {
    console.warn('[NAV-ICONS] mainTabs container não encontrado');
    return;
  }

  console.log('[NAV-ICONS] mainTabs encontrado, removendo abas antigas...');

  // Limpar abas existentes
  const existingTabs = tabsContainer.querySelectorAll('.tab');
  console.log(`[NAV-ICONS] Encontradas ${existingTabs.length} abas para remover`);
  existingTabs.forEach(tab => tab.remove());

  // Criar nova estrutura de abas com ícones
  NAV_TABS.forEach((tabDef, index) => {
    const button = document.createElement('button');
    button.className = 'tab' + (index === 0 ? ' active' : '');
    button.type = 'button';
    button.dataset.group = tabDef.id;
    button.setAttribute('data-i18n', tabDef.titleKey);
    button.title = t(tabDef.titleKey) || tabDef.id;

    // Estrutura: [ícone] [nome]
    button.innerHTML = `
      <span class="tab-icon">${tabDef.icon}</span>
      <span class="tab-label" data-i18n="${tabDef.titleKey}">${t(tabDef.titleKey) || tabDef.id}</span>
    `;

    button.addEventListener('click', (e) => {
      // Remover active de todas as abas
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      // Adicionar active à aba clicada
      button.classList.add('active');
      // Atualizar subtítulos
      updateSubtabs(tabDef);
    });

    tabsContainer.appendChild(button);
  });

  console.log('[NAV-ICONS] Abas com ícones criadas com sucesso');

  // Inicializar subtítulos da aba ativa
  updateSubtabs(NAV_TABS[0]);
}

/**
 * Atualiza os subtítulos quando muda de aba
 * @param {Object} tabDef - Definição da aba
 */
function updateSubtabs(tabDef) {
  const subtabsContainer = document.getElementById('subTabs');
  if (!subtabsContainer) {
    console.warn('subTabs container não encontrado');
    return;
  }

  // Limpar classes anteriores
  subtabsContainer.classList.remove('hidden');

  const title = t(tabDef.titleKey) || tabDef.id;
  const subtitle = t(tabDef.subtitleKey) || '';

  subtabsContainer.innerHTML = `
    <div class="subtabs-content">
      <div>
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
    </div>
  `;
}

/**
 * Atualiza labels dos ícones quando muda de idioma
 * Chamada pelo applyLang()
 */
function updateNavLabels() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    const dataGroup = tab.dataset.group;
    const tabDef = NAV_TABS.find(t => t.id === dataGroup);
    if (tabDef) {
      const label = tab.querySelector('.tab-label');
      if (label) {
        label.textContent = t(tabDef.titleKey) || dataGroup;
      }
      tab.title = t(tabDef.titleKey) || dataGroup;
    }
  });

  // Atualizar subtítulos também
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const dataGroup = activeTab.dataset.group;
    const tabDef = NAV_TABS.find(t => t.id === dataGroup);
    if (tabDef) {
      updateSubtabs(tabDef);
    }
  }
}

/**
 * Atualiza visual dos ícones quando muda o tema
 * Chamada no applyTheme()
 */
function updateNavTheme() {
  const tabsContainer = document.getElementById('mainTabs');
  if (tabsContainer) {
    // CSS automático via data-theme no body
    // Nada precisa fazer aqui, CSS já cuida
  }
}

/**
 * Tratador de clique nas abas
 * Integra com o sistema existente de abas
 */
document.addEventListener('click', function(e) {
  const tab = e.target.closest('.tab');
  if (!tab) return;

  const groupName = tab.dataset.group;
  if (!groupName) return;

  // Disparar evento customizado para compatibilidade
  const event = new CustomEvent('tabChange', {
    detail: { group: groupName }
  });
  document.dispatchEvent(event);
});

/**
 * Função auxiliar para iniciar quando o app estiver pronto
 */
function setupNavigation() {
  // Aguardar que o t() (função de tradução) esteja disponível
  let attempts = 0;
  const interval = setInterval(() => {
    console.log(`[NAV-ICONS] Tentativa ${attempts + 1}: t() = ${typeof t}, state = ${typeof state}`);
    
    if (typeof t === 'function') {
      clearInterval(interval);
      initNavIcons();
      console.log('✅ Navegação com ícones inicializada');
    } else {
      attempts++;
      if (attempts > 100) {
        clearInterval(interval);
        console.warn('⚠️  Função t() não disponível após 10s, navegação pode não estar completa');
      }
    }
  }, 100);
}

// Integração com sistema de idiomas existente
// Quando applyLang() é chamado em app.js, ele chamará updateNavLabels()
const originalApplyLang = window.applyLang || function() {};
window.applyLang = function() {
  console.log('[NAV-ICONS] applyLang() chamado');
  originalApplyLang();
  updateNavLabels();
};

// Integração com sistema de temas
const originalApplyTheme = window.applyTheme || function() {};
window.applyTheme = function() {
  console.log('[NAV-ICONS] applyTheme() chamado');
  originalApplyTheme();
  updateNavTheme();
};

// Função que será chamada por app.js
window.initializeNavIcons = function() {
  console.log('[NAV-ICONS] initializeNavIcons() chamado por app.js');
  initNavIcons();
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  console.log('[NAV-ICONS] DOM ainda carregando, aguardando DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', setupNavigation);
} else {
  console.log('[NAV-ICONS] DOM já carregado, iniciando setupNavigation');
  setupNavigation();
}

console.log('📌 Navigation Icons Module Loaded');
