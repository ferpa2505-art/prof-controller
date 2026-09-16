/* ============================================================
   ProF Controller — Fases 1 a 10 (8: mercado; 9: comparativo; 10: % e referência, notícias, nova navegação)

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
    'tabs.transactions': 'Lançamentos',
    'tabs.budgets': 'Orçamentos',
    'tabs.settings': 'Configurações avançadas',
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
    'settings.title': 'Configurações avançadas',
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
    'tabs.bills': 'A pagar e receber',
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
    'modal.move': 'Aporte ou resgate',
    'mkt.lookup': 'Buscar ativo (ticker ou ISIN)',
    'mkt.manual': 'Cadastrar sem busca (renda fixa, CDB ou ativo sem cotação)',
    'tabs.registry': 'Cadastros',
    'tabs.flows': 'Entradas e Saídas',
    'tabs.news': 'Notícias',
    'gear.title': 'Preferências',
    'gear.open': 'Abrir preferências',
    'gear.theme': 'Tema',
    'gear.lang': 'Idioma',
    'gear.help': 'Mostrar explicações das abas',
    'gear.advanced': 'Configurações avançadas',
    'theme.default': 'Claro',
    'theme.dark': 'Escuro',
    'theme.green': 'Verde',
    'theme.blue': 'Azul',
    'help.dashboard': 'Visão geral do seu patrimônio: saldo das contas, investimentos, imóveis e veículos, tudo somado na moeda base, com gráficos de evolução e de fluxo de caixa.',
    'help.investments': 'Suas ações, fundos, renda fixa e cripto. Busque o ativo pelo ticker ou ISIN, registre compras e vendas e acompanhe se está ganhando ou perdendo. Mais abaixo: watchlist e comparativo com CDB, Ibovespa e S&P 500.',
    'help.accounts': 'Cadastre aqui cada conta bancária, carteira ou corretora, com a moeda e o saldo inicial. As outras telas usam essas contas.',
    'help.balances': 'Registre o saldo real de uma conta em uma data (por exemplo, o do extrato). O app parte desse saldo e soma os lançamentos seguintes.',
    'help.budgets': 'Defina um limite mensal de gastos por categoria e veja quanto já foi usado no mês.',
    'help.fx': 'Taxas de câmbio usadas para somar valores em moedas diferentes. Busque as taxas do dia com um clique ou cadastre manualmente.',
    'help.portfolio': 'Bens como imóveis e veículos, com valor de avaliação e dívidas ligadas a eles (financiamentos). Entram no patrimônio total.',
    'help.transactions': 'Dinheiro que já entrou ou saiu: receitas, despesas e transferências entre contas. Cada lançamento atualiza o saldo da conta.',
    'help.bills': 'Contas futuras a pagar e valores a receber, inclusive parcelados ou recorrentes. Ao quitar, o app gera o lançamento na conta.',
    'help.news': 'Manchetes sobre os ativos da sua carteira, da watchlist e do mercado. Clique para ler no site original. Atualiza ao abrir o app e a cada 2 horas.',
    'help.settings': 'Moeda base, chaves das fontes de cotação e notícias, backup e importação de dados.',
    'news.title': 'Notícias',
    'news.refresh': 'Atualizar',
    'news.loading': 'Buscando notícias…',
    'news.updated': 'Atualizado {t}.',
    'news.failed': 'Algumas fontes não responderam.',
    'news.now': 'agora',
    'news.min': 'há {n} min',
    'news.hours': 'há {n} h',
    'news.days': 'há {n} d',
    'news.all': 'Todas',
    'news.portfolio': 'Minha carteira',
    'news.watch': 'Watchlist',
    'news.market': 'Mercado',
    'news.lang': 'Idioma das notícias',
    'news.langAll': 'Todos os idiomas',
    'news.empty': 'Nenhuma notícia carregada ainda. Clique em Atualizar.',
    'news.emptyFilter': 'Nenhuma notícia para este filtro.',
    'news.noAssets': 'Adicione posições com ticker ou ativos à watchlist para ver atalhos.',
    'news.shortcuts': 'Atalhos por ativo',
    'news.google': 'Google Notícias',
    'news.testOk': '{n} manchetes',
    'news.disclaimer': 'Mostramos apenas título, fonte e horário. O conteúdo pertence a cada site. Notícias não são recomendação de investimento.',
    'cmp.groupPct': 'Em percentual (recomendado)',
    'cmp.groupMoney': 'Em dinheiro',
    'cmp.m.ret': 'Ganho ou perda sobre o investido (%)',
    'cmp.reference': 'Comparar contra',
    'cmp.refNone': 'Nenhuma referência',
    'cmp.refAssets': 'Ativos e carteira',
    'cmp.refOnlyPct': 'Disponível nas métricas em percentual',
    'cmp.refLine': 'Referência: {r} (linha do zero)',
    'cmp.vsRef': 'diferença para {r}',
    'cmp.rankVs': 'Ranking: quanto cada um ficou acima ou abaixo de {r}',
    'cmp.rank.ret': 'Ranking: ganho ou perda sobre o investido',
    'cmp.rank.price': 'Ranking: variação no período',
    'cmp.rank.profit': 'Ranking: resultado em dinheiro',
    'cmp.help.ret': 'Quanto cada investimento está ganhando ou perdendo em relação ao que você aplicou. Os índices recebem o mesmo dinheiro nas mesmas datas.',
    'cmp.help.price': 'Quanto cada ativo e índice subiu ou caiu no período escolhido, todos partindo de 0%. Ignora quando você comprou.',
    'cmp.help.profit': 'Lucro ou prejuízo em dinheiro de cada investimento.',
    'cmp.help.value': 'Quanto cada investimento vale hoje a preço de mercado.',
    'cmp.help.both': 'Linha contínua: valor de mercado. Tracejada: quanto foi investido.',
    'cmp.help.cost': 'Quanto foi investido em cada ativo ao longo do tempo.',
    'cmp.benchShort': '{b}: histórico gratuito disponível desde {d}; aportes anteriores usam o primeiro valor conhecido.',
    'cmp.refOwnFlows': 'Cada ativo é comparado com {r} recebendo os aportes dele mesmo.',
    'cmp.benchFlowsOf': 'Os índices recebem os aportes de {a}.',
    'mkt.lookupHint': 'Ex.: TTWO, PETR4 ou o ISIN US8740541094. O app preenche nome, ticker, moeda e a cotação atual.',
    'mkt.search': 'Buscar',
    'mkt.searching': 'Buscando…',
    'mkt.source': 'Fonte',
    'mkt.noTicker': 'Informe um ticker ou ISIN.',
    'mkt.notFound': 'Nenhum ativo encontrado para este código.',
    'mkt.needFinnhub': 'Cadastre a chave da Finnhub em Configurações para buscar por ISIN e cotar ações dos EUA.',
    'mkt.noQuote': 'Cotação indisponível para este ativo no plano gratuito. Registre a cotação manualmente.',
    'mkt.currencyUnsupported': 'A moeda {code} não está cadastrada no app. Escolha a moeda manualmente.',
    'mkt.firstBuy': 'Compra',
    'mkt.date': 'Data da operação',
    'mkt.mode': 'Como informar',
    'mkt.modeAmount': 'Valor investido — o app calcula a quantidade',
    'mkt.modeQty': 'Quantidade e total pago — o app calcula o preço',
    'mkt.modeAmountSell': 'Valor a resgatar — o app calcula a quantidade',
    'mkt.modeQtySell': 'Quantidade e total recebido — o app calcula o preço',
    'mkt.amount': 'Valor investido',
    'mkt.amountSell': 'Valor a resgatar',
    'mkt.total': 'Total pago',
    'mkt.totalSell': 'Total recebido',
    'mkt.whole': 'Somente quantidades inteiras (a sobra fica na conta)',
    'mkt.priceToday': 'Cotação de hoje',
    'mkt.priceOn': 'Fechamento em {data}',
    'mkt.noPriceYet': 'Sem cotação ainda. Use o botão Buscar ou o modo quantidade e total.',
    'mkt.needPrice': 'Sem cotação para calcular a quantidade. Busque o ativo ou use o modo quantidade e total.',
    'mkt.notEnough': 'O valor não compra nem uma unidade.',
    'mkt.youGet': 'Quantidade',
    'mkt.leftover': 'Sobra em dinheiro',
    'mkt.unitPaid': 'Preço unitário pago',
    'mkt.vsMarket': 'Diferença para o mercado',
    'mkt.unit': 'Preço unit.',
    'mkt.sellTooMuch': 'Quantidade maior que a possuída nesta data ({n}).',
    'mkt.loadingHist': 'Carregando histórico de preços…',
    'mkt.loadingN': 'Carregando histórico {n} de {total}…',
    'mkt.rateWait': 'Limite de chamadas por minuto atingido. Aguardando 1 minuto para continuar…',
    'mkt.histFail': 'Histórico indisponível:',
    'mkt.histManual': 'Sem histórico online para este ativo. O gráfico usa as cotações registradas no app.',
    'mkt.chart': 'Gráfico',
    'mkt.chartTitle': 'Investido x valor de mercado',
    'mkt.chartEmpty': 'Ainda não há pontos suficientes para o gráfico. Registre um aporte.',
    'mkt.marketChart': 'Gráfico de mercado',
    'mkt.portfolioChart': 'Gráfico da carteira',
    'mkt.invested': 'Investido',
    'mkt.market': 'Valor de mercado',
    'mkt.result': 'Resultado',
    'mkt.avgPrice': 'Preço médio',
    'mkt.lastPrice': 'Última cotação',
    'mkt.p.1m': '1M',
    'mkt.p.3m': '3M',
    'mkt.p.6m': '6M',
    'mkt.p.1y': '1A',
    'mkt.p.all': 'Tudo',
    'mkt.watchTitle': 'Watchlist',
    'mkt.watchAdd': 'Adicionar',
    'mkt.watchRefresh': 'Atualizar cotações',
    'mkt.watchEmpty': 'Nenhum ativo acompanhado. Digite um ticker ou ISIN e clique em Adicionar.',
    'mkt.alreadyWatch': 'Este ativo já está na watchlist.',
    'mkt.asset': 'Ativo',
    'mkt.exchange': 'Bolsa',
    'mkt.dayChange': 'Variação do dia',
    'mkt.updated': 'Atualizado',
    'mkt.buy': 'Comprar',
    'api.title': 'Cotações de mercado',
    'api.hint': 'Chaves gratuitas da Finnhub (ISIN e ações dos EUA), Twelve Data (histórico) e brapi.dev (B3). Ficam salvas só neste navegador e não entram no backup.',
    'api.save': 'Salvar chaves',
    'api.test': 'Testar conexões',
    'api.saved': 'Chaves salvas neste navegador.',
    'api.testing': 'Testando…',
    'api.ok': 'conectado',
    'api.noKey': 'sem chave',
    'cmp.title': 'Comparativo',
    'cmp.assets': 'Ativos (até {n})',
    'cmp.benchmarks': 'Comparar com',
    'cmp.color': 'Cor',
    'cmp.total': 'Carteira total',
    'cmp.noAssets': 'Cadastre posições ou adicione ativos à watchlist.',
    'cmp.b.cdi': 'CDB',
    'cmp.b.ibov': 'Ibovespa',
    'cmp.b.spx': 'S&P 500 (SPY)',
    'cmp.cdbCdi': 'CDB {p}% do CDI',
    'cmp.cdbFixed': 'CDB {p}% a.a.',
    'cmp.cdbModeCdi': 'Percentual do CDI',
    'cmp.cdbModeFixed': 'Taxa fixa ao ano',
    'cmp.ofCdi': 'do CDI',
    'cmp.perYear': 'ao ano',
    'cmp.metric': 'Métrica',
    'cmp.m.both': 'Investido x valor de mercado',
    'cmp.m.value': 'Valor de mercado',
    'cmp.m.cost': 'Valor investido',
    'cmp.m.profit': 'Resultado em dinheiro',
    'cmp.m.retInv': 'Rentabilidade sobre o investido (%)',
    'cmp.m.price': 'Variação no período (%)',
    'cmp.currency': 'Moeda',
    'cmp.baseCur': 'Moeda base ({c})',
    'cmp.style': 'Estilo',
    'cmp.lines': 'Linhas',
    'cmp.area': 'Área',
    'cmp.markers': 'Marcar aportes e resgates',
    'cmp.p.1m': '1M',
    'cmp.p.3m': '3M',
    'cmp.p.6m': '6M',
    'cmp.p.ytd': 'No ano',
    'cmp.p.1y': '1A',
    'cmp.p.3y': '3A',
    'cmp.p.5y': '5A',
    'cmp.p.all': 'Desde o 1º aporte',
    'cmp.p.custom': 'Personalizado',
    'cmp.pickOne': 'Escolha ao menos um ativo ou índice acima.',
    'cmp.noData': 'Sem dados suficientes para este período. Tente um período maior ou outra métrica.',
    'cmp.maxReached': 'Máximo de {n} ativos por comparação.',
    'cmp.sameMoney': '(mesmo dinheiro)',
    'cmp.watchOnlyPrice': '{a} está só na watchlist e aparece apenas em "Variação no período".',
    'cmp.benchNeedsFlows': 'Índices em valor precisam de aportes registrados.',
    'cmp.costNoBench': 'Na métrica "Valor investido" os índices não aparecem: o investido seria o mesmo.',
    'cmp.benchCombined': 'Os índices recebem os aportes somados dos ativos selecionados.',
    'cmp.cdiFail': 'CDI do Banco Central indisponível; usando a taxa fixa configurada.',
    'cmp.benchFail': '{b} indisponível:',
    'cmp.series': 'Série',
    'cmp.start': 'Início',
    'cmp.end': 'Atual',
    'cmp.change': 'Variação',
    'cmp.max': 'Máximo',
    'cmp.min': 'Mínimo',
    'cmp.benchFlows': 'Aportes usados nos índices',
    'cmp.flowsSum': 'Soma dos selecionados'

  },
  'en': {
    'tabs.dashboard': 'Dashboard',
    'tabs.accounts': 'Accounts',
    'tabs.balances': 'Daily Balances',
    'tabs.transactions': 'Transactions',
    'tabs.budgets': 'Budgets',
    'tabs.settings': 'Advanced settings',
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
    'settings.title': 'Advanced settings',
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
    'tabs.bills': 'Payables & receivables',
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
    'modal.move': 'Contribution or withdrawal',
    'mkt.lookup': 'Find asset (ticker or ISIN)',
    'mkt.manual': 'Add without search (fixed income, CDs or unlisted assets)',
    'tabs.registry': 'Records',
    'tabs.flows': 'Money in & out',
    'tabs.news': 'News',
    'gear.title': 'Preferences',
    'gear.open': 'Open preferences',
    'gear.theme': 'Theme',
    'gear.lang': 'Language',
    'gear.help': 'Show tab explanations',
    'gear.advanced': 'Advanced settings',
    'theme.default': 'Light',
    'theme.dark': 'Dark',
    'theme.green': 'Green',
    'theme.blue': 'Blue',
    'help.dashboard': 'Overview of your net worth: account balances, investments, property and vehicles, all added up in the base currency, with growth and cash flow charts.',
    'help.investments': 'Your stocks, funds, fixed income and crypto. Find an asset by ticker or ISIN, record buys and sells and see whether you are gaining or losing. Further down: watchlist and comparison with CDB, Ibovespa and S&P 500.',
    'help.accounts': 'Add each bank account, wallet or brokerage here, with its currency and opening balance. Other screens use these accounts.',
    'help.balances': 'Record the actual balance of an account on a date (for example, from a statement). The app starts from it and adds later entries.',
    'help.budgets': 'Set a monthly spending limit per category and see how much has been used this month.',
    'help.fx': 'Exchange rates used to add up amounts in different currencies. Fetch today\'s rates in one click or add them manually.',
    'help.portfolio': 'Assets such as property and vehicles, with valuation and related debts (loans). They count toward total net worth.',
    'help.transactions': 'Money that has already come in or gone out: income, expenses and transfers. Each entry updates the account balance.',
    'help.bills': 'Future bills to pay and amounts to receive, including installments or recurring ones. When settled, the app creates the entry.',
    'help.news': 'Headlines about your portfolio, watchlist and the market. Click to read on the original site. Refreshes when you open the app and every 2 hours.',
    'help.settings': 'Base currency, keys for price and news sources, backup and data import.',
    'news.title': 'News',
    'news.refresh': 'Refresh',
    'news.loading': 'Fetching news…',
    'news.updated': 'Updated {t}.',
    'news.failed': 'Some sources did not respond.',
    'news.now': 'just now',
    'news.min': '{n} min ago',
    'news.hours': '{n} h ago',
    'news.days': '{n} d ago',
    'news.all': 'All',
    'news.portfolio': 'My portfolio',
    'news.watch': 'Watchlist',
    'news.market': 'Market',
    'news.lang': 'News language',
    'news.langAll': 'All languages',
    'news.empty': 'No news loaded yet. Click Refresh.',
    'news.emptyFilter': 'No news for this filter.',
    'news.noAssets': 'Add positions with a ticker or watchlist assets to see shortcuts.',
    'news.shortcuts': 'Shortcuts by asset',
    'news.google': 'Google News',
    'news.testOk': '{n} headlines',
    'news.disclaimer': 'We show only headline, source and time. Content belongs to each site. News is not investment advice.',
    'cmp.groupPct': 'In percent (recommended)',
    'cmp.groupMoney': 'In money',
    'cmp.m.ret': 'Gain or loss on invested (%)',
    'cmp.reference': 'Compare against',
    'cmp.refNone': 'No reference',
    'cmp.refAssets': 'Assets and portfolio',
    'cmp.refOnlyPct': 'Available for percentage metrics',
    'cmp.refLine': 'Reference: {r} (zero line)',
    'cmp.vsRef': 'difference vs {r}',
    'cmp.rankVs': 'Ranking: how far above or below {r}',
    'cmp.rank.ret': 'Ranking: gain or loss on invested',
    'cmp.rank.price': 'Ranking: change over period',
    'cmp.rank.profit': 'Ranking: gain/loss in money',
    'cmp.help.ret': 'How much each investment is gaining or losing relative to what you put in. Indices receive the same money on the same dates.',
    'cmp.help.price': 'How much each asset and index rose or fell in the chosen period, all starting at 0%. Ignores when you bought.',
    'cmp.help.profit': 'Profit or loss in money for each investment.',
    'cmp.help.value': 'What each investment is worth at market price.',
    'cmp.help.both': 'Solid line: market value. Dashed: amount invested.',
    'cmp.help.cost': 'How much was invested in each asset over time.',
    'cmp.benchShort': '{b}: free history available since {d}; earlier contributions use the first known value.',
    'cmp.refOwnFlows': 'Each asset is compared with {r} receiving its own contributions.',
    'cmp.benchFlowsOf': 'Indices receive the contributions of {a}.',
    'mkt.lookupHint': 'E.g. TTWO, PETR4 or ISIN US8740541094. The app fills in name, ticker, currency and current price.',
    'mkt.search': 'Search',
    'mkt.searching': 'Searching…',
    'mkt.source': 'Source',
    'mkt.noTicker': 'Enter a ticker or ISIN.',
    'mkt.notFound': 'No asset found for this code.',
    'mkt.needFinnhub': 'Add your Finnhub key in Settings to search by ISIN and quote US stocks.',
    'mkt.noQuote': 'No quote available for this asset on the free plan. Record the price manually.',
    'mkt.currencyUnsupported': 'Currency {code} is not set up in the app. Choose the currency manually.',
    'mkt.firstBuy': 'Purchase',
    'mkt.date': 'Trade date',
    'mkt.mode': 'How to enter',
    'mkt.modeAmount': 'Amount invested — app calculates quantity',
    'mkt.modeQty': 'Quantity and total paid — app calculates price',
    'mkt.modeAmountSell': 'Amount to withdraw — app calculates quantity',
    'mkt.modeQtySell': 'Quantity and total received — app calculates price',
    'mkt.amount': 'Amount invested',
    'mkt.amountSell': 'Amount to withdraw',
    'mkt.total': 'Total paid',
    'mkt.totalSell': 'Total received',
    'mkt.whole': 'Whole units only (the remainder stays in the account)',
    'mkt.priceToday': 'Today\'s price',
    'mkt.priceOn': 'Close on {data}',
    'mkt.noPriceYet': 'No price yet. Use Search or the quantity and total mode.',
    'mkt.needPrice': 'No price to calculate quantity. Search the asset or use the quantity and total mode.',
    'mkt.notEnough': 'This amount does not buy a single unit.',
    'mkt.youGet': 'Quantity',
    'mkt.leftover': 'Cash remainder',
    'mkt.unitPaid': 'Unit price paid',
    'mkt.vsMarket': 'Difference from market',
    'mkt.unit': 'Unit price',
    'mkt.sellTooMuch': 'Quantity exceeds holdings on this date ({n}).',
    'mkt.loadingHist': 'Loading price history…',
    'mkt.loadingN': 'Loading history {n} of {total}…',
    'mkt.rateWait': 'Per-minute call limit reached. Waiting 1 minute to continue…',
    'mkt.histFail': 'History unavailable:',
    'mkt.histManual': 'No online history for this asset. The chart uses prices recorded in the app.',
    'mkt.chart': 'Chart',
    'mkt.chartTitle': 'Invested vs market value',
    'mkt.chartEmpty': 'Not enough points for a chart yet. Record a contribution.',
    'mkt.marketChart': 'Market chart',
    'mkt.portfolioChart': 'Portfolio chart',
    'mkt.invested': 'Invested',
    'mkt.market': 'Market value',
    'mkt.result': 'Gain/loss',
    'mkt.avgPrice': 'Average price',
    'mkt.lastPrice': 'Last price',
    'mkt.p.1m': '1M',
    'mkt.p.3m': '3M',
    'mkt.p.6m': '6M',
    'mkt.p.1y': '1Y',
    'mkt.p.all': 'All',
    'mkt.watchTitle': 'Watchlist',
    'mkt.watchAdd': 'Add',
    'mkt.watchRefresh': 'Refresh prices',
    'mkt.watchEmpty': 'No assets on your watchlist. Type a ticker or ISIN and click Add.',
    'mkt.alreadyWatch': 'This asset is already on the watchlist.',
    'mkt.asset': 'Asset',
    'mkt.exchange': 'Exchange',
    'mkt.dayChange': 'Day change',
    'mkt.updated': 'Updated',
    'mkt.buy': 'Buy',
    'api.title': 'Market prices',
    'api.hint': 'Free keys from Finnhub (ISIN and US stocks), Twelve Data (history) and brapi.dev (B3). Stored only in this browser and excluded from backups.',
    'api.save': 'Save keys',
    'api.test': 'Test connections',
    'api.saved': 'Keys saved in this browser.',
    'api.testing': 'Testing…',
    'api.ok': 'connected',
    'api.noKey': 'no key',
    'cmp.title': 'Comparison',
    'cmp.assets': 'Assets (up to {n})',
    'cmp.benchmarks': 'Compare with',
    'cmp.color': 'Color',
    'cmp.total': 'Total portfolio',
    'cmp.noAssets': 'Add positions or watchlist assets.',
    'cmp.b.cdi': 'CDB',
    'cmp.b.ibov': 'Ibovespa',
    'cmp.b.spx': 'S&P 500 (SPY)',
    'cmp.cdbCdi': 'CDB {p}% of CDI',
    'cmp.cdbFixed': 'CDB {p}% p.a.',
    'cmp.cdbModeCdi': 'Percentage of CDI',
    'cmp.cdbModeFixed': 'Fixed annual rate',
    'cmp.ofCdi': 'of CDI',
    'cmp.perYear': 'per year',
    'cmp.metric': 'Metric',
    'cmp.m.both': 'Invested vs market value',
    'cmp.m.value': 'Market value',
    'cmp.m.cost': 'Amount invested',
    'cmp.m.profit': 'Gain/loss in money',
    'cmp.m.retInv': 'Return on invested (%)',
    'cmp.m.price': 'Change over period (%)',
    'cmp.currency': 'Currency',
    'cmp.baseCur': 'Base currency ({c})',
    'cmp.style': 'Style',
    'cmp.lines': 'Lines',
    'cmp.area': 'Area',
    'cmp.markers': 'Mark contributions and withdrawals',
    'cmp.p.1m': '1M',
    'cmp.p.3m': '3M',
    'cmp.p.6m': '6M',
    'cmp.p.ytd': 'YTD',
    'cmp.p.1y': '1Y',
    'cmp.p.3y': '3Y',
    'cmp.p.5y': '5Y',
    'cmp.p.all': 'Since 1st contribution',
    'cmp.p.custom': 'Custom',
    'cmp.pickOne': 'Pick at least one asset or index above.',
    'cmp.noData': 'Not enough data for this period. Try a longer period or another metric.',
    'cmp.maxReached': 'Up to {n} assets per comparison.',
    'cmp.sameMoney': '(same money)',
    'cmp.watchOnlyPrice': '{a} is only on the watchlist and appears only in "Change over period".',
    'cmp.benchNeedsFlows': 'Indices in money need recorded contributions.',
    'cmp.costNoBench': 'Indices are hidden for "Amount invested": the invested amount would be the same.',
    'cmp.benchCombined': 'Indices receive the combined contributions of the selected assets.',
    'cmp.cdiFail': 'Central Bank CDI unavailable; using the fixed rate set.',
    'cmp.benchFail': '{b} unavailable:',
    'cmp.series': 'Series',
    'cmp.start': 'Start',
    'cmp.end': 'Current',
    'cmp.change': 'Change',
    'cmp.max': 'High',
    'cmp.min': 'Low',
    'cmp.benchFlows': 'Contributions used for indices',
    'cmp.flowsSum': 'Sum of selected'
  },
  'es': {
    'tabs.dashboard': 'Panel',
    'tabs.accounts': 'Cuentas',
    'tabs.balances': 'Saldos Diarios',
    'tabs.transactions': 'Movimientos',
    'tabs.budgets': 'Presupuestos',
    'tabs.settings': 'Configuración avanzada',
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
    'settings.title': 'Configuración avanzada',
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
    'tabs.bills': 'Por pagar y cobrar',
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
    'modal.move': 'Aporte o rescate',
    'mkt.lookup': 'Buscar activo (ticker o ISIN)',
    'mkt.manual': 'Registrar sin búsqueda (renta fija, CDB o activo sin cotización)',
    'tabs.registry': 'Registros',
    'tabs.flows': 'Entradas y Salidas',
    'tabs.news': 'Noticias',
    'gear.title': 'Preferencias',
    'gear.open': 'Abrir preferencias',
    'gear.theme': 'Tema',
    'gear.lang': 'Idioma',
    'gear.help': 'Mostrar explicaciones de las pestañas',
    'gear.advanced': 'Configuración avanzada',
    'theme.default': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.green': 'Verde',
    'theme.blue': 'Azul',
    'help.dashboard': 'Visión general de tu patrimonio: saldos, inversiones, inmuebles y vehículos, sumados en la moneda base, con gráficos de evolución y flujo de caja.',
    'help.investments': 'Tus acciones, fondos, renta fija y cripto. Busca el activo por ticker o ISIN, registra compras y ventas y ve si ganas o pierdes. Más abajo: watchlist y comparativo con CDB, Ibovespa y S&P 500.',
    'help.accounts': 'Registra aquí cada cuenta bancaria, billetera o bróker, con su moneda y saldo inicial. Las demás pantallas usan estas cuentas.',
    'help.balances': 'Registra el saldo real de una cuenta en una fecha (por ejemplo, el del extracto). La app parte de ese saldo y suma los movimientos siguientes.',
    'help.budgets': 'Define un límite mensual de gastos por categoría y ve cuánto se ha usado en el mes.',
    'help.fx': 'Tipos de cambio usados para sumar importes en monedas distintas. Busca los tipos del día con un clic o regístralos manualmente.',
    'help.portfolio': 'Bienes como inmuebles y vehículos, con su valoración y deudas asociadas (financiaciones). Cuentan en el patrimonio total.',
    'help.transactions': 'Dinero que ya entró o salió: ingresos, gastos y transferencias. Cada movimiento actualiza el saldo de la cuenta.',
    'help.bills': 'Cuentas futuras por pagar e importes por cobrar, incluso a plazos o recurrentes. Al liquidar, la app crea el movimiento.',
    'help.news': 'Titulares sobre tu cartera, tu watchlist y el mercado. Haz clic para leer en el sitio original. Se actualiza al abrir la app y cada 2 horas.',
    'help.settings': 'Moneda base, claves de las fuentes de cotización y noticias, copia de seguridad e importación.',
    'news.title': 'Noticias',
    'news.refresh': 'Actualizar',
    'news.loading': 'Buscando noticias…',
    'news.updated': 'Actualizado {t}.',
    'news.failed': 'Algunas fuentes no respondieron.',
    'news.now': 'ahora',
    'news.min': 'hace {n} min',
    'news.hours': 'hace {n} h',
    'news.days': 'hace {n} d',
    'news.all': 'Todas',
    'news.portfolio': 'Mi cartera',
    'news.watch': 'Watchlist',
    'news.market': 'Mercado',
    'news.lang': 'Idioma de las noticias',
    'news.langAll': 'Todos los idiomas',
    'news.empty': 'Aún no hay noticias. Pulsa Actualizar.',
    'news.emptyFilter': 'No hay noticias para este filtro.',
    'news.noAssets': 'Añade posiciones con ticker o activos a la watchlist para ver accesos directos.',
    'news.shortcuts': 'Accesos por activo',
    'news.google': 'Google Noticias',
    'news.testOk': '{n} titulares',
    'news.disclaimer': 'Mostramos solo título, fuente y hora. El contenido pertenece a cada sitio. Las noticias no son recomendación de inversión.',
    'cmp.groupPct': 'En porcentaje (recomendado)',
    'cmp.groupMoney': 'En dinero',
    'cmp.m.ret': 'Ganancia o pérdida sobre lo invertido (%)',
    'cmp.reference': 'Comparar contra',
    'cmp.refNone': 'Sin referencia',
    'cmp.refAssets': 'Activos y cartera',
    'cmp.refOnlyPct': 'Disponible en métricas porcentuales',
    'cmp.refLine': 'Referencia: {r} (línea del cero)',
    'cmp.vsRef': 'diferencia con {r}',
    'cmp.rankVs': 'Ranking: cuánto quedó cada uno por encima o por debajo de {r}',
    'cmp.rank.ret': 'Ranking: ganancia o pérdida sobre lo invertido',
    'cmp.rank.price': 'Ranking: variación en el período',
    'cmp.rank.profit': 'Ranking: resultado en dinero',
    'cmp.help.ret': 'Cuánto gana o pierde cada inversión respecto a lo que aportaste. Los índices reciben el mismo dinero en las mismas fechas.',
    'cmp.help.price': 'Cuánto subió o bajó cada activo e índice en el período, todos desde 0%. No considera cuándo compraste.',
    'cmp.help.profit': 'Ganancia o pérdida en dinero de cada inversión.',
    'cmp.help.value': 'Cuánto vale cada inversión a precio de mercado.',
    'cmp.help.both': 'Línea continua: valor de mercado. Discontinua: importe invertido.',
    'cmp.help.cost': 'Cuánto se invirtió en cada activo a lo largo del tiempo.',
    'cmp.benchShort': '{b}: histórico gratuito disponible desde {d}; los aportes anteriores usan el primer valor conocido.',
    'cmp.refOwnFlows': 'Cada activo se compara con {r} recibiendo sus propios aportes.',
    'cmp.benchFlowsOf': 'Los índices reciben los aportes de {a}.',
    'mkt.lookupHint': 'Ej.: TTWO, PETR4 o el ISIN US8740541094. La app completa nombre, ticker, moneda y cotización actual.',
    'mkt.search': 'Buscar',
    'mkt.searching': 'Buscando…',
    'mkt.source': 'Fuente',
    'mkt.noTicker': 'Indica un ticker o ISIN.',
    'mkt.notFound': 'No se encontró ningún activo con este código.',
    'mkt.needFinnhub': 'Registra la clave de Finnhub en Configuración para buscar por ISIN y cotizar acciones de EE. UU.',
    'mkt.noQuote': 'Cotización no disponible para este activo en el plan gratuito. Regístrala manualmente.',
    'mkt.currencyUnsupported': 'La moneda {code} no está registrada en la app. Elige la moneda manualmente.',
    'mkt.firstBuy': 'Compra',
    'mkt.date': 'Fecha de la operación',
    'mkt.mode': 'Cómo informar',
    'mkt.modeAmount': 'Importe invertido — la app calcula la cantidad',
    'mkt.modeQty': 'Cantidad y total pagado — la app calcula el precio',
    'mkt.modeAmountSell': 'Importe a rescatar — la app calcula la cantidad',
    'mkt.modeQtySell': 'Cantidad y total recibido — la app calcula el precio',
    'mkt.amount': 'Importe invertido',
    'mkt.amountSell': 'Importe a rescatar',
    'mkt.total': 'Total pagado',
    'mkt.totalSell': 'Total recibido',
    'mkt.whole': 'Solo cantidades enteras (el sobrante queda en la cuenta)',
    'mkt.priceToday': 'Cotización de hoy',
    'mkt.priceOn': 'Cierre del {data}',
    'mkt.noPriceYet': 'Aún sin cotización. Usa Buscar o el modo cantidad y total.',
    'mkt.needPrice': 'Sin cotización para calcular la cantidad. Busca el activo o usa el modo cantidad y total.',
    'mkt.notEnough': 'El importe no alcanza para una unidad.',
    'mkt.youGet': 'Cantidad',
    'mkt.leftover': 'Sobrante en efectivo',
    'mkt.unitPaid': 'Precio unitario pagado',
    'mkt.vsMarket': 'Diferencia con el mercado',
    'mkt.unit': 'Precio unit.',
    'mkt.sellTooMuch': 'Cantidad mayor a la que tienes en esta fecha ({n}).',
    'mkt.loadingHist': 'Cargando histórico de precios…',
    'mkt.loadingN': 'Cargando histórico {n} de {total}…',
    'mkt.rateWait': 'Límite de llamadas por minuto alcanzado. Esperando 1 minuto para continuar…',
    'mkt.histFail': 'Histórico no disponible:',
    'mkt.histManual': 'Sin histórico en línea para este activo. El gráfico usa las cotizaciones registradas en la app.',
    'mkt.chart': 'Gráfico',
    'mkt.chartTitle': 'Invertido vs valor de mercado',
    'mkt.chartEmpty': 'Aún no hay puntos suficientes para el gráfico. Registra un aporte.',
    'mkt.marketChart': 'Gráfico de mercado',
    'mkt.portfolioChart': 'Gráfico de la cartera',
    'mkt.invested': 'Invertido',
    'mkt.market': 'Valor de mercado',
    'mkt.result': 'Resultado',
    'mkt.avgPrice': 'Precio medio',
    'mkt.lastPrice': 'Última cotización',
    'mkt.p.1m': '1M',
    'mkt.p.3m': '3M',
    'mkt.p.6m': '6M',
    'mkt.p.1y': '1A',
    'mkt.p.all': 'Todo',
    'mkt.watchTitle': 'Watchlist',
    'mkt.watchAdd': 'Añadir',
    'mkt.watchRefresh': 'Actualizar cotizaciones',
    'mkt.watchEmpty': 'Ningún activo en seguimiento. Escribe un ticker o ISIN y pulsa Añadir.',
    'mkt.alreadyWatch': 'Este activo ya está en la watchlist.',
    'mkt.asset': 'Activo',
    'mkt.exchange': 'Bolsa',
    'mkt.dayChange': 'Variación del día',
    'mkt.updated': 'Actualizado',
    'mkt.buy': 'Comprar',
    'api.title': 'Cotizaciones de mercado',
    'api.hint': 'Claves gratuitas de Finnhub (ISIN y acciones de EE. UU.), Twelve Data (histórico) y brapi.dev (B3). Se guardan solo en este navegador y no van en la copia de seguridad.',
    'api.save': 'Guardar claves',
    'api.test': 'Probar conexiones',
    'api.saved': 'Claves guardadas en este navegador.',
    'api.testing': 'Probando…',
    'api.ok': 'conectado',
    'api.noKey': 'sin clave',
    'cmp.title': 'Comparativo',
    'cmp.assets': 'Activos (hasta {n})',
    'cmp.benchmarks': 'Comparar con',
    'cmp.color': 'Color',
    'cmp.total': 'Cartera total',
    'cmp.noAssets': 'Registra posiciones o añade activos a la watchlist.',
    'cmp.b.cdi': 'CDB',
    'cmp.b.ibov': 'Ibovespa',
    'cmp.b.spx': 'S&P 500 (SPY)',
    'cmp.cdbCdi': 'CDB {p}% del CDI',
    'cmp.cdbFixed': 'CDB {p}% anual',
    'cmp.cdbModeCdi': 'Porcentaje del CDI',
    'cmp.cdbModeFixed': 'Tasa fija anual',
    'cmp.ofCdi': 'del CDI',
    'cmp.perYear': 'anual',
    'cmp.metric': 'Métrica',
    'cmp.m.both': 'Invertido vs valor de mercado',
    'cmp.m.value': 'Valor de mercado',
    'cmp.m.cost': 'Importe invertido',
    'cmp.m.profit': 'Resultado en dinero',
    'cmp.m.retInv': 'Rentabilidad sobre lo invertido (%)',
    'cmp.m.price': 'Variación en el período (%)',
    'cmp.currency': 'Moneda',
    'cmp.baseCur': 'Moneda base ({c})',
    'cmp.style': 'Estilo',
    'cmp.lines': 'Líneas',
    'cmp.area': 'Área',
    'cmp.markers': 'Marcar aportes y rescates',
    'cmp.p.1m': '1M',
    'cmp.p.3m': '3M',
    'cmp.p.6m': '6M',
    'cmp.p.ytd': 'En el año',
    'cmp.p.1y': '1A',
    'cmp.p.3y': '3A',
    'cmp.p.5y': '5A',
    'cmp.p.all': 'Desde el 1er aporte',
    'cmp.p.custom': 'Personalizado',
    'cmp.pickOne': 'Elige al menos un activo o índice arriba.',
    'cmp.noData': 'Sin datos suficientes para este período. Prueba un período mayor u otra métrica.',
    'cmp.maxReached': 'Máximo de {n} activos por comparación.',
    'cmp.sameMoney': '(mismo dinero)',
    'cmp.watchOnlyPrice': '{a} está solo en la watchlist y aparece únicamente en "Variación en el período".',
    'cmp.benchNeedsFlows': 'Los índices en dinero necesitan aportes registrados.',
    'cmp.costNoBench': 'En "Importe invertido" los índices no aparecen: lo invertido sería igual.',
    'cmp.benchCombined': 'Los índices reciben los aportes sumados de los activos seleccionados.',
    'cmp.cdiFail': 'CDI del Banco Central no disponible; se usa la tasa fija configurada.',
    'cmp.benchFail': '{b} no disponible:',
    'cmp.series': 'Serie',
    'cmp.start': 'Inicio',
    'cmp.end': 'Actual',
    'cmp.change': 'Variación',
    'cmp.max': 'Máximo',
    'cmp.min': 'Mínimo',
    'cmp.benchFlows': 'Aportes usados en los índices',
    'cmp.flowsSum': 'Suma de los seleccionados'
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
        billKind: 'all', billStatus: 'open', billFrom: '', billTo: '', tab: 'dashboard', lastSub: {} }
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
  settings.forEach((s) => { if (!String(s.key).startsWith(HIST_PREFIX)) state.settings[s.key] = s.value; });
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
  let lucro = valor - st.cost;
  if (Math.abs(lucro) < 0.005) lucro = 0; // evita "-0,00" por arredondamento
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
  renderSubTabs();
  renderThemeOptions();
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
    ['portfólio', renderPortfolio], ['gráfico', renderNAV], ['fluxo', renderCashflow], ['títulos', renderBills], ['investimentos', renderInvestments], ['notícias', () => { if (state.ui.tab === 'news') renderNews(); }], ['configurações', renderSettings]
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

/* ================= FASE 8 — Mercado: busca por ISIN/ticker, cotações, gráficos e watchlist =================
   Três fontes, cada uma no que faz melhor:
   - Finnhub: descobre o ativo pelo ISIN e cota ações americanas.
   - Twelve Data: histórico diário (gráfico) e reserva de cotação.
   - brapi.dev: B3 (ações, FIIs, ETFs, BDRs).
   Criptos continuam na AwesomeAPI.
   As chaves ficam SÓ neste navegador (settings do IndexedDB). Nunca vão para o
   código — o repositório é público — e ficam fora do backup JSON. */

