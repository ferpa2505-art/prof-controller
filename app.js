/* ============================================================
   ProF Controller — Fase 1 (Fundação) + Fase 2 (Transações e Orçamentos)

   Fase 1: contas, moedas, saldos diários, moeda base, importação CSV,
           i18n (pt-BR/en/es), temas, offline.
   Fase 2: transações (receita / despesa / transferência), orçamentos
           mensais com moeda própria, filtros e resumo no dashboard.

   REGRA DE SALDO (importante):
   O saldo de uma conta é CALCULADO, nunca sobrescrito.
     saldo atual = último saldo registrado (âncora) + transações posteriores
   Assim o saldo se move a cada lançamento e uma nova importação de CSV
   apenas cria uma âncora mais recente, sem duplicar valores.
   ============================================================ */

/* ---------- i18n: pt-BR (padrão), en, es ---------- */
const I18N = {
  'pt-BR': {
    'tabs.dashboard': 'Dashboard',
    'tabs.accounts': 'Contas',
    'tabs.balances': 'Saldos Diários',
    'tabs.transactions': 'Transações',
    'tabs.budgets': 'Orçamentos',
    'tabs.settings': 'Configurações',
    'dashboard.totalEquity': 'Patrimônio Total',
    'dashboard.accounts': 'Contas',
    'dashboard.currencies': 'Moedas',
    'dashboard.baseCurrency': 'Moeda base',
    'dashboard.income': 'Receitas do mês',
    'dashboard.expense': 'Despesas do mês',
    'dashboard.result': 'Resultado do mês',
    'accounts.title': 'Contas',
    'accounts.add': '+ Nova conta',
    'accounts.name': 'Nome',
    'accounts.type': 'Tipo',
    'accounts.currency': 'Moeda',
    'accounts.initialBalance': 'Saldo inicial',
    'accounts.currentBalance': 'Saldo atual',
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
    'tx.title': 'Transações',
    'tx.add': '+ Novo lançamento',
    'tx.date': 'Data',
    'tx.type': 'Tipo',
    'tx.account': 'Conta',
    'tx.toAccount': 'Conta de destino',
    'tx.category': 'Categoria',
    'tx.description': 'Descrição',
    'tx.value': 'Valor',
    'tx.receivedValue': 'Valor recebido no destino',
    'tx.receivedHint': 'Preencha se a conta de destino usa outra moeda.',
    'tx.income': 'Receita',
    'tx.expense': 'Despesa',
    'tx.transfer': 'Transferência',
    'tx.all': 'Todos',
    'tx.allMonths': 'Todos os meses',
    'tx.month': 'Mês',
    'tx.clearFilters': 'Limpar filtros',
    'tx.empty': 'Nenhum lançamento neste filtro. Use "Novo lançamento" para começar.',
    'tx.noAccounts': 'Cadastre uma conta antes de registrar lançamentos.',
    'budget.title': 'Orçamentos',
    'budget.add': '+ Novo orçamento',
    'budget.hint': 'Cada orçamento tem moeda própria e vale todos os meses. O gasto considera apenas despesas na mesma moeda.',
    'budget.category': 'Categoria',
    'budget.currency': 'Moeda',
    'budget.limit': 'Limite mensal',
    'budget.spent': 'Gasto',
    'budget.remaining': 'Restante',
    'budget.over': 'Excedido em',
    'budget.month': 'Mês',
    'budget.empty': 'Nenhum orçamento criado. Use "Novo orçamento" para definir um limite mensal.',
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
    'toast.deleted': 'Excluído.',
    'toast.exported': 'Arquivo exportado.',
    'toast.imported': 'Backup importado.',
    'toast.invalidFile': 'Arquivo inválido.',
    'toast.csvImported': '{n} saldos importados.',
    'toast.invalidCSV': 'Arquivo CSV inválido.',
    'modal.addAccount': 'Nova conta',
    'modal.editAccount': 'Editar conta',
    'modal.addBalance': 'Registrar saldo diário',
    'modal.addTx': 'Novo lançamento',
    'modal.editTx': 'Editar lançamento',
    'modal.addBudget': 'Novo orçamento',
    'modal.editBudget': 'Editar orçamento',
    'modal.save': 'Salvar',
    'modal.edit': 'Editar',
    'modal.cancel': 'Cancelar',
    'modal.delete': 'Excluir'
  },
  'en': {
    'tabs.dashboard': 'Dashboard',
    'tabs.accounts': 'Accounts',
    'tabs.balances': 'Daily Balances',
    'tabs.transactions': 'Transactions',
    'tabs.budgets': 'Budgets',
    'tabs.settings': 'Settings',
    'dashboard.totalEquity': 'Total Equity',
    'dashboard.accounts': 'Accounts',
    'dashboard.currencies': 'Currencies',
    'dashboard.baseCurrency': 'Base currency',
    'dashboard.income': 'Income this month',
    'dashboard.expense': 'Expenses this month',
    'dashboard.result': 'Net this month',
    'accounts.title': 'Accounts',
    'accounts.add': '+ New account',
    'accounts.name': 'Name',
    'accounts.type': 'Type',
    'accounts.currency': 'Currency',
    'accounts.initialBalance': 'Initial balance',
    'accounts.currentBalance': 'Current balance',
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
    'tx.title': 'Transactions',
    'tx.add': '+ New entry',
    'tx.date': 'Date',
    'tx.type': 'Type',
    'tx.account': 'Account',
    'tx.toAccount': 'Destination account',
    'tx.category': 'Category',
    'tx.description': 'Description',
    'tx.value': 'Amount',
    'tx.receivedValue': 'Amount received',
    'tx.receivedHint': 'Fill in if the destination account uses another currency.',
    'tx.income': 'Income',
    'tx.expense': 'Expense',
    'tx.transfer': 'Transfer',
    'tx.all': 'All',
    'tx.allMonths': 'All months',
    'tx.month': 'Month',
    'tx.clearFilters': 'Clear filters',
    'tx.empty': 'No entries for this filter. Use "New entry" to start.',
    'tx.noAccounts': 'Create an account before recording entries.',
    'budget.title': 'Budgets',
    'budget.add': '+ New budget',
    'budget.hint': 'Each budget has its own currency and applies every month. Spending counts only expenses in the same currency.',
    'budget.category': 'Category',
    'budget.currency': 'Currency',
    'budget.limit': 'Monthly limit',
    'budget.spent': 'Spent',
    'budget.remaining': 'Remaining',
    'budget.over': 'Over by',
    'budget.month': 'Month',
    'budget.empty': 'No budgets yet. Use "New budget" to set a monthly limit.',
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
    'toast.deleted': 'Deleted.',
    'toast.exported': 'File exported.',
    'toast.imported': 'Backup imported.',
    'toast.invalidFile': 'Invalid file.',
    'toast.csvImported': '{n} balances imported.',
    'toast.invalidCSV': 'Invalid CSV file.',
    'modal.addAccount': 'New account',
    'modal.editAccount': 'Edit account',
    'modal.addBalance': 'Record daily balance',
    'modal.addTx': 'New entry',
    'modal.editTx': 'Edit entry',
    'modal.addBudget': 'New budget',
    'modal.editBudget': 'Edit budget',
    'modal.save': 'Save',
    'modal.edit': 'Edit',
    'modal.cancel': 'Cancel',
    'modal.delete': 'Delete'
  },
  'es': {
    'tabs.dashboard': 'Panel',
    'tabs.accounts': 'Cuentas',
    'tabs.balances': 'Saldos Diarios',
    'tabs.transactions': 'Transacciones',
    'tabs.budgets': 'Presupuestos',
    'tabs.settings': 'Configuración',
    'dashboard.totalEquity': 'Patrimonio Total',
    'dashboard.accounts': 'Cuentas',
    'dashboard.currencies': 'Monedas',
    'dashboard.baseCurrency': 'Moneda base',
    'dashboard.income': 'Ingresos del mes',
    'dashboard.expense': 'Gastos del mes',
    'dashboard.result': 'Resultado del mes',
    'accounts.title': 'Cuentas',
    'accounts.add': '+ Nueva cuenta',
    'accounts.name': 'Nombre',
    'accounts.type': 'Tipo',
    'accounts.currency': 'Moneda',
    'accounts.initialBalance': 'Saldo inicial',
    'accounts.currentBalance': 'Saldo actual',
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
    'tx.title': 'Transacciones',
    'tx.add': '+ Nuevo registro',
    'tx.date': 'Fecha',
    'tx.type': 'Tipo',
    'tx.account': 'Cuenta',
    'tx.toAccount': 'Cuenta de destino',
    'tx.category': 'Categoría',
    'tx.description': 'Descripción',
    'tx.value': 'Importe',
    'tx.receivedValue': 'Importe recibido',
    'tx.receivedHint': 'Complete si la cuenta de destino usa otra moneda.',
    'tx.income': 'Ingreso',
    'tx.expense': 'Gasto',
    'tx.transfer': 'Transferencia',
    'tx.all': 'Todos',
    'tx.allMonths': 'Todos los meses',
    'tx.month': 'Mes',
    'tx.clearFilters': 'Limpiar filtros',
    'tx.empty': 'Sin registros para este filtro. Use "Nuevo registro" para empezar.',
    'tx.noAccounts': 'Cree una cuenta antes de registrar movimientos.',
    'budget.title': 'Presupuestos',
    'budget.add': '+ Nuevo presupuesto',
    'budget.hint': 'Cada presupuesto tiene su moneda y vale todos los meses. El gasto considera solo gastos en la misma moneda.',
    'budget.category': 'Categoría',
    'budget.currency': 'Moneda',
    'budget.limit': 'Límite mensual',
    'budget.spent': 'Gastado',
    'budget.remaining': 'Restante',
    'budget.over': 'Excedido en',
    'budget.month': 'Mes',
    'budget.empty': 'Sin presupuestos. Use "Nuevo presupuesto" para definir un límite mensual.',
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
    'toast.deleted': 'Eliminado.',
    'toast.exported': 'Archivo exportado.',
    'toast.imported': 'Respaldo importado.',
    'toast.invalidFile': 'Archivo inválido.',
    'toast.csvImported': '{n} saldos importados.',
    'toast.invalidCSV': 'Archivo CSV inválido.',
    'modal.addAccount': 'Nueva cuenta',
    'modal.editAccount': 'Editar cuenta',
    'modal.addBalance': 'Registrar saldo diario',
    'modal.addTx': 'Nuevo registro',
    'modal.editTx': 'Editar registro',
    'modal.addBudget': 'Nuevo presupuesto',
    'modal.editBudget': 'Editar presupuesto',
    'modal.save': 'Guardar',
    'modal.edit': 'Editar',
    'modal.cancel': 'Cancelar',
    'modal.delete': 'Eliminar'
  }
};

