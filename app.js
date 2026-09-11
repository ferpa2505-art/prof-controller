/* ============================================================
   ProF Controller — Fase 1 (Fundação)
   Gestão patrimonial: contas, 5 moedas, saldos diários,
   moeda base configurável, importação CSV, i18n, offline.
   ============================================================ */

/* ---------- i18n: pt-BR (padrão), en, es ---------- */
const I18N = {
  'pt-BR': {
    'dashboard.totalEquity': 'Patrimônio Total',
    'dashboard.accounts': 'Contas',
    'dashboard.currencies': 'Moedas',
    'dashboard.baseCurrency': 'Moeda base',
    'accounts.title': 'Contas',
    'accounts.add': '+ Nova conta',
    'accounts.name': 'Nome',
    'accounts.type': 'Tipo',
    'accounts.currency': 'Moeda',
    'accounts.initialBalance': 'Saldo inicial',
    'accounts.actions': 'Ações',
    'accounts.type.bank': 'Bancária',
    'accounts.type.wallet': 'Carteira',
    'accounts.type.broker': 'Corretora',
    'accounts.type.cash': 'Caixa',
    'accounts.type.liquidity': 'Liquidez',
    'balances.title': 'Saldos Diários',
    'balances.add': '+ Registrar saldo',
    'balances.date': 'Data',
    'balances.balance': 'Saldo',
    'settings.title': 'Configurações',
    'settings.baseCurrency': 'Moeda base',
    'settings.baseCurrencyHint': 'Moeda usada para consolidar patrimônio e relatórios.',
    'settings.backup': 'Backup dos dados',
    'settings.exportJSON': 'Exportar backup (JSON)',
    'settings.exportCSV': 'Exportar planilha (CSV)',
    'settings.importJSON': 'Importar backup',
    'settings.importCSV': 'Importar planilha (CSV)',
    'settings.importCSVHint': 'Formato: Data;Conta;Moeda;Saldo (AAAA-MM-DD).',
    'toast.saved': 'Salvo com sucesso.',
    'toast.exported': 'Arquivo exportado.',
    'toast.imported': 'Backup importado.',
    'toast.invalidFile': 'Arquivo inválido.',
    'toast.csvImported': '{n} saldos importados.',
    'toast.invalidCSV': 'Arquivo CSV inválido.',
    'modal.addAccount': 'Nova conta',
    'modal.editAccount': 'Editar conta',
    'modal.addBalance': 'Registrar saldo diário',
    'modal.save': 'Salvar',
    'modal.cancel': 'Cancelar',
    'modal.delete': 'Excluir'
  },
  'en': {
    'dashboard.totalEquity': 'Total Equity',
    'dashboard.accounts': 'Accounts',
    'dashboard.currencies': 'Currencies',
    'dashboard.baseCurrency': 'Base currency',
    'accounts.title': 'Accounts',
    'accounts.add': '+ New account',
    'accounts.name': 'Name',
    'accounts.type': 'Type',
    'accounts.currency': 'Currency',
    'accounts.initialBalance': 'Initial balance',
    'accounts.actions': 'Actions',
    'accounts.type.bank': 'Bank',
    'accounts.type.wallet': 'Wallet',
    'accounts.type.broker': 'Broker',
    'accounts.type.cash': 'Cash',
    'accounts.type.liquidity': 'Liquidity',
    'balances.title': 'Daily Balances',
    'balances.add': '+ Record balance',
    'balances.date': 'Date',
    'balances.balance': 'Balance',
    'settings.title': 'Settings',
    'settings.baseCurrency': 'Base currency',
    'settings.baseCurrencyHint': 'Currency used to consolidate equity and reports.',
    'settings.backup': 'Data backup',
    'settings.exportJSON': 'Export backup (JSON)',
    'settings.exportCSV': 'Export spreadsheet (CSV)',
    'settings.importJSON': 'Import backup',
    'settings.importCSV': 'Import spreadsheet (CSV)',
    'settings.importCSVHint': 'Format: Date;Account;Currency;Balance (YYYY-MM-DD).',
    'toast.saved': 'Saved successfully.',
    'toast.exported': 'File exported.',
    'toast.imported': 'Backup imported.',
    'toast.invalidFile': 'Invalid file.',
    'toast.csvImported': '{n} balances imported.',
    'toast.invalidCSV': 'Invalid CSV file.',
    'modal.addAccount': 'New account',
    'modal.editAccount': 'Edit account',
    'modal.addBalance': 'Record daily balance',
    'modal.save': 'Save',
    'modal.cancel': 'Cancel',
    'modal.delete': 'Delete'
  },
  'es': {
    'dashboard.totalEquity': 'Patrimonio Total',
    'dashboard.accounts': 'Cuentas',
    'dashboard.currencies': 'Monedas',
    'dashboard.baseCurrency': 'Moneda base',
    'accounts.title': 'Cuentas',
    'accounts.add': '+ Nueva cuenta',
    'accounts.name': 'Nombre',
    'accounts.type': 'Tipo',
    'accounts.currency': 'Moneda',
    'accounts.initialBalance': 'Saldo inicial',
    'accounts.actions': 'Acciones',
    'accounts.type.bank': 'Bancaria',
    'accounts.type.wallet': 'Cartera',
    'accounts.type.broker': 'Corredor',
    'accounts.type.cash': 'Efectivo',
    'accounts.type.liquidity': 'Liquidez',
    'balances.title': 'Saldos Diarios',
    'balances.add': '+ Registrar saldo',
    'balances.date': 'Fecha',
    'balances.balance': 'Saldo',
    'settings.title': 'Configuración',
    'settings.baseCurrency': 'Moneda base',
    'settings.baseCurrencyHint': 'Moneda usada para consolidar patrimonio e informes.',
    'settings.backup': 'Respaldo de datos',
    'settings.exportJSON': 'Exportar respaldo (JSON)',
    'settings.exportCSV': 'Exportar hoja de cálculo (CSV)',
    'settings.importJSON': 'Importar respaldo',
    'settings.importCSV': 'Importar hoja de cálculo (CSV)',
    'settings.importCSVHint': 'Formato: Fecha;Cuenta;Moneda;Saldo (AAAA-MM-DD).',
    'toast.saved': 'Guardado correctamente.',
    'toast.exported': 'Archivo exportado.',
    'toast.imported': 'Respaldo importado.',
    'toast.invalidFile': 'Archivo inválido.',
    'toast.csvImported': '{n} saldos importados.',
    'toast.invalidCSV': 'Archivo CSV inválido.',
    'modal.addAccount': 'Nueva cuenta',
    'modal.editAccount': 'Editar cuenta',
    'modal.addBalance': 'Registrar saldo diario',
    'modal.save': 'Guardar',
    'modal.cancel': 'Cancelar',
    'modal.delete': 'Eliminar'
  }
};