const API_KEYS = ['apiFinnhub', 'apiTwelve', 'apiBrapi', 'apiRss2json'];
const HIST_PREFIX = 'hist:';

function apiKey(nome) { return (state.settings[nome] || '').trim(); }

function isISIN(s) { return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(s); }
function isB3Ticker(s) { return /^[A-Z]{4}\d{1,2}F?$/.test(s); }

function marketOf(item) {
  if (item.assetType === 'crypto') return 'crypto';
  if (item.market) return item.market;
  return isB3Ticker(item.ticker || '') ? 'b3' : 'us';
}

// Erro com mensagem legível — o HTTP cru não diz nada ao usuário.
async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  let corpo = null;
  try { corpo = await res.json(); } catch (e) { /* resposta sem JSON */ }
  if (!res.ok) {
    const msg = (corpo && (corpo.message || corpo.error)) || ('HTTP ' + res.status);
    const err = new Error(msg); err.status = res.status; throw err;
  }
  // A Twelve Data responde 200 com status "error" no corpo
  if (corpo && corpo.status === 'error') {
    const err = new Error(corpo.message || 'erro'); err.status = corpo.code; throw err;
  }
  return corpo;
}

function brapiUrl(caminho, extra) {
  const tk = apiKey('apiBrapi');
  const qs = new URLSearchParams(extra || {});
  if (tk) qs.set('token', tk);
  const q = qs.toString();
  return `https://brapi.dev/api/${caminho}${q ? '?' + q : ''}`;
}
// A brapi já respondeu nos dois formatos: campos soltos ou dentro de "data".
function brapiResult(d) {
  const r = d && d.results && d.results[0];
  return r ? (r.data && typeof r.data === 'object' ? { ...r, ...r.data } : r) : null;
}