/* ---------- Categorias (Fase 2) ----------
   Guardadas por chave; o rótulo é traduzido. Assim a categoria
   continua correta se você trocar o idioma do app. */
const CATEGORY_GROUPS = {
  housing:  { 'pt-BR': 'Moradia & Imóveis', en: 'Housing & Property', es: 'Vivienda e Inmuebles' },
  daily:    { 'pt-BR': 'Dia a dia', en: 'Everyday', es: 'Día a día' },
  health:   { 'pt-BR': 'Saúde', en: 'Health', es: 'Salud' },
  edu:      { 'pt-BR': 'Educação', en: 'Education', es: 'Educación' },
  business: { 'pt-BR': 'Negócio / Freelance', en: 'Business / Freelance', es: 'Negocio / Freelance' },
  invest:   { 'pt-BR': 'Investimentos', en: 'Investments', es: 'Inversiones' },
  taxes:    { 'pt-BR': 'Impostos', en: 'Taxes', es: 'Impuestos' },
  other:    { 'pt-BR': 'Outros', en: 'Other', es: 'Otros' },
  incomeOps: { 'pt-BR': 'Receitas', en: 'Income', es: 'Ingresos' }
};

const EXPENSE_CATEGORIES = [
  { key: 'moradia', group: 'housing', 'pt-BR': 'Moradia', en: 'Housing', es: 'Vivienda' },
  { key: 'manutencaoImoveis', group: 'housing', 'pt-BR': 'Manutenção de Imóveis', en: 'Property Maintenance', es: 'Mantenimiento de Inmuebles' },
  { key: 'impostosPropriedade', group: 'housing', 'pt-BR': 'Impostos de Propriedade', en: 'Property Taxes', es: 'Impuestos de Propiedad' },
  { key: 'seguroImoveis', group: 'housing', 'pt-BR': 'Seguro de Imóveis', en: 'Property Insurance', es: 'Seguro de Inmuebles' },
  { key: 'condominio', group: 'housing', 'pt-BR': 'Condomínio', en: 'Building Fees', es: 'Gastos de Comunidad' },
  { key: 'utilidades', group: 'housing', 'pt-BR': 'Utilidades', en: 'Utilities', es: 'Servicios' },
  { key: 'alimentacao', group: 'daily', 'pt-BR': 'Alimentação', en: 'Food', es: 'Alimentación' },
  { key: 'supermercado', group: 'daily', 'pt-BR': 'Supermercado', en: 'Groceries', es: 'Supermercado' },
  { key: 'restaurantes', group: 'daily', 'pt-BR': 'Restaurantes', en: 'Restaurants', es: 'Restaurantes' },
  { key: 'transporte', group: 'daily', 'pt-BR': 'Transporte', en: 'Transport', es: 'Transporte' },
  { key: 'combustivel', group: 'daily', 'pt-BR': 'Combustível', en: 'Fuel', es: 'Combustible' },
  { key: 'lazer', group: 'daily', 'pt-BR': 'Lazer', en: 'Leisure', es: 'Ocio' },
  { key: 'viagens', group: 'daily', 'pt-BR': 'Viagens', en: 'Travel', es: 'Viajes' },
  { key: 'saude', group: 'health', 'pt-BR': 'Saúde', en: 'Health', es: 'Salud' },
  { key: 'seguroSaude', group: 'health', 'pt-BR': 'Seguro de Saúde', en: 'Health Insurance', es: 'Seguro de Salud' },
  { key: 'farmacia', group: 'health', 'pt-BR': 'Farmácia', en: 'Pharmacy', es: 'Farmacia' },
  { key: 'educacao', group: 'edu', 'pt-BR': 'Educação', en: 'Education', es: 'Educación' },
  { key: 'cursos', group: 'edu', 'pt-BR': 'Cursos', en: 'Courses', es: 'Cursos' },
  { key: 'equipamentos', group: 'business', 'pt-BR': 'Equipamentos', en: 'Equipment', es: 'Equipos' },
  { key: 'software', group: 'business', 'pt-BR': 'Software e Ferramentas', en: 'Software & Tools', es: 'Software y Herramientas' },
  { key: 'marketing', group: 'business', 'pt-BR': 'Marketing e Publicidade', en: 'Marketing & Advertising', es: 'Marketing y Publicidad' },
  { key: 'servicosProfissionais', group: 'business', 'pt-BR': 'Serviços Profissionais', en: 'Professional Services', es: 'Servicios Profesionales' },
  { key: 'investimentos', group: 'invest', 'pt-BR': 'Investimentos', en: 'Investments', es: 'Inversiones' },
  { key: 'taxasBancarias', group: 'invest', 'pt-BR': 'Taxas Bancárias', en: 'Bank Fees', es: 'Comisiones Bancarias' },
  { key: 'custodia', group: 'invest', 'pt-BR': 'Custódia', en: 'Custody', es: 'Custodia' },
  { key: 'cambio', group: 'invest', 'pt-BR': 'Câmbio', en: 'FX', es: 'Cambio' },
  { key: 'impostos', group: 'taxes', 'pt-BR': 'Impostos', en: 'Taxes', es: 'Impuestos' },
  { key: 'contabilidade', group: 'taxes', 'pt-BR': 'Contabilidade', en: 'Accounting', es: 'Contabilidad' },
  { key: 'outros', group: 'other', 'pt-BR': 'Outros', en: 'Other', es: 'Otros' },
  { key: 'presentes', group: 'other', 'pt-BR': 'Presentes', en: 'Gifts', es: 'Regalos' },
  { key: 'doacoes', group: 'other', 'pt-BR': 'Doações', en: 'Donations', es: 'Donaciones' }
];

