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

/* ---------- Bandeiras (SVG) ----------
   Emoji de bandeira (🇧🇷) não é renderizado no Windows: o Chrome mostra as
   letras "BR". Por isso as bandeiras são desenhadas à mão em SVG. */
const FLAGS = {
  br: `<svg viewBox="0 0 28 20" class="flag"><rect width="28" height="20" fill="#009b3a"/><path d="M14 2.5 25.5 10 14 17.5 2.5 10Z" fill="#fedf00"/><circle cx="14" cy="10" r="4.4" fill="#002776"/><path d="M9.8 8.7a11 11 0 0 1 8.5 2.2" stroke="#fff" stroke-width="1.5" fill="none"/></svg>`,
  pt: `<svg viewBox="0 0 28 20" class="flag"><rect width="28" height="20" fill="#f00"/><rect width="11" height="20" fill="#006600"/><circle cx="11" cy="10" r="4.2" fill="#ffe900" stroke="#fff" stroke-width="0.6"/><circle cx="11" cy="10" r="2.4" fill="#fff" stroke="#003" stroke-width="0.7"/></svg>`,
  us: `<svg viewBox="0 0 28 20" class="flag"><rect width="28" height="20" fill="#fff"/><g fill="#b22234"><rect width="28" height="1.55"/><rect y="3.1" width="28" height="1.55"/><rect y="6.2" width="28" height="1.55"/><rect y="9.3" width="28" height="1.55"/><rect y="12.4" width="28" height="1.55"/><rect y="15.5" width="28" height="1.55"/><rect y="18.6" width="28" height="1.4"/></g><rect width="12" height="10.85" fill="#3c3b6e"/><g fill="#fff"><circle cx="2.4" cy="2.2" r="0.7"/><circle cx="6" cy="2.2" r="0.7"/><circle cx="9.6" cy="2.2" r="0.7"/><circle cx="4.2" cy="4.5" r="0.7"/><circle cx="7.8" cy="4.5" r="0.7"/><circle cx="2.4" cy="6.8" r="0.7"/><circle cx="6" cy="6.8" r="0.7"/><circle cx="9.6" cy="6.8" r="0.7"/><circle cx="4.2" cy="9.1" r="0.7"/><circle cx="7.8" cy="9.1" r="0.7"/></g></svg>`,
  gb: `<svg viewBox="0 0 28 20" class="flag"><rect width="28" height="20" fill="#012169"/><path d="M0 0 28 20M28 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 28 20M28 0 0 20" stroke="#c8102e" stroke-width="2.2"/><path d="M14 0v20M0 10h28" stroke="#fff" stroke-width="6.5"/><path d="M14 0v20M0 10h28" stroke="#c8102e" stroke-width="3.8"/></svg>`,
  es: `<svg viewBox="0 0 28 20" class="flag"><rect width="28" height="20" fill="#c60b1e"/><rect y="5" width="28" height="10" fill="#ffc400"/><rect x="4.5" y="8" width="3.6" height="4.6" rx="0.5" fill="#c60b1e" stroke="#8a0715" stroke-width="0.4"/></svg>`
};

// Cada idioma e as bandeiras que o representam
const LANGS = [
  { code: 'pt-BR', label: 'Português', flags: ['pt', 'br'] },
  { code: 'en', label: 'English', flags: ['us', 'gb'] },
  { code: 'es', label: 'Español', flags: ['es'] }
];

