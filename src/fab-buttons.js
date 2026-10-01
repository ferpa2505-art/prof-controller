/**
 * Menu Suspenso — botão flutuante "+" com atalhos de cadastro
 *
 * - Opcional: Preferências → "Menu Suspenso" (desligado por padrão).
 *   O app.js chama window.fabContainer.setVisible() conforme a preferência e a aba.
 * - Aparece só no Dashboard.
 * - Pode ser arrastado para qualquer lugar; a posição fica salva (em fração da
 *   tela, para servir no celular e no notebook).
 * - Abre para cima quando está na metade de baixo da tela e para baixo quando
 *   está na metade de cima.
 */

const FAB_ITEMS = [
  { id: 'fab-add-investment', key: 'fab.investment', label: 'Investimento', open: () => openPositionModal(),
    icon: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>' },
  { id: 'fab-add-income', key: 'fab.income', label: 'Receita', open: () => openTxModal(null, 'income'),
    icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' },
  { id: 'fab-add-expense', key: 'fab.expense', label: 'Despesa', open: () => openTxModal(null, 'expense'),
    icon: '<path d="M19 13H5v-2h14v2z"/>' },
  { id: 'fab-add-property', key: 'fab.property', label: 'Imóvel', open: () => openAssetModal('property'),
    icon: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>' },
  { id: 'fab-add-vehicle', key: 'fab.vehicle', label: 'Veículo', open: () => openAssetModal('vehicle'),
    icon: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z"/>' }
];

const FAB_DRAG_THRESHOLD = 6; // px: abaixo disso é toque/clique, acima é arraste
const FAB_MARGIN = 8;         // distância mínima da borda da tela

class FABContainer {
  constructor() {
    this.isExpanded = false;
    this.visible = false;
    this.pos = null;            // { x, y } = centro do botão, em fração da tela
  }

  createFAB() {
    const fab = document.createElement('div');
    fab.className = 'fab-container fab-off';
    fab.id = 'fab-container';
    const tr = (k, fb) => (typeof t === 'function' ? t(k) : fb);
    fab.innerHTML = `
      <div class="fab-items" id="fab-items">
        ${FAB_ITEMS.map((it) => `
          <div class="fab-group">
            <button class="fab-button fab-secondary" id="${it.id}" type="button" title="${tr(it.key, it.label)}" data-i18n-title="${it.key}">
              <svg viewBox="0 0 24 24" fill="currentColor">${it.icon}</svg>
            </button>
            <span class="fab-label" data-i18n="${it.key}">${tr(it.key, it.label)}</span>
          </div>`).join('')}
      </div>
      <button class="fab-button fab-primary" id="fab-main" type="button" title="${tr('fab.add', 'Adicionar dados')}" data-i18n-title="fab.add" aria-expanded="false" aria-controls="fab-items">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      </button>`;
    return fab;
  }

  init() {
    if (!document.getElementById('fab-container')) document.body.appendChild(this.createFAB());
    this.el = document.getElementById('fab-container');
    this.mainBtn = document.getElementById('fab-main');

    // Cada atalho abre o formulário do próprio app.js, que grava no IndexedDB
    // (criptografado quando a senha está ativa) e atualiza todas as telas.
    FAB_ITEMS.forEach((it) => {
      document.getElementById(it.id).addEventListener('click', () => { this.closeFAB(); it.open(); });
    });

    this.setupDrag();

    document.addEventListener('click', (e) => {
      if (this.isExpanded && !this.el.contains(e.target)) this.closeFAB();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeFAB(); });
    window.addEventListener('resize', () => this.applyPosition());
  }

  /* ----- Arrastar (mouse e toque) ----- */
  setupDrag() {
    let start = null;
    let dragging = false;

    this.mainBtn.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const r = this.mainBtn.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2) };
      dragging = false;
      this.mainBtn.setPointerCapture(e.pointerId);
    });

    this.mainBtn.addEventListener('pointermove', (e) => {
      if (!start) return;
      if (!dragging && Math.hypot(e.clientX - start.x, e.clientY - start.y) < FAB_DRAG_THRESHOLD) return;
      if (!dragging) { dragging = true; this.closeFAB(); this.el.classList.add('fab-dragging'); }
      this.pos = {
        x: (e.clientX - start.dx) / window.innerWidth,
        y: (e.clientY - start.dy) / window.innerHeight
      };
      this.applyPosition();
    });

    const fim = (e) => {
      if (!start) return;
      try { this.mainBtn.releasePointerCapture(e.pointerId); } catch (err) { /* já liberado */ }
      start = null;
      if (dragging) {
        this.el.classList.remove('fab-dragging');
        this.savePosition();
      } else if (e.type === 'pointerup') {
        this.toggleFAB();
      }
      // O clique que vem depois do pointerup não deve abrir/fechar de novo
      this.ignoreClick = true;
      setTimeout(() => { this.ignoreClick = false; }, 0);
    };
    this.mainBtn.addEventListener('pointerup', fim);
    this.mainBtn.addEventListener('pointercancel', fim);
    // Teclado (Enter/Espaço) gera só "click", sem pointer: abre normalmente
    this.mainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.ignoreClick) return;
      this.toggleFAB();
    });
  }

  /* Posiciona pelo centro do botão principal, sem deixar sair da tela */
  applyPosition() {
    if (!this.el) return;
    if (!this.pos) {
      this.el.style.left = this.el.style.top = '';
      this.el.classList.remove('fab-custom');
      this.updateDirection();
      return;
    }
    const w = window.innerWidth, h = window.innerHeight;
    const b = this.mainBtn.getBoundingClientRect();
    const half = (b.width || 56) / 2;
    const cx = Math.min(Math.max(this.pos.x * w, half + FAB_MARGIN), w - half - FAB_MARGIN);
    const cy = Math.min(Math.max(this.pos.y * h, half + FAB_MARGIN), h - half - FAB_MARGIN);
    this.el.classList.add('fab-custom');
    this.el.style.left = cx + 'px';
    this.el.style.top = cy + 'px';
    this.updateDirection();
  }

  /* Metade de cima da tela → abre para baixo; metade de baixo → para cima.
     Perto das bordas laterais, os rótulos ficam do lado de dentro. */
  updateDirection() {
    const b = this.mainBtn.getBoundingClientRect();
    const cy = b.top + b.height / 2;
    const cx = b.left + b.width / 2;
    this.el.classList.toggle('fab-open-down', cy < window.innerHeight / 2);
    this.el.classList.toggle('fab-edge-left', cx < 90);
    this.el.classList.toggle('fab-edge-right', cx > window.innerWidth - 90);
  }

  async savePosition() {
    if (typeof state === 'undefined' || typeof put !== 'function') return;
    state.settings.fabPos = this.pos;
    try { await put('settings', { key: 'fabPos', value: this.pos }); } catch (e) { console.warn('Menu Suspenso:', e); }
  }

  /* Chamado pelo app.js: preferência ligada + aba Dashboard */
  setVisible(mostrar) {
    if (!this.el) return;
    if (typeof state !== 'undefined' && state.settings && state.settings.fabPos !== undefined) {
      this.pos = state.settings.fabPos || null;
    }
    this.visible = !!mostrar;
    if (!this.visible) this.closeFAB();
    this.el.classList.toggle('fab-off', !this.visible);
    if (this.visible) this.applyPosition();
  }

  toggleFAB() {
    if (this.isExpanded) this.closeFAB(); else this.openFAB();
  }

  openFAB() {
    this.updateDirection();
    this.isExpanded = true;
    this.el.classList.add('fab-expanded');
    this.mainBtn.setAttribute('aria-expanded', 'true');
  }

  closeFAB() {
    if (!this.el) return;
    this.isExpanded = false;
    this.el.classList.remove('fab-expanded');
    this.mainBtn.setAttribute('aria-expanded', 'false');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.fabContainer = new FABContainer();
    window.fabContainer.init();
  });
} else {
  window.fabContainer = new FABContainer();
  window.fabContainer.init();
}