const INCOME_CATEGORIES = [
  { key: 'servicos', group: 'incomeOps', 'pt-BR': 'Serviços / Freelance', en: 'Services / Freelance', es: 'Servicios / Freelance' },
  { key: 'vendas', group: 'incomeOps', 'pt-BR': 'Vendas', en: 'Sales', es: 'Ventas' },
  { key: 'alugueis', group: 'incomeOps', 'pt-BR': 'Aluguéis', en: 'Rent Received', es: 'Alquileres' },
  { key: 'jurosDividendos', group: 'incomeOps', 'pt-BR': 'Juros e Dividendos', en: 'Interest & Dividends', es: 'Intereses y Dividendos' },
  { key: 'ganhosCapital', group: 'incomeOps', 'pt-BR': 'Ganhos de Capital', en: 'Capital Gains', es: 'Ganancias de Capital' },
  { key: 'reembolsos', group: 'incomeOps', 'pt-BR': 'Reembolsos', en: 'Reimbursements', es: 'Reembolsos' },
  { key: 'outrasReceitas', group: 'incomeOps', 'pt-BR': 'Outras Receitas', en: 'Other Income', es: 'Otros Ingresos' }
];

function categoriesFor(type) { return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES; }

function catLabel(key) {
  const lang = state.settings.lang || 'pt-BR';
  const c = EXPENSE_CATEGORIES.concat(INCOME_CATEGORIES).find((x) => x.key === key);
  return c ? (c[lang] || c['pt-BR']) : key;
}
function groupLabel(g) {
  const lang = state.settings.lang || 'pt-BR';
  return (CATEGORY_GROUPS[g] && (CATEGORY_GROUPS[g][lang] || CATEGORY_GROUPS[g]['pt-BR'])) || g;
}

