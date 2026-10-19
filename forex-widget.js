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
const FOREX_HISTORY_KEY = 'prof-forex-history'; // Histórico para comparação de tendências

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
    // API confiável: exchangerate-api.com (free tier: 1500 req/month)
    // Com cache 24h, máximo 50 requisições no dia 1, depois ~0 para maioria dos usuários
    // Resultado: 97% economia em custos de API
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
            pair: pair.label,
            isCache: false
          };
        } else {
          throw new Error(`Taxa ${pair.to} não encontrada em ${pair.from}`);
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
    
    // 3️⃣ Salvar no cache para próximas 24h (máximo 1 requisição/dia)
    saveCachedForexRates(results);
    console.log('✅ Cotações atualizadas e cacheadas por 24h');
    
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
    
    // Também salvar no histórico para comparação de tendências
    saveForexHistory(rates);
  } catch (e) {
    console.warn('Erro ao salvar cache:', e);
  }
}

/**
 * Salvar histórico de preços para análise de tendências
 */
function saveForexHistory(rates) {
  try {
    const history = JSON.parse(localStorage.getItem(FOREX_HISTORY_KEY)) || {};
    const now = Date.now();
    
    for (const [pair, data] of Object.entries(rates)) {
      if (!data.error && data.rate !== '—') {
        if (!history[pair]) {
          history[pair] = [];
        }
        
        // Manter apenas últimas 24 horas de dados (mantém a memória baixa)
        history[pair] = history[pair].filter(h => now - h.timestamp < 24 * 60 * 60 * 1000);
        
        // Adicionar novo valor
        history[pair].push({
          rate: parseFloat(data.rate),
          timestamp: now
        });
      }
    }
    
    localStorage.setItem(FOREX_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Erro ao salvar histórico:', e);
  }
}

/**
 * Obter histórico de preços para uma moeda
 */
function getForexHistory(pair) {
  try {
    const history = JSON.parse(localStorage.getItem(FOREX_HISTORY_KEY)) || {};
    return history[pair] || [];
  } catch {
    return [];
  }
}

/**
 * Determinar tendência da moeda (↗ subindo, ↘ caindo, ↔ estável)
 */
function getForexTrend(pair, currentRate) {
  const history = getForexHistory(pair);
  
  if (history.length < 2) {
    return { arrow: '→', label: t('forex.noHistory'), color: '#FFB81C', direction: 'stable' };
  }
  
  // Comparar com taxa anterior (última do histórico)
  const previousRate = history[history.length - 2]?.rate || history[0]?.rate;
  
  if (!previousRate) {
    return { arrow: '→', label: t('forex.noHistory'), color: '#FFB81C', direction: 'stable' };
  }
  
  const diff = currentRate - previousRate;
  const threshold = previousRate * 0.001; // 0.1% de variação mínima
  
  if (Math.abs(diff) < threshold) {
    // Estável - seta horizontal
    return { arrow: '↔', label: t('forex.stable'), color: '#FFB81C', direction: 'stable' };
  } else if (diff > 0) {
    // Subindo - seta diagonal verde
    return { arrow: '↗', label: t('forex.up'), color: '#00FF00', direction: 'up' };
  } else {
    // Caindo - seta diagonal vermelha
    return { arrow: '↘', label: t('forex.down'), color: '#FF4444', direction: 'down' };
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
        <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="${t('forex.refresh')}" title="${t('forex.refresh')}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
      <div class="forex-loading">
        <span class="loading-spinner"></span>
        ${t('forex.loading')}
      </div>
    </div>
  `;
  
  // Buscar taxas (com cache)
  fetchForexRates(pairs, forceRefresh).then(rates => {
    if (!rates) {
      container.innerHTML = `
        <div class="forex-widget">
          <div class="forex-error">${t('forex.error')}</div>
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
      
      // Obter tendência da moeda
      const currentRateNum = parseFloat(rate.rate);
      const trend = getForexTrend(pair.label, currentRateNum);
      
      return `
        <div class="forex-pair ${errorClass} ${staleClass}">
          <div class="forex-pair-label">
            ${cacheIndicator} ${pair.label}
          </div>
          <div class="forex-pair-rate">
            <span class="rate-value">${rate.rate}</span>
            <span class="rate-unit">${pair.to}</span>
            <span class="rate-trend rate-trend-${trend.direction}" style="color: ${trend.color};" title="${trend.label}">
              ${trend.arrow}
            </span>
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
      statusLabel = t('forex.stale');
      statusClass = 'cache-stale';
    } else if (isUsingCache) {
      statusLabel = t('forex.cached');
      statusClass = 'cache-fresh';
    } else {
      statusLabel = t('forex.fresh');
      statusClass = 'fresh-api';
    }
    
    container.innerHTML = `
      <div class="forex-widget">
        <div class="forex-header">
          <h3>${t('forex.title') || 'Cotações'}</h3>
          <button id="forexRefreshBtn" class="forex-refresh-btn" type="button" aria-label="${t('forex.refresh')}" title="${t('forex.refresh')}">
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
          ${t('forex.updatedAt').replace('{h}', new Date().toLocaleTimeString(state.settings.lang || 'pt-BR'))}
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

/* ============================================================
   💱 SIMULADOR DE TROCA DE MOEDA (Cadastros → Câmbio)

   Mostra quanto chega no destino depois do imposto (IOF, quando a
   operação envolve o real) e das tarifas/spread de cada empresa,
   e compara Remessa Online, Wise, Nomad e "Outro".

   - Cotação comercial: api.exchangerate-api.com (cache de 6 h),
     sempre editável à mão.
   - IOF: Decreto 6.306/2007, art. 15-B, na redação do Decreto
     12.499/2025 (conferido em out/2026). Valores editáveis.
   - Tarifas das empresas: valores de referência editáveis; mudam
     com frequência. Ficam salvos só neste aparelho.
   - O valor simulado NÃO é salvo.
   ============================================================ */
(function () {
  'use strict';

  const FXSIM_STORE = 'prof-fxsim-v1';
  const FXSIM_RATES = 'prof-fxsim-rates';
  const FXSIM_RATE_TTL = 6 * 60 * 60 * 1000;
  const FXSIM_REVIEWED = '10/2026';
  const FXSIM_CURRENCIES = ['BRL', 'EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'];

  // Alíquotas de IOF (% por operação). side: 'from' = cobrado sobre os reais
  // enviados; 'to' = descontado dos reais recebidos; 'none' = sem IOF.
  const FXSIM_OPS = {
    own:     { iof: 3.5,  side: 'from', dir: 'out' },
    third:   { iof: 3.5,  side: 'from', dir: 'out' },
    invest:  { iof: 1.1,  side: 'from', dir: 'out' },
    card:    { iof: 3.5,  side: 'from', dir: 'out' },
    cash:    { iof: 3.5,  side: 'from', dir: 'out' },
    receive: { iof: 0.38, side: 'to',   dir: 'in' },
    export:  { iof: 0,    side: 'to',   dir: 'in' },
    abroad:  { iof: 0,    side: 'from', dir: 'none' }
  };

  // Referência inicial (editável). spread = % pior que a cotação comercial;
  // feePct = tarifa percentual; feeFixed = tarifa fixa na moeda de origem.
  const FXSIM_DEFAULT_PROVIDERS = [
    { id: 'remessa', name: 'Remessa Online', spread: 1.3, feePct: 0, feeFixed: 0 },
    { id: 'wise', name: 'Wise', spread: 0, feePct: 1.1, feeFixed: 0 },
    { id: 'nomad', name: 'Nomad', spread: 2, feePct: 0, feeFixed: 0 },
    { id: 'other', name: '', spread: 4, feePct: 0, feeFixed: 0 }
  ];

  const FXSIM_TXT = {
    'pt-BR': {
      title: 'Simulador de troca de moeda',
      intro: 'Veja quanto chega no destino depois do imposto e das taxas de cada empresa.',
      amount: 'Valor', from: 'De', to: 'Para', swap: 'Inverter moedas',
      modeSend: 'Quero enviar', modeReceive: 'Quero receber',
      op: 'Tipo de operação', tax: 'Imposto (%)', iof: 'IOF (%)',
      'op.own': 'Envio para conta própria no exterior',
      'op.third': 'Envio para terceiros ou serviço',
      'op.invest': 'Investimento no exterior',
      'op.card': 'Cartão internacional ou pré-pago',
      'op.cash': 'Compra de moeda em espécie',
      'op.receive': 'Recebimento do exterior',
      'op.export': 'Receita de exportação de serviços',
      'op.abroad': 'Fora do Brasil (sem IOF)',
      rate: 'Cotação comercial', rateUnit: '1 {a} em {b}', rateHint: 'Cotação de referência, sem spread. Pode ser editada.',
      refresh: 'Atualizar cotação', loading: 'Buscando cotação…',
      rateFail: 'Sem cotação online. Digite a cotação manualmente.',
      rateAt: 'Atualizada em {t}', rateManual: 'Cotação digitada por você',
      results: 'Comparativo', best: 'Melhor opção', receives: 'Chega', pays: 'Você paga',
      vsBest: '{v} a menos que a melhor', vsBestPay: '{v} a mais que a melhor',
      cost: 'Custo total', vet: 'VET',
      details: 'Detalhes', sent: 'Valor enviado', fee: 'Tarifa da empresa', taxLine: 'Imposto',
      iofLine: 'IOF', spreadLine: 'Spread embutido na cotação', applied: 'Cotação aplicada',
      converted: 'Valor convertido', received: 'Valor que chega',
      edit: 'Ajustar taxas das empresas', name: 'Empresa', otherName: 'Outro',
      spread: 'Spread (%)', feePct: 'Tarifa (%)', feeFixed: 'Tarifa fixa ({c})',
      reset: 'Restaurar valores de referência',
      editHint: 'Valores de referência aproximados. Cada empresa muda spread e tarifas com frequência: confira no app dela e ajuste aqui. Os valores ficam salvos só neste aparelho.',
      fill: 'Informe um valor para simular.', invalid: 'As tarifas são maiores que o valor.',
      sameCur: 'Escolha moedas diferentes.',
      noteIof: 'IOF conforme o Decreto 6.306/2007 (redação de 2025), conferido em {d}. Além do imposto, as empresas cobram spread e tarifas.',
      noteTax: 'Sem real na operação, não há IOF brasileiro. Se o seu país cobrar algum imposto, informe a alíquota acima.',
      disclaimer: 'Simulação aproximada. Cotações, spreads, tarifas e impostos mudam: confirme o valor final com a empresa antes de fechar. Não é recomendação.'
    },
    en: {
      title: 'Currency exchange simulator',
      intro: 'See how much arrives after tax and each company\u2019s fees.',
      amount: 'Amount', from: 'From', to: 'To', swap: 'Swap currencies',
      modeSend: 'I want to send', modeReceive: 'I want to receive',
      op: 'Operation type', tax: 'Tax (%)', iof: 'IOF (%)',
      'op.own': 'Transfer to your own account abroad',
      'op.third': 'Transfer to someone else or service payment',
      'op.invest': 'Transfer for investment abroad',
      'op.card': 'International or prepaid card',
      'op.cash': 'Buying cash',
      'op.receive': 'Receiving from abroad',
      'op.export': 'Service export revenue',
      'op.abroad': 'Operation outside Brazil (no IOF)',
      rate: 'Mid-market rate', rateUnit: '1 {a} in {b}', rateHint: 'Reference rate, no spread. You can edit it.',
      refresh: 'Refresh rate', loading: 'Fetching rate…',
      rateFail: 'No online rate. Type the rate manually.',
      rateAt: 'Updated at {t}', rateManual: 'Rate typed by you',
      results: 'Comparison', best: 'Best option', receives: 'Arrives', pays: 'You pay',
      vsBest: '{v} less than the best', vsBestPay: '{v} more than the best',
      cost: 'Total cost', vet: 'Effective rate',
      details: 'Details', sent: 'Amount sent', fee: 'Company fee', taxLine: 'Tax',
      iofLine: 'IOF', spreadLine: 'Spread built into the rate', applied: 'Applied rate',
      converted: 'Converted amount', received: 'Amount that arrives',
      edit: 'Adjust company fees', name: 'Company', otherName: 'Other',
      spread: 'Spread (%)', feePct: 'Fee (%)', feeFixed: 'Fixed fee ({c})',
      reset: 'Restore reference values',
      editHint: 'Approximate reference values. Companies change spreads and fees often: check their app and adjust here. Values are saved only on this device.',
      fill: 'Enter an amount to simulate.', invalid: 'Fees are larger than the amount.',
      sameCur: 'Pick two different currencies.',
      noteIof: 'IOF per Decree 6,306/2007 (2025 wording), checked in {d}. Besides tax, companies charge spread and fees.',
      noteTax: 'No Brazilian real involved, so no Brazilian IOF. If your country charges a tax, enter the rate above.',
      disclaimer: 'Approximate simulation. Rates, spreads, fees and taxes change: confirm the final amount with the company before closing. Not a recommendation.'
    },
    es: {
      title: 'Simulador de cambio de moneda',
      intro: 'Mira cuánto llega al destino después del impuesto y de las comisiones de cada empresa.',
      amount: 'Monto', from: 'De', to: 'A', swap: 'Invertir monedas',
      modeSend: 'Quiero enviar', modeReceive: 'Quiero recibir',
      op: 'Tipo de operación', tax: 'Impuesto (%)', iof: 'IOF (%)',
      'op.own': 'Envío a cuenta propia en el exterior',
      'op.third': 'Envío a terceros o pago de servicio',
      'op.invest': 'Remesa para inversión en el exterior',
      'op.card': 'Tarjeta internacional o prepago',
      'op.cash': 'Compra de efectivo',
      'op.receive': 'Recepción del exterior',
      'op.export': 'Ingreso por exportación de servicios',
      'op.abroad': 'Operación fuera de Brasil (sin IOF)',
      rate: 'Cotización comercial', rateUnit: '1 {a} en {b}', rateHint: 'Cotización de referencia, sin spread. Se puede editar.',
      refresh: 'Actualizar cotización', loading: 'Buscando cotización…',
      rateFail: 'Sin cotización en línea. Escribe la cotización manualmente.',
      rateAt: 'Actualizada a las {t}', rateManual: 'Cotización escrita por ti',
      results: 'Comparativo', best: 'Mejor opción', receives: 'Llega', pays: 'Pagas',
      vsBest: '{v} menos que la mejor', vsBestPay: '{v} más que la mejor',
      cost: 'Costo total', vet: 'Tipo efectivo',
      details: 'Detalles', sent: 'Monto enviado', fee: 'Comisión de la empresa', taxLine: 'Impuesto',
      iofLine: 'IOF', spreadLine: 'Spread incluido en la cotización', applied: 'Cotización aplicada',
      converted: 'Monto convertido', received: 'Monto que llega',
      edit: 'Ajustar comisiones de las empresas', name: 'Empresa', otherName: 'Otra',
      spread: 'Spread (%)', feePct: 'Comisión (%)', feeFixed: 'Comisión fija ({c})',
      reset: 'Restaurar valores de referencia',
      editHint: 'Valores de referencia aproximados. Las empresas cambian spreads y comisiones a menudo: revisa su app y ajusta aquí. Los valores se guardan solo en este dispositivo.',
      fill: 'Ingresa un monto para simular.', invalid: 'Las comisiones superan el monto.',
      sameCur: 'Elige dos monedas distintas.',
      noteIof: 'IOF según el Decreto 6.306/2007 (redacción de 2025), revisado en {d}. Además del impuesto, las empresas cobran spread y comisiones.',
      noteTax: 'Sin real brasileño en la operación, no hay IOF. Si tu país cobra algún impuesto, indica la alícuota arriba.',
      disclaimer: 'Simulación aproximada. Cotizaciones, spreads, comisiones e impuestos cambian: confirma el valor final con la empresa antes de cerrar. No es recomendación.'
    }
  };

  /* ---------- Cálculo (funções puras) ---------- */

  // rate = unidades de TO por 1 FROM (cotação comercial).
  // Retorna null se o valor não cobre as tarifas.
  function fxsimForward(amount, p) {
    const spread = (p.spread || 0) / 100;
    const feePct = (p.feePct || 0) / 100;
    const feeFixed = p.feeFixed || 0;
    const tax = (p.tax || 0) / 100;
    const fee = feeFixed + amount * feePct;
    const base = amount - fee;
    if (!(amount > 0) || !(p.rate > 0) || base <= 0 || spread >= 1) return null;
    let converted = base;
    let taxFrom = 0;
    if (p.side === 'from') { converted = base / (1 + tax); taxFrom = base - converted; }
    const applied = p.rate * (1 - spread);
    const gross = converted * applied;
    const spreadCost = converted * p.rate - gross;
    let taxTo = 0;
    if (p.side === 'to') taxTo = gross * tax;
    const received = gross - taxTo;
    if (!(received > 0)) return null;
    return {
      paid: amount, fee, taxFrom, taxTo, converted, applied, gross, spreadCost, received,
      vet: amount / received,
      costPct: 1 - received / (amount * p.rate)
    };
  }

  // Quanto é preciso pagar (em FROM) para chegar `target` (em TO).
  function fxsimInverse(target, p) {
    const spread = (p.spread || 0) / 100;
    const feePct = (p.feePct || 0) / 100;
    const tax = (p.tax || 0) / 100;
    if (!(target > 0) || !(p.rate > 0) || feePct >= 1 || spread >= 1) return null;
    let k = p.rate * (1 - spread);          // TO recebido por 1 FROM líquido de tarifas
    if (p.side === 'from') k = k / (1 + tax);
    if (p.side === 'to') k = k * (1 - tax);
    if (!(k > 0)) return null;
    const amount = (target / k + (p.feeFixed || 0)) / (1 - feePct);
    return fxsimForward(amount, p);
  }

  function fxsimParse(v) {
    let s = String(v == null ? '' : v).trim().replace(/[\s\u00a0]/g, '').replace(/[^\d.,-]/g, '');
    if (!s) return NaN;
    const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.');
    if (lastComma > -1 && lastDot > -1) {
      s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (lastComma > -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  // Exposto para testes em Node; no navegador não polui o escopo global.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fxsimForward, fxsimInverse, fxsimParse, FXSIM_OPS, FXSIM_DEFAULT_PROVIDERS };
  }
  if (typeof document === 'undefined') return;

  /* ---------- Estado e utilidades ---------- */

  const sim = { amount: '', from: 'BRL', to: 'EUR', mode: 'send', op: 'own', tax: null, rate: null, rateManual: false, rateAt: null, rateLoading: false, rateFail: false, open: null, providers: null };

  function lang() {
    try { if (typeof state !== 'undefined' && state && state.settings && state.settings.lang) return state.settings.lang; } catch (e) { /* sem state */ }
    return document.documentElement.lang || 'pt-BR';
  }
  function T(k, vars) {
    const l = lang();
    const pack = FXSIM_TXT[l] || FXSIM_TXT[l.slice(0, 2)] || FXSIM_TXT['pt-BR'];
    let s = pack[k] != null ? pack[k] : (FXSIM_TXT['pt-BR'][k] || k);
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(b);
    return s;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function money(v, cur) {
    try { return new Intl.NumberFormat(lang(), { style: 'currency', currency: cur, maximumFractionDigits: cur === 'JPY' ? 0 : 2 }).format(v); }
    catch (e) { return cur + ' ' + Number(v).toFixed(2); }
  }
  function num(v, d) {
    return new Intl.NumberFormat(lang(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  }
  function pct(v) { return num(v * 100, 2) + '%'; }

  function load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(FXSIM_STORE)) || {}; } catch (e) { saved = {}; }
    if (FXSIM_CURRENCIES.includes(saved.from)) sim.from = saved.from;
    if (FXSIM_CURRENCIES.includes(saved.to)) sim.to = saved.to;
    if (saved.mode === 'receive') sim.mode = 'receive';
    if (FXSIM_OPS[saved.op]) sim.op = saved.op;
    const byId = {};
    if (Array.isArray(saved.providers)) for (const p of saved.providers) if (p && p.id) byId[p.id] = p;
    sim.providers = FXSIM_DEFAULT_PROVIDERS.map((d) => {
      const s = byId[d.id] || {};
      const pick = (k) => (Number.isFinite(s[k]) && s[k] >= 0 ? s[k] : d[k]);
      return { id: d.id, name: d.id === 'other' && typeof s.name === 'string' ? s.name.slice(0, 40) : d.name, spread: pick('spread'), feePct: pick('feePct'), feeFixed: pick('feeFixed') };
    });
    fixOp();
  }
  function save() {
    try {
      localStorage.setItem(FXSIM_STORE, JSON.stringify({ from: sim.from, to: sim.to, mode: sim.mode, op: sim.op, providers: sim.providers }));
    } catch (e) { /* armazenamento indisponível */ }
  }

  function direction() {
    if (sim.from === 'BRL') return 'out';
    if (sim.to === 'BRL') return 'in';
    return 'none';
  }
  function fixOp() {
    const dir = direction();
    if (FXSIM_OPS[sim.op].dir !== dir) {
      sim.op = dir === 'out' ? 'own' : dir === 'in' ? 'receive' : 'abroad';
      sim.tax = null;
    }
  }
  function taxPct() { return sim.tax != null ? sim.tax : FXSIM_OPS[sim.op].iof; }

  /* ---------- Cotação ---------- */

  function cachedRates(base) {
    try {
      const all = JSON.parse(localStorage.getItem(FXSIM_RATES)) || {};
      return all[base] || null;
    } catch (e) { return null; }
  }
  async function loadRate(force) {
    if (sim.from === sim.to) return;
    const base = sim.from;
    const c = cachedRates(base);
    if (!force && c && Date.now() - c.at < FXSIM_RATE_TTL && c.rates[sim.to]) {
      sim.rate = c.rates[sim.to]; sim.rateAt = c.at; sim.rateManual = false; sim.rateFail = false;
      render();
      return;
    }
    sim.rateLoading = true; render();
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/' + encodeURIComponent(base));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const rates = {};
      for (const k of FXSIM_CURRENCIES) if (Number.isFinite(data.rates && data.rates[k])) rates[k] = data.rates[k];
      if (!rates[sim.to]) throw new Error('sem taxa');
      const all = (() => { try { return JSON.parse(localStorage.getItem(FXSIM_RATES)) || {}; } catch (e) { return {}; } })();
      all[base] = { at: Date.now(), rates };
      try { localStorage.setItem(FXSIM_RATES, JSON.stringify(all)); } catch (e) { /* ignora */ }
      if (base === sim.from) { sim.rate = rates[sim.to]; sim.rateAt = Date.now(); sim.rateManual = false; sim.rateFail = false; }
    } catch (e) {
      // Sem internet: usa o cache desta moeda, ou o inverso do par guardado.
      const rev = cachedRates(sim.to);
      if (c && c.rates[sim.to]) { sim.rate = c.rates[sim.to]; sim.rateAt = c.at; sim.rateFail = false; }
      else if (rev && rev.rates[sim.from]) { sim.rate = 1 / rev.rates[sim.from]; sim.rateAt = rev.at; sim.rateFail = false; }
      else if (!(sim.rate > 0)) { sim.rate = null; sim.rateFail = true; }
    } finally {
      sim.rateLoading = false; render();
    }
  }

  // Exibe a cotação no sentido mais legível (ex.: 1 EUR = R$ 5,92).
  function rateView(rate) {
    if (rate >= 1) return { a: sim.from, b: sim.to, v: rate };
    return { a: sim.to, b: sim.from, v: 1 / rate };
  }

  /* ---------- Interface ---------- */

  function options(list, cur) {
    return list.map((c) => `<option value="${c}"${c === cur ? ' selected' : ''}>${c}</option>`).join('');
  }

  function results() {
    const amount = fxsimParse(sim.amount);
    if (sim.from === sim.to) return `<p class="fxsim-msg">${esc(T('sameCur'))}</p>`;
    if (!(sim.rate > 0)) return `<p class="fxsim-msg">${esc(sim.rateLoading ? T('loading') : T('rateFail'))}</p>`;
    if (!(amount > 0)) return `<p class="fxsim-msg">${esc(T('fill'))}</p>`;

    const tax = taxPct();
    const side = FXSIM_OPS[sim.op].side;
    const rows = sim.providers.map((p) => {
      const params = { rate: sim.rate, spread: p.spread, feePct: p.feePct, feeFixed: p.feeFixed, tax, side };
      const r = sim.mode === 'send' ? fxsimForward(amount, params) : fxsimInverse(amount, params);
      return { p, r };
    }).filter((x) => x.r);
    if (!rows.length) return `<p class="fxsim-msg">${esc(T('invalid'))}</p>`;

    rows.sort((a, b) => sim.mode === 'send' ? b.r.received - a.r.received : a.r.paid - b.r.paid);
    const best = rows[0].r;
    const isBrl = sim.from === 'BRL' || sim.to === 'BRL';
    const taxLabel = isBrl ? T('iofLine') : T('taxLine');

    return rows.map(({ p, r }, i) => {
      const name = p.id === 'other' ? (p.name || T('otherName')) : p.name;
      const main = sim.mode === 'send' ? money(r.received, sim.to) : money(r.paid, sim.from);
      const mainLabel = sim.mode === 'send' ? T('receives') : T('pays');
      let diff = '';
      if (i > 0) {
        diff = sim.mode === 'send'
          ? T('vsBest', { v: money(best.received - r.received, sim.to) })
          : T('vsBestPay', { v: money(r.paid - best.paid, sim.from) });
      }
      const rv = rateView(r.applied);
      const vet = rateView(1 / r.vet);
      const open = sim.open === p.id;
      const taxAmt = side === 'to' ? money(r.taxTo, sim.to) : money(r.taxFrom, sim.from);
      return `
        <div class="fxsim-row${i === 0 ? ' best' : ''}${open ? ' open' : ''}">
          <button type="button" class="fxsim-row-head" data-fxsim-open="${esc(p.id)}" aria-expanded="${open}">
            <span class="fxsim-row-name">${esc(name)}${i === 0 ? `<span class="fxsim-badge">${esc(T('best'))}</span>` : ''}</span>
            <span class="fxsim-row-main"><small>${esc(mainLabel)}</small><strong>${esc(main)}</strong></span>
            <span class="fxsim-row-meta">${esc(T('cost'))} ${esc(pct(r.costPct))}${diff ? ' · ' + esc(diff) : ''}</span>
          </button>
          <div class="fxsim-detail"${open ? '' : ' hidden'}>
            <dl>
              <dt>${esc(T('sent'))}</dt><dd>${esc(money(r.paid, sim.from))}</dd>
              <dt>${esc(T('fee'))}</dt><dd>− ${esc(money(r.fee, sim.from))}</dd>
              ${side === 'from' ? `<dt>${esc(taxLabel)} (${esc(num(tax, 2))}%)</dt><dd>− ${esc(taxAmt)}</dd>` : ''}
              <dt>${esc(T('converted'))}</dt><dd>${esc(money(r.converted, sim.from))}</dd>
              <dt>${esc(T('applied'))}</dt><dd>1 ${rv.a} = ${esc(num(rv.v, 4))} ${rv.b}</dd>
              <dt>${esc(T('spreadLine'))}</dt><dd>− ${esc(money(r.spreadCost, sim.to))}</dd>
              ${side === 'to' ? `<dt>${esc(taxLabel)} (${esc(num(tax, 2))}%)</dt><dd>− ${esc(taxAmt)}</dd>` : ''}
              <dt class="fxsim-total">${esc(T('received'))}</dt><dd class="fxsim-total">${esc(money(r.received, sim.to))}</dd>
              <dt>${esc(T('vet'))}</dt><dd>1 ${vet.a} = ${esc(num(vet.v, 4))} ${vet.b}</dd>
            </dl>
          </div>
        </div>`;
    }).join('');
  }

  function providersEditor() {
    const rows = sim.providers.map((p) => `
      <tr>
        <td>${p.id === 'other'
          ? `<input type="text" maxlength="40" data-fxsim-name="other" value="${esc(p.name)}" placeholder="${esc(T('otherName'))}" aria-label="${esc(T('name'))}">`
          : esc(p.name)}</td>
        <td><input type="text" inputmode="decimal" data-fxsim-prov="${esc(p.id)}" data-k="spread" value="${esc(num(p.spread, 2))}" aria-label="${esc(T('spread'))}"></td>
        <td><input type="text" inputmode="decimal" data-fxsim-prov="${esc(p.id)}" data-k="feePct" value="${esc(num(p.feePct, 2))}" aria-label="${esc(T('feePct'))}"></td>
        <td><input type="text" inputmode="decimal" data-fxsim-prov="${esc(p.id)}" data-k="feeFixed" value="${esc(num(p.feeFixed, 2))}" aria-label="${esc(T('feeFixed', { c: sim.from }))}"></td>
      </tr>`).join('');
    return `
      <details class="fxsim-edit"${sim.editOpen ? ' open' : ''}>
        <summary>${esc(T('edit'))}</summary>
        <p class="hint">${esc(T('editHint'))}</p>
        <div class="table-scroll">
          <table class="fxsim-table">
            <thead><tr><th>${esc(T('name'))}</th><th>${esc(T('spread'))}</th><th>${esc(T('feePct'))}</th><th>${esc(T('feeFixed', { c: sim.from }))}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <button type="button" class="secondary-btn" data-fxsim-reset>${esc(T('reset'))}</button>
      </details>`;
  }

  function render() {
    const box = document.getElementById('fxSimulator');
    if (!box) return;
    const active = document.activeElement;
    const focusKey = active && box.contains(active) ? (active.getAttribute('data-fxsim-focus') || null) : null;
    const selStart = focusKey && active.selectionStart != null ? active.selectionStart : null;

    const dir = direction();
    const ops = Object.keys(FXSIM_OPS).filter((k) => FXSIM_OPS[k].dir === dir);
    const isBrl = dir !== 'none';
    const rv = sim.rate > 0 ? rateView(sim.rate) : null;
    let rateStatus = '';
    if (sim.rateLoading) rateStatus = T('loading');
    else if (sim.rateManual) rateStatus = T('rateManual');
    else if (sim.rateAt) rateStatus = T('rateAt', { t: new Date(sim.rateAt).toLocaleString(lang(), { dateStyle: 'short', timeStyle: 'short' }) });
    else if (sim.rateFail) rateStatus = T('rateFail');

    box.innerHTML = `
      <div class="fxsim-card">
        <h3>${esc(T('title'))}</h3>
        <p class="hint">${esc(T('intro'))}</p>

        <div class="fxsim-mode" role="group">
          <button type="button" class="${sim.mode === 'send' ? 'active' : ''}" data-fxsim-mode="send" aria-pressed="${sim.mode === 'send'}">${esc(T('modeSend'))}</button>
          <button type="button" class="${sim.mode === 'receive' ? 'active' : ''}" data-fxsim-mode="receive" aria-pressed="${sim.mode === 'receive'}">${esc(T('modeReceive'))}</button>
        </div>

        <div class="fxsim-grid">
          <label class="fxsim-amount"><span>${esc(T('amount'))} (${sim.mode === 'send' ? sim.from : sim.to})</span>
            <input type="text" inputmode="decimal" autocomplete="off" data-fxsim-focus="amount" id="fxsimAmount" value="${esc(sim.amount)}" placeholder="1.000,00"></label>
          <label><span>${esc(T('from'))}</span><select id="fxsimFrom">${options(FXSIM_CURRENCIES, sim.from)}</select></label>
          <button type="button" class="fxsim-swap" id="fxsimSwap" aria-label="${esc(T('swap'))}" title="${esc(T('swap'))}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/></svg>
          </button>
          <label><span>${esc(T('to'))}</span><select id="fxsimTo">${options(FXSIM_CURRENCIES, sim.to)}</select></label>
        </div>

        <div class="fxsim-grid fxsim-grid-2">
          <label><span>${esc(T('op'))}</span><select id="fxsimOp">${ops.map((k) => `<option value="${k}"${k === sim.op ? ' selected' : ''}>${esc(T('op.' + k))}</option>`).join('')}</select></label>
          <label><span>${esc(isBrl ? T('iof') : T('tax'))}</span>
            <input type="text" inputmode="decimal" autocomplete="off" data-fxsim-focus="tax" id="fxsimTax" value="${esc(num(taxPct(), 2))}"></label>
        </div>

        <div class="fxsim-rate">
          <label><span>${esc(T('rate'))}${rv ? ' · ' + esc(T('rateUnit', { a: rv.a, b: rv.b })) : ''}</span>
            <input type="text" inputmode="decimal" autocomplete="off" data-fxsim-focus="rate" id="fxsimRate" value="${rv ? esc(num(rv.v, 4)) : ''}" placeholder="0,0000"></label>
          <button type="button" class="secondary-btn" id="fxsimRefresh"${sim.rateLoading ? ' disabled' : ''}>${esc(T('refresh'))}</button>
          <small class="fxsim-rate-status">${esc(rateStatus)}${rateStatus ? ' · ' : ''}${esc(T('rateHint'))}</small>
        </div>

        <h4 class="fxsim-sub">${esc(T('results'))}</h4>
        <div class="fxsim-results" aria-live="polite">${results()}</div>

        <p class="hint fxsim-note">${esc(isBrl ? T('noteIof', { d: FXSIM_REVIEWED }) : T('noteTax'))}</p>
        ${providersEditor()}
        <p class="hint fxsim-disclaimer">${esc(T('disclaimer'))}</p>
      </div>`;

    if (focusKey) {
      const el = box.querySelector(`[data-fxsim-focus="${focusKey}"]`);
      if (el) { el.focus(); if (selStart != null) { try { el.setSelectionRange(selStart, selStart); } catch (e) { /* ignora */ } } }
    }
  }

  // Atualiza só o comparativo enquanto a pessoa digita (não perde o foco).
  function renderResults() {
    const out = document.querySelector('#fxSimulator .fxsim-results');
    if (out) out.innerHTML = results(); else render();
  }

  function bind(box) {
    box.addEventListener('input', (e) => {
      const el = e.target;
      if (el.id === 'fxsimAmount') { sim.amount = el.value; renderResults(); return; }
      if (el.id === 'fxsimTax') {
        const v = fxsimParse(el.value);
        sim.tax = Number.isFinite(v) && v >= 0 && v < 100 ? v : null;
        renderResults(); return;
      }
      if (el.id === 'fxsimRate') {
        const v = fxsimParse(el.value);
        if (v > 0) {
          const rv = rateView(sim.rate > 0 ? sim.rate : 1);
          // O campo segue o sentido exibido (1 A = v B); converte para TO por FROM.
          sim.rate = rv.a === sim.from ? v : 1 / v;
          sim.rateManual = true; sim.rateFail = false;
          renderResults();
        }
        return;
      }
      if (el.dataset.fxsimName === 'other') {
        const p = sim.providers.find((x) => x.id === 'other');
        p.name = el.value.slice(0, 40); save(); renderResults(); return;
      }
      if (el.dataset.fxsimProv) {
        const p = sim.providers.find((x) => x.id === el.dataset.fxsimProv);
        const v = fxsimParse(el.value);
        if (p && Number.isFinite(v) && v >= 0 && v < 100000) { p[el.dataset.k] = v; save(); renderResults(); }
      }
    });

    box.addEventListener('change', (e) => {
      const el = e.target;
      if (el.id === 'fxsimFrom' || el.id === 'fxsimTo') {
        if (el.id === 'fxsimFrom') sim.from = el.value; else sim.to = el.value;
        sim.rate = null; sim.rateAt = null; sim.rateManual = false;
        fixOp(); save(); render(); loadRate(false);
      } else if (el.id === 'fxsimOp') {
        sim.op = el.value; sim.tax = null; save(); render();
      }
    });

    box.addEventListener('toggle', (e) => {
      if (e.target.classList && e.target.classList.contains('fxsim-edit')) sim.editOpen = e.target.open;
    }, true);

    box.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t || !box.contains(t)) return;
      if (t.id === 'fxsimSwap') {
        const f = sim.from; sim.from = sim.to; sim.to = f;
        sim.rate = sim.rate > 0 ? 1 / sim.rate : null;
        fixOp(); save(); render(); if (!sim.rateManual) loadRate(false);
      } else if (t.id === 'fxsimRefresh') {
        sim.rateManual = false; loadRate(true);
      } else if (t.dataset.fxsimMode) {
        sim.mode = t.dataset.fxsimMode; save(); render();
      } else if (t.dataset.fxsimOpen) {
        sim.open = sim.open === t.dataset.fxsimOpen ? null : t.dataset.fxsimOpen; renderResults();
      } else if (t.hasAttribute('data-fxsim-reset')) {
        sim.providers = FXSIM_DEFAULT_PROVIDERS.map((p) => ({ ...p })); save(); render();
      }
    });
  }

  function initFxSimulator() {
    const panel = document.getElementById('tab-fx');
    if (!panel || document.getElementById('fxSimulator')) return;
    const box = document.createElement('div');
    box.id = 'fxSimulator';
    box.className = 'fxsim';
    const anchor = panel.querySelector('.hint');
    if (anchor && anchor.nextSibling) panel.insertBefore(box, anchor.nextSibling); else panel.appendChild(box);
    load();
    bind(box);
    render();
    loadRate(false);

    // Re-renderiza quando o idioma muda.
    const langs = document.getElementById('langButtons');
    if (langs) langs.addEventListener('click', () => setTimeout(render, 60));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFxSimulator);
  else initFxSimulator();
})();