/* ----- ISIN → ticker ----- */
async function isinToTicker(isin) {
  const key = apiKey('apiFinnhub');
  if (!key) throw new Error(t('mkt.needFinnhub'));
  const d = await getJSON(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(isin)}&token=${key}`);
  const lista = (d && d.result) || [];
  if (!lista.length) throw new Error(t('mkt.notFound'));
  // Papel brasileiro: a Finnhub devolve PETR4.SA — a cotação vem da brapi, sem o sufixo.
  if (isin.startsWith('BR')) {
    const sa = lista.find((r) => /\.SA$/.test(r.symbol));
    if (sa) return { ticker: sa.symbol.replace(/\.SA$/, ''), name: sa.description, market: 'b3', type: sa.type };
  }
  // Demais: a listagem principal é a que não tem sufixo de bolsa.
  const principal = lista.find((r) => !r.symbol.includes('.')) || lista[0];
  return { ticker: principal.symbol, name: principal.description, market: principal.symbol.includes('.') ? 'intl' : 'us', type: principal.type };
}

/* ----- Cotação atual ----- */
async function quoteUS(ticker) {
  const fk = apiKey('apiFinnhub');
  if (fk) {
    try {
      const q = await getJSON(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${fk}`);
      // Símbolo desconhecido volta com tudo zerado, não com erro
      if (q && Number(q.c) > 0) return { price: Number(q.c), changePct: Number(q.dp) || 0, source: 'Finnhub' };
    } catch (e) { console.warn('Finnhub quote', ticker, e.message); }
  }
  const tk = apiKey('apiTwelve');
  if (tk) {
    const q = await getJSON(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(ticker)}&apikey=${tk}`);
    const preco = Number(q.close);
    if (preco > 0) return { price: preco, changePct: Number(q.percent_change) || 0, currency: q.currency, name: q.name, exchange: q.exchange, source: 'Twelve Data' };
  }
  throw new Error(fk || tk ? t('mkt.noQuote') : t('mkt.needFinnhub'));
}

async function quoteB3(ticker) {
  const r = brapiResult(await getJSON(brapiUrl('quote/' + encodeURIComponent(ticker))));
  const preco = r && Number(r.regularMarketPrice);
  if (!preco) throw new Error(t('mkt.noQuote'));
  return {
    price: preco, changePct: Number(r.regularMarketChangePercent) || 0,
    currency: r.currency || 'BRL', name: r.longName || r.shortName, exchange: 'B3', source: 'brapi.dev'
  };
}

async function quoteCrypto(ticker, moeda) {
  const par = `${ticker}-${moeda || 'BRL'}`;
  const d = await getJSON(`https://economia.awesomeapi.com.br/json/last/${encodeURIComponent(par)}`);
  const chave = d && Object.keys(d)[0];
  const preco = chave && Number(d[chave].bid);
  if (!preco) throw new Error(t('mkt.noQuote'));
  return { price: preco, changePct: Number(d[chave].pctChange) || 0, currency: moeda || 'BRL', name: d[chave].name, source: 'AwesomeAPI' };
}

// Cotação de um item já conhecido (posição ou watchlist).
async function fetchPrice(item) {
  const tk = (item.ticker || '').toUpperCase();
  if (!tk) throw new Error(t('mkt.noTicker'));
  const mk = marketOf(item);
  if (mk === 'crypto') return quoteCrypto(tk, item.currency);
  if (mk === 'b3') return quoteB3(tk);
  return quoteUS(tk);
}

// Compatibilidade com o código antigo: devolve só o preço ou null.
async function fetchQuoteFor(ticker, item) {
  try { return (await fetchPrice(item || { ticker })).price; }
  catch (e) { console.warn('Cotação indisponível —', ticker, e.message); return null; }
}

/* ----- Descobrir um ativo a partir do que o usuário digitou ----- */
async function resolveAsset(entrada) {
  let q = String(entrada || '').trim().toUpperCase();
  if (!q) throw new Error(t('mkt.noTicker'));
  let info = { isin: '', ticker: q, name: '', market: '', type: '' };

  if (isISIN(q)) {
    const r = await isinToTicker(q);
    info = { isin: q, ticker: r.ticker, name: r.name, market: r.market, type: r.type };
  } else if (/\.SA$/.test(q)) {
    info.ticker = q.replace(/\.SA$/, ''); info.market = 'b3';
  } else {
    info.market = isB3Ticker(q) ? 'b3' : 'us';
  }

  let cot;
  if (info.market === 'b3') {
    cot = await quoteB3(info.ticker);
  } else {
    cot = await quoteUS(info.ticker);
    // Nome, moeda e bolsa pelo perfil da Finnhub (a cotação não traz)
    const fk = apiKey('apiFinnhub');
    if (fk && (!cot.currency || !cot.exchange)) {
      try {
        const p = await getJSON(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(info.ticker)}&token=${fk}`);
        if (p && p.ticker) { cot.currency = cot.currency || p.currency; cot.exchange = cot.exchange || p.exchange; cot.name = p.name || cot.name; }
      } catch (e) { console.warn('Perfil Finnhub', e.message); }
    }
  }

  let tipo = 'stock';
  if (/ETP|ETF/i.test(info.type || '')) tipo = 'etf';
  if (info.market === 'b3' && /34$|35$|39$/.test(info.ticker)) tipo = 'bdr';
  if (info.market === 'b3' && /11$/.test(info.ticker)) tipo = 'fii';

  return {
    isin: info.isin, ticker: info.ticker, market: info.market === 'intl' ? 'us' : info.market,
    name: cot.name || info.name || info.ticker, currency: (cot.currency || (info.market === 'b3' ? 'BRL' : 'USD')).toUpperCase(),
    exchange: cot.exchange || '', price: cot.price, changePct: cot.changePct, source: cot.source, assetType: tipo
  };
}

/* ----- Histórico diário (cache de um dia no IndexedDB) ----- */
function getSetting(key) {
  return new Promise((resolve) => {
    if (!db || !db.objectStoreNames.contains('settings')) { resolve(null); return; }
    const req = tx('settings', 'readonly').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => resolve(null);
  });
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHistory(item, aoEsperar) {
  const tk = (item.ticker || '').toUpperCase();
  const mk = marketOf(item);
  if (!tk || mk === 'crypto') return [];
  const chave = HIST_PREFIX + mk + ':' + tk;
  const cache = await getSetting(chave);
  if (cache && cache.fetchedAt === todayISO() && cache.points && cache.points.length) return cache.points;

  let pontos = [];
  if (mk === 'b3') {
    // O plano gratuito da brapi limita o período; tenta do maior para o menor.
    for (const range of ['5y', '1y', '3mo']) {
      try {
        const r = brapiResult(await getJSON(brapiUrl('quote/' + encodeURIComponent(tk), { range, interval: '1d' })));
        const lista = (r && r.historicalDataPrice) || [];
        pontos = lista.filter((p) => p.close != null)
          .map((p) => [new Date(p.date * 1000).toISOString().slice(0, 10), Number(p.close)]);
        if (pontos.length) break;
      } catch (e) { console.warn('Histórico brapi', range, e.message); }
    }
  } else {
    const key = apiKey('apiTwelve');
    if (!key) return cache ? cache.points : [];
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tk)}&interval=1day&outputsize=5000&apikey=${key}`;
    let d;
    try { d = await getJSON(url); }
    catch (e) {
      if (e.status === 429) {
        // Plano gratuito: 8 chamadas por minuto
        if (aoEsperar) aoEsperar();
        await esperar(61000);
        d = await getJSON(url);
      } else throw e;
    }
    pontos = ((d && d.values) || []).map((v) => [v.datetime.slice(0, 10), Number(v.close)]);
  }
  pontos.sort((a, b) => a[0].localeCompare(b[0]));
  if (pontos.length) await put('settings', { key: chave, value: { fetchedAt: todayISO(), points: pontos } });
  return pontos.length ? pontos : (cache ? cache.points : []);
}

// Último fechamento até a data (busca binária — o histórico pode ter milhares de dias).
function closeAt(pontos, data) {
  let lo = 0, hi = pontos.length - 1, achado = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (pontos[mid][0] <= data) { achado = pontos[mid][1]; lo = mid + 1; } else hi = mid - 1;
  }
  return achado;
}

async function upsertQuote(positionId, date, value) {
  const existente = state.quotes.find((q) => q.positionId === positionId && q.date === date);
  const registro = { id: existente ? existente.id : uid(), positionId, date, value };
  if (existente) state.quotes = state.quotes.map((q) => (q.id === registro.id ? registro : q));
  else state.quotes.push(registro);
  await put('quotes', registro);
}

function fmtQty(n) { return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 8 }); }
function fmtPct(n) { if (Math.abs(n) < 0.005) n = 0; return (n > 0 ? '+' : '') + Number(n).toFixed(2).replace('.', ',') + '%'; }

/* ----- Formulário de compra/venda com cálculo automático -----
   Modo "valor": informa o dinheiro, o app calcula a quantidade pela cotação.
   Modo "qtd":   informa quantidade e total pago, o app calcula o preço unitário. */
const buyCtx = {}; // prefixo → { item, price, priceDate }

function buyFormHtml(p, currency, tipoMov) {
  const venda = tipoMov === 'sell';
  return `
    <label>${t('mkt.date')}</label>
    <input id="${p}Date" type="date" value="${todayISO()}" onchange="refreshRefPrice('${p}')">
    <label>${t('mkt.mode')}</label>
    <select id="${p}Mode" onchange="updateBuyPreview('${p}')">
      <option value="amount">${t(venda ? 'mkt.modeAmountSell' : 'mkt.modeAmount')}</option>
      <option value="qty">${t(venda ? 'mkt.modeQtySell' : 'mkt.modeQty')}</option>
    </select>
    <div id="${p}AmountWrap">
      <label>${t(venda ? 'mkt.amountSell' : 'mkt.amount')} (<span class="cur-code">${currency}</span>)</label>
      <input id="${p}Amount" type="text" inputmode="decimal" oninput="updateBuyPreview('${p}')">
      <label class="checkline"><input type="checkbox" id="${p}Whole" checked onchange="updateBuyPreview('${p}')"> ${t('mkt.whole')}</label>
    </div>
    <div id="${p}QtyWrap" class="hidden">
      <label>${t('inv.moveQty')}</label>
      <input id="${p}Qty" type="text" inputmode="decimal" oninput="updateBuyPreview('${p}')">
      <label>${t(venda ? 'mkt.totalSell' : 'mkt.total')} (<span class="cur-code">${currency}</span>)</label>
      <input id="${p}Total" type="text" inputmode="decimal" oninput="updateBuyPreview('${p}')">
    </div>
    <div id="${p}Preview" class="buy-preview"></div>`;
}

function buyCurrency(p) {
  const sel = document.getElementById('poCurrency');
  if (p === 'po' && sel) return sel.value;
  const ctx = buyCtx[p];
  return (ctx && ctx.item && ctx.item.currency) || state.settings.baseCurrency;
}

// Cotação de referência: fechamento do dia da compra, ou a atual se for hoje.
async function refreshRefPrice(p) {
  const ctx = buyCtx[p];
  if (!ctx || !ctx.item || !ctx.item.ticker) { updateBuyPreview(p); return; }
  const data = (document.getElementById(p + 'Date') || {}).value || todayISO();
  const prev = document.getElementById(p + 'Preview');
  if (data >= todayISO()) {
    if (ctx.livePrice) { ctx.price = ctx.livePrice; ctx.priceDate = todayISO(); }
    updateBuyPreview(p); return;
  }
  if (prev) prev.innerHTML = `<span class="hint">${t('mkt.loadingHist')}</span>`;
  try {
    const pts = await fetchHistory(ctx.item);
    const c = closeAt(pts, data);
    if (c) { ctx.price = c; ctx.priceDate = data; }
    else { ctx.price = ctx.livePrice || null; ctx.priceDate = todayISO(); }
  } catch (e) {
    console.warn('Histórico indisponível', e.message);
    ctx.price = ctx.livePrice || null; ctx.priceDate = todayISO();
  }
  updateBuyPreview(p);
}

function readBuyForm(p) {
  const ctx = buyCtx[p] || {};
  const modo = document.getElementById(p + 'Mode').value;
  const data = document.getElementById(p + 'Date').value;
  const preco = ctx.price || null;
  const r = { date: data, mode: modo, price: preco, priceDate: ctx.priceDate, qty: null, amount: null, unit: null, leftover: 0, error: '' };
  if (modo === 'amount') {
    const valor = parseMoney(document.getElementById(p + 'Amount').value);
    if (valor == null || valor <= 0) { r.error = 'empty'; return r; }
    if (!preco) { r.error = t('mkt.needPrice'); return r; }
    const inteiras = document.getElementById(p + 'Whole').checked;
    let qtd = valor / preco;
    if (inteiras) qtd = Math.floor(qtd + 1e-9);
    else qtd = Math.round(qtd * 1e8) / 1e8;
    if (qtd <= 0) { r.error = t('mkt.notEnough'); return r; }
    r.qty = qtd;
    r.amount = inteiras ? Math.round(qtd * preco * 100) / 100 : valor;
    r.leftover = inteiras ? valor - r.amount : 0;
    r.unit = r.amount / qtd;
  } else {
    const qtd = parseMoney(document.getElementById(p + 'Qty').value);
    const total = parseMoney(document.getElementById(p + 'Total').value);
    if (qtd == null || qtd <= 0 || total == null || total <= 0) { r.error = 'empty'; return r; }
    r.qty = qtd; r.amount = total; r.unit = total / qtd;
  }
  return r;
}

function updateBuyPreview(p) {
  const modoEl = document.getElementById(p + 'Mode');
  if (!modoEl) return;
  const modo = modoEl.value;
  document.getElementById(p + 'AmountWrap').classList.toggle('hidden', modo !== 'amount');
  document.getElementById(p + 'QtyWrap').classList.toggle('hidden', modo !== 'qty');
  document.querySelectorAll('.cur-code').forEach((el) => { el.textContent = buyCurrency(p); });

  const prev = document.getElementById(p + 'Preview');
  if (!prev) return;
  const cur = buyCurrency(p);
  const ctx = buyCtx[p] || {};
  const r = readBuyForm(p);
  const linhaPreco = r.price
    ? `<div>${t(r.priceDate === todayISO() ? 'mkt.priceToday' : 'mkt.priceOn').replace('{data}', r.priceDate || '')}: <strong>${fmtMoney(r.price, cur)}</strong></div>`
    : (ctx.item && ctx.item.ticker ? `<div class="hint">${t('mkt.noPriceYet')}</div>` : '');

  if (r.error && r.error !== 'empty') { prev.innerHTML = linhaPreco + `<div class="amount-out">${r.error}</div>`; return; }
  if (r.error) { prev.innerHTML = linhaPreco; return; }

  let html = linhaPreco;
  if (r.mode === 'amount') {
    html += `<div>${t('mkt.youGet')}: <strong>${fmtQty(r.qty)}</strong></div>`;
    if (r.leftover > 0.004) html += `<div>${t('mkt.leftover')}: ${fmtMoney(r.leftover, cur)}</div>`;
  } else {
    html += `<div>${t('mkt.unitPaid')}: <strong>${fmtMoney(r.unit, cur)}</strong></div>`;
    if (r.price) {
      const dif = (r.unit / r.price - 1) * 100;
      html += `<div class="${dif > 0.05 ? 'amount-out' : dif < -0.05 ? 'amount-in' : 'amount-neutral'}">${t('mkt.vsMarket')}: ${fmtPct(dif)}</div>`;
    }
  }
  prev.innerHTML = html;
}

/* ----- Busca do ativo no modal de posição ----- */
async function lookupAsset(prefill) {
  const entrada = document.getElementById('poLookup');
  const info = document.getElementById('poLookupInfo');
  const btn = document.getElementById('poLookupBtn');
  const q = prefill || (entrada ? entrada.value : '');
  if (!q.trim()) { showToast(t('mkt.noTicker')); return; }
  if (btn) { btn.disabled = true; btn.textContent = t('mkt.searching'); }
  info.classList.remove('hidden');
  info.innerHTML = `<span class="hint">${t('mkt.searching')}</span>`;
  try {
    const a = await resolveAsset(q);
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null && v !== '') el.value = v; };
    set('poName', a.name);
    set('poTicker', a.ticker);
    set('poIsin', a.isin);
    set('poKind', 'quote');
    set('poClass', 'variable');
    set('poType', a.assetType);
    const suportada = CURRENCIES.some((c) => c.code === a.currency);
    if (suportada) set('poCurrency', a.currency);
    buyCtx.po = { item: { ticker: a.ticker, market: a.market, currency: a.currency, assetType: a.assetType }, price: a.price, livePrice: a.price, priceDate: todayISO(), meta: a };
    info.innerHTML = `
      <div class="lookup-name">${escapeHtml(a.name)} <span class="tag">${escapeHtml(a.ticker)}</span></div>
      <div>${a.exchange ? escapeHtml(a.exchange) + ' — ' : ''}<strong>${fmtMoney(a.price, a.currency)}</strong>
        <span class="${a.changePct >= 0 ? 'amount-in' : 'amount-out'}">${fmtPct(a.changePct)}</span></div>
      <div class="hint">${t('mkt.source')}: ${a.source}</div>
      ${suportada ? '' : `<div class="amount-out">${t('mkt.currencyUnsupported').replace('{code}', a.currency)}</div>`}`;
    onPositionAccountChange();
    unlockPositionForm(false);
    await refreshRefPrice('po');
  } catch (e) {
    info.innerHTML = `<span class="amount-out">${escapeHtml(e.message || String(e))}</span>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t('mkt.search'); }
  }
}

// Libera o formulário depois da busca, ou a pedido para posições sem ticker (renda fixa, CDB)
function unlockPositionForm(manual) {
  const rest = document.getElementById('poRest');
  if (!rest) return;
  rest.disabled = false;
  rest.classList.remove('locked');
  const btn = document.getElementById('poManualBtn');
  if (btn) btn.classList.add('hidden');
  if (manual) {
    const nome = document.getElementById('poName');
    if (nome) nome.focus();
  }
}

/* ----- Links externos e TradingView ----- */
function externalLinks(item) {
  const tk = (item.ticker || '').toUpperCase();
  const mk = marketOf(item);
  const baixo = tk.toLowerCase();
  const investing = `https://${state.settings.lang === 'pt-BR' ? 'br' : state.settings.lang === 'es' ? 'es' : 'www'}.investing.com/search/?q=${encodeURIComponent(tk)}`;
  const yahoo = `https://finance.yahoo.com/quote/${encodeURIComponent(mk === 'b3' ? tk + '.SA' : mk === 'crypto' ? tk + '-' + (item.currency || 'USD') : tk)}`;
  let i10 = null;
  if (mk === 'b3') {
    const pasta = { fii: 'fiis', etf: 'etfs', bdr: 'bdrs' }[item.assetType] || 'acoes';
    i10 = `https://investidor10.com.br/${pasta}/${baixo}/`;
  } else if (mk === 'us') {
    i10 = `https://investidor10.com.br/stocks/${baixo}/`;
  }
  return `<div class="ext-links">
    <a href="${investing}" target="_blank" rel="noopener">Investing.com</a>
    <a href="${yahoo}" target="_blank" rel="noopener">Yahoo Finance</a>
    ${i10 ? `<a href="${i10}" target="_blank" rel="noopener">Investidor10</a>` : ''}
  </div>`;
}