/* ---------- Estado e persistência (IndexedDB) ---------- */
const DB_NAME = 'prof-controller';
const DB_VERSION = 1;
let db = null;
let state = {
  accounts: [],
  balances: [],
  settings: { lang: 'pt-BR', theme: 'default', baseCurrency: 'EUR' }
};

const CURRENCIES = [
  { code: 'EUR', symbol: '€', decimals: 2 },
  { code: 'CHF', symbol: 'CHF ', decimals: 2 },
  { code: 'USD', symbol: 'US$', decimals: 2 },
  { code: 'JPY', symbol: '¥', decimals: 0 },
  { code: 'GBP', symbol: '£', decimals: 2 },
  { code: 'BRL', symbol: 'R$', decimals: 2 }
];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      // Fase 1
      if (!d.objectStoreNames.contains('accounts')) d.createObjectStore('accounts', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('balances')) {
        const s = d.createObjectStore('balances', { keyPath: 'id' });
        s.createIndex('date', 'date');
        s.createIndex('accountId', 'accountId');
      }
      if (!d.objectStoreNames.contains('settings')) d.createObjectStore('settings', { keyPath: 'key' });
      // Preparado para fases futuras (patrimônio)
      ['fx', 'receitas', 'lancamentos', 'imoveis', 'veiculos', 'posicoes', 'nav', 'orcamentos']
        .forEach((name) => { if (!d.objectStoreNames.contains(name)) d.createObjectStore(name, { keyPath: 'id' }); });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode) { return db.transaction(store, mode).objectStore(store); }

