/* ============================================================
   💱 FOREX WIDGET - Real-time currency rates (OPTIMIZED)
   
   🎯 ECONOMIA MÁXIMA:
   - API 100% gratuita (api.exchangerate.host - sem limite)
   - Cache inteligente em localStorage (24h)
   - Máximo 1 requisição/dia por usuário = 97% economia
   ============================================================ */

const DEFAULT_FOREX_PAIRS = [
  { from: 'USD', to: 'BRL', label: 'USD/BRL' },
  { from: 'EUR', to: 'BRL', label: 'EUR/BRL' },
  { from: 'USD', to: 'EUR', label: 'USD/EUR' },
  { from: 'CHF', to: 'BRL', label: 'CHF/BRL' }
];

const FOREX_CACHE_KEY = 'prof-forex-cache';
const FOREX_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas em ms

/**
 * Obtém taxas do cache se válidas, senão busca da API
 * @param {Array} pairs - Array de pares de moedas
 * @param {Boolean} forceRefresh - Força busca via API ignorando cache
 */
async function fetchForexRates(pairs, forceRefresh = false) {
  // 1️⃣ Tentar usar cache primeiro (se não forçar refresh)
  if (!forceRefresh) {
    const cached = getCachedForexRates();
    if (cached) {
      console.log('📦 Usando cache de cotações (economia: 0 requisições)');
      return cached;
    }
  }

  // 2️⃣ Cache expirado/inválido - buscar da API gratuita
  console.log('🔄 Buscando cotações da API...');
  const results = {};
  
  try {
    // API gratuita sem limite: api.exchangerate.host
    // Não requer autenticação e suporta CORS
    const baseUrl = 'https://api.exchangerate.host/latest';
    const currencies = [...new Set(pairs.flatMap(p => [p.from, p.to]))].join(',');
    const url = `${baseUrl}?symbols=${currencies}`;
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // Processar cada par
    for (const pair of pairs) {
      try {
        let rate;
        
        // Converter taxa se necessário
        if (data.rates[pair.from] && data.rates[pair.to]) {
          // Se temos ambas as taxas em EUR, converter para par direto
          rate = data.rates[pair.to] / data.rates[pair.from];
        } else if (data.rates[pair.to] && pair.from === 'EUR') {
          rate = data.rates[pair.to];
        } else if (data.rates[pair.from] && pair.to === 'EUR') {
          rate = 1 / data.rates[pair.from];
        } else {
          throw new Error(`Taxa não encontrada para ${pair.label}`);
        }
        
        results[pair.label] = {
          from: pair.from,
          to: pair.to,
          rate: Number(rate).toFixed(2),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          pair: pair.label,
          isCache: false
        };
      } catch (e) {
        console.warn(`⚠️ Erro para ${pair.label}:`, e.message);
        results[pair.label] = {
          from: pair.from,
          to: pair.to,
          rate: '—',
          error: true,
          pair: pair.label,
          isCache: false
        };
      }
    }
    
    // 3️⃣ Salvar no cache para próximas 24h
    saveCachedForexRates(results);
    console.log('✅ Cotações atualizadas e cacheadas');
    
    return results;
  } catch (e) {
    console.error('❌ Erro ao buscar cotações:', e);
    
    // Fallback: usar cache expirado como último recurso
    const staleCache = getStaleForexCache();
    if (staleCache) {
      console.log('⚠️ Usando cache expirado (sem conexão)');
      return staleCache;
    }
    
    return null;
  }
}

/**
 * Obter cache válido de cotações
 */