function tradingViewSymbol(item) {
  const tk = (item.ticker || '').toUpperCase();
  const mk = marketOf(item);
  if (mk === 'b3') return 'BMFBOVESPA:' + tk;
  if (mk === 'crypto') return 'BINANCE:' + tk + (item.currency === 'BRL' ? 'BRL' : item.currency === 'EUR' ? 'EUR' : 'USDT');
  const bolsa = String(item.exchange || '').toUpperCase();
  if (bolsa.includes('NASDAQ')) return 'NASDAQ:' + tk;
  if (bolsa.includes('NEW YORK') || bolsa.includes('NYSE')) return 'NYSE:' + tk;
  return tk;
}

function mountTradingView(containerId, item) {
  const box = document.getElementById(containerId);
  if (!box || !item.ticker) return;
  box.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
  box.classList.add('tradingview-widget-container');
  const s = document.createElement('script');
  s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  s.async = true;
  s.text = JSON.stringify({
    autosize: true, symbol: tradingViewSymbol(item), interval: 'D', timezone: 'Etc/UTC',
    theme: state.settings.theme === 'dark' ? 'dark' : 'light', style: '1',
    locale: state.settings.lang === 'pt-BR' ? 'br' : state.settings.lang,
    allow_symbol_change: true, calendar: false, support_host: 'https://www.tradingview.com'
  });
  box.appendChild(s);
}

/* ----- Gráfico "investido x mercado" ----- */
function fmtCompact(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' mi';
  if (a >= 1e4) return (v / 1e3).toFixed(1).replace('.', ',') + ' mil';
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

// Série diária: datas de pregão do histórico + datas de movimentos + hoje.
function buildPositionSeries(pos, hist) {
  const movs = invMovesOf(pos.id);
  if (!movs.length) return [];
  const inicio = movs[0].date;
  const hoje = todayISO();
  const datas = new Set([hoje]);
  hist.forEach(([d]) => { if (d >= inicio && d <= hoje) datas.add(d); });
  movs.forEach((m) => datas.add(m.date));
  quotesOf(pos.id).forEach((q) => { if (q.date >= inicio) datas.add(q.date); });
  return [...datas].sort().map((d) => {
    const st = positionStateAt(pos, d);
    let valor;
    if (pos.kind === 'quote') {
      // Cotação digitada no dia prevalece; senão o fechamento do histórico
      const manual = quotesOf(pos.id).find((q) => q.date === d);
      const preco = manual ? Number(manual.value) : (closeAt(hist, d) || (positionQuoteAt(pos, d) || {}).value);
      valor = preco ? st.quantity * preco : st.cost;
    } else {
      valor = positionValue(pos, d);
    }
    return { date: d, cost: st.cost, value: valor };
  });
}

function drawPLChart(boxId, tipId, pontos, cur) {
  const box = document.getElementById(boxId);
  const tip = document.getElementById(tipId);
  if (!box) return;
  if (pontos.length < 2) { box.innerHTML = `<p class="empty-state">${t('mkt.chartEmpty')}</p>`; return; }
  const W = 720, H = 300, padL = 64, padR = 16, padT = 16, padB = 34;
  let min = Infinity, max = -Infinity;
  pontos.forEach((p) => { min = Math.min(min, p.cost, p.value); max = Math.max(max, p.cost, p.value); });
  if (min === max) max = min + 1;
  const faixa = max - min; min = Math.max(0, min - faixa * 0.08); max += faixa * 0.08;
  const X = (i) => padL + (i / (pontos.length - 1)) * (W - padL - padR);
  const Y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const pos = getComputedStyle(document.documentElement).getPropertyValue('--positive').trim() || '#15803d';
  const neg = getComputedStyle(document.documentElement).getPropertyValue('--negative').trim() || '#b91c1c';

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('mkt.chartTitle')}">`;
  for (let g = 0; g <= 4; g++) {
    const v = min + ((max - min) * g) / 4;
    svg += `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--border)" stroke-width="1"/>
      <text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtCompact(v)}</text>`;
  }
  // Área entre as linhas: verde onde o mercado está acima do investido
  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i], b = pontos[i + 1];
    const cor = (a.value - a.cost + b.value - b.cost) >= 0 ? pos : neg;
    svg += `<polygon points="${X(i)},${Y(a.value)} ${X(i + 1)},${Y(b.value)} ${X(i + 1)},${Y(b.cost)} ${X(i)},${Y(a.cost)}" fill="${cor}" fill-opacity="0.16"/>`;
  }
  const linha = (k) => pontos.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p[k]).toFixed(1)}`).join(' ');
  const ultimo = pontos[pontos.length - 1];
  const corValor = ultimo.value >= ultimo.cost ? pos : neg;
  svg += `<path d="${linha('cost')}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="6 4"/>`;
  svg += `<path d="${linha('value')}" fill="none" stroke="${corValor}" stroke-width="2.2"/>`;
  const passos = Math.min(6, pontos.length);
  for (let k = 0; k < passos; k++) {
    const i = Math.round((k * (pontos.length - 1)) / (passos - 1 || 1));
    const ancora = k === 0 ? 'start' : k === passos - 1 ? 'end' : 'middle';
    svg += `<text x="${X(i)}" y="${H - 10}" text-anchor="${ancora}" font-size="11" fill="var(--muted)">${pontos[i].date.slice(2).split('-').reverse().join('/')}</text>`;
  }
  svg += `<line id="${boxId}Cursor" x1="0" x2="0" y1="${padT}" y2="${H - padB}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/>`;
  svg += `<rect x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}" fill="transparent" id="${boxId}Hit"/>`;
  svg += '</svg>';
  box.innerHTML = svg;

  const hit = document.getElementById(boxId + 'Hit');
  const cursor = document.getElementById(boxId + 'Cursor');
  const svgEl = box.querySelector('svg');
  const mover = (ev) => {
    const r = svgEl.getBoundingClientRect();
    const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (W / r.width);
    const i = Math.max(0, Math.min(pontos.length - 1, Math.round(((px - padL) / (W - padL - padR)) * (pontos.length - 1))));
    const p = pontos[i];
    cursor.setAttribute('x1', X(i)); cursor.setAttribute('x2', X(i)); cursor.setAttribute('visibility', 'visible');
    const lucro = p.value - p.cost;
    tip.innerHTML = `${p.date}<br>${t('mkt.invested')}: ${fmtMoney(p.cost, cur)}<br>${t('mkt.market')}: <strong>${fmtMoney(p.value, cur)}</strong><br>
      ${t('mkt.result')}: ${fmtMoney(lucro, cur)}${p.cost > 0 ? ' (' + fmtPct((lucro / p.cost) * 100) + ')' : ''}`;
    tip.classList.remove('hidden');
    const bx = box.getBoundingClientRect();
    let left = (X(i) / W) * r.width + (r.left - bx.left) + 12;
    if (left + tip.offsetWidth > bx.width) left -= tip.offsetWidth + 24;
    tip.style.left = left + 'px';
    tip.style.top = '8px';
  };
  const sair = () => { tip.classList.add('hidden'); cursor.setAttribute('visibility', 'hidden'); };
  hit.addEventListener('mousemove', mover);
  hit.addEventListener('touchmove', mover, { passive: true });
  hit.addEventListener('mouseleave', sair);
}

function periodCut(pontos, periodo) {
  if (periodo === 'all' || !pontos.length) return pontos;
  const meses = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[periodo];
  const d = new Date(); d.setMonth(d.getMonth() - meses);
  const corte = d.toISOString().slice(0, 10);
  const r = pontos.filter((p) => p.date >= corte);
  return r.length >= 2 ? r : pontos.slice(-2);
}

function periodButtons(onclickFn) {
  return `<div class="nav-toggle chart-periods">${['1m', '3m', '6m', '1y', 'all'].map((k) =>
    `<button data-period="${k}" class="${k === 'all' ? 'active' : ''}" onclick="${onclickFn}('${k}', this)">${t('mkt.p.' + k)}</button>`).join('')}</div>`;
}

let chartState = { pontos: [], cur: 'EUR' };
function setChartPeriod(k, btn) {
  btn.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
  drawPLChart('plChart', 'plTip', periodCut(chartState.pontos, k), chartState.cur);
}

function summaryHtml(custo, valor, cur, extra) {
  const lucro = valor - custo;
  const cls = lucro > 0.004 ? 'amount-in' : lucro < -0.004 ? 'amount-out' : 'amount-neutral';
  return `<div class="pl-summary">
    <div><span>${t('mkt.invested')}</span><strong>${fmtMoney(custo, cur)}</strong></div>
    <div><span>${t('mkt.market')}</span><strong>${fmtMoney(valor, cur)}</strong></div>
    <div><span>${t('mkt.result')}</span><strong class="${cls}">${fmtMoney(lucro, cur)}${custo > 0 ? ' · ' + fmtPct((lucro / custo) * 100) : ''}</strong></div>
    ${extra || ''}
  </div>`;
}

async function openPositionChart(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const r = positionReturn(pos, todayISO());
  const st = positionStateAt(pos, todayISO());
  const cot = positionQuoteAt(pos, todayISO());
  const extra = pos.kind === 'quote' && st.quantity > 0
    ? `<div><span>${t('mkt.avgPrice')}</span><strong>${fmtMoney(st.cost / st.quantity, pos.currency)}</strong></div>
       <div><span>${t('mkt.lastPrice')}</span><strong>${cot ? fmtMoney(cot.value, pos.currency) : '—'}</strong></div>` : '';
  openModal(`
    <h2>${escapeHtml(pos.name)} ${pos.ticker ? `<span class="tag">${escapeHtml(pos.ticker)}</span>` : ''}</h2>
    ${summaryHtml(r.cost, r.value, pos.currency, extra)}
    <div class="nav-head"><h3>${t('mkt.chartTitle')}</h3>${periodButtons('setChartPeriod')}</div>
    <div class="chart-legend"><span class="lg-cost"></span>${t('mkt.invested')} <span class="lg-value"></span>${t('mkt.market')}</div>
    <div class="nav-chart pl-chart"><div id="plChart"><p class="hint">${t('mkt.loadingHist')}</p></div><div id="plTip" class="nav-tip hidden"></div></div>
    <p id="plNote" class="hint"></p>
    ${pos.ticker ? `<h3 class="section-sub">${t('mkt.marketChart')}</h3><div id="tvChart" class="tv-box"></div>${externalLinks(pos)}` : ''}
  `, true);
  if (pos.ticker && pos.kind === 'quote') mountTradingView('tvChart', pos);

  let hist = [];
  const nota = document.getElementById('plNote');
  if (pos.ticker && pos.kind === 'quote') {
    try { hist = await fetchHistory(pos, () => { if (nota) nota.textContent = t('mkt.rateWait'); }); }
    catch (e) { if (nota) nota.textContent = t('mkt.histFail') + ' ' + e.message; }
    if (!hist.length && nota && !nota.textContent) nota.textContent = t('mkt.histManual');
    else if (hist.length && nota) nota.textContent = '';
  }
  chartState = { pontos: buildPositionSeries(pos, hist), cur: pos.currency };
  drawPLChart('plChart', 'plTip', chartState.pontos, pos.currency);
}

async function openPortfolioChart() {
  const base = state.settings.baseCurrency;
  const hoje = todayISO();
  const tot = investmentTotals(hoje);
  openModal(`
    <h2>${t('mkt.portfolioChart')}</h2>
    ${summaryHtml(consolidate(tot.cost, base, hoje).total, consolidate(tot.value, base, hoje).total, base)}
    <div class="nav-head"><h3>${t('mkt.chartTitle')} (${base})</h3>${periodButtons('setChartPeriod')}</div>
    <div class="chart-legend"><span class="lg-cost"></span>${t('mkt.invested')} <span class="lg-value"></span>${t('mkt.market')}</div>
    <div class="nav-chart pl-chart"><div id="plChart"><p class="hint">${t('mkt.loadingHist')}</p></div><div id="plTip" class="nav-tip hidden"></div></div>
    <p id="plNote" class="hint"></p>
  `, true);
  const nota = document.getElementById('plNote');
  const series = [];
  const ativos = state.positions.filter((p) => invMovesOf(p.id).length);
  let n = 0;
  for (const pos of ativos) {
    n++;
    if (nota) nota.textContent = t('mkt.loadingN').replace('{n}', n).replace('{total}', ativos.length);
    let hist = [];
    if (pos.ticker && pos.kind === 'quote') {
      try { hist = await fetchHistory(pos, () => { if (nota) nota.textContent = t('mkt.rateWait'); }); }
      catch (e) { console.warn('Histórico', pos.ticker, e.message); }
    }
    series.push({ pos, pontos: buildPositionSeries(pos, hist) });
  }
  // Soma na moeda base, carregando o último valor de cada posição entre datas
  const datas = [...new Set(series.flatMap((s) => s.pontos.map((p) => p.date)))].sort();
  const pontos = datas.map((d) => {
    let custo = 0, valor = 0;
    series.forEach(({ pos, pontos: ps }) => {
      let ult = null;
      for (const p of ps) { if (p.date <= d) ult = p; else break; }
      if (!ult) return;
      custo += toBase(ult.cost, pos.currency, d);
      valor += toBase(ult.value, pos.currency, d);
    });
    return { date: d, cost: custo, value: valor };
  });
  if (nota) nota.textContent = '';
  chartState = { pontos, cur: base };
  drawPLChart('plChart', 'plTip', pontos, base);
}

/* ----- Watchlist ----- */
function watchlist() { return Array.isArray(state.settings.watchlist) ? state.settings.watchlist : []; }
async function saveWatchlist(lista) {
  state.settings.watchlist = lista;
  await put('settings', { key: 'watchlist', value: lista });
}