/* ---------- i18n: pt-BR (padrão), en, es ---------- */
const I18N = {
  'pt-BR': {
    'tabs.dashboard': 'Dashboard',
    'tabs.accounts': 'Contas',
    'tabs.balances': 'Saldos Diários',
    'tabs.transactions': 'Transações',
    'tabs.budgets': 'Orçamentos',
    'tabs.settings': 'Configurações',
    'dashboard.totalEquity': 'Financeiro',
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
    'tabs.fx': 'Câmbio',
    'fx.title': 'Câmbio',
    'fx.add': '+ Nova taxa',
    'fx.fetch': 'Buscar taxas de hoje',
    'fx.hint': 'As taxas são registradas em relação ao euro. Para consolidar o patrimônio, o app usa a taxa mais recente até a data consultada.',
    'fx.date': 'Data',
    'fx.currency': 'Moeda',
    'fx.rate': 'Taxa',
    'fx.rateLabel': 'Quantas unidades desta moeda valem 1 EUR',
    'fx.inverse': 'Inverso',
    'fx.empty': 'Nenhuma taxa registrada. Use "Buscar taxas de hoje" ou cadastre manualmente.',
    'fx.missing': 'Sem taxa de câmbio para: {list}. O total consolidado ignora essas moedas.',
    'fx.fetched': '{n} taxas atualizadas.',
    'fx.fetchError': 'Não foi possível buscar as taxas online. Verifique a conexão ou cadastre manualmente.',
    'dashboard.consolidated': 'Consolidado em {code}',
    'modal.addFx': 'Nova taxa de câmbio',
    'modal.editFx': 'Editar taxa de câmbio',
    'tabs.portfolio': 'Portfólio',
    'portfolio.title': 'Portfólio',
    'portfolio.properties': 'Imóveis',
    'portfolio.vehicles': 'Veículos',
    'portfolio.addProperty': '+ Novo imóvel',
    'portfolio.addVehicle': '+ Novo veículo',
    'portfolio.name': 'Nome',
    'portfolio.currency': 'Moeda',
    'portfolio.value': 'Valor atual',
    'portfolio.debt': 'Dívida',
    'portfolio.net': 'Líquido',
    'portfolio.acquiredDate': 'Data de aquisição',
    'portfolio.acquiredValue': 'Valor de aquisição',
    'portfolio.acquiredDebt': 'Dívida inicial (hipoteca/financiamento)',
    'portfolio.depreciation': 'Depreciação anual (%)',
    'portfolio.depreciationHint': 'Usada apenas enquanto não houver avaliação mais recente. Qualquer avaliação registrada substitui o cálculo.',
    'portfolio.valuations': 'Avaliações',
    'portfolio.addValuation': 'Registrar avaliação',
    'portfolio.valuationDate': 'Data',
    'portfolio.emptyProperties': 'Nenhum imóvel cadastrado.',
    'portfolio.emptyVehicles': 'Nenhum veículo cadastrado.',
    'portfolio.noValuations': 'Sem avaliações. O valor exibido parte da aquisição.',
    'portfolio.estimated': 'estimado',
    'portfolio.vehicleKind': 'Tipo de veículo',
    'portfolio.vk.car': 'Carro',
    'portfolio.vk.motorcycle': 'Moto',
    'portfolio.vk.boat': 'Barco',
    'portfolio.vk.helicopter': 'Helicóptero',
    'portfolio.vk.plane': 'Avião',
    'portfolio.tax': 'Imposto',
    'portfolio.taxAmount': 'Valor do imposto',
    'portfolio.taxPeriod': 'Periodicidade do imposto',
    'portfolio.taxNone': 'Sem imposto',
    'portfolio.taxMonthly': 'Mensal',
    'portfolio.taxAnnual': 'Anual',
    'portfolio.taxPerYear': '/ano',
    'portfolio.taxPerMonth': '/mês',
    'portfolio.taxTotal': 'Impostos ao ano',
    'portfolio.taxBill': 'Gerar conta a pagar',
    'portfolio.taxHint': 'O valor informado vira uma conta a pagar recorrente quando você clicar em "Gerar conta a pagar" na linha do bem.',
    'portfolio.total': 'Total',
    'dashboard.properties': 'Imóveis',
    'dashboard.vehicles': 'Veículos',
    'dashboard.debt': 'Dívidas',
    'dashboard.nav': 'Patrimônio Líquido',
    'modal.addProperty': 'Novo imóvel',
    'modal.editProperty': 'Editar imóvel',
    'modal.addVehicle': 'Novo veículo',
    'modal.editVehicle': 'Editar veículo',
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
    'toast.invalidValue': 'Informe um valor válido (ex.: 620.000,00).',
    'toast.nothingToExport': 'Não há saldos diários para exportar. Use "Registrar saldo de hoje" primeiro.',
    'balances.snapshot': 'Registrar saldo de hoje',
    'balances.snapshotDone': 'Saldo de hoje registrado em {n} contas.',
    'nav.approx': 'Trechos anteriores à taxa de câmbio mais antiga usam essa taxa e são aproximados.',
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
    'modal.delete': 'Excluir',
    'nav.title': 'Evolução do Patrimônio',
    'nav.hint': 'Série mensal consolidada na moeda base. Moedas sem taxa ficam de fora.',
    'nav.empty': 'Sem dados suficientes para o gráfico.',
    'nav.financial': 'Financeiro',
    'nav.properties': 'Imóveis',
    'nav.vehicles': 'Veículos',
    'nav.debt': 'Dívidas',
    'nav.net': 'Patrimônio Líquido',
    'nav.viewPie': 'Composição',
    'nav.viewLine': 'Evolução',
    'nav.breakdown': 'Separar por',
    'nav.byClass': 'Classe',
    'nav.byCurrency': 'Moeda',
    'nav.byAccount': 'Conta / bem',
    'nav.others': 'Outros',
    'nav.pieTitle': 'Composição do Patrimônio',
    'nav.pieNote': 'Fatias em {code}, na data de hoje. Dívidas não entram no gráfico.',
    'tabs.bills': 'A Pagar / Receber',
    'bill.title': 'Contas a Pagar e a Receber',
    'bill.add': '+ Novo título',
    'bill.schedules': 'Títulos cadastrados',
    'bill.installments': 'Parcelas',
    'bill.kind': 'Tipo',
    'bill.receivable': 'A receber',
    'bill.payable': 'A pagar',
    'bill.description': 'Descrição',
    'bill.account': 'Conta',
    'bill.category': 'Categoria',
    'bill.principal': 'Valor total (sem juros)',
    'bill.principalPer': 'Valor de cada parcela',
    'bill.amountMode': 'O valor informado é',
    'bill.asTotal': 'O total do título',
    'bill.asInstallment': 'O valor de cada parcela',
    'bill.startDate': 'Primeiro vencimento',
    'bill.frequency': 'Recorrência',
    'bill.limit': 'Até quando',
    'bill.byCount': 'Número de parcelas',
    'bill.byEnd': 'Data final',
    'bill.count': 'Parcelas',
    'bill.endDate': 'Data final',
    'bill.interest': 'Juros do parcelamento',
    'bill.interestType': 'Tipo de juros',
    'bill.interestRate': 'Taxa por parcela (%)',
    'bill.late': 'Juros de mora',
    'bill.lateType': 'Tipo de mora',
    'bill.lateRate': 'Taxa ao mês (%)',
    'bill.none': 'Sem juros',
    'bill.simple': 'Simples',
    'bill.compound': 'Compostos',
    'bill.preview': 'Prévia',
    'bill.previewText': '{n}x de {valor} · total {total}',
    'bill.dueDate': 'Vencimento',
    'bill.value': 'Valor',
    'bill.lateAmount': 'Mora',
    'bill.amount': 'Total',
    'bill.status': 'Situação',
    'bill.open': 'Em aberto',
    'bill.overdue': 'Vencida',
    'bill.paid': 'Paga',
    'bill.pay': 'Quitar',
    'bill.unpay': 'Desfazer',
    'bill.all': 'Todas',
    'bill.filterStatus': 'Situação',
    'bill.from': 'De',
    'bill.to': 'Até',
    'bill.emptySchedules': 'Nenhum título cadastrado.',
    'bill.emptyInstallments': 'Nenhuma parcela neste filtro.',
    'bill.confirmPay': 'Quitar parcela',
    'bill.paidDate': 'Data do pagamento',
    'bill.paidValue': 'Valor pago',
    'bill.payNote': 'A quitação vira um lançamento na conta e move o saldo.',
    'bill.totalOpen': 'A receber em aberto',
    'bill.totalDue': 'A pagar em aberto',
    'bill.noAccounts': 'Cadastre uma conta antes de criar títulos.',
    'bill.freq.once': 'Única',
    'bill.freq.daily': 'Diária',
    'bill.freq.weekly': 'Semanal',
    'bill.freq.biweekly': 'Quinzenal',
    'bill.freq.monthly': 'Mensal',
    'bill.freq.bimonthly': 'Bimestral',
    'bill.freq.quarterly': 'Trimestral',
    'bill.freq.semiannual': 'Semestral',
    'bill.freq.annual': 'Anual',
    'cash.title': 'Entradas e Saídas',
    'cash.in': 'Entradas',
    'cash.out': 'Saídas',
    'cash.realized': 'realizado',
    'cash.forecast': 'previsto',
    'cash.note': 'Barras cheias são o realizado; as riscadas, o previsto pelas parcelas em aberto. Valores em {code}.',
    'cash.empty': 'Sem movimento no período.',
    'cash.grain': 'Agrupar por',
    'cash.daily': 'Diário',
    'cash.weekly': 'Semanal',
    'cash.monthly': 'Mensal',
    'modal.addBill': 'Novo título',
    'modal.editBill': 'Editar título',
    'tabs.investments': 'Investimentos',
    'inv.title': 'Carteira de Investimentos',
    'inv.add': '+ Nova posição',
    'inv.name': 'Nome',
    'inv.account': 'Conta / corretora',
    'inv.kind': 'Forma de acompanhar',
    'inv.kindQuote': 'Quantidade × cotação',
    'inv.kindValue': 'Valor total atualizado',
    'inv.kindHint': 'Use cotação para ações, fundos e cripto. Use valor total para renda fixa, onde não há quantidade.',
    'inv.currency': 'Moeda',
    'inv.quantity': 'Quantidade',
    'inv.price': 'Cotação',
    'inv.value': 'Valor atual',
    'inv.cost': 'Custo',
    'inv.return': 'Rentabilidade',
    'inv.empty': 'Nenhuma posição cadastrada.',
    'inv.quotes': 'Cotações',
    'inv.addQuote': 'Registrar cotação',
    'inv.quoteDate': 'Data',
    'inv.quotePrice': 'Cotação unitária',
    'inv.quoteValue': 'Valor total na data',
    'inv.noQuotes': 'Sem cotações. A posição vale o custo enquanto não houver uma.',
    'inv.moves': 'Aportes e resgates',
    'inv.move': 'Movimentar',
    'inv.buy': 'Aporte',
    'inv.sell': 'Resgate',
    'inv.moveType': 'Tipo',
    'inv.moveDate': 'Data',
    'inv.moveQty': 'Quantidade',
    'inv.moveAmount': 'Valor em dinheiro',
    'inv.moveAccount': 'Conta de origem / destino',
    'inv.createLaunch': 'Gerar lançamento na conta',
    'inv.launchHint': 'Desmarque apenas ao cadastrar uma posição que já existe e cujo dinheiro já saiu da conta.',
    'inv.noMoves': 'Sem movimentações.',
    'inv.totalValue': 'Valor da carteira',
    'inv.totalCost': 'Custo total',
    'inv.totalReturn': 'Rentabilidade',
    'inv.noAccounts': 'Cadastre uma conta antes de criar posições.',
    'inv.noAccount': 'Sem conta vinculada',
    'inv.class': 'Classe',
    'inv.classFixed': 'Renda fixa',
    'inv.classVariable': 'Renda variável',
    'inv.type': 'Tipo de ativo',
    'inv.ty.stock': 'Ação',
    'inv.ty.fii': 'FII',
    'inv.ty.etf': 'ETF',
    'inv.ty.bdr': 'BDR',
    'inv.ty.treasury': 'Tesouro Direto',
    'inv.ty.cdb': 'CDB / LCI / LCA',
    'inv.ty.fund': 'Fundo',
    'inv.ty.crypto': 'Cripto',
    'inv.ty.other': 'Outro',
    'inv.isin': 'ISIN',
    'inv.ticker': 'Código de negociação (ticker)',
    'inv.tickerHint': 'O ISIN fica guardado para seu controle. A atualização automática, quando possível, usa o ticker.',
    'inv.updateAll': 'Atualizar tudo',
    'inv.updating': 'Atualizando…',
    'inv.updateDone': 'Câmbio: {fx}. Cotações: {q}.',
    'inv.updateNoTicker': 'nenhuma posição com ticker',
    'inv.updateFail': 'não foi possível buscar',
    'inv.updateOk': '{n} atualizadas',
    'inv.dupTitle': 'Possível duplicidade no patrimônio',
    'inv.dupText': '{valor} em "{posicao}" nunca saiu do saldo da conta {conta}. O mesmo dinheiro está sendo contado duas vezes: uma no Financeiro e outra em Investimentos.',
    'inv.dupFix': 'Descontar da conta',
    'inv.dupHint': 'Se esse dinheiro nunca esteve nessa conta, a correção é outra: edite a posição e escolha "Sem conta vinculada".',
    'inv.dupFixed': 'Corrigido. O valor saiu do saldo da conta.',
    'inv.initial': 'Valor já aplicado (opcional)',
    'inv.initialQty': 'Quantidade já possuída',
    'inv.deduct': 'Descontar este valor da conta vinculada',
    'inv.deductHint': 'Marque se o dinheiro ainda está no saldo daquela conta — assim ele sai de lá e passa a contar como investimento, sem duplicar o patrimônio.',
    'inv.accountHint': 'Só vincule uma conta se o dinheiro passa por ela. Uma posição pode existir sozinha.',
    'dashboard.investments': 'Investimentos',
    'modal.addPosition': 'Nova posição',
    'modal.editPosition': 'Editar posição',
    'modal.move': 'Aporte ou resgate'

  },
  'en': {
    'tabs.dashboard': 'Dashboard',
    'tabs.accounts': 'Accounts',
    'tabs.balances': 'Daily Balances',
    'tabs.transactions': 'Transactions',
    'tabs.budgets': 'Budgets',
    'tabs.settings': 'Settings',
    'dashboard.totalEquity': 'Financial',
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
    'tabs.fx': 'FX',
    'fx.title': 'Exchange Rates',
    'fx.add': '+ New rate',
    'fx.fetch': "Fetch today's rates",
    'fx.hint': 'Rates are recorded against the euro. To consolidate equity, the app uses the most recent rate up to the date requested.',
    'fx.date': 'Date',
    'fx.currency': 'Currency',
    'fx.rate': 'Rate',
    'fx.rateLabel': 'How many units of this currency equal 1 EUR',
    'fx.inverse': 'Inverse',
    'fx.empty': 'No rates yet. Use "Fetch today\'s rates" or add one manually.',
    'fx.missing': 'No exchange rate for: {list}. The consolidated total ignores these currencies.',
    'fx.fetched': '{n} rates updated.',
    'fx.fetchError': 'Could not fetch rates online. Check your connection or add them manually.',
    'dashboard.consolidated': 'Consolidated in {code}',
    'modal.addFx': 'New exchange rate',
    'modal.editFx': 'Edit exchange rate',
    'tabs.portfolio': 'Portfolio',
    'portfolio.title': 'Portfolio',
    'portfolio.properties': 'Properties',
    'portfolio.vehicles': 'Vehicles',
    'portfolio.addProperty': '+ New property',
    'portfolio.addVehicle': '+ New vehicle',
    'portfolio.name': 'Name',
    'portfolio.currency': 'Currency',
    'portfolio.value': 'Current value',
    'portfolio.debt': 'Debt',
    'portfolio.net': 'Net',
    'portfolio.acquiredDate': 'Acquisition date',
    'portfolio.acquiredValue': 'Acquisition value',
    'portfolio.acquiredDebt': 'Initial debt (mortgage/loan)',
    'portfolio.depreciation': 'Annual depreciation (%)',
    'portfolio.depreciationHint': 'Used only while there is no newer appraisal. Any recorded appraisal overrides the calculation.',
    'portfolio.valuations': 'Appraisals',
    'portfolio.addValuation': 'Record appraisal',
    'portfolio.valuationDate': 'Date',
    'portfolio.emptyProperties': 'No properties yet.',
    'portfolio.emptyVehicles': 'No vehicles yet.',
    'portfolio.noValuations': 'No appraisals. The value shown starts from acquisition.',
    'portfolio.estimated': 'estimated',
    'portfolio.vehicleKind': 'Vehicle type',
    'portfolio.vk.car': 'Car',
    'portfolio.vk.motorcycle': 'Motorcycle',
    'portfolio.vk.boat': 'Boat',
    'portfolio.vk.helicopter': 'Helicopter',
    'portfolio.vk.plane': 'Plane',
    'portfolio.tax': 'Tax',
    'portfolio.taxAmount': 'Tax amount',
    'portfolio.taxPeriod': 'Tax frequency',
    'portfolio.taxNone': 'No tax',
    'portfolio.taxMonthly': 'Monthly',
    'portfolio.taxAnnual': 'Annual',
    'portfolio.taxPerYear': '/year',
    'portfolio.taxPerMonth': '/month',
    'portfolio.taxTotal': 'Taxes per year',
    'portfolio.taxBill': 'Create payable',
    'portfolio.taxHint': 'The amount becomes a recurring payable when you click "Create payable" on the asset row.',
    'portfolio.total': 'Total',
    'dashboard.properties': 'Properties',
    'dashboard.vehicles': 'Vehicles',
    'dashboard.debt': 'Debt',
    'dashboard.nav': 'Net Worth',
    'modal.addProperty': 'New property',
    'modal.editProperty': 'Edit property',
    'modal.addVehicle': 'New vehicle',
    'modal.editVehicle': 'Edit vehicle',
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
    'toast.invalidValue': 'Enter a valid amount (e.g. 620,000.00).',
    'toast.nothingToExport': 'No daily balances to export. Record a balance first.',
    'balances.snapshot': "Record today's balance",
    'balances.snapshotDone': "Today's balance recorded for {n} accounts.",
    'nav.approx': 'Periods before the oldest exchange rate use that rate and are approximate.',
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
    'modal.delete': 'Delete',
    'nav.title': 'Net Worth Evolution',
    'nav.hint': 'Monthly series consolidated in the base currency. Currencies without a rate are excluded.',
    'nav.empty': 'Not enough data for the chart.',
    'nav.financial': 'Financial',
    'nav.properties': 'Properties',
    'nav.vehicles': 'Vehicles',
    'nav.debt': 'Debt',
    'nav.net': 'Net Worth',
    'nav.viewPie': 'Composition',
    'nav.viewLine': 'Evolution',
    'nav.breakdown': 'Break down by',
    'nav.byClass': 'Class',
    'nav.byCurrency': 'Currency',
    'nav.byAccount': 'Account / asset',
    'nav.others': 'Others',
    'nav.pieTitle': 'Wealth Composition',
    'nav.pieNote': 'Slices in {code}, as of today. Debt is not shown in the chart.',
    'tabs.bills': 'Payables / Receivables',
    'bill.title': 'Payables and Receivables',
    'bill.add': '+ New bill',
    'bill.schedules': 'Registered bills',
    'bill.installments': 'Installments',
    'bill.kind': 'Type',
    'bill.receivable': 'Receivable',
    'bill.payable': 'Payable',
    'bill.description': 'Description',
    'bill.account': 'Account',
    'bill.category': 'Category',
    'bill.principal': 'Total amount (before interest)',
    'bill.principalPer': 'Amount per installment',
    'bill.amountMode': 'The amount entered is',
    'bill.asTotal': 'The total of the bill',
    'bill.asInstallment': 'The amount of each installment',
    'bill.startDate': 'First due date',
    'bill.frequency': 'Recurrence',
    'bill.limit': 'Limited by',
    'bill.byCount': 'Number of installments',
    'bill.byEnd': 'End date',
    'bill.count': 'Installments',
    'bill.endDate': 'End date',
    'bill.interest': 'Financing interest',
    'bill.interestType': 'Interest type',
    'bill.interestRate': 'Rate per installment (%)',
    'bill.late': 'Late interest',
    'bill.lateType': 'Late interest type',
    'bill.lateRate': 'Monthly rate (%)',
    'bill.none': 'No interest',
    'bill.simple': 'Simple',
    'bill.compound': 'Compound',
    'bill.preview': 'Preview',
    'bill.previewText': '{n}x of {valor} · total {total}',
    'bill.dueDate': 'Due date',
    'bill.value': 'Amount',
    'bill.lateAmount': 'Late fee',
    'bill.amount': 'Total',
    'bill.status': 'Status',
    'bill.open': 'Open',
    'bill.overdue': 'Overdue',
    'bill.paid': 'Paid',
    'bill.pay': 'Settle',
    'bill.unpay': 'Undo',
    'bill.all': 'All',
    'bill.filterStatus': 'Status',
    'bill.from': 'From',
    'bill.to': 'To',
    'bill.emptySchedules': 'No bills registered.',
    'bill.emptyInstallments': 'No installments for this filter.',
    'bill.confirmPay': 'Settle installment',
    'bill.paidDate': 'Payment date',
    'bill.paidValue': 'Amount paid',
    'bill.payNote': 'Settling creates an entry in the account and moves the balance.',
    'bill.totalOpen': 'Open receivables',
    'bill.totalDue': 'Open payables',
    'bill.noAccounts': 'Create an account before adding bills.',
    'bill.freq.once': 'One-off',
    'bill.freq.daily': 'Daily',
    'bill.freq.weekly': 'Weekly',
    'bill.freq.biweekly': 'Biweekly',
    'bill.freq.monthly': 'Monthly',
    'bill.freq.bimonthly': 'Bimonthly',
    'bill.freq.quarterly': 'Quarterly',
    'bill.freq.semiannual': 'Semiannual',
    'bill.freq.annual': 'Annual',
    'cash.title': 'Money In and Out',
    'cash.in': 'In',
    'cash.out': 'Out',
    'cash.realized': 'actual',
    'cash.forecast': 'forecast',
    'cash.note': 'Solid bars are actuals; hatched bars are forecast from open installments. Values in {code}.',
    'cash.empty': 'No movement in the period.',
    'cash.grain': 'Group by',
    'cash.daily': 'Daily',
    'cash.weekly': 'Weekly',
    'cash.monthly': 'Monthly',
    'modal.addBill': 'New bill',
    'modal.editBill': 'Edit bill',
    'tabs.investments': 'Investments',
    'inv.title': 'Investment Portfolio',
    'inv.add': '+ New position',
    'inv.name': 'Name',
    'inv.account': 'Account / broker',
    'inv.kind': 'How to track',
    'inv.kindQuote': 'Quantity × price',
    'inv.kindValue': 'Updated total value',
    'inv.kindHint': 'Use price for stocks, funds and crypto. Use total value for fixed income, where there is no quantity.',
    'inv.currency': 'Currency',
    'inv.quantity': 'Quantity',
    'inv.price': 'Price',
    'inv.value': 'Current value',
    'inv.cost': 'Cost',
    'inv.return': 'Return',
    'inv.empty': 'No positions yet.',
    'inv.quotes': 'Prices',
    'inv.addQuote': 'Record price',
    'inv.quoteDate': 'Date',
    'inv.quotePrice': 'Unit price',
    'inv.quoteValue': 'Total value on the date',
    'inv.noQuotes': 'No prices recorded. The position is worth its cost until there is one.',
    'inv.moves': 'Contributions and withdrawals',
    'inv.move': 'Move',
    'inv.buy': 'Contribution',
    'inv.sell': 'Withdrawal',
    'inv.moveType': 'Type',
    'inv.moveDate': 'Date',
    'inv.moveQty': 'Quantity',
    'inv.moveAmount': 'Cash amount',
    'inv.moveAccount': 'Source / destination account',
    'inv.createLaunch': 'Create entry in the account',
    'inv.launchHint': 'Uncheck only when adding a position that already exists and whose money already left the account.',
    'inv.noMoves': 'No movements.',
    'inv.totalValue': 'Portfolio value',
    'inv.totalCost': 'Total cost',
    'inv.totalReturn': 'Return',
    'inv.noAccounts': 'Create an account before adding positions.',
    'inv.noAccount': 'No linked account',
    'inv.class': 'Class',
    'inv.classFixed': 'Fixed income',
    'inv.classVariable': 'Variable income',
    'inv.type': 'Asset type',
    'inv.ty.stock': 'Stock',
    'inv.ty.fii': 'REIT',
    'inv.ty.etf': 'ETF',
    'inv.ty.bdr': 'BDR',
    'inv.ty.treasury': 'Government bond',
    'inv.ty.cdb': 'Bank note',
    'inv.ty.fund': 'Fund',
    'inv.ty.crypto': 'Crypto',
    'inv.ty.other': 'Other',
    'inv.isin': 'ISIN',
    'inv.ticker': 'Trading symbol (ticker)',
    'inv.tickerHint': 'The ISIN is stored for your records. Automatic updates, where possible, use the ticker.',
    'inv.updateAll': 'Update all',
    'inv.updating': 'Updating…',
    'inv.updateDone': 'FX: {fx}. Prices: {q}.',
    'inv.updateNoTicker': 'no position with a ticker',
    'inv.updateFail': 'could not fetch',
    'inv.updateOk': '{n} updated',
    'inv.dupTitle': 'Possible double counting',
    'inv.dupText': '{valor} in "{posicao}" never left the balance of account {conta}. The same money is counted twice: once in Financial and once in Investments.',
    'inv.dupFix': 'Deduct from the account',
    'inv.dupHint': 'If that money was never in this account, the fix is different: edit the position and choose "No linked account".',
    'inv.dupFixed': 'Fixed. The amount left the account balance.',
    'inv.initial': 'Amount already invested (optional)',
    'inv.initialQty': 'Quantity already held',
    'inv.deduct': 'Deduct this amount from the linked account',
    'inv.deductHint': 'Check if the money is still in that account balance — it then moves out of there and counts as an investment, without double counting.',
    'inv.accountHint': 'Only link an account if the money flows through it. A position can stand alone.',
    'dashboard.investments': 'Investments',
    'modal.addPosition': 'New position',
    'modal.editPosition': 'Edit position',
    'modal.move': 'Contribution or withdrawal'
  },
  'es': {
    'tabs.dashboard': 'Panel',
    'tabs.accounts': 'Cuentas',
    'tabs.balances': 'Saldos Diarios',
    'tabs.transactions': 'Transacciones',
    'tabs.budgets': 'Presupuestos',
    'tabs.settings': 'Configuración',
    'dashboard.totalEquity': 'Financiero',
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
    'tabs.fx': 'Cambio',
    'fx.title': 'Tipos de Cambio',
    'fx.add': '+ Nueva tasa',
    'fx.fetch': 'Buscar tasas de hoy',
    'fx.hint': 'Las tasas se registran respecto al euro. Para consolidar el patrimonio, el app usa la tasa más reciente hasta la fecha consultada.',
    'fx.date': 'Fecha',
    'fx.currency': 'Moneda',
    'fx.rate': 'Tasa',
    'fx.rateLabel': 'Cuántas unidades de esta moneda equivalen a 1 EUR',
    'fx.inverse': 'Inverso',
    'fx.empty': 'Sin tasas registradas. Use "Buscar tasas de hoy" o registre una manualmente.',
    'fx.missing': 'Sin tipo de cambio para: {list}. El total consolidado ignora esas monedas.',
    'fx.fetched': '{n} tasas actualizadas.',
    'fx.fetchError': 'No se pudieron buscar las tasas en línea. Verifique la conexión o regístrelas manualmente.',
    'dashboard.consolidated': 'Consolidado en {code}',
    'modal.addFx': 'Nueva tasa de cambio',
    'modal.editFx': 'Editar tasa de cambio',
    'tabs.portfolio': 'Portafolio',
    'portfolio.title': 'Portafolio',
    'portfolio.properties': 'Inmuebles',
    'portfolio.vehicles': 'Vehículos',
    'portfolio.addProperty': '+ Nuevo inmueble',
    'portfolio.addVehicle': '+ Nuevo vehículo',
    'portfolio.name': 'Nombre',
    'portfolio.currency': 'Moneda',
    'portfolio.value': 'Valor actual',
    'portfolio.debt': 'Deuda',
    'portfolio.net': 'Neto',
    'portfolio.acquiredDate': 'Fecha de adquisición',
    'portfolio.acquiredValue': 'Valor de adquisición',
    'portfolio.acquiredDebt': 'Deuda inicial (hipoteca/préstamo)',
    'portfolio.depreciation': 'Depreciación anual (%)',
    'portfolio.depreciationHint': 'Se usa solo mientras no haya una tasación más reciente. Cualquier tasación registrada reemplaza el cálculo.',
    'portfolio.valuations': 'Tasaciones',
    'portfolio.addValuation': 'Registrar tasación',
    'portfolio.valuationDate': 'Fecha',
    'portfolio.emptyProperties': 'Sin inmuebles registrados.',
    'portfolio.emptyVehicles': 'Sin vehículos registrados.',
    'portfolio.noValuations': 'Sin tasaciones. El valor mostrado parte de la adquisición.',
    'portfolio.estimated': 'estimado',
    'portfolio.vehicleKind': 'Tipo de vehículo',
    'portfolio.vk.car': 'Coche',
    'portfolio.vk.motorcycle': 'Moto',
    'portfolio.vk.boat': 'Barco',
    'portfolio.vk.helicopter': 'Helicóptero',
    'portfolio.vk.plane': 'Avión',
    'portfolio.tax': 'Impuesto',
    'portfolio.taxAmount': 'Importe del impuesto',
    'portfolio.taxPeriod': 'Periodicidad del impuesto',
    'portfolio.taxNone': 'Sin impuesto',
    'portfolio.taxMonthly': 'Mensual',
    'portfolio.taxAnnual': 'Anual',
    'portfolio.taxPerYear': '/año',
    'portfolio.taxPerMonth': '/mes',
    'portfolio.taxTotal': 'Impuestos al año',
    'portfolio.taxBill': 'Crear cuenta por pagar',
    'portfolio.taxHint': 'El importe se convierte en una cuenta por pagar recurrente al pulsar "Crear cuenta por pagar" en la fila del bien.',
    'portfolio.total': 'Total',
    'dashboard.properties': 'Inmuebles',
    'dashboard.vehicles': 'Vehículos',
    'dashboard.debt': 'Deudas',
    'dashboard.nav': 'Patrimonio Neto',
    'modal.addProperty': 'Nuevo inmueble',
    'modal.editProperty': 'Editar inmueble',
    'modal.addVehicle': 'Nuevo vehículo',
    'modal.editVehicle': 'Editar vehículo',
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
    'toast.invalidValue': 'Introduzca un importe válido (ej.: 620.000,00).',
    'toast.nothingToExport': 'No hay saldos diarios para exportar. Use "Registrar saldo de hoy" primero.',
    'balances.snapshot': 'Registrar saldo de hoy',
    'balances.snapshotDone': 'Saldo de hoy registrado en {n} cuentas.',
    'nav.approx': 'Los períodos anteriores a la tasa más antigua usan esa tasa y son aproximados.',
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
    'modal.delete': 'Eliminar',
    'nav.title': 'Evolución del Patrimonio',
    'nav.hint': 'Serie mensual consolidada en la moneda base. Las monedas sin tasa quedan fuera.',
    'nav.empty': 'Datos insuficientes para el gráfico.',
    'nav.financial': 'Financiero',
    'nav.properties': 'Inmuebles',
    'nav.vehicles': 'Vehículos',
    'nav.debt': 'Deudas',
    'nav.net': 'Patrimonio Neto',
    'nav.viewPie': 'Composición',
    'nav.viewLine': 'Evolución',
    'nav.breakdown': 'Separar por',
    'nav.byClass': 'Clase',
    'nav.byCurrency': 'Moneda',
    'nav.byAccount': 'Cuenta / bien',
    'nav.others': 'Otros',
    'nav.pieTitle': 'Composición del Patrimonio',
    'nav.pieNote': 'Porciones en {code}, a fecha de hoy. Las deudas no entran en el gráfico.',
    'tabs.bills': 'Por Pagar / Cobrar',
    'bill.title': 'Cuentas por Pagar y por Cobrar',
    'bill.add': '+ Nuevo título',
    'bill.schedules': 'Títulos registrados',
    'bill.installments': 'Cuotas',
    'bill.kind': 'Tipo',
    'bill.receivable': 'Por cobrar',
    'bill.payable': 'Por pagar',
    'bill.description': 'Descripción',
    'bill.account': 'Cuenta',
    'bill.category': 'Categoría',
    'bill.principal': 'Importe total (sin intereses)',
    'bill.principalPer': 'Importe de cada cuota',
    'bill.amountMode': 'El importe indicado es',
    'bill.asTotal': 'El total del título',
    'bill.asInstallment': 'El importe de cada cuota',
    'bill.startDate': 'Primer vencimiento',
    'bill.frequency': 'Recurrencia',
    'bill.limit': 'Limitado por',
    'bill.byCount': 'Número de cuotas',
    'bill.byEnd': 'Fecha final',
    'bill.count': 'Cuotas',
    'bill.endDate': 'Fecha final',
    'bill.interest': 'Intereses de financiación',
    'bill.interestType': 'Tipo de interés',
    'bill.interestRate': 'Tasa por cuota (%)',
    'bill.late': 'Intereses de mora',
    'bill.lateType': 'Tipo de mora',
    'bill.lateRate': 'Tasa mensual (%)',
    'bill.none': 'Sin intereses',
    'bill.simple': 'Simples',
    'bill.compound': 'Compuestos',
    'bill.preview': 'Vista previa',
    'bill.previewText': '{n}x de {valor} · total {total}',
    'bill.dueDate': 'Vencimiento',
    'bill.value': 'Importe',
    'bill.lateAmount': 'Mora',
    'bill.amount': 'Total',
    'bill.status': 'Estado',
    'bill.open': 'Pendiente',
    'bill.overdue': 'Vencida',
    'bill.paid': 'Pagada',
    'bill.pay': 'Liquidar',
    'bill.unpay': 'Deshacer',
    'bill.all': 'Todas',
    'bill.filterStatus': 'Estado',
    'bill.from': 'Desde',
    'bill.to': 'Hasta',
    'bill.emptySchedules': 'Sin títulos registrados.',
    'bill.emptyInstallments': 'Sin cuotas para este filtro.',
    'bill.confirmPay': 'Liquidar cuota',
    'bill.paidDate': 'Fecha de pago',
    'bill.paidValue': 'Importe pagado',
    'bill.payNote': 'La liquidación genera un movimiento en la cuenta y mueve el saldo.',
    'bill.totalOpen': 'Por cobrar pendiente',
    'bill.totalDue': 'Por pagar pendiente',
    'bill.noAccounts': 'Cree una cuenta antes de añadir títulos.',
    'bill.freq.once': 'Única',
    'bill.freq.daily': 'Diaria',
    'bill.freq.weekly': 'Semanal',
    'bill.freq.biweekly': 'Quincenal',
    'bill.freq.monthly': 'Mensual',
    'bill.freq.bimonthly': 'Bimestral',
    'bill.freq.quarterly': 'Trimestral',
    'bill.freq.semiannual': 'Semestral',
    'bill.freq.annual': 'Anual',
    'cash.title': 'Entradas y Salidas',
    'cash.in': 'Entradas',
    'cash.out': 'Salidas',
    'cash.realized': 'realizado',
    'cash.forecast': 'previsto',
    'cash.note': 'Las barras llenas son lo realizado; las rayadas, lo previsto por las cuotas pendientes. Valores en {code}.',
    'cash.empty': 'Sin movimiento en el período.',
    'cash.grain': 'Agrupar por',
    'cash.daily': 'Diario',
    'cash.weekly': 'Semanal',
    'cash.monthly': 'Mensual',
    'modal.addBill': 'Nuevo título',
    'modal.editBill': 'Editar título',
    'tabs.investments': 'Inversiones',
    'inv.title': 'Cartera de Inversiones',
    'inv.add': '+ Nueva posición',
    'inv.name': 'Nombre',
    'inv.account': 'Cuenta / bróker',
    'inv.kind': 'Forma de seguimiento',
    'inv.kindQuote': 'Cantidad × cotización',
    'inv.kindValue': 'Valor total actualizado',
    'inv.kindHint': 'Use cotización para acciones, fondos y cripto. Use valor total para renta fija, donde no hay cantidad.',
    'inv.currency': 'Moeda',
    'inv.quantity': 'Cantidad',
    'inv.price': 'Cotización',
    'inv.value': 'Valor actual',
    'inv.cost': 'Coste',
    'inv.return': 'Rentabilidade',
    'inv.empty': 'Sin posiciones registradas.',
    'inv.quotes': 'Cotizaciones',
    'inv.addQuote': 'Registrar cotización',
    'inv.quoteDate': 'Fecha',
    'inv.quotePrice': 'Cotización unitaria',
    'inv.quoteValue': 'Valor total en la fecha',
    'inv.noQuotes': 'Sin cotizaciones. La posición vale su coste mientras no haya una.',
    'inv.moves': 'Aportes y rescates',
    'inv.move': 'Mover',
    'inv.buy': 'Aporte',
    'inv.sell': 'Rescate',
    'inv.moveType': 'Tipo',
    'inv.moveDate': 'Fecha',
    'inv.moveQty': 'Cantidad',
    'inv.moveAmount': 'Importe en efectivo',
    'inv.moveAccount': 'Cuenta de origen / destino',
    'inv.createLaunch': 'Generar movimiento en la cuenta',
    'inv.launchHint': 'Desmarque solo al registrar una posición que ya existe y cuyo dinero ya salió de la cuenta.',
    'inv.noMoves': 'Sin movimientos.',
    'inv.totalValue': 'Valor de la cartera',
    'inv.totalCost': 'Coste total',
    'inv.totalReturn': 'Rentabilidade',
    'inv.noAccounts': 'Cree una cuenta antes de añadir posiciones.',
    'inv.noAccount': 'Sin cuenta vinculada',
    'inv.class': 'Clase',
    'inv.classFixed': 'Renta fija',
    'inv.classVariable': 'Renta variable',
    'inv.type': 'Tipo de activo',
    'inv.ty.stock': 'Acción',
    'inv.ty.fii': 'REIT',
    'inv.ty.etf': 'ETF',
    'inv.ty.bdr': 'BDR',
    'inv.ty.treasury': 'Deuda pública',
    'inv.ty.cdb': 'Depósito bancario',
    'inv.ty.fund': 'Fondo',
    'inv.ty.crypto': 'Cripto',
    'inv.ty.other': 'Otro',
    'inv.isin': 'ISIN',
    'inv.ticker': 'Código de negociación (ticker)',
    'inv.tickerHint': 'El ISIN se guarda para su control. La actualización automática, cuando es posible, usa el ticker.',
    'inv.updateAll': 'Actualizar todo',
    'inv.updating': 'Actualizando…',
    'inv.updateDone': 'Cambio: {fx}. Cotizaciones: {q}.',
    'inv.updateNoTicker': 'ninguna posición con ticker',
    'inv.updateFail': 'no se pudo consultar',
    'inv.updateOk': '{n} actualizadas',
    'inv.dupTitle': 'Posible duplicidad en el patrimonio',
    'inv.dupText': '{valor} en "{posicao}" nunca salió del saldo de la cuenta {conta}. El mismo dinero se cuenta dos veces: en Financiero y en Inversiones.',
    'inv.dupFix': 'Descontar de la cuenta',
    'inv.dupHint': 'Si ese dinero nunca estuvo en esa cuenta, la corrección es otra: edite la posición y elija "Sin cuenta vinculada".',
    'inv.dupFixed': 'Corregido. El importe salió del saldo de la cuenta.',
    'inv.initial': 'Importe ya invertido (opcional)',
    'inv.initialQty': 'Cantidad ya poseída',
    'inv.deduct': 'Descontar este importe de la cuenta vinculada',
    'inv.deductHint': 'Marque si el dinero sigue en el saldo de esa cuenta — así sale de allí y pasa a contar como inversión, sin duplicar el patrimonio.',
    'inv.accountHint': 'Vincule una cuenta solo si el dinero pasa por ella. Una posición puede existir sola.',
    'dashboard.investments': 'Inversiones',
    'modal.addPosition': 'Nueva posición',
    'modal.editPosition': 'Editar posición',
    'modal.move': 'Aporte o rescate'
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
const DB_VERSION = 5; // Fase 7: posições de investimento, cotações e movimentações
let db = null;
let state = {
  accounts: [],
  balances: [],
  transactions: [],
  budgets: [],
  fx: [],
  schedules: [],
  payments: [],
  positions: [],
  quotes: [],
  invmoves: [],
  assets: [],
  valuations: [],
  settings: { lang: 'pt-BR', theme: 'default', baseCurrency: 'EUR' },
  ui: { txType: 'all', txAccount: 'all', txMonth: '', budgetMonth: '', navView: 'pie', navBreak: 'currency', cashGrain: 'monthly',
        billKind: 'all', billStatus: 'open', billFrom: '', billTo: '' }
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
      // Fase 7 — carteira de investimentos
      if (!d.objectStoreNames.contains('positions')) {
        const s = d.createObjectStore('positions', { keyPath: 'id' });
        s.createIndex('accountId', 'accountId');
      }
      if (!d.objectStoreNames.contains('quotes')) {
        const s = d.createObjectStore('quotes', { keyPath: 'id' });
        s.createIndex('positionId', 'positionId');
        s.createIndex('date', 'date');
      }
      if (!d.objectStoreNames.contains('invmoves')) {
        const s = d.createObjectStore('invmoves', { keyPath: 'id' });
        s.createIndex('positionId', 'positionId');
        s.createIndex('date', 'date');
      }

      // Fase 6 — títulos (a pagar/receber) e as quitações de suas parcelas
      if (!d.objectStoreNames.contains('schedules')) {
        const s = d.createObjectStore('schedules', { keyPath: 'id' });
        s.createIndex('kind', 'kind');
        s.createIndex('accountId', 'accountId');
      }
      if (!d.objectStoreNames.contains('payments')) {
        const s = d.createObjectStore('payments', { keyPath: 'id' });
        s.createIndex('scheduleId', 'scheduleId');
        s.createIndex('paidDate', 'paidDate');
      }

      // Fase 4 — ativos (imóveis e veículos) e suas avaliações datadas
      if (!d.objectStoreNames.contains('assets')) {
        const s = d.createObjectStore('assets', { keyPath: 'id' });
        s.createIndex('type', 'type');
      }
      if (!d.objectStoreNames.contains('valuations')) {
        const s = d.createObjectStore('valuations', { keyPath: 'id' });
        s.createIndex('assetId', 'assetId');
        s.createIndex('date', 'date');
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
  state.fx = await getAll('fx');
  state.schedules = await getAll('schedules');
  state.payments = await getAll('payments');
  state.positions = await getAll('positions');
  state.quotes = await getAll('quotes');
  state.invmoves = await getAll('invmoves');
  state.assets = await getAll('assets');
  state.valuations = await getAll('valuations');
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
/* Lê um campo de dinheiro aceitando os dois formatos que um teclado
   brasileiro produz: "620.000,50", "620000.50", "620000,50" e "620.000".
   Devolve null quando o campo está vazio ou ilegível — null e zero são
   coisas diferentes, e confundir os dois foi o que apagou um imóvel. */
function parseMoney(raw) {
  let v = String(raw == null ? '' : raw).trim().replace(/\s/g, '');
  if (!v) return null;
  v = v.replace(/[^\d.,-]/g, '');
  if (!v || v === '-') return null;
  if (v.includes(',')) {
    // Vírgula presente: ela é o decimal, pontos são separadores de milhar
    v = v.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(v)) {
    // Só pontos e todos separando grupos de 3: são milhares ("620.000")
    v = v.replace(/\./g, '');
  }
  const n = Number(v);
  return isNaN(n) ? null : n;
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
function currentBalance(account, date) {
  const limit = date || null;
  const list = state.balances
    .filter((b) => b.accountId === account.id && (!limit || b.date <= limit))
    .sort((a, b) => a.date.localeCompare(b.date));
  const anchor = list.length ? list[list.length - 1] : null;
  const base = anchor ? Number(anchor.value) : Number(account.initialBalance) || 0;
  const since = anchor ? anchor.date : null;
  const delta = state.transactions.reduce((sum, trn) => {
    if (since && trn.date <= since) return sum;
    if (limit && trn.date > limit) return sum;
    return sum + signedAmount(trn, account.id);
  }, 0);
  return base + delta;
}

/* ---------- Câmbio (Fase 3) ----------
   Toda taxa é guardada em relação ao EURO, que funciona como pivô:
     rate = quantas unidades da moeda valem 1 EUR  (ex.: USD 1,08)
   Guardar contra um pivô fixo permite trocar a moeda base do app sem
   invalidar nada, e converter qualquer par: A -> EUR -> B.
   A taxa usada é a mais recente ATÉ a data consultada — mesma lógica de
   âncora dos saldos, para que o patrimônio de 2023 não use o câmbio de hoje. */
const FX_PIVOT = 'EUR';

// Quantas unidades de `code` valem 1 EUR na data informada. null se desconhecido.
function fxPerEur(code, date) {
  if (code === FX_PIVOT) return 1;
  const limit = date || todayISO();
  const list = state.fx
    .filter((r) => r.currency === code && r.date <= limit)
    .sort((a, b) => a.date.localeCompare(b.date));
  return list.length ? Number(list[list.length - 1].rate) : null;
}

// Converte um valor entre duas moedas. null quando falta alguma taxa.
function convert(value, from, to, date) {
  if (from === to) return Number(value) || 0;
  const rFrom = fxPerEur(from, date);
  const rTo = fxPerEur(to, date);
  if (rFrom == null || rTo == null || !rFrom) return null;
  return (Number(value) || 0) / rFrom * rTo;
}

/* Para o GRÁFICO histórico, faltar taxa antiga significa a linha inteira sumir.
   Nestes casos usamos a taxa mais antiga conhecida, e o gráfico avisa que o
   trecho é aproximado. O dashboard continua estrito: lá, sem taxa o valor fica
   de fora, porque ali o número precisa ser exato. */
let fxAproximou = false;

function fxPerEurApprox(code, date) {
  const exata = fxPerEur(code, date);
  if (exata != null) return exata;
  const lista = state.fx.filter((r) => r.currency === code).sort((a, b) => a.date.localeCompare(b.date));
  if (!lista.length) return null;
  fxAproximou = true;
  return Number(lista[0].rate);
}

function convertApprox(value, from, to, date) {
  if (from === to) return Number(value) || 0;
  const rDe = fxPerEurApprox(from, date);
  const rPara = fxPerEurApprox(to, date);
  if (rDe == null || rPara == null || !rDe) return null;
  return (Number(value) || 0) / rDe * rPara;
}

// Soma um mapa {moeda: valor} na moeda base. Devolve o total e o que ficou de fora.
function consolidate(byCurrency, base, date) {
  let total = 0;
  const missing = [];
  Object.keys(byCurrency).forEach((code) => {
    const converted = convert(byCurrency[code], code, base, date);
    if (converted == null) missing.push(code);
    else total += converted;
  });
  return { total, missing };
}


/* ---------- Carteira de investimentos (Fase 7) ----------
   Dois tipos de posição convivem:
   - 'quote': quantidade × cotação unitária (ações, fundos, cripto).
   - 'value': um valor total que é atualizado de tempos em tempos (renda fixa).
   Em ambos, quantidade e custo vêm das movimentações, e a cotação segue a
   mesma lógica de âncora do resto do app: vale a mais recente até a data. */

function quotesOf(positionId) {
  return state.quotes.filter((q) => q.positionId === positionId)
    .sort((a, b) => a.date.localeCompare(b.date));
}
function invMovesOf(positionId) {
  return state.invmoves.filter((m) => m.positionId === positionId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Quantidade e custo acumulados até a data. Na venda, o custo sai proporcional
// à fatia vendida — senão vender metade zeraria a rentabilidade da outra metade.
function positionStateAt(pos, date) {
  const limite = date || todayISO();
  let quantidade = 0, custo = 0;
  invMovesOf(pos.id).forEach((m) => {
    if (m.date > limite) return;
    const q = Number(m.quantity) || 0;
    const v = Number(m.amount) || 0;
    if (m.type === 'buy') { quantidade += q; custo += v; return; }
    if (pos.kind === 'quote' && quantidade > 0) {
      const fatia = Math.min(q / quantidade, 1);
      custo -= custo * fatia;
      quantidade -= q;
    } else {
      custo -= v;
    }
  });
  return { quantity: Math.max(quantidade, 0), cost: Math.max(custo, 0) };
}

// Última cotação até a data.
function positionQuoteAt(pos, date) {
  const limite = date || todayISO();
  const lista = quotesOf(pos.id).filter((q) => q.date <= limite);
  return lista.length ? lista[lista.length - 1] : null;
}

/* Valor da posição na data.
   Sem cotação registrada, a posição vale o que custou — melhor assumir que não
   rendeu nada do que inventar um número. */
function positionValue(pos, date) {
  const limite = date || todayISO();
  const st = positionStateAt(pos, limite);
  const cot = positionQuoteAt(pos, limite);

  if (pos.kind === 'quote') {
    if (!cot) return st.cost;
    return st.quantity * (Number(cot.value) || 0);
  }
  // Valor único: a cotação é o saldo naquele dia; aportes e resgates
  // posteriores a ela ainda precisam ser somados.
  if (!cot) return st.cost;
  let valor = Number(cot.value) || 0;
  invMovesOf(pos.id).forEach((m) => {
    if (m.date <= cot.date || m.date > limite) return;
    valor += (m.type === 'buy' ? 1 : -1) * (Number(m.amount) || 0);
  });
  return Math.max(valor, 0);
}

function positionReturn(pos, date) {
  const st = positionStateAt(pos, date);
  const valor = positionValue(pos, date);
  const lucro = valor - st.cost;
  return { value: valor, cost: st.cost, profit: lucro, pct: st.cost > 0 ? (lucro / st.cost) * 100 : 0 };
}

// Total da carteira por moeda, pronto para consolidar.
function investmentTotals(date) {
  const valor = {}, custo = {};
  state.positions.forEach((pos) => {
    const r = positionReturn(pos, date);
    valor[pos.currency] = (valor[pos.currency] || 0) + r.value;
    custo[pos.currency] = (custo[pos.currency] || 0) + r.cost;
  });
  return { value: valor, cost: custo };
}

/* ---------- Títulos a pagar e a receber (Fase 6) ----------
   Um título é uma PREVISÃO; o lançamento é o fato consumado. As parcelas são
   calculadas sob demanda a partir do título — gravar todas seria inviável numa
   recorrência diária de vários anos. O que se grava é a quitação. */

const FREQUENCIES = [
  { key: 'once', days: 0, months: 0 },
  { key: 'daily', days: 1 },
  { key: 'weekly', days: 7 },
  { key: 'biweekly', days: 14 },
  { key: 'monthly', months: 1 },
  { key: 'bimonthly', months: 2 },
  { key: 'quarterly', months: 3 },
  { key: 'semiannual', months: 6 },
  { key: 'annual', months: 12 }
];
const MAX_PARCELAS = 600; // trava de segurança para recorrências longas

// Soma n períodos a uma data ISO. Em meses, o dia é ajustado ao último dia
// válido: 31/01 + 1 mês vira 28/02, não 03/03.
function addPeriod(iso, freqKey, n) {
  const f = FREQUENCIES.find((x) => x.key === freqKey) || FREQUENCIES[0];
  const [y, m, d] = iso.split('-').map(Number);
  if (f.days) {
    const base = Date.UTC(y, m - 1, d) + f.days * n * 86400000;
    return new Date(base).toISOString().slice(0, 10);
  }
  if (f.months) {
    const alvoMes = m - 1 + f.months * n;
    const ultimo = new Date(Date.UTC(y, alvoMes + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, alvoMes, Math.min(d, ultimo))).toISOString().slice(0, 10);
  }
  return iso;
}

function diasEntre(de, ate) {
  return Math.floor((new Date(ate + 'T00:00:00Z') - new Date(de + 'T00:00:00Z')) / 86400000);
}

// Quantas parcelas o título tem: por número fixo ou até a data limite.
function scheduleCount(sch) {
  if (sch.frequency === 'once') return 1;
  if (Number(sch.count) > 0) return Math.min(Number(sch.count), MAX_PARCELAS);
  if (sch.endDate) {
    let n = 0, data = sch.startDate;
    while (data <= sch.endDate && n < MAX_PARCELAS) { n++; data = addPeriod(sch.startDate, sch.frequency, n); }
    return Math.max(n, 1);
  }
  return 1;
}

/* Valor da parcela.
   Juros simples: o montante é P*(1 + i*n), dividido igualmente.
   Juros compostos: Tabela Price, que é como funciona um parcelamento real —
   parcela fixa em que cada uma amortiza um pedaço e paga juros sobre o saldo. */
function installmentValue(sch) {
  const n = scheduleCount(sch);
  const P = Number(sch.principal) || 0;
  const i = (Number(sch.interestRate) || 0) / 100;
  if (!i || sch.interestType === 'none' || n <= 0) return P / Math.max(n, 1);
  if (sch.interestType === 'simple') return P * (1 + i * n) / n;
  return P * i / (1 - Math.pow(1 + i, -n));
}

/* Caminho inverso: o usuário informa quanto quer receber POR PARCELA e o
   sistema descobre o principal correspondente. Um aluguel de 4.500 por mês
   durante 40 meses é um título de 180.000, não de 4.500. */
function principalFromInstallment(parcela, n, tipo, taxaPct) {
  const i = (Number(taxaPct) || 0) / 100;
  const p = Number(parcela) || 0;
  if (!i || tipo === 'none' || n <= 0) return p * Math.max(n, 1);
  if (tipo === 'simple') return p * n / (1 + i * n);
  return p * (1 - Math.pow(1 + i, -n)) / i;
}

// Juros de mora, contados a partir do vencimento. A taxa é ao mês.
function lateInterest(sch, valorParcela, vencimento, referencia) {
  if (!sch.lateType || sch.lateType === 'none') return 0;
  const taxa = (Number(sch.lateRate) || 0) / 100;
  if (taxa <= 0) return 0;
  const dias = diasEntre(vencimento, referencia || todayISO());
  if (dias <= 0) return 0;
  const meses = dias / 30;
  return sch.lateType === 'simple'
    ? valorParcela * taxa * meses
    : valorParcela * (Math.pow(1 + taxa, meses) - 1);
}

function paymentFor(scheduleId, seq) {
  return state.payments.find((p) => p.scheduleId === scheduleId && p.seq === seq) || null;
}

/* Parcelas de um título, opcionalmente limitadas a uma janela de datas. */
function scheduleInstallments(sch, de, ate) {
  const n = scheduleCount(sch);
  const valor = installmentValue(sch);
  const hoje = todayISO();
  const out = [];
  for (let seq = 1; seq <= n; seq++) {
    const venc = addPeriod(sch.startDate, sch.frequency, seq - 1);
    if (de && venc < de) continue;
    if (ate && venc > ate) break;
    const pago = paymentFor(sch.id, seq);
    const mora = pago ? 0 : lateInterest(sch, valor, venc, hoje);
    out.push({
      scheduleId: sch.id, seq, total: n, dueDate: venc,
      value: valor, late: mora, amount: valor + mora,
      payment: pago,
      status: pago ? 'paid' : (venc < hoje ? 'overdue' : 'open')
    });
  }
  return out;
}

// Todas as parcelas de todos os títulos numa janela.
function allInstallments(de, ate) {
  const out = [];
  state.schedules.forEach((sch) => {
    scheduleInstallments(sch, de, ate).forEach((p) => out.push({ ...p, schedule: sch }));
  });
  return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/* ---------- Ativos: imóveis e veículos (Fase 4) ----------
   O valor parte da avaliação mais recente até a data consultada — mesma
   lógica de âncora dos saldos e do câmbio. Para veículos, a depreciação
   anual preenche APENAS o intervalo entre essa âncora e a data pedida.
   Registrar uma avaliação nova sempre substitui o cálculo: número real
   vence número estimado. */

const INV_TYPES = ['stock', 'fii', 'etf', 'bdr', 'treasury', 'cdb', 'fund', 'crypto', 'other'];
const VEHICLE_KINDS = ['car', 'motorcycle', 'boat', 'helicopter', 'plane'];

/* Imposto do bem, normalizado para o ano. Mensal x12 para dar para comparar
   um IPVA anual com um condomínio mensal na mesma régua. */
function assetAnnualTax(a) {
  const v = Number(a.taxAmount) || 0;
  if (!v || !a.taxPeriod || a.taxPeriod === 'none') return 0;
  return a.taxPeriod === 'monthly' ? v * 12 : v;
}

function valuationsOf(assetId) {
  return state.valuations
    .filter((v) => v.assetId === assetId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Âncora: a avaliação mais recente até a data, ou a própria aquisição.
function assetAnchor(asset, date) {
  const limit = date || todayISO();
  // Avaliações de valor zero são descartadas: ou vieram do bug antigo, ou não
  // dizem nada útil sobre o ativo. Sem isto, um registro zerado esconde o bem.
  const list = valuationsOf(asset.id).filter((v) => v.date <= limit && Number(v.value) > 0);
  if (list.length) {
    const last = list[list.length - 1];
    return { date: last.date, value: Number(last.value) || 0, debt: Number(last.debt) || 0, appraised: true };
  }
  return {
    date: asset.acquiredDate || limit,
    value: Number(asset.acquiredValue) || 0,
    debt: Number(asset.acquiredDebt) || 0,
    appraised: false
  };
}

function yearsBetween(from, to) {
  const ms = new Date(to + 'T00:00:00Z') - new Date(from + 'T00:00:00Z');
  return ms > 0 ? ms / (365.25 * 24 * 60 * 60 * 1000) : 0;
}

// Valor do ativo na data. Informa também se o número veio de depreciação.
function assetValue(asset, date) {
  const limit = date || todayISO();
  const anchor = assetAnchor(asset, limit);
  const rate = Number(asset.depreciation) || 0;

  if (asset.type !== 'vehicle' || rate <= 0) {
    return { value: anchor.value, estimated: false, anchor };
  }
  const years = yearsBetween(anchor.date, limit);
  if (years <= 0) return { value: anchor.value, estimated: false, anchor };

  const factor = Math.pow(Math.max(0, 1 - rate / 100), years);
  return { value: anchor.value * factor, estimated: true, anchor };
}

// A dívida não deprecia: vale o último saldo devedor informado.
function assetDebt(asset, date) {
  return assetAnchor(asset, date).debt;
}

/* Saldo de TODAS as contas em uma passagem só. A versão por conta varria a
   lista inteira de saldos e lançamentos a cada chamada: com 77 contas e 2.772
   saldos isso vira centenas de milhares de comparações por renderização. */
function currentBalancesAll() {
  const anchors = {};
  state.balances.forEach((b) => {
    const cur = anchors[b.accountId];
    if (!cur || b.date > cur.date) anchors[b.accountId] = b;
  });
  const acc = {};
  state.accounts.forEach((a) => {
    const an = anchors[a.id];
    acc[a.id] = {
      total: an ? Number(an.value) : Number(a.initialBalance) || 0,
      since: an ? an.date : null
    };
  });
  state.transactions.forEach((trn) => {
    const envolvidas = new Set([trn.accountId, trn.toAccountId].filter(Boolean));
    envolvidas.forEach((accId) => {
      const rec = acc[accId];
      if (!rec) return;
      if (rec.since && trn.date <= rec.since) return;
      rec.total += signedAmount(trn, accId);
    });
  });
  const out = {};
  state.accounts.forEach((a) => { out[a.id] = acc[a.id].total; });
  return out;
}

function assetsOfType(type) {
  return state.assets.filter((a) => a.type === type);
}

// Totais de uma classe, por moeda, prontos para consolidar.
function assetTotals(type, date) {
  const gross = {}, debt = {};
  assetsOfType(type).forEach((a) => {
    const code = a.currency;
    gross[code] = (gross[code] || 0) + assetValue(a, date).value;
    debt[code] = (debt[code] || 0) + assetDebt(a, date);
  });
  return { gross, debt };
}

function applyLang() {
  document.documentElement.lang = state.settings.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  renderLangButtons();
  renderAll();
}
function renderLangButtons() {
  const wrap = document.getElementById('langButtons');
  if (!wrap) return;
  wrap.innerHTML = LANGS.map((l) => `
    <button type="button" class="lang-btn ${state.settings.lang === l.code ? 'active' : ''}"
            data-lang="${l.code}" title="${l.label}" aria-label="${l.label}"
            aria-pressed="${state.settings.lang === l.code}">
      ${l.flags.map((f) => FLAGS[f]).join('')}
    </button>`).join('');
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.getElementById('themeSelect').value = state.settings.theme;
}

/* ---------- Renderização ---------- */
/* Cada seção é renderizada isoladamente. Se uma falhar — por elemento ausente
   num HTML defasado, por exemplo — as outras continuam aparecendo, em vez de a
   tela inteira ficar em branco. */
function renderAll() {
  const etapas = [
    ['dashboard', renderDashboard], ['contas', renderAccounts], ['saldos', renderBalances],
    ['transações', renderTransactions], ['orçamentos', renderBudgets], ['câmbio', renderFx],
    ['portfólio', renderPortfolio], ['gráfico', renderNAV], ['fluxo', renderCashflow], ['títulos', renderBills], ['investimentos', renderInvestments], ['configurações', renderSettings]
  ];
  etapas.forEach(([nome, fn]) => {
    try { fn(); } catch (e) { console.error('Falha ao renderizar ' + nome + ':', e); }
  });
}

function renderDashboard() {
  const base = state.settings.baseCurrency;

  // Patrimônio: soma dos saldos ATUAIS das contas, por moeda.
  const byCurrency = {};
  const saldos = currentBalancesAll();
  state.accounts.forEach((a) => {
    byCurrency[a.currency] = (byCurrency[a.currency] || 0) + saldos[a.id];
  });
  const keys = Object.keys(byCurrency).sort();
  const equity = consolidate(byCurrency, base, todayISO());
  const warn = document.getElementById('fxWarning');
  if (!keys.length) {
    document.getElementById('totalEquity').textContent = '—';
    document.getElementById('totalEquityBase').textContent = '';
    warn.classList.add('hidden');
  } else {
    document.getElementById('totalEquity').textContent = fmtMoney(equity.total, base);
    document.getElementById('totalEquityBase').textContent = keys.map((k) => fmtMoney(byCurrency[k], k)).join(' · ');
    if (equity.missing.length) {
      warn.textContent = t('fx.missing').replace('{list}', equity.missing.join(', '));
      warn.classList.remove('hidden');
    } else {
      warn.classList.add('hidden');
    }
  }
  document.getElementById('accountCount').textContent = state.accounts.length;
  document.getElementById('currencyCount').textContent = new Set(state.accounts.map((a) => a.currency)).size;
  const seletorBase = document.getElementById('dashBaseCurrency');
  if (seletorBase) {
    seletorBase.innerHTML = CURRENCIES.map((c) => `<option value="${c.code}" ${c.code === base ? 'selected' : ''}>${c.code}</option>`).join('');
  }

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

  // Classes de patrimônio e NAV
  const hoje = todayISO();
  const imoveis = assetTotals('property', hoje);
  const veiculos = assetTotals('vehicle', hoje);
  const dividas = {};
  [imoveis.debt, veiculos.debt].forEach((m) => {
    Object.keys(m).forEach((c) => { dividas[c] = (dividas[c] || 0) + m[c]; });
  });

  const carteira = investmentTotals(hoje);
  fillSummaryCard('invTotal', 'invTotalSub', carteira.value, base);
  fillSummaryCard('propTotal', 'propTotalSub', imoveis.gross, base);
  fillSummaryCard('vehTotal', 'vehTotalSub', veiculos.gross, base);
  fillSummaryCard('debtTotal', 'debtTotalSub', dividas, base);

  // Patrimônio líquido = financeiro + imóveis + veículos - dívidas
  const nav = equity.total
    + consolidate(carteira.value, base, hoje).total
    + consolidate(imoveis.gross, base, hoje).total
    + consolidate(veiculos.gross, base, hoje).total
    - consolidate(dividas, base, hoje).total;
  document.getElementById('navTotal').textContent = fmtMoney(nav, base);
}

function fillSummaryCard(mainId, subId, map, base) {
  const codes = Object.keys(map).sort();
  const main = document.getElementById(mainId);
  const sub = document.getElementById(subId);
  if (!codes.length) { main.textContent = fmtMoney(0, base); sub.textContent = ''; return; }
  const { total } = consolidate(map, base, todayISO());
  main.textContent = fmtMoney(total, base);
  // O detalhe por moeda continua visível: o consolidado depende de taxa, o original não.
  sub.textContent = codes.map((c) => fmtMoney(map[c], c)).join(' · ');
}

function renderAccounts() {
  const tbody = document.querySelector('#accountsTable tbody');
  const saldos = currentBalancesAll();
  // Uma única escrita no DOM em vez de uma por linha
  tbody.innerHTML = state.accounts.map((a) => `
    <tr>
      <td>${escapeHtml(a.name)}</td>
      <td>${t('accounts.type.' + a.type)}</td>
      <td>${a.currency}</td>
      <td>${fmtMoney(a.initialBalance, a.currency)}</td>
      <td><strong>${fmtMoney(saldos[a.id], a.currency)}</strong></td>
      <td>
        <button class="secondary-btn" onclick="openAccountModal('${a.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteAccount('${a.id}')">${t('modal.delete')}</button>
      </td>
    </tr>`).join('');
}

function renderBalances() {
  const thead = document.querySelector('#balancesTable thead tr');
  const tbody = document.querySelector('#balancesTable tbody');
  thead.innerHTML = `<th>${t('balances.date')}</th>` +
    state.accounts.map((a) => `<th>${escapeHtml(a.name)}</th>`).join('');
  // Índice date|accountId construído uma vez. Antes, cada célula fazia um find
  // na lista inteira: 2.772 células x 2.772 saldos = 7,7 milhões de comparações.
  const indice = new Map();
  state.balances.forEach((b) => indice.set(b.date + '|' + b.accountId, b));

  const dates = [...new Set(state.balances.map((b) => b.date))].sort();
  tbody.innerHTML = dates.map((date) =>
    `<tr><td><strong>${date}</strong></td>` +
    state.accounts.map((a) => {
      const b = indice.get(date + '|' + a.id);
      return `<td>${b ? fmtMoney(b.value, a.currency) : '—'}</td>`;
    }).join('') + '</tr>'
  ).join('');
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

  const contasPorId = new Map(state.accounts.map((a) => [a.id, a]));
  const linhas = rows.map((trn) => {
    const acc = contasPorId.get(trn.accountId);
    const code = acc ? acc.currency : state.settings.baseCurrency;
    let accountCell = acc ? escapeHtml(acc.name) : '—';
    let amountClass = 'amount-neutral';
    let amountText = fmtMoney(trn.value, code);
    let categoryCell = catLabel(trn.category);

    if (trn.type === 'income') { amountClass = 'amount-in'; amountText = '+ ' + amountText; }
    if (trn.type === 'expense') { amountClass = 'amount-out'; amountText = '− ' + amountText; }
    if (trn.type === 'transfer') {
      const to = contasPorId.get(trn.toAccountId);
      accountCell += ' → ' + (to ? escapeHtml(to.name) : '—');
      categoryCell = '—';
      if (to && trn.toValue != null && to.currency !== code) {
        amountText += ' → ' + fmtMoney(trn.toValue, to.currency);
      }
    }

    return `
      <tr>
        <td>${trn.date}</td>
        <td>${t('tx.' + trn.type)}</td>
        <td>${accountCell}</td>
        <td>${categoryCell}</td>
        <td>${escapeHtml(trn.description || '')}</td>
        <td class="${amountClass}">${amountText}</td>
        <td>
          <button class="secondary-btn" onclick="openTxModal('${trn.id}')">${t('modal.edit')}</button>
          <button class="secondary-btn" onclick="deleteTx('${trn.id}')">${t('modal.delete')}</button>
        </td>
      </tr>`;
  });
  tbody.innerHTML = linhas.join('');
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

/* ---------- Câmbio: tela e cadastro ---------- */
function fmtRate(n) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function renderFx() {
  const thead = document.querySelector('#fxTable thead tr');
  thead.innerHTML = `
    <th>${t('fx.date')}</th><th>${t('fx.currency')}</th>
    <th>1 ${FX_PIVOT} =</th><th>${t('fx.inverse')}</th><th>${t('accounts.actions')}</th>`;

  const tbody = document.querySelector('#fxTable tbody');
  const empty = document.getElementById('fxEmpty');
  tbody.innerHTML = '';

  const rows = state.fx.slice().sort((a, b) =>
    b.date.localeCompare(a.date) || a.currency.localeCompare(b.currency));

  if (!rows.length) {
    empty.textContent = t('fx.empty');
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  rows.forEach((r) => {
    const rate = Number(r.rate);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.currency}</td>
      <td><strong>${fmtRate(rate)} ${r.currency}</strong></td>
      <td>1 ${r.currency} = ${rate ? fmtRate(1 / rate) : '—'} ${FX_PIVOT}</td>
      <td>
        <button class="secondary-btn" onclick="openFxModal('${r.id}')">${t('modal.edit')}</button>
        <button class="secondary-btn" onclick="deleteFx('${r.id}')">${t('modal.delete')}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function openFxModal(id) {
  const r = id ? state.fx.find((x) => x.id === id) : null;
  openModal(`
    <h2>${r ? t('modal.editFx') : t('modal.addFx')}</h2>
    <label>${t('fx.date')}</label>
    <input id="fxDate" type="date" value="${r ? r.date : todayISO()}">
    <label>${t('fx.currency')}</label>
    <select id="fxCurrency">
      ${CURRENCIES.filter((c) => c.code !== FX_PIVOT).map((c) =>
        `<option value="${c.code}" ${r && r.currency === c.code ? 'selected' : ''}>${c.code}</option>`).join('')}
    </select>
    <label>${t('fx.rateLabel')}</label>
    <input id="fxRate" type="text" inputmode="decimal" value="${r ? r.rate : ''}" oninput="updateFxPreview()">
    <p class="hint" id="fxPreview"></p>
    <button class="primary-btn" onclick="saveFx('${r ? r.id : ''}')">${t('modal.save')}</button>
  `);
  updateFxPreview();
}

// Mostra o inverso enquanto você digita, para conferir se não inverteu a taxa.
function updateFxPreview() {
  const el = document.getElementById('fxPreview');
  if (!el) return;
  const code = document.getElementById('fxCurrency').value;
  const rate = parseMoney(document.getElementById('fxRate').value) || 0;
  el.textContent = rate > 0
    ? `1 ${FX_PIVOT} = ${fmtRate(rate)} ${code}  ·  1 ${code} = ${fmtRate(1 / rate)} ${FX_PIVOT}`
    : '';
}

async function saveFx(id) {
  const date = document.getElementById('fxDate').value;
  const code = document.getElementById('fxCurrency').value;
  const rate = parseMoney(document.getElementById('fxRate').value);
  if (!date || !code || rate == null || rate <= 0) { showToast(t('toast.invalidValue')); return; }

  // Uma taxa por moeda e data
  const existing = state.fx.find((x) => x.currency === code && x.date === date && x.id !== id);
  const record = { id: id || (existing ? existing.id : uid()), date, currency: code, rate };
  if (state.fx.some((x) => x.id === record.id)) {
    state.fx = state.fx.map((x) => (x.id === record.id ? record : x));
  } else {
    state.fx.push(record);
  }
  await put('fx', record);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteFx(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.fx = state.fx.filter((x) => x.id !== id);
  await del('fx', id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* Fontes de taxa, tentadas em ordem até uma responder. Todas são gratuitas,
   sem cadastro e com CORS liberado. Ter mais de uma evita que a mudança de
   endereço ou a queda de um serviço deixe o app sem câmbio. */
const FX_SOURCES = [
  {
    name: 'frankfurter.dev',
    url: () => `https://api.frankfurter.dev/v1/latest?base=${FX_PIVOT}`,
    parse: (d) => (d && d.rates) ? { date: d.date || todayISO(), rates: d.rates } : null
  },
  {
    name: 'jsDelivr currency-api',
    url: () => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${FX_PIVOT.toLowerCase()}.json`,
    parse: (d) => {
      const key = FX_PIVOT.toLowerCase();
      if (!d || !d[key]) return null;
      const rates = {};
      CURRENCIES.forEach((c) => {
        const v = d[key][c.code.toLowerCase()];
        if (c.code !== FX_PIVOT && Number(v)) rates[c.code] = Number(v);
      });
      return { date: d.date || todayISO(), rates };
    }
  },
  {
    name: 'open.er-api.com',
    url: () => `https://open.er-api.com/v6/latest/${FX_PIVOT}`,
    parse: (d) => (d && d.rates) ? { date: todayISO(), rates: d.rates } : null
  },
  {
    name: 'frankfurter.app',
    url: () => `https://api.frankfurter.app/latest?from=${FX_PIVOT}`,
    parse: (d) => (d && d.rates) ? { date: d.date || todayISO(), rates: d.rates } : null
  }
];

async function fetchRates() {
  const btn = document.getElementById('btnFetchRates');
  btn.disabled = true;
  const conhecidas = CURRENCIES.map((c) => c.code);
  let resultado = null;
  let ultimoErro = '';

  try {
    for (const source of FX_SOURCES) {
      try {
        const res = await fetch(source.url(), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const parsed = source.parse(await res.json());
        if (!parsed || !Object.keys(parsed.rates).length) throw new Error('resposta sem taxas');
        resultado = parsed;
        console.log('Taxas obtidas de', source.name, '-', parsed.date);
        break;
      } catch (e) {
        ultimoErro = source.name + ': ' + (e && e.message ? e.message : e);
        console.warn('Fonte de cambio indisponivel -', ultimoErro);
      }
    }

    if (!resultado) {
      showToast(t('fx.fetchError') + ' (' + ultimoErro + ')');
      return;
    }

    let n = 0;
    for (const [code, rate] of Object.entries(resultado.rates)) {
      if (!conhecidas.includes(code) || code === FX_PIVOT || !Number(rate)) continue;
      const existing = state.fx.find((x) => x.currency === code && x.date === resultado.date);
      const record = { id: existing ? existing.id : uid(), date: resultado.date, currency: code, rate: Number(rate) };
      if (existing) state.fx = state.fx.map((x) => (x.id === record.id ? record : x));
      else state.fx.push(record);
      await put('fx', record);
      n++;
    }
    renderAll();
    showToast(t('fx.fetched').replace('{n}', n));
  } finally {
    btn.disabled = false;
  }
}

/* ---------- Portfólio: imóveis e veículos ---------- */
function renderPortfolio() {
  ['property', 'vehicle'].forEach((type) => {
    const prefix = type === 'property' ? 'prop' : 'veh';
    const thead = document.querySelector('#' + prefix + 'Table thead tr');
    const tbody = document.querySelector('#' + prefix + 'Table tbody');
    const empty = document.getElementById(prefix + 'Empty');

    thead.innerHTML = `
      <th>${t('portfolio.name')}</th><th>${t('portfolio.currency')}</th>
      <th>${t('portfolio.value')}</th><th>${t('portfolio.debt')}</th>
      <th>${t('portfolio.net')}</th><th>${t('portfolio.tax')}</th>
      <th>${t('accounts.actions')}</th>`;

    const list = assetsOfType(type);
    tbody.innerHTML = '';
    if (!list.length) {
      empty.textContent = t(type === 'property' ? 'portfolio.emptyProperties' : 'portfolio.emptyVehicles');
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    const totalImposto = {};
    list.forEach((a) => {
      const anual = assetAnnualTax(a);
      if (anual > 0) totalImposto[a.currency] = (totalImposto[a.currency] || 0) + anual;
    });
    const elTax = document.getElementById(prefix + 'Tax');
    if (elTax) {
      const codes = Object.keys(totalImposto).sort();
      elTax.textContent = codes.length
        ? t('portfolio.taxTotal') + ': ' + codes.map((c) => fmtMoney(totalImposto[c], c)).join(' · ')
        : '';
    }

    list.forEach((a) => {
      const v = assetValue(a);
      const debt = assetDebt(a);
      const imposto = assetAnnualTax(a) > 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(a.name)}${a.type === 'vehicle' && a.vehicleKind ? ` <span class="tag">${t('portfolio.vk.' + a.vehicleKind)}</span>` : ''}</td>
        <td>${a.currency}</td>
        <td>${fmtMoney(v.value, a.currency)}${v.estimated ? ` <span class="tag">${t('portfolio.estimated')}</span>` : ''}</td>
        <td>${debt ? fmtMoney(debt, a.currency) : '—'}</td>
        <td><strong>${fmtMoney(v.value - debt, a.currency)}</strong></td>
        <td>${imposto ? fmtMoney(Number(a.taxAmount), a.currency) + ' <span class="tag">' + t(a.taxPeriod === 'monthly' ? 'portfolio.taxPerMonth' : 'portfolio.taxPerYear') + '</span>' : '—'}</td>
        <td>
          ${imposto ? `<button class="secondary-btn" onclick="billFromTax('${a.id}')">${t('portfolio.taxBill')}</button>` : ''}
          <button class="secondary-btn" onclick="openValuationsModal('${a.id}')">${t('portfolio.valuations')}</button>
          <button class="secondary-btn" onclick="openAssetModal('${type}','${a.id}')">${t('modal.edit')}</button>
          <button class="secondary-btn" onclick="deleteAsset('${a.id}')">${t('modal.delete')}</button>
        </td>`;
      tbody.appendChild(tr);
    });
  });
}

function openAssetModal(type, id) {
  const a = id ? state.assets.find((x) => x.id === id) : null;
  const isVehicle = type === 'vehicle';
  const titulo = a
    ? t(isVehicle ? 'modal.editVehicle' : 'modal.editProperty')
    : t(isVehicle ? 'modal.addVehicle' : 'modal.addProperty');

  openModal(`
    <h2>${titulo}</h2>
    <label>${t('portfolio.name')}</label>
    <input id="asName" value="${a ? escapeHtml(a.name) : ''}">
    <label>${t('portfolio.currency')}</label>
    <select id="asCurrency">
      ${CURRENCIES.map((c) => {
        const sel = a ? a.currency === c.code : c.code === state.settings.baseCurrency;
        return `<option value="${c.code}" ${sel ? 'selected' : ''}>${c.code}</option>`;
      }).join('')}
    </select>
    <label>${t('portfolio.acquiredDate')}</label>
    <input id="asDate" type="date" value="${a && a.acquiredDate ? a.acquiredDate : todayISO()}">
    <label>${t('portfolio.acquiredValue')}</label>
    <input id="asValue" type="text" inputmode="decimal" value="${a ? a.acquiredValue : ''}">
    <label>${t('portfolio.acquiredDebt')}</label>
    <input id="asDebt" type="text" inputmode="decimal" value="${a && a.acquiredDebt ? a.acquiredDebt : ''}">
    ${isVehicle ? `
      <label>${t('portfolio.vehicleKind')}</label>
      <select id="asVehicleKind">
        ${VEHICLE_KINDS.map((k) => `<option value="${k}" ${a && a.vehicleKind === k ? 'selected' : ''}>${t('portfolio.vk.' + k)}</option>`).join('')}
      </select>
      <label>${t('portfolio.depreciation')}</label>
      <input id="asDepreciation" type="number" step="0.1" min="0" max="100" value="${a && a.depreciation != null ? a.depreciation : 15}">
      <p class="hint">${t('portfolio.depreciationHint')}</p>` : ''}
    <label>${t('portfolio.taxPeriod')}</label>
    <select id="asTaxPeriod">
      <option value="none" ${!a || !a.taxPeriod || a.taxPeriod === 'none' ? 'selected' : ''}>${t('portfolio.taxNone')}</option>
      <option value="monthly" ${a && a.taxPeriod === 'monthly' ? 'selected' : ''}>${t('portfolio.taxMonthly')}</option>
      <option value="annual" ${a && a.taxPeriod === 'annual' ? 'selected' : ''}>${t('portfolio.taxAnnual')}</option>
    </select>
    <label>${t('portfolio.taxAmount')}</label>
    <input id="asTaxAmount" type="text" inputmode="decimal" value="${a && a.taxAmount ? a.taxAmount : ''}">
    <p class="hint">${t('portfolio.taxHint')}</p>
    <button class="primary-btn" onclick="saveAsset('${type}','${a ? a.id : ''}')">${t('modal.save')}</button>
  `);
}

async function saveAsset(type, id) {
  const name = document.getElementById('asName').value.trim();
  if (!name) return;
  const depEl = document.getElementById('asDepreciation');
  const asset = {
    id: id || uid(),
    type,
    name,
    currency: document.getElementById('asCurrency').value,
    acquiredDate: document.getElementById('asDate').value || todayISO(),
    acquiredValue: parseMoney(document.getElementById('asValue').value) || 0,
    acquiredDebt: parseMoney(document.getElementById('asDebt').value) || 0,
    depreciation: depEl ? (parseMoney(depEl.value) || 0) : 0,
    vehicleKind: type === 'vehicle' ? (document.getElementById('asVehicleKind') || {}).value || 'car' : null,
    taxPeriod: document.getElementById('asTaxPeriod').value,
    taxAmount: parseMoney(document.getElementById('asTaxAmount').value) || 0
  };
  if (id) state.assets = state.assets.map((x) => (x.id === id ? asset : x));
  else state.assets.push(asset);
  await put('assets', asset);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteAsset(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  for (const v of valuationsOf(id)) await del('valuations', v.id);
  state.valuations = state.valuations.filter((v) => v.assetId !== id);
  state.assets = state.assets.filter((x) => x.id !== id);
  await del('assets', id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* Avaliações de um ativo: histórico datado de valor e saldo devedor. */
function openValuationsModal(assetId) {
  const a = state.assets.find((x) => x.id === assetId);
  if (!a) return;
  const list = valuationsOf(assetId).slice().reverse();

  openModal(`
    <h2>${t('portfolio.valuations')} — ${escapeHtml(a.name)}</h2>
    ${list.length ? `
      <table class="mini-table">
        <thead><tr>
          <th>${t('portfolio.valuationDate')}</th><th>${t('portfolio.value')}</th>
          <th>${t('portfolio.debt')}</th><th></th>
        </tr></thead>
        <tbody>
          ${list.map((v) => `
            <tr>
              <td>${v.date}</td>
              <td>${fmtMoney(v.value, a.currency)}</td>
              <td>${v.debt ? fmtMoney(v.debt, a.currency) : '—'}</td>
              <td><button class="secondary-btn" onclick="deleteValuation('${v.id}','${assetId}')">${t('modal.delete')}</button></td>
            </tr>`).join('')}
        </tbody>
      </table>` : `<p class="hint">${t('portfolio.noValuations')}</p>`}

    <label>${t('portfolio.valuationDate')}</label>
    <input id="vlDate" type="date" value="${todayISO()}">
    <label>${t('portfolio.value')} (${a.currency})</label>
    <input id="vlValue" type="text" inputmode="decimal">
    <label>${t('portfolio.debt')} (${a.currency})</label>
    <input id="vlDebt" type="text" inputmode="decimal">
    <button class="primary-btn" onclick="saveValuation('${assetId}')">${t('portfolio.addValuation')}</button>
  `);
}

async function saveValuation(assetId) {
  const date = document.getElementById('vlDate').value;
  const value = parseMoney(document.getElementById('vlValue').value);
  const debt = parseMoney(document.getElementById('vlDebt').value) || 0;
  // Campo vazio ou ilegível NÃO vale zero: salvar zero aqui apagaria o ativo do total.
  if (!date || value == null || value <= 0) { showToast(t('toast.invalidValue')); return; }

  // Uma avaliação por ativo e data
  const existing = state.valuations.find((v) => v.assetId === assetId && v.date === date);
  const record = { id: existing ? existing.id : uid(), assetId, date, value, debt };
  if (existing) state.valuations = state.valuations.map((v) => (v.id === record.id ? record : v));
  else state.valuations.push(record);
  await put('valuations', record);
  renderAll();
  openValuationsModal(assetId); // mantém o modal aberto com a lista atualizada
  showToast(t('toast.saved'));
}

async function deleteValuation(id, assetId) {
  state.valuations = state.valuations.filter((v) => v.id !== id);
  await del('valuations', id);
  renderAll();
  openValuationsModal(assetId);
  showToast(t('toast.deleted'));
}

/* ---------- Tela de títulos a pagar e receber ---------- */
function janelaBills() {
  const de = state.ui.billFrom || addPeriod(todayISO(), 'monthly', -2);
  const ate = state.ui.billTo || addPeriod(todayISO(), 'monthly', 6);
  return { de, ate };
}

function renderBills() {
  const { de, ate } = janelaBills();
  const fDe = document.getElementById('billFrom');
  const fAte = document.getElementById('billTo');
  if (fDe) fDe.value = de;
  if (fAte) fAte.value = ate;

  const selKind = document.getElementById('billKind');
  if (selKind) {
    selKind.innerHTML = `<option value="all">${t('bill.all')}</option>
      <option value="receivable">${t('bill.receivable')}</option>
      <option value="payable">${t('bill.payable')}</option>`;
    selKind.value = state.ui.billKind;
  }
  const selSt = document.getElementById('billStatus');
  if (selSt) {
    selSt.innerHTML = `<option value="all">${t('bill.all')}</option>
      <option value="open">${t('bill.open')}</option>
      <option value="overdue">${t('bill.overdue')}</option>
      <option value="paid">${t('bill.paid')}</option>`;
    selSt.value = state.ui.billStatus;
  }

  // ----- parcelas -----
  let parcelas = allInstallments(de, ate);
  if (state.ui.billKind !== 'all') parcelas = parcelas.filter((p) => p.schedule.kind === state.ui.billKind);
  if (state.ui.billStatus === 'open') parcelas = parcelas.filter((p) => p.status !== 'paid');
  else if (state.ui.billStatus !== 'all') parcelas = parcelas.filter((p) => p.status === state.ui.billStatus);

  const thead = document.querySelector('#billTable thead tr');
  if (thead) thead.innerHTML = `
    <th>${t('bill.dueDate')}</th><th>${t('bill.description')}</th><th>${t('bill.kind')}</th>
    <th>${t('bill.account')}</th><th>${t('bill.value')}</th><th>${t('bill.lateAmount')}</th>
    <th>${t('bill.amount')}</th><th>${t('bill.status')}</th><th>${t('accounts.actions')}</th>`;

  const tbody = document.querySelector('#billTable tbody');
  const vazio = document.getElementById('billEmpty');
  if (tbody) {
    if (!parcelas.length) {
      tbody.innerHTML = '';
      if (vazio) { vazio.textContent = t('bill.emptyInstallments'); vazio.classList.remove('hidden'); }
    } else {
      if (vazio) vazio.classList.add('hidden');
      tbody.innerHTML = parcelas.map((p) => {
        const conta = accountById(p.schedule.accountId);
        const moeda = conta ? conta.currency : state.settings.baseCurrency;
        const entrada = p.schedule.kind === 'receivable';
        const acoes = p.status === 'paid'
          ? `<button class="secondary-btn" onclick="undoPayment('${p.scheduleId}',${p.seq})">${t('bill.unpay')}</button>`
          : `<button class="secondary-btn" onclick="openPayModal('${p.scheduleId}',${p.seq})">${t('bill.pay')}</button>`;
        return `<tr>
          <td>${p.dueDate}</td>
          <td>${escapeHtml(p.schedule.description || '')} <span class="tag">${p.seq}/${p.total}</span></td>
          <td>${t(entrada ? 'bill.receivable' : 'bill.payable')}</td>
          <td>${conta ? escapeHtml(conta.name) : '—'}</td>
          <td class="${entrada ? 'amount-in' : 'amount-out'}">${fmtMoney(p.value, moeda)}</td>
          <td>${p.late > 0.004 ? fmtMoney(p.late, moeda) : '—'}</td>
          <td><strong>${fmtMoney(p.amount, moeda)}</strong></td>
          <td><span class="status status-${p.status}">${t('bill.' + p.status)}</span></td>
          <td>${acoes}</td>
        </tr>`;
      }).join('');
    }
  }

  // ----- títulos -----
  const th2 = document.querySelector('#scheduleTable thead tr');
  if (th2) th2.innerHTML = `
    <th>${t('bill.description')}</th><th>${t('bill.kind')}</th><th>${t('bill.account')}</th>
    <th>${t('bill.frequency')}</th><th>${t('bill.count')}</th><th>${t('bill.amount')}</th>
    <th>${t('accounts.actions')}</th>`;
  const tb2 = document.querySelector('#scheduleTable tbody');
  const vazio2 = document.getElementById('scheduleEmpty');
  if (tb2) {
    if (!state.schedules.length) {
      tb2.innerHTML = '';
      if (vazio2) { vazio2.textContent = t('bill.emptySchedules'); vazio2.classList.remove('hidden'); }
    } else {
      if (vazio2) vazio2.classList.add('hidden');
      tb2.innerHTML = state.schedules.map((sch) => {
        const conta = accountById(sch.accountId);
        const moeda = conta ? conta.currency : state.settings.baseCurrency;
        const n = scheduleCount(sch);
        const parcela = installmentValue(sch);
        return `<tr>
          <td>${escapeHtml(sch.description || '')}</td>
          <td>${t(sch.kind === 'receivable' ? 'bill.receivable' : 'bill.payable')}</td>
          <td>${conta ? escapeHtml(conta.name) : '—'}</td>
          <td>${t('bill.freq.' + sch.frequency)}</td>
          <td>${n}x ${fmtMoney(parcela, moeda)}</td>
          <td><strong>${fmtMoney(parcela * n, moeda)}</strong></td>
          <td>
            <button class="secondary-btn" onclick="openBillModal('${sch.id}')">${t('modal.edit')}</button>
            <button class="secondary-btn" onclick="deleteSchedule('${sch.id}')">${t('modal.delete')}</button>
          </td>
        </tr>`;
      }).join('');
    }
  }
}

/* Abre o cadastro de conta a pagar já preenchido com o imposto do bem.
   Reaproveita o formulário testado em vez de inventar um atalho paralelo. */
function billFromTax(assetId) {
  const a = state.assets.find((x) => x.id === assetId);
  if (!a) return;
  openBillModal(null, {
    kind: 'payable',
    description: t('portfolio.tax') + ' — ' + a.name,
    category: a.type === 'property' ? 'impostosPropriedade' : 'impostos',
    amountMode: 'installment',
    principal: Number(a.taxAmount) || 0,
    frequency: a.taxPeriod === 'monthly' ? 'monthly' : 'annual',
    count: a.taxPeriod === 'monthly' ? 120 : 20
  });
}

function openBillModal(id, prefill) {
  if (!state.accounts.length) { showToast(t('bill.noAccounts')); return; }
  const b = id ? state.schedules.find((x) => x.id === id) : (prefill || null);
  const novo = !id; // prefill preenche, mas o título ainda não existe
  const kind = b ? b.kind : 'receivable';
  openModal(`
    <h2>${b ? t('modal.editBill') : t('modal.addBill')}</h2>
    <label>${t('bill.kind')}</label>
    <select id="blKind" onchange="onBillKindChange()">
      <option value="receivable" ${kind === 'receivable' ? 'selected' : ''}>${t('bill.receivable')}</option>
      <option value="payable" ${kind === 'payable' ? 'selected' : ''}>${t('bill.payable')}</option>
    </select>

    <label>${t('bill.description')}</label>
    <input id="blDescription" value="${b ? escapeHtml(b.description || '') : ''}">

    <label>${t('bill.account')}</label>
    <select id="blAccount">
      ${state.accounts.map((a) => `<option value="${a.id}" ${b && b.accountId === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (${a.currency})</option>`).join('')}
    </select>

    <div id="blCategoryWrap">
      <label>${t('bill.category')}</label>
      <select id="blCategory">${categoryOptions(kind === 'receivable' ? 'income' : 'expense', b ? b.category : null)}</select>
    </div>

    <label>${t('bill.amountMode')}</label>
    <select id="blAmountMode" onchange="onBillAmountModeChange()">
      <option value="total" ${!b || b.amountMode !== 'installment' ? 'selected' : ''}>${t('bill.asTotal')}</option>
      <option value="installment" ${b && b.amountMode === 'installment' ? 'selected' : ''}>${t('bill.asInstallment')}</option>
    </select>
    <label id="blPrincipalLabel">${t('bill.principal')}</label>
    <input id="blPrincipal" type="text" inputmode="decimal" value="${b ? (b.amountMode === 'installment' && !novo ? installmentValue(b).toFixed(2) : b.principal) : ''}" oninput="updateBillPreview()">

    <label>${t('bill.startDate')}</label>
    <input id="blStart" type="date" value="${b && b.startDate ? b.startDate : todayISO()}">

    <label>${t('bill.frequency')}</label>
    <select id="blFrequency" onchange="updateBillPreview()">
      ${FREQUENCIES.map((f) => `<option value="${f.key}" ${b && b.frequency === f.key ? 'selected' : ''}>${t('bill.freq.' + f.key)}</option>`).join('')}
    </select>

    <label>${t('bill.limit')}</label>
    <select id="blLimit" onchange="onBillLimitChange()">
      <option value="count" ${!b || !b.endDate ? 'selected' : ''}>${t('bill.byCount')}</option>
      <option value="end" ${b && b.endDate ? 'selected' : ''}>${t('bill.byEnd')}</option>
    </select>
    <div id="blCountWrap">
      <label>${t('bill.count')}</label>
      <input id="blCount" type="number" min="1" step="1" value="${b && b.count ? b.count : 1}" oninput="updateBillPreview()">
    </div>
    <div id="blEndWrap" class="hidden">
      <label>${t('bill.endDate')}</label>
      <input id="blEnd" type="date" value="${b && b.endDate ? b.endDate : ''}" onchange="updateBillPreview()">
    </div>

    <label>${t('bill.interestType')}</label>
    <select id="blInterestType" onchange="updateBillPreview()">
      <option value="none" ${!b || b.interestType === 'none' ? 'selected' : ''}>${t('bill.none')}</option>
      <option value="simple" ${b && b.interestType === 'simple' ? 'selected' : ''}>${t('bill.simple')}</option>
      <option value="compound" ${b && b.interestType === 'compound' ? 'selected' : ''}>${t('bill.compound')}</option>
    </select>
    <label>${t('bill.interestRate')}</label>
    <input id="blInterestRate" type="text" inputmode="decimal" value="${b && b.interestRate ? b.interestRate : ''}" oninput="updateBillPreview()">

    <label>${t('bill.lateType')}</label>
    <select id="blLateType">
      <option value="none" ${!b || b.lateType === 'none' ? 'selected' : ''}>${t('bill.none')}</option>
      <option value="simple" ${b && b.lateType === 'simple' ? 'selected' : ''}>${t('bill.simple')}</option>
      <option value="compound" ${b && b.lateType === 'compound' ? 'selected' : ''}>${t('bill.compound')}</option>
    </select>
    <label>${t('bill.lateRate')}</label>
    <input id="blLateRate" type="text" inputmode="decimal" value="${b && b.lateRate ? b.lateRate : ''}">

    <p class="hint" id="blPreview"></p>
    <button class="primary-btn" onclick="saveSchedule('${b && b.id ? b.id : ''}')">${t('modal.save')}</button>
  `);
  onBillLimitChange();
  onBillAmountModeChange();
}

function onBillKindChange() {
  const kind = document.getElementById('blKind').value;
  const sel = document.getElementById('blCategory');
  sel.innerHTML = categoryOptions(kind === 'receivable' ? 'income' : 'expense', sel.value);
}

function onBillAmountModeChange() {
  const modo = document.getElementById('blAmountMode').value;
  const rotulo = document.getElementById('blPrincipalLabel');
  if (rotulo) rotulo.textContent = t(modo === 'installment' ? 'bill.principalPer' : 'bill.principal');
  updateBillPreview();
}

function onBillLimitChange() {
  const modo = document.getElementById('blLimit').value;
  document.getElementById('blCountWrap').classList.toggle('hidden', modo !== 'count');
  document.getElementById('blEndWrap').classList.toggle('hidden', modo !== 'end');
  updateBillPreview();
}

// Mostra quantas parcelas saem e quanto dá no total, antes de salvar.
function updateBillPreview() {
  const el = document.getElementById('blPreview');
  if (!el) return;
  const rascunho = lerFormularioBill();
  if (!rascunho || !rascunho.principal) { el.textContent = ''; return; }
  const conta = accountById(rascunho.accountId);
  const moeda = conta ? conta.currency : state.settings.baseCurrency;
  const n = scheduleCount(rascunho);
  const parcela = installmentValue(rascunho);
  el.textContent = t('bill.previewText')
    .replace('{n}', n)
    .replace('{valor}', fmtMoney(parcela, moeda))
    .replace('{total}', fmtMoney(parcela * n, moeda));
}

function lerFormularioBill() {
  const el = (x) => document.getElementById(x);
  if (!el('blKind')) return null;
  const porContagem = el('blLimit').value === 'count';
  const modo = el('blAmountMode') ? el('blAmountMode').value : 'total';
  const informado = parseMoney(el('blPrincipal').value) || 0;

  const dados = {
    kind: el('blKind').value,
    description: el('blDescription').value.trim(),
    accountId: el('blAccount').value,
    category: el('blCategory').value,
    amountMode: modo,
    principal: informado,
    startDate: el('blStart').value || todayISO(),
    frequency: el('blFrequency').value,
    count: porContagem ? Math.max(1, Number(el('blCount').value) || 1) : null,
    endDate: porContagem ? null : (el('blEnd').value || null),
    interestType: el('blInterestType').value,
    interestRate: parseMoney(el('blInterestRate').value) || 0,
    lateType: el('blLateType').value,
    lateRate: parseMoney(el('blLateRate').value) || 0
  };

  // O que se grava é sempre o principal. Se o usuário informou o valor da
  // parcela, ele é convertido aqui — assim o resto do sistema não muda.
  if (modo === 'installment') {
    const n = scheduleCount(dados);
    dados.principal = principalFromInstallment(informado, n, dados.interestType, dados.interestRate);
  }
  return dados;
}

async function saveSchedule(id) {
  const dados = lerFormularioBill();
  if (!dados) return;
  if (!dados.description) { showToast(t('toast.invalidValue')); return; }
  if (!dados.principal || dados.principal <= 0) { showToast(t('toast.invalidValue')); return; }
  const sch = { id: id || uid(), ...dados };
  if (id) state.schedules = state.schedules.map((x) => (x.id === id ? sch : x));
  else state.schedules.push(sch);
  await put('schedules', sch);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteSchedule(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  // Apagar o título desfaz as quitações e os lançamentos que elas geraram
  for (const p of state.payments.filter((x) => x.scheduleId === id)) {
    if (p.transactionId) {
      state.transactions = state.transactions.filter((tr) => tr.id !== p.transactionId);
      await del('transactions', p.transactionId);
    }
    await del('payments', p.id);
  }
  state.payments = state.payments.filter((x) => x.scheduleId !== id);
  state.schedules = state.schedules.filter((x) => x.id !== id);
  await del('schedules', id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* ----- quitação ----- */
function openPayModal(scheduleId, seq) {
  const sch = state.schedules.find((x) => x.id === scheduleId);
  if (!sch) return;
  const parcela = scheduleInstallments(sch).find((p) => p.seq === seq);
  if (!parcela) return;
  const conta = accountById(sch.accountId);
  const moeda = conta ? conta.currency : state.settings.baseCurrency;
  openModal(`
    <h2>${t('bill.confirmPay')}</h2>
    <p class="hint">${escapeHtml(sch.description || '')} · ${seq}/${parcela.total} · ${t('bill.dueDate')}: ${parcela.dueDate}</p>
    <label>${t('bill.paidDate')}</label>
    <input id="pyDate" type="date" value="${todayISO()}">
    <label>${t('bill.paidValue')} (${moeda})</label>
    <input id="pyValue" type="text" inputmode="decimal" value="${parcela.amount.toFixed(2)}">
    <p class="hint">${t('bill.value')}: ${fmtMoney(parcela.value, moeda)}${parcela.late > 0.004 ? ' · ' + t('bill.lateAmount') + ': ' + fmtMoney(parcela.late, moeda) : ''}</p>
    <p class="hint">${t('bill.payNote')}</p>
    <button class="primary-btn" onclick="confirmPayment('${scheduleId}',${seq})">${t('bill.pay')}</button>
  `);
}

async function confirmPayment(scheduleId, seq) {
  const sch = state.schedules.find((x) => x.id === scheduleId);
  if (!sch) return;
  const data = document.getElementById('pyDate').value;
  const valor = parseMoney(document.getElementById('pyValue').value);
  if (!data || valor == null || valor <= 0) { showToast(t('toast.invalidValue')); return; }

  const parcela = scheduleInstallments(sch).find((p) => p.seq === seq);
  // A quitação vira lançamento de verdade: é ele que move o saldo da conta
  const trn = {
    id: uid(),
    type: sch.kind === 'receivable' ? 'income' : 'expense',
    date: data,
    accountId: sch.accountId,
    category: sch.category,
    description: (sch.description || '') + ' (' + seq + '/' + (parcela ? parcela.total : '?') + ')',
    value: valor
  };
  state.transactions.push(trn);
  await put('transactions', trn);

  const pg = { id: uid(), scheduleId, seq, paidDate: data, paidValue: valor, transactionId: trn.id };
  state.payments.push(pg);
  await put('payments', pg);

  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function undoPayment(scheduleId, seq) {
  const pg = paymentFor(scheduleId, seq);
  if (!pg) return;
  if (!confirm(t('bill.unpay') + '?')) return;
  if (pg.transactionId) {
    state.transactions = state.transactions.filter((tr) => tr.id !== pg.transactionId);
    await del('transactions', pg.transactionId);
  }
  state.payments = state.payments.filter((x) => x.id !== pg.id);
  await del('payments', pg.id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* Fontes de cotação por TICKER. Não existe API pública gratuita indexada por
   ISIN — os provedores que fazem isso são pagos. O ISIN fica guardado para seu
   controle; a busca automática, quando funciona, é pelo ticker. */
const QUOTE_SOURCES = [
  {
    name: 'brapi.dev',
    url: (tk) => `https://brapi.dev/api/quote/${encodeURIComponent(tk)}`,
    parse: (d) => (d && d.results && d.results[0] && Number(d.results[0].regularMarketPrice)) || null
  },
  {
    name: 'awesomeapi',
    url: (tk) => `https://economia.awesomeapi.com.br/json/last/${encodeURIComponent(tk)}-BRL`,
    parse: (d) => {
      if (!d) return null;
      const chave = Object.keys(d)[0];
      return (chave && Number(d[chave].bid)) || null;
    }
  }
];

async function fetchQuoteFor(ticker) {
  for (const fonte of QUOTE_SOURCES) {
    try {
      const res = await fetch(fonte.url(ticker), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const preco = fonte.parse(await res.json());
      if (preco && preco > 0) { console.log('Cotação de', ticker, 'obtida em', fonte.name, preco); return preco; }
      throw new Error('sem preço na resposta');
    } catch (e) {
      console.warn('Cotação indisponível —', ticker, fonte.name + ':', e && e.message ? e.message : e);
    }
  }
  return null;
}

/* Botão único do dashboard: atualiza câmbio e cotações. Cada parte reporta o
   que conseguiu, para não sobrar dúvida sobre o que foi atualizado. */
async function updateEverything() {
  const btn = document.getElementById('btnUpdateAll');
  if (btn) { btn.disabled = true; btn.textContent = t('inv.updating'); }
  let resumoFx = t('inv.updateFail');
  try {
    const antes = state.fx.length;
    await fetchRates();
    resumoFx = t('inv.updateOk').replace('{n}', Math.max(state.fx.length - antes, 0) || state.fx.length);
  } catch (e) {
    console.warn('Câmbio não atualizado:', e);
  }

  const comTicker = state.positions.filter((p) => p.ticker && p.kind === 'quote');
  let resumoQ;
  if (!comTicker.length) {
    resumoQ = t('inv.updateNoTicker');
  } else {
    let n = 0;
    for (const pos of comTicker) {
      const preco = await fetchQuoteFor(pos.ticker);
      if (preco == null) continue;
      const hoje = todayISO();
      const existente = state.quotes.find((q) => q.positionId === pos.id && q.date === hoje);
      const registro = { id: existente ? existente.id : uid(), positionId: pos.id, date: hoje, value: preco };
      if (existente) state.quotes = state.quotes.map((q) => (q.id === registro.id ? registro : q));
      else state.quotes.push(registro);
      await put('quotes', registro);
      n++;
    }
    resumoQ = n ? t('inv.updateOk').replace('{n}', n) : t('inv.updateFail');
  }

  renderAll();
  if (btn) { btn.disabled = false; btn.textContent = t('inv.updateAll'); }
  showToast(t('inv.updateDone').replace('{fx}', resumoFx).replace('{q}', resumoQ));
}

/* ---------- Tela da carteira de investimentos ---------- */
function renderInvestments() {
  const base = state.settings.baseCurrency;
  const hoje = todayISO();

  const thead = document.querySelector('#invTable thead tr');
  if (thead) thead.innerHTML = `
    <th>${t('inv.name')}</th><th>${t('inv.type')}</th><th>${t('inv.account')}</th><th>${t('inv.quantity')}</th>
    <th>${t('inv.price')}</th><th>${t('inv.cost')}</th><th>${t('inv.value')}</th>
    <th>${t('inv.return')}</th><th>${t('accounts.actions')}</th>`;

  const tbody = document.querySelector('#invTable tbody');
  const vazio = document.getElementById('invEmpty');
  if (!tbody) return;

  if (!state.positions.length) {
    tbody.innerHTML = '';
    if (vazio) { vazio.textContent = t('inv.empty'); vazio.classList.remove('hidden'); }
  } else {
    if (vazio) vazio.classList.add('hidden');
    tbody.innerHTML = state.positions.map((pos) => {
      const r = positionReturn(pos, hoje);
      const st = positionStateAt(pos, hoje);
      const cot = positionQuoteAt(pos, hoje);
      const conta = accountById(pos.accountId);
      const classe = r.profit > 0.004 ? 'amount-in' : (r.profit < -0.004 ? 'amount-out' : 'amount-neutral');
      return `<tr>
        <td>${escapeHtml(pos.name)}${pos.ticker ? ` <span class="tag">${escapeHtml(pos.ticker)}</span>` : ''}</td>
        <td>${pos.assetType ? t('inv.ty.' + pos.assetType) : '—'}</td>
        <td>${conta ? escapeHtml(conta.name) : '—'}</td>
        <td>${pos.kind === 'quote' ? st.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 }) : '—'}</td>
        <td>${cot ? fmtMoney(cot.value, pos.currency) : '—'}</td>
        <td>${fmtMoney(r.cost, pos.currency)}</td>
        <td><strong>${fmtMoney(r.value, pos.currency)}</strong></td>
        <td class="${classe}">${fmtMoney(r.profit, pos.currency)} · ${r.pct.toFixed(1)}%</td>
        <td>
          <button class="secondary-btn" onclick="openMoveModal('${pos.id}')">${t('inv.move')}</button>
          <button class="secondary-btn" onclick="openQuotesModal('${pos.id}')">${t('inv.quotes')}</button>
          <button class="secondary-btn" onclick="openPositionModal('${pos.id}')">${t('modal.edit')}</button>
          <button class="secondary-btn" onclick="deletePosition('${pos.id}')">${t('modal.delete')}</button>
        </td>
      </tr>`;
    }).join('');
  }

  // aviso de duplicidade
  const caixa = document.getElementById('invDup');
  if (caixa) {
    const suspeitas = state.positions
      .map((pos) => ({ pos, valor: positionUndeducted(pos) }))
      .filter((x) => x.valor > 0);
    if (!suspeitas.length) {
      caixa.classList.add('hidden');
      caixa.innerHTML = '';
    } else {
      caixa.classList.remove('hidden');
      caixa.innerHTML = `<h4>${t('inv.dupTitle')}</h4>` + suspeitas.map(({ pos, valor }) => {
        const conta = accountById(pos.accountId);
        return `<p>${t('inv.dupText')
          .replace('{valor}', fmtMoney(valor, pos.currency))
          .replace('{posicao}', escapeHtml(pos.name))
          .replace('{conta}', conta ? escapeHtml(conta.name) : '—')}
          <button class="primary-btn inline-btn" onclick="fixDuplication('${pos.id}')">${t('inv.dupFix')}</button></p>`;
      }).join('') + `<p class="hint">${t('inv.dupHint')}</p>`;
    }
  }

  // resumo consolidado
  const tot = investmentTotals(hoje);
  const valor = consolidate(tot.value, base, hoje).total;
  const custo = consolidate(tot.cost, base, hoje).total;
  const lucro = valor - custo;
  const elV = document.getElementById('invTotalValue');
  const elC = document.getElementById('invTotalCost');
  const elR = document.getElementById('invTotalReturn');
  if (elV) elV.textContent = fmtMoney(valor, base);
  if (elC) elC.textContent = fmtMoney(custo, base);
  if (elR) {
    elR.textContent = fmtMoney(lucro, base) + (custo > 0 ? ' · ' + ((lucro / custo) * 100).toFixed(1) + '%' : '');
    elR.className = 'big-number ' + (lucro > 0.004 ? 'amount-in' : lucro < -0.004 ? 'amount-out' : '');
  }
}

/* Quanto desta posição foi aplicado SEM sair do saldo da conta vinculada.
   É exatamente esse valor que aparece duas vezes no patrimônio. */
function positionUndeducted(pos) {
  if (!pos.accountId) return 0;
  const movs = invMovesOf(pos.id);
  const semLancamento = movs
    .filter((m) => m.type === 'buy' && !m.transactionId)
    .reduce((soma, m) => soma + (Number(m.amount) || 0), 0);
  if (semLancamento > 0) return semLancamento;
  // Caso da posição criada só com cotação: tem valor, mas custo zero e
  // nenhum aporte — o dinheiro segue inteiro no saldo da conta.
  if (!movs.length) {
    const valor = positionValue(pos);
    if (valor > 0) return valor;
  }
  return 0;
}

// Corrige criando o aporte que faltava e tirando o dinheiro da conta.
async function fixDuplication(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const valor = positionUndeducted(pos);
  if (valor <= 0) return;

  const trn = {
    id: uid(), type: 'expense', date: todayISO(), accountId: pos.accountId,
    category: 'investimentos', description: t('inv.buy') + ' — ' + pos.name, value: valor
  };
  state.transactions.push(trn);
  await put('transactions', trn);

  const pendentes = invMovesOf(pos.id).filter((m) => m.type === 'buy' && !m.transactionId);
  if (pendentes.length) {
    // vincula o lançamento ao primeiro aporte sem lançamento
    const m = { ...pendentes[0], transactionId: trn.id };
    state.invmoves = state.invmoves.map((x) => (x.id === m.id ? m : x));
    await put('invmoves', m);
    // os demais viram lançamentos próprios na próxima passada
    for (const outro of pendentes.slice(1)) {
      const t2 = {
        id: uid(), type: 'expense', date: todayISO(), accountId: pos.accountId,
        category: 'investimentos', description: t('inv.buy') + ' — ' + pos.name, value: Number(outro.amount) || 0
      };
      state.transactions.push(t2);
      await put('transactions', t2);
      const mm = { ...outro, transactionId: t2.id };
      state.invmoves = state.invmoves.map((x) => (x.id === mm.id ? mm : x));
      await put('invmoves', mm);
    }
  } else {
    // não havia aporte nenhum: cria um, com o custo correto
    const mov = { id: uid(), positionId: pos.id, type: 'buy', date: todayISO(), quantity: 0, amount: valor, transactionId: trn.id };
    state.invmoves.push(mov);
    await put('invmoves', mov);
  }

  renderAll();
  showToast(t('inv.dupFixed'));
}

function openPositionModal(id) {
  const p = id ? state.positions.find((x) => x.id === id) : null;
  openModal(`
    <h2>${p ? t('modal.editPosition') : t('modal.addPosition')}</h2>
    <label>${t('inv.name')}</label>
    <input id="poName" value="${p ? escapeHtml(p.name) : ''}">
    <label>${t('inv.account')}</label>
    <select id="poAccount" onchange="onPositionAccountChange()">
      <option value="">${t('inv.noAccount')}</option>
      ${state.accounts.map((a) => `<option value="${a.id}" ${p && p.accountId === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (${a.currency})</option>`).join('')}
    </select>
    <p class="hint">${t('inv.accountHint')}</p>
    <label>${t('inv.kind')}</label>
    <select id="poKind" onchange="onPositionAccountChange()">
      <option value="quote" ${!p || p.kind === 'quote' ? 'selected' : ''}>${t('inv.kindQuote')}</option>
      <option value="value" ${p && p.kind === 'value' ? 'selected' : ''}>${t('inv.kindValue')}</option>
    </select>
    <p class="hint">${t('inv.kindHint')}</p>
    <label>${t('inv.class')}</label>
    <select id="poClass">
      <option value="variable" ${!p || p.assetClass !== 'fixed' ? 'selected' : ''}>${t('inv.classVariable')}</option>
      <option value="fixed" ${p && p.assetClass === 'fixed' ? 'selected' : ''}>${t('inv.classFixed')}</option>
    </select>
    <label>${t('inv.type')}</label>
    <select id="poType">
      ${INV_TYPES.map((k) => `<option value="${k}" ${p && p.assetType === k ? 'selected' : ''}>${t('inv.ty.' + k)}</option>`).join('')}
    </select>
    <label>${t('inv.ticker')}</label>
    <input id="poTicker" value="${p && p.ticker ? escapeHtml(p.ticker) : ''}" placeholder="PETR4">
    <label>${t('inv.isin')}</label>
    <input id="poIsin" value="${p && p.isin ? escapeHtml(p.isin) : ''}" placeholder="BRPETRACNPR6">
    <p class="hint">${t('inv.tickerHint')}</p>
    <label>${t('inv.currency')}</label>
    <select id="poCurrency">
      ${CURRENCIES.map((c) => {
        const sel = p ? p.currency === c.code : c.code === state.settings.baseCurrency;
        return `<option value="${c.code}" ${sel ? 'selected' : ''}>${c.code}</option>`;
      }).join('')}
    </select>
    ${p ? '' : `
      <div id="poInitialWrap">
        <label>${t('inv.initial')}</label>
        <input id="poInitial" type="text" inputmode="decimal">
        <div id="poInitialQtyWrap">
          <label>${t('inv.initialQty')}</label>
          <input id="poInitialQty" type="text" inputmode="decimal">
        </div>
        <label class="checkline" id="poDeductWrap"><input type="checkbox" id="poDeduct" checked> ${t('inv.deduct')}</label>
        <p class="hint">${t('inv.deductHint')}</p>
      </div>`}
    <button class="primary-btn" onclick="savePosition('${p ? p.id : ''}')">${t('modal.save')}</button>
  `);
  onPositionAccountChange();
}

// Sem conta vinculada não há de onde descontar; e renda fixa não tem quantidade.
function onPositionAccountChange() {
  const wrapDeduz = document.getElementById('poDeductWrap');
  const conta = document.getElementById('poAccount');
  if (wrapDeduz && conta) wrapDeduz.classList.toggle('hidden', !conta.value);
  const wrapQtd = document.getElementById('poInitialQtyWrap');
  const kind = document.getElementById('poKind');
  if (wrapQtd && kind) wrapQtd.classList.toggle('hidden', kind.value !== 'quote');
}

async function savePosition(id) {
  const nome = document.getElementById('poName').value.trim();
  if (!nome) { showToast(t('toast.invalidValue')); return; }
  const pos = {
    id: id || uid(),
    name: nome,
    accountId: document.getElementById('poAccount').value || null,
    kind: document.getElementById('poKind').value,
    currency: document.getElementById('poCurrency').value,
    assetClass: document.getElementById('poClass').value,
    assetType: document.getElementById('poType').value,
    ticker: document.getElementById('poTicker').value.trim().toUpperCase(),
    isin: document.getElementById('poIsin').value.trim().toUpperCase()
  };
  if (id) state.positions = state.positions.map((x) => (x.id === id ? pos : x));
  else state.positions.push(pos);
  await put('positions', pos);

  // Valor já aplicado vira o primeiro aporte. Se o dinheiro ainda está na conta
  // vinculada, ele sai de lá — é isso que evita contar o mesmo valor duas vezes.
  const elInicial = document.getElementById('poInitial');
  const inicial = elInicial ? parseMoney(elInicial.value) : null;
  if (!id && inicial != null && inicial > 0) {
    const elQtd = document.getElementById('poInitialQty');
    const qtd = elQtd ? (parseMoney(elQtd.value) || 0) : 0;
    const mov = { id: uid(), positionId: pos.id, type: 'buy', date: todayISO(), quantity: qtd, amount: inicial };
    const deduz = document.getElementById('poDeduct');
    if (pos.accountId && deduz && deduz.checked) {
      const trn = {
        id: uid(), type: 'expense', date: todayISO(), accountId: pos.accountId,
        category: 'investimentos', description: t('inv.buy') + ' — ' + pos.name, value: inicial
      };
      state.transactions.push(trn);
      await put('transactions', trn);
      mov.transactionId = trn.id;
    }
    state.invmoves.push(mov);
    await put('invmoves', mov);
  }

  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deletePosition(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  for (const m of invMovesOf(id)) {
    if (m.transactionId) {
      state.transactions = state.transactions.filter((tr) => tr.id !== m.transactionId);
      await del('transactions', m.transactionId);
    }
    await del('invmoves', m.id);
  }
  for (const q of quotesOf(id)) await del('quotes', q.id);
  state.invmoves = state.invmoves.filter((m) => m.positionId !== id);
  state.quotes = state.quotes.filter((q) => q.positionId !== id);
  state.positions = state.positions.filter((x) => x.id !== id);
  await del('positions', id);
  renderAll();
  showToast(t('toast.deleted'));
}

/* ----- aportes e resgates ----- */
function openMoveModal(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const movs = invMovesOf(positionId).slice().reverse();
  openModal(`
    <h2>${t('modal.move')} — ${escapeHtml(pos.name)}</h2>
    ${movs.length ? `
      <table class="mini-table">
        <thead><tr><th>${t('inv.moveDate')}</th><th>${t('inv.moveType')}</th>
        ${pos.kind === 'quote' ? `<th>${t('inv.moveQty')}</th>` : ''}
        <th>${t('inv.moveAmount')}</th><th></th></tr></thead>
        <tbody>${movs.map((m) => `<tr>
          <td>${m.date}</td>
          <td>${t(m.type === 'buy' ? 'inv.buy' : 'inv.sell')}</td>
          ${pos.kind === 'quote' ? `<td>${Number(m.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 8 })}</td>` : ''}
          <td>${fmtMoney(m.amount, pos.currency)}</td>
          <td><button class="secondary-btn" onclick="deleteMove('${m.id}','${positionId}')">${t('modal.delete')}</button></td>
        </tr>`).join('')}</tbody>
      </table>` : `<p class="hint">${t('inv.noMoves')}</p>`}

    <label>${t('inv.moveType')}</label>
    <select id="mvType">
      <option value="buy">${t('inv.buy')}</option>
      <option value="sell">${t('inv.sell')}</option>
    </select>
    <label>${t('inv.moveDate')}</label>
    <input id="mvDate" type="date" value="${todayISO()}">
    ${pos.kind === 'quote' ? `
      <label>${t('inv.moveQty')}</label>
      <input id="mvQty" type="text" inputmode="decimal">` : ''}
    <label>${t('inv.moveAmount')} (${pos.currency})</label>
    <input id="mvAmount" type="text" inputmode="decimal">
    <label>${t('inv.moveAccount')}</label>
    <select id="mvAccount">
      <option value="">${t('inv.noAccount')}</option>
      ${state.accounts.map((a) => `<option value="${a.id}" ${pos.accountId === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (${a.currency})</option>`).join('')}
    </select>
    <label class="checkline"><input type="checkbox" id="mvLaunch" ${pos.accountId ? 'checked' : ''}> ${t('inv.createLaunch')}</label>
    <p class="hint">${t('inv.launchHint')}</p>
    <button class="primary-btn" onclick="saveMove('${positionId}')">${t('modal.save')}</button>
  `);
}

async function saveMove(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const tipo = document.getElementById('mvType').value;
  const data = document.getElementById('mvDate').value;
  const valor = parseMoney(document.getElementById('mvAmount').value);
  const qtdEl = document.getElementById('mvQty');
  const qtd = qtdEl ? parseMoney(qtdEl.value) : 0;
  if (!data || valor == null || valor <= 0) { showToast(t('toast.invalidValue')); return; }
  if (pos.kind === 'quote' && (qtd == null || qtd <= 0)) { showToast(t('toast.invalidValue')); return; }

  const mov = { id: uid(), positionId, type: tipo, date: data, quantity: qtd || 0, amount: valor };

  // O dinheiro sai (aporte) ou entra (resgate) na conta escolhida
  const contaId = document.getElementById('mvAccount').value;
  if (contaId && document.getElementById('mvLaunch').checked) {
    const trn = {
      id: uid(),
      type: tipo === 'buy' ? 'expense' : 'income',
      date: data,
      accountId: contaId,
      category: 'investimentos',
      description: (tipo === 'buy' ? t('inv.buy') : t('inv.sell')) + ' — ' + pos.name,
      value: valor
    };
    state.transactions.push(trn);
    await put('transactions', trn);
    mov.transactionId = trn.id;
  }

  state.invmoves.push(mov);
  await put('invmoves', mov);
  closeModal();
  renderAll();
  showToast(t('toast.saved'));
}

async function deleteMove(id, positionId) {
  const m = state.invmoves.find((x) => x.id === id);
  if (!m) return;
  if (m.transactionId) {
    state.transactions = state.transactions.filter((tr) => tr.id !== m.transactionId);
    await del('transactions', m.transactionId);
  }
  state.invmoves = state.invmoves.filter((x) => x.id !== id);
  await del('invmoves', id);
  renderAll();
  openMoveModal(positionId);
  showToast(t('toast.deleted'));
}

/* ----- cotações ----- */
function openQuotesModal(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const lista = quotesOf(positionId).slice().reverse();
  const rotulo = pos.kind === 'quote' ? t('inv.quotePrice') : t('inv.quoteValue');
  openModal(`
    <h2>${t('inv.quotes')} — ${escapeHtml(pos.name)}</h2>
    ${lista.length ? `
      <table class="mini-table">
        <thead><tr><th>${t('inv.quoteDate')}</th><th>${rotulo}</th><th></th></tr></thead>
        <tbody>${lista.map((q) => `<tr>
          <td>${q.date}</td>
          <td>${fmtMoney(q.value, pos.currency)}</td>
          <td><button class="secondary-btn" onclick="deleteQuote('${q.id}','${positionId}')">${t('modal.delete')}</button></td>
        </tr>`).join('')}</tbody>
      </table>` : `<p class="hint">${t('inv.noQuotes')}</p>`}
    <label>${t('inv.quoteDate')}</label>
    <input id="qtDate" type="date" value="${todayISO()}">
    <label>${rotulo} (${pos.currency})</label>
    <input id="qtValue" type="text" inputmode="decimal">
    <button class="primary-btn" onclick="saveQuote('${positionId}')">${t('inv.addQuote')}</button>
  `);
}

async function saveQuote(positionId) {
  const data = document.getElementById('qtDate').value;
  const valor = parseMoney(document.getElementById('qtValue').value);
  if (!data || valor == null || valor <= 0) { showToast(t('toast.invalidValue')); return; }
  const existente = state.quotes.find((q) => q.positionId === positionId && q.date === data);
  const registro = { id: existente ? existente.id : uid(), positionId, date: data, value: valor };
  if (existente) state.quotes = state.quotes.map((q) => (q.id === registro.id ? registro : q));
  else state.quotes.push(registro);
  await put('quotes', registro);
  renderAll();
  openQuotesModal(positionId);
  showToast(t('toast.saved'));
}

async function deleteQuote(id, positionId) {
  state.quotes = state.quotes.filter((q) => q.id !== id);
  await del('quotes', id);
  renderAll();
  openQuotesModal(positionId);
  showToast(t('toast.deleted'));
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
    <input id="accBalance" type="text" inputmode="decimal" value="${a ? a.initialBalance : '0'}">
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
    initialBalance: parseMoney(document.getElementById('accBalance').value) || 0
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

/* Cria a âncora de hoje para todas as contas. Sem nenhuma âncora, o gráfico de
   evolução assume que o saldo inicial valeu desde sempre. */
async function snapshotBalances() {
  if (!state.accounts.length) { showToast(t('accounts.add')); return; }
  const hoje = todayISO();
  const saldos = currentBalancesAll();
  for (const a of state.accounts) {
    const existente = state.balances.find((b) => b.date === hoje && b.accountId === a.id);
    const registro = { id: existente ? existente.id : uid(), date: hoje, accountId: a.id, value: saldos[a.id] };
    if (existente) state.balances = state.balances.map((b) => (b.id === registro.id ? registro : b));
    else state.balances.push(registro);
    await put('balances', registro);
  }
  renderAll();
  showToast(t('balances.snapshotDone').replace('{n}', state.accounts.length));
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
    <input id="balValue" type="text" inputmode="decimal">
    <button class="primary-btn" onclick="saveBalance()">${t('modal.save')}</button>
  `);
}

async function saveBalance() {
  const date = document.getElementById('balDate').value;
  const accountId = document.getElementById('balAccount').value;
  const value = parseMoney(document.getElementById('balValue').value);
  if (!date || !accountId || value == null) { showToast(t('toast.invalidValue')); return; }
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
    <input id="txValue" type="text" inputmode="decimal" value="${trn ? trn.value : ''}">

    <div id="txToValueWrap" class="hidden">
      <label>${t('tx.receivedValue')}</label>
      <input id="txToValue" type="text" inputmode="decimal" value="${trn && trn.toValue != null ? trn.toValue : ''}">
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
  const value = parseMoney(document.getElementById('txValue').value);
  if (!date || !accountId || value == null || value <= 0) { showToast(t('toast.invalidValue')); return; }

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
    const toValue = parseMoney(toValueEl.value);
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
    <input id="bgAmount" type="text" inputmode="decimal" value="${b ? b.amount : ''}">
    <button class="primary-btn" onclick="saveBudget('${b ? b.id : ''}')">${t('modal.save')}</button>
  `);
}

async function saveBudget(id) {
  const category = document.getElementById('bgCategory').value;
  const bgCurrency = document.getElementById('bgCurrency').value;
  const amount = parseMoney(document.getElementById('bgAmount').value);
  if (!category || amount == null || amount <= 0) { showToast(t('toast.invalidValue')); return; }

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
    version: 6,
    exportedAt: new Date().toISOString(),
    accounts: state.accounts,
    balances: state.balances,
    transactions: state.transactions,
    budgets: state.budgets,
    fx: state.fx,
    schedules: state.schedules,
    payments: state.payments,
    positions: state.positions,
    quotes: state.quotes,
    invmoves: state.invmoves,
    assets: state.assets,
    valuations: state.valuations,
    settings: state.settings
  };
  download(`prof-controller-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
  showToast(t('toast.exported'));
}

function exportCSV() {
  // Baixar um arquivo só com cabeçalho parece que funcionou, e não funcionou
  if (!state.balances.length) { showToast(t('toast.nothingToExport')); return; }
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
    for (const r of (data.fx || [])) await put('fx', r);
    for (const sc of (data.schedules || [])) await put('schedules', sc);
    for (const pg of (data.payments || [])) await put('payments', pg);
    for (const po of (data.positions || [])) await put('positions', po);
    for (const qt of (data.quotes || [])) await put('quotes', qt);
    for (const mv of (data.invmoves || [])) await put('invmoves', mv);
    for (const a of (data.assets || [])) await put('assets', a);
    for (const v of (data.valuations || [])) await put('valuations', v);
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
/* Liga um evento só se o elemento existir. Um index.html defasado (ou um
   elemento renomeado) não pode derrubar o app inteiro: sem esta guarda, o
   primeiro getElementById nulo interrompe TODA a ligação de eventos. */
function on(id, evento, handler) {
  const el = document.getElementById(id);
  if (!el) { console.warn('Elemento ausente no HTML:', id, '— verifique se o index.html está atualizado.'); return false; }
  el.addEventListener(evento, handler);
  return true;
}

function bindEvents() {
  // Os botões de idioma são recriados a cada render, então o clique é capturado
  // no contêiner, que é fixo.
  // Fase 6 — títulos a pagar e receber
  on('btnAddBill', 'click', () => openBillModal());
  on('btnAddPosition', 'click', () => openPositionModal());
  on('btnUpdateAll', 'click', updateEverything);
  on('cashGrain', 'change', (e) => { state.ui.cashGrain = e.target.value; renderCashflow(); });
  on('billKind', 'change', (e) => { state.ui.billKind = e.target.value; renderBills(); });
  on('billStatus', 'change', (e) => { state.ui.billStatus = e.target.value; renderBills(); });
  on('billFrom', 'change', (e) => { state.ui.billFrom = e.target.value; renderBills(); });
  on('billTo', 'change', (e) => { state.ui.billTo = e.target.value; renderBills(); });

  // Moeda base direto do dashboard
  on('dashBaseCurrency', 'change', async (e) => {
    state.settings.baseCurrency = e.target.value;
    await put('settings', { key: 'baseCurrency', value: e.target.value });
    renderAll();
  });

  on('navControls', 'click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    state.ui.navView = btn.dataset.view;
    renderNAV();
  });
  on('navControls', 'change', (e) => {
    if (e.target.id !== 'navBreak') return;
    state.ui.navBreak = e.target.value;
    renderNAV();
  });

  on('langButtons', 'click', async (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    state.settings.lang = btn.dataset.lang;
    await put('settings', { key: 'lang', value: btn.dataset.lang });
    applyLang();
  });
  on('themeSelect', 'change', async (e) => {
    state.settings.theme = e.target.value;
    await put('settings', { key: 'theme', value: e.target.value });
    applyTheme();
  });
  on('baseCurrencySelect', 'change', async (e) => {
    state.settings.baseCurrency = e.target.value;
    await put('settings', { key: 'baseCurrency', value: e.target.value });
    renderAll();
  });
  on('btnAddAccount', 'click', () => openAccountModal());
  on('btnAddBalance', 'click', openBalanceModal);
  on('btnSnapshot', 'click', snapshotBalances);

  // Fase 2 — transações
  on('btnAddTx', 'click', () => openTxModal());
  on('btnExportTxCSV', 'click', exportTransactionsCSV);
  on('txFilterType', 'change', (e) => { state.ui.txType = e.target.value; renderTransactions(); });
  on('txFilterAccount', 'change', (e) => { state.ui.txAccount = e.target.value; renderTransactions(); });
  on('txFilterMonth', 'change', (e) => { state.ui.txMonth = e.target.value; renderTransactions(); });
  on('btnClearTxFilters', 'click', () => {
    state.ui.txType = 'all'; state.ui.txAccount = 'all'; state.ui.txMonth = '';
    renderTransactions();
  });

  // Fase 2 — orçamentos
  on('btnAddBudget', 'click', () => openBudgetModal());
  on('budgetMonth', 'change', (e) => { state.ui.budgetMonth = e.target.value; renderBudgets(); });

  // Fase 4 — portfólio
  on('btnAddProperty', 'click', () => openAssetModal('property'));
  on('btnAddVehicle', 'click', () => openAssetModal('vehicle'));

  // Fase 3 — câmbio
  on('btnAddFx', 'click', () => openFxModal());
  on('btnFetchRates', 'click', fetchRates);

  on('btnExportJSON', 'click', exportJSON);
  on('btnExportCSV', 'click', exportCSV);
  on('btnImportJSON', 'click', () => document.getElementById('importFile').click());
  on('importFile', 'change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  on('btnImportCSV', 'click', () => document.getElementById('importCSVFile').click());
  on('importCSVFile', 'change', (e) => {
    if (e.target.files[0]) importCSV(e.target.files[0]);
    e.target.value = '';
  });
  on('modalClose', 'click', closeModal);
  on('modal', 'click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'dashboard') renderNAV();
    });
  });
}
/* ================= FASE 5 — Dashboard de NAV ================= */

// Delega para o motor testado. A versão anterior ignorava o saldo inicial da
// conta quando não havia saldo diário registrado, divergindo do dashboard.
function accountBalanceAt(account, date) {
  return currentBalance(account, date);
}

function fxRateAt(currency, date) {
  return fxPerEur(currency, date);
}

function toBase(amount, currency, date) {
  if (amount == null) return 0;
  return convertApprox(amount, currency, state.settings.baseCurrency, date);
}

// Um bem não existe no patrimônio antes de ter sido adquirido — sem esta
// guarda, o gráfico mostraria imóveis comprados em 2026 lá atrás em 2023.
function assetAt(asset, date) {
  if (asset.acquiredDate && date < asset.acquiredDate) return { value: 0, debt: 0 };
  return { value: assetValue(asset, date).value, debt: assetDebt(asset, date) };
}

function buildNAVSeries() {
  fxAproximou = false;
  const dates = [];
  state.balances.forEach((b) => dates.push(b.date));
  state.transactions.forEach((t) => dates.push(t.date));
  state.fx.forEach((f) => dates.push(f.date));
  state.assets.forEach((a) => dates.push(a.acquiredDate));
  state.valuations.forEach((v) => dates.push(v.date));
  const valid = dates.filter(Boolean).map((d) => new Date(d + 'T00:00:00'));
  if (!valid.length) return null;
  const min = new Date(Math.min(...valid));
  const today = new Date();
  // A série vai até hoje. Antes ela parava na última data com dado e
  // acrescentava hoje como ponto solto, criando um salto na linha.
  const max = new Date(Math.max(Math.max(...valid), today.getTime()));
  let points = [];
  const cur = new Date(min.getFullYear(), min.getMonth(), 1);
  while (cur <= max) {
    const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    if (end >= min) points.push(end.toISOString().slice(0, 10));
    cur.setMonth(cur.getMonth() + 1);
  }
  const hojeISO = todayISO();
  if (!points.length || points[points.length - 1] < hojeISO) points.push(hojeISO);

  // Um imóvel comprado em 2014 gera mais de 150 pontos mensais. Acima de 60,
  // a série é rareada mantendo início e fim, para o gráfico continuar legível.
  const MAX_PONTOS = 60;
  if (points.length > MAX_PONTOS) {
    const passo = Math.ceil(points.length / MAX_PONTOS);
    const ultimo = points[points.length - 1];
    points = points.filter((_, i) => i % passo === 0);
    if (points[points.length - 1] !== ultimo) points.push(ultimo);
  }
  /* Índice por conta, montado uma vez. Sem ele, cada ponto da série varria a
     lista inteira de saldos e lançamentos para cada conta: com 77 contas e 36
     pontos isso passa de nove milhões de comparações. */
  const idxSaldos = new Map();
  const idxLanc = new Map();
  state.accounts.forEach((a) => { idxSaldos.set(a.id, []); idxLanc.set(a.id, []); });
  state.balances.forEach((b) => { const l = idxSaldos.get(b.accountId); if (l) l.push(b); });
  state.transactions.forEach((trn) => {
    new Set([trn.accountId, trn.toAccountId].filter(Boolean)).forEach((accId) => {
      const l = idxLanc.get(accId); if (l) l.push(trn);
    });
  });
  idxSaldos.forEach((l) => l.sort((x, y) => x.date.localeCompare(y.date)));
  idxLanc.forEach((l) => l.sort((x, y) => x.date.localeCompare(y.date)));

  const saldoEm = (acct, D) => {
    const saldos = idxSaldos.get(acct.id) || [];
    let anchor = null;
    for (const b of saldos) { if (b.date <= D) anchor = b; else break; }
    let valor = anchor ? Number(anchor.value) : Number(acct.initialBalance) || 0;
    const desde = anchor ? anchor.date : null;
    for (const trn of (idxLanc.get(acct.id) || [])) {
      if (trn.date > D) break;
      if (desde && trn.date <= desde) continue;
      valor += signedAmount(trn, acct.id);
    }
    return valor;
  };

  const out = [];
  for (const D of points) {
    let financial = 0, properties = 0, vehicles = 0, debt = 0, investments = 0;
    for (const acct of state.accounts) {
      const v = toBase(saldoEm(acct, D), acct.currency, D);
      if (v != null) financial += v;
    }
    for (const pos of state.positions) {
      const v = toBase(positionValue(pos, D), pos.currency, D);
      if (v != null) investments += v;
    }
    for (const a of state.assets) {
      const at = assetAt(a, D);
      const val = toBase(at.value, a.currency, D);
      const dbt = toBase(at.debt, a.currency, D);
      if (val == null) continue;
      if (a.type === 'property') properties += val; else vehicles += val;
      if (dbt != null) debt += dbt;
    }
    out.push({ date: D, financial, investments, properties, vehicles, debt, net: financial + investments + properties + vehicles - debt });
  }
  return { points: out };
}

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#e94560', '#8b5cf6', '#0891b2', '#db2777', '#64748b'];

/* Fatias da composição na data de hoje, já convertidas para a moeda base.
   Só valores positivos entram: dívida não é fatia de pizza, aparece no rodapé. */
function buildPieData() {
  const base = state.settings.baseCurrency;
  const hoje = todayISO();
  const saldos = currentBalancesAll();
  const modo = state.ui.navBreak || 'currency';
  let itens = [];

  if (modo === 'class') {
    const fin = {};
    state.accounts.forEach((a) => { fin[a.currency] = (fin[a.currency] || 0) + saldos[a.id]; });
    const im = assetTotals('property', hoje);
    const ve = assetTotals('vehicle', hoje);
    const carteira = investmentTotals(hoje);
    itens = [
      { label: t('nav.financial'), value: consolidate(fin, base, hoje).total },
      { label: t('dashboard.investments'), value: consolidate(carteira.value, base, hoje).total },
      { label: t('nav.properties'), value: consolidate(im.gross, base, hoje).total },
      { label: t('nav.vehicles'), value: consolidate(ve.gross, base, hoje).total }
    ];
  } else if (modo === 'currency') {
    const porMoeda = {};
    state.accounts.forEach((a) => { porMoeda[a.currency] = (porMoeda[a.currency] || 0) + saldos[a.id]; });
    state.assets.forEach((a) => { porMoeda[a.currency] = (porMoeda[a.currency] || 0) + assetValue(a, hoje).value; });
    state.positions.forEach((p) => { porMoeda[p.currency] = (porMoeda[p.currency] || 0) + positionValue(p, hoje); });
    Object.keys(porMoeda).forEach((c) => {
      const v = convert(porMoeda[c], c, base, hoje);
      if (v != null) itens.push({ label: c, value: v });
    });
  } else {
    state.accounts.forEach((a) => {
      const v = convert(saldos[a.id], a.currency, base, hoje);
      if (v != null) itens.push({ label: a.name, value: v });
    });
    state.assets.forEach((a) => {
      const v = convert(assetValue(a, hoje).value, a.currency, base, hoje);
      if (v != null) itens.push({ label: a.name, value: v });
    });
    state.positions.forEach((p) => {
      const v = convert(positionValue(p, hoje), p.currency, base, hoje);
      if (v != null) itens.push({ label: p.name, value: v });
    });
  }

  let pos = itens.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  // Cauda longa vira uma fatia só: oito fatias já é o limite do legível
  if (pos.length > 8) {
    const resto = pos.slice(7).reduce((soma, i) => soma + i.value, 0);
    pos = pos.slice(0, 7).concat([{ label: t('nav.others'), value: resto }]);
  }
  pos.forEach((item, i) => { item.color = PIE_COLORS[i % PIE_COLORS.length]; });
  return pos;
}

function arcoPizza(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const grande = (a1 - a0) > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${grande} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function renderNAVPie(wrap, legend, empty) {
  const base = state.settings.baseCurrency;
  const hoje = todayISO();
  const fatias = buildPieData();
  const total = fatias.reduce((soma, f) => soma + f.value, 0);

  if (!fatias.length || total <= 0) {
    wrap.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.textContent = t('nav.empty');
    legend.innerHTML = '';
    return;
  }
  wrap.classList.remove('hidden');
  empty.classList.add('hidden');

  const W = 720, H = 320, cx = 170, cy = 160, r = 128;
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('nav.pieTitle')}">`;

  if (fatias.length === 1) {
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fatias[0].color}"/>`;
  } else {
    let ang = -Math.PI / 2;
    fatias.forEach((f) => {
      const fim = ang + (f.value / total) * Math.PI * 2;
      svg += `<path d="${arcoPizza(cx, cy, r, ang, fim)}" fill="${f.color}" stroke="var(--surface)" stroke-width="1.5"/>`;
      const pct = (f.value / total) * 100;
      if (pct >= 6) {
        const meio = (ang + fim) / 2;
        const tx = cx + Math.cos(meio) * r * 0.62;
        const ty = cy + Math.sin(meio) * r * 0.62;
        svg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">${pct.toFixed(1)}%</text>`;
      }
      ang = fim;
    });
  }

  // Tabela ao lado, porque fatia fina não cabe rótulo
  let y = 34;
  fatias.forEach((f) => {
    const pct = (f.value / total) * 100;
    svg += `<rect x="360" y="${y - 10}" width="11" height="11" rx="2" fill="${f.color}"/>`;
    svg += `<text x="378" y="${y}" font-size="12" fill="var(--text)">${escapeHtml(String(f.label)).slice(0, 22)}</text>`;
    svg += `<text x="${W - 16}" y="${y}" text-anchor="end" font-size="12" fill="var(--muted)">${fmtMoney(f.value, base)} · ${pct.toFixed(1)}%</text>`;
    y += 24;
  });
  svg += `<line x1="360" y1="${y - 8}" x2="${W - 16}" y2="${y - 8}" stroke="var(--border)"/>`;
  svg += `<text x="378" y="${y + 12}" font-size="12" font-weight="600" fill="var(--text)">${t('portfolio.total')}</text>`;
  svg += `<text x="${W - 16}" y="${y + 12}" text-anchor="end" font-size="12" font-weight="600" fill="var(--text)">${fmtMoney(total, base)}</text>`;

  const imD = assetTotals('property', hoje).debt;
  const veD = assetTotals('vehicle', hoje).debt;
  const dividas = {};
  [imD, veD].forEach((m) => Object.keys(m).forEach((c) => { dividas[c] = (dividas[c] || 0) + m[c]; }));
  const totalDivida = consolidate(dividas, base, hoje).total;
  if (totalDivida > 0) {
    svg += `<text x="378" y="${y + 32}" font-size="12" fill="var(--muted)">${t('nav.debt')}</text>`;
    svg += `<text x="${W - 16}" y="${y + 32}" text-anchor="end" font-size="12" fill="#b91c1c">− ${fmtMoney(totalDivida, base)}</text>`;
    svg += `<text x="378" y="${y + 52}" font-size="12" font-weight="700" fill="var(--text)">${t('nav.net')}</text>`;
    svg += `<text x="${W - 16}" y="${y + 52}" text-anchor="end" font-size="12" font-weight="700" fill="var(--text)">${fmtMoney(total - totalDivida, base)}</text>`;
  }
  svg += '</svg>';
  wrap.innerHTML = `<div id="navTip" class="nav-tip hidden"></div>` + svg;
  legend.innerHTML = '';
}

/* Série mensal de entradas e saídas, separando o que já aconteceu do que está
   previsto. Realizado vem dos lançamentos; previsto, das parcelas em aberto. */
/* Agrupa por dia, semana ou mês. A chave de agrupamento muda; o resto do
   cálculo é o mesmo — realizado vem dos lançamentos, previsto das parcelas. */
function cashBucket(data, grao) {
  if (grao === 'daily') return data;
  if (grao === 'weekly') {
    // segunda-feira da semana daquela data
    const d = new Date(data + 'T00:00:00Z');
    const dia = (d.getUTCDay() + 6) % 7;
    return new Date(d.getTime() - dia * 86400000).toISOString().slice(0, 10);
  }
  return data.slice(0, 7);
}

function cashLabel(chave, grao) {
  if (grao === 'monthly') return chave.slice(5) + '/' + chave.slice(2, 4);
  return chave.slice(8) + '/' + chave.slice(5, 7);
}

function buildCashflowSeries(atras, frente, grao) {
  const g = grao || state.ui.cashGrain || 'monthly';
  const base = state.settings.baseCurrency;
  const hoje = todayISO();
  const meses = [];

  if (g === 'monthly') {
    for (let k = -atras; k <= frente; k++) meses.push(addPeriod(hoje.slice(0, 8) + '01', 'monthly', k).slice(0, 7));
  } else {
    const passo = g === 'weekly' ? 'weekly' : 'daily';
    const inicio = cashBucket(addPeriod(hoje, passo, -atras), g);
    for (let k = 0; k <= atras + frente; k++) meses.push(cashBucket(addPeriod(inicio, passo, k), g));
  }

  const mapa = {};
  meses.forEach((m) => { mapa[m] = { month: m, inReal: 0, outReal: 0, inPrev: 0, outPrev: 0 }; });

  state.transactions.forEach((trn) => {
    const m = cashBucket(trn.date, g);
    if (!mapa[m]) return;
    const v = convert(trn.value, accountCurrency(trn.accountId), base, trn.date);
    if (v == null) return;
    if (trn.type === 'income') mapa[m].inReal += v;
    else if (trn.type === 'expense') mapa[m].outReal += v;
  });

  const deISO = g === 'monthly' ? meses[0] + '-01' : meses[0];
  const ateISO = g === 'monthly' ? meses[meses.length - 1] + '-31' : meses[meses.length - 1];
  allInstallments(deISO, ateISO).forEach((p) => {
    if (p.status === 'paid') return; // já virou lançamento, contaria duas vezes
    const m = cashBucket(p.dueDate, g);
    if (!mapa[m]) return;
    const conta = accountById(p.schedule.accountId);
    const v = convert(p.amount, conta ? conta.currency : base, base, p.dueDate);
    if (v == null) return;
    if (p.schedule.kind === 'receivable') mapa[m].inPrev += v;
    else mapa[m].outPrev += v;
  });

  return meses.map((m) => mapa[m]);
}

function renderCashflow() {
  const painel = document.getElementById('tab-dashboard');
  if (painel && !painel.classList.contains('active')) return;
  const wrap = document.getElementById('cashChart');
  const vazio = document.getElementById('cashEmpty');
  const nota = document.getElementById('cashNote');
  if (!wrap) return;

  const base = state.settings.baseCurrency;
  if (nota) nota.textContent = t('cash.note').replace('{code}', base);

  const g = state.ui.cashGrain || 'monthly';
  const janelas = { daily: [14, 14], weekly: [8, 8], monthly: [5, 6] };
  const [atras, frente] = janelas[g];
  const pontos = buildCashflowSeries(atras, frente, g);

  const sel = document.getElementById('cashGrain');
  if (sel) {
    sel.innerHTML = ['daily', 'weekly', 'monthly']
      .map((k) => `<option value="${k}" ${g === k ? 'selected' : ''}>${t('cash.' + k)}</option>`).join('');
    sel.value = g;
  }
  const maximo = Math.max(...pontos.map((p) => Math.max(p.inReal + p.inPrev, p.outReal + p.outPrev)), 0);
  if (maximo <= 0) {
    wrap.classList.add('hidden');
    if (vazio) { vazio.textContent = t('cash.empty'); vazio.classList.remove('hidden'); }
    return;
  }
  wrap.classList.remove('hidden');
  if (vazio) vazio.classList.add('hidden');

  const W = 720, H = 300, padL = 70, padR = 12, padT = 14, padB = 46;
  const larguraMes = (W - padL - padR) / pontos.length;
  const larguraBarra = Math.max(6, larguraMes / 2 - 6);
  const Y = (v) => padT + (1 - v / maximo) * (H - padT - padB);
  const atual = cashBucket(todayISO(), g);

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('cash.title')}">`;
  svg += `<defs>
    <pattern id="hachIn" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill="#dcfce7"/><line x1="0" y1="0" x2="0" y2="5" stroke="#16a34a" stroke-width="2.5"/>
    </pattern>
    <pattern id="hachOut" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill="#fee2e2"/><line x1="0" y1="0" x2="0" y2="5" stroke="#b91c1c" stroke-width="2.5"/>
    </pattern>
  </defs>`;

  for (let g = 0; g <= 4; g++) {
    const val = maximo * g / 4, y = Y(val);
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--border)"/>`;
    svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${fmtMoney(val, base)}</text>`;
  }

  pontos.forEach((p, i) => {
    const x0 = padL + i * larguraMes;
    const xIn = x0 + larguraMes / 2 - larguraBarra - 2;
    const xOut = x0 + larguraMes / 2 + 2;
    const base0 = Y(0);

    // entradas: realizado na base, previsto empilhado em cima
    if (p.inReal > 0) svg += `<rect x="${xIn.toFixed(1)}" y="${Y(p.inReal).toFixed(1)}" width="${larguraBarra.toFixed(1)}" height="${(base0 - Y(p.inReal)).toFixed(1)}" fill="#16a34a" rx="2"/>`;
    if (p.inPrev > 0) svg += `<rect x="${xIn.toFixed(1)}" y="${Y(p.inReal + p.inPrev).toFixed(1)}" width="${larguraBarra.toFixed(1)}" height="${(Y(p.inReal) - Y(p.inReal + p.inPrev)).toFixed(1)}" fill="url(#hachIn)" stroke="#16a34a" stroke-width="0.6" rx="2"/>`;
    if (p.outReal > 0) svg += `<rect x="${xOut.toFixed(1)}" y="${Y(p.outReal).toFixed(1)}" width="${larguraBarra.toFixed(1)}" height="${(base0 - Y(p.outReal)).toFixed(1)}" fill="#b91c1c" rx="2"/>`;
    if (p.outPrev > 0) svg += `<rect x="${xOut.toFixed(1)}" y="${Y(p.outReal + p.outPrev).toFixed(1)}" width="${larguraBarra.toFixed(1)}" height="${(Y(p.outReal) - Y(p.outReal + p.outPrev)).toFixed(1)}" fill="url(#hachOut)" stroke="#b91c1c" stroke-width="0.6" rx="2"/>`;

    const destaque = p.month === atual;
    svg += `<text x="${(x0 + larguraMes / 2).toFixed(1)}" y="${H - 28}" text-anchor="middle" font-size="9" ${destaque ? 'font-weight="700"' : ''} fill="var(--${destaque ? 'text' : 'muted'})">${cashLabel(p.month, g)}</text>`;
  });

  // legenda
  const itens = [
    { cor: '#16a34a', txt: t('cash.in') + ' (' + t('cash.realized') + ')' },
    { cor: 'url(#hachIn)', txt: t('cash.in') + ' (' + t('cash.forecast') + ')' },
    { cor: '#b91c1c', txt: t('cash.out') + ' (' + t('cash.realized') + ')' },
    { cor: 'url(#hachOut)', txt: t('cash.out') + ' (' + t('cash.forecast') + ')' }
  ];
  let lx = padL;
  itens.forEach((it) => {
    svg += `<rect x="${lx}" y="${H - 14}" width="10" height="10" rx="2" fill="${it.cor}" stroke="var(--border)" stroke-width="0.5"/>`;
    svg += `<text x="${lx + 15}" y="${H - 5}" font-size="10" fill="var(--muted)">${it.txt}</text>`;
    lx += 165;
  });
  svg += '</svg>';
  wrap.innerHTML = svg;
}

function renderNAVControls() {
  const box = document.getElementById('navControls');
  if (!box) return;
  const v = state.ui.navView;
  box.innerHTML = `
    <div class="nav-toggle">
      <button type="button" data-view="pie" class="${v === 'pie' ? 'active' : ''}">${t('nav.viewPie')}</button>
      <button type="button" data-view="line" class="${v === 'line' ? 'active' : ''}">${t('nav.viewLine')}</button>
    </div>
    ${v === 'pie' ? `
      <select id="navBreak" aria-label="${t('nav.breakdown')}">
        <option value="currency" ${state.ui.navBreak === 'currency' ? 'selected' : ''}>${t('nav.byCurrency')}</option>
        <option value="class" ${state.ui.navBreak === 'class' ? 'selected' : ''}>${t('nav.byClass')}</option>
        <option value="account" ${state.ui.navBreak === 'account' ? 'selected' : ''}>${t('nav.byAccount')}</option>
      </select>` : ''}`;
}

function renderNAV() {
  // Montar o gráfico custa caro com muitas contas. Se o dashboard não está à
  // vista, não há o que desenhar — a troca de aba dispara a renderização.
  const painel = document.getElementById('tab-dashboard');
  if (painel && !painel.classList.contains('active')) return;

  const wrap = document.getElementById('navChart');
  const tip = document.getElementById('navTip');
  const empty = document.getElementById('navEmpty');
  const legend = document.getElementById('navLegend');
  if (!wrap) return;
  renderNAVControls();
  const ehPizza = state.ui.navView === 'pie';
  const titulo = document.getElementById('navTitle');
  if (titulo) titulo.textContent = t(ehPizza ? 'nav.pieTitle' : 'nav.title');
  // A explicação muda com a visão: a da série mensal não vale para a pizza
  const dica = document.getElementById('navHint');
  if (dica) dica.textContent = ehPizza ? t('nav.pieNote').replace('{code}', state.settings.baseCurrency) : t('nav.hint');
  if (!ehPizza && dica) {
    // o aviso só pode ser dado depois de montar a série
    setTimeout(() => { if (fxAproximou) dica.textContent = t('nav.hint') + ' ' + t('nav.approx'); }, 0);
  }
  if (state.ui.navView === 'pie') { renderNAVPie(wrap, legend, empty); return; }

  const series = buildNAVSeries();
  if (!series || series.points.length < 2) {
    wrap.classList.add('hidden'); empty.classList.remove('hidden');
    empty.textContent = t('nav.empty'); return;
  }
  wrap.classList.remove('hidden'); empty.classList.add('hidden');
  const classes = [
    { key: 'net', label: t('nav.net'), color: '#e94560' },
    { key: 'financial', label: t('nav.financial'), color: '#2563eb' },
    { key: 'investments', label: t('dashboard.investments'), color: '#8b5cf6' },
    { key: 'properties', label: t('nav.properties'), color: '#16a34a' },
    { key: 'vehicles', label: t('nav.vehicles'), color: '#f59e0b' },
    { key: 'debt', label: t('nav.debt'), color: '#b91c1c' },
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
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtMoney(val)}</text>`;
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
        classes.forEach((cc) => { if (visible[cc.key]) html += `<br>${cc.label}: ${fmtMoney(p[cc.key])}`; });
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
/* ---------- Inicialização ---------- */
async function init() {
  // 1) Interface primeiro. Abas, tema e idioma não dependem do banco de dados,
  //    então passam a funcionar mesmo que o IndexedDB falhe em abrir.
  renderLangButtons();
  const themeSel = document.getElementById('themeSelect');
  themeSel.innerHTML = ['default', 'dark', 'green', 'blue'].map((th) => `<option value="${th}">${th}</option>`).join('');
  applyTheme();
  try {
    bindEvents();
  } catch (e) {
    console.error('Falha ao ligar os eventos da interface:', e);
    showFatal('Parte da interface não pôde ser inicializada. Se você acabou de publicar, confirme que o index.html também foi atualizado. Detalhe: ' + (e && e.message ? e.message : e));
  }

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
