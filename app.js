/* ============================================================
   ProF Controller — app.js
   PWA de gestão patrimonial multi-moeda (offline-first)
   Fases 1-5: Fundação, Transações/Orçamentos, Câmbio,
   Portfólio e Dashboard de NAV.
   v12
   ============================================================ */

/* ---------- i18n ---------- */
const I18N = {
  'pt-BR': {
    'tabs.dashboard': 'Dashboard', 'tabs.accounts': 'Contas', 'tabs.balances': 'Saldos Diários',
    'tabs.transactions': 'Transações', 'tabs.budgets': 'Orçamentos', 'tabs.fx': 'Câmbio',
    'tabs.portfolio': 'Portfólio', 'tabs.settings': 'Configurações',
    'dashboard.totalEquity': 'Financeiro', 'dashboard.accounts': 'Contas', 'dashboard.currencies': 'Moedas',
    'dashboard.baseCurrency': 'Moeda base', 'dashboard.properties': 'Imóveis', 'dashboard.vehicles': 'Veículos',
    'dashboard.debt': 'Dívidas', 'dashboard.nav': 'Patrimônio Líquido',
    'dashboard.income': 'Receitas do mês', 'dashboard.expense': 'Despesas do mês', 'dashboard.result': 'Resultado do mês',
    'accounts.title': 'Contas', 'accounts.add': '+ Nova conta', 'accounts.name': 'Nome', 'accounts.type': 'Tipo',
    'accounts.currency': 'Moeda', 'accounts.initialBalance': 'Saldo inicial', 'accounts.currentBalance': 'Saldo atual',
    'accounts.actions': 'Ações', 'balances.title': 'Saldos Diários', 'balances.add': '+ Registrar saldo',
    'tx.title': 'Transações', 'tx.add': '+ Novo lançamento', 'tx.type': 'Tipo', 'tx.account': 'Conta',
    'tx.month': 'Mês', 'tx.clearFilters': 'Limpar filtros', 'budget.title': 'Orçamentos', 'budget.add': '+ Novo orçamento',
    'budget.hint': 'Cada orçamento tem moeda própria e vale todos os meses.', 'budget.month': 'Mês',
    'fx.title': 'Câmbio', 'fx.fetch': 'Buscar taxas de hoje', 'fx.add': '+ Nova taxa',
    'fx.hint': 'As taxas são registradas em relação ao euro.',
    'portfolio.properties': 'Imóveis', 'portfolio.addProperty': '+ Novo imóvel', 'portfolio.vehicles': 'Veículos',
    'portfolio.addVehicle': '+ Novo veículo',
    'settings.title': 'Configurações', 'settings.baseCurrency': 'Moeda base',
    'settings.baseCurrencyHint': 'Moeda usada para consolidar patrimônio e relatórios.', 'settings.backup': 'Backup dos dados',
    'settings.exportJSON': 'Exportar backup (JSON)', 'settings.exportCSV': 'Exportar planilha (CSV)',
    'settings.importJSON': 'Importar backup', 'settings.importCSV': 'Importar planilha (CSV)',
    'settings.importCSVHint': 'Formato: Data;Conta;Moeda;Saldo (AAAA-MM-DD).',
    'modal.save': 'Salvar', 'modal.cancel': 'Cancelar', 'modal.delete': 'Excluir', 'modal.edit': 'Editar',
    'toast.saved': 'Salvo!', 'toast.deleted': 'Excluído!', 'toast.exported': 'Arquivo exportado.',
    'toast.imported': 'Backup importado.', 'toast.invalidFile': 'Arquivo inválido.',
    'nav.title': 'Evolução do Patrimônio', 'nav.hint': 'Série mensal consolidada na moeda base. Moedas sem taxa ficam de fora.',
    'nav.empty': 'Sem dados suficientes para o gráfico.', 'nav.financial': 'Financeiro', 'nav.properties': 'Imóveis',
    'nav.vehicles': 'Veículos', 'nav.debt': 'Dívidas', 'nav.net': 'Patrimônio Líquido'
  },
  en: {
    'tabs.dashboard': 'Dashboard', 'tabs.accounts': 'Accounts', 'tabs.balances': 'Daily Balances',
    'tabs.transactions': 'Transactions', 'tabs.budgets': 'Budgets', 'tabs.fx': 'FX',
    'tabs.portfolio': 'Portfolio', 'tabs.settings': 'Settings',
    'dashboard.totalEquity': 'Financial', 'dashboard.accounts': 'Accounts', 'dashboard.currencies': 'Currencies',
    'dashboard.baseCurrency': 'Base currency', 'dashboard.properties': 'Properties', 'dashboard.vehicles': 'Vehicles',
    'dashboard.debt': 'Debt', 'dashboard.nav': 'Net Worth',
    'dashboard.income': 'Month income', 'dashboard.expense': 'Month expense', 'dashboard.result': 'Month result',
    'accounts.title': 'Accounts', 'accounts.add': '+ New account', 'accounts.name': 'Name', 'accounts.type': 'Type',
    'accounts.currency': 'Currency', 'accounts.initialBalance': 'Initial balance', 'accounts.currentBalance': 'Current balance',
    'accounts.actions': 'Actions', 'balances.title': 'Daily Balances', 'balances.add': '+ Record balance',
    'tx.title': 'Transactions', 'tx.add': '+ New entry', 'tx.type': 'Type', 'tx.account': 'Account',
    'tx.month': 'Month', 'tx.clearFilters': 'Clear filters', 'budget.title': 'Budgets', 'budget.add': '+ New budget',
    'budget.hint': 'Each budget has its own currency and applies every month.', 'budget.month': 'Month',
    'fx.title': 'FX', 'fx.fetch': 'Fetch today\'s rates', 'fx.add': '+ New rate',
    'fx.hint': 'Rates are recorded against the euro.',
    'portfolio.properties': 'Properties', 'portfolio.addProperty': '+ New property', 'portfolio.vehicles': 'Vehicles',
    'portfolio.addVehicle': '+ New vehicle',
    'settings.title': 'Settings', 'settings.baseCurrency': 'Base currency',
    'settings.baseCurrencyHint': 'Currency used to consolidate net worth and reports.', 'settings.backup': 'Data backup',
    'settings.exportJSON': 'Export backup (JSON)', 'settings.exportCSV': 'Export sheet (CSV)',
    'settings.importJSON': 'Import backup', 'settings.importCSV': 'Import sheet (CSV)',
    'settings.importCSVHint': 'Format: Date;Account;Currency;Balance (YYYY-MM-DD).',
    'modal.save': 'Save', 'modal.cancel': 'Cancel', 'modal.delete': 'Delete', 'modal.edit': 'Edit',
    'toast.saved': 'Saved!', 'toast.deleted': 'Deleted!', 'toast.exported': 'File exported.',
    'toast.imported': 'Backup imported.', 'toast.invalidFile': 'Invalid file.',
    'nav.title': 'Net Worth Evolution', 'nav.hint': 'Monthly series consolidated in the base currency. Currencies without a rate are excluded.',
    'nav.empty': 'Not enough data for the chart.', 'nav.financial': 'Financial', 'nav.properties': 'Properties',
    'nav.vehicles': 'Vehicles', 'nav.debt': 'Debt', 'nav.net': 'Net Worth'
  },
  es: {
    'tabs.dashboard': 'Dashboard', 'tabs.accounts': 'Cuentas', 'tabs.balances': 'Saldos Diarios',
    'tabs.transactions': 'Transacciones', 'tabs.budgets': 'Presupuestos', 'tabs.fx': 'Cambio',
    'tabs.portfolio': 'Portafolio', 'tabs.settings': 'Configuración',
    'dashboard.totalEquity': 'Financiero', 'dashboard.accounts': 'Cuentas', 'dashboard.currencies': 'Monedas',
    'dashboard.baseCurrency': 'Moneda base', 'dashboard.properties': 'Inmuebles', 'dashboard.vehicles': 'Vehículos',
    'dashboard.debt': 'Deudas', 'dashboard.nav': 'Patrimonio Neto',
    'dashboard.income': 'Ingresos del mes', 'dashboard.expense': 'Gastos del mes', 'dashboard.result': 'Resultado del mes',
    'accounts.title': 'Cuentas', 'accounts.add': '+ Nueva cuenta', 'accounts.name': 'Nombre', 'accounts.type': 'Tipo',
    'accounts.currency': 'Moneda', 'accounts.initialBalance': 'Saldo inicial', 'accounts.currentBalance': 'Saldo actual',
    'accounts.actions': 'Acciones', 'balances.title': 'Saldos Diarios', 'balances.add': '+ Registrar saldo',
    'tx.title': 'Transacciones', 'tx.add': '+ Nuevo movimiento', 'tx.type': 'Tipo', 'tx.account': 'Cuenta',
    'tx.month': 'Mes', 'tx.clearFilters': 'Limpiar filtros', 'budget.title': 'Presupuestos', 'budget.add': '+ Nuevo presupuesto',
    'budget.hint': 'Cada presupuesto tiene su propia moneda y vale todos los meses.', 'budget.month': 'Mes',
    'fx.title': 'Cambio', 'fx.fetch': 'Buscar tasas de hoy', 'fx.add': '+ Nueva tasa',
    'fx.hint': 'Las tasas se registran en relación al euro.',
    'portfolio.properties': 'Inmuebles', 'portfolio.addProperty': '+ Nuevo inmueble', 'portfolio.vehicles': 'Vehículos',
    'portfolio.addVehicle': '+ Nuevo vehículo',
    'settings.title': 'Configuración', 'settings.baseCurrency': 'Moneda base',
    'settings.baseCurrencyHint': 'Moneda usada para consolidar patrimonio e informes.', 'settings.backup': 'Respaldo de datos',
    'settings.exportJSON': 'Exportar respaldo (JSON)', 'settings.exportCSV': 'Exportar hoja (CSV)',
    'settings.importJSON': 'Importar respaldo', 'settings.importCSV': 'Importar hoja (CSV)',
    'settings.importCSVHint': 'Formato: Fecha;Cuenta;Moneda;Saldo (AAAA-MM-DD).',
    'modal.save': 'Guardar', 'modal.cancel': 'Cancelar', 'modal.delete': 'Eliminar', 'modal.edit': 'Editar',
    'toast.saved': '¡Guardado!', 'toast.deleted': '¡Eliminado!', 'toast.exported': 'Archivo exportado.',
    'toast.imported': 'Respaldo importado.', 'toast.invalidFile': 'Archivo inválido.',
    'nav.title': 'Evolución del Patrimonio', 'nav.hint': 'Serie mensual consolidada en la moneda base. Las monedas sin tasa quedan fuera.',
    'nav.empty': 'Datos insuficientes para el gráfico.', 'nav.financial': 'Financiero', 'nav.properties': 'Inmuebles',
    'nav.vehicles': 'Vehículos', 'nav.debt': 'Deudas', 'nav.net': 'Patrimonio Neto'
  }
};