async function addToWatchlist() {
  const el = document.getElementById('watchInput');
  const btn = document.getElementById('btnWatchAdd');
  const q = el ? el.value.trim() : '';
  if (!q) { showToast(t('mkt.noTicker')); return; }
  if (btn) btn.disabled = true;
  try {
    const a = await resolveAsset(q);
    if (watchlist().some((w) => w.ticker === a.ticker)) { showToast(t('mkt.alreadyWatch')); return; }
    await saveWatchlist([...watchlist(), {
      ticker: a.ticker, isin: a.isin, name: a.name, currency: a.currency, exchange: a.exchange,
      market: a.market, assetType: a.assetType, price: a.price, changePct: a.changePct, updatedAt: new Date().toISOString()
    }]);
    el.value = '';
    renderWatchlist();
    showToast(t('toast.saved'));
  } catch (e) {
    showToast(e.message || String(e));
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function refreshWatchlist(silencioso) {
  const lista = watchlist();
  let n = 0;
  for (const w of lista) {
    try {
      const c = await fetchPrice(w);
      w.price = c.price; w.changePct = c.changePct; w.updatedAt = new Date().toISOString(); n++;
    } catch (e) { console.warn('Watchlist', w.ticker, e.message); }
  }
  if (lista.length) await saveWatchlist(lista);
  renderWatchlist();
  if (!silencioso) showToast(t('inv.updateOk').replace('{n}', n));
  return n;
}

async function removeFromWatchlist(ticker) {
  if (!confirm(t('modal.delete') + '?')) return;
  await saveWatchlist(watchlist().filter((w) => w.ticker !== ticker));
  renderWatchlist();
}

function openWatchChart(ticker) {
  const w = watchlist().find((x) => x.ticker === ticker);
  if (!w) return;
  openModal(`
    <h2>${escapeHtml(w.name)} <span class="tag">${escapeHtml(w.ticker)}</span></h2>
    <p><strong>${w.price ? fmtMoney(w.price, w.currency) : '—'}</strong>
      ${w.changePct != null ? `<span class="${w.changePct >= 0 ? 'amount-in' : 'amount-out'}">${fmtPct(w.changePct)}</span>` : ''}</p>
    <div id="tvChart" class="tv-box"></div>
    ${externalLinks(w)}
  `, true);
  mountTradingView('tvChart', w);
}

function buyFromWatch(ticker) {
  const w = watchlist().find((x) => x.ticker === ticker);
  if (!w) return;
  openPositionModal(null, w.isin || w.ticker);
}

function renderWatchlist() {
  const tbody = document.querySelector('#watchTable tbody');
  const thead = document.querySelector('#watchTable thead tr');
  const vazio = document.getElementById('watchEmpty');
  if (!tbody) return;
  if (thead) thead.innerHTML = `<th>${t('mkt.asset')}</th><th>${t('mkt.exchange')}</th><th>${t('inv.price')}</th>
    <th>${t('mkt.dayChange')}</th><th>${t('mkt.updated')}</th><th>${t('accounts.actions')}</th>`;
  const lista = watchlist();
  document.getElementById('watchTable').classList.toggle('hidden', !lista.length);
  if (!lista.length) {
    tbody.innerHTML = '';
    if (vazio) { vazio.textContent = t('mkt.watchEmpty'); vazio.classList.remove('hidden'); }
    return;
  }
  if (vazio) vazio.classList.add('hidden');
  tbody.innerHTML = lista.map((w) => `<tr>
    <td>${colorDot(w.color)}${escapeHtml(w.name)} <span class="tag">${escapeHtml(w.ticker)}</span></td>
    <td>${escapeHtml(w.exchange || (w.market === 'b3' ? 'B3' : '—'))}</td>
    <td><strong>${w.price ? fmtMoney(w.price, w.currency) : '—'}</strong></td>
    <td class="${(w.changePct || 0) >= 0 ? 'amount-in' : 'amount-out'}">${w.changePct != null ? fmtPct(w.changePct) : '—'}</td>
    <td>${w.updatedAt ? new Date(w.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
    <td>
      <button class="secondary-btn" onclick="openWatchChart('${w.ticker}')">${t('mkt.chart')}</button>
      <button class="secondary-btn" onclick="buyFromWatch('${w.ticker}')">${t('mkt.buy')}</button>
      <button class="secondary-btn" onclick="removeFromWatchlist('${w.ticker}')">${t('modal.delete')}</button>
    </td>
  </tr>`).join('');
}

/* ================= FASES 9 e 10 — Cores por ativo e comparativo =================
   Até 4 séries (posições, itens da watchlist ou a carteira total) contra CDB,
   Ibovespa e S&P 500.

   Métricas em % (padrão, porque colocam R$ 1 mil e R$ 100 mil na mesma escala):
   - "ret"   Rentabilidade sobre o investido: valor ÷ custo − 1.
             O índice recebe os MESMOS aportes, nas MESMAS datas.
   - "price" Variação no período: tudo parte de 0%. Ativo usa o preço; a
             carteira usa TWR, que neutraliza o efeito dos aportes.
   Referência (só nas métricas em %): cada linha passa a mostrar quantos pontos
   percentuais está acima ou abaixo da referência escolhida. Quando a referência
   é um índice na métrica "ret", CADA ativo é comparado com o índice recebendo
   os aportes DAQUELE ativo — "ITUB4 contra o CDB com o dinheiro da ITUB4". */

const ASSET_PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#e94560', '#8b5cf6', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#0d9488', '#7c3aed', '#ca8a04'];
const CMP_MAX = 4;
const CMP_VERSION = 10;
const CMP_DEFAULT = {
  v: CMP_VERSION,
  sel: [], bench: { cdi: false, ibov: false, spx: false },
  cdbMode: 'cdi', cdbPct: 100, cdbRate: 11,
  metric: 'ret', reference: 'none', currency: 'base', period: '1y', from: '', to: '',
  style: 'line', markers: true, benchFlows: 'sum',
  colors: { total: '#0ea5e9', cdi: '#0d9488', ibov: '#ca8a04', spx: '#94a3b8' }
};
const PCT_METRICS = ['ret', 'price'];

function cmpConfig() {
  let salvo = state.settings.cmpConfig || { sel: state.positions.length ? ['total'] : [] };
  // Configurações salvas antes da Fase 10 passam a abrir em % (novo padrão)
  if (salvo.v !== CMP_VERSION) salvo = { ...salvo, v: CMP_VERSION, metric: 'ret', reference: 'none' };
  return {
    ...CMP_DEFAULT, ...salvo,
    bench: { ...CMP_DEFAULT.bench, ...(salvo.bench || {}) },
    colors: { ...CMP_DEFAULT.colors, ...(salvo.colors || {}) }
  };
}
async function saveCmpConfig(cfg) {
  state.settings.cmpConfig = cfg;
  await put('settings', { key: 'cmpConfig', value: cfg });
}

/* ----- Cores ----- */
// Atribui a primeira cor livre da paleta; depois disso a cor é do ativo.
async function ensureAssetColors() {
  const usadas = new Set(state.positions.map((p) => p.color).filter(Boolean));
  let mudou = false;
  for (const pos of state.positions) {
    if (pos.color) continue;
    const livre = ASSET_PALETTE.find((c) => !usadas.has(c)) || ASSET_PALETTE[usadas.size % ASSET_PALETTE.length];
    pos.color = livre; usadas.add(livre);
    await put('positions', pos);
    mudou = true;
  }
  const lista = watchlist();
  let mudouLista = false;
  lista.forEach((w, i) => {
    if (w.color) return;
    const pos = state.positions.find((p) => p.ticker && p.ticker === w.ticker);
    w.color = pos ? pos.color : ASSET_PALETTE[(usadas.size + i) % ASSET_PALETTE.length];
    mudouLista = true;
  });
  if (mudouLista) await saveWatchlist(lista);
  return mudou || mudouLista;
}
function nextFreeColor() {
  const usadas = new Set(state.positions.map((p) => p.color).filter(Boolean));
  return ASSET_PALETTE.find((c) => !usadas.has(c)) || ASSET_PALETTE[usadas.size % ASSET_PALETTE.length];
}
function colorDot(cor) { return `<span class="color-dot" style="background:${cor || 'var(--muted)'}"></span>`; }
function tickerColor(ticker) {
  const p = state.positions.find((x) => x.ticker === ticker);
  if (p && p.color) return p.color;
  const w = watchlist().find((x) => x.ticker === ticker);
  return w && w.color ? w.color : null;
}

async function setSeriesColor(chave, cor) {
  if (chave.startsWith('pos:')) {
    const pos = state.positions.find((p) => p.id === chave.slice(4));
    if (pos) { pos.color = cor; await put('positions', pos); }
  } else if (chave.startsWith('watch:')) {
    const lista = watchlist();
    const w = lista.find((x) => x.ticker === chave.slice(6));
    if (w) { w.color = cor; await saveWatchlist(lista); }
  } else {
    const cfg = cmpConfig();
    cfg.colors[chave] = cor;
    await saveCmpConfig(cfg);
  }
  renderInvestments();
}

/* ----- Câmbio histórico (Frankfurter), com a tabela do app como reserva ----- */
async function fetchFxHistory(desde) {
  const chave = HIST_PREFIX + 'fx:EUR';
  const cache = await getSetting(chave);
  if (cache && cache.fetchedAt === todayISO() && cache.from <= desde && cache.rates && cache.rates.length) return cache.rates;
  const moedas = CURRENCIES.map((c) => c.code).filter((c) => c !== 'EUR').join(',');
  const faixa = `${desde}..${todayISO()}`;
  // O endereço antigo (.app) passou a redirecionar; tenta o novo primeiro.
  const urls = [
    `https://api.frankfurter.dev/v1/${faixa}?base=EUR&symbols=${moedas}`,
    `https://api.frankfurter.app/${faixa}?from=EUR&to=${moedas}`
  ];
  for (const url of urls) {
    try {
      const d = await getJSON(url);
      const rates = Object.entries((d && d.rates) || {}).sort((a, b) => a[0].localeCompare(b[0]));
      if (rates.length) {
        await put('settings', { key: chave, value: { fetchedAt: todayISO(), from: desde, rates } });
        return rates;
      }
    } catch (e) { console.warn('Câmbio histórico indisponível em', url, '-', e.message); }
  }
  return cache ? cache.rates : [];
}

// Conversor rápido: listas ordenadas por moeda + busca binária.
function makeConverter(ratesHist) {
  const porMoeda = {};
  ratesHist.forEach(([data, taxas]) => {
    Object.entries(taxas).forEach(([cod, v]) => { (porMoeda[cod] = porMoeda[cod] || []).push([data, Number(v)]); });
  });
  state.fx.forEach((r) => { (porMoeda[r.currency] = porMoeda[r.currency] || []).push([r.date, Number(r.rate)]); });
  Object.values(porMoeda).forEach((l) => l.sort((a, b) => a[0].localeCompare(b[0])));
  let aproximou = false;
  const taxa = (cod, data) => {
    if (cod === 'EUR') return 1;
    const l = porMoeda[cod];
    if (!l || !l.length) return null;
    const v = closeAt(l, data);
    if (v != null) return v;
    aproximou = true;
    return l[0][1];
  };
  const conv = (valor, de, para, data) => {
    if (valor == null) return null;
    if (de === para) return valor;
    const a = taxa(de, data), b = taxa(para, data);
    return a && b ? (valor / a) * b : null;
  };
  conv.approx = () => aproximou;
  return conv;
}

/* ----- Índices de referência ----- */
function brDate(iso) { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; }
function isoFromBr(br) { const [d, m, a] = br.split('/'); return `${a}-${m}-${d}`; }
function weekdaysBetween(de, ate) {
  const out = [];
  const d = new Date(de + 'T12:00:00Z'), fim = new Date(ate + 'T12:00:00Z');
  while (d <= fim) {
    const dia = d.getUTCDay();
    if (dia !== 0 && dia !== 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

// CDI diário do Banco Central (série SGS 12). Limite da API: 10 anos por consulta.
async function fetchCDI(desde) {
  const chave = HIST_PREFIX + 'bench:cdi';
  const cache = await getSetting(chave);
  if (cache && cache.fetchedAt === todayISO() && cache.from <= desde) return cache.points;
  const dez = new Date(); dez.setFullYear(dez.getFullYear() - 10); dez.setDate(dez.getDate() + 2);
  const inicio = desde < dez.toISOString().slice(0, 10) ? dez.toISOString().slice(0, 10) : desde;
  const d = await getJSON(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json&dataInicial=${brDate(inicio)}&dataFinal=${brDate(todayISO())}`);
  const pts = (Array.isArray(d) ? d : []).map((r) => [isoFromBr(r.data), Number(r.valor)]).filter((p) => !isNaN(p[1]));
  if (pts.length) await put('settings', { key: chave, value: { fetchedAt: todayISO(), from: inicio, points: pts } });
  return pts;
}

// Série de nível (índice) do benchmark, na moeda nativa dele.
async function benchmarkLevels(key, cfg, desde, avisar) {
  if (key === 'cdi') {
    let diarias = [];
    if (cfg.cdbMode === 'cdi') {
      try { diarias = (await fetchCDI(desde)).map(([d, v]) => [d, (v / 100) * (cfg.cdbPct / 100)]); }
      catch (e) { avisar(t('cmp.cdiFail')); }
    }
    if (!diarias.length) {
      const diaria = Math.pow(1 + (Number(cfg.cdbRate) || 0) / 100, 1 / 252) - 1;
      diarias = weekdaysBetween(desde, todayISO()).map((d) => [d, diaria]);
    }
    let nivel = 1;
    const pts = [];
    diarias.forEach(([d, r]) => { pts.push([d, nivel]); nivel *= 1 + r; });
    if (pts.length) pts.push([todayISO(), nivel]);
    return { points: pts, currency: 'BRL' };
  }
  if (key === 'ibov') return { points: await fetchHistory({ ticker: '^BVSP', market: 'b3' }, avisar), currency: 'BRL' };
  if (key === 'spx') return { points: await fetchHistory({ ticker: 'SPY', market: 'us' }, () => avisar(t('mkt.rateWait'))), currency: 'USD' };
  return { points: [], currency: 'EUR' };
}

function benchLabel(key, cfg) {
  if (key === 'cdi') return cfg.cdbMode === 'cdi'
    ? t('cmp.cdbCdi').replace('{p}', cfg.cdbPct)
    : t('cmp.cdbFixed').replace('{p}', String(cfg.cdbRate).replace('.', ','));
  return t('cmp.b.' + key);
}

/* ----- Opções selecionáveis ----- */
function cmpOptions() {
  const ops = [];
  if (state.positions.length) ops.push({ key: 'total', label: t('cmp.total'), color: cmpConfig().colors.total, invest: true });
  state.positions.forEach((p) => ops.push({ key: 'pos:' + p.id, label: p.ticker || p.name, title: p.name, color: p.color, invest: true, pos: p }));
  watchlist().forEach((w) => {
    if (state.positions.some((p) => p.ticker && p.ticker === w.ticker)) return; // já aparece como posição
    ops.push({ key: 'watch:' + w.ticker, label: w.ticker, title: w.name, color: w.color, invest: false, watch: w });
  });
  return ops;
}

function periodStart(cfg, primeira) {
  const menos = (m) => { const d = new Date(); d.setMonth(d.getMonth() - m); return d.toISOString().slice(0, 10); };
  switch (cfg.period) {
    case '1m': return menos(1);
    case '3m': return menos(3);
    case '6m': return menos(6);
    case '1y': return menos(12);
    case '3y': return menos(36);
    case '5y': return menos(60);
    case 'ytd': return new Date().getFullYear() + '-01-01';
    case 'custom': return cfg.from || primeira;
    default: return primeira;
  }
}

/* ----- Motor de séries ----- */
function flowsOf(positions, D, conv) {
  const fluxos = [];
  positions.forEach((pos) => invMovesOf(pos.id).forEach((m) => {
    const v = conv(Number(m.amount) || 0, pos.currency, D, m.date);
    if (v != null) fluxos.push({ date: m.date, type: m.type, amount: v, posId: pos.id });
  }));
  return fluxos.sort((a, b) => a.date.localeCompare(b.date));
}

// Custo na moeda de exibição, convertendo cada movimento pelo câmbio da SUA data.
function costSeriesD(pos, datas, D, conv) {
  const movs = invMovesOf(pos.id);
  let i = 0, qtd = 0, custo = 0;
  return datas.map((d) => {
    while (i < movs.length && movs[i].date <= d) {
      const m = movs[i++];
      const q = Number(m.quantity) || 0;
      const v = conv(Number(m.amount) || 0, pos.currency, D, m.date) || 0;
      if (m.type === 'buy') { qtd += q; custo += v; }
      else if (pos.kind === 'quote' && qtd > 0) { const f = Math.min(q / qtd, 1); custo -= custo * f; qtd -= q; }
      else custo -= v;
    }
    return Math.max(custo, 0);
  });
}

/* Mesmo dinheiro aplicado no índice: compra "cotas" do índice em cada aporte.
   Correção da Fase 10: aporte anterior ao primeiro dado do índice (histórico
   gratuito curto) antes era DESCARTADO — o Ibovespa aparecia começando em zero.
   Agora usa o primeiro nível conhecido e sinaliza a aproximação. */
function simulateBench(levels, levelCur, fluxos, datas, D, conv, aoAproximar) {
  if (!levels.length) return datas.map(() => ({ value: null, cost: 0 }));
  const primeiro = levels[0];
  const nivelD = (d) => {
    let n = closeAt(levels, d);
    if (n == null) { n = primeiro[1]; if (aoAproximar) aoAproximar(primeiro[0]); }
    return conv(n, levelCur, D, d);
  };
  let i = 0, cotas = 0, custo = 0;
  return datas.map((d) => {
    while (i < fluxos.length && fluxos[i].date <= d) {
      const f = fluxos[i++];
      const n = nivelD(f.date);
      if (!n) continue;
      if (f.type === 'buy') { cotas += f.amount / n; custo += f.amount; }
      else if (cotas > 0) {
        const valorAtual = cotas * n;
        const fr = valorAtual > 0 ? Math.min(f.amount / valorAtual, 1) : 1;
        cotas -= cotas * fr; custo -= custo * fr;
      }
    }
    const n = nivelD(d);
    return { value: n ? cotas * n : null, cost: custo };
  });
}

// TWR: encadeia retornos diários descontando os fluxos do dia.
function twrSeries(valores, fluxosPorData, datas) {
  let acumulado = 1;
  return datas.map((d, i) => {
    if (i > 0) {
      const anterior = valores[i - 1];
      const fluxo = fluxosPorData[d] || 0;
      if (anterior > 0 && valores[i] != null) acumulado *= (valores[i] - fluxo) / anterior;
    }
    return (acumulado - 1) * 100;
  });
}

function downsample(datas, max) {
  if (datas.length <= max) return datas;
  const passo = datas.length / max;
  const out = [];
  for (let i = 0; i < max; i++) out.push(datas[Math.floor(i * passo)]);
  if (out[out.length - 1] !== datas[datas.length - 1]) out.push(datas[datas.length - 1]);
  return out;
}

const retOf = (v, c) => (c > 0 && v != null ? (v / c - 1) * 100 : null);
const normalize = (arr) => { const b = arr.find((x) => x); return arr.map((x) => (b && x ? (x / b - 1) * 100 : null)); };

let cmpToken = 0;
const cmpVisible = {};

async function renderCompare() {
  const painel = document.getElementById('tab-investments');
  if (!painel || !painel.classList.contains('active')) return;
  if (await ensureAssetColors()) { renderInvestments(); return; }
  renderCompareControls();
  const token = ++cmpToken;
  const box = document.getElementById('cmpChart');
  const nota = document.getElementById('cmpNote');
  const cfg = cmpConfig();
  const ops = cmpOptions();
  const selecionadas = cfg.sel.map((k) => ops.find((o) => o.key === k)).filter(Boolean);
  const benches = Object.keys(cfg.bench).filter((k) => cfg.bench[k]);
  const metrica = cfg.metric;
  const emPct = PCT_METRICS.includes(metrica);
  let ref = emPct ? cfg.reference : 'none';
  const avisos = new Set();
  const avisar = (m) => { avisos.add(m); if (nota && token === cmpToken) nota.textContent = [...avisos].join(' '); };
  const limpar = (msg) => {
    box.innerHTML = `<p class="empty-state">${msg}</p>`;
    ['cmpLegend', 'cmpStats', 'cmpRanking'].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  };

  if (!selecionadas.length && !benches.length) { nota.textContent = ''; limpar(t('cmp.pickOne')); return; }
  box.innerHTML = `<p class="hint">${t('mkt.loadingHist')}</p>`;
  nota.textContent = '';

  const D = cfg.currency === 'base' ? state.settings.baseCurrency : cfg.currency;
  const temTotal = selecionadas.some((o) => o.key === 'total');

  // A referência também precisa de dados, mesmo que não esteja selecionada
  const refOp = ref.startsWith('bench:') ? null : ops.find((o) => o.key === ref);
  const refBench = ref.startsWith('bench:') ? ref.slice(6) : null;
  if (ref !== 'none' && !refOp && !refBench) ref = 'none';
  if (refOp && metrica === 'ret' && !refOp.invest) { avisar(t('cmp.watchOnlyPrice').replace('{a}', refOp.label)); ref = 'none'; }

  const envolvidas = [...selecionadas];
  if (refOp && !envolvidas.includes(refOp)) envolvidas.push(refOp);
  const usaTotal = envolvidas.some((o) => o.key === 'total');
  const todasPosicoes = [...new Set([...(usaTotal ? state.positions : []), ...envolvidas.filter((o) => o.pos).map((o) => o.pos)])];
  const benchesNecessarios = [...new Set([...benches, ...(refBench ? [refBench] : [])])];

  const primeiraMov = todasPosicoes.flatMap((p) => invMovesOf(p.id).map((m) => m.date)).sort()[0];
  const cincoAnos = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 5); return d.toISOString().slice(0, 10); })();
  const inicioPeriodo = periodStart(cfg, primeiraMov || cincoAnos);
  const fimPeriodo = cfg.period === 'custom' && cfg.to ? cfg.to : todayISO();
  const inicioDados = [inicioPeriodo, primeiraMov || inicioPeriodo].sort()[0];

  // Históricos
  const hist = {};
  for (const pos of todasPosicoes) {
    if (token !== cmpToken) return;
    hist['pos:' + pos.id] = pos.ticker && pos.kind === 'quote'
      ? await fetchHistory(pos, () => avisar(t('mkt.rateWait'))).catch(() => { avisar(t('mkt.histFail') + ' ' + pos.ticker); return []; })
      : [];
  }
  for (const o of envolvidas.filter((x) => x.watch)) {
    if (token !== cmpToken) return;
    hist[o.key] = await fetchHistory(o.watch, () => avisar(t('mkt.rateWait'))).catch(() => { avisar(t('mkt.histFail') + ' ' + o.label); return []; });
  }
  const niveis = {};
  for (const b of benchesNecessarios) {
    if (token !== cmpToken) return;
    try { niveis[b] = await benchmarkLevels(b, cfg, inicioDados, avisar); }
    catch (e) { avisar(t('cmp.benchFail').replace('{b}', t('cmp.b.' + b)) + ' ' + e.message); niveis[b] = { points: [], currency: 'EUR' }; }
    if (!niveis[b].points.length) avisar(t('cmp.benchFail').replace('{b}', t('cmp.b.' + b)));
  }
  const conv = makeConverter(await fetchFxHistory(inicioDados));
  if (token !== cmpToken) return;

  // Eixo de datas
  const datasSet = new Set([fimPeriodo]);
  Object.values(hist).forEach((h) => h.forEach(([d]) => { if (d >= inicioDados && d <= fimPeriodo) datasSet.add(d); }));
  Object.values(niveis).forEach((n) => n.points.forEach(([d]) => { if (d >= inicioDados && d <= fimPeriodo) datasSet.add(d); }));
  todasPosicoes.forEach((p) => {
    invMovesOf(p.id).forEach((m) => { if (m.date <= fimPeriodo) datasSet.add(m.date); });
    quotesOf(p.id).forEach((q) => { if (q.date >= inicioDados && q.date <= fimPeriodo) datasSet.add(q.date); });
  });
  let datasTodas = [...datasSet].filter((d) => d >= inicioDados).sort();
  if (datasTodas.length < 2) datasTodas = weekdaysBetween(inicioDados, fimPeriodo);

  // Valor e custo diários de cada posição, na moeda de exibição
  const valorPos = {}, custoPos = {};
  todasPosicoes.forEach((pos) => {
    const h = hist['pos:' + pos.id] || [];
    const manual = {};
    quotesOf(pos.id).forEach((q) => { manual[q.date] = Number(q.value); });
    const custos = costSeriesD(pos, datasTodas, D, conv);
    custoPos[pos.id] = custos;
    valorPos[pos.id] = datasTodas.map((d, i) => {
      let v;
      if (pos.kind === 'quote') {
        const st = positionStateAt(pos, d);
        if (st.quantity <= 0) return 0;
        const preco = manual[d] != null ? manual[d] : (closeAt(h, d) || (positionQuoteAt(pos, d) || {}).value);
        v = preco ? st.quantity * preco : st.cost;
      } else v = positionValue(pos, d);
      const c = conv(v, pos.currency, D, d);
      return c == null ? custos[i] : c;
    });
  });

  const idx = datasTodas.map((d, i) => [d, i]).filter(([d]) => d >= inicioPeriodo && d <= fimPeriodo).map(([, i]) => i);
  const cortar = (arr) => idx.map((i) => arr[i]);
  const datasPeriodo = cortar(datasTodas);

  const posicoesDe = (o) => (o.key === 'total' ? state.positions : [o.pos].filter(Boolean));
  const somaPos = (mapa, ps) => datasTodas.map((_, i) => ps.reduce((s, p) => s + (mapa[p.id] ? mapa[p.id][i] : 0), 0));
  const aprox = new Set();
  const avisoCurto = (b) => (desde) => aprox.add(t('cmp.benchShort').replace('{b}', t('cmp.b.' + b)).replace('{d}', desde.split('-').reverse().join('/')));

  // % de uma opção (ativo, carteira ou watchlist), já no período
  const pctDe = (o) => {
    if (o.watch) return normalize(datasPeriodo.map((d) => conv(closeAt(hist[o.key] || [], d), o.watch.currency, D, d)));
    const ps = posicoesDe(o);
    const valores = somaPos(valorPos, ps), custos = somaPos(custoPos, ps);
    if (metrica === 'ret') return cortar(valores.map((v, i) => retOf(v, custos[i])));
    const h = o.pos && o.pos.kind === 'quote' ? hist[o.key] : null;
    if (h && h.length) return normalize(datasPeriodo.map((d) => conv(closeAt(h, d), o.pos.currency, D, d)));
    const fl = {};
    flowsOf(ps, D, conv).forEach((f) => { fl[f.date] = (fl[f.date] || 0) + (f.type === 'buy' ? f.amount : -f.amount); });
    return twrSeries(cortar(valores), fl, datasPeriodo);
  };
  // % de um índice: "ret" recebe os aportes informados; "price" só normaliza
  const pctBench = (b, fluxos) => {
    const nv = niveis[b];
    if (!nv || !nv.points.length) return null;
    if (metrica === 'price') return normalize(datasPeriodo.map((d) => conv(closeAt(nv.points, d), nv.currency, D, d)));
    if (!fluxos.length) return null;
    const sim = cortar(simulateBench(nv.points, nv.currency, fluxos, datasTodas, D, conv, avisoCurto(b)));
    return sim.map((s) => retOf(s.value, s.cost));
  };

  // Aportes que alimentam os índices exibidos como linha própria
  const alvoFluxos = selecionadas.find((o) => o.key === cfg.benchFlows && o.invest);
  const fluxosIndices = alvoFluxos
    ? flowsOf(posicoesDe(alvoFluxos), D, conv)
    : flowsOf(temTotal ? state.positions : selecionadas.filter((o) => o.pos).map((o) => o.pos), D, conv);

  // Linha da referência (quando não depende do ativo)
  let refFixa = null, refLabel = '';
  if (ref !== 'none') {
    if (refOp) { refFixa = pctDe(refOp); refLabel = refOp.label; }
    else { refLabel = benchLabel(refBench, cfg); if (metrica === 'price') refFixa = pctBench(refBench, []); }
  }
  const menosRef = (arr, refArr) => arr.map((v, i) => (v == null || !refArr || refArr[i] == null ? null : v - refArr[i]));

  const series = [];
  selecionadas.forEach((o) => {
    if (metrica !== 'price' && !o.invest) { avisar(t('cmp.watchOnlyPrice').replace('{a}', o.label)); return; }
    if (o.key === ref) return; // a própria referência vira a linha do zero
    const marcadores = cfg.markers && o.pos
      ? invMovesOf(o.pos.id).filter((m) => m.date >= inicioPeriodo && m.date <= fimPeriodo).map((m) => ({ date: m.date, type: m.type }))
      : [];
    const base = { key: o.key, label: o.label, title: o.title, color: o.color, markers: marcadores };

    if (emPct) {
      let pts = pctDe(o);
      if (ref !== 'none') {
        // Índice como referência na métrica "ret": cada ativo contra o índice com os SEUS aportes
        const r = refBench && metrica === 'ret' ? pctBench(refBench, flowsOf(posicoesDe(o), D, conv)) : refFixa;
        pts = menosRef(pts, r);
      }
      series.push({ ...base, points: datasPeriodo.map((d, i) => [d, pts[i]]) });
      return;
    }
    const valores = cortar(somaPos(valorPos, posicoesDe(o)));
    const custos = cortar(somaPos(custoPos, posicoesDe(o)));
    const valorDe = (i) => (metrica === 'value' ? valores[i] : metrica === 'cost' ? custos[i] : metrica === 'profit' ? valores[i] - custos[i] : valores[i]);
    series.push({ ...base, points: datasPeriodo.map((d, i) => [d, valorDe(i)]) });
    if (metrica === 'both') series.push({ key: o.key + ':cost', label: o.label + ' — ' + t('mkt.invested'), color: o.color, dash: '6 4', points: datasPeriodo.map((d, i) => [d, custos[i]]) });
  });

  benches.forEach((b) => {
    if (refBench === b) return;
    const nv = niveis[b];
    if (!nv || !nv.points.length) return;
    const cor = cfg.colors[b];
    const rotulo = benchLabel(b, cfg) + (metrica === 'price' ? '' : ' ' + t('cmp.sameMoney'));
    if (!fluxosIndices.length && metrica !== 'price') { avisar(t('cmp.benchNeedsFlows')); return; }
    if (metrica === 'cost') return;
    if (emPct) {
      let pts = pctBench(b, fluxosIndices);
      if (!pts) return;
      if (ref !== 'none') pts = menosRef(pts, refBench && metrica === 'ret' ? pctBench(refBench, fluxosIndices) : refFixa);
      series.push({ key: 'bench:' + b, label: rotulo, color: cor, dash: '2 3', bench: true, points: datasPeriodo.map((d, i) => [d, pts[i]]) });
      return;
    }
    const sim = cortar(simulateBench(nv.points, nv.currency, fluxosIndices, datasTodas, D, conv, avisoCurto(b)));
    const val = (s) => (s.value == null ? null : metrica === 'profit' ? s.value - s.cost : s.value);
    series.push({ key: 'bench:' + b, label: rotulo, color: cor, dash: '2 3', bench: true, points: datasPeriodo.map((d, i) => [d, val(sim[i])]) });
  });

  if (metrica === 'cost' && benches.length) avisar(t('cmp.costNoBench'));
  if (benches.length && metrica !== 'price' && ref === 'none') {
    avisar(alvoFluxos ? t('cmp.benchFlowsOf').replace('{a}', alvoFluxos.label) : t('cmp.benchCombined'));
  }
  if (refBench && metrica === 'ret') avisar(t('cmp.refOwnFlows').replace('{r}', refLabel));
  aprox.forEach((m) => avisar(m));
  if (conv.approx()) avisar(t('nav.approx'));

  const manter = new Set(downsample(datasPeriodo, 700));
  series.forEach((s) => { s.points = s.points.filter(([d]) => manter.has(d)); });

  if (token !== cmpToken) return;
  const unidade = emPct ? (ref !== 'none' ? 'pp' : 'pct') : 'money';
  drawCompareChart(series, unidade, D, cfg.style, ref !== 'none' ? refLabel : '');
  renderRanking(series, unidade, D, metrica, ref !== 'none' ? refLabel : '');
}

function fmtAxis(v, unidade) {
  if (unidade === 'money') return fmtCompact(v);
  const txt = v.toFixed(Math.abs(v) < 10 ? 1 : 0).replace('.', ',');
  return unidade === 'pp' ? (v > 0 ? '+' : '') + txt + ' p.p.' : txt + '%';
}
function fmtVal(v, unidade, D) {
  if (v == null) return '—';
  if (Math.abs(v) < 0.005) v = 0;
  if (unidade === 'money') return fmtMoney(v, D);
  if (unidade === 'pp') return (v > 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + ' p.p.';
  return fmtPct(v);
}

function drawCompareChart(series, unidade, D, estilo, refLabel) {
  const box = document.getElementById('cmpChart');
  const tip = document.getElementById('cmpTip');
  const legend = document.getElementById('cmpLegend');
  const stats = document.getElementById('cmpStats');
  const validas = series.filter((s) => s.points.filter(([, v]) => v != null).length >= 2);
  if (!validas.length) {
    box.innerHTML = `<p class="empty-state">${t('cmp.noData')}</p>`;
    legend.innerHTML = ''; stats.innerHTML = '';
    return;
  }
  validas.forEach((s) => { if (cmpVisible[s.key] === undefined) cmpVisible[s.key] = true; });

  legend.innerHTML = '';
  validas.forEach((s) => {
    const lab = document.createElement('label');
    lab.innerHTML = `<input type="checkbox" ${cmpVisible[s.key] ? 'checked' : ''}><span class="swatch${s.dash ? ' swatch-dash' : ''}" style="${s.dash ? `border-color:${s.color}` : `background:${s.color}`}"></span>${escapeHtml(s.label)}`;
    lab.querySelector('input').addEventListener('change', (e) => { cmpVisible[s.key] = e.target.checked; desenhar(); });
    legend.appendChild(lab);
  });
  if (refLabel) {
    const lab = document.createElement('span');
    lab.className = 'ref-legend';
    lab.innerHTML = `<span class="swatch swatch-ref"></span>${escapeHtml(t('cmp.refLine').replace('{r}', refLabel))}`;
    legend.appendChild(lab);
  }

  const datas = [...new Set(validas.flatMap((s) => s.points.map(([d]) => d)))].sort();
  const mapa = validas.map((s) => { const m = {}; s.points.forEach(([d, v]) => { m[d] = v; }); return m; });

  function desenhar() {
    const W = 760, H = 340, padL = 76, padR = 16, padT = 16, padB = 34;
    const vis = validas.map((s, k) => ({ s, m: mapa[k] })).filter(({ s }) => cmpVisible[s.key]);
    let min = Infinity, max = -Infinity;
    vis.forEach(({ s }) => s.points.forEach(([, v]) => { if (v != null) { min = Math.min(min, v); max = Math.max(max, v); } }));
    if (!isFinite(min)) { min = 0; max = 1; }
    if (unidade !== 'money') { min = Math.min(min, 0); max = Math.max(max, 0); }
    if (min === max) max = min + 1;
    const faixa = max - min; min -= faixa * 0.06; max += faixa * 0.06;
    if (unidade === 'money' && min < 0 && vis.every(({ s }) => s.points.every(([, v]) => v == null || v >= 0))) min = 0;
    const X = (i) => padL + (i / Math.max(datas.length - 1, 1)) * (W - padL - padR);
    const Y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
    const iData = {}; datas.forEach((d, i) => { iData[d] = i; });
    const pos = getComputedStyle(document.documentElement).getPropertyValue('--positive').trim() || '#15803d';
    const neg = getComputedStyle(document.documentElement).getPropertyValue('--negative').trim() || '#b91c1c';

    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('cmp.title')}">`;
    // Com referência: fundo levemente verde acima do zero e vermelho abaixo
    if (unidade === 'pp' && min < 0 && max > 0) {
      svg += `<rect x="${padL}" y="${padT}" width="${W - padL - padR}" height="${Y(0) - padT}" fill="${pos}" fill-opacity="0.05"/>
        <rect x="${padL}" y="${Y(0)}" width="${W - padL - padR}" height="${H - padB - Y(0)}" fill="${neg}" fill-opacity="0.05"/>`;
    }
    for (let g = 0; g <= 5; g++) {
      const v = min + ((max - min) * g) / 5;
      svg += `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--border)"/>
        <text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtAxis(v, unidade)}</text>`;
    }
    if (min < 0 && max > 0) {
      svg += `<line x1="${padL}" x2="${W - padR}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--text)" stroke-opacity="${unidade === 'pp' ? 0.7 : 0.35}" stroke-width="${unidade === 'pp' ? 1.5 : 1}"/>`;
      if (unidade === 'pp') svg += `<text x="${W - padR - 4}" y="${Y(0) - 6}" text-anchor="end" font-size="11" fill="var(--muted)">${escapeHtml(refLabel)} = 0</text>`;
    }

    vis.forEach(({ s }) => {
      const pts = s.points.filter(([, v]) => v != null);
      if (pts.length < 2) return;
      const d = pts.map(([dt, v], j) => `${j ? 'L' : 'M'}${X(iData[dt]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      if (estilo === 'area' && !s.dash) {
        const chao = Y(unidade === 'money' ? Math.max(min, 0) : 0);
        svg += `<path d="${d} L${X(iData[pts[pts.length - 1][0]]).toFixed(1)},${chao} L${X(iData[pts[0][0]]).toFixed(1)},${chao} Z" fill="${s.color}" fill-opacity="${vis.length > 2 ? 0.08 : 0.16}"/>`;
      }
      svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.bench ? 1.8 : 2.2}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round"/>`;
      (s.markers || []).forEach((mk) => {
        const ponto = pts.find(([dt]) => dt >= mk.date);
        if (!ponto) return;
        const cx = X(iData[ponto[0]]), cy = Y(ponto[1]);
        svg += mk.type === 'buy'
          ? `<path d="M${cx},${cy - 7} l5,8 h-10 z" fill="${s.color}" stroke="var(--surface)" stroke-width="1"><title>${t('inv.buy')} ${mk.date}</title></path>`
          : `<path d="M${cx},${cy + 7} l5,-8 h-10 z" fill="${s.color}" stroke="var(--surface)" stroke-width="1"><title>${t('inv.sell')} ${mk.date}</title></path>`;
      });
    });

    const passos = Math.min(7, datas.length);
    for (let k = 0; k < passos; k++) {
      const i = Math.round((k * (datas.length - 1)) / (passos - 1 || 1));
      const ancora = k === 0 ? 'start' : k === passos - 1 ? 'end' : 'middle';
      svg += `<text x="${X(i)}" y="${H - 10}" text-anchor="${ancora}" font-size="11" fill="var(--muted)">${datas[i].slice(2).split('-').reverse().join('/')}</text>`;
    }
    svg += `<line id="cmpCursor" x1="0" x2="0" y1="${padT}" y2="${H - padB}" stroke="var(--muted)" visibility="hidden"/>`;
    svg += `<rect id="cmpHit" x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}" fill="transparent"/></svg>`;
    box.innerHTML = svg;

    const svgEl = box.querySelector('svg');
    const hit = document.getElementById('cmpHit');
    const cursor = document.getElementById('cmpCursor');
    const mover = (ev) => {
      const r = svgEl.getBoundingClientRect();
      const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (W / r.width);
      const i = Math.max(0, Math.min(datas.length - 1, Math.round(((px - padL) / (W - padL - padR)) * (datas.length - 1))));
      const d = datas[i];
      cursor.setAttribute('x1', X(i)); cursor.setAttribute('x2', X(i)); cursor.setAttribute('visibility', 'visible');
      tip.innerHTML = `<div>${d.split('-').reverse().join('/')}${refLabel ? ' — ' + escapeHtml(t('cmp.vsRef').replace('{r}', refLabel)) : ''}</div>` + vis.map(({ s, m }) => {
        let v = m[d];
        if (v === undefined) { const ant = s.points.filter(([x]) => x <= d); v = ant.length ? ant[ant.length - 1][1] : null; }
        return `<div class="tip-row">${colorDot(s.color)}${escapeHtml(s.label)}:&nbsp;<strong>${fmtVal(v, unidade, D)}</strong></div>`;
      }).join('');
      tip.classList.remove('hidden');
      const bx = box.parentElement.getBoundingClientRect();
      let left = (X(i) / W) * r.width + (r.left - bx.left) + 14;
      if (left + tip.offsetWidth > bx.width) left -= tip.offsetWidth + 28;
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = '8px';
    };
    hit.addEventListener('mousemove', mover);
    hit.addEventListener('touchmove', mover, { passive: true });
    hit.addEventListener('mouseleave', () => { tip.classList.add('hidden'); cursor.setAttribute('visibility', 'hidden'); });
  }
  desenhar();

  stats.innerHTML = `<table class="mini-table cmp-stats-table"><thead><tr>
      <th>${t('cmp.series')}</th><th>${t('cmp.start')}</th><th>${t('cmp.end')}</th><th>${t('cmp.change')}</th><th>${t('cmp.max')}</th><th>${t('cmp.min')}</th>
    </tr></thead><tbody>${validas.map((s) => {
      const vals = s.points.filter(([, v]) => v != null);
      const ini = vals[0][1], fim = vals[vals.length - 1][1];
      const ys = vals.map(([, v]) => v);
      let dif = fim - ini;
      if (Math.abs(dif) < 0.005) dif = 0;
      const variacao = unidade === 'money'
        ? fmtMoney(dif, D) + (ini > 0 ? ' (' + fmtPct((fim / ini - 1) * 100) + ')' : '')
        : (dif > 0 ? '+' : '') + dif.toFixed(2).replace('.', ',') + ' p.p.';
      return `<tr><td>${colorDot(s.color)}${escapeHtml(s.label)}</td><td>${fmtVal(ini, unidade, D)}</td><td><strong>${fmtVal(fim, unidade, D)}</strong></td>
        <td class="${dif > 0 ? 'amount-in' : dif < 0 ? 'amount-out' : ''}">${variacao}</td><td>${fmtVal(Math.max(...ys), unidade, D)}</td><td>${fmtVal(Math.min(...ys), unidade, D)}</td></tr>`;
    }).join('')}</tbody></table>`;
}

// Ranking em barras: quem ganhou mais no fim do período (ou mais acima da referência)
function renderRanking(series, unidade, D, metrica, refLabel) {
  const box = document.getElementById('cmpRanking');
  if (!box) return;
  if (!['ret', 'price', 'profit'].includes(metrica)) { box.innerHTML = ''; return; }
  const itens = series
    .filter((s) => !String(s.key).endsWith(':cost'))
    .map((s) => { const v = s.points.filter(([, x]) => x != null); return { s, v: v.length ? v[v.length - 1][1] : null }; })
    .filter((x) => x.v != null)
    .sort((a, b) => b.v - a.v);
  if (!itens.length) { box.innerHTML = ''; return; }
  const maxAbs = Math.max(...itens.map((x) => Math.abs(x.v)), 0.0001);
  const titulo = refLabel ? t('cmp.rankVs').replace('{r}', refLabel) : t('cmp.rank.' + metrica);
  box.innerHTML = `<h4 class="rank-title">${escapeHtml(titulo)}</h4>
    <ol class="rank-list">${itens.map(({ s, v }) => {
      const larg = (Math.abs(v) / maxAbs) * 50;
      const lado = v >= 0 ? `left:50%;width:${larg}%` : `left:${50 - larg}%;width:${larg}%`;
      return `<li>
        <span class="rank-name">${colorDot(s.color)}${escapeHtml(s.label)}</span>
        <span class="rank-track"><span class="rank-axis"></span><span class="rank-bar${s.dash ? ' rank-bar-bench' : ''}" style="${lado};background:${s.color}"></span></span>
        <span class="rank-val ${v > 0 ? 'amount-in' : v < 0 ? 'amount-out' : ''}">${fmtVal(v, unidade, D)}</span>
      </li>`;
    }).join('')}</ol>`;
}

/* ----- Controles ----- */
function renderCompareControls() {
  const wrap = document.getElementById('cmpControls');
  if (!wrap) return;
  const cfg = cmpConfig();
  const ops = cmpOptions();
  const validas = cfg.sel.filter((k) => ops.some((o) => o.key === k));
  if (validas.length !== cfg.sel.length) { cfg.sel = validas; saveCmpConfig(cfg); }
  const emPct = PCT_METRICS.includes(cfg.metric);

  const chip = (o) => {
    const ativo = cfg.sel.includes(o.key);
    return `<span class="cmp-chip ${ativo ? 'active' : ''}" style="--chip:${o.color || 'var(--muted)'}" title="${escapeHtml(o.title || o.label)}">
      <input type="color" value="${o.color || '#64748b'}" aria-label="${t('cmp.color')}" onchange="setSeriesColor('${o.key}', this.value)">
      <button type="button" aria-pressed="${ativo}" onclick="toggleCmpSel('${o.key}')">${escapeHtml(o.label)}</button>
    </span>`;
  };
  const benchChip = (k) => `<span class="cmp-chip ${cfg.bench[k] ? 'active' : ''}" style="--chip:${cfg.colors[k]}">
      <input type="color" value="${cfg.colors[k]}" aria-label="${t('cmp.color')}" onchange="setSeriesColor('${k}', this.value)">
      <button type="button" aria-pressed="${cfg.bench[k]}" onclick="toggleCmpBench('${k}')">${escapeHtml(benchLabel(k, cfg))}</button>
    </span>`;
  const opt = (v, atual, rot) => `<option value="${v}" ${v === atual ? 'selected' : ''}>${rot}</option>`;
  const investidos = cfg.sel.map((k) => ops.find((o) => o.key === k)).filter((o) => o && o.invest);
  const opcoesRef = [
    opt('none', cfg.reference, t('cmp.refNone')),
    `<optgroup label="${t('cmp.benchmarks')}">${['cdi', 'ibov', 'spx'].map((b) => opt('bench:' + b, cfg.reference, escapeHtml(benchLabel(b, cfg)))).join('')}</optgroup>`,
    `<optgroup label="${t('cmp.refAssets')}">${ops.filter((o) => cfg.metric === 'price' || o.invest).map((o) => opt(o.key, cfg.reference, escapeHtml(o.label))).join('')}</optgroup>`
  ].join('');

  wrap.innerHTML = `
    <div class="cmp-block">
      <div class="cmp-label">${t('cmp.assets').replace('{n}', CMP_MAX)} <span class="hint">${cfg.sel.length}/${CMP_MAX}</span></div>
      <div class="cmp-chips">${ops.length ? ops.map(chip).join('') : `<span class="hint">${t('cmp.noAssets')}</span>`}</div>
    </div>
    <div class="cmp-block">
      <div class="cmp-label">${t('cmp.benchmarks')}</div>
      <div class="cmp-chips">${['cdi', 'ibov', 'spx'].map(benchChip).join('')}</div>
      <div class="cmp-cdb ${cfg.bench.cdi || cfg.reference === 'bench:cdi' ? '' : 'hidden'}">
        <select onchange="setCmp('cdbMode', this.value)" aria-label="CDB">
          ${opt('cdi', cfg.cdbMode, t('cmp.cdbModeCdi'))}${opt('fixed', cfg.cdbMode, t('cmp.cdbModeFixed'))}
        </select>
        ${cfg.cdbMode === 'cdi'
          ? `<input type="number" min="1" max="300" step="1" value="${cfg.cdbPct}" onchange="setCmp('cdbPct', Number(this.value) || 100)" aria-label="% CDI"> <span>% ${t('cmp.ofCdi')}</span>`
          : `<input type="number" min="0" max="100" step="0.1" value="${cfg.cdbRate}" onchange="setCmp('cdbRate', Number(this.value) || 0)" aria-label="% a.a."> <span>% ${t('cmp.perYear')}</span>`}
      </div>
    </div>
    <div class="cmp-row">
      <label>${t('cmp.metric')}
        <select onchange="setCmp('metric', this.value)">
          <optgroup label="${t('cmp.groupPct')}">${['ret', 'price'].map((m) => opt(m, cfg.metric, t('cmp.m.' + m))).join('')}</optgroup>
          <optgroup label="${t('cmp.groupMoney')}">${['profit', 'value', 'both', 'cost'].map((m) => opt(m, cfg.metric, t('cmp.m.' + m))).join('')}</optgroup>
        </select>
      </label>
      <label class="${emPct ? '' : 'is-disabled'}" title="${emPct ? '' : t('cmp.refOnlyPct')}">${t('cmp.reference')}
        <select onchange="setCmp('reference', this.value)" ${emPct ? '' : 'disabled'}>${opcoesRef}</select>
      </label>
      <label>${t('cmp.currency')}
        <select onchange="setCmp('currency', this.value)">
          ${opt('base', cfg.currency, t('cmp.baseCur').replace('{c}', state.settings.baseCurrency))}
          ${CURRENCIES.map((c) => opt(c.code, cfg.currency, c.code)).join('')}
        </select>
      </label>
      <label>${t('cmp.style')}
        <select onchange="setCmp('style', this.value)">
          ${opt('line', cfg.style, t('cmp.lines'))}${opt('area', cfg.style, t('cmp.area'))}
        </select>
      </label>
      ${cfg.metric !== 'price' && investidos.length > 1 && cfg.reference === 'none' ? `<label>${t('cmp.benchFlows')}
        <select onchange="setCmp('benchFlows', this.value)">
          ${opt('sum', cfg.benchFlows, t('cmp.flowsSum'))}
          ${investidos.map((o) => opt(o.key, cfg.benchFlows, escapeHtml(o.label))).join('')}
        </select>
      </label>` : ''}
      <label class="checkline"><input type="checkbox" ${cfg.markers ? 'checked' : ''} onchange="setCmp('markers', this.checked)"> ${t('cmp.markers')}</label>
    </div>
    <p class="hint cmp-metric-hint">${t('cmp.help.' + cfg.metric)}</p>
    <div class="cmp-row">
      <div class="nav-toggle chart-periods">${['1m', '3m', '6m', 'ytd', '1y', '3y', '5y', 'all', 'custom'].map((k) =>
        `<button type="button" class="${cfg.period === k ? 'active' : ''}" onclick="setCmp('period', '${k}')">${t('cmp.p.' + k)}</button>`).join('')}</div>
      <span class="cmp-custom ${cfg.period === 'custom' ? '' : 'hidden'}">
        <input type="date" value="${cfg.from}" onchange="setCmp('from', this.value)" aria-label="${t('cmp.start')}">
        <input type="date" value="${cfg.to}" onchange="setCmp('to', this.value)" aria-label="${t('cmp.end')}">
      </span>
    </div>`;
}

async function setCmp(campo, valor) {
  const cfg = cmpConfig();
  cfg[campo] = valor;
  await saveCmpConfig(cfg);
  renderCompare();
}
async function toggleCmpSel(chave) {
  const cfg = cmpConfig();
  if (cfg.sel.includes(chave)) cfg.sel = cfg.sel.filter((k) => k !== chave);
  else {
    if (cfg.sel.length >= CMP_MAX) { showToast(t('cmp.maxReached').replace('{n}', CMP_MAX)); return; }
    cfg.sel = [...cfg.sel, chave];
  }
  await saveCmpConfig(cfg);
  renderCompare();
}
async function toggleCmpBench(chave) {
  const cfg = cmpConfig();
  cfg.bench[chave] = !cfg.bench[chave];
  await saveCmpConfig(cfg);
  renderCompare();
}


/* ================= FASE 10 — Notícias (manchetes e links) =================
   Só título, fonte e horário: o clique abre a matéria no site original. Assim
   respeitamos o conteúdo de cada portal e não precisamos de servidor próprio.
   - Português: busca do Google News (RSS) lida através do rss2json.
   - Inglês: notícias por empresa da Finnhub (chave já cadastrada).
   Atualiza ao abrir o app e a cada 2 horas com ele aberto. */

const NEWS_KEY = HIST_PREFIX + 'news';
const NEWS_TTL = 2 * 60 * 60 * 1000;
const NEWS_MAX = 200;
const NEWS_MARKET_TOPICS = ['Ibovespa', 'dólar hoje', 'Selic Copom', 'S&P 500'];
let newsCache = null;         // { fetchedAt, items }
let newsLoading = false;
let newsTimer = null;
const newsUi = { filter: 'all', lang: 'all' };

function newsTickers() {
  const vistos = new Map();
  state.positions.filter((p) => p.ticker).forEach((p) => vistos.set(p.ticker, { ticker: p.ticker, name: p.name, market: marketOf(p), assetType: p.assetType, currency: p.currency, group: 'portfolio' }));
  watchlist().forEach((w) => { if (!vistos.has(w.ticker)) vistos.set(w.ticker, { ticker: w.ticker, name: w.name, market: marketOf(w), assetType: w.assetType, currency: w.currency, group: 'watch' }); });
  return [...vistos.values()];
}

// "S&amp;P 500" → "S&P 500". O escapeHtml na hora de exibir continua protegendo a tela.
function decodeEntities(txt) {
  const el = document.createElement('textarea');
  el.innerHTML = String(txt || '');
  return el.value;
}
function safeUrl(u) {
  try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : null; } catch (e) { return null; }
}
// Nome curto da empresa para a busca: "Petroleo Brasileiro SA Pfd" → "Petroleo Brasileiro"
function shortCompany(nome) {
  return String(nome || '').replace(/\b(S\.?A\.?|SA|Pfd|PN|ON|Inc\.?|Corp\.?|Holding|Ltd\.?|plc|Co\.?|Class [A-Z])\b/gi, '').replace(/\s+/g, ' ').trim().split(' ').slice(0, 2).join(' ');
}

async function fetchGoogleNews(query, tag) {
  const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  const chave = apiKey('apiRss2json');
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}${chave ? '&api_key=' + encodeURIComponent(chave) : ''}`;
  const d = await getJSON(url);
  if (d.status && d.status !== 'ok') throw new Error(d.message || 'rss2json');
  return (d.items || []).slice(0, 12).map((it) => {
    // O Google News coloca a fonte no fim do título: "Manchete - InfoMoney"
    const partes = decodeEntities(it.title).split(' - ');
    const fonte = partes.length > 1 ? partes.pop() : (it.author || 'Google News');
    return {
      title: partes.join(' - '), source: fonte, url: safeUrl(it.link),
      date: it.pubDate ? new Date(it.pubDate.replace(' ', 'T') + 'Z').toISOString() : new Date().toISOString(),
      tag, lang: 'pt'
    };
  });
}

async function fetchFinnhubNews(ticker) {
  const key = apiKey('apiFinnhub');
  if (!key) return [];
  const ate = todayISO();
  const de = new Date(); de.setDate(de.getDate() - 7);
  const d = await getJSON(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${de.toISOString().slice(0, 10)}&to=${ate}&token=${key}`);
  return (Array.isArray(d) ? d : []).slice(0, 12).map((n) => ({
    title: decodeEntities(n.headline), source: decodeEntities(n.source), url: safeUrl(n.url),
    date: new Date((n.datetime || 0) * 1000).toISOString(), tag: ticker, lang: 'en'
  }));
}

async function loadNewsCache() {
  if (!newsCache) {
    newsCache = (await getSetting(NEWS_KEY)) || { fetchedAt: null, items: [] };
    newsCache.items = (newsCache.items || []).map((n) => ({ ...n, title: decodeEntities(n.title), tags: (n.tags || []).filter(Boolean) }));
  }
  return newsCache;
}

async function refreshNews(forcar) {
  await loadNewsCache();
  const idade = newsCache.fetchedAt ? Date.now() - new Date(newsCache.fetchedAt).getTime() : Infinity;
  // Ativo novo na carteira ou na watchlist busca na hora, sem esperar as 2 horas
  const atuais = newsTickers().map((a) => a.ticker);
  const temNovo = atuais.some((tk) => !(newsCache.tickers || []).includes(tk));
  if (!forcar && idade < NEWS_TTL && !temNovo) return false;
  if (newsLoading) return false;
  newsLoading = true;
  renderNewsStatus();

  const tarefas = [];
  newsTickers().forEach((a) => {
    if (a.market === 'us') {
      tarefas.push(() => fetchFinnhubNews(a.ticker));
      tarefas.push(() => fetchGoogleNews(`${a.ticker} ${shortCompany(a.name)}`, a.ticker));
    } else if (a.market === 'crypto') {
      tarefas.push(() => fetchGoogleNews(`${a.name || a.ticker} criptomoeda`, a.ticker));
    } else {
      tarefas.push(() => fetchGoogleNews(`${a.ticker} ${shortCompany(a.name)}`, a.ticker));
    }
  });
  NEWS_MARKET_TOPICS.forEach((q) => tarefas.push(() => fetchGoogleNews(q, 'market')));

  const novos = [];
  let falhas = 0;
  for (const tarefa of tarefas) {
    try { novos.push(...(await tarefa())); }
    catch (e) { falhas++; console.warn('Notícias:', e.message); }
  }

  // Junta com o que já havia, sem repetir a mesma manchete
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9à-ú]+/g, ' ').trim();
  const porTitulo = new Map();
  [...novos, ...(newsCache.items || [])].forEach((n) => {
    if (!n.url || !n.title) return;
    const k = norm(n.title);
    const etiquetas = (n.tags || [n.tag]).filter(Boolean);
    const existente = porTitulo.get(k);
    if (!existente) porTitulo.set(k, { ...n, title: decodeEntities(n.title), tags: [...new Set(etiquetas)] });
    else etiquetas.forEach((tg) => { if (!existente.tags.includes(tg)) existente.tags.push(tg); });
  });
  const limite = Date.now() - 14 * 86400000;
  const itens = [...porTitulo.values()]
    .filter((n) => new Date(n.date).getTime() >= limite)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, NEWS_MAX)
    .map(({ tag, ...resto }) => resto);

  newsLoading = false;
  if (novos.length || !newsCache.items.length) {
    newsCache = { fetchedAt: new Date().toISOString(), items: itens, tickers: atuais, failed: falhas === tarefas.length };
    await put('settings', { key: NEWS_KEY, value: newsCache });
  } else {
    newsCache.failed = true;
  }
  renderNews();
  return true;
}

