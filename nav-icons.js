/* ============================================================
   🧭 NAVIGATION ICONS MODULE - ProF Controller
   Utilitários para navegação com ícones (CSS-only)
   O gerenciamento de abas continua com app.js
   ============================================================ */

/**
 * Atualiza labels dos ícones quando muda de idioma
 * Chamada pelo applyLang()
 */
function updateNavLabels() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    const label = tab.querySelector('.tab-label');
    if (label && label.dataset.i18n) {
      label.textContent = t(label.dataset.i18n);
    }
  });
}

/**
 * Integração com sistema de idiomas existente
 * Quando applyLang() é chamado em app.js, ele chamará updateNavLabels()
 */
const originalApplyLang = window.applyLang || function() {};
window.applyLang = function() {
  originalApplyLang();
  updateNavLabels();
};

console.log('📌 Navigation Icons Module Loaded');
