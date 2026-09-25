/* ============================================================
   💱 FOREX WIDGET - Real-time currency rates
   ============================================================ */

// Default forex pairs: BRL x USD, BRL x EUR, USD x EUR, CHF
const DEFAULT_FOREX_PAIRS = [
  { from: 'USD', to: 'BRL', label: 'USD/BRL' },
  { from: 'EUR', to: 'BRL', label: 'EUR/BRL' },
  { from: 'USD', to: 'EUR', label: 'USD/EUR' },
  { from: 'CHF', to: 'BRL', label: 'CHF/BRL' }
];

// Fetch current exchange rates from free API
async function fetchForexRates(pairs) {
  const results = {};
  
  try {
    // Usando exchangerate-api.com (free tier: 1500 requests/mês)
    for (const pair of pairs) {
      try {
        const url = `https://api.exchangerate-api.com/v4/latest/${pair.from}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const rate = data.rates[pair.to];
        
        if (rate) {
          results[pair.label] = {
            from: pair.from,
            to: pair.to,
            rate: Number(rate).toFixed(2),
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            pair: pair.label
          };
        }
      } catch (e) {
        console.warn(`Failed to fetch ${pair.label}:`, e);
        results[pair.label] = {
          from: pair.from,
          to: pair.to,
          rate: '—',
          error: true,
          pair: pair.label
        };
      }
    }
    return results;
  } catch (e) {
    console.error('Forex fetch error:', e);
    return null;
  }
}

// Render forex widget
function renderForexWidget() {
  const container = document.getElementById('forexContainer');
  if (!container) return;
  
  const pairs = DEFAULT_FOREX_PAIRS;
  
  // Show loading state
  container.innerHTML = `
    <div class="forex-widget">
      <div class="forex-header">
        <h3>${t('forex.title') || 'Cotações'}</h3>
        <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="Atualizar cotações">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
      <div class="forex-loading">Carregando cotações...</div>
    </div>
  `;
  
  // Fetch and render rates
  fetchForexRates(pairs).then(rates => {
    if (!rates) {
      container.innerHTML = `
        <div class="forex-widget">
          <div class="forex-error">Erro ao carregar cotações</div>
        </div>
      `;
      return;
    }
    
    const ratesHtml = pairs.map(pair => {
      const rate = rates[pair.label];
      if (!rate) return '';
      
      return `
        <div class="forex-pair ${rate.error ? 'error' : ''}">
          <div class="forex-pair-label">${pair.label}</div>
          <div class="forex-pair-rate">
            <span class="rate-value">${rate.rate}</span>
            <span class="rate-unit">${pair.to}</span>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = `
      <div class="forex-widget">
        <div class="forex-header">
          <h3>${t('forex.title') || 'Cotações'}</h3>
          <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="Atualizar cotações" title="Atualizar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>
        <div class="forex-grid">
          ${ratesHtml}
        </div>
        <div class="forex-timestamp">
          Atualizado em ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
    `;
    
    // Add refresh button listener
    const btn = document.getElementById('forexRefreshBtn');
    if (btn) {
      btn.addEventListener('click', refreshForexRates);
    }
  });
}

// Refresh rates on button click
function refreshForexRates() {
  const btn = document.getElementById('forexRefreshBtn');
  if (btn) {
    btn.classList.add('rotating');
    btn.disabled = true;
  }
  
  renderForexWidget();
  
  setTimeout(() => {
    if (btn) {
      btn.classList.remove('rotating');
      btn.disabled = false;
    }
  }, 500);
}

// Initialize on page load
function initForexWidget() {
  // Only render if we're on dashboard
  if (document.getElementById('forexContainer')) {
    renderForexWidget();
  }
}