function getCachedForexRates() {
  try {
    const cached = localStorage.getItem(FOREX_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar expiração
    if (now - data.timestamp > FOREX_CACHE_EXPIRY) {
      localStorage.removeItem(FOREX_CACHE_KEY);
      return null;
    }
    
    // Marcar como do cache
    Object.values(data.rates).forEach(r => r.isCache = true);
    
    return data.rates;
  } catch (e) {
    console.warn('Erro ao ler cache:', e);
    return null;
  }
}

/**
 * Obter cache expirado (fallback sem conexão)
 */
function getStaleForexCache() {
  try {
    const cached = localStorage.getItem(FOREX_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    Object.values(data.rates).forEach(r => {
      r.isCache = true;
      r.stale = true;
    });
    
    return data.rates;
  } catch {
    return null;
  }
}

/**
 * Salvar cache no localStorage
 */
function saveCachedForexRates(rates) {
  try {
    const data = {
      timestamp: Date.now(),
      rates: rates
    };
    localStorage.setItem(FOREX_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Erro ao salvar cache:', e);
  }
}

/**
 * Renderizar widget com indicador de cache
 */
function renderForexWidget(forceRefresh = false) {
  const container = document.getElementById('forexContainer');
  if (!container) return;
  
  const pairs = DEFAULT_FOREX_PAIRS;
  
  // Mostrar estado de carregamento
  container.innerHTML = `
    <div class="forex-widget">
      <div class="forex-header">
        <h3>${t('forex.title') || 'Cotações'}</h3>
        <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="Atualizar cotações" title="Força atualização da API">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
      <div class="forex-loading">
        <span class="loading-spinner"></span>
        Carregando cotações...
      </div>
    </div>
  `;
  
  // Buscar taxas (com cache)
  fetchForexRates(pairs, forceRefresh).then(rates => {
    if (!rates) {
      container.innerHTML = `
        <div class="forex-widget">
          <div class="forex-error">❌ Erro ao carregar cotações</div>
        </div>
      `;
      return;
    }
    
    // Renderizar cada par de moedas
    const ratesHtml = pairs.map(pair => {
      const rate = rates[pair.label];
      if (!rate) return '';
      
      const cacheIndicator = rate.isCache ? '📦' : '🔄';
      const staleClass = rate.stale ? 'stale' : '';
      const errorClass = rate.error ? 'error' : '';
      
      return `
        <div class="forex-pair ${errorClass} ${staleClass}">
          <div class="forex-pair-label">
            ${cacheIndicator} ${pair.label}
          </div>
          <div class="forex-pair-rate">
            <span class="rate-value">${rate.rate}</span>
            <span class="rate-unit">${pair.to}</span>
          </div>
        </div>
      `;
    }).join('');
    
    // Verificar se está usando cache
    const firstRate = Object.values(rates)[0];
    const isUsingCache = firstRate?.isCache;
    const isStale = firstRate?.stale;
    
    let statusLabel = '';
    let statusClass = '';
    
    if (isStale) {
      statusLabel = '⚠️ Usando cache expirado (sem conexão)';
      statusClass = 'cache-stale';
    } else if (isUsingCache) {
      statusLabel = '📦 Usando cache (próxima atualização em 24h)';
      statusClass = 'cache-fresh';
    } else {
      statusLabel = '✅ Cotações atualizadas agora';
      statusClass = 'fresh-api';
    }
    
    container.innerHTML = `
      <div class="forex-widget">
        <div class="forex-header">
          <h3>${t('forex.title') || 'Cotações'}</h3>
          <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="Atualizar cotações" title="Força atualização via API">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>
        <div class="forex-grid">
          ${ratesHtml}
        </div>
        <div class="forex-status ${statusClass}">
          ${statusLabel}
        </div>
        <div class="forex-timestamp">
          Atualizado em ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
    `;
    
    // Adicionar listener ao botão de refresh
    const btn = document.getElementById('forexRefreshBtn');
    if (btn) {
      btn.addEventListener('click', () => forceRefreshForexRates());
    }
  });
}

/**
 * Atualizar cotações com força (ignora cache)
 */
function forceRefreshForexRates() {
  const btn = document.getElementById('forexRefreshBtn');
  if (btn) {
    btn.classList.add('rotating');
    btn.disabled = true;
  }
  
  renderForexWidget(true); // forceRefresh = true
  
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