/* ---------- Categorias ---------- */
const EXPENSE_CATEGORIES = [
  { key: 'rent', group: 'housing' }, { key: 'mortgage', group: 'housing' }, { key: 'utilities', group: 'housing' },
  { key: 'condo', group: 'housing' }, { key: 'food', group: 'daily' }, { key: 'transport', group: 'daily' },
  { key: 'leisure', group: 'daily' }, { key: 'clothing', group: 'daily' }, { key: 'health', group: 'health' },
  { key: 'pharmacy', group: 'health' }, { key: 'insurance', group: 'health' }, { key: 'education', group: 'edu' },
  { key: 'courses', group: 'edu' }, { key: 'business', group: 'business' }, { key: 'marketing', group: 'business' },
  { key: 'tools', group: 'business' }, { key: 'investments', group: 'invest' }, { key: 'taxes', group: 'taxes' },
  { key: 'other', group: 'other' }
];
const INCOME_CATEGORIES = [
  { key: 'salary', group: 'incomeOps' }, { key: 'freelance', group: 'incomeOps' }, { key: 'sales', group: 'incomeOps' },
  { key: 'investments', group: 'incomeOps' }, { key: 'rental', group: 'incomeOps' }, { key: 'other', group: 'incomeOps' }
];

/* ---------- Estado e persistência (IndexedDB) ---------- */
const DB_NAME = 'prof-controller';
const DB_VERSION = 3; // Fase 3: fx; Fase 4: assets e valuations
let db = null;
let state = {
  accounts: [], balances: [], transactions: [], budgets: [], fx: [], assets: [], valuations: [],
  settings: { lang: 'pt-BR', theme: 'default', baseCurrency: 'EUR' },
  ui: { currentTab: 'dashboard', txType: 'all', txAccount: 'all', txMonth: '', budgetMonth: '' }
};

const CURRENCIES = [
  { code: 'EUR', symbol: '€', decimals: 2 }, { code: 'CHF', symbol: 'CHF ', decimals: 2 },
  { code: 'USD', symbol: 'US$', decimals: 2 }, { code: 'JPY', symbol: '¥', decimals: 0 },
  { code: 'GBP', symbol: '£', decimals: 2 }, { code: 'BRL', symbol: 'R$', decimals: 2 }
];