function startNewsSchedule() {
  if (newsTimer) clearInterval(newsTimer);
  refreshNews(false).catch((e) => console.warn('Notícias:', e));
  newsTimer = setInterval(() => refreshNews(true).catch(() => {}), NEWS_TTL);
}

function timeAgo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return t('news.now');
  if (min < 60) return t('news.min').replace('{n}', min);
  const h = Math.round(min / 60);
  if (h < 24) return t('news.hours').replace('{n}', h);
  return t('news.days').replace('{n}', Math.round(h / 24));
}

function newsShortcuts(a) {
  const tk = a.ticker, baixo = tk.toLowerCase();
  const links = [
    [t('news.google'), `https://news.google.com/search?q=${encodeURIComponent(tk + ' ' + shortCompany(a.name))}&hl=pt-BR&gl=BR&ceid=BR:pt-419`],
    ['InfoMoney', `https://www.infomoney.com.br/?s=${encodeURIComponent(tk)}`]
  ];
  if (a.market === 'b3') {
    const pasta = { fii: 'fiis', etf: 'etfs', bdr: 'bdrs' }[a.assetType] || 'acoes';
    links.push(['Investidor10', `https://investidor10.com.br/${pasta}/${baixo}/`]);
  } else if (a.market === 'us') {
    links.push(['Investidor10', `https://investidor10.com.br/stocks/${baixo}/`]);
  }
  links.push(['Yahoo Finance', `https://finance.yahoo.com/quote/${encodeURIComponent(a.market === 'b3' ? tk + '.SA' : tk)}/news`]);
  return links;
}