async function loadAll() {
  state.accounts = await getAll('accounts');
  state.balances = await getAll('balances');
  const settings = await getAll('settings');
  settings.forEach((s) => { state.settings[s.key] = s.value; });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readonly').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
function put(store, value) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function del(store, id) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------- Utilidades ---------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function t(key) {
  const lang = state.settings.lang || 'pt-BR';
  return (I18N[lang] && I18N[lang][key]) || I18N['pt-BR'][key] || key;
}
function currency(code) { return CURRENCIES.find((c) => c.code === code) || { code, symbol: code + ' ', decimals: 2 }; }
function fmtMoney(value, code) {
  const c = currency(code);
  return c.symbol + ' ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals });
}
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
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

/* ---------- Renderização ---------- */
function renderAll() { renderDashboard(); renderAccounts(); renderBalances(); renderSettings(); }

function renderDashboard() {
  const base = state.settings.baseCurrency;
  // Total por moeda (soma dos saldos iniciais das contas)
  const byCurrency = {};
  state.accounts.forEach((a) => {
    byCurrency[a.currency] = (byCurrency[a.currency] || 0) + (Number(a.initialBalance) || 0);
  });
  // Sem tabela de câmbio na Fase 1, mostramos o total na moeda base apenas se houver 1 moeda;
  // caso contrário, mostramos o breakdown por moeda.
  const keys = Object.keys(byCurrency);
  if (keys.length === 1) {
    document.getElementById('totalEquity').textContent = fmtMoney(byCurrency[keys[0]], keys[0]);
    document.getElementById('totalEquityBase').textContent = '';
  } else {
    document.getElementById('totalEquity').textContent = '—';
    document.getElementById('totalEquityBase').textContent = keys.map((k) => fmtMoney(byCurrency[k], k)).join(' · ');
  }
  document.getElementById('accountCount').textContent = state.accounts.length;
  document.getElementById('currencyCount').textContent = new Set(state.accounts.map((a) => a.currency)).size;
  document.getElementById('baseCurrencyLabel').textContent = base;
}

function renderAccounts() {
  const tbody = document.querySelector('#accountsTable tbody');
  tbody.innerHTML = '';
  state.accounts.forEach((a) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(a.name)}</td>
      <td>${t('accounts.type.' + a.type)}</td>
      <td>${a.currency}</td>
      <td>${fmtMoney(a.initialBalance, a.currency)}</td>
      <td>
        <button class="secondary-btn" onclick="openAccountModal('${a.id}')">${t('modal.editAccount')}</button>
        <button class="secondary-btn" onclick="deleteAccount('${a.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderBalances() {
  const thead = document.querySelector('#balancesTable thead tr');
  const tbody = document.querySelector('#balancesTable tbody');
  thead.innerHTML = `<th>${t('balances.date')}</th>` +
    state.accounts.map((a) => `<th>${escapeHtml(a.name)}</th>`).join('');
  tbody.innerHTML = '';
  const dates = [...new Set(state.balances.map((b) => b.date))].sort();
  dates.forEach((date) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><strong>${date}</strong></td>` +
      state.accounts.map((a) => {
        const b = state.balances.find((x) => x.date === date && x.accountId === a.id);
        return `<td>${b ? fmtMoney(b.value, a.currency) : '—'}</td>`;
      }).join('');
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
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

function openAccountModal(id) {
  const a = id ? state.accounts.find((x) => x.id === id) : null;
  openModal(`
    <h2>${a ? t('modal.editAccount') : t('modal.addAccount')}</h2>
    <label>${t('accounts.name')}</label>
    <input id="accName" value="${a ? escapeHtml(a.name) : ''}">
    <label>${t('accounts.type')}</label>
    <select id="accType">
      <option value="bank" ${a && a.type === 'bank' ? 'selected' : ''}>${t('accounts.type.bank')}</option>
      <option value="liquidity" ${a && a.type === 'liquidity' ? 'selected' : ''}>${t('accounts.type.liquidity')}</option>
      <option value="wallet" ${a && a.type === 'wallet' ? 'selected' : ''}>${t('accounts.type.wallet')}</option>
      <option value="broker" ${a && a.type === 'broker' ? 'selected' : ''}>${t('accounts.type.broker')}</option>
      <option value="cash" ${a && a.type === 'cash' ? 'selected' : ''}>${t('accounts.type.cash')}</option>
    </select>
    <label>${t('accounts.currency')}</label>
    <select id="accCurrency">
      ${CURRENCIES.map((c) => `<option value="${c.code}" ${a && a.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}
    </select>
    <label>${t('accounts.initialBalance')}</label>
    <input id="accBalance" type="number" step="0.01" value="${a ? a.initialBalance : '0'}">
    <button class="primary-btn" onclick="saveAccount('${a ? a.id : ''}')">${t('modal.save')}</button>
  `);
}

async function saveAccount(id) {
  const name = document.getElementById('accName').value.trim();
  if (!name) return;
  const account = {
    id: id || uid(),
    name,
    type: document.getElementById('accType').value,
    currency: document.getElementById('accCurrency').value,
    initialBalance: Number(document.getElementById('accBalance').value) || 0
  };
  if (id) state.accounts = state.accounts.map((x) => (x.id === id ? account : x));
  else state.accounts.push(account);
  await put('accounts', account);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteAccount(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.accounts = state.accounts.filter((x) => x.id !== id);
  state.balances = state.balances.filter((x) => x.accountId !== id);
  await del('accounts', id);
  renderAll();
  showToast(t('toast.saved'));
}

function openBalanceModal() {
  openModal(`
    <h2>${t('modal.addBalance')}</h2>
    <label>${t('balances.date')}</label>
    <input id="balDate" type="date" value="${todayISO()}">
    <label>${t('accounts.name')}</label>
    <select id="balAccount">
      ${state.accounts.map((a) => `<option value="${a.id}">${escapeHtml(a.name)} (${a.currency})</option>`).join('')}
    </select>
    <label>${t('balances.balance')}</label>
    <input id="balValue" type="number" step="0.01">
    <button class="primary-btn" onclick="saveBalance()">${t('modal.save')}</button>
  `);
}

async function saveBalance() {
  const date = document.getElementById('balDate').value;
  const accountId = document.getElementById('balAccount').value;
  const value = Number(document.getElementById('balValue').value);
  if (!date || !accountId || isNaN(value)) return;
  const existing = state.balances.find((x) => x.date === date && x.accountId === accountId);
  const balance = { id: existing ? existing.id : uid(), date, accountId, value };
  if (existing) state.balances = state.balances.map((x) => (x.id === existing.id ? balance : x));
  else state.balances.push(balance);
  await put('balances', balance);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

/* ---------- Exportação / Importação ---------- */
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function exportJSON() {
  const data = { version: 1, exportedAt: new Date().toISOString(), accounts: state.accounts, balances: state.balances, settings: state.settings };
  download(`prof-controller-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
  showToast(t('toast.exported'));
}

function exportCSV() {
  const header = ['Data', 'Conta', 'Moeda', 'Saldo'];
  const rows = state.balances.map((b) => {
    const acc = state.accounts.find((a) => a.id === b.accountId);
    return [b.date, acc ? acc.name : '', acc ? acc.currency : '', String(b.value).replace('.', ',')];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  download(`prof-controller-saldos-${todayISO()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.accounts || !data.balances) throw new Error('invalid');
    for (const a of data.accounts) await put('accounts', a);
    for (const b of data.balances) await put('balances', b);
    if (data.settings) {
      for (const [k, v] of Object.entries(data.settings)) {
        await put('settings', { key: k, value: v });
        state.settings[k] = v;
      }
    }
    await loadAll();
    applyLang();
    applyTheme();
    renderAll();
    showToast(t('toast.imported'));
  } catch (e) {
    showToast(t('toast.invalidFile'));
  }
}

/* ---------- Importação CSV (Data;Conta;Moeda;Saldo) ---------- */
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows = [];
  for (const line of lines) {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ';') {
        cells.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

function normalizeDate(d) {
  d = d.trim();
  // AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  // DD/MM/AAAA ou DD-MM-AAAA
  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

async function importCSV(file) {
  try {
    const rows = parseCSV(await file.text());
    if (rows.length < 2) throw new Error('vazio');
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const iDate = header.findIndex((h) => h === 'data' || h.includes('date'));
    const iAccount = header.findIndex((h) => h === 'conta' || h.includes('account'));
    const iCurrency = header.findIndex((h) => h === 'moeda' || h.includes('currency'));
    const iValue = header.findIndex((h) => h === 'saldo' || h.includes('balance') || h === 'valor');
    if (iDate < 0 || iAccount < 0 || iValue < 0) throw new Error('formato');

    let imported = 0;
    let created = 0;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length < 2) continue;
      const date = normalizeDate(row[iDate] || '');
      const accountName = (row[iAccount] || '').trim();
      const currency = ((row[iCurrency] || '').trim() || 'EUR').toUpperCase();
      let clean = (row[iValue] || '').trim();
      if (clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
      const value = Number(clean);
      if (!date || !accountName || isNaN(value)) continue;

      let account = state.accounts.find(
        (a) => a.name.toLowerCase() === accountName.toLowerCase() && a.currency === currency
      );
      if (!account) {
        account = { id: uid(), name: accountName, type: 'bank', currency, initialBalance: 0 };
        state.accounts.push(account);
        await put('accounts', account);
        created++;
      }
      const existing = state.balances.find((b) => b.date === date && b.accountId === account.id);
      const balance = { id: existing ? existing.id : uid(), date, accountId: account.id, value };
      if (existing) state.balances = state.balances.map((b) => (b.id === existing.id ? balance : b));
      else state.balances.push(balance);
      await put('balances', balance);
      imported++;
    }
    renderAll();
    showToast(t('toast.csvImported').replace('{n}', imported + (created ? ' (' + created + ' novas contas)' : '')));
  } catch (e) {
    showToast(t('toast.invalidCSV'));
  }
}

/* ---------- Eventos ---------- */
function bindEvents() {
  document.getElementById('langSelect').addEventListener('change', async (e) => {
    state.settings.lang = e.target.value;
    await put('settings', { key: 'lang', value: e.target.value });
    applyLang();
  });
  document.getElementById('themeSelect').addEventListener('change', async (e) => {
    state.settings.theme = e.target.value;
    await put('settings', { key: 'theme', value: e.target.value });
    applyTheme();
  });
  document.getElementById('baseCurrencySelect').addEventListener('change', async (e) => {
    state.settings.baseCurrency = e.target.value;
    await put('settings', { key: 'baseCurrency', value: e.target.value });
    renderAll();
  });
  document.getElementById('btnAddAccount').addEventListener('click', () => openAccountModal());
  document.getElementById('btnAddBalance').addEventListener('click', openBalanceModal);
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnImportJSON').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btnImportCSV').addEventListener('click', () => document.getElementById('importCSVFile').click());
  document.getElementById('importCSVFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importCSV(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

/* ---------- Inicialização ---------- */
async function init() {
  await openDB();
  await loadAll();
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

init();