/* ---------- Estado e persistência (IndexedDB) ---------- */
const DB_NAME = 'prof-controller';
const DB_VERSION = 2; // Fase 2: novas stores transactions e budgets
let db = null;
let state = {
  accounts: [],
  balances: [],
  transactions: [],
  budgets: [],
  settings: { lang: 'pt-BR', theme: 'default', baseCurrency: 'EUR' },
  ui: { txType: 'all', txAccount: 'all', txMonth: '', budgetMonth: '' }
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
      // Fase 2 — índices criados junto; adicionar índice depois exigiria novo DB_VERSION
      if (!d.objectStoreNames.contains('transactions')) {
        const s = d.createObjectStore('transactions', { keyPath: 'id' });
        s.createIndex('date', 'date');
        s.createIndex('accountId', 'accountId');
        s.createIndex('category', 'category');
        s.createIndex('type', 'type');
      }
      if (!d.objectStoreNames.contains('budgets')) {
        const s = d.createObjectStore('budgets', { keyPath: 'id' });
        s.createIndex('category', 'category');
      }
      // Preparado para fases futuras (patrimônio)
      ['fx', 'receitas', 'lancamentos', 'imoveis', 'veiculos', 'posicoes', 'nav', 'orcamentos']
        .forEach((name) => { if (!d.objectStoreNames.contains(name)) d.createObjectStore(name, { keyPath: 'id' }); });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error || new Error('Falha ao abrir o banco'));
    // Dispara quando o app está aberto em OUTRA aba/janela segurando a versão antiga
    // do banco. Sem isto, a promessa ficaria pendente para sempre e o app travaria.
    req.onblocked = () => reject(new Error('BLOCKED'));
    // Rede de segurança: se nada acontecer, avisa em vez de travar calado.
    setTimeout(() => { if (!db) reject(new Error('TIMEOUT')); }, 8000);
  });
}

// Aviso fixo no topo quando algo impede o app de iniciar.
function showFatal(msg) {
  let el = document.getElementById('fatalBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fatalBanner';
    el.className = 'fatal-banner';
    document.body.prepend(el);
  }
  el.textContent = msg;
}

function tx(store, mode) { return db.transaction(store, mode).objectStore(store); }

