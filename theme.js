// Theme Management - Profit C Default (load BEFORE app.js)
(function() {
  const themes = [
    { id: 'profit-c', name: '⭐ Profit C (Padrão)', default: true },
    { id: 'light', name: '☀️ Claro', default: false },
    { id: 'dark', name: '🌙 Escuro', default: false }
  ];

  function initializeTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'profit-c';
    const themeSelect = document.getElementById('themeSelect');

    if (themeSelect && themeSelect.options.length === 0) {
      themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;
        option.selected = theme.id === savedTheme;
        themeSelect.appendChild(option);
      });

      themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        applyTheme(selectedTheme);
        localStorage.setItem('app-theme', selectedTheme);
      });
    }
    applyTheme(savedTheme);
  }

  function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    console.log(`Tema aplicado: ${themeId}`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
  } else {
    initializeTheme();
  }
})();