const FX_SOURCES = [
  { name: 'frankfurter.dev', url: 'https://api.frankfurter.dev/v1/latest' },
  { name: 'jsDelivr', url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur.json' },
  { name: 'open.er-api', url: 'https://open.er-api.com/v6/latest/EUR' },
  { name: 'frankfurter.app', url: 'https://api.frankfurter.app/latest' }
];

/* ---------- Utilidades ---------- */
function t(key) {
  const lang = state.settings.lang || 'pt-BR';
  return (I18N[lang] && I18N[lang][key]) || I18N['pt-BR'][key] || key;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { return todayISO().slice(0, 7); }
function monthOf(d) { return String(d).slice(0, 7); }
function currency(code) { return CURRENCIES.find((c) => c.code === code) || { code, symbol: code + ' ', decimals: 2 }; }
function fmtMoney(value, code) {
  const c = currency(code);
  return c.symbol + ' ' + Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals });
}
function fmtBase(v) { return fmtMoney(v, state.settings.baseCurrency); }
function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function parseMoney(str) {
  if (str == null) return null;
  let s = String(str).trim();
  if (!s) return null;
  s = s.replace(/[^\d.,-]/g, '');
  if (!s) return null;
  const hasDot = s.includes('.'), hasComma = s.includes(',');
  let num;
  if (hasDot && hasComma) {
    num = (s.lastIndexOf('.') > s.lastIndexOf(',')) ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    num = s.replace(/\./g, '').replace(',', '.');
  } else num = s;
  const v = parseFloat(num);
  return isNaN(v) ? null : v;
}
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}
function accountById(id) { return state.accounts.find((a) => a.id === id); }
function accountCurrency(id) { const a = accountById(id); return a ? a.currency : state.settings.baseCurrency; }
function catLabel(key) { return key || '—'; }