async function loadAll() {
  state.accounts = await getAll('accounts');
  state.balances = await getAll('balances');
  state.transactions = await getAll('transactions');
  state.budgets = await getAll('budgets');
  const settings = await getAll('settings');
  settings.forEach((s) => { state.settings[s.key] = s.value; });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    // Se a store ainda não existe (banco antigo), devolve vazio em vez de quebrar o app
    if (!db || !db.objectStoreNames.contains(store)) { resolve([]); return; }
    const req = tx(store, 'readonly').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
function put(store, value) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(); return; }
    const req = tx(store, 'readwrite').put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function del(store, id) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(); return; }
    const req = tx(store, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------- Utilidades ---------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { return todayISO().slice(0, 7); }
function monthOf(date) { return String(date || '').slice(0, 7); }
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
function accountById(id) { return state.accounts.find((a) => a.id === id); }
function accountCurrency(id) { const a = accountById(id); return a ? a.currency : state.settings.baseCurrency; }

/* ---------- Saldo calculado (âncora + transações) ---------- */

// Último saldo registrado da conta (a "foto" mais recente vinda do CSV ou digitada).
function anchorBalance(accountId) {
  const list = state.balances.filter((b) => b.accountId === accountId).sort((a, b) => a.date.localeCompare(b.date));
  return list.length ? list[list.length - 1] : null;
}

// Efeito de um lançamento sobre uma conta específica.
function signedAmount(trn, accountId) {
  if (trn.type === 'income' && trn.accountId === accountId) return Number(trn.value) || 0;
  if (trn.type === 'expense' && trn.accountId === accountId) return -(Number(trn.value) || 0);
  if (trn.type === 'transfer') {
    if (trn.accountId === accountId) return -(Number(trn.value) || 0);
    if (trn.toAccountId === accountId) return Number(trn.toValue != null ? trn.toValue : trn.value) || 0;
  }
  return 0;
}

// saldo atual = âncora + tudo que foi lançado DEPOIS da data da âncora
function currentBalance(account) {
  const anchor = anchorBalance(account.id);
  const base = anchor ? Number(anchor.value) : Number(account.initialBalance) || 0;
  const since = anchor ? anchor.date : null;
  const delta = state.transactions.reduce((sum, trn) => {
    if (since && trn.date <= since) return sum;
    return sum + signedAmount(trn, account.id);
  }, 0);
  return base + delta;
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
function renderAll() {
  renderDashboard();
  renderAccounts();
  renderBalances();
  renderTransactions();
  renderBudgets();
  renderSettings();
}

function renderDashboard() {
  const base = state.settings.baseCurrency;

  // Patrimônio: soma dos saldos ATUAIS das contas, por moeda.
  const byCurrency = {};
  state.accounts.forEach((a) => {
    byCurrency[a.currency] = (byCurrency[a.currency] || 0) + currentBalance(a);
  });
  const keys = Object.keys(byCurrency).sort();
  // Sem tabela de câmbio (Fase 3), não consolidamos moedas diferentes.
  if (keys.length === 1) {
    document.getElementById('totalEquity').textContent = fmtMoney(byCurrency[keys[0]], keys[0]);
    document.getElementById('totalEquityBase').textContent = '';
  } else if (keys.length === 0) {
    document.getElementById('totalEquity').textContent = '—';
    document.getElementById('totalEquityBase').textContent = '';
  } else {
    document.getElementById('totalEquity').textContent = byCurrency[base] != null ? fmtMoney(byCurrency[base], base) : '—';
    document.getElementById('totalEquityBase').textContent = keys.filter((k) => k !== base).map((k) => fmtMoney(byCurrency[k], k)).join(' · ');
  }
  document.getElementById('accountCount').textContent = state.accounts.length;
  document.getElementById('currencyCount').textContent = new Set(state.accounts.map((a) => a.currency)).size;
  document.getElementById('baseCurrencyLabel').textContent = base;

  // Resumo do mês corrente, por moeda (transferências não entram).
  const m = currentMonth();
  const inc = {}, exp = {};
  state.transactions.forEach((trn) => {
    if (monthOf(trn.date) !== m) return;
    const code = accountCurrency(trn.accountId);
    const v = Number(trn.value) || 0;
    if (trn.type === 'income') inc[code] = (inc[code] || 0) + v;
    if (trn.type === 'expense') exp[code] = (exp[code] || 0) + v;
  });
  const codes = [...new Set([...Object.keys(inc), ...Object.keys(exp)])].sort();
  const net = {};
  codes.forEach((c) => { net[c] = (inc[c] || 0) - (exp[c] || 0); });

  fillSummaryCard('monthIncome', 'monthIncomeSub', inc, base);
  fillSummaryCard('monthExpense', 'monthExpenseSub', exp, base);
  fillSummaryCard('monthResult', 'monthResultSub', net, base);
}

function fillSummaryCard(mainId, subId, map, base) {
  const codes = Object.keys(map).sort();
  const main = document.getElementById(mainId);
  const sub = document.getElementById(subId);
  if (!codes.length) { main.textContent = fmtMoney(0, base); sub.textContent = ''; return; }
  main.textContent = fmtMoney(map[base] || 0, base);
  sub.textContent = codes.filter((c) => c !== base).map((c) => fmtMoney(map[c], c)).join(' · ');
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

/* ---------- Transações ---------- */
function filteredTransactions() {
  const { txType, txAccount, txMonth } = state.ui;
  return state.transactions
    .filter((trn) => txType === 'all' || trn.type === txType)
    .filter((trn) => txAccount === 'all' || trn.accountId === txAccount || trn.toAccountId === txAccount)
    .filter((trn) => !txMonth || monthOf(trn.date) === txMonth)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function renderTransactions() {
  // Filtros
  const selType = document.getElementById('txFilterType');
  selType.innerHTML = [
    `<option value="all">${t('tx.all')}</option>`,
    `<option value="income">${t('tx.income')}</option>`,
    `<option value="expense">${t('tx.expense')}</option>`,
    `<option value="transfer">${t('tx.transfer')}</option>`
  ].join('');
  selType.value = state.ui.txType;

  const selAcc = document.getElementById('txFilterAccount');
  selAcc.innerHTML = `<option value="all">${t('tx.all')}</option>` +
    state.accounts.map((a) => `<option value="${a.id}">${escapeHtml(a.name)} (${a.currency})</option>`).join('');
  selAcc.value = state.accounts.some((a) => a.id === state.ui.txAccount) ? state.ui.txAccount : 'all';

  document.getElementById('txFilterMonth').value = state.ui.txMonth || '';

  // Tabela
  const thead = document.querySelector('#txTable thead tr');
  thead.innerHTML = `
    <th>${t('tx.date')}</th><th>${t('tx.type')}</th><th>${t('tx.account')}</th>
    <th>${t('tx.category')}</th><th>${t('tx.description')}</th>
    <th>${t('tx.value')}</th><th>${t('accounts.actions')}</th>`;

  const tbody = document.querySelector('#txTable tbody');
  const rows = filteredTransactions();
  const empty = document.getElementById('txEmpty');
  tbody.innerHTML = '';
  if (!rows.length) {
    empty.textContent = state.accounts.length ? t('tx.empty') : t('tx.noAccounts');
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
  }

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
      if (to && trn.toValue != null && to.currency !== code) {
        amountText += ' → ' + fmtMoney(trn.toValue, to.currency);
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${trn.date}</td>
      <td>${t('tx.' + trn.type)}</td>
      <td>${accountCell}</td>
      <td>${categoryCell}</td>
      <td>${escapeHtml(trn.description || '')}</td>
      <td class="${amountClass}">${amountText}</td>
      <td>
        <button class="secondary-btn" onclick="openTxModal('${trn.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteTx('${trn.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Orçamentos ---------- */
function budgetSpent(budget, month) {
  return state.transactions.reduce((sum, trn) => {
    if (trn.type !== 'expense') return sum;
    if (trn.category !== budget.category) return sum;
    if (monthOf(trn.date) !== month) return sum;
    if (accountCurrency(trn.accountId) !== budget.currency) return sum;
    return sum + (Number(trn.value) || 0);
  }, 0);
}

function renderBudgets() {
  const monthInput = document.getElementById('budgetMonth');
  monthInput.value = state.ui.budgetMonth || currentMonth();
  const month = monthInput.value;

  const list = document.getElementById('budgetList');
  const empty = document.getElementById('budgetEmpty');
  list.innerHTML = '';
  if (!state.budgets.length) {
    empty.textContent = t('budget.empty');
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  state.budgets
    .slice()
    .sort((a, b) => catLabel(a.category).localeCompare(catLabel(b.category)))
    .forEach((b) => {
      const spent = budgetSpent(b, month);
      const limit = Number(b.amount) || 0;
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      const over = spent > limit;
      const diff = Math.abs(limit - spent);

      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-head">
          <div>
            <h3>${escapeHtml(catLabel(b.category))}</h3>
            <p class="hint">${b.currency}</p>
          </div>
          <div class="budget-actions">
            <button class="secondary-btn" onclick="openBudgetModal('${b.id}')">${t('modal.edit')}</button>
            <button class="secondary-btn" onclick="deleteBudget('${b.id}')">${t('modal.delete')}</button>
          </div>
        </div>
        <div class="progress"><span class="${over ? 'over' : ''}" style="width:${pct}%"></span></div>
        <div class="budget-figures">
          <span>${t('budget.spent')}: <strong>${fmtMoney(spent, b.currency)}</strong></span>
          <span>${t('budget.limit')}: <strong>${fmtMoney(limit, b.currency)}</strong></span>
          <span class="${over ? 'amount-out' : 'amount-in'}">
            ${over ? t('budget.over') : t('budget.remaining')}: <strong>${fmtMoney(diff, b.currency)}</strong>
          </span>
        </div>`;
      list.appendChild(card);
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
  const a = id ? accountById(id) : null;
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
  const removedTx = state.transactions.filter((x) => x.accountId === id || x.toAccountId === id);
  state.accounts = state.accounts.filter((x) => x.id !== id);
  for (const b of state.balances.filter((x) => x.accountId === id)) await del('balances', b.id);
  state.balances = state.balances.filter((x) => x.accountId !== id);
  for (const trn of removedTx) await del('transactions', trn.id);
  state.transactions = state.transactions.filter((x) => x.accountId !== id && x.toAccountId !== id);
  await del('accounts', id);
  renderAll();
  showToast(t('toast.deleted'));
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

/* ---------- Modal de transação ---------- */
function categoryOptions(type, selected) {
  const cats = categoriesFor(type);
  const groups = [...new Set(cats.map((c) => c.group))];
  return groups.map((g) => `
    <optgroup label="${escapeHtml(groupLabel(g))}">
      ${cats.filter((c) => c.group === g).map((c) =>
        `<option value="${c.key}" ${selected === c.key ? 'selected' : ''}>${escapeHtml(catLabel(c.key))}</option>`
      ).join('')}
    </optgroup>`).join('');
}

function openTxModal(id) {
  if (!state.accounts.length) { showToast(t('tx.noAccounts')); return; }
  const trn = id ? state.transactions.find((x) => x.id === id) : null;
  const type = trn ? trn.type : 'expense';
  const accOptions = (selected) => state.accounts.map((a) =>
    `<option value="${a.id}" ${selected === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (${a.currency})</option>`).join('');

  openModal(`
    <h2>${trn ? t('modal.editTx') : t('modal.addTx')}</h2>
    <label>${t('tx.type')}</label>
    <select id="txType" onchange="onTxTypeChange()">
      <option value="expense" ${type === 'expense' ? 'selected' : ''}>${t('tx.expense')}</option>
      <option value="income" ${type === 'income' ? 'selected' : ''}>${t('tx.income')}</option>
      <option value="transfer" ${type === 'transfer' ? 'selected' : ''}>${t('tx.transfer')}</option>
    </select>

    <label>${t('tx.date')}</label>
    <input id="txDate" type="date" value="${trn ? trn.date : todayISO()}">

    <label>${t('tx.account')}</label>
    <select id="txAccount" onchange="onTxTypeChange()">${accOptions(trn ? trn.accountId : null)}</select>

    <div id="txToWrap" class="hidden">
      <label>${t('tx.toAccount')}</label>
      <select id="txToAccount" onchange="onTxTypeChange()">${accOptions(trn ? trn.toAccountId : null)}</select>
    </div>

    <div id="txCategoryWrap">
      <label>${t('tx.category')}</label>
      <select id="txCategory">${categoryOptions(type, trn ? trn.category : null)}</select>
    </div>

    <label>${t('tx.description')}</label>
    <input id="txDescription" value="${trn ? escapeHtml(trn.description || '') : ''}">

    <label>${t('tx.value')}</label>
    <input id="txValue" type="number" step="0.01" min="0" value="${trn ? trn.value : ''}">

    <div id="txToValueWrap" class="hidden">
      <label>${t('tx.receivedValue')}</label>
      <input id="txToValue" type="number" step="0.01" min="0" value="${trn && trn.toValue != null ? trn.toValue : ''}">
      <p class="hint">${t('tx.receivedHint')}</p>
    </div>

    <button class="primary-btn" onclick="saveTx('${trn ? trn.id : ''}')">${t('modal.save')}</button>
  `);
  onTxTypeChange();
}

// Mostra/esconde campos conforme o tipo escolhido e as moedas envolvidas.
function onTxTypeChange() {
  const type = document.getElementById('txType').value;
  const catWrap = document.getElementById('txCategoryWrap');
  const toWrap = document.getElementById('txToWrap');
  const toValWrap = document.getElementById('txToValueWrap');
  const catSel = document.getElementById('txCategory');

  const isTransfer = type === 'transfer';
  catWrap.classList.toggle('hidden', isTransfer);
  toWrap.classList.toggle('hidden', !isTransfer);

  if (!isTransfer) {
    // Troca a lista de categorias (receita x despesa) preservando a seleção se existir
    const current = catSel.value;
    catSel.innerHTML = categoryOptions(type, current);
    toValWrap.classList.add('hidden');
    return;
  }

  const from = accountCurrency(document.getElementById('txAccount').value);
  const to = accountCurrency(document.getElementById('txToAccount').value);
  toValWrap.classList.toggle('hidden', from === to);
}

async function saveTx(id) {
  const type = document.getElementById('txType').value;
  const date = document.getElementById('txDate').value;
  const accountId = document.getElementById('txAccount').value;
  const value = Number(document.getElementById('txValue').value);
  if (!date || !accountId || isNaN(value) || value <= 0) return;

  const trn = {
    id: id || uid(),
    type,
    date,
    accountId,
    description: document.getElementById('txDescription').value.trim(),
    value
  };

  if (type === 'transfer') {
    const toAccountId = document.getElementById('txToAccount').value;
    if (!toAccountId || toAccountId === accountId) return;
    trn.toAccountId = toAccountId;
    const toValueEl = document.getElementById('txToValue');
    const toValue = Number(toValueEl.value);
    trn.toValue = (accountCurrency(accountId) !== accountCurrency(toAccountId) && toValue > 0) ? toValue : value;
    trn.category = null;
  } else {
    trn.category = document.getElementById('txCategory').value;
  }

  if (id) state.transactions = state.transactions.map((x) => (x.id === id ? trn : x));
  else state.transactions.push(trn);
  await put('transactions', trn);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteTx(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.transactions = state.transactions.filter((x) => x.id !== id);
  await del('transactions', id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* ---------- Modal de orçamento ---------- */
function openBudgetModal(id) {
  const b = id ? state.budgets.find((x) => x.id === id) : null;
  openModal(`
    <h2>${b ? t('modal.editBudget') : t('modal.addBudget')}</h2>
    <label>${t('budget.category')}</label>
    <select id="bgCategory">${categoryOptions('expense', b ? b.category : null)}</select>
    <label>${t('budget.currency')}</label>
    <select id="bgCurrency">
      ${CURRENCIES.map((c) => {
        const selected = b ? b.currency === c.code : c.code === state.settings.baseCurrency;
        return `<option value="${c.code}" ${selected ? 'selected' : ''}>${c.code}</option>`;
      }).join('')}
    </select>
    <label>${t('budget.limit')}</label>
    <input id="bgAmount" type="number" step="0.01" min="0" value="${b ? b.amount : ''}">
    <button class="primary-btn" onclick="saveBudget('${b ? b.id : ''}')">${t('modal.save')}</button>
  `);
}

async function saveBudget(id) {
  const category = document.getElementById('bgCategory').value;
  const bgCurrency = document.getElementById('bgCurrency').value;
  const amount = Number(document.getElementById('bgAmount').value);
  if (!category || isNaN(amount) || amount <= 0) return;

  // Um orçamento por categoria + moeda
  const duplicate = state.budgets.find((x) => x.category === category && x.currency === bgCurrency && x.id !== id);
  const budget = { id: id || (duplicate ? duplicate.id : uid()), category, currency: bgCurrency, amount };
  if (state.budgets.some((x) => x.id === budget.id)) {
    state.budgets = state.budgets.map((x) => (x.id === budget.id ? budget : x));
  } else {
    state.budgets.push(budget);
  }
  await put('budgets', budget);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteBudget(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.budgets = state.budgets.filter((x) => x.id !== id);
  await del('budgets', id);
  renderAll();
  showToast(t('toast.deleted'));
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
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    accounts: state.accounts,
    balances: state.balances,
    transactions: state.transactions,
    budgets: state.budgets,
    settings: state.settings
  };
  download(`prof-controller-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
  showToast(t('toast.exported'));
}

function exportCSV() {
  const header = ['Data', 'Conta', 'Moeda', 'Saldo'];
  const rows = state.balances.map((b) => {
    const acc = accountById(b.accountId);
    return [b.date, acc ? acc.name : '', acc ? acc.currency : '', String(b.value).replace('.', ',')];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  download(`prof-controller-saldos-${todayISO()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}

function exportTransactionsCSV() {
  const header = ['Data', 'Tipo', 'Conta', 'ContaDestino', 'Moeda', 'Categoria', 'Descricao', 'Valor'];
  const rows = filteredTransactions().map((trn) => {
    const acc = accountById(trn.accountId);
    const to = accountById(trn.toAccountId);
    return [
      trn.date,
      t('tx.' + trn.type),
      acc ? acc.name : '',
      to ? to.name : '',
      acc ? acc.currency : '',
      trn.category ? catLabel(trn.category) : '',
      trn.description || '',
      String(trn.value).replace('.', ',')
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  download(`prof-controller-transacoes-${todayISO()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.accounts || !data.balances) throw new Error('invalid');
    for (const a of data.accounts) await put('accounts', a);
    for (const b of data.balances) await put('balances', b);
    for (const trn of (data.transactions || [])) await put('transactions', trn);
    for (const bg of (data.budgets || [])) await put('budgets', bg);
    if (data.settings) {
      for (const [k, v] of Object.entries(data.settings)) {
        if (k === 'ui') continue;
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
    console.error('Erro na importação do backup:', e);
    showToast(t('toast.invalidFile'));
  }
}

/* ---------- Importação CSV (Data;Conta;Moeda;Saldo) ---------- */

// Detecta o separador da primeira linha: ; ou tabulação ou ,
function detectDelimiter(line) {
  const counts = { ';': 0, '\t': 0, ',': 0 };
  for (const ch of line) { if (ch in counts) counts[ch]++; }
  if (counts[';'] > 0) return ';';
  if (counts['\t'] > 0) return '\t';
  return ',';
}

function parseCSV(text) {
  // Remove BOM (caractere invisível que o Excel adiciona no início)
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows = [];
  let delimiter = ';';
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (li === 0) delimiter = detectDelimiter(line); // detecta o separador
    const trimmed = line.trim();
    // Ignora linhas de comentário (#) e a linha de total geral (GRAND TOTAL)
    if (trimmed.startsWith('#') || /^grand\s*total/i.test(trimmed)) continue;
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
      } else if (ch === delimiter) {
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
  d = String(d || '').trim();
  // AAAA-MM-DD ou AAAA/MM/DD
  let m = d.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  // DD/MM/AAAA, DD-MM-AAAA ou DD.MM.AAAA
  m = d.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

async function importCSV(file) {
  try {
    const rows = parseCSV(await file.text());
    if (rows.length < 2) throw new Error('CSV vazio');

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const iDate = header.findIndex((h) => h === 'data' || h.startsWith('date'));
    const iAccount = header.findIndex((h) => h === 'conta' || h.includes('account') || h.includes('cont'));
    const iCurrency = header.findIndex((h) => h === 'moeda' || h.includes('currency'));
    const iValue = header.findIndex(
      (h) => h === 'saldo' || h.includes('balance') || h === 'valor'
    );
    if (iDate < 0 || iAccount < 0 || iValue < 0) {
      throw new Error('Cabeçalho não reconhecido: ' + header.join(' | '));
    }

    let imported = 0;
    let created = 0;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 2) continue;

      const accountName = (row[iAccount] || '').trim();
      // Pula a linha de total geral (não é uma conta real)
      if (/^grand\s*total$/i.test(accountName)) continue;

      const date = normalizeDate(row[iDate] || '');
      const curr = ((row[iCurrency] || '').trim() || 'EUR').toUpperCase();

      // Número: aceita "14296.13", "14.296,13" e "14296,13"
      let clean = (row[iValue] || '').trim().replace(/\s/g, '');
      if (clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
      const value = Number(clean);

      if (!date || !accountName || isNaN(value)) continue;

      let account = state.accounts.find(
        (a) => a.name.toLowerCase() === accountName.toLowerCase() && a.currency === curr
      );
      if (!account) {
        account = { id: uid(), name: accountName, type: 'bank', currency: curr, initialBalance: 0 };
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
    console.error('Erro na importação CSV:', e); // mostra o motivo REAL no console (F12)
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

  // Fase 2 — transações
  document.getElementById('btnAddTx').addEventListener('click', () => openTxModal());
  document.getElementById('btnExportTxCSV').addEventListener('click', exportTransactionsCSV);
  document.getElementById('txFilterType').addEventListener('change', (e) => { state.ui.txType = e.target.value; renderTransactions(); });
  document.getElementById('txFilterAccount').addEventListener('change', (e) => { state.ui.txAccount = e.target.value; renderTransactions(); });
  document.getElementById('txFilterMonth').addEventListener('change', (e) => { state.ui.txMonth = e.target.value; renderTransactions(); });
  document.getElementById('btnClearTxFilters').addEventListener('click', () => {
    state.ui.txType = 'all'; state.ui.txAccount = 'all'; state.ui.txMonth = '';
    renderTransactions();
  });

  // Fase 2 — orçamentos
  document.getElementById('btnAddBudget').addEventListener('click', () => openBudgetModal());
  document.getElementById('budgetMonth').addEventListener('change', (e) => { state.ui.budgetMonth = e.target.value; renderBudgets(); });

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
  // 1) Interface primeiro. Abas, tema e idioma não dependem do banco de dados,
  //    então passam a funcionar mesmo que o IndexedDB falhe em abrir.
  const langSel = document.getElementById('langSelect');
  langSel.innerHTML = Object.keys(I18N).map((l) => `<option value="${l}">${l}</option>`).join('');
  const themeSel = document.getElementById('themeSelect');
  themeSel.innerHTML = ['default', 'dark', 'green', 'blue'].map((th) => `<option value="${th}">${th}</option>`).join('');
  applyTheme();
  bindEvents();

  // 2) Depois os dados. Qualquer falha aqui vira aviso na tela, nunca tela travada.
  try {
    await openDB();
    await loadAll();
  } catch (e) {
    console.error('Falha ao iniciar o banco de dados:', e);
    if (e && e.message === 'BLOCKED') {
      showFatal('O ProF Controller está aberto em outra aba ou na janela do app instalado, e isso impede a atualização do banco de dados. Feche as outras janelas e recarregue esta página.');
    } else if (e && e.message === 'TIMEOUT') {
      showFatal('O banco de dados local não respondeu. Feche as outras abas do app e recarregue a página.');
    } else {
      showFatal('Não foi possível abrir o banco de dados local: ' + (e && e.message ? e.message : e));
    }
    return; // a navegação por abas e o tema continuam funcionando
  }

  state.ui.budgetMonth = currentMonth();
  applyLang();
  applyTheme();
  renderAll();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

init();