function renderNewsStatus() {
  const el = document.getElementById('newsStatus');
  const btn = document.getElementById('btnNewsRefresh');
  if (btn) btn.disabled = newsLoading;
  if (!el) return;
  if (newsLoading) { el.textContent = t('news.loading'); return; }
  if (!newsCache || !newsCache.fetchedAt) { el.textContent = ''; return; }
  el.textContent = t('news.updated').replace('{t}', timeAgo(newsCache.fetchedAt)) + (newsCache.failed ? ' ' + t('news.failed') : '');
}

async function renderNews() {
  const lista = document.getElementById('newsList');
  if (!lista) return;
  await loadNewsCache();
  renderNewsStatus();
  const ativos = newsTickers();

  // Filtros
  const filtros = document.getElementById('newsFilters');
  const chip = (valor, rotulo, cor) => `<button type="button" class="news-chip ${newsUi.filter === valor ? 'active' : ''}" style="--chip:${cor || 'var(--accent)'}" onclick="setNewsFilter('${valor}')">${cor ? colorDot(cor) : ''}${escapeHtml(rotulo)}</button>`;
  filtros.innerHTML = `
    <div class="news-chips">
      ${chip('all', t('news.all'))}${chip('portfolio', t('news.portfolio'))}${chip('watch', t('news.watch'))}${chip('market', t('news.market'))}
      ${ativos.map((a) => chip('tk:' + a.ticker, a.ticker, tickerColor(a.ticker))).join('')}
    </div>
    <select id="newsLang" aria-label="${t('news.lang')}" onchange="setNewsLang(this.value)">
      <option value="all" ${newsUi.lang === 'all' ? 'selected' : ''}>${t('news.langAll')}</option>
      <option value="pt" ${newsUi.lang === 'pt' ? 'selected' : ''}>Português</option>
      <option value="en" ${newsUi.lang === 'en' ? 'selected' : ''}>English</option>
    </select>`;

  const grupo = {};
  ativos.forEach((a) => { grupo[a.ticker] = a.group; });
  const itens = (newsCache.items || []).filter((n) => {
    if (newsUi.lang !== 'all' && n.lang !== newsUi.lang) return false;
    const tags = n.tags || [];
    if (newsUi.filter === 'all') return true;
    if (newsUi.filter === 'market') return tags.includes('market');
    if (newsUi.filter === 'portfolio') return tags.some((tg) => grupo[tg] === 'portfolio');
    if (newsUi.filter === 'watch') return tags.some((tg) => grupo[tg] === 'watch');
    return tags.includes(newsUi.filter.slice(3));
  });

  if (!itens.length) {
    lista.innerHTML = `<p class="empty-state">${newsLoading ? t('news.loading') : (newsCache.items || []).length ? t('news.emptyFilter') : t('news.empty')}</p>`;
  } else {
    lista.innerHTML = itens.slice(0, 80).map((n) => {
      const tags = (n.tags || []).map((tg) => tg === 'market'
        ? `<span class="tag">${t('news.market')}</span>`
        : `<span class="tag news-tag" style="--chip:${tickerColor(tg) || 'var(--muted)'}">${colorDot(tickerColor(tg))}${escapeHtml(tg)}</span>`).join(' ');
      return `<article class="news-item">
        <a href="${escapeHtml(n.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(n.title)}</a>
        <div class="news-meta">${tags} <span>${escapeHtml(n.source || '')}</span> <span>${timeAgo(n.date)}</span>${n.lang === 'en' ? ' <span class="tag">EN</span>' : ''}</div>
      </article>`;
    }).join('');
  }

  // Atalhos fixos: funcionam mesmo se as fontes automáticas falharem
  const atalhos = document.getElementById('newsShortcuts');
  if (atalhos) {
    atalhos.innerHTML = ativos.length
      ? ativos.map((a) => `<div class="shortcut-row">
          <span class="shortcut-name">${colorDot(tickerColor(a.ticker))}<strong>${escapeHtml(a.ticker)}</strong></span>
          <span class="ext-links">${newsShortcuts(a).map(([rot, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(rot)}</a>`).join('')}</span>
        </div>`).join('')
      : `<p class="hint">${t('news.noAssets')}</p>`;
  }
}

function setNewsFilter(v) { newsUi.filter = v; renderNews(); }
function setNewsLang(v) { newsUi.lang = v; renderNews(); }


/* ----- Chaves das APIs (Configurações) ----- */
function renderApiSettings() {
  API_KEYS.forEach((k) => {
    const el = document.getElementById(k);
    if (el && el !== document.activeElement && el.dataset.dirty !== '1') el.value = state.settings[k] || '';
  });
}

async function saveApiKeys() {
  for (const k of API_KEYS) {
    const el = document.getElementById(k);
    if (!el) continue;
    const v = el.value.trim();
    state.settings[k] = v;
    el.dataset.dirty = '';
    await put('settings', { key: k, value: v });
  }
  showToast(t('api.saved'));
}

async function testApis() {
  await saveApiKeys();
  const box = document.getElementById('apiTestResult');
  const btn = document.getElementById('btnTestApi');
  if (btn) btn.disabled = true;
  box.innerHTML = `<p class="hint">${t('api.testing')}</p>`;
  const testes = [
    ['Finnhub', 'apiFinnhub', async () => {
      const q = await getJSON(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey('apiFinnhub')}`);
      if (!(Number(q.c) > 0)) throw new Error(t('mkt.noQuote'));
      return 'AAPL ' + fmtMoney(q.c, 'USD');
    }],
    ['Twelve Data', 'apiTwelve', async () => {
      const q = await getJSON(`https://api.twelvedata.com/price?symbol=AAPL&apikey=${apiKey('apiTwelve')}`);
      if (!(Number(q.price) > 0)) throw new Error(t('mkt.noQuote'));
      return 'AAPL ' + fmtMoney(Number(q.price), 'USD');
    }],
    ['brapi.dev', 'apiBrapi', async () => {
      const q = await quoteB3('PETR4');
      return 'PETR4 ' + fmtMoney(q.price, 'BRL');
    }],
    ['rss2json', null, async () => {
      const n = await fetchGoogleNews('Ibovespa', 'market');
      if (!n.length) throw new Error(t('news.empty'));
      return t('news.testOk').replace('{n}', n.length);
    }]
  ];
  const linhas = [];
  for (const [nome, chave, fn] of testes) {
    if (chave && !apiKey(chave)) { linhas.push(`<li class="amount-neutral">${nome}: ${t('api.noKey')}</li>`); continue; }
    try { linhas.push(`<li class="amount-in">${nome}: ${t('api.ok')} — ${await fn()}</li>`); }
    catch (e) { linhas.push(`<li class="amount-out">${nome}: ${escapeHtml(e.message || String(e))}</li>`); }
    box.innerHTML = `<ul class="api-list">${linhas.join('')}</ul>`;
  }
  box.innerHTML = `<ul class="api-list">${linhas.join('')}</ul>`;
  if (btn) btn.disabled = false;
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
      const preco = await fetchQuoteFor(pos.ticker, pos);
      if (preco == null) continue;
      await upsertQuote(pos.id, todayISO(), preco);
      n++;
    }
    resumoQ = n ? t('inv.updateOk').replace('{n}', n) : t('inv.updateFail');
  }
  if (watchlist().length) {
    try { await refreshWatchlist(true); } catch (e) { console.warn('Watchlist não atualizada:', e); }
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
        <td>${colorDot(pos.color)}${escapeHtml(pos.name)}${pos.ticker ? ` <span class="tag">${escapeHtml(pos.ticker)}</span>` : ''}</td>
        <td>${pos.assetType ? t('inv.ty.' + pos.assetType) : '—'}</td>
        <td>${conta ? escapeHtml(conta.name) : '—'}</td>
        <td>${pos.kind === 'quote' ? fmtQty(st.quantity) : '—'}</td>
        <td>${cot ? fmtMoney(cot.value, pos.currency) : '—'}${pos.kind === 'quote' && st.quantity > 0 ? `<br><span class="hint">${t('mkt.avgPrice')}: ${fmtMoney(st.cost / st.quantity, pos.currency)}</span>` : ''}</td>
        <td>${fmtMoney(r.cost, pos.currency)}</td>
        <td><strong>${fmtMoney(r.value, pos.currency)}</strong></td>
        <td class="${classe}">${fmtMoney(r.profit, pos.currency)} · ${r.pct.toFixed(1)}%</td>
        <td>
          <button class="secondary-btn" onclick="openPositionChart('${pos.id}')">${t('mkt.chart')}</button>
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
  renderWatchlist();
  renderCompare();
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

function openPositionModal(id, prefill) {
  const p = id ? state.positions.find((x) => x.id === id) : null;
  delete buyCtx.po;
  if (p && p.ticker) buyCtx.po = { item: { ticker: p.ticker, market: p.market, currency: p.currency, assetType: p.assetType } };
  openModal(`
    <h2>${p ? t('modal.editPosition') : t('modal.addPosition')}</h2>
    <label>${t('mkt.lookup')}</label>
    <div class="lookup-row">
      <input id="poLookup" placeholder="TTWO, PETR4, US8740541094" value="${prefill ? escapeHtml(prefill) : ''}"
        onkeydown="if(event.key==='Enter'){event.preventDefault();lookupAsset();}">
      <button id="poLookupBtn" class="secondary-btn" type="button" onclick="lookupAsset()">${t('mkt.search')}</button>
    </div>
    <p class="hint">${t('mkt.lookupHint')}</p>
    <div id="poLookupInfo" class="lookup-info hidden"></div>
    ${p ? '' : `<button type="button" id="poManualBtn" class="link-btn" onclick="unlockPositionForm(true)">${t('mkt.manual')}</button>`}
    <fieldset id="poRest" class="po-rest ${p ? '' : 'locked'}" ${p ? '' : 'disabled'}>
    <label>${t('inv.name')}</label>
    <div class="name-color">
      <input id="poName" value="${p ? escapeHtml(p.name) : ''}">
      <input id="poColor" type="color" value="${p && p.color ? p.color : nextFreeColor()}" title="${t('cmp.color')}" aria-label="${t('cmp.color')}">
    </div>
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
    <label>${t('inv.currency')}</label>
    <select id="poCurrency" onchange="updateBuyPreview('po')">
      ${CURRENCIES.map((c) => {
        const sel = p ? p.currency === c.code : c.code === state.settings.baseCurrency;
        return `<option value="${c.code}" ${sel ? 'selected' : ''}>${c.code}</option>`;
      }).join('')}
    </select>
    ${p ? '' : `
      <h3 class="section-sub">${t('mkt.firstBuy')}</h3>
      <div id="poQuoteForm">${buyFormHtml('po', state.settings.baseCurrency, 'buy')}</div>
      <div id="poValueForm" class="hidden">
        <label>${t('inv.initial')}</label>
        <input id="poInitial" type="text" inputmode="decimal">
      </div>
      <label class="checkline" id="poDeductWrap"><input type="checkbox" id="poDeduct" checked> ${t('inv.deduct')}</label>
      <p class="hint">${t('inv.deductHint')}</p>`}
    <button class="primary-btn" onclick="savePosition('${p ? p.id : ''}')">${t('modal.save')}</button>
    </fieldset>
  `);
  if (!p && !prefill) setTimeout(() => { const el = document.getElementById('poLookup'); if (el) el.focus(); }, 50);
  onPositionAccountChange();
  if (!p) updateBuyPreview('po');
  if (prefill) lookupAsset(prefill);
}

// Sem conta vinculada não há de onde descontar; e renda fixa não tem quantidade.
function onPositionAccountChange() {
  const wrapDeduz = document.getElementById('poDeductWrap');
  const conta = document.getElementById('poAccount');
  if (wrapDeduz && conta) wrapDeduz.classList.toggle('hidden', !conta.value);
  const kind = document.getElementById('poKind');
  const fq = document.getElementById('poQuoteForm');
  const fv = document.getElementById('poValueForm');
  if (kind && fq && fv) {
    fq.classList.toggle('hidden', kind.value !== 'quote');
    fv.classList.toggle('hidden', kind.value === 'quote');
  }
}

async function savePosition(id) {
  const nome = document.getElementById('poName').value.trim();
  if (!nome) { showToast(t('toast.invalidValue')); return; }
  const anterior = id ? state.positions.find((x) => x.id === id) : null;
  const ticker = document.getElementById('poTicker').value.trim().toUpperCase();
  const kind = document.getElementById('poKind').value;
  const ctx = buyCtx.po || {};
  const meta = ctx.meta && ctx.meta.ticker === ticker ? ctx.meta : null;
  const pos = {
    ...(anterior || {}),
    id: id || uid(),
    name: nome,
    accountId: document.getElementById('poAccount').value || null,
    kind,
    currency: document.getElementById('poCurrency').value,
    assetClass: document.getElementById('poClass').value,
    assetType: document.getElementById('poType').value,
    ticker,
    isin: document.getElementById('poIsin').value.trim().toUpperCase(),
    color: document.getElementById('poColor').value
  };
  if (meta) { pos.market = meta.market; pos.exchange = meta.exchange; }
  else if (!anterior || anterior.ticker !== ticker) { delete pos.market; delete pos.exchange; }

  // Primeira compra: calculada pela cotação (valor → quantidade, ou quantidade + total → preço)
  let mov = null, precoRef = null, dataRef = null;
  if (!id) {
    if (kind === 'quote') {
      const r = readBuyForm('po');
      if (r.error && r.error !== 'empty') { showToast(r.error); return; }
      if (!r.error) {
        mov = { id: uid(), positionId: pos.id, type: 'buy', date: r.date, quantity: r.qty, amount: r.amount };
        precoRef = r.price; dataRef = r.priceDate;
      }
    } else {
      const inicial = parseMoney((document.getElementById('poInitial') || {}).value);
      if (inicial != null && inicial > 0) mov = { id: uid(), positionId: pos.id, type: 'buy', date: todayISO(), quantity: 0, amount: inicial };
    }
  }

  if (id) state.positions = state.positions.map((x) => (x.id === id ? pos : x));
  else state.positions.push(pos);
  await put('positions', pos);

  if (mov) {
    // Se o dinheiro ainda está na conta vinculada, ele sai de lá — evita contar duas vezes.
    const deduz = document.getElementById('poDeduct');
    if (pos.accountId && deduz && deduz.checked) {
      const trn = {
        id: uid(), type: 'expense', date: mov.date, accountId: pos.accountId,
        category: 'investimentos', description: t('inv.buy') + ' — ' + pos.name, value: mov.amount
      };
      state.transactions.push(trn);
      await put('transactions', trn);
      mov.transactionId = trn.id;
    }
    state.invmoves.push(mov);
    await put('invmoves', mov);
    // Cotação de mercado já registrada: a posição passa a valer o preço real, não o custo
    if (precoRef) await upsertQuote(pos.id, dataRef || mov.date, precoRef);
    if (ctx.livePrice && dataRef !== todayISO()) await upsertQuote(pos.id, todayISO(), ctx.livePrice);
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
  const cotacao = pos.kind === 'quote';
  buyCtx.mv = { item: pos, price: null, livePrice: null, priceDate: null };
  const ult = positionQuoteAt(pos, todayISO());
  if (ult) { buyCtx.mv.price = Number(ult.value); buyCtx.mv.priceDate = ult.date; }
  openModal(`
    <h2>${t('modal.move')} — ${escapeHtml(pos.name)}</h2>
    ${movs.length ? `
      <table class="mini-table">
        <thead><tr><th>${t('inv.moveDate')}</th><th>${t('inv.moveType')}</th>
        ${cotacao ? `<th>${t('inv.moveQty')}</th><th>${t('mkt.unit')}</th>` : ''}
        <th>${t('inv.moveAmount')}</th><th></th></tr></thead>
        <tbody>${movs.map((m) => `<tr>
          <td>${m.date}</td>
          <td>${t(m.type === 'buy' ? 'inv.buy' : 'inv.sell')}</td>
          ${cotacao ? `<td>${fmtQty(m.quantity)}</td><td>${Number(m.quantity) > 0 ? fmtMoney(m.amount / m.quantity, pos.currency) : '—'}</td>` : ''}
          <td>${fmtMoney(m.amount, pos.currency)}</td>
          <td><button class="secondary-btn" onclick="deleteMove('${m.id}','${positionId}')">${t('modal.delete')}</button></td>
        </tr>`).join('')}</tbody>
      </table>` : `<p class="hint">${t('inv.noMoves')}</p>`}

    <label>${t('inv.moveType')}</label>
    <select id="mvType" onchange="onMoveTypeChange('${positionId}')">
      <option value="buy">${t('inv.buy')}</option>
      <option value="sell">${t('inv.sell')}</option>
    </select>
    <div id="mvForm">
      ${cotacao ? buyFormHtml('mv', pos.currency, 'buy') : `
        <label>${t('inv.moveDate')}</label>
        <input id="mvDate" type="date" value="${todayISO()}">
        <label>${t('inv.moveAmount')} (${pos.currency})</label>
        <input id="mvAmount" type="text" inputmode="decimal">`}
    </div>
    <label>${t('inv.moveAccount')}</label>
    <select id="mvAccount">
      <option value="">${t('inv.noAccount')}</option>
      ${state.accounts.map((a) => `<option value="${a.id}" ${pos.accountId === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (${a.currency})</option>`).join('')}
    </select>
    <label class="checkline"><input type="checkbox" id="mvLaunch" ${pos.accountId ? 'checked' : ''}> ${t('inv.createLaunch')}</label>
    <p class="hint">${t('inv.launchHint')}</p>
    <button class="primary-btn" onclick="saveMove('${positionId}')">${t('modal.save')}</button>
  `);
  if (cotacao) {
    updateBuyPreview('mv');
    // Cotação ao vivo para o cálculo, se houver ticker
    if (pos.ticker) {
      fetchPrice(pos).then((c) => {
        if (!buyCtx.mv || buyCtx.mv.item !== pos) return;
        buyCtx.mv.livePrice = c.price;
        const d = document.getElementById('mvDate');
        if (!d || d.value >= todayISO()) { buyCtx.mv.price = c.price; buyCtx.mv.priceDate = todayISO(); }
        updateBuyPreview('mv');
      }).catch((e) => console.warn('Cotação ao vivo', e.message));
    }
  }
}

// Troca os rótulos entre compra e venda sem perder o que já foi digitado
function onMoveTypeChange(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos || pos.kind !== 'quote') return;
  const tipo = document.getElementById('mvType').value;
  const guardar = ['Date', 'Mode', 'Amount', 'Qty', 'Total'].map((k) => [k, (document.getElementById('mv' + k) || {}).value]);
  const whole = (document.getElementById('mvWhole') || {}).checked;
  document.getElementById('mvForm').innerHTML = buyFormHtml('mv', pos.currency, tipo);
  guardar.forEach(([k, v]) => { const el = document.getElementById('mv' + k); if (el && v != null) el.value = v; });
  const w = document.getElementById('mvWhole'); if (w) w.checked = !!whole;
  updateBuyPreview('mv');
}

async function saveMove(positionId) {
  const pos = state.positions.find((x) => x.id === positionId);
  if (!pos) return;
  const tipo = document.getElementById('mvType').value;
  let data, valor, qtd = 0, precoRef = null, dataRef = null;

  if (pos.kind === 'quote') {
    const r = readBuyForm('mv');
    if (r.error) { showToast(r.error === 'empty' ? t('toast.invalidValue') : r.error); return; }
    data = r.date; valor = r.amount; qtd = r.qty; precoRef = r.price; dataRef = r.priceDate;
    if (tipo === 'sell') {
      const tem = positionStateAt(pos, data).quantity;
      if (qtd > tem + 1e-9) { showToast(t('mkt.sellTooMuch').replace('{n}', fmtQty(tem))); return; }
    }
  } else {
    data = document.getElementById('mvDate').value;
    valor = parseMoney(document.getElementById('mvAmount').value);
  }
  if (!data || valor == null || valor <= 0) { showToast(t('toast.invalidValue')); return; }

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
  if (precoRef && dataRef) await upsertQuote(positionId, dataRef, precoRef);
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
  renderApiSettings();
}

/* ---------- Modais ---------- */
function openModal(html, wide) {
  document.getElementById('modalBody').innerHTML = html;
  document.querySelector('#modal .modal-content').classList.toggle('modal-wide', !!wide);
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
    // Chaves de API não saem do navegador: um backup é fácil de compartilhar por engano
    settings: Object.fromEntries(Object.entries(state.settings).filter(([k]) => !API_KEYS.includes(k) && !k.startsWith(HIST_PREFIX)))
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
        if (k === 'ui' || API_KEYS.includes(k) || k.startsWith(HIST_PREFIX)) continue;
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

/* ---------- Navegação (Fase 10) ----------
   Abas principais agrupam as telas; grupos com mais de uma tela ganham uma
   segunda linha de sub-abas. Configurações sai da barra e vai para a engrenagem. */
const NAV_GROUPS = {
  dashboard: ['dashboard'],
  investments: ['investments'],
  registry: ['accounts', 'balances', 'budgets', 'fx', 'portfolio'],
  flows: ['transactions', 'bills'],
  news: ['news'],
  settings: ['settings']
};
function groupOf(tab) { return Object.keys(NAV_GROUPS).find((g) => NAV_GROUPS[g].includes(tab)) || 'dashboard'; }

function showTab(tab) {
  if (!document.getElementById('tab-' + tab)) tab = 'dashboard';
  const grupo = groupOf(tab);
  state.ui.lastSub[grupo] = tab;
  state.ui.tab = tab;
  document.querySelectorAll('#mainTabs .tab').forEach((b) => {
    const ativo = b.dataset.group === grupo;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-selected', ativo);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tab));
  const gear = document.getElementById('btnGear');
  if (gear) gear.classList.toggle('active', grupo === 'settings');
  renderSubTabs();
  if (tab === 'dashboard') renderNAV();
  if (tab === 'investments') renderCompare();
  if (tab === 'news') { renderNews(); refreshNews(false).catch(() => {}); }
  window.scrollTo({ top: 0 });
}

function renderSubTabs() {
  const nav = document.getElementById('subTabs');
  if (!nav) return;
  const tab = state.ui.tab || 'dashboard';
  const telas = NAV_GROUPS[groupOf(tab)];
  if (telas.length < 2) { nav.classList.add('hidden'); nav.innerHTML = ''; return; }
  nav.classList.remove('hidden');
  nav.innerHTML = telas.map((k) => `<button type="button" class="subtab ${k === tab ? 'active' : ''}" data-tab="${k}" aria-current="${k === tab ? 'page' : 'false'}">${t('tabs.' + k)}</button>`).join('');
}

function toggleGear(abrir) {
  const menu = document.getElementById('gearMenu');
  const btn = document.getElementById('btnGear');
  if (!menu || !btn) return;
  const mostrar = abrir === undefined ? menu.classList.contains('hidden') : abrir;
  menu.classList.toggle('hidden', !mostrar);
  btn.setAttribute('aria-expanded', mostrar);
}

function applyHelp() {
  const mostrar = state.settings.showHelp !== false;
  document.body.classList.toggle('hide-help', !mostrar);
  const chk = document.getElementById('helpToggle');
  if (chk) chk.checked = mostrar;
}

function renderThemeOptions() {
  const sel = document.getElementById('themeSelect');
  if (!sel) return;
  sel.innerHTML = ['default', 'dark', 'green', 'blue'].map((th) => `<option value="${th}">${t('theme.' + th)}</option>`).join('');
  sel.value = state.settings.theme || 'default';
}

function bindEvents() {
  // Os botões de idioma são recriados a cada render, então o clique é capturado
  // no contêiner, que é fixo.
  // Fase 6 — títulos a pagar e receber
  on('btnAddBill', 'click', () => openBillModal());
  on('btnAddPosition', 'click', () => openPositionModal());
  on('btnUpdateAll', 'click', updateEverything);
  // Fase 8 — mercado
  on('btnPortfolioChart', 'click', openPortfolioChart);
  on('btnWatchAdd', 'click', addToWatchlist);
  on('watchInput', 'keydown', (e) => { if (e.key === 'Enter') addToWatchlist(); });
  on('btnWatchRefresh', 'click', () => refreshWatchlist(false));
  on('btnSaveApi', 'click', saveApiKeys);
  on('btnTestApi', 'click', testApis);
  API_KEYS.forEach((k) => on(k, 'input', (e) => { e.target.dataset.dirty = '1'; }));
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
  document.querySelectorAll('#mainTabs .tab').forEach((btn) => {
    btn.addEventListener('click', () => showTab(state.ui.lastSub[btn.dataset.group] || NAV_GROUPS[btn.dataset.group][0]));
  });
  on('subTabs', 'click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (btn) showTab(btn.dataset.tab);
  });

  // Engrenagem: tema, idioma, explicações e configurações avançadas
  on('btnGear', 'click', (e) => { e.stopPropagation(); toggleGear(); });
  on('gearMenu', 'click', (e) => e.stopPropagation());
  document.addEventListener('click', () => toggleGear(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleGear(false); });
  on('btnAdvanced', 'click', () => { toggleGear(false); showTab('settings'); });
  on('helpToggle', 'change', async (e) => {
    state.settings.showHelp = e.target.checked;
    await put('settings', { key: 'showHelp', value: e.target.checked });
    applyHelp();
  });

  // Notícias
  on('btnNewsRefresh', 'click', () => refreshNews(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshNews(false).catch(() => {});
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
  renderThemeOptions();
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
  applyHelp();
  renderAll();
  showTab('dashboard');
  startNewsSchedule();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

init();