/* ---------- IndexedDB ---------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('accounts')) d.createObjectStore('accounts', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('balances')) {
        const s = d.createObjectStore('balances', { keyPath: 'id' });
        s.createIndex('date', 'date'); s.createIndex('accountId', 'accountId');
      }
      if (!d.objectStoreNames.contains('settings')) d.createObjectStore('settings', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('transactions')) {
        const s = d.createObjectStore('transactions', { keyPath: 'id' });
        s.createIndex('date', 'date'); s.createIndex('accountId', 'accountId');
        s.createIndex('category', 'category'); s.createIndex('type', 'type');
      }
      if (!d.objectStoreNames.contains('budgets')) {
        const s = d.createObjectStore('budgets', { keyPath: 'id' });
        s.createIndex('category', 'category');
      }
      if (!d.objectStoreNames.contains('fx')) d.createObjectStore('fx', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('assets')) {
        const s = d.createObjectStore('assets', { keyPath: 'id' });
        s.createIndex('type', 'type');
      }
      if (!d.objectStoreNames.contains('valuations')) {
        const s = d.createObjectStore('valuations', { keyPath: 'id' });
        s.createIndex('assetId', 'assetId'); s.createIndex('date', 'date');
      }
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}
function tx(store, mode) { return db.transaction(store, mode).objectStore(store); }
function put(store, obj) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').put(obj);
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
function del(store, id) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').delete(id);
    r.onsuccess = () => resolve(); r.onerror = () => reject(r.error);
  });
}
function getAll(store) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readonly').getAll();
    r.onsuccess = () => resolve(r.result || []); r.onerror = () => reject(r.error);
  });
}
async function loadAll() {
  const [accounts, balances, transactions, budgets, fx, assets, valuations, settings] = await Promise.all([
    getAll('accounts'), getAll('balances'), getAll('transactions'), getAll('budgets'),
    getAll('fx'), getAll('assets'), getAll('valuations'), getAll('settings')
  ]);
  state.accounts = accounts; state.balances = balances; state.transactions = transactions;
  state.budgets = budgets; state.fx = fx; state.assets = assets; state.valuations = valuations;
  const sMap = {};
  settings.forEach((s) => { sMap[s.key] = s.value; });
  if (sMap.lang) state.settings.lang = sMap.lang;
  if (sMap.theme) state.settings.theme = sMap.theme;
  if (sMap.baseCurrency) state.settings.baseCurrency = sMap.baseCurrency;
}
async function saveSetting(key, value) { await put('settings', { key, value }); }

/* ---------- Saldo calculado (âncora + transações) ---------- */
function lastBalanceAt(accountId, date) {
  return state.balances
    .filter((b) => b.accountId === accountId && b.date <= date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;
}
function accountBalanceAt(account, date) {
  const anchor = lastBalanceAt(account.id, date);
  let value = anchor ? anchor.value : 0;
  const anchorDate = anchor ? anchor.date : '0000-00-00';
  for (const trn of state.transactions) {
    if (trn.accountId !== account.id || trn.date > date || trn.date <= anchorDate) continue;
    if (trn.type === 'income') value += Number(trn.value) || 0;
    else if (trn.type === 'expense') value -= Number(trn.value) || 0;
    else if (trn.type === 'transfer') value -= Number(trn.value) || 0;
  }
  for (const trn of state.transactions) {
    if (trn.type !== 'transfer' || !trn.toAccountId || trn.toAccountId !== account.id) continue;
    if (trn.date > date || trn.date <= anchorDate) continue;
    value += (trn.toValue != null ? Number(trn.toValue) : (Number(trn.value) || 0));
  }
  return value;
}
function currentBalance(account) { return accountBalanceAt(account, todayISO()); }

/* ---------- Câmbio (pivô EUR) ---------- */
function fxRateAt(currency, date) {
  if (currency === 'EUR') return 1;
  const recs = state.fx.filter((f) => f.currency === currency && f.date <= date)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return recs.length ? Number(recs[0].rate) : null;
}
function toBase(amount, currency, date) {
  if (amount == null) return 0;
  const d = date || todayISO();
  if (currency === state.settings.baseCurrency) return Number(amount);
  const rC = fxRateAt(currency, d);
  const rB = fxRateAt(state.settings.baseCurrency, d);
  if (rC == null || rB == null) return null;
  return (Number(amount) / rC) * rB;
}
function convert(amount, from, to, date) {
  if (amount == null) return null;
  const d = date || todayISO();
  if (from === to) return Number(amount);
  const rF = fxRateAt(from, d), rT = fxRateAt(to, d);
  if (rF == null || rT == null) return null;
  return (Number(amount) / rF) * rT;
}

/* ---------- Ativos (imóveis e veículos) ---------- */
function yearsBetween(a, b) { return (new Date(b) - new Date(a)) / (365.25 * 86400000); }
function assetAt(asset, date) {
  const vals = state.valuations.filter((v) => v.assetId === asset.id && v.date <= date)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  let baseDate = asset.acquiredDate, baseValue = asset.acquiredValue, baseDebt = asset.acquiredDebt;
  if (vals.length) { baseDate = vals[0].date; baseValue = vals[0].value; baseDebt = vals[0].debt; }
  let value = Number(baseValue) || 0;
  if (asset.type === 'vehicle' && asset.depreciation && baseDate && value > 0) {
    value = value * Math.pow(1 - Number(asset.depreciation) / 100, yearsBetween(baseDate, date));
  }
  return { value, debt: Number(baseDebt) || 0 };
}

/* ---------- Consolidação do Dashboard ---------- */
function consolidate() {
  let financial = 0, properties = 0, vehicles = 0, debt = 0;
  const missingFx = new Set();
  for (const acct of state.accounts) {
    const v = toBase(currentBalance(acct), acct.currency);
    if (v == null) { missingFx.add(acct.currency); continue; }
    financial += v;
  }
  for (const a of state.assets) {
    const at = assetAt(a, todayISO());
    const val = toBase(at.value, a.currency);
    const dbt = toBase(at.debt, a.currency);
    if (val == null) { missingFx.add(a.currency); continue; }
    if (a.type === 'property') properties += val; else vehicles += val;
    if (dbt != null) debt += dbt;
  }
  const nav = financial + properties + vehicles - debt;
  return { financial, properties, vehicles, debt, nav, missingFx: [...missingFx] };
}
function monthTotals(dateStr) {
  const m = monthOf(dateStr);
  let income = 0, expense = 0;
  for (const trn of state.transactions) {
    if (monthOf(trn.date) !== m) continue;
    if (trn.type === 'income') income += Number(trn.value) || 0;
    else if (trn.type === 'expense') expense += Number(trn.value) || 0;
  }
  return { income, expense, result: income - expense };
}

/* ---------- Renderização ---------- */
function renderAll() {
  renderDashboard(); renderAccounts(); renderBalances(); renderTransactions();
  renderBudgets(); renderFx(); renderPortfolio(); renderSettings();
}
function renderDashboard() {
  const c = consolidate();
  document.getElementById('totalEquity').textContent = fmtBase(c.financial);
  document.getElementById('totalEquityBase').textContent = state.settings.baseCurrency;
  document.getElementById('accountCount').textContent = state.accounts.length;
  document.getElementById('currencyCount').textContent = new Set(state.accounts.map((a) => a.currency)).size;
  document.getElementById('baseCurrencyLabel').textContent = state.settings.baseCurrency;
  document.getElementById('propTotal').textContent = fmtBase(c.properties);
  document.getElementById('vehTotal').textContent = fmtBase(c.vehicles);
  document.getElementById('debtTotal').textContent = fmtBase(-c.debt);
  document.getElementById('navTotal').textContent = fmtBase(c.nav);
  const mt = monthTotals(todayISO());
  document.getElementById('monthIncome').textContent = fmtBase(mt.income);
  document.getElementById('monthExpense').textContent = fmtBase(-mt.expense);
  document.getElementById('monthResult').textContent = fmtBase(mt.result);
  const warn = document.getElementById('fxWarning');
  if (c.missingFx.length) {
    warn.classList.remove('hidden');
    warn.textContent = t('nav.hint') + ' ' + c.missingFx.join(', ');
  } else warn.classList.add('hidden');
  renderNAV();
}
function renderAccounts() {
  const tbody = document.querySelector('#accountsTable tbody');
  tbody.innerHTML = '';
  state.accounts.forEach((a) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.type)}</td><td>${a.currency}</td>
      <td>${fmtMoney(a.initialBalance, a.currency)}</td>
      <td><strong>${fmtMoney(currentBalance(a), a.currency)}</strong></td>
      <td>
        <button class="secondary-btn" onclick="openAccountModal('${a.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteAccount('${a.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function renderBalances() {
  const thead = document.querySelector('#balancesTable thead tr');
  const tbody = document.querySelector('#balancesTable tbody');
  thead.innerHTML = `<th>${t('balances.title')}</th>` + state.accounts.map((a) => `<th>${escapeHtml(a.name)}</th>`).join('');
  const dates = [...new Set(state.balances.map((b) => b.date))].sort().reverse();
  tbody.innerHTML = '';
  dates.forEach((d) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${d}</td>` + state.accounts.map((a) => {
      const b = state.balances.find((x) => x.accountId === a.id && x.date === d);
      return `<td>${b ? fmtMoney(b.value, a.currency) : '—'}</td>`;
    }).join('');
    tbody.appendChild(tr);
  });
}
function filteredTransactions() {
  const { txType, txAccount, txMonth } = state.ui;
  return state.transactions
    .filter((trn) => txType === 'all' || trn.type === txType)
    .filter((trn) => txAccount === 'all' || trn.accountId === txAccount || trn.toAccountId === txAccount)
    .filter((trn) => !txMonth || monthOf(trn.date) === txMonth)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
function renderTransactions() {
  const tbody = document.querySelector('#txTable tbody');
  const rows = filteredTransactions();
  document.getElementById('txEmpty').classList.toggle('hidden', rows.length > 0);
  tbody.innerHTML = '';
  rows.forEach((trn) => {
    const acc = accountById(trn.accountId);
    const code = acc ? acc.currency : state.settings.baseCurrency;
    let accountCell = acc ? escapeHtml(acc.name) : '—';
    let amountClass = 'amount-neutral';
    let amountText = fmtMoney(trn.value, code);
    let categoryCell = catLabel(trn.category);
    if (trn.type === 'income') { amountClass = 'amount-in'; amountText = '+ ' + amountText; }
    if (trn.type === 'expense') { amountClass = 'amount-out'; amountText = '− ' + amountText; }
    if (trn.type === 'transfer') {
      const to = accountById(trn.toAccountId);
      accountCell += ' → ' + (to ? escapeHtml(to.name) : '—');
      categoryCell = '—';
      if (to && trn.toValue != null && to.currency !== code) amountText += ' → ' + fmtMoney(trn.toValue, to.currency);
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${trn.date}</td><td>${t('tx.' + trn.type)}</td><td>${accountCell}</td>
      <td>${categoryCell}</td><td class="${amountClass}">${amountText}</td>
      <td>${escapeHtml(trn.description || '')}</td>
      <td>
        <button class="secondary-btn" onclick="openTxModal('${trn.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteTx('${trn.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function renderBudgets() {
  const list = document.getElementById('budgetList');
  const month = document.getElementById('budgetMonth').value || currentMonth();
  list.innerHTML = '';
  document.getElementById('budgetEmpty').classList.toggle('hidden', state.budgets.length > 0);
  state.budgets.forEach((b) => {
    let spent = 0;
    for (const trn of state.transactions) {
      if (trn.type === 'expense' && trn.category === b.category && monthOf(trn.date) === month) {
        const acct = accountById(trn.accountId);
        if (acct && acct.currency === b.currency) spent += Number(trn.value) || 0;
      }
    }
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const over = pct > 100;
    const card = document.createElement('div');
    card.className = 'budget-card';
    card.innerHTML = `
      <div class="budget-head">
        <div><h3>${escapeHtml(catLabel(b.category))}</h3><div class="hint">${b.currency}</div></div>
        <div class="budget-actions">
          <button class="secondary-btn" onclick="openBudgetModal('${b.id}')">${t('modal.edit')}</button>
          <button class="secondary-btn" onclick="deleteBudget('${b.id}')">${t('modal.delete')}</button>
        </div>
      </div>
      <div class="progress"><span style="width:${Math.min(pct, 100)}%" class="${over ? 'over' : ''}"></span></div>
      <div class="budget-figures">
        <span>${fmtMoney(spent, b.currency)} / ${fmtMoney(b.amount, b.currency)}</span>
        <span>${pct.toFixed(0)}%</span>
      </div>`;
    list.appendChild(card);
  });
}
function renderFx() {
  const tbody = document.querySelector('#fxTable tbody');
  const list = state.fx.slice().sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById('fxEmpty').classList.toggle('hidden', list.length > 0);
  tbody.innerHTML = '';
  list.forEach((f) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.date}</td><td>${f.currency}</td><td>${f.rate}</td>
      <td>
        <button class="secondary-btn" onclick="openFxModal('${f.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteFx('${f.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function renderPortfolio() { renderProperties(); renderVehicles(); }
function renderProperties() {
  const tbody = document.querySelector('#propTable tbody');
  const props = state.assets.filter((a) => a.type === 'property');
  document.getElementById('propEmpty').classList.toggle('hidden', props.length > 0);
  tbody.innerHTML = '';
  props.forEach((a) => {
    const at = assetAt(a, todayISO());
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td><td>${a.currency}</td>
      <td>${fmtMoney(at.value, a.currency)}</td><td>${fmtMoney(at.debt, a.currency)}</td>
      <td>
        <button class="secondary-btn" onclick="openAssetModal('${a.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="openValuationModal('${a.id}')">${t('balances.add')}</button>
        <button class="secondary-btn" onclick="deleteAsset('${a.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function renderVehicles() {
  const tbody = document.querySelector('#vehTable tbody');
  const vehs = state.assets.filter((a) => a.type === 'vehicle');
  document.getElementById('vehEmpty').classList.toggle('hidden', vehs.length > 0);
  tbody.innerHTML = '';
  vehs.forEach((a) => {
    const at = assetAt(a, todayISO());
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td><td>${a.currency}</td>
      <td>${fmtMoney(at.value, a.currency)}</td><td>${fmtMoney(at.debt, a.currency)}</td>
      <td>${a.depreciation ? a.depreciation + '%' : '—'}</td>
      <td>
        <button class="secondary-btn" onclick="openAssetModal('${a.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="openValuationModal('${a.id}')">${t('balances.add')}</button>
        <button class="secondary-btn" onclick="deleteAsset('${a.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function renderSettings() {
  const sel = document.getElementById('baseCurrencySelect');
  sel.innerHTML = CURRENCIES.map((c) => `<option value="${c.code}">${c.code} (${c.symbol.trim()})</option>`).join('');
  sel.value = state.settings.baseCurrency;
}

/* ---------- Modais ---------- */
function openModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modalBody').innerHTML = '';
}
function openAccountModal(id) {
  const a = id ? accountById(id) : null;
  openModal(`
    <h3>${a ? t('modal.editAccount') : t('modal.addAccount')}</h3>
    <label>${t('accounts.name')}</label><input id="accName" value="${a ? escapeHtml(a.name) : ''}">
    <label>${t('accounts.type')}</label>
    <select id="accType">
      ${['bank', 'liquidity', 'wallet', 'broker', 'cash'].map((ty) => `<option value="${ty}" ${a && a.type === ty ? 'selected' : ''}>${ty}</option>`).join('')}
    </select>
    <label>${t('accounts.currency')}</label>
    <select id="accCurrency">
      ${CURRENCIES.map((c) => `<option value="${c.code}" ${a && a.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}
    </select>
    <label>${t('accounts.initialBalance')}</label>
    <input id="accInitial" type="text" inputmode="decimal" value="${a ? a.initialBalance : ''}">
    <button class="primary-btn" onclick="saveAccount('${id || ''}')">${t('modal.save')}</button>`);
}
async function saveAccount(id) {
  const name = document.getElementById('accName').value.trim();
  if (!name) return;
  const type = document.getElementById('accType').value;
  const currency = document.getElementById('accCurrency').value;
  const init = parseMoney(document.getElementById('accInitial').value);
  if (id) {
    const a = accountById(id);
    a.name = name; a.type = type; a.currency = currency;
    if (init != null) a.initialBalance = init;
    await put('accounts', a);
  } else {
    const a = { id: uid(), name, type, currency, initialBalance: init || 0 };
    state.accounts.push(a); await put('accounts', a);
  }
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
async function deleteAccount(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.accounts = state.accounts.filter((x) => x.id !== id);
  await del('accounts', id); renderAll(); showToast(t('toast.deleted'));
}
function openBalanceModal() {
  openModal(`
    <h3>${t('modal.addBalance')}</h3>
    <label>${t('tx.account')}</label>
    <select id="balAccount">${state.accounts.map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('')}</select>
    <label>${t('tx.month')}</label><input id="balDate" type="date" value="${todayISO()}">
    <label>${t('accounts.initialBalance')}</label><input id="balValue" type="text" inputmode="decimal">
    <button class="primary-btn" onclick="saveBalance()">${t('modal.save')}</button>`);
}
async function saveBalance() {
  const accountId = document.getElementById('balAccount').value;
  const date = document.getElementById('balDate').value;
  const value = parseMoney(document.getElementById('balValue').value);
  if (!accountId || !date || value == null) return;
  const b = { id: uid(), accountId, date, value };
  state.balances.push(b); await put('balances', b);
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
function openTxModal(id) {
  const trn = id ? state.transactions.find((x) => x.id === id) : null;
  const acc = trn ? accountById(trn.accountId) : null;
  openModal(`
    <h3>${trn ? t('modal.editTx') : t('modal.addTx')}</h3>
    <label>${t('tx.type')}</label>
    <select id="txType">
      <option value="income" ${trn && trn.type === 'income' ? 'selected' : ''}>${t('tx.income')}</option>
      <option value="expense" ${trn && trn.type === 'expense' ? 'selected' : ''}>${t('tx.expense')}</option>
      <option value="transfer" ${trn && trn.type === 'transfer' ? 'selected' : ''}>${t('tx.transfer')}</option>
    </select>
    <label>${t('tx.account')}</label>
    <select id="txAccount">${state.accounts.map((a) => `<option value="${a.id}" ${trn && trn.accountId === a.id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}</select>
    <label>${t('tx.month')}</label><input id="txDate" type="date" value="${trn ? trn.date : todayISO()}">
    <label>${t('tx.value')}</label><input id="txValue" type="text" inputmode="decimal" value="${trn ? trn.value : ''}">
    <label>${t('tx.description')}</label><input id="txDescription" value="${trn ? escapeHtml(trn.description || '') : ''}">
    <button class="primary-btn" onclick="saveTx('${id || ''}')">${t('modal.save')}</button>`);
}
async function saveTx(id) {
  const type = document.getElementById('txType').value;
  const accountId = document.getElementById('txAccount').value;
  const date = document.getElementById('txDate').value;
  const value = parseMoney(document.getElementById('txValue').value);
  const description = document.getElementById('txDescription').value.trim();
  if (!accountId || !date || value == null) return;
  if (id) {
    const trn = state.transactions.find((x) => x.id === id);
    trn.type = type; trn.accountId = accountId; trn.date = date; trn.value = value; trn.description = description;
    await put('transactions', trn);
  } else {
    const trn = { id: uid(), type, date, accountId, value, description };
    state.transactions.push(trn); await put('transactions', trn);
  }
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
async function deleteTx(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.transactions = state.transactions.filter((x) => x.id !== id);
  await del('transactions', id); renderAll(); showToast(t('toast.deleted'));
}
function openBudgetModal(id) {
  const b = id ? state.budgets.find((x) => x.id === id) : null;
  openModal(`
    <h3>${b ? t('modal.editBudget') : t('modal.addBudget')}</h3>
    <label>${t('tx.category')}</label>
    <select id="budCategory">${EXPENSE_CATEGORIES.map((c) => `<option value="${c.key}" ${b && b.category === c.key ? 'selected' : ''}>${c.key}</option>`).join('')}</select>
    <label>${t('accounts.currency')}</label>
    <select id="budCurrency">${CURRENCIES.map((c) => `<option value="${c.code}" ${b && b.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}</select>
    <label>${t('budget.amount')}</label><input id="budAmount" type="text" inputmode="decimal" value="${b ? b.amount : ''}">
    <button class="primary-btn" onclick="saveBudget('${id || ''}')">${t('modal.save')}</button>`);
}
async function saveBudget(id) {
  const category = document.getElementById('budCategory').value;
  const currency = document.getElementById('budCurrency').value;
  const amount = parseMoney(document.getElementById('budAmount').value);
  if (!category || !currency || amount == null) return;
  if (id) {
    const b = state.budgets.find((x) => x.id === id);
    b.category = category; b.currency = currency; b.amount = amount;
    await put('budgets', b);
  } else {
    const dup = state.budgets.find((x) => x.category === category && x.currency === currency);
    if (dup) { showToast(t('toast.saved')); return; }
    const b = { id: uid(), category, currency, amount };
    state.budgets.push(b); await put('budgets', b);
  }
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
async function deleteBudget(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.budgets = state.budgets.filter((x) => x.id !== id);
  await del('budgets', id); renderAll(); showToast(t('toast.deleted'));
}
function openFxModal(id) {
  const f = id ? state.fx.find((x) => x.id === id) : null;
  openModal(`
    <h3>${t('fx.title')}</h3>
    <label>${t('tx.month')}</label><input id="fxDate" type="date" value="${f ? f.date : todayISO()}">
    <label>${t('accounts.currency')}</label>
    <select id="fxCurrency">${CURRENCIES.filter((c) => c.code !== 'EUR').map((c) => `<option value="${c.code}" ${f && f.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}</select>
    <label>${t('fx.rate')}</label><input id="fxRate" type="text" inputmode="decimal" value="${f ? f.rate : ''}">
    <button class="primary-btn" onclick="saveFx('${id || ''}')">${t('modal.save')}</button>`);
}
async function saveFx(id) {
  const date = document.getElementById('fxDate').value;
  const currency = document.getElementById('fxCurrency').value;
  const rate = parseMoney(document.getElementById('fxRate').value);
  if (!date || !currency || rate == null) return;
  if (id) {
    const f = state.fx.find((x) => x.id === id);
    f.date = date; f.currency = currency; f.rate = rate;
    await put('fx', f);
  } else {
    const f = { id: uid(), date, currency, rate };
    state.fx.push(f); await put('fx', f);
  }
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
async function deleteFx(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.fx = state.fx.filter((x) => x.id !== id);
  await del('fx', id); renderAll(); showToast(t('toast.deleted'));
}
function openAssetModal(id) {
  const a = id ? state.assets.find((x) => x.id === id) : null;
  openModal(`
    <h3>${t('portfolio.properties')}</h3>
    <label>${t('accounts.name')}</label><input id="asName" value="${a ? escapeHtml(a.name) : ''}">
    <label>${t('accounts.type')}</label>
    <select id="asType">
      <option value="property" ${a && a.type === 'property' ? 'selected' : ''}>property</option>
      <option value="vehicle" ${a && a.type === 'vehicle' ? 'selected' : ''}>vehicle</option>
    </select>
    <label>${t('accounts.currency')}</label>
    <select id="asCurrency">${CURRENCIES.map((c) => `<option value="${c.code}" ${a && a.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}</select>
    <label>${t('tx.month')}</label><input id="asDate" type="date" value="${a ? a.acquiredDate : todayISO()}">
    <label>${t('accounts.initialBalance')}</label><input id="asValue" type="text" inputmode="decimal" value="${a ? a.acquiredValue : ''}">
    <label>${t('dashboard.debt')}</label><input id="asDebt" type="text" inputmode="decimal" value="${a ? a.acquiredDebt : ''}">
    <label>${t('portfolio.depreciation')}</label><input id="asDep" type="text" inputmode="decimal" value="${a && a.depreciation ? a.depreciation : ''}">
    <button class="primary-btn" onclick="saveAsset('${id || ''}')">${t('modal.save')}</button>`);
}
async function saveAsset(id) {
  const name = document.getElementById('asName').value.trim();
  const type = document.getElementById('asType').value;
  const currency = document.getElementById('asCurrency').value;
  const acquiredDate = document.getElementById('asDate').value;
  const acquiredValue = parseMoney(document.getElementById('asValue').value);
  const acquiredDebt = parseMoney(document.getElementById('asDebt').value) || 0;
  const depreciation = parseMoney(document.getElementById('asDep').value);
  if (!name || !currency || !acquiredDate) return;
  if (id) {
    const a = state.assets.find((x) => x.id === id);
    a.name = name; a.type = type; a.currency = currency; a.acquiredDate = acquiredDate;
    if (acquiredValue != null) a.acquiredValue = acquiredValue;
    a.acquiredDebt = acquiredDebt; a.depreciation = depreciation || 0;
    await put('assets', a);
  } else {
    const a = { id: uid(), type, name, currency, acquiredDate, acquiredValue: acquiredValue || 0, acquiredDebt, depreciation: depreciation || 0 };
    state.assets.push(a); await put('assets', a);
  }
  closeModal(); renderAll(); showToast(t('toast.saved'));
}
async function deleteAsset(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.assets = state.assets.filter((x) => x.id !== id);
  state.valuations = state.valuations.filter((v) => v.assetId !== id);
  await del('assets', id); renderAll(); showToast(t('toast.deleted'));
}
function openValuationModal(assetId) {
  const a = state.assets.find((x) => x.id === assetId);
  openModal(`
    <h3>${t('balances.add')} — ${escapeHtml(a.name)}</h3>
    <label>${t('tx.month')}</label><input id="valDate" type="date" value="${todayISO()}">
    <label>${t('accounts.initialBalance')}</label><input id="valValue" type="text" inputmode="decimal">
    <label>${t('dashboard.debt')}</label><input id="valDebt" type="text" inputmode="decimal">
    <button class="primary-btn" onclick="saveValuation('${assetId}')">${t('modal.save')}</button>`);
}
async function saveValuation(assetId) {
  const date = document.getElementById('valDate').value;
  const value = parseMoney(document.getElementById('valValue').value);
  const debt = parseMoney(document.getElementById('valDebt').value);
  if (!date || value == null) return;
  const v = { id: uid(), assetId, date, value, debt: debt || 0 };
  state.valuations.push(v); await put('valuations', v);
  closeModal(); renderAll(); showToast(t('toast.saved'));
}

/* ---------- Exportação / Importação ---------- */
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
async function exportJSON() {
  const data = { version: 4, exportedAt: new Date().toISOString(), ...state.settings,
    accounts: state.accounts, balances: state.balances, transactions: state.transactions,
    budgets: state.budgets, fx: state.fx, assets: state.assets, valuations: state.valuations };
  download('prof-controller-backup.json', JSON.stringify(data, null, 2), 'application/json');
  showToast(t('toast.exported'));
}
function exportCSV() {
  const header = ['Data', 'Conta', 'Moeda', 'Saldo'];
  const rows = state.balances.map((b) => {
    const acc = accountById(b.accountId);
    return [b.date, acc ? acc.name : '', acc ? acc.currency : '', String(b.value).replace('.', ',')];
  });
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  download(`prof-controller-saldos-${todayISO()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}
function exportTransactionsCSV() {
  const header = ['Data', 'Tipo', 'Conta', 'ContaDestino', 'Moeda', 'Categoria', 'Descricao', 'Valor'];
  const rows = state.transactions.map((trn) => {
    const acc = accountById(trn.accountId);
    const to = trn.toAccountId ? accountById(trn.toAccountId) : null;
    return [trn.date, trn.type, acc ? acc.name : '', to ? to.name : '', acc ? acc.currency : '', trn.category || '', trn.description || '', String(trn.value).replace('.', ',')];
  });
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  download(`prof-controller-transacoes-${todayISO()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}
async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const stores = ['accounts', 'balances', 'transactions', 'budgets', 'fx', 'assets', 'valuations'];
    for (const s of stores) if (Array.isArray(data[s])) for (const item of data[s]) await put(s, item);
    if (data.lang) { state.settings.lang = data.lang; await saveSetting('lang', data.lang); }
    if (data.theme) { state.settings.theme = data.theme; await saveSetting('theme', data.theme); }
    if (data.baseCurrency) { state.settings.baseCurrency = data.baseCurrency; await saveSetting('baseCurrency', data.baseCurrency); }
    await loadAll(); applyLang(); applyTheme(); renderAll(); showToast(t('toast.imported'));
  } catch (e) { console.error(e); showToast(t('toast.invalidFile')); }
}

/* ---------- Importação CSV (Data;Conta;Moeda;Saldo) ---------- */
function detectDelimiter(line) {
  const counts = { ';': 0, '\t': 0, ',': 0 };
  for (const ch of line) { if (ch in counts) counts[ch]++; }
  if (counts[';'] > 0) return ';';
  if (counts['\t'] > 0) return '\t';
  return ',';
}
function normalizeDate(d) {
  if (!d) return null;
  d = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const delim = detectDelimiter(lines[0] || '');
  const rows = [];
  for (const line of lines) {
    if (line.trim().startsWith('#')) continue;
    if (/GRAND\s+TOTAL/i.test(line)) continue;
    rows.push(line.split(delim).map((p) => p.trim()));
  }
  return rows;
}
async function importCSV(file) {
  try {
    const rows = parseCSV(await file.text());
    if (rows.length < 2) throw new Error('CSV vazio');
    let imported = 0, created = 0;
    for (const r of rows) {
      if (r.length < 4) continue;
      const date = normalizeDate(r[0]);
      const name = r[1];
      const curr = (r[2] || '').toUpperCase();
      const value = parseMoney(r[3]);
      if (!date || !name || !curr || value == null) continue;
      let account = state.accounts.find((a) => a.name.toLowerCase() === name.toLowerCase() && a.currency === curr);
      if (!account) {
        account = { id: uid(), name, type: 'bank', currency: curr, initialBalance: 0 };
        state.accounts.push(account); await put('accounts', account); created++;
      }
      const b = { id: uid(), accountId: account.id, date, value };
      state.balances.push(b); await put('balances', b); imported++;
    }
    await loadAll(); renderAll();
    showToast(t('toast.csvImported').replace('{n}', imported));
  } catch (e) { console.error(e); showToast(t('toast.invalidCSV')); }
}

/* ---------- Busca de taxas online ---------- */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('http-' + res.status);
  return res.json();
}
function normalizeFx(data, source) {
  const out = {};
  if (source === 'frankfurter.dev' || source === 'frankfurter.app') {
    for (const [k, v] of Object.entries(data.rates || {})) out[k] = v;
  } else if (source === 'jsDelivr') {
    for (const [k, v] of Object.entries(data)) {
      if (k === 'date' || k === 'updated') continue;
      out[k.toUpperCase()] = v;
    }
  } else if (source === 'open.er-api') {
    for (const [k, v] of Object.entries(data.rates || {})) out[k] = v;
  }
  return out;
}
async function fetchRates() {
  const date = todayISO();
  for (const src of FX_SOURCES) {
    try {
      const data = await fetchJson(src.url);
      const rates = normalizeFx(data, src.name);
      let count = 0;
      for (const cur of CURRENCIES) {
        if (cur.code === 'EUR' || rates[cur.code] == null) continue;
        const existing = state.fx.find((f) => f.currency === cur.code && f.date === date);
        if (existing) { existing.rate = rates[cur.code]; await put('fx', existing); }
        else { const f = { id: uid(), date, currency: cur.code, rate: rates[cur.code] }; state.fx.push(f); await put('fx', f); }
        count++;
      }
      if (count) { await loadAll(); renderAll(); showToast(t('toast.saved') + ' (' + count + ')'); return; }
    } catch (e) { /* próxima fonte */ }
  }
  showToast(t('nav.empty'));
}

/* ---------- FASE 5 — Dashboard de NAV ---------- */
function buildNAVSeries() {
  const dates = [];
  state.balances.forEach((b) => dates.push(b.date));
  state.transactions.forEach((trn) => dates.push(trn.date));
  state.fx.forEach((f) => dates.push(f.date));
  state.assets.forEach((a) => dates.push(a.acquiredDate));
  state.valuations.forEach((v) => dates.push(v.date));
  const valid = dates.filter(Boolean).map((d) => new Date(d + 'T00:00:00'));
  if (!valid.length) return null;
  const min = new Date(Math.min(...valid));
  const max = new Date(Math.max(...valid));
  const todayD = new Date();
  const points = [];
  const cur = new Date(min.getFullYear(), min.getMonth(), 1);
  while (cur <= max) {
    const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    if (end >= min) points.push(end.toISOString().slice(0, 10));
    cur.setMonth(cur.getMonth() + 1);
  }
  if (todayD > max) points.push(todayD.toISOString().slice(0, 10));
  const out = [];
  for (const D of points) {
    let financial = 0, properties = 0, vehicles = 0, debt = 0;
    for (const acct of state.accounts) {
      const v = toBase(accountBalanceAt(acct, D), acct.currency, D);
      if (v != null) financial += v;
    }
    for (const a of state.assets) {
      const at = assetAt(a, D);
      const val = toBase(at.value, a.currency, D);
      const dbt = toBase(at.debt, a.currency, D);
      if (val == null) continue;
      if (a.type === 'property') properties += val; else vehicles += val;
      if (dbt != null) debt += dbt;
    }
    out.push({ date: D, financial, properties, vehicles, debt, net: financial + properties + vehicles - debt });
  }
  return { points: out };
}
function renderNAV() {
  const wrap = document.getElementById('navChart');
  const tip = document.getElementById('navTip');
  const empty = document.getElementById('navEmpty');
  const legend = document.getElementById('navLegend');
  if (!wrap) return;
  const series = buildNAVSeries();
  if (!series || series.points.length < 2) {
    wrap.classList.add('hidden'); empty.classList.remove('hidden');
    empty.textContent = t('nav.empty'); return;
  }
  wrap.classList.remove('hidden'); empty.classList.add('hidden');
  const classes = [
    { key: 'net', label: t('nav.net'), color: '#e94560' },
    { key: 'financial', label: t('nav.financial'), color: '#2563eb' },
    { key: 'properties', label: t('nav.properties'), color: '#16a34a' },
    { key: 'vehicles', label: t('nav.vehicles'), color: '#f59e0b' },
    { key: 'debt', label: t('nav.debt'), color: '#b91c1c' }
  ];
  const visible = {};
  legend.innerHTML = '';
  classes.forEach((c) => {
    visible[c.key] = true;
    const lab = document.createElement('label');
    lab.innerHTML = `<input type="checkbox" checked data-k="${c.key}"><span class="swatch" style="background:${c.color}"></span>${c.label}`;
    lab.querySelector('input').addEventListener('change', (e) => { visible[e.target.dataset.k] = e.target.checked; draw(); });
    legend.appendChild(lab);
  });
  const W = 720, H = 320, padL = 64, padR = 16, padT = 16, padB = 34;
  function draw() {
    const pts = series.points;
    const all = classes.filter((c) => visible[c.key]);
    let min = Infinity, max = -Infinity;
    pts.forEach((p) => all.forEach((c) => { const v = p[c.key]; if (v < min) min = v; if (v > max) max = v; }));
    if (!isFinite(min)) min = 0;
    if (min === max) max = min + 1;
    const range = max - min; min -= range * 0.05; max += range * 0.05;
    const X = (i) => padL + (i / (pts.length - 1)) * (W - padL - padR);
    const Y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('nav.title')}">`;
    for (let g = 0; g <= 4; g++) {
      const val = min + (max - min) * g / 4, y = Y(val);
      svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtBase(val)}</text>`;
    }
    const step = Math.max(1, Math.floor(pts.length / 6));
    pts.forEach((p, i) => {
      if (i % step !== 0 && i !== pts.length - 1) return;
      svg += `<text x="${X(i)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="var(--muted)">${p.date.slice(0, 7)}</text>`;
    });
    all.forEach((c) => {
      let d = '';
      pts.forEach((p, i) => { d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[c.key]).toFixed(1) + ' '; });
      svg += `<path d="${d}" fill="none" stroke="${c.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    pts.forEach((p, i) => {
      svg += `<circle cx="${X(i)}" cy="${Y(p.net)}" r="3" fill="#e94560" data-i="${i}"/>`;
    });
    svg += '</svg>';
    wrap.innerHTML = svg;
    wrap.querySelectorAll('circle').forEach((c) => {
      c.addEventListener('mouseenter', () => {
        const p = pts[+c.dataset.i];
        let html = `<b>${p.date}</b>`;
        classes.forEach((cc) => { if (visible[cc.key]) html += `<br>${cc.label}: ${fmtBase(p[cc.key])}`; });
        tip.innerHTML = html; tip.classList.remove('hidden');
      });
      c.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        tip.style.left = Math.min(e.clientX - r.left + 12, r.width - 140) + 'px';
        tip.style.top = (e.clientY - r.top - 10) + 'px';
      });
      c.addEventListener('mouseleave', () => tip.classList.add('hidden'));
    });
  }
  draw();
}

/* ---------- i18n / tema ---------- */
function applyLang() {
  document.documentElement.lang = state.settings.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langSelect').value = state.settings.lang;
  renderAll();
}
function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.getElementById('themeSelect').value = state.settings.theme;
}

/* ---------- Eventos ---------- */
function bindEvents() {
  document.getElementById('langSelect').addEventListener('change', async (e) => {
    state.settings.lang = e.target.value; await saveSetting('lang', e.target.value); applyLang();
  });
  document.getElementById('themeSelect').addEventListener('change', async (e) => {
    state.settings.theme = e.target.value; await saveSetting('theme', e.target.value); applyTheme();
  });
  document.getElementById('baseCurrencySelect').addEventListener('change', async (e) => {
    state.settings.baseCurrency = e.target.value; await saveSetting('baseCurrency', e.target.value); renderAll();
  });
  document.getElementById('btnAddAccount').addEventListener('click', () => openAccountModal());
  document.getElementById('btnAddBalance').addEventListener('click', openBalanceModal);
  document.getElementById('btnAddTx').addEventListener('click', () => openTxModal());
  document.getElementById('btnAddBudget').addEventListener('click', () => openBudgetModal());
  document.getElementById('btnAddProperty').addEventListener('click', () => openAssetModal());
  document.getElementById('btnAddVehicle').addEventListener('click', () => openAssetModal());
  document.getElementById('btnFetchRates').addEventListener('click', fetchRates);
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnExportTxCSV').addEventListener('click', exportTransactionsCSV);
  document.getElementById('btnImportJSON').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; });
  document.getElementById('btnImportCSV').addEventListener('click', () => document.getElementById('importCSVFile').click());
  document.getElementById('importCSVFile').addEventListener('change', (e) => { if (e.target.files[0]) importCSV(e.target.files[0]); e.target.value = ''; });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.getElementById('txFilterType').addEventListener('change', (e) => { state.ui.txType = e.target.value; renderTransactions(); });
  document.getElementById('txFilterAccount').addEventListener('change', (e) => { state.ui.txAccount = e.target.value; renderTransactions(); });
  document.getElementById('txFilterMonth').addEventListener('change', (e) => { state.ui.txMonth = e.target.value; renderTransactions(); });
  document.getElementById('btnClearTxFilters').addEventListener('click', () => {
    state.ui.txType = 'all'; state.ui.txAccount = 'all'; state.ui.txMonth = '';
    document.getElementById('txFilterType').value = 'all';
    document.getElementById('txFilterAccount').value = 'all';
    document.getElementById('txFilterMonth').value = '';
    renderTransactions();
  });
  document.getElementById('budgetMonth').addEventListener('change', (e) => { state.ui.budgetMonth = e.target.value; renderBudgets(); });
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      state.ui.currentTab = btn.dataset.tab;
    });
  });
}

/* ---------- Inicialização ---------- */
async function init() {
  try {
    await openDB();
    await loadAll();
  } catch (e) {
    const b = document.createElement('div');
    b.className = 'fatal-banner';
    b.textContent = 'Erro ao abrir o banco de dados. Feche outras janelas do app e recarregue.';
    document.body.prepend(b);
    return;
  }
  state.ui.budgetMonth = currentMonth();
  const langSel = document.getElementById('langSelect');
  langSel.innerHTML = Object.keys(I18N).map((l) => `<option value="${l}">${l}</option>`).join('');
  const themeSel = document.getElementById('themeSelect');
  themeSel.innerHTML = ['default', 'dark', 'green', 'blue'].map((th) => `<option value="${th}">${th}</option>`).join('');
  applyLang();
  applyTheme();
  bindEvents();
  renderAll();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}
document.addEventListener('DOMContentLoaded', init);
