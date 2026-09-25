/* ============================================================
   ProF Controller — Fases 1 a 15 (15: impostos; cripto na busca; tabelas por país)

   Versão: 1.0.0 (Notificações + Recorrência + Notícias)

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

const APP_VERSION = '1.1.0';

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
    'tabs.transactions': 'Entradas e saídas',
    'tabs.budgets': 'Orçamentos',
    'tabs.settings': 'Configurações avançadas',
    'dashboard.title': 'Seu Patrimônio',
    'dashboard.subtitle': 'Visão geral financeira do seu portfólio',
    'dashboard.analysis': 'Análise de Patrimônio',
    'dashboard.totalEquity': 'Financeiro Total',
    'dashboard.accounts': 'Contas',
    'dashboard.currencies': 'Moedas',
    'dashboard.baseCurrency': 'Moeda base',
    'dashboard.investments': 'Investimentos',
    'dashboard.properties': 'Imóveis',
    'dashboard.vehicles': 'Veículos',
    'dashboard.debt': 'Dívidas',
    'dashboard.nav': 'Patrimônio Líquido',
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
    'tax.applyPreset': 'Aplicar tabela sugerida de {p}',
    'tax.presetApplied': 'Tabela de {p} aplicada. Revise antes de usar.',
    'tax.note.BR': 'Brasil (PF): 15% em ações, 20% em FIIs, isenção quando as vendas de ações no mês somam até R$ 20.000. Day trade tem 20% e não é identificado pelo app.',
    'tax.note.PT': 'Portugal: mais-valias e dividendos a 28% (taxa autónoma), com opção de englobamento; ativos vendidos com menos de 1 ano podem obrigar ao englobamento em rendimentos altos.',
    'tax.note.ES': 'Espanha: base do poupança progressiva, começando em 19% e subindo por faixas de ganho. O app usa a alíquota inicial.',
    'tax.note.IT': 'Itália: 26% sobre ganhos e dividendos; títulos públicos têm alíquota menor.',
    'tax.note.DE': 'Alemanha: 25% mais solidariedade (cerca de 26,4%) e igreja quando aplicável, com isenção ANUAL por pessoa que o app não calcula.',
    'tax.note.FR': 'França: imposto único de 30% (imposto de renda mais contribuições sociais), com opção pela tabela progressiva.',
    'tax.note.IE': 'Irlanda: ganhos a 33% com isenção anual; ETFs seguem regime próprio, com 41% e tributação a cada 8 anos mesmo sem vender.',
    'tax.note.LU': 'Luxemburgo: venda de ações após 6 meses costuma ser isenta para participações pequenas; abaixo disso entra na tabela progressiva.',
    'tax.note.MT': 'Malta: ganho na venda de valores mobiliários listados costuma ser isento; para residentes não domiciliados vale o regime de remessa sobre rendimentos do exterior.',
    'tax.note.GB': 'Reino Unido: ganhos de ações a 18% ou 24% conforme a faixa, com isenção anual; dividendos têm faixas próprias.',
    'tax.note.CH': 'Suíça: ganho de capital privado costuma ser isento, mas dividendos e juros entram como renda e existe imposto sobre o patrimônio.',
    'tax.note.AD': 'Andorra: alíquota geral de 10% sobre ganhos, com isenções conforme o tamanho da participação e um mínimo anual isento.',
    'tax.note.US': 'Estados Unidos: residentes pagam 0%, 15% ou 20% em ganhos de longo prazo, mais 3,8% em rendas altas; curto prazo entra na tabela de renda. Não residentes normalmente não pagam sobre o ganho, mas sofrem retenção sobre dividendos.',
    'mkt.searchKind': 'Tipo de busca',
    'mkt.kindAuto': 'Automático',
    'mkt.kindStock': 'Ação, ETF, FII',
    'mkt.kindCrypto': 'Cripto',
    'tabs.taxes': 'Impostos',
    'tax.pageTitle': 'Impostos sobre investimentos',
    'help.taxes': 'Apuração mês a mês do imposto sobre as vendas, controle da isenção mensal, prejuízos acumulados por categoria e o resumo anual para a declaração. As regras são editáveis e valem como sugestão.',
    'tax.disclaimer': 'Cálculo sugerido com a tabela interna revisada em {d}. Regras mudam e casos específicos existem: confirme com seu contador antes de pagar ou declarar.',
    'tax.cat.stock': 'Ações',
    'tax.cat.fii': 'FIIs',
    'tax.cat.etf': 'ETFs',
    'tax.cat.bdr': 'BDRs',
    'tax.cat.foreign': 'Exterior',
    'tax.cat.fixed': 'Renda fixa',
    'tax.cat.crypto': 'Cripto',
    'tax.taxableGain': 'Ganho tributável no ano',
    'tax.exemptGain': 'Ganho isento no ano',
    'tax.taxYear': 'Imposto do ano',
    'tax.toPay': 'Ainda a pagar',
    'tax.monthly': 'Apuração mês a mês',
    'tax.month': 'Mês',
    'tax.category': 'Categoria',
    'tax.sales': 'Vendas',
    'tax.gain': 'Ganho ou prejuízo',
    'tax.lossUsed': 'Prejuízo compensado',
    'tax.base': 'Base',
    'tax.rate': 'Alíquota',
    'tax.tax': 'Imposto',
    'tax.status': 'Situação',
    'tax.exempt': 'isento',
    'tax.markPaid': 'Marcar como pago',
    'tax.paid': 'Pago',
    'tax.noSales': 'Nenhuma venda apurada neste ano.',
    'tax.losses': 'Prejuízo acumulado por categoria',
    'tax.lossCarry': 'Saldo a compensar',
    'tax.lossSeed': 'Prejuízo anterior ao app',
    'tax.lossHint': 'Preencha "prejuízo anterior ao app" se você já tinha prejuízos a compensar antes de começar a usar o ProF Controller.',
    'tax.declaration': 'Resumo para a declaração de {y}',
    'tax.declarationHint': 'Posição e custo em 31/12, para a ficha de bens e direitos. Os proventos aparecem separados por tipo.',
    'tax.costBefore': 'Custo em 31/12/{y}',
    'tax.costAfter': 'Custo em 31/12/{y}',
    'tax.noAssets': 'Sem posições ou proventos neste ano.',
    'tax.incomeNote.div': 'dividendos',
    'tax.incomeNote.jcp': 'JCP — IR retido na fonte',
    'tax.incomeNote.rend': 'rendimentos de FII',
    'tax.exportCsv': 'Exportar apuração (CSV)',
    'tax.rules': 'Regras e alíquotas',
    'tax.rulesHint': 'Tabela interna revisada em {d}. Tudo aqui é editável: ajuste conforme a orientação do seu contador.',
    'tax.ratesTitle': 'Alíquotas e isenção mensal',
    'tax.exemptLimit': 'Isenção por mês (vendas)',
    'tax.noTable': 'Não temos tabela pronta para este país. As alíquotas abaixo começam com um valor genérico: ajuste antes de usar.',
    'tax.dividends': 'Dividendos',
    'tax.divEnable': 'Calcular imposto sobre dividendos',
    'tax.divThreshold': 'Limite mensal',
    'tax.divHint': 'A tributação de dividendos no Brasil mudou recentemente. Ative só depois de confirmar a regra vigente com seu contador.',
    'tax.divFields': 'Primeiro campo: alíquota (%). Segundo: valor mensal a partir do qual incide.',
    'calc.m.tax': 'Imposto (IR)',
    'calc.irHint': 'Simule uma venda antes de fazê-la e veja quanto sobra depois do imposto.',
    'calc.irSalePrice': 'Preço de venda',
    'calc.irAvgCost': 'Custo médio',
    'calc.irOtherSales': 'Outras vendas no mesmo mês',
    'calc.irUseLoss': 'Usar prejuízo acumulado',
    'calc.irNet': 'Líquido após imposto',
    'calc.irExempt': 'Venda isenta: o total de vendas do mês está dentro do limite de {v}.',
    'calc.irOverLimit': 'O total de vendas do mês ({t}) passou do limite de isenção de {v}, então o ganho é tributado.',
    'calc.irLossAvailable': 'Você tem {v} de prejuízo acumulado que poderia abater deste ganho.',
    'ym.title': 'Você x Mercado',
    'ym.you': 'Sua carteira',
    'ym.copy': 'Copiar resumo',
    'ym.image': 'Baixar imagem',
    'ym.copied': 'Resumo copiado.',
    'ym.above': 'Sua carteira rendeu {r} sobre o investido: {d} p.p. acima do {b}.',
    'ym.below': 'Sua carteira rendeu {r} sobre o investido: {d} p.p. abaixo do {b}.',
    'ym.solo': 'Sua carteira rendeu {r} sobre o investido.',
    'ym.noCost': 'Ainda não há custo registrado para calcular a rentabilidade.',
    'ym.since': 'Desde o primeiro aporte, em {d}',
    'ym.disclaimer': 'Comparação com os mesmos aportes nas mesmas datas. Informação sobre a sua carteira, não recomendação de compra ou venda.',
    'ym.imageFoot': 'Gerado no ProF Controller — dados só no seu aparelho',
    'ym.imageDone': 'Imagem baixada.',
    'ym.imageFail': 'Não foi possível gerar a imagem.',
    'ym.i.concentration': '{a} representa {p}% da sua carteira. Concentração aumenta o risco e também o efeito de um acerto.',
    'ym.i.currency': '{p}% da carteira está em {c}. Variação cambial afeta esse total quando você converte.',
    'ym.i.cash': '{v} ({p}%) está parado em conta, sem render como investimento.',
    'ym.i.income': 'Você recebeu {v} em proventos nos últimos 12 meses, ou {p}% do que investiu.',
    'ym.i.target': '{c} está em {a}% e sua meta é {m}%. Se fizer sentido para você, o próximo aporte pode aproximar os dois.',
    'alloc.title': 'Metas e aporte inteligente',
    'alloc.intro': 'Defina quanto quer ter em cada categoria. O app mostra a diferença e sugere como dividir o próximo aporte. São lembretes, não regras: quem decide é você.',
    'alloc.category': 'Categoria',
    'alloc.value': 'Valor hoje',
    'alloc.current': 'Atual',
    'alloc.target': 'Meta',
    'alloc.gap': 'Diferença',
    'alloc.cash': 'Caixa (contas)',
    'alloc.empty': 'Cadastre posições ou contas para definir metas.',
    'alloc.hint': 'Preencha as metas para ver a diferença e a sugestão de aporte.',
    'alloc.sum': 'Suas metas somam {n}%.',
    'alloc.sumWarn': 'O ideal é chegar perto de 100%.',
    'alloc.nextAmount': 'Valor do próximo aporte',
    'alloc.reminders': 'Mostrar lembretes de meta no Dashboard',
    'alloc.suggestion': 'Uma forma de dividir {v} para se aproximar das metas:',
    'alloc.noGap': 'Todas as categorias já estão na meta ou acima dela.',
    'alloc.sugHint': 'Sugestão por categoria, nunca por ativo específico. Considere custos, prazos e seu momento antes de aportar.',
    'tax.title': 'Imposto de renda',
    'tax.askTitle': 'Quer controle de imposto de renda?',
    'tax.askText': 'O ProF Controller pode acompanhar os impostos dos seus investimentos, usando o país e a titularidade de cada conta.',
    'tax.ask1': 'Cálculo do imposto nas vendas e controle do limite de isenção.',
    'tax.ask2': 'Calculadora de IR e resumo para a declaração.',
    'tax.ask3': 'Se não quiser, o app não mostra nada disso.',
    'tax.askYes': 'Sim, quero',
    'tax.askNo': 'Não, obrigado',
    'tax.enable': 'Ativar controle de imposto de renda',
    'tax.on': 'Controle de IR ativado.',
    'tax.off': 'Controle de IR desativado.',
    'tax.settingsHint': 'Os cálculos usam o país e a titularidade (física ou jurídica) de cada conta, como sugestão editável. Não substitui seu contador.',
    'tax.soon': 'O módulo completo chega na próxima fase.',
    'accounts.holder': 'Titularidade',
    'accounts.holder.individual': 'Pessoa física',
    'accounts.holder.company': 'Pessoa jurídica',
    'accounts.country': 'País da conta',
    'accounts.countryHint': 'País e titularidade definem os impostos que o app vai sugerir na fase de tributação.',
    'country.BR': 'Brasil',
    'country.PT': 'Portugal',
    'country.MT': 'Malta',
    'country.ES': 'Espanha',
    'country.US': 'Estados Unidos',
    'country.GB': 'Reino Unido',
    'country.CH': 'Suíça',
    'country.AD': 'Andorra',
    'country.IT': 'Itália',
    'country.RS': 'Sérvia',
    'country.KY': 'Ilhas Cayman',
    'country.DE': 'Alemanha',
    'country.FR': 'França',
    'country.IE': 'Irlanda',
    'country.LU': 'Luxemburgo',
    'country.AE': 'Emirados Árabes',
    'country.UY': 'Uruguai',
    'country.AR': 'Argentina',
    'country.CL': 'Chile',
    'country.MX': 'México',
    'country.CA': 'Canadá',
    'country.JP': 'Japão',
    'country.other': 'Outro país',
    'tabs.calculator': 'Calculadora',
    'calc.title': 'Calculadora financeira',
    'help.calculator': 'Calculadora comum, simulação de juros simples e compostos, solução de qualquer variável (capital, aporte, taxa, prazo ou montante) e a simulação "e se eu tivesse comprado tal ativo naquela data".',
    'calc.m.basic': 'Comum',
    'calc.m.interest': 'Juros',
    'calc.m.solve': 'Resolver',
    'calc.m.whatif': 'E se eu tivesse comprado',
    'calc.err': 'Conta inválida',
    'calc.mode': 'Tipo de simulação',
    'calc.modeInvest': 'Investimento (você aplica)',
    'calc.modeLoan': 'Financiamento (você recebe e paga parcelas)',
    'calc.type': 'Tipo de juros',
    'calc.compound': 'Compostos',
    'calc.simple': 'Simples',
    'calc.pv': 'Valor inicial',
    'calc.pmt': 'Aporte por período',
    'calc.rate': 'Taxa',
    'calc.term': 'Prazo',
    'calc.period': 'Período',
    'calc.monthly': 'Mensal',
    'calc.yearly': 'Anual',
    'calc.perMonth': 'ao mês',
    'calc.perYear': 'ao ano',
    'calc.months': 'meses',
    'calc.years': 'anos',
    'calc.year': 'Ano',
    'calc.inflation': 'Inflação ao ano (%) — opcional',
    'calc.begin': 'Aportes no início do período',
    'calc.finalAmount': 'Montante final',
    'calc.invested': 'Total investido',
    'calc.interestEarned': 'Juros',
    'calc.realValue': 'Valor descontando a inflação',
    'calc.balance': 'Saldo',
    'calc.showTable': 'Ver tabela período a período',
    'calc.chartTitle': 'Evolução do saldo',
    'calc.rateEquiv': 'Taxas equivalentes: {m}% ao mês = {a}% ao ano.',
    'calc.fillHint': 'Preencha os campos para ver o resultado.',
    'calc.solveHint': 'Preencha quatro campos e marque qual deles o app deve calcular.',
    'calc.solveThis': 'calcular este',
    'calc.solveExample': 'Exemplo de parcelamento: escolha Financiamento, coloque o preço à vista no valor inicial, o valor da parcela no aporte, o prazo em meses, montante final zero e marque a taxa.',
    'calc.f.pv': 'Valor inicial (PV)',
    'calc.f.pmt': 'Aporte/parcela (PMT)',
    'calc.f.i': 'Taxa (i)',
    'calc.f.n': 'Prazo (n)',
    'calc.f.fv': 'Montante final (FV)',
    'calc.totalPaid': 'Total movimentado',
    'calc.noSolution': 'Não existe resultado com esses valores. Revise os campos.',
    'calc.nResult': '{n} {p} (≈ {y} anos)',
    'calc.wiHint': 'Escolha o ativo, a data e quanto teria investido. O app usa os preços reais do histórico.',
    'calc.wiDate': 'Data da compra',
    'calc.wiAmount': 'Valor investido',
    'calc.wiMonthly': 'Aporte mensal desde então — opcional',
    'calc.wiSearchFirst': 'Busque um ativo para simular.',
    'calc.wiFutureDate': 'Escolha uma data passada.',
    'calc.wiNoHistory': 'Sem preço no histórico gratuito para {d}. Tente uma data mais recente ou outro ativo.',
    'calc.wiBought': 'Teria comprado',
    'calc.wiToday': 'Valeria hoje',
    'calc.wiResult': 'Lucro ou prejuízo',
    'calc.wiCagr': 'Rentabilidade ao ano',
    'calc.wiDiff': 'Diferença a favor do ativo',
    'calc.wiNote': 'Simulação baseada só no preço: não considera proventos, taxas de corretagem nem imposto.',
    'calc.todayPrice': 'cotação de hoje',
    'tabs.payables': 'Contas a pagar',
    'tabs.receivables': 'Contas a receber',
    'help.payables': 'Contas que você ainda vai pagar, inclusive parceladas ou recorrentes (aluguel, financiamento, cartão). Ao quitar, o app lança a saída na conta.',
    'help.receivables': 'Valores que você ainda vai receber, inclusive parcelados ou recorrentes (aluguéis, vendas a prazo). Ao receber, o app lança a entrada na conta.',
    'bill.addPayable': '+ Nova conta a pagar',
    'bill.addReceivable': '+ Nova conta a receber',
    'b3.button': 'Importar extrato da B3',
    'b3.title': 'Importar extrato da B3',
    'b3.intro': 'Traga suas operações e proventos direto da Área do Investidor da B3. Posições são criadas com o histórico de compras e vendas; nada é lançado nas suas contas.',
    'b3.step1': 'Entre na Área do Investidor:',
    'b3.step2': 'Vá em Extratos → Movimentação (ou Negociação).',
    'b3.step3': 'Escolha o período e exporte em Excel.',
    'b3.step4': 'Selecione o arquivo abaixo. Pode importar vários anos, um de cada vez: o que já foi importado é ignorado.',
    'b3.choose': 'Escolher arquivo (.xlsx ou .csv)',
    'b3.formats': 'Extratos de Movimentação ou de Negociação da B3.',
    'b3.privacy': 'O arquivo é lido só neste aparelho. Nada é enviado para nenhum servidor.',
    'b3.reading': 'Lendo o arquivo…',
    'b3.errNotB3': 'Não reconheci um extrato da B3 neste arquivo. Use o Excel de Movimentação ou Negociação sem alterar as colunas.',
    'b3.errFile': 'Não foi possível ler o arquivo. Confira se é o .xlsx exportado pela B3.',
    'b3.errBrowser': 'Este navegador não consegue abrir .xlsx. Atualize o navegador ou exporte em CSV.',
    'b3.rows': 'Linhas lidas',
    'b3.open': 'Posições abertas',
    'b3.closedCount': 'Posições encerradas',
    'b3.income': 'Proventos',
    'b3.repeated': '{n} linha(s) já importada(s) antes foram ignoradas.',
    'b3.missingExplain': 'Alguns papéis têm vendas maiores que as compras deste arquivo: provavelmente foram comprados antes do período exportado. Importe também os extratos dos anos anteriores para o custo ficar correto.',
    'b3.selOpen': 'Só posições abertas',
    'b3.selAll': 'Selecionar todas',
    'b3.selNone': 'Limpar seleção',
    'b3.status': 'Situação',
    'b3.trades': 'Operações',
    'b3.cost': 'Custo',
    'b3.notes': 'Observações',
    'b3.new': 'Nova',
    'b3.existing': 'Já existe',
    'b3.closed': 'encerrada',
    'b3.warnMissing': 'venda de {n} sem compra no arquivo',
    'b3.warnNoPrice': '{n} entrada(s) sem preço — custo zero',
    'b3.warnManual': 'já tem {n} movimento(s) manual(is); marque só se não forem os mesmos',
    'b3.nothingNew': 'Nada novo para importar neste arquivo.',
    'b3.ignoredTitle': '{n} linha(s) não viraram operações — ver detalhes',
    'b3.ign.derivative': 'derivativos (mini-índice, mini-dólar, opções, termo) — day trade não forma posição',
    'b3.ign.custody': 'transferências de custódia entre corretoras — não mudam a quantidade',
    'b3.ign.duplicate': 'compras/vendas que já aparecem como liquidação — evitadas para não contar em dobro',
    'b3.ign.rights': 'direitos e cessões de subscrição',
    'b3.ign.lending': 'empréstimo de ativos',
    'b3.ign.review': 'eventos que precisam de revisão manual',
    'b3.ign.unknown': 'linhas não reconhecidas',
    'b3.importIncome': 'Importar também os proventos (dividendos, JCP, rendimentos)',
    'b3.account': 'Conta ou corretora das posições novas (opcional)',
    'b3.accountHint': 'Só para organizar. O histórico importado não altera o saldo da conta.',
    'b3.importN': 'Importar {n} ativo(s)',
    'b3.importing': 'Importando…',
    'b3.done': 'Importação concluída: {p} posição(ões) nova(s), {m} operação(ões) e {d} provento(s).',
    'b3.bonus': 'Bonificação/desdobro',
    'div.title': 'Proventos',
    'div.fetch': 'Buscar proventos',
    'div.fetching': 'Buscando…',
    'div.add': '+ Provento',
    'div.year': 'Recebido em {y}',
    'div.last12': 'Últimos 12 meses',
    'div.pending': 'A receber / a confirmar',
    'div.yoc': 'Yield on cost (12 meses)',
    'div.yocHint': 'Proventos de 12 meses ÷ custo atual da carteira',
    'div.fYear': 'Ano',
    'div.fStatus': 'Situação',
    'div.confirmAll': 'Confirmar todos os recebidos',
    'div.payDate': 'Pagamento',
    'div.exDate': 'data com',
    'div.tbd': 'a definir',
    'div.type': 'Tipo',
    'div.perShare': 'Por cota/ação',
    'div.amount': 'Valor',
    'div.status': 'Situação',
    'div.st.received': 'Recebido',
    'div.st.toConfirm': 'A confirmar',
    'div.st.expected': 'Previsto',
    'div.t.div': 'Dividendo',
    'div.t.jcp': 'JCP',
    'div.t.rend': 'Rendimento',
    'div.t.amort': 'Amortização',
    'div.t.other': 'Outro',
    'div.jcpNet': 'líquido de 15% de IR',
    'div.confirm': 'Confirmar',
    'div.empty': 'Nenhum provento ainda. Importe o extrato da B3 ou clique em Buscar proventos.',
    'div.noB3': 'Nenhuma posição da B3 com movimentações para buscar proventos.',
    'div.fetched': '{n} provento(s) novo(s) encontrado(s).',
    'div.noPlan': 'O plano da sua chave brapi não inclui proventos para alguns papéis; use o extrato da B3.',
    'div.someFailed': '{n} papel(éis) sem resposta.',
    'div.needPosition': 'Cadastre uma posição antes de lançar proventos.',
    'div.addTitle': 'Novo provento',
    'div.editTitle': 'Editar provento',
    'div.optional': 'opcional',
    'sec.title': 'Segurança e privacidade',
    'sec.statusOn': 'Proteção ativada',
    'sec.statusOff': 'Proteção desativada',
    'sec.offText': 'Seus dados estão guardados abertos neste navegador. Ative a proteção para exigir senha e criptografar tudo.',
    'sec.onText': 'Seus dados ficam criptografados neste aparelho e só abrem com a sua senha, o código de recuperação ou a biometria cadastrada.',
    'sec.unsupported': 'Este navegador não oferece os recursos de criptografia necessários.',
    'sec.offerTitle': 'Proteja seus dados',
    'sec.offerText': 'O ProF Controller guarda seu patrimônio só neste aparelho. Com a proteção ativada:',
    'sec.offer1': 'Tudo fica criptografado: sem a senha, ninguém lê seus dados.',
    'sec.offer2': 'Senha numérica de 4 a 10 dígitos para abrir o app.',
    'sec.offer3': 'Depois, você pode abrir com Face ID ou digital.',
    'sec.offer4': 'O app se bloqueia sozinho após alguns minutos sem uso.',
    'sec.offerWarning': 'Se esquecer a senha, só o código de recuperação abre seus dados. Nem nós conseguimos recuperá-los.',
    'sec.offerYes': 'Ativar proteção',
    'sec.offerLater': 'Agora não',
    'sec.step': 'Passo {a} de {b}',
    'sec.createTitle': 'Crie sua senha',
    'sec.newPinTitle': 'Crie uma nova senha',
    'sec.createHint': 'Use de {min} a {max} números. Recomendamos 6 ou mais: quanto maior, mais difícil de descobrir.',
    'sec.pin': 'Senha',
    'sec.pinConfirm': 'Repita a senha',
    'sec.continue': 'Continuar',
    'sec.cancel': 'Cancelar',
    'sec.back': 'Voltar',
    'sec.strength.weak': 'Fraca: aceita, mas fácil de descobrir por tentativa.',
    'sec.strength.good': 'Boa.',
    'sec.strength.strong': 'Forte.',
    'sec.err.length': 'A senha precisa ter de {min} a {max} números.',
    'sec.err.repeated': 'Evite números repetidos (ex.: 1111).',
    'sec.err.sequence': 'Evite sequências (ex.: 1234).',
    'sec.err.mismatch': 'As senhas não conferem.',
    'sec.codeTitle': 'Seu código de recuperação',
    'sec.codeHint': 'Guarde este código fora do celular: papel, gerenciador de senhas ou e-mail pessoal. Ele é a ÚNICA forma de abrir seus dados se você esquecer a senha. Ele não será mostrado de novo.',
    'sec.codeReplaced': 'Este código substitui o anterior, que deixa de funcionar. Guarde-o em local seguro.',
    'sec.copy': 'Copiar',
    'sec.saveTxt': 'Baixar .txt',
    'sec.copied': 'Código copiado.',
    'sec.copyFail': 'Não foi possível copiar; anote o código.',
    'sec.codeSaved': 'Guardei o código em local seguro',
    'sec.backupFirst': 'Baixar um backup antes de ativar (recomendado)',
    'sec.codeTxtNote': 'Guarde este arquivo em local seguro e fora deste aparelho.',
    'sec.activate': 'Ativar proteção',
    'sec.finish': 'Concluir',
    'sec.protecting': 'Protegendo…',
    'sec.encrypting': 'Criptografando seus dados… {p}%',
    'sec.activateFail': 'Não foi possível concluir. Seus dados continuam intactos. Detalhe:',
    'sec.activated': 'Proteção ativada. Seus dados estão criptografados.',
    'sec.lockedTitle': 'ProF Controller bloqueado',
    'sec.lockedHint': 'Digite sua senha para abrir.',
    'sec.unlock': 'Desbloquear',
    'sec.checking': 'Verificando…',
    'sec.useBio': 'Usar Face ID / digital',
    'sec.bioWaiting': 'Aguardando confirmação…',
    'sec.bioFail': 'Não foi possível confirmar a biometria. Use a senha.',
    'sec.wrong': 'Senha incorreta. {n} tentativa(s) antes de uma espera.',
    'sec.wrongWait': 'Senha incorreta.',
    'sec.wrongShort': 'Senha incorreta.',
    'sec.wait': 'Muitas tentativas. Aguarde {s} s.',
    'sec.forgot': 'Esqueci minha senha',
    'sec.recoverTitle': 'Recuperar acesso',
    'sec.recoverHint': 'Digite o código de recuperação que você guardou ao ativar a proteção. Depois, você cria uma nova senha.',
    'sec.recoveryCode': 'Código de recuperação',
    'sec.recWrong': 'Código ou senha incorretos.',
    'sec.bioTitle': 'Abrir com Face ID ou digital?',
    'sec.bioHint': 'Na próxima vez, confirme com o rosto ou o dedo em vez de digitar a senha. A senha continua valendo.',
    'sec.bioEnable': 'Ativar Face ID / digital',
    'sec.bioOn': 'Biometria ativada.',
    'sec.bioRemove': 'Remover biometria',
    'sec.bioRemoveConfirm': 'Remover o desbloqueio por biometria deste aparelho?',
    'sec.bioNoPrf': 'Este aparelho ou navegador não permite usar a biometria junto com a criptografia. Continue usando a senha.',
    'sec.autoLock': 'Bloquear automaticamente após',
    'sec.minutes': '{n} min sem uso',
    'sec.never': 'Nunca',
    'sec.lockNow': 'Bloquear agora',
    'sec.changePin': 'Alterar senha',
    'sec.newCode': 'Gerar novo código de recuperação',
    'sec.pinChanged': 'Senha alterada.',
    'sec.codeUpdated': 'Novo código salvo; o anterior não funciona mais.',
    'sec.confirmPin': 'Digite sua senha atual para continuar.',
    'sec.disable': 'Desativar proteção',
    'sec.disableConfirm': 'Desativar a proteção deixa seus dados abertos neste navegador. Continuar?',
    'sec.decrypting': 'Removendo a criptografia…',
    'sec.disabled': 'Proteção desativada.',
    'sec.exportEnc': 'Exportar backup protegido (recomendado)',
    'sec.encExported': 'Backup protegido exportado. Ele abre com a senha ou o código de recuperação atuais.',
    'sec.plainExportWarn': 'Este arquivo sai SEM criptografia: qualquer pessoa com ele verá seus dados. Continuar?',
    'sec.encImportTitle': 'Backup protegido',
    'sec.encImportHint': 'Digite a senha ou o código de recuperação que valiam quando este backup foi feito.',
    'apiw.title': 'Configure as fontes de cotação',
    'apiw.intro': 'O ProF Controller usa três serviços gratuitos para buscar cotações. Cada um pede uma chave, criada em poucos minutos. Sem elas, o app funciona, mas sem preços automáticos.',
    'apiw.purpose.finnhub': 'Cotações de ações dos EUA e busca de ativos pelo ISIN.',
    'apiw.purpose.twelve': 'Histórico de preços para os gráficos.',
    'apiw.purpose.brapi': 'Cotações da bolsa brasileira (B3): ações, FIIs, ETFs e BDRs.',
    'apiw.step1': 'Crie sua conta gratuita',
    'apiw.step2.finnhub': 'Copie a "API Key" no painel.',
    'apiw.step2.twelve': 'Copie a chave em "API keys".',
    'apiw.step2.brapi': 'Copie o token no painel.',
    'apiw.openDash': 'Abrir painel',
    'apiw.step3': 'Cole abaixo e clique em Testar e salvar.',
    'apiw.keyLabel': 'Chave',
    'apiw.show': 'Mostrar chave',
    'apiw.hide': 'Ocultar chave',
    'apiw.testSave': 'Testar e salvar',
    'apiw.paste': 'Cole a chave antes de testar.',
    'apiw.st.ok': 'Funcionando',
    'apiw.st.missing': 'Falta a chave',
    'apiw.st.invalid': 'Chave recusada',
    'apiw.st.error': 'Não verificada',
    'apiw.st.testing': 'Testando…',
    'apiw.rejected': 'O serviço recusou esta chave. Confira se copiou inteira ou gere uma nova no painel.',
    'apiw.timeout': 'O serviço demorou mais de 6 segundos para responder.',
    'apiw.network': 'Sem conexão com o serviço.',
    'apiw.limit': 'Limite de uso do plano gratuito atingido; tente mais tarde.',
    'apiw.unexpected': 'Resposta inesperada do serviço.',
    'apiw.savedAnyway': 'A chave foi salva e será testada de novo na próxima abertura.',
    'apiw.security': 'Chaves funcionam como senhas: ficam salvas só neste navegador e não entram no backup. Não compartilhe nem publique.',
    'apiw.allSet': 'Tudo pronto! As três fontes estão funcionando.',
    'apiw.later': 'Configurar depois',
    'apiw.finish': 'Concluir',
    'apiw.couldNotCheck': 'Não foi possível verificar {apis} agora (conexão ou limite). As cotações podem demorar.',
    'apiw.open': 'Assistente de chaves',
    'tabs.registry': 'Cadastros',
    'tabs.flows': 'Lançamentos',
    'tabs.news': 'Notícias',
    'gear.title': 'Preferências',
    'gear.open': 'Abrir preferências',
    'gear.theme': 'Tema',
    'gear.lang': 'Idioma',
    'gear.help': 'Mostrar explicações das abas',
    'gear.advanced': 'Configurações avançadas',
    'theme.default': 'Claro',
    'theme.dark': 'Escuro',
    'theme.gray': 'Cinza',
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
    'tabs.transactions': 'Money in & out',
    'tabs.budgets': 'Budgets',
    'tabs.settings': 'Advanced settings',
    'dashboard.title': 'Your Equity',
    'dashboard.subtitle': 'Financial overview of your portfolio',
    'dashboard.analysis': 'Equity Analysis',
    'dashboard.totalEquity': 'Total Financial',
    'dashboard.accounts': 'Accounts',
    'dashboard.currencies': 'Currencies',
    'dashboard.baseCurrency': 'Base currency',
    'dashboard.investments': 'Investments',
    'dashboard.properties': 'Properties',
    'dashboard.vehicles': 'Vehicles',
    'dashboard.debt': 'Debts',
    'dashboard.nav': 'Net Worth',
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
    'tax.applyPreset': 'Apply suggested table for {p}',
    'tax.presetApplied': '{p} table applied. Review before using.',
    'tax.note.BR': 'Brazil (individual): 15% on stocks, 20% on REITs, exempt when monthly stock sales stay under R$ 20,000. Day trade is 20% and the app does not identify it.',
    'tax.note.PT': 'Portugal: capital gains and dividends at a 28% flat rate, with the option to include them in the progressive table; assets sold under one year may force inclusion at high incomes.',
    'tax.note.ES': 'Spain: savings base is progressive, starting at 19% and rising by gain brackets. The app uses the first rate.',
    'tax.note.IT': 'Italy: 26% on gains and dividends; government bonds have a lower rate.',
    'tax.note.DE': 'Germany: 25% plus solidarity (about 26.4%) and church tax when applicable, with an ANNUAL personal allowance the app does not calculate.',
    'tax.note.FR': 'France: 30% flat tax (income tax plus social contributions), with the option of the progressive table.',
    'tax.note.IE': 'Ireland: gains at 33% with an annual exemption; ETFs follow a separate regime at 41%, taxed every 8 years even without selling.',
    'tax.note.LU': 'Luxembourg: selling shares after six months is usually exempt for small holdings; below that it falls into the progressive table.',
    'tax.note.MT': 'Malta: gains on listed securities are usually exempt; non-domiciled residents fall under the remittance basis for foreign income.',
    'tax.note.GB': 'United Kingdom: share gains at 18% or 24% depending on the band, with an annual exemption; dividends have their own bands.',
    'tax.note.CH': 'Switzerland: private capital gains are usually exempt, but dividends and interest count as income and there is a wealth tax.',
    'tax.note.AD': 'Andorra: general 10% rate on gains, with exemptions depending on the size of the holding and an annual exempt minimum.',
    'tax.note.US': 'United States: residents pay 0%, 15% or 20% on long-term gains, plus 3.8% at high incomes; short-term follows the income table. Non-residents usually pay no tax on the gain but face withholding on dividends.',
    'mkt.searchKind': 'Search type',
    'mkt.kindAuto': 'Automatic',
    'mkt.kindStock': 'Stock, ETF, REIT',
    'mkt.kindCrypto': 'Crypto',
    'tabs.taxes': 'Taxes',
    'tax.pageTitle': 'Investment taxes',
    'help.taxes': 'Month-by-month tax on sales, monthly exemption tracking, loss carryforward per category and the yearly summary for your tax return. Rules are editable and count as suggestions.',
    'tax.disclaimer': 'Suggested calculation using the internal table revised in {d}. Rules change and special cases exist: confirm with your accountant before paying or filing.',
    'tax.cat.stock': 'Stocks',
    'tax.cat.fii': 'REITs (FII)',
    'tax.cat.etf': 'ETFs',
    'tax.cat.bdr': 'BDRs',
    'tax.cat.foreign': 'Abroad',
    'tax.cat.fixed': 'Fixed income',
    'tax.cat.crypto': 'Crypto',
    'tax.taxableGain': 'Taxable gain this year',
    'tax.exemptGain': 'Exempt gain this year',
    'tax.taxYear': 'Tax for the year',
    'tax.toPay': 'Still to pay',
    'tax.monthly': 'Month-by-month',
    'tax.month': 'Month',
    'tax.category': 'Category',
    'tax.sales': 'Sales',
    'tax.gain': 'Gain or loss',
    'tax.lossUsed': 'Loss used',
    'tax.base': 'Base',
    'tax.rate': 'Rate',
    'tax.tax': 'Tax',
    'tax.status': 'Status',
    'tax.exempt': 'exempt',
    'tax.markPaid': 'Mark as paid',
    'tax.paid': 'Paid',
    'tax.noSales': 'No sales assessed this year.',
    'tax.losses': 'Loss carryforward per category',
    'tax.lossCarry': 'Balance to offset',
    'tax.lossSeed': 'Loss from before the app',
    'tax.lossHint': 'Fill in "loss from before the app" if you already had losses to offset before using ProF Controller.',
    'tax.declaration': 'Summary for the {y} tax return',
    'tax.declarationHint': 'Holdings and cost on 31 Dec, for the assets section. Income appears split by type.',
    'tax.costBefore': 'Cost on 31/12/{y}',
    'tax.costAfter': 'Cost on 31/12/{y}',
    'tax.noAssets': 'No holdings or income this year.',
    'tax.incomeNote.div': 'dividends',
    'tax.incomeNote.jcp': 'interest on equity — tax withheld',
    'tax.incomeNote.rend': 'fund distributions',
    'tax.exportCsv': 'Export assessment (CSV)',
    'tax.rules': 'Rules and rates',
    'tax.rulesHint': 'Internal table revised in {d}. Everything here is editable: adjust it to your accountant\u2019s guidance.',
    'tax.ratesTitle': 'Rates and monthly exemption',
    'tax.exemptLimit': 'Monthly exemption (sales)',
    'tax.noTable': 'We have no built-in table for this country. The rates below start generic: adjust before using.',
    'tax.dividends': 'Dividends',
    'tax.divEnable': 'Calculate tax on dividends',
    'tax.divThreshold': 'Monthly threshold',
    'tax.divHint': 'Dividend taxation in Brazil changed recently. Turn this on only after confirming the current rule with your accountant.',
    'tax.divFields': 'First field: rate (%). Second: monthly amount above which it applies.',
    'calc.m.tax': 'Tax',
    'calc.irHint': 'Simulate a sale before making it and see what is left after tax.',
    'calc.irSalePrice': 'Sale price',
    'calc.irAvgCost': 'Average cost',
    'calc.irOtherSales': 'Other sales in the same month',
    'calc.irUseLoss': 'Use loss carryforward',
    'calc.irNet': 'Net after tax',
    'calc.irExempt': 'Exempt sale: total sales this month are within the {v} limit.',
    'calc.irOverLimit': 'Total sales this month ({t}) exceeded the {v} exemption limit, so the gain is taxed.',
    'calc.irLossAvailable': 'You have {v} of carried losses that could offset this gain.',
    'ym.title': 'You vs the market',
    'ym.you': 'Your portfolio',
    'ym.copy': 'Copy summary',
    'ym.image': 'Download image',
    'ym.copied': 'Summary copied.',
    'ym.above': 'Your portfolio returned {r} on what you invested: {d} p.p. above {b}.',
    'ym.below': 'Your portfolio returned {r} on what you invested: {d} p.p. below {b}.',
    'ym.solo': 'Your portfolio returned {r} on what you invested.',
    'ym.noCost': 'No cost recorded yet to calculate a return.',
    'ym.since': 'Since the first contribution, on {d}',
    'ym.disclaimer': 'Comparison uses the same contributions on the same dates. Information about your portfolio, not a buy or sell recommendation.',
    'ym.imageFoot': 'Made in ProF Controller — data stays on your device',
    'ym.imageDone': 'Image downloaded.',
    'ym.imageFail': 'Could not create the image.',
    'ym.i.concentration': '{a} is {p}% of your portfolio. Concentration raises risk, and also the effect of a good call.',
    'ym.i.currency': '{p}% of the portfolio is in {c}. Exchange rates move that total when you convert.',
    'ym.i.cash': '{v} ({p}%) is sitting in accounts, not invested.',
    'ym.i.income': 'You received {v} in income over the last 12 months, or {p}% of what you invested.',
    'ym.i.target': '{c} is at {a}% and your target is {m}%. If it makes sense for you, the next contribution can close the gap.',
    'alloc.title': 'Targets and smart contribution',
    'alloc.intro': 'Set how much you want in each category. The app shows the gap and suggests how to split the next contribution. These are reminders, not rules: you decide.',
    'alloc.category': 'Category',
    'alloc.value': 'Value today',
    'alloc.current': 'Current',
    'alloc.target': 'Target',
    'alloc.gap': 'Gap',
    'alloc.cash': 'Cash (accounts)',
    'alloc.empty': 'Add positions or accounts to set targets.',
    'alloc.hint': 'Fill in targets to see the gap and the contribution suggestion.',
    'alloc.sum': 'Your targets add up to {n}%.',
    'alloc.sumWarn': 'Aim for something close to 100%.',
    'alloc.nextAmount': 'Next contribution amount',
    'alloc.reminders': 'Show target reminders on the Dashboard',
    'alloc.suggestion': 'One way to split {v} to get closer to your targets:',
    'alloc.noGap': 'Every category is already at or above its target.',
    'alloc.sugHint': 'Suggestion by category, never by specific asset. Consider costs, horizon and your situation before investing.',
    'tax.title': 'Income tax',
    'tax.askTitle': 'Do you want income tax tracking?',
    'tax.askText': 'ProF Controller can track taxes on your investments using each account\'s country and ownership.',
    'tax.ask1': 'Tax on sales and exemption-limit tracking.',
    'tax.ask2': 'Tax calculator and a summary for your return.',
    'tax.ask3': 'If you say no, none of it shows up.',
    'tax.askYes': 'Yes, please',
    'tax.askNo': 'No, thanks',
    'tax.enable': 'Turn on income tax tracking',
    'tax.on': 'Tax tracking on.',
    'tax.off': 'Tax tracking off.',
    'tax.settingsHint': 'Calculations use each account\'s country and ownership (individual or company) as an editable suggestion. It does not replace your accountant.',
    'tax.soon': 'The full module arrives in the next phase.',
    'accounts.holder': 'Held by',
    'accounts.holder.individual': 'Individual',
    'accounts.holder.company': 'Company',
    'accounts.country': 'Account country',
    'accounts.countryHint': 'Country and ownership determine the taxes the app will suggest in the tax module.',
    'country.BR': 'Brazil',
    'country.PT': 'Portugal',
    'country.MT': 'Malta',
    'country.ES': 'Spain',
    'country.US': 'United States',
    'country.GB': 'United Kingdom',
    'country.CH': 'Switzerland',
    'country.AD': 'Andorra',
    'country.IT': 'Italy',
    'country.RS': 'Serbia',
    'country.KY': 'Cayman Islands',
    'country.DE': 'Germany',
    'country.FR': 'France',
    'country.IE': 'Ireland',
    'country.LU': 'Luxembourg',
    'country.AE': 'United Arab Emirates',
    'country.UY': 'Uruguay',
    'country.AR': 'Argentina',
    'country.CL': 'Chile',
    'country.MX': 'Mexico',
    'country.CA': 'Canada',
    'country.JP': 'Japan',
    'country.other': 'Other country',
    'tabs.calculator': 'Calculator',
    'calc.title': 'Financial calculator',
    'help.calculator': 'A plain calculator, simple and compound interest simulation, solving for any variable (present value, payment, rate, term or future value) and the "what if I had bought this asset back then" simulation.',
    'calc.m.basic': 'Plain',
    'calc.m.interest': 'Interest',
    'calc.m.solve': 'Solve',
    'calc.m.whatif': 'What if I had bought',
    'calc.err': 'Invalid expression',
    'calc.mode': 'Simulation type',
    'calc.modeInvest': 'Investment (you contribute)',
    'calc.modeLoan': 'Loan (you receive and pay instalments)',
    'calc.type': 'Interest type',
    'calc.compound': 'Compound',
    'calc.simple': 'Simple',
    'calc.pv': 'Initial amount',
    'calc.pmt': 'Contribution per period',
    'calc.rate': 'Rate',
    'calc.term': 'Term',
    'calc.period': 'Period',
    'calc.monthly': 'Monthly',
    'calc.yearly': 'Yearly',
    'calc.perMonth': 'per month',
    'calc.perYear': 'per year',
    'calc.months': 'months',
    'calc.years': 'years',
    'calc.year': 'Year',
    'calc.inflation': 'Yearly inflation (%) — optional',
    'calc.begin': 'Contributions at the start of the period',
    'calc.finalAmount': 'Final amount',
    'calc.invested': 'Total invested',
    'calc.interestEarned': 'Interest',
    'calc.realValue': 'Value after inflation',
    'calc.balance': 'Balance',
    'calc.showTable': 'Show period-by-period table',
    'calc.chartTitle': 'Balance growth',
    'calc.rateEquiv': 'Equivalent rates: {m}% per month = {a}% per year.',
    'calc.fillHint': 'Fill in the fields to see the result.',
    'calc.solveHint': 'Fill in four fields and tick the one the app should calculate.',
    'calc.solveThis': 'solve for this',
    'calc.solveExample': 'Instalment example: choose Loan, put the cash price as initial amount, the instalment as contribution, the term in months, zero future value and tick the rate.',
    'calc.f.pv': 'Present value (PV)',
    'calc.f.pmt': 'Payment (PMT)',
    'calc.f.i': 'Rate (i)',
    'calc.f.n': 'Term (n)',
    'calc.f.fv': 'Future value (FV)',
    'calc.totalPaid': 'Total moved',
    'calc.noSolution': 'No solution with these values. Check the fields.',
    'calc.nResult': '{n} {p} (≈ {y} years)',
    'calc.wiHint': 'Pick the asset, the date and how much you would have invested. The app uses real historical prices.',
    'calc.wiDate': 'Purchase date',
    'calc.wiAmount': 'Amount invested',
    'calc.wiMonthly': 'Monthly contribution since then — optional',
    'calc.wiSearchFirst': 'Search for an asset to simulate.',
    'calc.wiFutureDate': 'Pick a past date.',
    'calc.wiNoHistory': 'No free-plan price for {d}. Try a more recent date or another asset.',
    'calc.wiBought': 'You would have bought',
    'calc.wiToday': 'Worth today',
    'calc.wiResult': 'Gain or loss',
    'calc.wiCagr': 'Return per year',
    'calc.wiDiff': 'Difference in favour of the asset',
    'calc.wiNote': 'Price-only simulation: it ignores dividends, brokerage fees and taxes.',
    'calc.todayPrice': 'today\'s price',
    'tabs.payables': 'Bills to pay',
    'tabs.receivables': 'Amounts to receive',
    'help.payables': 'Bills you still have to pay, including installments or recurring ones (rent, loans, credit card). When paid, the app records the outflow.',
    'help.receivables': 'Amounts you still have to receive, including installments or recurring ones (rents, credit sales). When received, the app records the inflow.',
    'bill.addPayable': '+ New bill to pay',
    'bill.addReceivable': '+ New amount to receive',
    'b3.button': 'Import B3 statement',
    'b3.title': 'Import B3 statement',
    'b3.intro': 'Bring your trades and income straight from the B3 Investor Area. Positions are created with buy and sell history; nothing is posted to your accounts.',
    'b3.step1': 'Sign in to the Investor Area:',
    'b3.step2': 'Go to Statements → Movements (or Trades).',
    'b3.step3': 'Pick the period and export to Excel.',
    'b3.step4': 'Select the file below. You can import several years, one at a time: anything already imported is skipped.',
    'b3.choose': 'Choose file (.xlsx or .csv)',
    'b3.formats': 'B3 Movements or Trades statements.',
    'b3.privacy': 'The file is read only on this device. Nothing is sent to any server.',
    'b3.reading': 'Reading file…',
    'b3.errNotB3': 'This does not look like a B3 statement. Use the Movements or Trades Excel without changing columns.',
    'b3.errFile': 'Could not read the file. Check it is the .xlsx exported by B3.',
    'b3.errBrowser': 'This browser cannot open .xlsx. Update it or export as CSV.',
    'b3.rows': 'Rows read',
    'b3.open': 'Open positions',
    'b3.closedCount': 'Closed positions',
    'b3.income': 'Income',
    'b3.repeated': '{n} row(s) imported before were skipped.',
    'b3.missingExplain': 'Some tickers have more sells than buys in this file: they were probably bought before the exported period. Import earlier years too so the cost is correct.',
    'b3.selOpen': 'Open positions only',
    'b3.selAll': 'Select all',
    'b3.selNone': 'Clear selection',
    'b3.status': 'Status',
    'b3.trades': 'Trades',
    'b3.cost': 'Cost',
    'b3.notes': 'Notes',
    'b3.new': 'New',
    'b3.existing': 'Exists',
    'b3.closed': 'closed',
    'b3.warnMissing': 'sale of {n} without a buy in the file',
    'b3.warnNoPrice': '{n} entry(ies) without price — zero cost',
    'b3.warnManual': 'already has {n} manual move(s); select only if they are not the same',
    'b3.nothingNew': 'Nothing new to import in this file.',
    'b3.ignoredTitle': '{n} row(s) did not become trades — see details',
    'b3.ign.derivative': 'derivatives (index/dollar futures, options, forwards) — day trades do not form positions',
    'b3.ign.custody': 'custody transfers between brokers — quantity unchanged',
    'b3.ign.duplicate': 'buys/sells already listed as settlement — skipped to avoid double counting',
    'b3.ign.rights': 'subscription rights and assignments',
    'b3.ign.lending': 'securities lending',
    'b3.ign.review': 'events that need manual review',
    'b3.ign.unknown': 'unrecognized rows',
    'b3.importIncome': 'Also import income (dividends, interest on equity, fund distributions)',
    'b3.account': 'Account or broker for new positions (optional)',
    'b3.accountHint': 'For organization only. Imported history does not change the account balance.',
    'b3.importN': 'Import {n} asset(s)',
    'b3.importing': 'Importing…',
    'b3.done': 'Import finished: {p} new position(s), {m} trade(s) and {d} income item(s).',
    'b3.bonus': 'Bonus/split',
    'div.title': 'Income',
    'div.fetch': 'Fetch income',
    'div.fetching': 'Fetching…',
    'div.add': '+ Income',
    'div.year': 'Received in {y}',
    'div.last12': 'Last 12 months',
    'div.pending': 'To receive / confirm',
    'div.yoc': 'Yield on cost (12 months)',
    'div.yocHint': '12-month income ÷ current portfolio cost',
    'div.fYear': 'Year',
    'div.fStatus': 'Status',
    'div.confirmAll': 'Confirm all received',
    'div.payDate': 'Payment',
    'div.exDate': 'record date',
    'div.tbd': 'to be set',
    'div.type': 'Type',
    'div.perShare': 'Per share',
    'div.amount': 'Amount',
    'div.status': 'Status',
    'div.st.received': 'Received',
    'div.st.toConfirm': 'To confirm',
    'div.st.expected': 'Expected',
    'div.t.div': 'Dividend',
    'div.t.jcp': 'Interest on equity',
    'div.t.rend': 'Distribution',
    'div.t.amort': 'Amortization',
    'div.t.other': 'Other',
    'div.jcpNet': 'net of 15% tax',
    'div.confirm': 'Confirm',
    'div.empty': 'No income yet. Import the B3 statement or click Fetch income.',
    'div.noB3': 'No B3 position with trades to fetch income for.',
    'div.fetched': '{n} new income item(s) found.',
    'div.noPlan': 'Your brapi key plan does not include income for some tickers; use the B3 statement.',
    'div.someFailed': '{n} ticker(s) did not respond.',
    'div.needPosition': 'Add a position before recording income.',
    'div.addTitle': 'New income',
    'div.editTitle': 'Edit income',
    'div.optional': 'optional',
    'sec.title': 'Security and privacy',
    'sec.statusOn': 'Protection on',
    'sec.statusOff': 'Protection off',
    'sec.offText': 'Your data is stored unencrypted in this browser. Turn on protection to require a PIN and encrypt everything.',
    'sec.onText': 'Your data is encrypted on this device and opens only with your PIN, recovery code or enrolled biometrics.',
    'sec.unsupported': 'This browser lacks the required encryption features.',
    'sec.offerTitle': 'Protect your data',
    'sec.offerText': 'ProF Controller keeps your net worth only on this device. With protection on:',
    'sec.offer1': 'Everything is encrypted: without the PIN, nobody can read your data.',
    'sec.offer2': 'A numeric PIN of 4 to 10 digits to open the app.',
    'sec.offer3': 'Later you can open it with Face ID or fingerprint.',
    'sec.offer4': 'The app locks itself after a few idle minutes.',
    'sec.offerWarning': 'If you forget the PIN, only the recovery code can open your data. Not even we can recover it.',
    'sec.offerYes': 'Turn on protection',
    'sec.offerLater': 'Not now',
    'sec.step': 'Step {a} of {b}',
    'sec.createTitle': 'Create your PIN',
    'sec.newPinTitle': 'Create a new PIN',
    'sec.createHint': 'Use {min} to {max} digits. We recommend 6 or more: longer is harder to guess.',
    'sec.pin': 'PIN',
    'sec.pinConfirm': 'Repeat PIN',
    'sec.continue': 'Continue',
    'sec.cancel': 'Cancel',
    'sec.back': 'Back',
    'sec.strength.weak': 'Weak: allowed, but easy to guess.',
    'sec.strength.good': 'Good.',
    'sec.strength.strong': 'Strong.',
    'sec.err.length': 'The PIN must have {min} to {max} digits.',
    'sec.err.repeated': 'Avoid repeated digits (e.g. 1111).',
    'sec.err.sequence': 'Avoid sequences (e.g. 1234).',
    'sec.err.mismatch': 'PINs do not match.',
    'sec.codeTitle': 'Your recovery code',
    'sec.codeHint': 'Keep this code off your phone: on paper, in a password manager or personal e-mail. It is the ONLY way to open your data if you forget the PIN. It will not be shown again.',
    'sec.codeReplaced': 'This code replaces the previous one, which stops working. Keep it safe.',
    'sec.copy': 'Copy',
    'sec.saveTxt': 'Download .txt',
    'sec.copied': 'Code copied.',
    'sec.copyFail': 'Could not copy; write the code down.',
    'sec.codeSaved': 'I stored the code somewhere safe',
    'sec.backupFirst': 'Download a backup before turning on (recommended)',
    'sec.codeTxtNote': 'Keep this file somewhere safe and off this device.',
    'sec.activate': 'Turn on protection',
    'sec.finish': 'Finish',
    'sec.protecting': 'Protecting…',
    'sec.encrypting': 'Encrypting your data… {p}%',
    'sec.activateFail': 'Could not finish. Your data is intact. Detail:',
    'sec.activated': 'Protection on. Your data is encrypted.',
    'sec.lockedTitle': 'ProF Controller locked',
    'sec.lockedHint': 'Enter your PIN to open.',
    'sec.unlock': 'Unlock',
    'sec.checking': 'Checking…',
    'sec.useBio': 'Use Face ID / fingerprint',
    'sec.bioWaiting': 'Waiting for confirmation…',
    'sec.bioFail': 'Biometric check failed. Use your PIN.',
    'sec.wrong': 'Wrong PIN. {n} attempt(s) left before a wait.',
    'sec.wrongWait': 'Wrong PIN.',
    'sec.wrongShort': 'Wrong PIN.',
    'sec.wait': 'Too many attempts. Wait {s} s.',
    'sec.forgot': 'I forgot my PIN',
    'sec.recoverTitle': 'Recover access',
    'sec.recoverHint': 'Enter the recovery code you saved when turning on protection. Then create a new PIN.',
    'sec.recoveryCode': 'Recovery code',
    'sec.recWrong': 'Wrong code or PIN.',
    'sec.bioTitle': 'Open with Face ID or fingerprint?',
    'sec.bioHint': 'Next time, confirm with your face or finger instead of typing the PIN. The PIN still works.',
    'sec.bioEnable': 'Turn on Face ID / fingerprint',
    'sec.bioOn': 'Biometrics on.',
    'sec.bioRemove': 'Remove biometrics',
    'sec.bioRemoveConfirm': 'Remove biometric unlock from this device?',
    'sec.bioNoPrf': 'This device or browser cannot combine biometrics with encryption. Keep using your PIN.',
    'sec.autoLock': 'Lock automatically after',
    'sec.minutes': '{n} idle min',
    'sec.never': 'Never',
    'sec.lockNow': 'Lock now',
    'sec.changePin': 'Change PIN',
    'sec.newCode': 'Generate new recovery code',
    'sec.pinChanged': 'PIN changed.',
    'sec.codeUpdated': 'New code saved; the previous one no longer works.',
    'sec.confirmPin': 'Enter your current PIN to continue.',
    'sec.disable': 'Turn off protection',
    'sec.disableConfirm': 'Turning off protection leaves your data unencrypted in this browser. Continue?',
    'sec.decrypting': 'Removing encryption…',
    'sec.disabled': 'Protection off.',
    'sec.exportEnc': 'Export protected backup (recommended)',
    'sec.encExported': 'Protected backup exported. It opens with your current PIN or recovery code.',
    'sec.plainExportWarn': 'This file is NOT encrypted: anyone who has it will see your data. Continue?',
    'sec.encImportTitle': 'Protected backup',
    'sec.encImportHint': 'Enter the PIN or recovery code that was valid when this backup was made.',
    'apiw.title': 'Set up price sources',
    'apiw.intro': 'ProF Controller uses three free services to fetch prices. Each needs a key that takes a few minutes to create. Without them the app works, but without automatic prices.',
    'apiw.purpose.finnhub': 'US stock prices and asset search by ISIN.',
    'apiw.purpose.twelve': 'Price history for charts.',
    'apiw.purpose.brapi': 'Brazilian exchange (B3) prices: stocks, REITs, ETFs and BDRs.',
    'apiw.step1': 'Create your free account',
    'apiw.step2.finnhub': 'Copy the "API Key" on the dashboard.',
    'apiw.step2.twelve': 'Copy the key under "API keys".',
    'apiw.step2.brapi': 'Copy the token on the dashboard.',
    'apiw.openDash': 'Open dashboard',
    'apiw.step3': 'Paste it below and click Test and save.',
    'apiw.keyLabel': 'Key',
    'apiw.show': 'Show key',
    'apiw.hide': 'Hide key',
    'apiw.testSave': 'Test and save',
    'apiw.paste': 'Paste the key before testing.',
    'apiw.st.ok': 'Working',
    'apiw.st.missing': 'Key missing',
    'apiw.st.invalid': 'Key rejected',
    'apiw.st.error': 'Not verified',
    'apiw.st.testing': 'Testing…',
    'apiw.rejected': 'The service rejected this key. Check it was copied in full or generate a new one.',
    'apiw.timeout': 'The service took longer than 6 seconds to respond.',
    'apiw.network': 'No connection to the service.',
    'apiw.limit': 'Free plan usage limit reached; try again later.',
    'apiw.unexpected': 'Unexpected response from the service.',
    'apiw.savedAnyway': 'The key was saved and will be tested again next time.',
    'apiw.security': 'Keys work like passwords: they are stored only in this browser and are not included in backups. Do not share or publish them.',
    'apiw.allSet': 'All set! All three sources are working.',
    'apiw.later': 'Set up later',
    'apiw.finish': 'Done',
    'apiw.couldNotCheck': 'Could not verify {apis} right now (connection or limit). Prices may be delayed.',
    'apiw.open': 'Key setup assistant',
    'tabs.registry': 'Records',
    'tabs.flows': 'Transactions',
    'tabs.news': 'News',
    'gear.title': 'Preferences',
    'gear.open': 'Open preferences',
    'gear.theme': 'Theme',
    'gear.lang': 'Language',
    'gear.help': 'Show tab explanations',
    'gear.advanced': 'Advanced settings',
    'theme.gray': 'Gray',
    'theme.dark': 'Dark',
    'theme.gta-vi': 'GTA-VI (Neon)',
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
    'tabs.transactions': 'Entradas y salidas',
    'tabs.budgets': 'Presupuestos',
    'tabs.settings': 'Configuración avanzada',
    'dashboard.title': 'Su Patrimonio',
    'dashboard.subtitle': 'Resumen financiero de su portafolio',
    'dashboard.analysis': 'Análisis de Patrimonio',
    'dashboard.totalEquity': 'Financiero Total',
    'dashboard.accounts': 'Cuentas',
    'dashboard.currencies': 'Monedas',
    'dashboard.baseCurrency': 'Moneda base',
    'dashboard.investments': 'Inversiones',
    'dashboard.properties': 'Propiedades',
    'dashboard.vehicles': 'Vehículos',
    'dashboard.debt': 'Deudas',
    'dashboard.nav': 'Patrimonio Neto',
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
    'tax.applyPreset': 'Aplicar tabla sugerida de {p}',
    'tax.presetApplied': 'Tabla de {p} aplicada. Revísala antes de usar.',
    'tax.note.BR': 'Brasil (persona física): 15% en acciones, 20% en FII, exención cuando las ventas de acciones del mes suman hasta R$ 20.000. El day trade es 20% y la app no lo identifica.',
    'tax.note.PT': 'Portugal: plusvalías y dividendos al 28% (tasa autónoma), con opción de integrarlos en la tabla progresiva; los activos vendidos antes de un año pueden obligar a ello en rentas altas.',
    'tax.note.ES': 'España: la base del ahorro es progresiva, desde el 19% y subiendo por tramos. La app usa la tasa inicial.',
    'tax.note.IT': 'Italia: 26% sobre ganancias y dividendos; la deuda pública tiene una tasa menor.',
    'tax.note.DE': 'Alemania: 25% más solidaridad (cerca del 26,4%) e impuesto eclesiástico cuando aplica, con una exención ANUAL por persona que la app no calcula.',
    'tax.note.FR': 'Francia: impuesto único del 30% (renta más contribuciones sociales), con opción por la tabla progresiva.',
    'tax.note.IE': 'Irlanda: ganancias al 33% con exención anual; los ETF siguen un régimen propio al 41%, tributando cada 8 años aunque no vendas.',
    'tax.note.LU': 'Luxemburgo: vender acciones tras seis meses suele estar exento para participaciones pequeñas; por debajo entra en la tabla progresiva.',
    'tax.note.MT': 'Malta: la ganancia por venta de valores cotizados suele estar exenta; para residentes no domiciliados rige el régimen de remesa sobre rentas del exterior.',
    'tax.note.GB': 'Reino Unido: ganancias de acciones al 18% o 24% según el tramo, con exención anual; los dividendos tienen tramos propios.',
    'tax.note.CH': 'Suiza: la ganancia de capital privada suele estar exenta, pero dividendos e intereses son renta y existe impuesto sobre el patrimonio.',
    'tax.note.AD': 'Andorra: tasa general del 10% sobre ganancias, con exenciones según el tamaño de la participación y un mínimo anual exento.',
    'tax.note.US': 'Estados Unidos: los residentes pagan 0%, 15% o 20% en ganancias de largo plazo, más 3,8% en rentas altas; el corto plazo va a la tabla de renta. Los no residentes normalmente no pagan por la ganancia, pero sufren retención sobre dividendos.',
    'mkt.searchKind': 'Tipo de búsqueda',
    'mkt.kindAuto': 'Automático',
    'mkt.kindStock': 'Acción, ETF, FII',
    'mkt.kindCrypto': 'Cripto',
    'tabs.taxes': 'Impuestos',
    'tax.pageTitle': 'Impuestos sobre inversiones',
    'help.taxes': 'Cálculo mes a mes del impuesto sobre las ventas, control de la exención mensual, pérdidas acumuladas por categoría y el resumen anual para la declaración. Las reglas son editables y valen como sugerencia.',
    'tax.disclaimer': 'Cálculo sugerido con la tabla interna revisada en {d}. Las reglas cambian y hay casos específicos: confirma con tu contador antes de pagar o declarar.',
    'tax.cat.stock': 'Acciones',
    'tax.cat.fii': 'FII',
    'tax.cat.etf': 'ETF',
    'tax.cat.bdr': 'BDR',
    'tax.cat.foreign': 'Exterior',
    'tax.cat.fixed': 'Renta fija',
    'tax.cat.crypto': 'Cripto',
    'tax.taxableGain': 'Ganancia gravable del año',
    'tax.exemptGain': 'Ganancia exenta del año',
    'tax.taxYear': 'Impuesto del año',
    'tax.toPay': 'Pendiente de pago',
    'tax.monthly': 'Cálculo mes a mes',
    'tax.month': 'Mes',
    'tax.category': 'Categoría',
    'tax.sales': 'Ventas',
    'tax.gain': 'Ganancia o pérdida',
    'tax.lossUsed': 'Pérdida compensada',
    'tax.base': 'Base',
    'tax.rate': 'Tasa',
    'tax.tax': 'Impuesto',
    'tax.status': 'Situación',
    'tax.exempt': 'exenta',
    'tax.markPaid': 'Marcar como pagado',
    'tax.paid': 'Pagado',
    'tax.noSales': 'Ninguna venta en este año.',
    'tax.losses': 'Pérdida acumulada por categoría',
    'tax.lossCarry': 'Saldo por compensar',
    'tax.lossSeed': 'Pérdida anterior a la app',
    'tax.lossHint': 'Completa "pérdida anterior a la app" si ya tenías pérdidas por compensar antes de usar ProF Controller.',
    'tax.declaration': 'Resumen para la declaración de {y}',
    'tax.declarationHint': 'Posición y costo al 31/12, para el apartado de bienes. Los rendimientos aparecen separados por tipo.',
    'tax.costBefore': 'Costo al 31/12/{y}',
    'tax.costAfter': 'Costo al 31/12/{y}',
    'tax.noAssets': 'Sin posiciones ni rendimientos este año.',
    'tax.incomeNote.div': 'dividendos',
    'tax.incomeNote.jcp': 'JCP — impuesto retenido',
    'tax.incomeNote.rend': 'rendimientos de FII',
    'tax.exportCsv': 'Exportar cálculo (CSV)',
    'tax.rules': 'Reglas y tasas',
    'tax.rulesHint': 'Tabla interna revisada en {d}. Todo es editable: ajústalo según tu contador.',
    'tax.ratesTitle': 'Tasas y exención mensual',
    'tax.exemptLimit': 'Exención por mes (ventas)',
    'tax.noTable': 'No tenemos tabla lista para este país. Las tasas de abajo empiezan genéricas: ajústalas antes de usar.',
    'tax.dividends': 'Dividendos',
    'tax.divEnable': 'Calcular impuesto sobre dividendos',
    'tax.divThreshold': 'Límite mensual',
    'tax.divHint': 'La tributación de dividendos en Brasil cambió recientemente. Actívalo solo tras confirmar la regla vigente con tu contador.',
    'tax.divFields': 'Primer campo: tasa (%). Segundo: importe mensual a partir del cual se aplica.',
    'calc.m.tax': 'Impuesto',
    'calc.irHint': 'Simula una venta antes de hacerla y ve cuánto queda después del impuesto.',
    'calc.irSalePrice': 'Precio de venta',
    'calc.irAvgCost': 'Costo medio',
    'calc.irOtherSales': 'Otras ventas en el mismo mes',
    'calc.irUseLoss': 'Usar pérdida acumulada',
    'calc.irNet': 'Neto tras impuesto',
    'calc.irExempt': 'Venta exenta: el total de ventas del mes está dentro del límite de {v}.',
    'calc.irOverLimit': 'El total de ventas del mes ({t}) superó el límite de exención de {v}, así que la ganancia tributa.',
    'calc.irLossAvailable': 'Tienes {v} de pérdida acumulada que podría compensar esta ganancia.',
    'ym.title': 'Tú vs el mercado',
    'ym.you': 'Tu cartera',
    'ym.copy': 'Copiar resumen',
    'ym.image': 'Descargar imagen',
    'ym.copied': 'Resumen copiado.',
    'ym.above': 'Tu cartera rindió {r} sobre lo invertido: {d} p.p. por encima del {b}.',
    'ym.below': 'Tu cartera rindió {r} sobre lo invertido: {d} p.p. por debajo del {b}.',
    'ym.solo': 'Tu cartera rindió {r} sobre lo invertido.',
    'ym.noCost': 'Aún no hay costo registrado para calcular la rentabilidad.',
    'ym.since': 'Desde el primer aporte, el {d}',
    'ym.disclaimer': 'Comparación con los mismos aportes en las mismas fechas. Información sobre tu cartera, no recomendación de compra o venta.',
    'ym.imageFoot': 'Hecho en ProF Controller — tus datos quedan en tu dispositivo',
    'ym.imageDone': 'Imagen descargada.',
    'ym.imageFail': 'No se pudo generar la imagen.',
    'ym.i.concentration': '{a} representa el {p}% de tu cartera. La concentración aumenta el riesgo y también el efecto de un acierto.',
    'ym.i.currency': 'El {p}% de la cartera está en {c}. El tipo de cambio afecta ese total al convertir.',
    'ym.i.cash': '{v} ({p}%) está parado en cuentas, sin invertir.',
    'ym.i.income': 'Recibiste {v} en rendimientos en los últimos 12 meses, o el {p}% de lo invertido.',
    'ym.i.target': '{c} está en {a}% y tu meta es {m}%. Si tiene sentido para ti, el próximo aporte puede acercarlos.',
    'alloc.title': 'Metas y aporte inteligente',
    'alloc.intro': 'Define cuánto quieres en cada categoría. La app muestra la diferencia y sugiere cómo repartir el próximo aporte. Son recordatorios, no reglas: decides tú.',
    'alloc.category': 'Categoría',
    'alloc.value': 'Valor hoy',
    'alloc.current': 'Actual',
    'alloc.target': 'Meta',
    'alloc.gap': 'Diferencia',
    'alloc.cash': 'Efectivo (cuentas)',
    'alloc.empty': 'Registra posiciones o cuentas para definir metas.',
    'alloc.hint': 'Completa las metas para ver la diferencia y la sugerencia de aporte.',
    'alloc.sum': 'Tus metas suman {n}%.',
    'alloc.sumWarn': 'Lo ideal es acercarse al 100%.',
    'alloc.nextAmount': 'Importe del próximo aporte',
    'alloc.reminders': 'Mostrar recordatorios de meta en el Dashboard',
    'alloc.suggestion': 'Una forma de repartir {v} para acercarte a las metas:',
    'alloc.noGap': 'Todas las categorías ya están en su meta o por encima.',
    'alloc.sugHint': 'Sugerencia por categoría, nunca por activo específico. Considera costos, plazos y tu situación antes de aportar.',
    'tax.title': 'Impuesto sobre la renta',
    'tax.askTitle': '¿Quieres control de impuestos?',
    'tax.askText': 'ProF Controller puede seguir los impuestos de tus inversiones usando el país y la titularidad de cada cuenta.',
    'tax.ask1': 'Cálculo del impuesto en las ventas y control del límite de exención.',
    'tax.ask2': 'Calculadora de impuestos y resumen para la declaración.',
    'tax.ask3': 'Si dices que no, nada de eso aparece.',
    'tax.askYes': 'Sí, quiero',
    'tax.askNo': 'No, gracias',
    'tax.enable': 'Activar control de impuestos',
    'tax.on': 'Control de impuestos activado.',
    'tax.off': 'Control de impuestos desactivado.',
    'tax.settingsHint': 'Los cálculos usan el país y la titularidad (física o jurídica) de cada cuenta como sugerencia editable. No sustituye a tu contador.',
    'tax.soon': 'El módulo completo llega en la próxima fase.',
    'accounts.holder': 'Titularidad',
    'accounts.holder.individual': 'Persona física',
    'accounts.holder.company': 'Persona jurídica',
    'accounts.country': 'País de la cuenta',
    'accounts.countryHint': 'País y titularidad definen los impuestos que la app sugerirá en el módulo de impuestos.',
    'country.BR': 'Brasil',
    'country.PT': 'Portugal',
    'country.MT': 'Malta',
    'country.ES': 'España',
    'country.US': 'Estados Unidos',
    'country.GB': 'Reino Unido',
    'country.CH': 'Suiza',
    'country.AD': 'Andorra',
    'country.IT': 'Italia',
    'country.RS': 'Serbia',
    'country.KY': 'Islas Caimán',
    'country.DE': 'Alemania',
    'country.FR': 'Francia',
    'country.IE': 'Irlanda',
    'country.LU': 'Luxemburgo',
    'country.AE': 'Emiratos Árabes',
    'country.UY': 'Uruguay',
    'country.AR': 'Argentina',
    'country.CL': 'Chile',
    'country.MX': 'México',
    'country.CA': 'Canadá',
    'country.JP': 'Japón',
    'country.other': 'Otro país',
    'tabs.calculator': 'Calculadora',
    'calc.title': 'Calculadora financiera',
    'help.calculator': 'Calculadora común, simulación de interés simple y compuesto, cálculo de cualquier variable (capital, aporte, tasa, plazo o monto) y la simulación "y si hubiera comprado tal activo en aquella fecha".',
    'calc.m.basic': 'Común',
    'calc.m.interest': 'Intereses',
    'calc.m.solve': 'Resolver',
    'calc.m.whatif': 'Y si hubiera comprado',
    'calc.err': 'Operación inválida',
    'calc.mode': 'Tipo de simulación',
    'calc.modeInvest': 'Inversión (tú aportas)',
    'calc.modeLoan': 'Financiación (recibes y pagas cuotas)',
    'calc.type': 'Tipo de interés',
    'calc.compound': 'Compuesto',
    'calc.simple': 'Simple',
    'calc.pv': 'Valor inicial',
    'calc.pmt': 'Aporte por período',
    'calc.rate': 'Tasa',
    'calc.term': 'Plazo',
    'calc.period': 'Período',
    'calc.monthly': 'Mensual',
    'calc.yearly': 'Anual',
    'calc.perMonth': 'al mes',
    'calc.perYear': 'al año',
    'calc.months': 'meses',
    'calc.years': 'años',
    'calc.year': 'Año',
    'calc.inflation': 'Inflación anual (%) — opcional',
    'calc.begin': 'Aportes al inicio del período',
    'calc.finalAmount': 'Monto final',
    'calc.invested': 'Total invertido',
    'calc.interestEarned': 'Intereses',
    'calc.realValue': 'Valor descontando la inflación',
    'calc.balance': 'Saldo',
    'calc.showTable': 'Ver tabla período a período',
    'calc.chartTitle': 'Evolución del saldo',
    'calc.rateEquiv': 'Tasas equivalentes: {m}% al mes = {a}% al año.',
    'calc.fillHint': 'Completa los campos para ver el resultado.',
    'calc.solveHint': 'Completa cuatro campos y marca cuál debe calcular la app.',
    'calc.solveThis': 'calcular este',
    'calc.solveExample': 'Ejemplo de financiación: elige Financiación, pon el precio de contado en el valor inicial, la cuota en el aporte, el plazo en meses, monto final cero y marca la tasa.',
    'calc.f.pv': 'Valor inicial (PV)',
    'calc.f.pmt': 'Aporte/cuota (PMT)',
    'calc.f.i': 'Tasa (i)',
    'calc.f.n': 'Plazo (n)',
    'calc.f.fv': 'Monto final (FV)',
    'calc.totalPaid': 'Total movido',
    'calc.noSolution': 'No hay resultado con estos valores. Revisa los campos.',
    'calc.nResult': '{n} {p} (≈ {y} años)',
    'calc.wiHint': 'Elige el activo, la fecha y cuánto habrías invertido. La app usa precios históricos reales.',
    'calc.wiDate': 'Fecha de compra',
    'calc.wiAmount': 'Importe invertido',
    'calc.wiMonthly': 'Aporte mensual desde entonces — opcional',
    'calc.wiSearchFirst': 'Busca un activo para simular.',
    'calc.wiFutureDate': 'Elige una fecha pasada.',
    'calc.wiNoHistory': 'Sin precio en el histórico gratuito para {d}. Prueba una fecha más reciente u otro activo.',
    'calc.wiBought': 'Habrías comprado',
    'calc.wiToday': 'Valdría hoy',
    'calc.wiResult': 'Ganancia o pérdida',
    'calc.wiCagr': 'Rentabilidad anual',
    'calc.wiDiff': 'Diferencia a favor del activo',
    'calc.wiNote': 'Simulación solo por precio: no considera dividendos, comisiones ni impuestos.',
    'calc.todayPrice': 'cotización de hoy',
    'tabs.payables': 'Cuentas por pagar',
    'tabs.receivables': 'Cuentas por cobrar',
    'help.payables': 'Cuentas que aún debes pagar, incluso a plazos o recurrentes (alquiler, préstamos, tarjeta). Al pagar, la app registra la salida.',
    'help.receivables': 'Importes que aún vas a cobrar, incluso a plazos o recurrentes (alquileres, ventas a plazo). Al cobrar, la app registra la entrada.',
    'bill.addPayable': '+ Nueva cuenta por pagar',
    'bill.addReceivable': '+ Nueva cuenta por cobrar',
    'b3.button': 'Importar extracto de B3',
    'b3.title': 'Importar extracto de B3',
    'b3.intro': 'Trae tus operaciones y rendimientos directamente del Área del Inversor de B3. Las posiciones se crean con el histórico de compras y ventas; nada se registra en tus cuentas.',
    'b3.step1': 'Entra al Área del Inversor:',
    'b3.step2': 'Ve a Extractos → Movimentación (o Negociación).',
    'b3.step3': 'Elige el período y exporta a Excel.',
    'b3.step4': 'Selecciona el archivo abajo. Puedes importar varios años, uno a la vez: lo ya importado se omite.',
    'b3.choose': 'Elegir archivo (.xlsx o .csv)',
    'b3.formats': 'Extractos de Movimentación o Negociación de B3.',
    'b3.privacy': 'El archivo se lee solo en este dispositivo. No se envía a ningún servidor.',
    'b3.reading': 'Leyendo el archivo…',
    'b3.errNotB3': 'No reconozco un extracto de B3 en este archivo. Usa el Excel de Movimentación o Negociación sin cambiar columnas.',
    'b3.errFile': 'No se pudo leer el archivo. Comprueba que sea el .xlsx exportado por B3.',
    'b3.errBrowser': 'Este navegador no puede abrir .xlsx. Actualízalo o exporta en CSV.',
    'b3.rows': 'Filas leídas',
    'b3.open': 'Posiciones abiertas',
    'b3.closedCount': 'Posiciones cerradas',
    'b3.income': 'Rendimientos',
    'b3.repeated': '{n} fila(s) ya importada(s) se omitieron.',
    'b3.missingExplain': 'Algunos activos tienen más ventas que compras en este archivo: probablemente se compraron antes del período exportado. Importa también los años anteriores para que el costo sea correcto.',
    'b3.selOpen': 'Solo posiciones abiertas',
    'b3.selAll': 'Seleccionar todas',
    'b3.selNone': 'Limpiar selección',
    'b3.status': 'Situación',
    'b3.trades': 'Operaciones',
    'b3.cost': 'Costo',
    'b3.notes': 'Observaciones',
    'b3.new': 'Nueva',
    'b3.existing': 'Ya existe',
    'b3.closed': 'cerrada',
    'b3.warnMissing': 'venta de {n} sin compra en el archivo',
    'b3.warnNoPrice': '{n} entrada(s) sin precio — costo cero',
    'b3.warnManual': 'ya tiene {n} movimiento(s) manual(es); marca solo si no son los mismos',
    'b3.nothingNew': 'Nada nuevo para importar en este archivo.',
    'b3.ignoredTitle': '{n} fila(s) no se convirtieron en operaciones — ver detalles',
    'b3.ign.derivative': 'derivados (mini índice, mini dólar, opciones, término) — el day trade no forma posición',
    'b3.ign.custody': 'transferencias de custodia entre corredoras — no cambian la cantidad',
    'b3.ign.duplicate': 'compras/ventas que ya aparecen como liquidación — omitidas para no contar doble',
    'b3.ign.rights': 'derechos y cesiones de suscripción',
    'b3.ign.lending': 'préstamo de valores',
    'b3.ign.review': 'eventos que requieren revisión manual',
    'b3.ign.unknown': 'filas no reconocidas',
    'b3.importIncome': 'Importar también rendimientos (dividendos, JCP, distribuciones)',
    'b3.account': 'Cuenta o corredora de las posiciones nuevas (opcional)',
    'b3.accountHint': 'Solo para organizar. El histórico importado no cambia el saldo de la cuenta.',
    'b3.importN': 'Importar {n} activo(s)',
    'b3.importing': 'Importando…',
    'b3.done': 'Importación completa: {p} posición(es) nueva(s), {m} operación(es) y {d} rendimiento(s).',
    'b3.bonus': 'Bonificación/desdoble',
    'div.title': 'Rendimientos',
    'div.fetch': 'Buscar rendimientos',
    'div.fetching': 'Buscando…',
    'div.add': '+ Rendimiento',
    'div.year': 'Recibido en {y}',
    'div.last12': 'Últimos 12 meses',
    'div.pending': 'Por cobrar / confirmar',
    'div.yoc': 'Yield on cost (12 meses)',
    'div.yocHint': 'Rendimientos de 12 meses ÷ costo actual de la cartera',
    'div.fYear': 'Año',
    'div.fStatus': 'Situación',
    'div.confirmAll': 'Confirmar todos los recibidos',
    'div.payDate': 'Pago',
    'div.exDate': 'fecha con',
    'div.tbd': 'por definir',
    'div.type': 'Tipo',
    'div.perShare': 'Por acción/cuota',
    'div.amount': 'Importe',
    'div.status': 'Situación',
    'div.st.received': 'Recibido',
    'div.st.toConfirm': 'Por confirmar',
    'div.st.expected': 'Previsto',
    'div.t.div': 'Dividendo',
    'div.t.jcp': 'JCP',
    'div.t.rend': 'Distribución',
    'div.t.amort': 'Amortización',
    'div.t.other': 'Otro',
    'div.jcpNet': 'neto del 15% de impuesto',
    'div.confirm': 'Confirmar',
    'div.empty': 'Aún no hay rendimientos. Importa el extracto de B3 o pulsa Buscar rendimientos.',
    'div.noB3': 'No hay posiciones de B3 con operaciones para buscar rendimientos.',
    'div.fetched': '{n} rendimiento(s) nuevo(s) encontrado(s).',
    'div.noPlan': 'El plan de tu clave brapi no incluye rendimientos para algunos activos; usa el extracto de B3.',
    'div.someFailed': '{n} activo(s) sin respuesta.',
    'div.needPosition': 'Registra una posición antes de anotar rendimientos.',
    'div.addTitle': 'Nuevo rendimiento',
    'div.editTitle': 'Editar rendimiento',
    'div.optional': 'opcional',
    'sec.title': 'Seguridad y privacidad',
    'sec.statusOn': 'Protección activada',
    'sec.statusOff': 'Protección desactivada',
    'sec.offText': 'Tus datos están guardados sin cifrar en este navegador. Activa la protección para exigir contraseña y cifrarlo todo.',
    'sec.onText': 'Tus datos están cifrados en este dispositivo y solo se abren con tu contraseña, el código de recuperación o la biometría registrada.',
    'sec.unsupported': 'Este navegador no ofrece las funciones de cifrado necesarias.',
    'sec.offerTitle': 'Protege tus datos',
    'sec.offerText': 'ProF Controller guarda tu patrimonio solo en este dispositivo. Con la protección activada:',
    'sec.offer1': 'Todo queda cifrado: sin la contraseña, nadie lee tus datos.',
    'sec.offer2': 'Contraseña numérica de 4 a 10 dígitos para abrir la app.',
    'sec.offer3': 'Después podrás abrir con Face ID o huella.',
    'sec.offer4': 'La app se bloquea sola tras unos minutos sin uso.',
    'sec.offerWarning': 'Si olvidas la contraseña, solo el código de recuperación abre tus datos. Ni nosotros podemos recuperarlos.',
    'sec.offerYes': 'Activar protección',
    'sec.offerLater': 'Ahora no',
    'sec.step': 'Paso {a} de {b}',
    'sec.createTitle': 'Crea tu contraseña',
    'sec.newPinTitle': 'Crea una nueva contraseña',
    'sec.createHint': 'Usa de {min} a {max} números. Recomendamos 6 o más: cuanto más larga, más difícil de adivinar.',
    'sec.pin': 'Contraseña',
    'sec.pinConfirm': 'Repite la contraseña',
    'sec.continue': 'Continuar',
    'sec.cancel': 'Cancelar',
    'sec.back': 'Volver',
    'sec.strength.weak': 'Débil: se acepta, pero es fácil de adivinar.',
    'sec.strength.good': 'Buena.',
    'sec.strength.strong': 'Fuerte.',
    'sec.err.length': 'La contraseña debe tener de {min} a {max} números.',
    'sec.err.repeated': 'Evita números repetidos (ej.: 1111).',
    'sec.err.sequence': 'Evita secuencias (ej.: 1234).',
    'sec.err.mismatch': 'Las contraseñas no coinciden.',
    'sec.codeTitle': 'Tu código de recuperación',
    'sec.codeHint': 'Guarda este código fuera del móvil: en papel, un gestor de contraseñas o tu correo personal. Es la ÚNICA forma de abrir tus datos si olvidas la contraseña. No se mostrará de nuevo.',
    'sec.codeReplaced': 'Este código sustituye al anterior, que deja de funcionar. Guárdalo en un lugar seguro.',
    'sec.copy': 'Copiar',
    'sec.saveTxt': 'Descargar .txt',
    'sec.copied': 'Código copiado.',
    'sec.copyFail': 'No se pudo copiar; anota el código.',
    'sec.codeSaved': 'Guardé el código en un lugar seguro',
    'sec.backupFirst': 'Descargar una copia antes de activar (recomendado)',
    'sec.codeTxtNote': 'Guarda este archivo en un lugar seguro y fuera de este dispositivo.',
    'sec.activate': 'Activar protección',
    'sec.finish': 'Finalizar',
    'sec.protecting': 'Protegiendo…',
    'sec.encrypting': 'Cifrando tus datos… {p}%',
    'sec.activateFail': 'No se pudo completar. Tus datos siguen intactos. Detalle:',
    'sec.activated': 'Protección activada. Tus datos están cifrados.',
    'sec.lockedTitle': 'ProF Controller bloqueado',
    'sec.lockedHint': 'Introduce tu contraseña para abrir.',
    'sec.unlock': 'Desbloquear',
    'sec.checking': 'Verificando…',
    'sec.useBio': 'Usar Face ID / huella',
    'sec.bioWaiting': 'Esperando confirmación…',
    'sec.bioFail': 'No se pudo confirmar la biometría. Usa la contraseña.',
    'sec.wrong': 'Contraseña incorrecta. {n} intento(s) antes de una espera.',
    'sec.wrongWait': 'Contraseña incorrecta.',
    'sec.wrongShort': 'Contraseña incorrecta.',
    'sec.wait': 'Demasiados intentos. Espera {s} s.',
    'sec.forgot': 'Olvidé mi contraseña',
    'sec.recoverTitle': 'Recuperar acceso',
    'sec.recoverHint': 'Introduce el código de recuperación que guardaste al activar la protección. Después crearás una nueva contraseña.',
    'sec.recoveryCode': 'Código de recuperación',
    'sec.recWrong': 'Código o contraseña incorrectos.',
    'sec.bioTitle': '¿Abrir con Face ID o huella?',
    'sec.bioHint': 'La próxima vez, confirma con tu rostro o dedo en lugar de escribir la contraseña. La contraseña sigue valiendo.',
    'sec.bioEnable': 'Activar Face ID / huella',
    'sec.bioOn': 'Biometría activada.',
    'sec.bioRemove': 'Quitar biometría',
    'sec.bioRemoveConfirm': '¿Quitar el desbloqueo por biometría de este dispositivo?',
    'sec.bioNoPrf': 'Este dispositivo o navegador no permite combinar la biometría con el cifrado. Sigue usando la contraseña.',
    'sec.autoLock': 'Bloquear automáticamente tras',
    'sec.minutes': '{n} min sin uso',
    'sec.never': 'Nunca',
    'sec.lockNow': 'Bloquear ahora',
    'sec.changePin': 'Cambiar contraseña',
    'sec.newCode': 'Generar nuevo código de recuperación',
    'sec.pinChanged': 'Contraseña cambiada.',
    'sec.codeUpdated': 'Nuevo código guardado; el anterior ya no funciona.',
    'sec.confirmPin': 'Introduce tu contraseña actual para continuar.',
    'sec.disable': 'Desactivar protección',
    'sec.disableConfirm': 'Desactivar la protección deja tus datos sin cifrar en este navegador. ¿Continuar?',
    'sec.decrypting': 'Quitando el cifrado…',
    'sec.disabled': 'Protección desactivada.',
    'sec.exportEnc': 'Exportar copia protegida (recomendado)',
    'sec.encExported': 'Copia protegida exportada. Se abre con tu contraseña o código de recuperación actuales.',
    'sec.plainExportWarn': 'Este archivo sale SIN cifrar: cualquiera que lo tenga verá tus datos. ¿Continuar?',
    'sec.encImportTitle': 'Copia protegida',
    'sec.encImportHint': 'Introduce la contraseña o el código de recuperación válidos cuando se hizo esta copia.',
    'apiw.title': 'Configura las fuentes de cotización',
    'apiw.intro': 'ProF Controller usa tres servicios gratuitos para obtener cotizaciones. Cada uno pide una clave que se crea en pocos minutos. Sin ellas la app funciona, pero sin precios automáticos.',
    'apiw.purpose.finnhub': 'Cotizaciones de acciones de EE. UU. y búsqueda por ISIN.',
    'apiw.purpose.twelve': 'Histórico de precios para los gráficos.',
    'apiw.purpose.brapi': 'Cotizaciones de la bolsa brasileña (B3): acciones, FII, ETF y BDR.',
    'apiw.step1': 'Crea tu cuenta gratuita',
    'apiw.step2.finnhub': 'Copia la "API Key" en el panel.',
    'apiw.step2.twelve': 'Copia la clave en "API keys".',
    'apiw.step2.brapi': 'Copia el token en el panel.',
    'apiw.openDash': 'Abrir panel',
    'apiw.step3': 'Pégala abajo y pulsa Probar y guardar.',
    'apiw.keyLabel': 'Clave',
    'apiw.show': 'Mostrar clave',
    'apiw.hide': 'Ocultar clave',
    'apiw.testSave': 'Probar y guardar',
    'apiw.paste': 'Pega la clave antes de probar.',
    'apiw.st.ok': 'Funcionando',
    'apiw.st.missing': 'Falta la clave',
    'apiw.st.invalid': 'Clave rechazada',
    'apiw.st.error': 'No verificada',
    'apiw.st.testing': 'Probando…',
    'apiw.rejected': 'El servicio rechazó esta clave. Comprueba que la copiaste entera o genera una nueva.',
    'apiw.timeout': 'El servicio tardó más de 6 segundos en responder.',
    'apiw.network': 'Sin conexión con el servicio.',
    'apiw.limit': 'Límite del plan gratuito alcanzado; inténtalo más tarde.',
    'apiw.unexpected': 'Respuesta inesperada del servicio.',
    'apiw.savedAnyway': 'La clave se guardó y se probará de nuevo en la próxima apertura.',
    'apiw.security': 'Las claves funcionan como contraseñas: se guardan solo en este navegador y no van en la copia de seguridad. No las compartas ni publiques.',
    'apiw.allSet': '¡Todo listo! Las tres fuentes funcionan.',
    'apiw.later': 'Configurar después',
    'apiw.finish': 'Finalizar',
    'apiw.couldNotCheck': 'No se pudo verificar {apis} ahora (conexión o límite). Las cotizaciones pueden tardar.',
    'apiw.open': 'Asistente de claves',
    'tabs.registry': 'Registros',
    'tabs.flows': 'Movimientos',
    'tabs.news': 'Noticias',
    'gear.title': 'Preferencias',
    'gear.open': 'Abrir preferencias',
    'gear.theme': 'Tema',
    'gear.lang': 'Idioma',
    'gear.help': 'Mostrar explicaciones de las pestañas',
    'gear.advanced': 'Configuración avanzada',
    'theme.default': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.gray': 'Gris',
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
const DB_VERSION = 6; // Fase 12: proventos (dividendos, JCP, rendimentos)
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
  dividends: [],
  assets: [],
  valuations: [],
  settings: { lang: 'pt-BR', theme: 'profit-c', baseCurrency: 'EUR' },
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
      // Fase 12
      if (!d.objectStoreNames.contains('dividends')) {
        const s = d.createObjectStore('dividends', { keyPath: 'id' });
        s.createIndex('positionId', 'positionId');
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
  // Configurações primeiro: entradas de cache (hist:) nem são abertas aqui
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
  state.dividends = await getAll('dividends');
  const brutos = (await rawGetAll('settings')).filter((r) => !String(r.key).startsWith(HIST_PREFIX) && r.key !== SEC_KEY);
  for (const r of brutos) {
    const s = await decodeRecord(r);
    if (s && s.key !== SEC_KEY) state.settings[s.key] = s.value;
  }
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    // Se a store ainda não existe (banco antigo), devolve vazio em vez de quebrar o app
    if (!db || !db.objectStoreNames.contains(store)) { resolve([]); return; }
    const req = tx(store, 'readonly').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  }).then(async (lista) => {
    // Com a proteção ativa, cada registro é aberto aqui; registros ainda abertos passam direto
    const out = [];
    for (const r of lista) { const v = await decodeRecord(r); if (v) out.push(v); }
    return out;
  });
}
// A criptografia acontece ANTES de abrir a transação: o IndexedDB fecha
// transações que ficam esperando outras promessas.
async function put(store, value) {
  if (!db) return;
  const registro = await encodeRecord(store, value);
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').put(registro);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function del(store, id) {
  if (!db) return;
  const chave = await storageKeyFor(store, id);
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').delete(chave);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ================= FASE 11 — Segurança: senha, criptografia e biometria =================
   Como funciona
   - Uma CHAVE DE DADOS aleatória (AES-GCM 256) criptografa cada registro do banco.
   - Essa chave nunca fica gravada aberta. Ela é guardada "embrulhada" três vezes:
       1) pela senha numérica (PBKDF2-SHA256, 600 mil iterações);
       2) pelo código de recuperação (aleatório, 160 bits);
       3) opcionalmente pela biometria (WebAuthn com extensão PRF).
   - Trocar a senha só reembrulha a chave; os dados não precisam ser refeitos.
   - Ficam abertos apenas: idioma, tema e os metadados de segurança (sem segredo),
     para a tela de bloqueio aparecer no idioma certo.
   - Os nomes das entradas de cache (ex.: histórico de um ticker) passam por HMAC,
     para não revelar quais ativos a pessoa tem.
   Limite honesto: uma senha curta pode ser descoberta por tentativa e erro por
   quem copiar o banco do aparelho. Por isso recomendamos 6 dígitos ou mais. */

const SEC_KEY = 'security';
const PLAIN_SETTINGS = ['lang', 'theme', SEC_KEY];
const PIN_ITER = 600000;
const REC_ITER = 150000;
const PIN_MIN = 4, PIN_MAX = 10;
const VAULT = { key: null, hmac: null, meta: null, unlocked: false };

const te = new TextEncoder(), tdec = new TextDecoder();
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));
function b64(buf) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

function vaultOn() { return !!(VAULT.meta && VAULT.meta.enabled); }
function cryptoSupported() { return !!(window.crypto && crypto.subtle && window.indexedDB); }

/* ----- Primitivas ----- */
async function deriveKek(segredo, salt, iteracoes) {
  const base = await crypto.subtle.importKey('raw', te.encode(segredo), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iteracoes },
    base, { name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
}
async function wrapDek(kek, dek) {
  const iv = rand(12);
  const w = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv });
  return { iv: b64(iv), w: b64(w) };
}
// Falha (OperationError) quando a senha/código está errado — o GCM detecta.
function unwrapDek(kek, embrulho) {
  return crypto.subtle.unwrapKey('raw', unb64(embrulho.w), kek, { name: 'AES-GCM', iv: unb64(embrulho.iv) },
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
async function sealBytes(key, bytes) {
  const iv = rand(12);
  const d = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { iv: b64(iv), d: b64(d) };
}
async function openBytes(key, selado) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(selado.iv) }, key, unb64(selado.d)));
}
const sealObj = async (key, obj) => sealBytes(key, te.encode(JSON.stringify(obj)));
const openObj = async (key, selado) => JSON.parse(tdec.decode(await openBytes(key, selado)));

async function loadHmac(dek, meta) {
  const raw = await openBytes(dek, meta.hk);
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

/* ----- Integração com o banco ----- */
function keyFieldOf(store) { return store === 'settings' ? 'key' : 'id'; }
function isPlainSetting(store, key) { return store === 'settings' && PLAIN_SETTINGS.includes(key); }

async function storageKeyFor(store, key) {
  if (store !== 'settings' || !vaultOn() || !VAULT.hmac || !String(key).startsWith(HIST_PREFIX)) return key;
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', VAULT.hmac, te.encode(String(key))));
  return HIST_PREFIX + '#' + [...mac.slice(0, 16)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function encodeRecord(store, value) {
  const campo = keyFieldOf(store);
  if (!vaultOn() || !VAULT.key || isPlainSetting(store, value[campo])) return value;
  return { [campo]: await storageKeyFor(store, value[campo]), _e: await sealObj(VAULT.key, value) };
}
async function decodeRecord(rec) {
  if (!rec || !rec._e) return rec;           // registro ainda aberto (antes/durante a migração)
  if (!VAULT.key) return null;               // bloqueado: não expõe nada
  return openObj(VAULT.key, rec._e);
}

function rawGetAll(store) {
  return new Promise((resolve, reject) => {
    if (!db || !db.objectStoreNames.contains(store)) { resolve([]); return; }
    const req = tx(store, 'readonly').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
function rawGet(store, key) {
  return new Promise((resolve) => {
    if (!db || !db.objectStoreNames.contains(store)) { resolve(null); return; }
    const req = tx(store, 'readonly').get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}
function rawPut(store, value) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(); return; }
    const req = tx(store, 'readwrite').put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
// Grava um lote numa transação só: ou vai tudo, ou nada.
function rawBatch(store, puts, deletes) {
  return new Promise((resolve, reject) => {
    const t2 = db.transaction(store, 'readwrite');
    const os = t2.objectStore(store);
    (deletes || []).forEach((k) => os.delete(k));
    puts.forEach((v) => os.put(v));
    t2.oncomplete = () => resolve();
    t2.onerror = () => reject(t2.error);
    t2.onabort = () => reject(t2.error || new Error('abort'));
  });
}

async function saveSecurityMeta(meta) {
  VAULT.meta = meta;
  await rawPut('settings', { key: SEC_KEY, value: meta });
}

const DATA_STORES = ['accounts', 'balances', 'transactions', 'budgets', 'fx', 'schedules', 'payments',
  'positions', 'quotes', 'invmoves', 'assets', 'valuations', 'dividends', 'settings'];

/* Criptografa (ou descriptografa) todos os registros. A leitura aceita registros
   abertos e fechados misturados, então uma interrupção no meio não perde dados:
   basta rodar de novo. */
async function reencodeAll(criptografar, aoProgresso) {
  let feito = 0;
  for (const store of DATA_STORES) {
    if (!db.objectStoreNames.contains(store)) continue;
    const campo = keyFieldOf(store);
    const brutos = await rawGetAll(store);
    const puts = [], deletes = [];
    for (const r of brutos) {
      if (store === 'settings' && PLAIN_SETTINGS.includes(r.key)) continue;
      const valor = await decodeRecord(r);
      if (!valor) continue;
      const chaveAntiga = r[campo];
      const novo = criptografar ? await encodeRecord(store, valor) : valor;
      if (novo[campo] !== chaveAntiga) deletes.push(chaveAntiga); // chave de cache mudou (HMAC)
      puts.push(novo);
    }
    await rawBatch(store, puts, deletes);
    feito++;
    if (aoProgresso) aoProgresso(feito / DATA_STORES.length);
  }
}

/* ----- Senha, código de recuperação e biometria ----- */
function pinProblem(pin) {
  if (!new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin)) return t('sec.err.length').replace('{min}', PIN_MIN).replace('{max}', PIN_MAX);
  if (/^(\d)\1+$/.test(pin)) return t('sec.err.repeated');
  const seq = '01234567890123456789', inv = '98765432109876543210';
  if (seq.includes(pin) || inv.includes(pin)) return t('sec.err.sequence');
  return '';
}
function pinStrength(pin) {
  if (pin.length >= 8) return 'strong';
  if (pin.length >= 6) return 'good';
  return 'weak';
}

const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I, que confundem ao copiar
function newRecoveryCode() {
  const bytes = rand(32);
  let s = '';
  for (let i = 0; i < 32; i++) s += B32[bytes[i] % 32];
  return s.match(/.{4}/g).join('-');
}
const normalizeRecovery = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function wrapForPin(dek, pin) {
  const salt = rand(16);
  return { salt: b64(salt), iter: PIN_ITER, ...(await wrapDek(await deriveKek(pin, salt, PIN_ITER), dek)) };
}
async function wrapForRecovery(dek, codigo) {
  const salt = rand(16);
  return { salt: b64(salt), iter: REC_ITER, ...(await wrapDek(await deriveKek(normalizeRecovery(codigo), salt, REC_ITER), dek)) };
}
async function unlockWithPin(pin) {
  const p = VAULT.meta.pin;
  return unwrapDek(await deriveKek(pin, unb64(p.salt), p.iter), p);
}
async function unlockWithRecovery(codigo) {
  const r = VAULT.meta.rec;
  return unwrapDek(await deriveKek(normalizeRecovery(codigo), unb64(r.salt), r.iter), r);
}
async function openVault(dek) {
  VAULT.key = dek;
  VAULT.hmac = await loadHmac(dek, VAULT.meta);
  VAULT.unlocked = true;
}

async function biometricAvailable() {
  try {
    return !!(window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch (e) { return false; }
}
async function prfSecret(credId, prfSalt) {
  const ass = await navigator.credentials.get({ publicKey: {
    challenge: rand(32), allowCredentials: [{ type: 'public-key', id: unb64(credId) }],
    userVerification: 'required', timeout: 60000,
    extensions: { prf: { eval: { first: unb64(prfSalt) } } }
  } });
  const out = ass.getClientExtensionResults().prf;
  if (!out || !out.results || !out.results.first) throw new Error('NO_PRF');
  return crypto.subtle.importKey('raw', out.results.first, { name: 'AES-GCM' }, false, ['wrapKey', 'unwrapKey']);
}
// Cadastra a biometria do aparelho. Sem suporte a PRF, recusa: sem ela a biometria
// seria só uma tela bonita, e a promessa de criptografia deixaria de valer.
async function enrollBiometric() {
  const prfSalt = rand(32);
  const cred = await navigator.credentials.create({ publicKey: {
    rp: { name: 'ProF Controller' },
    user: { id: rand(16), name: 'ProF Controller', displayName: 'ProF Controller' },
    challenge: rand(32),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    timeout: 60000,
    extensions: { prf: { eval: { first: prfSalt } } }
  } });
  const ext = cred.getClientExtensionResults().prf;
  if (!ext || ext.enabled === false) throw new Error('NO_PRF');
  const credId = b64(cred.rawId);
  let kek;
  if (ext.results && ext.results.first) {
    kek = await crypto.subtle.importKey('raw', ext.results.first, { name: 'AES-GCM' }, false, ['wrapKey', 'unwrapKey']);
  } else {
    kek = await prfSecret(credId, b64(prfSalt)); // alguns aparelhos só entregam na confirmação
  }
  const meta = { ...VAULT.meta, bio: { credId, prfSalt: b64(prfSalt), ...(await wrapDek(kek, VAULT.key)) } };
  await saveSecurityMeta(meta);
}
async function unlockWithBiometric() {
  const b = VAULT.meta.bio;
  return unwrapDek(await prfSecret(b.credId, b.prfSalt), b);
}

/* ----- Tentativas erradas: espera crescente (não apaga dados) ----- */
function lockWaitMs() { return Math.max(0, (VAULT.meta.lockUntil || 0) - Date.now()); }
async function registerFailure() {
  const falhas = (VAULT.meta.fails || 0) + 1;
  const espera = falhas >= 5 ? Math.min(30000 * Math.pow(2, falhas - 5), 15 * 60000) : 0;
  await saveSecurityMeta({ ...VAULT.meta, fails: falhas, lockUntil: espera ? Date.now() + espera : 0 });
}
async function clearFailures() {
  if (VAULT.meta.fails || VAULT.meta.lockUntil) await saveSecurityMeta({ ...VAULT.meta, fails: 0, lockUntil: 0 });
}

/* ----- Bloqueio automático ----- */
let lastActivity = Date.now(), hiddenAt = null, autoLockTimer = null;
function lockNow() {
  // Recarregar apaga da memória a chave e todos os dados abertos.
  VAULT.key = null; VAULT.hmac = null;
  location.reload();
}
function startAutoLock() {
  if (autoLockTimer) clearInterval(autoLockTimer);
  if (!vaultOn()) return;
  const marcar = () => { lastActivity = Date.now(); };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => document.addEventListener(ev, marcar, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    const min = Number(VAULT.meta.autoLockMin);
    if (document.visibilityState === 'hidden') hiddenAt = Date.now();
    else if (hiddenAt && min > 0 && Date.now() - hiddenAt >= min * 60000) lockNow();
  });
  autoLockTimer = setInterval(() => {
    const min = Number(VAULT.meta.autoLockMin);
    if (min > 0 && Date.now() - lastActivity >= min * 60000) lockNow();
  }, 15000);
}

/* ----- Telas (sobreposição de tela cheia) ----- */
function overlay(html) {
  const el = document.getElementById('secOverlay');
  el.innerHTML = `<div class="sec-card">${html}</div>`;
  el.classList.remove('hidden');
  document.body.classList.add('sec-open');
  return el;
}
function closeOverlay() {
  const el = document.getElementById('secOverlay');
  el.classList.add('hidden'); el.innerHTML = '';
  document.body.classList.remove('sec-open');
}
const logoHtml = () => `<img src="icon-192.png" alt="" class="sec-logo">`;
const pinInput = (id, auto) => `<input id="${id}" class="pin-input" type="password" inputmode="numeric" pattern="[0-9]*"
  maxlength="${PIN_MAX}" autocomplete="off" ${auto ? 'autofocus' : ''} aria-label="${t('sec.pin')}"
  oninput="this.value=this.value.replace(/\\D/g,'')">`;
function busy(btn, on, texto) {
  if (!btn) return;
  if (on) { btn.dataset.label = btn.textContent; btn.textContent = texto || t('sec.checking'); btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}
function setMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  if (el) { el.textContent = texto || ''; el.className = 'sec-msg ' + (tipo || ''); }
}

/* Tela de bloqueio. Resolve quando o cofre abre. */
function showLockScreen() {
  return new Promise((resolve) => {
    const temBio = !!VAULT.meta.bio;
    overlay(`
      ${logoHtml()}
      <h1>${t('sec.lockedTitle')}</h1>
      <p class="hint">${t('sec.lockedHint')}</p>
      ${pinInput('lockPin', true)}
      <button id="lockGo" class="primary-btn sec-wide" type="button">${t('sec.unlock')}</button>
      ${temBio ? `<button id="lockBio" class="secondary-btn sec-wide" type="button">${t('sec.useBio')}</button>` : ''}
      <p id="lockMsg" class="sec-msg" aria-live="polite"></p>
      <button id="lockForgot" class="link-btn" type="button">${t('sec.forgot')}</button>
    `);
    const campo = document.getElementById('lockPin');
    const tamanho = Number(VAULT.meta.pinLen) || 0;
    let contagem = null, tentandoAuto = false;
    const atualizarEspera = () => {
      const ms = lockWaitMs();
      const go = document.getElementById('lockGo');
      if (!go) { clearInterval(contagem); return; }
      if (ms > 0) {
        go.disabled = true;
        setMsg('lockMsg', t('sec.wait').replace('{s}', Math.ceil(ms / 1000)), 'amount-out');
      } else {
        clearInterval(contagem); contagem = null;
        go.disabled = false;
        if (VAULT.meta.fails >= 5) setMsg('lockMsg', '');
      }
    };
    const iniciarEspera = () => { if (!contagem && lockWaitMs() > 0) { atualizarEspera(); contagem = setInterval(atualizarEspera, 1000); } };
    iniciarEspera();

    const abrir = async (dek, pin) => {
      await openVault(dek);
      // Senha criada antes desta versão: guarda o tamanho para o desbloqueio automático
      if (pin && !VAULT.meta.pinLen) await saveSecurityMeta({ ...VAULT.meta, pinLen: pin.length, fails: 0, lockUntil: 0 });
      await clearFailures();
      closeOverlay();
      resolve();
    };
    const tentarPin = async () => {
      if (lockWaitMs() > 0) return;
      const pin = campo.value;
      if (pin.length < PIN_MIN) { setMsg('lockMsg', t('sec.err.length').replace('{min}', PIN_MIN).replace('{max}', PIN_MAX), 'amount-out'); return; }
      const btn = document.getElementById('lockGo');
      busy(btn, true);
      try {
        await abrir(await unlockWithPin(pin), pin);
      } catch (e) {
        busy(btn, false);
        await registerFailure();
        campo.value = ''; campo.focus();
        const restantes = Math.max(0, 5 - VAULT.meta.fails);
        setMsg('lockMsg', restantes > 0 ? t('sec.wrong').replace('{n}', restantes) : t('sec.wrongWait'), 'amount-out');
        iniciarEspera();
      }
    };
    document.getElementById('lockGo').addEventListener('click', tentarPin);
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') tentarPin(); });
    // Com o tamanho da senha conhecido, o app abre sozinho ao completar os dígitos
    campo.addEventListener('input', () => {
      if (!tamanho || tentandoAuto || lockWaitMs() > 0) return;
      if (campo.value.length === tamanho) {
        tentandoAuto = true;
        Promise.resolve(tentarPin()).finally(() => { tentandoAuto = false; });
      }
    });
    if (temBio) {
      document.getElementById('lockBio').addEventListener('click', async () => {
        const btn = document.getElementById('lockBio');
        busy(btn, true, t('sec.bioWaiting'));
        try { await abrir(await unlockWithBiometric()); }
        catch (e) { busy(btn, false); setMsg('lockMsg', t('sec.bioFail'), 'amount-out'); }
      });
    }
    document.getElementById('lockForgot').addEventListener('click', () => showRecoveryScreen().then(resolve));
    setTimeout(() => campo.focus(), 50);
  });
}

/* Esqueci a senha: código de recuperação → nova senha → novo código. */
function showRecoveryScreen() {
  return new Promise((resolve) => {
    overlay(`
      ${logoHtml()}
      <h1>${t('sec.recoverTitle')}</h1>
      <p class="hint">${t('sec.recoverHint')}</p>
      <input id="recCode" class="rec-input" type="text" autocomplete="off" spellcheck="false" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX-…" aria-label="${t('sec.recoveryCode')}">
      <button id="recGo" class="primary-btn sec-wide" type="button">${t('sec.continue')}</button>
      <p id="recMsg" class="sec-msg" aria-live="polite"></p>
      <button id="recBack" class="link-btn" type="button">${t('sec.back')}</button>
    `);
    document.getElementById('recBack').addEventListener('click', () => showLockScreen().then(resolve));
    const ir = async () => {
      const btn = document.getElementById('recGo');
      busy(btn, true);
      try {
        const dek = await unlockWithRecovery(document.getElementById('recCode').value);
        await openVault(dek);
        await clearFailures();
        // Com o código usado, cria senha e código novos
        await runPinAndRecoverySetup({ dek, modo: 'reset' });
        resolve();
      } catch (e) {
        busy(btn, false);
        setMsg('recMsg', t('sec.recWrong'), 'amount-out');
      }
    };
    document.getElementById('recGo').addEventListener('click', ir);
    document.getElementById('recCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') ir(); });
    setTimeout(() => document.getElementById('recCode').focus(), 50);
  });
}

/* Passos de criação de senha + código. modo: 'setup' (ativar), 'reset' (esqueci), 'change' (trocar senha). */
function runPinAndRecoverySetup({ dek, modo }) {
  return new Promise((resolve, reject) => {
    const passoSenha = () => {
      overlay(`
        ${logoHtml()}
        <p class="sec-step">${t('sec.step').replace('{a}', 1).replace('{b}', modo === 'change' ? 1 : 2)}</p>
        <h1>${t(modo === 'setup' ? 'sec.createTitle' : 'sec.newPinTitle')}</h1>
        <p class="hint">${t('sec.createHint').replace('{min}', PIN_MIN).replace('{max}', PIN_MAX)}</p>
        <label class="sec-label" for="newPin">${t('sec.pin')}</label>
        ${pinInput('newPin', true)}
        <div class="pin-meter" aria-hidden="true"><span id="pinBar"></span></div>
        <p id="pinStrength" class="sec-msg"></p>
        <label class="sec-label" for="newPin2">${t('sec.pinConfirm')}</label>
        ${pinInput('newPin2')}
        <button id="pinGo" class="primary-btn sec-wide" type="button">${t('sec.continue')}</button>
        <p id="pinMsg" class="sec-msg" aria-live="polite"></p>
        ${modo === 'reset' ? '' : `<button id="pinCancel" class="link-btn" type="button">${t('sec.cancel')}</button>`}
      `);
      const p1 = document.getElementById('newPin'), p2 = document.getElementById('newPin2');
      p1.addEventListener('input', () => {
        const nivel = p1.value ? pinStrength(p1.value) : '';
        const bar = document.getElementById('pinBar');
        bar.className = nivel; bar.style.width = { weak: '33%', good: '66%', strong: '100%' }[nivel] || '0';
        setMsg('pinStrength', nivel ? t('sec.strength.' + nivel) : '', nivel === 'weak' ? 'amount-out' : 'amount-in');
      });
      const cancelar = document.getElementById('pinCancel');
      if (cancelar) cancelar.addEventListener('click', () => { closeOverlay(); reject(new Error('CANCEL')); });
      const seguir = async () => {
        const erro = pinProblem(p1.value);
        if (erro) { setMsg('pinMsg', erro, 'amount-out'); p1.focus(); return; }
        if (p1.value !== p2.value) { setMsg('pinMsg', t('sec.err.mismatch'), 'amount-out'); p2.value = ''; p2.focus(); return; }
        const btn = document.getElementById('pinGo');
        busy(btn, true, t('sec.protecting'));
        const pinWrap = await wrapForPin(dek, p1.value);
        pinWrap.len = p1.value.length;
        if (modo === 'change') {
          await saveSecurityMeta({ ...VAULT.meta, pin: pinWrap, pinLen: p1.value.length, fails: 0, lockUntil: 0 });
          closeOverlay(); resolve(); return;
        }
        passoCodigo(pinWrap);
      };
      document.getElementById('pinGo').addEventListener('click', seguir);
      p2.addEventListener('keydown', (e) => { if (e.key === 'Enter') seguir(); });
      p1.addEventListener('keydown', (e) => { if (e.key === 'Enter') p2.focus(); });
    };

    const passoCodigo = (pinWrap) => {
      const codigo = newRecoveryCode();
      overlay(`
        ${logoHtml()}
        <p class="sec-step">${t('sec.step').replace('{a}', 2).replace('{b}', 2)}</p>
        <h1>${t('sec.codeTitle')}</h1>
        <p class="hint">${t('sec.codeHint')}</p>
        <div class="rec-code" id="recShow" tabindex="0">${codigo}</div>
        <div class="sec-row">
          <button id="codeCopy" class="secondary-btn" type="button">${t('sec.copy')}</button>
          <button id="codeSave" class="secondary-btn" type="button">${t('sec.saveTxt')}</button>
        </div>
        ${modo === 'setup' ? `<label class="checkline sec-check"><input type="checkbox" id="codeBackup" checked> ${t('sec.backupFirst')}</label>` : ''}
        <label class="checkline sec-check"><input type="checkbox" id="codeOk"> ${t('sec.codeSaved')}</label>
        <button id="codeGo" class="primary-btn sec-wide" type="button" disabled>${t(modo === 'setup' ? 'sec.activate' : 'sec.finish')}</button>
        <p id="codeMsg" class="sec-msg" aria-live="polite"></p>
      `);
      document.getElementById('codeOk').addEventListener('change', (e) => { document.getElementById('codeGo').disabled = !e.target.checked; });
      document.getElementById('codeCopy').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(codigo); setMsg('codeMsg', t('sec.copied'), 'amount-in'); }
        catch (e) { setMsg('codeMsg', t('sec.copyFail'), 'amount-out'); }
      });
      document.getElementById('codeSave').addEventListener('click', () => {
        download(`prof-controller-codigo-recuperacao.txt`, `ProF Controller\n${t('sec.recoveryCode')}: ${codigo}\n${t('sec.codeTxtNote')}\n`, 'text/plain');
      });
      document.getElementById('codeGo').addEventListener('click', async () => {
        const btn = document.getElementById('codeGo');
        busy(btn, true, t('sec.protecting'));
        try {
          const recWrap = await wrapForRecovery(dek, codigo);
          if (modo === 'setup') {
            if (document.getElementById('codeBackup').checked) await exportJSONPlain(true);
            await activateEncryption(dek, pinWrap, recWrap, (f) => setMsg('codeMsg', t('sec.encrypting').replace('{p}', Math.round(f * 100)), ''));
            await saveSecurityMeta({ ...VAULT.meta, pinLen: pinWrap.len });
          } else {
            // reset: senha e código novos; a biometria antiga deixa de valer por segurança
            await saveSecurityMeta({ ...VAULT.meta, pin: pinWrap, pinLen: pinWrap.len, rec: recWrap, bio: null, fails: 0, lockUntil: 0 });
          }
          closeOverlay();
          resolve();
        } catch (e) {
          console.error('Falha ao ativar a proteção:', e);
          busy(btn, false);
          setMsg('codeMsg', t('sec.activateFail') + ' ' + (e.message || e), 'amount-out');
        }
      });
    };
    passoSenha();
  });
}

async function activateEncryption(dek, pinWrap, recWrap, aoProgresso) {
  const hmacRaw = rand(32);
  const meta = {
    enabled: true, v: 1, createdAt: new Date().toISOString(),
    pin: pinWrap, rec: recWrap, hk: await sealBytes(dek, hmacRaw), bio: null,
    autoLockMin: 5, fails: 0, lockUntil: 0
  };
  // Metadados primeiro: se algo interromper, a chave já está salva e a leitura
  // aceita registros abertos e fechados misturados.
  await saveSecurityMeta(meta);
  await openVault(dek);
  await reencodeAll(true, aoProgresso);
}

/* ----- Oferta de ativação (primeira abertura ou "Agora não" anterior) ----- */
function offerSecuritySetup(forcar) {
  return new Promise((resolve) => {
    if (vaultOn() || !cryptoSupported()) { resolve(false); return; }
    const meta = VAULT.meta || {};
    if (!forcar && meta.snoozeUntil && Date.now() < meta.snoozeUntil) { resolve(false); return; }
    overlay(`
      ${logoHtml()}
      <h1>${t('sec.offerTitle')}</h1>
      <p>${t('sec.offerText')}</p>
      <ul class="sec-list">
        <li>🔒 ${t('sec.offer1')}</li>
        <li>🔑 ${t('sec.offer2')}</li>
        <li>👆 ${t('sec.offer3')}</li>
        <li>⏱️ ${t('sec.offer4')}</li>
      </ul>
      <p class="sec-warning">⚠️ ${t('sec.offerWarning')}</p>
      <button id="offerGo" class="primary-btn sec-wide" type="button">${t('sec.offerYes')}</button>
      <button id="offerLater" class="link-btn" type="button">${t('sec.offerLater')}</button>
    `);
    document.getElementById('offerLater').addEventListener('click', async () => {
      // Pergunta de novo em 1 dia, para não incomodar a cada abertura
      await saveSecurityMeta({ ...(VAULT.meta || {}), enabled: false, snoozeUntil: Date.now() + 86400000 });
      closeOverlay(); resolve(false);
    });
    document.getElementById('offerGo').addEventListener('click', async () => {
      const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      try {
        await runPinAndRecoverySetup({ dek, modo: 'setup' });
        await offerBiometric();
        startAutoLock();
        renderSecuritySettings();
        showToast(t('sec.activated'));
        resolve(true);
      } catch (e) {
        closeOverlay(); resolve(false);
      }
    });
  });
}

function offerBiometric() {
  return new Promise(async (resolve) => {
    if (!vaultOn() || VAULT.meta.bio || !(await biometricAvailable())) { resolve(); return; }
    overlay(`
      ${logoHtml()}
      <h1>${t('sec.bioTitle')}</h1>
      <p class="hint">${t('sec.bioHint')}</p>
      <button id="bioGo" class="primary-btn sec-wide" type="button">${t('sec.bioEnable')}</button>
      <p id="bioMsg" class="sec-msg" aria-live="polite"></p>
      <button id="bioLater" class="link-btn" type="button">${t('sec.offerLater')}</button>
    `);
    document.getElementById('bioLater').addEventListener('click', () => { closeOverlay(); resolve(); });
    document.getElementById('bioGo').addEventListener('click', async () => {
      const btn = document.getElementById('bioGo');
      busy(btn, true, t('sec.bioWaiting'));
      try {
        await enrollBiometric();
        closeOverlay(); showToast(t('sec.bioOn')); resolve();
      } catch (e) {
        busy(btn, false);
        setMsg('bioMsg', e.message === 'NO_PRF' ? t('sec.bioNoPrf') : t('sec.bioFail'), 'amount-out');
      }
    });
  });
}

/* Pede a senha atual antes de ações sensíveis. Resolve com a chave de dados. */
function askCurrentPin(titulo) {
  return new Promise((resolve, reject) => {
    openModal(`
      <h2>${titulo}</h2>
      <p class="hint">${t('sec.confirmPin')}</p>
      ${pinInput('curPin', true)}
      <button id="curGo" class="primary-btn" type="button">${t('sec.continue')}</button>
      <p id="curMsg" class="sec-msg" aria-live="polite"></p>
    `);
    const campo = document.getElementById('curPin');
    const ir = async () => {
      if (lockWaitMs() > 0) { setMsg('curMsg', t('sec.wait').replace('{s}', Math.ceil(lockWaitMs() / 1000)), 'amount-out'); return; }
      const btn = document.getElementById('curGo');
      busy(btn, true);
      try {
        const dek = await unlockWithPin(campo.value);
        await clearFailures();
        closeModal(); resolve(dek);
      } catch (e) {
        busy(btn, false);
        await registerFailure();
        campo.value = ''; campo.focus();
        setMsg('curMsg', t('sec.wrongShort'), 'amount-out');
      }
    };
    document.getElementById('curGo').addEventListener('click', ir);
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') ir(); });
    setTimeout(() => campo.focus(), 50);
  });
}

/* ----- Configurações → Segurança ----- */
function renderSecuritySettings() {
  const box = document.getElementById('securityGroup');
  const gearLock = document.getElementById('btnLockNow');
  if (gearLock) gearLock.classList.toggle('hidden', !vaultOn());
  const exportEnc = document.getElementById('btnExportEnc');
  if (exportEnc) exportEnc.classList.toggle('hidden', !vaultOn());
  if (!box) return;
  if (!cryptoSupported()) { box.innerHTML = `<h3>${t('sec.title')}</h3><p class="hint">${t('sec.unsupported')}</p>`; return; }
  if (!vaultOn()) {
    box.innerHTML = `<h3>${t('sec.title')}</h3>
      <p><span class="api-badge badge-muted">${t('sec.statusOff')}</span></p>
      <p class="hint">${t('sec.offText')}</p>
      <button type="button" class="primary-btn" onclick="offerSecuritySetup(true)">${t('sec.offerYes')}</button>`;
    return;
  }
  const m = VAULT.meta;
  box.innerHTML = `<h3>${t('sec.title')}</h3>
    <p><span class="api-badge badge-ok">${t('sec.statusOn')}</span></p>
    <p class="hint">${t('sec.onText')}</p>
    <label for="autoLockSel">${t('sec.autoLock')}</label>
    <select id="autoLockSel" onchange="setAutoLock(this.value)">
      ${[1, 5, 15, 30, 0].map((n) => `<option value="${n}" ${Number(m.autoLockMin) === n ? 'selected' : ''}>${n ? t('sec.minutes').replace('{n}', n) : t('sec.never')}</option>`).join('')}
    </select>
    <div class="sec-actions">
      <button type="button" class="secondary-btn" onclick="lockNow()">${t('sec.lockNow')}</button>
      <button type="button" class="secondary-btn" onclick="changePin()">${t('sec.changePin')}</button>
      <button type="button" class="secondary-btn" onclick="regenerateRecovery()">${t('sec.newCode')}</button>
      <button type="button" class="secondary-btn" id="bioSettingBtn" onclick="${m.bio ? 'removeBiometric()' : 'addBiometric()'}">${t(m.bio ? 'sec.bioRemove' : 'sec.bioEnable')}</button>
      <button type="button" class="secondary-btn danger-btn" onclick="disableEncryption()">${t('sec.disable')}</button>
    </div>`;
  biometricAvailable().then((ok) => { const b = document.getElementById('bioSettingBtn'); if (b && !ok && !m.bio) b.classList.add('hidden'); });
}

async function setAutoLock(v) {
  await saveSecurityMeta({ ...VAULT.meta, autoLockMin: Number(v) });
  lastActivity = Date.now();
  showToast(t('toast.saved'));
}
async function changePin() {
  try {
    const dek = await askCurrentPin(t('sec.changePin'));
    await runPinAndRecoverySetup({ dek, modo: 'change' });
    showToast(t('sec.pinChanged'));
  } catch (e) { /* cancelado */ }
}
async function regenerateRecovery() {
  let dek;
  try { dek = await askCurrentPin(t('sec.newCode')); } catch (e) { return; }
  const codigo = newRecoveryCode();
  openModal(`
    <h2>${t('sec.codeTitle')}</h2>
    <p class="hint">${t('sec.codeReplaced')}</p>
    <div class="rec-code">${codigo}</div>
    <div class="sec-row">
      <button type="button" class="secondary-btn" id="rc2Copy">${t('sec.copy')}</button>
      <button type="button" class="secondary-btn" id="rc2Save">${t('sec.saveTxt')}</button>
    </div>
    <label class="checkline"><input type="checkbox" id="rc2Ok"> ${t('sec.codeSaved')}</label>
    <button type="button" class="primary-btn" id="rc2Go" disabled>${t('sec.finish')}</button>
  `);
  document.getElementById('rc2Ok').addEventListener('change', (e) => { document.getElementById('rc2Go').disabled = !e.target.checked; });
  document.getElementById('rc2Copy').addEventListener('click', () => navigator.clipboard.writeText(codigo).then(() => showToast(t('sec.copied'))).catch(() => {}));
  document.getElementById('rc2Save').addEventListener('click', () => download('prof-controller-codigo-recuperacao.txt', `ProF Controller\n${t('sec.recoveryCode')}: ${codigo}\n${t('sec.codeTxtNote')}\n`, 'text/plain'));
  document.getElementById('rc2Go').addEventListener('click', async () => {
    await saveSecurityMeta({ ...VAULT.meta, rec: await wrapForRecovery(dek, codigo) });
    closeModal(); showToast(t('sec.codeUpdated'));
  });
}
async function addBiometric() {
  if (!VAULT.key) return;
  try { await enrollBiometric(); showToast(t('sec.bioOn')); }
  catch (e) { showToast(e.message === 'NO_PRF' ? t('sec.bioNoPrf') : t('sec.bioFail')); }
  renderSecuritySettings();
}
async function removeBiometric() {
  if (!confirm(t('sec.bioRemoveConfirm'))) return;
  await saveSecurityMeta({ ...VAULT.meta, bio: null });
  renderSecuritySettings();
}
async function disableEncryption() {
  if (!confirm(t('sec.disableConfirm'))) return;
  try { await askCurrentPin(t('sec.disable')); } catch (e) { return; }
  showToast(t('sec.decrypting'));
  await reencodeAll(false);
  VAULT.key = null; VAULT.hmac = null;
  await saveSecurityMeta({ enabled: false, snoozeUntil: Date.now() + 30 * 86400000 });
  if (autoLockTimer) clearInterval(autoLockTimer);
  renderSecuritySettings();
  showToast(t('sec.disabled'));
}

/* ----- Backup criptografado ----- */
async function exportJSONPlain(silencioso) {
  if (!silencioso && vaultOn() && !confirm(t('sec.plainExportWarn'))) return;
  await exportJSON(true);
}
async function exportEncryptedBackup() {
  if (!vaultOn() || !VAULT.key) return;
  const payload = buildBackupData();
  const arquivo = {
    format: 'prof-controller-encrypted', v: 1, exportedAt: new Date().toISOString(),
    pin: VAULT.meta.pin, rec: VAULT.meta.rec,
    data: await sealObj(VAULT.key, payload)
  };
  download(`prof-controller-backup-protegido-${todayISO()}.json`, JSON.stringify(arquivo), 'application/json');
  showToast(t('sec.encExported'));
}
// Abre um backup criptografado com a senha OU o código de recuperação da época em que foi feito.
function askBackupSecret(arquivo) {
  return new Promise((resolve, reject) => {
    openModal(`
      <h2>${t('sec.encImportTitle')}</h2>
      <p class="hint">${t('sec.encImportHint')}</p>
      <input id="bkSecret" type="password" autocomplete="off" spellcheck="false" aria-label="${t('sec.encImportTitle')}">
      <button id="bkGo" class="primary-btn" type="button">${t('sec.continue')}</button>
      <p id="bkMsg" class="sec-msg" aria-live="polite"></p>
    `);
    const ir = async () => {
      const segredo = document.getElementById('bkSecret').value.trim();
      const btn = document.getElementById('bkGo');
      busy(btn, true);
      try {
        let dek;
        try {
          if (!/^\d+$/.test(segredo)) throw new Error('not pin');
          dek = await unwrapDek(await deriveKek(segredo, unb64(arquivo.pin.salt), arquivo.pin.iter), arquivo.pin);
        } catch (e) {
          dek = await unwrapDek(await deriveKek(normalizeRecovery(segredo), unb64(arquivo.rec.salt), arquivo.rec.iter), arquivo.rec);
        }
        const dados = await openObj(dek, arquivo.data);
        closeModal(); resolve(dados);
      } catch (e) {
        busy(btn, false);
        setMsg('bkMsg', t('sec.recWrong'), 'amount-out');
      }
    };
    document.getElementById('bkGo').addEventListener('click', ir);
    document.getElementById('bkSecret').addEventListener('keydown', (e) => { if (e.key === 'Enter') ir(); });
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
    if (m.type === 'buy' || m.type === 'bonus') { quantidade += q; custo += v; return; }
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
    if (m.type === 'bonus') { valor += Number(m.amount) || 0; return; }
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

/* Países usados no cadastro de contas: definem a tributação que a fase de
   impostos vai sugerir. "other" deixa o usuário informar o regime à mão. */
const COUNTRIES = ['BR', 'PT', 'MT', 'ES', 'US', 'GB', 'CH', 'AD', 'IT', 'RS', 'KY', 'DE', 'FR', 'IE', 'LU', 'AE', 'UY', 'AR', 'CL', 'MX', 'CA', 'JP', 'other'];

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
  // renderThemeOptions(); // COMENTADO - Opções agora criadas pelo novo sistema em index.html
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
  // Tema é gerenciado pelo novo sistema em index.html
  // Apenas aplicar a variável CSS se necessário para compatibilidade
  document.documentElement.dataset.theme = state.settings.theme || 'profit-c';
}

/* ---------- Renderização ---------- */
/* Cada seção é renderizada isoladamente. Se uma falhar — por elemento ausente
   num HTML defasado, por exemplo — as outras continuam aparecendo, em vez de a
   tela inteira ficar em branco. */
function renderAll() {
  const etapas = [
    ['dashboard', renderDashboard], ['contas', renderAccounts], ['saldos', renderBalances],
    ['transações', renderTransactions], ['orçamentos', renderBudgets], ['câmbio', renderFx],
    ['portfólio', renderPortfolio], ['gráfico', renderNAV], ['fluxo', renderCashflow], ['títulos', renderBills], ['investimentos', renderInvestments], ['notícias', () => { if (state.ui.tab === 'news') renderNews(); }], ['calculadora', renderCalculator], ['configurações', renderSettings]
  ];
  etapas.forEach(([nome, fn]) => {
    try { fn(); } catch (e) { console.error('Falha ao renderizar ' + nome + ':', e); }
  });
  // Agendar os listeners para depois de todos os renders terminarem
  setTimeout(setupDashboardCardListeners, 0);
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
    const el = document.getElementById('totalEquity'); if (el) el.textContent = '—';
    const el2 = document.getElementById('totalEquityBase'); if (el2) el2.textContent = '';
    if (warn) warn.classList.add('hidden');
  } else {
    const el = document.getElementById('totalEquity'); if (el) el.textContent = fmtMoney(equity.total, base);
    const el2 = document.getElementById('totalEquityBase'); if (el2) el2.textContent = keys.map((k) => fmtMoney(byCurrency[k], k)).join(' · ');
    if (equity.missing.length) {
      if (warn) { warn.textContent = t('fx.missing').replace('{list}', equity.missing.join(', ')); warn.classList.remove('hidden'); }
    } else {
      if (warn) warn.classList.add('hidden');
    }
  }
  const el3 = document.getElementById('accountCount'); if (el3) el3.textContent = state.accounts.length;
  const el4 = document.getElementById('currencyCount'); if (el4) el4.textContent = new Set(state.accounts.map((a) => a.currency)).size;
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
  const navEl = document.getElementById('navTotal'); if (navEl) navEl.textContent = fmtMoney(nav, base);
  
  // Breakdown do patrimônio líquido
  const financeiroCons = consolidate(byCurrency, base, hoje);
  const invCons = consolidate(carteira.value, base, hoje);
  const propCons = consolidate(imoveis.gross, base, hoje);
  const vehCons = consolidate(veiculos.gross, base, hoje);
  const debtCons = consolidate(dividas, base, hoje);
  
  const el5 = document.getElementById('navBreakdownFinancial'); if (el5) el5.textContent = fmtMoney(financeiroCons.total, base);
  const el6 = document.getElementById('navBreakdownInv'); if (el6) el6.textContent = fmtMoney(invCons.total, base);
  const el7 = document.getElementById('navBreakdownProp'); if (el7) el7.textContent = fmtMoney(propCons.total, base);
  const el8 = document.getElementById('navBreakdownVeh'); if (el8) el8.textContent = fmtMoney(vehCons.total, base);
  const el9 = document.getElementById('navBreakdownDebt'); if (el9) el9.textContent = fmtMoney(debtCons.total, base);
}

function fillSummaryCard(mainId, subId, map, base) {
  const codes = Object.keys(map).sort();
  const main = document.getElementById(mainId);
  const sub = document.getElementById(subId);
  if (!main || !sub) return;
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
      <td>${escapeHtml(a.name)}${a.country || a.holderType ? `<br><span class="acc-tags">${a.country ? `<span class="tag">${t('country.' + a.country)}</span>` : ''}${a.holderType ? `<span class="tag">${t('accounts.holder.' + a.holderType)}</span>` : ''}</span>` : ''}</td>
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

  // Group by currency to show ONLY latest 2 dates per currency
  const currencyGroups = {};
  rows.forEach(r => {
    if (!currencyGroups[r.currency]) currencyGroups[r.currency] = [];
    currencyGroups[r.currency].push(r);
  });

  // Build final rows: max 2 per currency
  const displayRows = [];
  Object.keys(currencyGroups).forEach(currency => {
    const sorted = currencyGroups[currency].sort((a, b) => b.date.localeCompare(a.date));
    displayRows.push(...sorted.slice(0, 2));
  });
  
  // Sort by date descending for display
  displayRows.sort((a, b) => b.date.localeCompare(a.date));

  displayRows.forEach((r) => {
    const rate = Number(r.rate);
    
    // Calculate arrow and percentage change
    let arrow = '→';
    let arrowClass = 'equal';
    let percentage = '';
    
    const currencyRows = currencyGroups[r.currency];
    if (currencyRows && currencyRows.length >= 2) {
      const sortedByDate = currencyRows.sort((a, b) => b.date.localeCompare(a.date));
      const latestRate = Number(sortedByDate[0].rate);
      const previousRate = Number(sortedByDate[1].rate);
      
      if (latestRate > previousRate) {
        arrow = '↑';
        arrowClass = 'up';
        percentage = `+${((latestRate / previousRate - 1) * 100).toFixed(2)}%`;
      } else if (latestRate < previousRate) {
        arrow = '↓';
        arrowClass = 'down';
        percentage = `${((latestRate / previousRate - 1) * 100).toFixed(2)}%`;
      } else {
        arrow = '→';
        arrowClass = 'equal';
        percentage = '0.00%';
      }
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.currency}</td>
      <td><strong>${fmtRate(rate)} ${r.currency}</strong></td>
      <td>1 ${r.currency} = ${rate ? fmtRate(1 / rate) : '—'} ${FX_PIVOT}</td>
      <td>
        <span class="currency-arrow ${arrowClass}">${arrow}</span>
        ${percentage ? `<small style="color: var(--muted); font-size: 11px;">${percentage}</small>` : ''}
        <div class="action-menu-container" style="display: inline-block; margin-left: 8px;">
          <button class="action-circle-btn" onclick="toggleActionMenu(event)">${String.fromCharCode(10133)}</button>
          <div class="action-dropdown-menu">
            <button class="action-menu-item" onclick="openFxModal('${r.id}')">${t('modal.edit')}</button>
            <button class="action-menu-item" onclick="deleteFx('${r.id}')">${t('modal.delete')}</button>
          </div>
        </div>
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
    const rotulo = selKind.closest('label');
    if (rotulo) rotulo.classList.toggle('hidden', !!VIRTUAL_TABS[state.ui.tab]);
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
      tb2.innerHTML = state.schedules.filter((sch) => state.ui.billKind === 'all' || sch.kind === state.ui.billKind).map((sch) => {
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
  const kind = b ? b.kind : (state.ui.billKind === 'payable' ? 'payable' : 'receivable');
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
// Criptos mais negociadas: reconhecidas pelo código, sem depender de busca por nome
const CRYPTO_LIST = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'LTC',
  'LINK', 'XLM', 'TRX', 'SHIB', 'UNI', 'ATOM', 'ETC', 'BCH', 'NEAR', 'FIL', 'AAVE', 'ALGO', 'XMR', 'TON', 'SUI'];
const CRYPTO_QUOTES = ['USD', 'BRL', 'EUR', 'USDT'];
function splitCryptoPair(s) {
  const m = String(s || '').toUpperCase().match(/^([A-Z]{2,6})[-\/]([A-Z]{3,4})$/);
  if (m && CRYPTO_QUOTES.includes(m[2])) return { base: m[1], quote: m[2] === 'USDT' ? 'USD' : m[2] };
  if (CRYPTO_LIST.includes(String(s || '').toUpperCase())) return { base: String(s).toUpperCase(), quote: null };
  return null;
}

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
  const cur = moeda || 'USD';
  // Twelve Data cobre mais pares; a AwesomeAPI fica como reserva e não precisa de chave
  const tk = apiKey('apiTwelve');
  if (tk) {
    try {
      const q = await getJSON(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(ticker + '/' + cur)}&apikey=${tk}`);
      const preco = Number(q.close);
      if (preco > 0) return { price: preco, changePct: Number(q.percent_change) || 0, currency: cur, name: q.name || ticker, exchange: q.exchange || 'Crypto', source: 'Twelve Data' };
    } catch (e) { console.warn('Cripto na Twelve Data:', e.message); }
  }
  const par = `${ticker}-${cur}`;
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
async function resolveAsset(entrada, forcar) {
  let q = String(entrada || '').trim().toUpperCase();
  if (!q) throw new Error(t('mkt.noTicker'));
  let info = { isin: '', ticker: q, name: '', market: '', type: '' };

  const cripto = splitCryptoPair(q);
  if (forcar === 'crypto' || (cripto && forcar !== 'stock')) {
    const base = cripto ? cripto.base : q.replace(/[-\/].*$/, '');
    const moeda = (cripto && cripto.quote) || (CRYPTO_QUOTES.includes(state.settings.baseCurrency) ? state.settings.baseCurrency : 'USD');
    const c = await quoteCrypto(base, moeda);
    return { isin: '', ticker: base, market: 'crypto', name: c.name || base, currency: moeda,
      exchange: c.exchange || 'Crypto', price: c.price, changePct: c.changePct, source: c.source, assetType: 'crypto' };
  }
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
async function getSetting(key) {
  const bruto = await rawGet('settings', await storageKeyFor('settings', key));
  if (!bruto) return null;
  try {
    const r = await decodeRecord(bruto);
    return r ? r.value : null;
  } catch (e) { return null; }
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHistory(item, aoEsperar) {
  const tk = (item.ticker || '').toUpperCase();
  const mk = marketOf(item);
  if (!tk) return [];
  const chave = HIST_PREFIX + mk + ':' + tk + (mk === 'crypto' ? '-' + (item.currency || 'USD') : '');
  const cache = await getSetting(chave);
  if (cache && cache.fetchedAt === todayISO() && cache.points && cache.points.length) return cache.points;

  let pontos = [];
  if (mk === 'crypto') {
    const key = apiKey('apiTwelve');
    if (!key) return cache ? cache.points : [];
    const par = tk + '/' + (item.currency || 'USD');
    const d = await getJSON(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(par)}&interval=1day&outputsize=5000&apikey=${key}`);
    pontos = ((d && d.values) || []).map((v) => [v.datetime.slice(0, 10), Number(v.close)]);
  } else if (mk === 'b3') {
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
      <label class="checkline"><input type="checkbox" id="${p}Whole" ${(buyCtx[p] && buyCtx[p].item && buyCtx[p].item.assetType === 'crypto') ? '' : 'checked'} onchange="updateBuyPreview('${p}')"> ${t('mkt.whole')}</label>
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
    const escolhido = document.querySelector('input[name="poKind"]:checked');
    const forcar = (escolhido && escolhido.value) || undefined;
    const a = await resolveAsset(q, forcar);
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
    const inteiras = document.getElementById('poWhole');
    if (inteiras) inteiras.checked = a.assetType !== 'crypto';
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
    theme: (state.settings.theme === 'dark' || state.settings.theme === 'profit-c') ? 'dark' : 'light', style: '1',
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
    if (m.type === 'bonus') return; // não é dinheiro entrando nem saindo
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
      if (m.type === 'buy' || m.type === 'bonus') { qtd += q; custo += v; }
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
    ...API_SERVICES.map((sv) => [sv.name, sv.key, async () => {
      const r = await testApiKey(sv.id, apiKey(sv.key));
      apiStatus[sv.id] = r;
      if (r.status !== 'ok') throw new Error(r.msg || t('apiw.st.' + r.status));
      return r.msg;
    }]),
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


/* ================= FASE 15 — Impostos =================
   Importante: não existe API pública e confiável de regras tributárias. As regras
   abaixo são uma TABELA INTERNA EDITÁVEL, com a data da última revisão à vista.
   Tudo aparece como sugestão: o app calcula, você confere e ajusta. Não substitui
   contador, e as regras mudam.

   Regras padrão (Brasil, pessoa física, mercado à vista):
   - Ações: 15% sobre o ganho; isenção quando as VENDAS de ações no mês somam até
     R$ 20.000 (a isenção não vale para FII, ETF, BDR nem day trade).
   - FII: 20% sobre o ganho, sem isenção; prejuízo de FII só compensa com FII.
   - ETF de ações e BDR: 15%, sem isenção.
   - Exterior: alíquota única editável (a legislação mudou em 2024 e o regime
     anual difere do mensal — confirme com seu contador).
   - Renda fixa (CDB, Tesouro): imposto retido na fonte pela tabela regressiva,
     então entra como informação, não como imposto a pagar.
   - Prejuízos acumulam por categoria e abatem ganhos futuros da mesma categoria. */

const TAX_REVISION = '2026-09';
const TAX_CATS = ['stock', 'fii', 'etf', 'bdr', 'foreign'];
const TAX_DEFAULTS = {
  country: 'BR', holder: 'individual', currency: 'BRL',
  rates: { stock: 15, fii: 20, etf: 15, bdr: 15, foreign: 15 },
  exemptMonthly: { stock: 20000 },
  lossSeed: {},
  dividendRule: { enabled: false, rate: 10, threshold: 50000 }
};
const taxUi = { year: String(new Date().getFullYear()) };

/* Tabelas sugeridas por país — pessoa física, valores mobiliários listados.
   São generalizações: cada país tem faixas, isenções anuais e exceções que o
   app não modela. Servem de ponto de partida; a nota explica o principal. */
const TAX_PRESETS = {
  BR: { rates: { stock: 15, fii: 20, etf: 15, bdr: 15, foreign: 15 }, exempt: { stock: 20000 } },
  PT: { rates: { stock: 28, fii: 28, etf: 28, bdr: 28, foreign: 28 }, exempt: {} },
  ES: { rates: { stock: 19, fii: 19, etf: 19, bdr: 19, foreign: 19 }, exempt: {} },
  IT: { rates: { stock: 26, fii: 26, etf: 26, bdr: 26, foreign: 26 }, exempt: {} },
  DE: { rates: { stock: 26.375, fii: 26.375, etf: 26.375, bdr: 26.375, foreign: 26.375 }, exempt: {} },
  FR: { rates: { stock: 30, fii: 30, etf: 30, bdr: 30, foreign: 30 }, exempt: {} },
  IE: { rates: { stock: 33, fii: 33, etf: 41, bdr: 33, foreign: 33 }, exempt: {} },
  LU: { rates: { stock: 0, fii: 0, etf: 0, bdr: 0, foreign: 0 }, exempt: {} },
  MT: { rates: { stock: 0, fii: 0, etf: 0, bdr: 0, foreign: 0 }, exempt: {} },
  GB: { rates: { stock: 24, fii: 24, etf: 24, bdr: 24, foreign: 24 }, exempt: {} },
  CH: { rates: { stock: 0, fii: 0, etf: 0, bdr: 0, foreign: 0 }, exempt: {} },
  AD: { rates: { stock: 10, fii: 10, etf: 10, bdr: 10, foreign: 10 }, exempt: {} },
  US: { rates: { stock: 15, fii: 15, etf: 15, bdr: 15, foreign: 15 }, exempt: {} }
};
async function applyTaxPreset(pais) {
  const preset = TAX_PRESETS[pais];
  if (!preset) return;
  const cfg = taxCfg();
  cfg.country = pais;
  cfg.rates = { ...cfg.rates, ...preset.rates };
  cfg.exemptMonthly = { ...preset.exempt };
  await saveTaxCfg(cfg);
  openTaxRules();
  renderTaxes();
  showToast(t('tax.presetApplied').replace('{p}', t('country.' + pais)));
}

function taxCfg() {
  const salvo = state.settings.taxRules || {};
  return {
    ...TAX_DEFAULTS, ...salvo,
    rates: { ...TAX_DEFAULTS.rates, ...(salvo.rates || {}) },
    exemptMonthly: { ...TAX_DEFAULTS.exemptMonthly, ...(salvo.exemptMonthly || {}) },
    lossSeed: { ...(salvo.lossSeed || {}) },
    dividendRule: { ...TAX_DEFAULTS.dividendRule, ...(salvo.dividendRule || {}) }
  };
}
async function saveTaxCfg(cfg) {
  state.settings.taxRules = cfg;
  await put('settings', { key: 'taxRules', value: cfg });
}
async function setTaxRule(caminho, valor) {
  const cfg = taxCfg();
  const v = Number(String(valor).replace(',', '.')) || 0;
  if (caminho.startsWith('rate:')) cfg.rates[caminho.slice(5)] = v;
  else if (caminho.startsWith('exempt:')) cfg.exemptMonthly[caminho.slice(7)] = v;
  else if (caminho.startsWith('loss:')) cfg.lossSeed[caminho.slice(5)] = v;
  else if (caminho === 'divRate') cfg.dividendRule.rate = v;
  else if (caminho === 'divThreshold') cfg.dividendRule.threshold = v;
  else if (caminho === 'divEnabled') cfg.dividendRule.enabled = !!valor;
  else if (caminho === 'country') cfg.country = valor;
  else if (caminho === 'holder') cfg.holder = valor;
  await saveTaxCfg(cfg);
  // Trocar país ou titularidade redesenha a janela, para a nota e o botão acompanharem
  if ((caminho === 'country' || caminho === 'holder') && !document.getElementById('modal').classList.contains('hidden')) openTaxRules();
  renderTaxes();
  renderTaxSettings();
}

function taxCategoryOf(pos) {
  const mercado = marketOf(pos);
  if (mercado !== 'b3') return 'foreign';
  const tipo = pos.assetType || 'stock';
  if (tipo === 'fii') return 'fii';
  if (tipo === 'etf') return 'etf';
  if (tipo === 'bdr') return 'bdr';
  if (tipo === 'treasury' || tipo === 'cdb') return 'fixed';
  if (tipo === 'crypto') return 'crypto';
  return 'stock';
}
const taxCatLabel = (c) => t('tax.cat.' + c);

/* Vendas por mês, com custo médio apurado na ordem dos movimentos. */
function taxSales(conv) {
  const cfg = taxCfg();
  const M = cfg.currency;
  const vendas = [];
  state.positions.forEach((pos) => {
    const cat = taxCategoryOf(pos);
    let qtd = 0, custo = 0;
    invMovesOf(pos.id).forEach((m) => {
      const q = Number(m.quantity) || 0;
      const v = conv(Number(m.amount) || 0, pos.currency, M, m.date) || 0;
      if (m.type === 'buy' || m.type === 'bonus') { qtd += q; custo += v; return; }
      if (qtd <= 0) return; // venda sem compra registrada: fica de fora da apuração
      const qv = Math.min(q, qtd);
      const custoMedio = custo / qtd;
      const custoVendido = custoMedio * qv;
      const valorVenda = q > 0 ? v * (qv / q) : v;
      vendas.push({
        date: m.date, month: m.date.slice(0, 7), cat, ticker: pos.ticker || pos.name,
        qty: qv, sale: valorVenda, cost: custoVendido, gain: valorVenda - custoVendido,
        exemptEligible: cat === 'stock' && cfg.country === 'BR' && cfg.holder === 'individual'
      });
      custo -= custoVendido; qtd -= qv;
    });
  });
  return vendas.sort((a, b) => a.date.localeCompare(b.date));
}

/* Apuração mês a mês, já compensando prejuízos anteriores por categoria. */
function taxComputation(conv) {
  const cfg = taxCfg();
  const vendas = taxSales(conv);
  const pagos = state.settings.taxPaid || {};
  const prejuizo = { ...cfg.lossSeed };
  const meses = [...new Set(vendas.map((v) => v.month))].sort();
  const linhas = [];
  meses.forEach((mes) => {
    TAX_CATS.forEach((cat) => {
      const doMes = vendas.filter((v) => v.month === mes && v.cat === cat);
      if (!doMes.length) return;
      const totalVendas = doMes.reduce((s, v) => s + v.sale, 0);
      const ganho = doMes.reduce((s, v) => s + v.gain, 0);
      const limite = Number(cfg.exemptMonthly[cat]) || 0;
      const isento = doMes[0].exemptEligible && limite > 0 && totalVendas <= limite;
      const anterior = prejuizo[cat] || 0;
      let compensado = 0, base = 0, imposto = 0;
      if (isento) {
        // Em mês isento, o prejuízo também não é aproveitável
      } else if (ganho > 0) {
        compensado = Math.min(anterior, ganho);
        prejuizo[cat] = anterior - compensado;
        base = ganho - compensado;
        imposto = base * ((Number(cfg.rates[cat]) || 0) / 100);
      } else {
        prejuizo[cat] = anterior + Math.abs(ganho);
      }
      const chave = mes + '|' + cat;
      linhas.push({
        month: mes, cat, sales: totalVendas, gain: ganho, exempt: isento, used: compensado,
        base, rate: Number(cfg.rates[cat]) || 0, tax: imposto, carry: prejuizo[cat] || 0,
        trades: doMes, key: chave, paid: pagos[chave] || null
      });
    });
  });
  return { linhas, prejuizo, vendas };
}

let taxCache = null;
async function taxData(forcar) {
  const assinatura = [state.invmoves.length, state.positions.length, JSON.stringify(state.settings.taxRules || {}), JSON.stringify(state.settings.taxPaid || {}), todayISO()].join('|');
  if (!forcar && taxCache && taxCache.sig === assinatura) return taxCache;
  const primeira = state.invmoves.map((m) => m.date).sort()[0] || todayISO();
  const conv = makeConverter(await fetchFxHistory(primeira));
  taxCache = { sig: assinatura, ...taxComputation(conv), conv };
  return taxCache;
}

async function markTaxPaid(chave) {
  const pagos = { ...(state.settings.taxPaid || {}) };
  if (pagos[chave]) delete pagos[chave];
  else pagos[chave] = { date: todayISO() };
  state.settings.taxPaid = pagos;
  await put('settings', { key: 'taxPaid', value: pagos });
  renderTaxes();
}

/* ----- Tela ----- */
async function renderTaxes() {
  const painel = document.getElementById('tab-taxes');
  if (!painel) return;
  const sub = document.getElementById('subTabs');
  if (!painel.classList.contains('active')) return;
  const box = document.getElementById('taxBody');
  const cfg = taxCfg();
  const M = cfg.currency;
  box.innerHTML = `<p class="hint">${t('mkt.loadingHist')}</p>`;
  const dados = await taxData();
  const anos = [...new Set(dados.linhas.map((l) => l.month.slice(0, 4)))].sort().reverse();
  if (!anos.includes(taxUi.year) && anos.length) taxUi.year = anos[0];
  const doAno = dados.linhas.filter((l) => l.month.startsWith(taxUi.year));
  const impostoAno = doAno.reduce((s, l) => s + l.tax, 0);
  const ganhoAno = doAno.reduce((s, l) => s + (l.exempt ? 0 : l.gain), 0);
  const isentoAno = doAno.filter((l) => l.exempt).reduce((s, l) => s + Math.max(l.gain, 0), 0);
  const aPagar = doAno.filter((l) => l.tax > 0 && !l.paid).reduce((s, l) => s + l.tax, 0);

  box.innerHTML = `
    <div class="tax-warning">⚠️ ${t('tax.disclaimer').replace('{d}', TAX_REVISION.split('-').reverse().join('/'))}</div>
    <div class="filters">
      <label><span>${t('div.fYear')}</span>
        <select onchange="taxUi.year=this.value;renderTaxes()">${anos.map((a) => `<option ${a === taxUi.year ? 'selected' : ''}>${a}</option>`).join('')}</select>
      </label>
      <button type="button" class="secondary-btn" onclick="exportTaxCSV()">${t('tax.exportCsv')}</button>
      <button type="button" class="secondary-btn" onclick="openTaxRules()">${t('tax.rules')}</button>
    </div>
    <div class="cards">
      <div class="card"><h3>${t('tax.taxableGain')}</h3><p class="big-number">${fmtMoney(ganhoAno, M)}</p></div>
      <div class="card"><h3>${t('tax.exemptGain')}</h3><p class="big-number amount-in">${fmtMoney(isentoAno, M)}</p></div>
      <div class="card"><h3>${t('tax.taxYear')}</h3><p class="big-number">${fmtMoney(impostoAno, M)}</p></div>
      <div class="card"><h3>${t('tax.toPay')}</h3><p class="big-number ${aPagar > 0 ? 'amount-out' : ''}">${fmtMoney(aPagar, M)}</p></div>
    </div>
    <h3 class="section-sub">${t('tax.monthly')}</h3>
    ${doAno.length ? `<div class="table-scroll"><table class="mini-table tax-table">
      <thead><tr><th>${t('tax.month')}</th><th>${t('tax.category')}</th><th>${t('tax.sales')}</th><th>${t('tax.gain')}</th>
        <th>${t('tax.lossUsed')}</th><th>${t('tax.base')}</th><th>${t('tax.rate')}</th><th>${t('tax.tax')}</th><th>${t('tax.status')}</th></tr></thead>
      <tbody>${doAno.map((l) => `<tr>
        <td>${l.month.slice(5)}/${l.month.slice(0, 4)}</td>
        <td>${escapeHtml(taxCatLabel(l.cat))}${l.exempt ? ` <span class="api-badge badge-ok">${t('tax.exempt')}</span>` : ''}</td>
        <td>${fmtMoney(l.sales, M)}</td>
        <td class="${l.gain >= 0 ? 'amount-in' : 'amount-out'}">${fmtMoney(l.gain, M)}</td>
        <td>${l.used ? fmtMoney(l.used, M) : '—'}</td>
        <td>${l.base ? fmtMoney(l.base, M) : '—'}</td>
        <td>${l.exempt ? '—' : l.rate + '%'}</td>
        <td><strong>${l.tax ? fmtMoney(l.tax, M) : '—'}</strong></td>
        <td>${l.tax > 0
          ? `<button class="secondary-btn" onclick="markTaxPaid('${l.key}')">${l.paid ? '✓ ' + t('tax.paid') : t('tax.markPaid')}</button>`
          : '—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : `<p class="empty-state">${t('tax.noSales')}</p>`}

    <h3 class="section-sub">${t('tax.losses')}</h3>
    <div class="table-scroll"><table class="mini-table">
      <thead><tr><th>${t('tax.category')}</th><th>${t('tax.lossCarry')}</th><th>${t('tax.lossSeed')}</th></tr></thead>
      <tbody>${TAX_CATS.map((c) => `<tr>
        <td>${escapeHtml(taxCatLabel(c))}</td>
        <td class="${(dados.prejuizo[c] || 0) > 0 ? 'amount-out' : ''}">${fmtMoney(dados.prejuizo[c] || 0, M)}</td>
        <td><input type="text" inputmode="decimal" value="${cfg.lossSeed[c] || ''}" placeholder="0" onchange="setTaxRule('loss:${c}', this.value)" aria-label="${escapeHtml(taxCatLabel(c))}"></td>
      </tr>`).join('')}</tbody>
    </table></div>
    <p class="hint">${t('tax.lossHint')}</p>

    <h3 class="section-sub">${t('tax.declaration').replace('{y}', taxUi.year)}</h3>
    ${renderTaxAssets(dados)}`;
}

function renderTaxAssets(dados) {
  const cfg = taxCfg();
  const M = cfg.currency;
  const fim = taxUi.year + '-12-31';
  const inicio = String(Number(taxUi.year) - 1) + '-12-31';
  const linhas = state.positions.map((pos) => {
    const agora = positionStateAt(pos, fim);
    const antes = positionStateAt(pos, inicio);
    const custoAgora = dados.conv(agora.cost, pos.currency, M, fim) || agora.cost;
    const custoAntes = dados.conv(antes.cost, pos.currency, M, inicio) || antes.cost;
    return { pos, qtd: agora.quantity, custoAgora, custoAntes };
  }).filter((l) => l.qtd > 0 || l.custoAntes > 0);
  const proventos = state.dividends.filter((d) => (d.payDate || '').startsWith(taxUi.year) && d.status === 'received');
  const porTipo = {};
  proventos.forEach((d) => {
    const chave = d.type === 'jcp' ? 'jcp' : d.type === 'rend' ? 'rend' : 'div';
    porTipo[chave] = (porTipo[chave] || 0) + (dados.conv(Number(d.amount) || 0, d.currency || 'BRL', M, d.payDate) || 0);
  });
  if (!linhas.length && !proventos.length) return `<p class="empty-state">${t('tax.noAssets')}</p>`;
  return `
    <p class="hint">${t('tax.declarationHint')}</p>
    <div class="table-scroll"><table class="mini-table">
      <thead><tr><th>${t('mkt.asset')}</th><th>${t('inv.quantity')}</th><th>${t('tax.costBefore').replace('{y}', Number(taxUi.year) - 1)}</th><th>${t('tax.costAfter').replace('{y}', taxUi.year)}</th></tr></thead>
      <tbody>${linhas.map((l) => `<tr>
        <td>${colorDot(l.pos.color)}${escapeHtml(l.pos.ticker || l.pos.name)}</td>
        <td>${fmtQty(l.qtd)}</td><td>${fmtMoney(l.custoAntes, M)}</td><td><strong>${fmtMoney(l.custoAgora, M)}</strong></td>
      </tr>`).join('')}</tbody>
    </table></div>
    ${proventos.length ? `<div class="tax-income">
      ${Object.entries(porTipo).map(([k, v]) => `<div><span>${t('div.t.' + k)}</span><strong>${fmtMoney(v, M)}</strong><span class="hint">${t('tax.incomeNote.' + k)}</span></div>`).join('')}
    </div>` : ''}`;
}

async function exportTaxCSV() {
  const dados = await taxData();
  const cfg = taxCfg();
  const doAno = dados.linhas.filter((l) => l.month.startsWith(taxUi.year));
  const cab = ['Mes', 'Categoria', 'Vendas', 'GanhoPerda', 'Isento', 'PrejuizoCompensado', 'Base', 'Aliquota', 'Imposto', 'Situacao'];
  const linhas = doAno.map((l) => [l.month, taxCatLabel(l.cat), l.sales.toFixed(2).replace('.', ','), l.gain.toFixed(2).replace('.', ','),
    l.exempt ? 'Sim' : 'Nao', l.used.toFixed(2).replace('.', ','), l.base.toFixed(2).replace('.', ','), l.rate + '%',
    l.tax.toFixed(2).replace('.', ','), l.paid ? 'Pago' : (l.tax > 0 ? 'A pagar' : '-')]);
  const csv = [cab, ...linhas].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  download(`prof-controller-impostos-${taxUi.year}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
  showToast(t('toast.exported'));
}

function openTaxRules() {
  const cfg = taxCfg();
  openModal(`
    <h2>${t('tax.rules')}</h2>
    <p class="hint">${t('tax.rulesHint').replace('{d}', TAX_REVISION.split('-').reverse().join('/'))}</p>
    <label>${t('accounts.country')}</label>
    <select onchange="setTaxRule('country', this.value)">
      ${COUNTRIES.map((c) => `<option value="${c}" ${cfg.country === c ? 'selected' : ''}>${t('country.' + c)}</option>`).join('')}
    </select>
    <label>${t('accounts.holder')}</label>
    <select onchange="setTaxRule('holder', this.value)">
      <option value="individual" ${cfg.holder === 'individual' ? 'selected' : ''}>${t('accounts.holder.individual')}</option>
      <option value="company" ${cfg.holder === 'company' ? 'selected' : ''}>${t('accounts.holder.company')}</option>
    </select>
    ${TAX_PRESETS[cfg.country] ? `
      <div class="tax-preset">
        <p>${t('tax.note.' + cfg.country)}</p>
        <button type="button" class="secondary-btn" onclick="applyTaxPreset('${cfg.country}')">${t('tax.applyPreset').replace('{p}', t('country.' + cfg.country))}</button>
      </div>` : `<p class="sec-warning">${t('tax.noTable')}</p>`}
    <h3 class="section-sub">${t('tax.ratesTitle')}</h3>
    <div class="table-scroll"><table class="mini-table">
      <thead><tr><th>${t('tax.category')}</th><th>${t('tax.rate')}</th><th>${t('tax.exemptLimit')}</th></tr></thead>
      <tbody>${TAX_CATS.map((c) => `<tr>
        <td>${escapeHtml(taxCatLabel(c))}</td>
        <td><input type="text" inputmode="decimal" value="${cfg.rates[c]}" onchange="setTaxRule('rate:${c}', this.value)" aria-label="${escapeHtml(taxCatLabel(c))}"> %</td>
        <td><input type="text" inputmode="decimal" value="${cfg.exemptMonthly[c] || ''}" placeholder="—" onchange="setTaxRule('exempt:${c}', this.value)" aria-label="${escapeHtml(taxCatLabel(c))}"></td>
      </tr>`).join('')}</tbody>
    </table></div>
    <h3 class="section-sub">${t('tax.dividends')}</h3>
    <label class="checkline"><input type="checkbox" ${cfg.dividendRule.enabled ? 'checked' : ''} onchange="setTaxRule('divEnabled', this.checked)"> ${t('tax.divEnable')}</label>
    <p class="hint">${t('tax.divHint')}</p>
    <div class="calc-inline">
      <input type="text" inputmode="decimal" value="${cfg.dividendRule.rate}" onchange="setTaxRule('divRate', this.value)" aria-label="${t('tax.rate')}">
      <input type="text" inputmode="decimal" value="${cfg.dividendRule.threshold}" onchange="setTaxRule('divThreshold', this.value)" aria-label="${t('tax.divThreshold')}">
    </div>
    <p class="hint">${t('tax.divFields')}</p>
  `, true);
}

/* ----- Simulador de venda (aba IR da calculadora) ----- */
async function runTaxSim() {
  const saida = document.getElementById('irResult');
  if (!saida) return;
  const cfg = taxCfg();
  const M = cfg.currency;
  const cat = document.getElementById('irCat').value;
  const qtd = numIn('irQty', 0), venda = numIn('irPrice', 0), custo = numIn('irCost', 0);
  const outrasVendas = numIn('irOther', 0) || 0;
  const usarPrejuizo = document.getElementById('irUseLoss').checked;
  if (!qtd || !venda) { saida.innerHTML = `<p class="hint">${t('calc.fillHint')}</p>`; return; }
  const dados = await taxData();
  const totalVenda = qtd * venda;
  const totalCusto = qtd * custo;
  const ganho = totalVenda - totalCusto;
  const limite = Number(cfg.exemptMonthly[cat]) || 0;
  const vendasMes = totalVenda + outrasVendas;
  const isento = cat === 'stock' && cfg.country === 'BR' && cfg.holder === 'individual' && limite > 0 && vendasMes <= limite;
  const prejuizo = usarPrejuizo ? (dados.prejuizo[cat] || 0) : 0;
  const compensado = isento || ganho <= 0 ? 0 : Math.min(prejuizo, ganho);
  const base = isento ? 0 : Math.max(ganho - compensado, 0);
  const imposto = base * ((Number(cfg.rates[cat]) || 0) / 100);
  saida.innerHTML = `
    <div class="calc-cards">
      <div><span>${t('tax.sales')}</span><strong>${fmtMoney(totalVenda, M)}</strong></div>
      <div><span>${t('tax.gain')}</span><strong class="${ganho >= 0 ? 'amount-in' : 'amount-out'}">${fmtMoney(ganho, M)}</strong></div>
      ${compensado ? `<div><span>${t('tax.lossUsed')}</span><strong>${fmtMoney(compensado, M)}</strong></div>` : ''}
      <div><span>${t('tax.tax')}</span><strong class="${imposto > 0 ? 'amount-out' : 'amount-in'}">${fmtMoney(imposto, M)}</strong></div>
      <div><span>${t('calc.irNet')}</span><strong>${fmtMoney(totalVenda - imposto, M)}</strong></div>
    </div>
    ${isento ? `<p class="amount-in">${t('calc.irExempt').replace('{v}', fmtMoney(limite, M))}</p>` : ''}
    ${!isento && cat === 'stock' && limite > 0 && vendasMes > limite ? `<p class="hint">${t('calc.irOverLimit').replace('{v}', fmtMoney(limite, M)).replace('{t}', fmtMoney(vendasMes, M))}</p>` : ''}
    ${prejuizo > 0 && !usarPrejuizo ? `<p class="hint">${t('calc.irLossAvailable').replace('{v}', fmtMoney(prejuizo, M))}</p>` : ''}
    <p class="hint">${t('tax.disclaimer').replace('{d}', TAX_REVISION.split('-').reverse().join('/'))}</p>`;
}
function renderTaxSim(box) {
  const cfg = taxCfg();
  box.innerHTML = `
    <p class="hint">${t('calc.irHint')}</p>
    <div class="calc-form">
      <label>${t('tax.category')}<select id="irCat" onchange="runTaxSim()">${TAX_CATS.map((c) => `<option value="${c}">${taxCatLabel(c)}</option>`).join('')}</select></label>
      <label>${t('inv.quantity')}<input id="irQty" type="text" inputmode="decimal" value="100" oninput="runTaxSim()"></label>
      <label>${t('calc.irSalePrice')}<input id="irPrice" type="text" inputmode="decimal" value="30" oninput="runTaxSim()"></label>
      <label>${t('calc.irAvgCost')}<input id="irCost" type="text" inputmode="decimal" value="20" oninput="runTaxSim()"></label>
      <label>${t('calc.irOtherSales')}<input id="irOther" type="text" inputmode="decimal" placeholder="0" oninput="runTaxSim()"></label>
      <label class="checkline"><input type="checkbox" id="irUseLoss" checked onchange="runTaxSim()"> ${t('calc.irUseLoss')}</label>
    </div>
    <div id="irResult" class="calc-out"></div>`;
  runTaxSim();
}


/* ================= FASE 14 — Você x Mercado, metas e aporte inteligente =================
   Nada aqui recomenda comprar ou vender um ativo: recomendação de papel é
   atividade regulada. O card compara a SUA carteira com índices e traz
   observações sobre a carteira como um todo (concentração, moeda, caixa parado
   e distância das metas que você mesmo definiu). */

let ymCache = null;

async function computeYouVsMarket(forcar) {
  const hoje = todayISO();
  const D = state.settings.baseCurrency;
  const posicoes = state.positions.filter((p) => invMovesOf(p.id).length);
  const assinatura = [state.invmoves.length, state.quotes.length, state.positions.length, state.dividends.length, hoje, D].join('|');
  if (!forcar && ymCache && ymCache.sig === assinatura) return ymCache;
  if (!posicoes.length) { ymCache = { sig: assinatura, vazio: true }; return ymCache; }

  const tot = investmentTotals(hoje);
  const valor = consolidate(tot.value, D, hoje).total;
  const custo = consolidate(tot.cost, D, hoje).total;
  const ret = custo > 0 ? (valor / custo - 1) * 100 : null;
  const primeira = posicoes.flatMap((p) => invMovesOf(p.id).map((m) => m.date)).sort()[0] || hoje;

  const conv = makeConverter(await fetchFxHistory(primeira));
  const fluxos = flowsOf(posicoes, D, conv);
  const cfg = cmpConfig();
  const indices = {};
  for (const b of ['cdi', 'ibov', 'spx']) {
    try {
      const nv = await benchmarkLevels(b, cfg, primeira, () => {});
      if (!nv.points.length || !fluxos.length) continue;
      const sim = simulateBench(nv.points, nv.currency, fluxos, [hoje], D, conv, () => {});
      const r = retOf(sim[0].value, sim[0].cost);
      if (r != null) indices[b] = { ret: r, label: benchLabel(b, cfg), valor: sim[0].value };
    } catch (e) { console.warn('Você x Mercado —', b, e.message); }
  }
  ymCache = { sig: assinatura, valor, custo, ret, indices, primeira, moeda: D, dozeMeses: dividendos12m(D, hoje) };
  return ymCache;
}
function dividendos12m(D, hoje) {
  const limite = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); })();
  return state.dividends.filter((d) => d.status === 'received' && (d.payDate || '') >= limite)
    .reduce((s, d) => s + toBase(Number(d.amount) || 0, d.currency || 'BRL', d.payDate || hoje), 0);
}

/* Observações sobre a carteira — educativas, nunca sobre comprar ou vender papel */
function portfolioInsights(ym) {
  const hoje = todayISO();
  const D = state.settings.baseCurrency;
  const obs = [];
  const porPosicao = state.positions.map((p) => ({ p, v: toBase(positionValue(p, hoje), p.currency, hoje) })).filter((x) => x.v > 0);
  const total = porPosicao.reduce((s, x) => s + x.v, 0);
  if (total > 0) {
    const maior = porPosicao.sort((a, b) => b.v - a.v)[0];
    const fatia = (maior.v / total) * 100;
    if (fatia >= 25) obs.push({ icon: '🎯', text: t('ym.i.concentration').replace('{a}', maior.p.ticker || maior.p.name).replace('{p}', fatia.toFixed(0)) });
    const moedas = {};
    porPosicao.forEach((x) => { moedas[x.p.currency] = (moedas[x.p.currency] || 0) + x.v; });
    const [moeda, v] = Object.entries(moedas).sort((a, b) => b[1] - a[1])[0];
    if ((v / total) * 100 >= 70 && Object.keys(moedas).length > 0) obs.push({ icon: '💱', text: t('ym.i.currency').replace('{c}', moeda).replace('{p}', ((v / total) * 100).toFixed(0)) });
  }
  const saldos = currentBalancesAll();
  const caixa = state.accounts.reduce((s, a) => s + toBase(saldos[a.id] || 0, a.currency, hoje), 0);
  if (caixa > 0 && total > 0 && caixa / (caixa + total) >= 0.2) {
    obs.push({ icon: '💤', text: t('ym.i.cash').replace('{v}', fmtMoney(caixa, D)).replace('{p}', ((caixa / (caixa + total)) * 100).toFixed(0)) });
  }
  if (ym.dozeMeses > 0 && ym.custo > 0) {
    obs.push({ icon: '💸', text: t('ym.i.income').replace('{v}', fmtMoney(ym.dozeMeses, D)).replace('{p}', ((ym.dozeMeses / ym.custo) * 100).toFixed(2).replace('.', ',')) });
  }
  const desvios = allocationRows().filter((r) => r.target > 0 && Math.abs(r.atual - r.target) >= 5);
  if (desvios.length && state.settings.allocReminders !== false) {
    const d = desvios.sort((a, b) => Math.abs(b.atual - b.target) - Math.abs(a.atual - a.target))[0];
    obs.push({ icon: '⚖️', text: t('ym.i.target').replace('{c}', t('inv.ty.' + d.key) || d.key).replace('{a}', d.atual.toFixed(0)).replace('{m}', d.target.toFixed(0)) });
  }
  return obs;
}

async function renderYouVsMarket() {
  const box = document.getElementById('ymCard');
  if (!box) return;
  const ym = await computeYouVsMarket();
  if (ym.vazio) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  const D = ym.moeda;
  const lucro = ym.valor - ym.custo;
  const comparacoes = Object.entries(ym.indices);
  const melhor = comparacoes.length ? comparacoes.map(([k, v]) => ({ k, ...v, dif: ym.ret - v.ret })).sort((a, b) => a.dif - b.dif) : [];
  const principal = melhor.find((x) => x.k === 'cdi') || melhor[0];
  const frase = ym.ret == null ? t('ym.noCost')
    : principal
      ? t(principal.dif >= 0 ? 'ym.above' : 'ym.below')
        .replace('{r}', fmtPct(ym.ret)).replace('{d}', Math.abs(principal.dif).toFixed(1).replace('.', ',')).replace('{b}', escapeHtml(principal.label))
      : t('ym.solo').replace('{r}', fmtPct(ym.ret));

  const maxAbs = Math.max(...melhor.map((x) => Math.abs(x.ret)), Math.abs(ym.ret || 0), 1);
  const barra = (rotulo, valor, cor) => `
    <li><span class="ym-name">${escapeHtml(rotulo)}</span>
      <span class="ym-track"><span class="ym-bar" style="width:${(Math.abs(valor) / maxAbs) * 100}%;background:${cor};margin-left:${valor < 0 ? 'auto' : '0'}"></span></span>
      <span class="ym-val ${valor >= 0 ? 'amount-in' : 'amount-out'}">${fmtPct(valor)}</span></li>`;

  box.innerHTML = `
    <div class="nav-head">
      <h3>${t('ym.title')}</h3>
      <div class="nav-controls">
        <button type="button" class="secondary-btn" onclick="copyYouVsMarket()">${t('ym.copy')}</button>
        <button type="button" class="secondary-btn" onclick="shareYouVsMarketImage()">${t('ym.image')}</button>
      </div>
    </div>
    <p class="ym-headline">${frase}</p>
    <ul class="ym-bars">
      ${barra(t('ym.you'), ym.ret || 0, 'var(--accent)')}
      ${melhor.map((x) => barra(x.label, x.ret, cmpConfig().colors[x.k])).join('')}
    </ul>
    <p class="hint">${t('ym.since').replace('{d}', ym.primeira.split('-').reverse().join('/'))} · ${t('mkt.invested')} ${fmtMoney(ym.custo, D)} · ${t('mkt.market')} ${fmtMoney(ym.valor, D)} · ${t('mkt.result')} <strong class="${lucro >= 0 ? 'amount-in' : 'amount-out'}">${fmtMoney(lucro, D)}</strong></p>
    <ul class="ym-insights">${portfolioInsights(ym).map((o) => `<li><span>${o.icon}</span>${o.text}</li>`).join('')}</ul>
    <p class="hint">${t('ym.disclaimer')}</p>`;
}

function youVsMarketText() {
  const ym = ymCache;
  if (!ym || ym.vazio) return '';
  const linhas = [t('ym.title') + ' — ProF Controller',
    `${t('ym.you')}: ${fmtPct(ym.ret || 0)}`];
  Object.values(ym.indices).forEach((x) => linhas.push(`${x.label}: ${fmtPct(x.ret)}`));
  linhas.push(`${t('ym.since').replace('{d}', ym.primeira.split('-').reverse().join('/'))}`);
  return linhas.join('\n');
}
async function copyYouVsMarket() {
  try { await navigator.clipboard.writeText(youVsMarketText()); showToast(t('ym.copied')); }
  catch (e) { showToast(t('sec.copyFail')); }
}

/* Imagem quadrada para compartilhar: SVG desenhado na hora e convertido em PNG */
async function shareYouVsMarketImage() {
  const ym = await computeYouVsMarket();
  if (!ym || ym.vazio) return;
  const linhas = [{ label: t('ym.you'), ret: ym.ret || 0, cor: '#e94560' },
    ...Object.entries(ym.indices).map(([k, v]) => ({ label: v.label, ret: v.ret, cor: cmpConfig().colors[k] }))];
  const max = Math.max(...linhas.map((l) => Math.abs(l.ret)), 1);
  const W = 1080, H = 1080;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#1f1e1d"/>
    <text x="80" y="140" font-family="system-ui,sans-serif" font-size="34" fill="#a8a59c">ProF Controller</text>
    <text x="80" y="230" font-family="system-ui,sans-serif" font-size="60" font-weight="700" fill="#f5f4ef">${escapeHtml(t('ym.title'))}</text>
    <text x="80" y="300" font-family="system-ui,sans-serif" font-size="30" fill="#a8a59c">${escapeHtml(t('ym.since').replace('{d}', ym.primeira.split('-').reverse().join('/')))}</text>
    ${linhas.map((l, i) => {
      const y = 420 + i * 130;
      const larg = (Math.abs(l.ret) / max) * 700;
      return `<text x="80" y="${y - 18}" font-family="system-ui,sans-serif" font-size="32" fill="#f5f4ef">${escapeHtml(l.label)}</text>
        <rect x="80" y="${y}" width="${Math.max(larg, 6)}" height="44" rx="10" fill="${l.cor}"/>
        <text x="${Math.max(larg, 6) + 100}" y="${y + 34}" font-family="system-ui,sans-serif" font-size="34" font-weight="700" fill="${l.ret >= 0 ? '#7cc08a' : '#e8836f'}">${escapeHtml(fmtPct(l.ret))}</text>`;
    }).join('')}
    <text x="80" y="${H - 70}" font-family="system-ui,sans-serif" font-size="24" fill="#73726c">${escapeHtml(t('ym.imageFoot'))}</text>
  </svg>`;
  try {
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await new Promise((ok, erro) => { img.onload = ok; img.onerror = erro; img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.getContext('2d').drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `prof-controller-voce-x-mercado-${todayISO()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      showToast(t('ym.imageDone'));
    }, 'image/png');
  } catch (e) { showToast(t('ym.imageFail')); }
}

/* ----- Metas de alocação e aporte inteligente ----- */
function allocTargets() { return state.settings.allocTargets || {}; }
function allocationRows() {
  const hoje = todayISO();
  const D = state.settings.baseCurrency;
  const metas = allocTargets();
  const valores = {};
  state.positions.forEach((p) => {
    const v = toBase(positionValue(p, hoje), p.currency, hoje);
    if (v > 0) valores[p.assetType || 'other'] = (valores[p.assetType || 'other'] || 0) + v;
  });
  const saldos = currentBalancesAll();
  const caixa = state.accounts.reduce((s, a) => s + toBase(saldos[a.id] || 0, a.currency, hoje), 0);
  if (caixa > 0 || metas.cash) valores.cash = Math.max(caixa, 0);
  const chaves = [...new Set([...Object.keys(valores), ...Object.keys(metas)])];
  const total = chaves.reduce((s, k) => s + (valores[k] || 0), 0);
  return chaves.map((k) => ({
    key: k, valor: valores[k] || 0,
    atual: total > 0 ? ((valores[k] || 0) / total) * 100 : 0,
    target: Number(metas[k]) || 0
  })).sort((a, b) => b.valor - a.valor);
}
const allocLabel = (k) => (k === 'cash' ? t('alloc.cash') : t('inv.ty.' + k));

async function setAllocTarget(key, valor) {
  const metas = { ...allocTargets() };
  const v = Number(String(valor).replace(',', '.'));
  if (!v) delete metas[key]; else metas[key] = Math.min(Math.max(v, 0), 100);
  state.settings.allocTargets = metas;
  await put('settings', { key: 'allocTargets', value: metas });
  renderAllocation();
  renderYouVsMarket();
}
async function toggleAllocReminders(on) {
  state.settings.allocReminders = on;
  await put('settings', { key: 'allocReminders', value: on });
  renderYouVsMarket();
}

function renderAllocation() {
  const box = document.getElementById('allocBox');
  if (!box) return;
  const linhas = allocationRows();
  const D = state.settings.baseCurrency;
  const somaMetas = linhas.reduce((s, r) => s + r.target, 0);
  if (!linhas.length) { box.innerHTML = `<p class="empty-state">${t('alloc.empty')}</p>`; return; }
  box.innerHTML = `
    <div class="table-scroll"><table class="mini-table alloc-table">
      <thead><tr><th>${t('alloc.category')}</th><th>${t('alloc.value')}</th><th>${t('alloc.current')}</th><th>${t('alloc.target')}</th><th>${t('alloc.gap')}</th></tr></thead>
      <tbody>${linhas.map((r) => {
        const dif = r.target > 0 ? r.atual - r.target : null;
        return `<tr>
          <td>${escapeHtml(allocLabel(r.key))}</td>
          <td>${fmtMoney(r.valor, D)}</td>
          <td><span class="alloc-bar"><span style="width:${Math.min(r.atual, 100)}%"></span></span> ${r.atual.toFixed(1).replace('.', ',')}%</td>
          <td><input type="number" min="0" max="100" step="1" value="${r.target || ''}" placeholder="—" onchange="setAllocTarget('${r.key}', this.value)" aria-label="${escapeHtml(allocLabel(r.key))}"> %</td>
          <td class="${dif == null ? '' : Math.abs(dif) < 5 ? 'amount-neutral' : dif > 0 ? 'amount-out' : 'amount-in'}">${dif == null ? '—' : (dif > 0 ? '+' : '') + dif.toFixed(1).replace('.', ',') + ' p.p.'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
    <p class="hint">${somaMetas > 0 ? t('alloc.sum').replace('{n}', somaMetas.toFixed(0)) + (Math.abs(somaMetas - 100) > 0.5 ? ' ' + t('alloc.sumWarn') : '') : t('alloc.hint')}</p>
    <div class="alloc-sim">
      <label>${t('alloc.nextAmount')}<input id="allocAmount" type="text" inputmode="decimal" placeholder="1000" oninput="renderAllocSuggestion()"></label>
      <label class="checkline"><input type="checkbox" id="allocRem" ${state.settings.allocReminders !== false ? 'checked' : ''} onchange="toggleAllocReminders(this.checked)"> ${t('alloc.reminders')}</label>
    </div>
    <div id="allocSuggestion"></div>`;
  renderAllocSuggestion();
}

function renderAllocSuggestion() {
  const box = document.getElementById('allocSuggestion');
  if (!box) return;
  const valor = numIn('allocAmount', 0);
  const D = state.settings.baseCurrency;
  if (!valor || valor <= 0) { box.innerHTML = ''; return; }
  const linhas = allocationRows();
  const total = linhas.reduce((s, r) => s + r.valor, 0) + valor;
  const faltas = linhas.filter((r) => r.target > 0).map((r) => ({ ...r, falta: Math.max((r.target / 100) * total - r.valor, 0) })).filter((r) => r.falta > 0);
  const somaFaltas = faltas.reduce((s, r) => s + r.falta, 0);
  if (!somaFaltas) { box.innerHTML = `<p class="hint">${t('alloc.noGap')}</p>`; return; }
  const fator = Math.min(valor / somaFaltas, 1);
  box.innerHTML = `<p class="alloc-sug-title">${t('alloc.suggestion').replace('{v}', fmtMoney(valor, D))}</p>
    <ul class="alloc-sug">${faltas.map((r) => `<li><span>${escapeHtml(allocLabel(r.key))}</span><strong>${fmtMoney(r.falta * fator, D)}</strong><span class="hint">${((r.falta * fator / valor) * 100).toFixed(0)}%</span></li>`).join('')}</ul>
    <p class="hint">${t('alloc.sugHint')}</p>`;
}

/* ----- Pergunta sobre imposto de renda ----- */
function askTaxPreference() {
  return new Promise((resolve) => {
    if (state.settings.taxAsked || !state.positions.length) { resolve(); return; }
    openModal(`
      <h2>${t('tax.askTitle')}</h2>
      <p>${t('tax.askText')}</p>
      <ul class="sec-list">
        <li>📄 ${t('tax.ask1')}</li>
        <li>🧮 ${t('tax.ask2')}</li>
        <li>🔕 ${t('tax.ask3')}</li>
      </ul>
      <div class="sec-row">
        <button type="button" class="primary-btn" onclick="setTaxPreference(true)">${t('tax.askYes')}</button>
        <button type="button" class="secondary-btn" onclick="setTaxPreference(false)">${t('tax.askNo')}</button>
      </div>
      <button type="button" class="link-btn" onclick="closeModal()">${t('sec.offerLater')}</button>
    `);
    resolve();
  });
}
async function setTaxPreference(ativo) {
  state.settings.taxEnabled = ativo;
  state.settings.taxAsked = true;
  await put('settings', { key: 'taxEnabled', value: ativo });
  await put('settings', { key: 'taxAsked', value: true });
  closeModal();
  renderTaxSettings();
  renderSubTabs();
  if (!ativo && state.ui.tab === 'taxes') showTab('investments');
  showToast(t(ativo ? 'tax.on' : 'tax.off'));
}
function renderTaxSettings() {
  const box = document.getElementById('taxGroup');
  if (!box) return;
  box.innerHTML = `<h3>${t('tax.title')}</h3>
    <p class="hint">${t('tax.settingsHint')}</p>
    <label class="checkline"><input type="checkbox" id="taxToggle" ${state.settings.taxEnabled ? 'checked' : ''} onchange="setTaxPreference(this.checked)"> ${t('tax.enable')}</label>
    <p class="hint">${t('tax.soon')}</p>`;
}


/* ================= FASE 13 — Calculadora financeira =================
   Quatro módulos:
   1. Comum      — as quatro operações, %, memória e histórico (avaliador próprio,
                   sem eval, para nada digitado virar código executável).
   2. Juros      — simples ou compostos, com aportes, inflação e tabela ano a ano.
   3. Resolver   — estilo HP-12C: informe 4 entre capital (PV), aporte (PMT),
                   taxa (i), prazo (n) e montante (FV), e o app calcula o 5º.
   4. E se…      — "se eu tivesse comprado X em tal data": usa o histórico real
                   de preços e compara com CDB, Ibovespa e S&P 500. */

const CALC_MODULES = ['basic', 'interest', 'solve', 'whatif', 'tax'];
const calcUi = { module: 'basic', expr: '', acc: 0, history: [], memory: 0 };

/* ----- 1. Calculadora comum: tokenizador + shunting-yard ----- */
function calcTokenize(expr) {
  const tokens = [];
  const s = String(expr).replace(/\s+/g, '').replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      tokens.push({ t: 'num', v: Number(num) });
      continue;
    }
    if ('+-*/^()%'.includes(c)) { tokens.push({ t: c }); i++; continue; }
    throw new Error('CHAR:' + c);
  }
  return tokens;
}
function calcEval(expr) {
  const tokens = calcTokenize(expr);
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  const saida = [], ops = [];
  let anterior = null;
  tokens.forEach((tk) => {
    if (tk.t === 'num') saida.push(tk.v);
    else if (tk.t === '(') ops.push(tk.t);
    else if (tk.t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') saida.push(ops.pop());
      if (!ops.length) throw new Error('PAREN');
      ops.pop();
    } else if (tk.t === '%') {
      saida.push('%');
    } else {
      // menos unário: -5 ou 3*(-2)
      if (tk.t === '-' && (!anterior || anterior.t === '(' || '+-*/^'.includes(anterior.t))) { saida.push(0); }
      while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[tk.t]) saida.push(ops.pop());
      ops.push(tk.t);
    }
    anterior = tk;
  });
  while (ops.length) { const o = ops.pop(); if (o === '(') throw new Error('PAREN'); saida.push(o); }
  const pilha = [];
  saida.forEach((x) => {
    if (typeof x === 'number') { pilha.push(x); return; }
    if (x === '%') { pilha.push(pilha.pop() / 100); return; }
    const b = pilha.pop(), a = pilha.pop();
    if (a === undefined || b === undefined) throw new Error('EXPR');
    pilha.push(x === '+' ? a + b : x === '-' ? a - b : x === '*' ? a * b : x === '/' ? a / b : Math.pow(a, b));
  });
  if (pilha.length !== 1 || !isFinite(pilha[0])) throw new Error('EXPR');
  return pilha[0];
}
function calcKey(k) {
  const campo = document.getElementById('calcDisplay');
  if (!campo) return;
  if (k === '=') return calcRun();
  else if (k === '±') {
    const m = calcUi.expr.match(/(\d+[.,]?\d*)$/);
    if (m) calcUi.expr = calcUi.expr.slice(0, -m[1].length) + '(0-' + m[1] + ')';
  } else if (k === '√') {
    calcUi.expr += '^0.5';
  } else if (k === 'x²') {
    calcUi.expr += '^2';
  } else calcUi.expr += k;
  campo.value = calcUi.expr;
  campo.focus();
}

// Limpar display: C = tudo, CE = entrada
function calcClear(tipo) {
  const campo = document.getElementById('calcDisplay');
  if (!campo) return;
  if (tipo === 'all') {
    // C: Limpa tudo (expr, memória, histórico)
    calcUi.expr = '';
    calcUi.memory = 0;
    calcUi.history = [];
  } else if (tipo === 'entry') {
    // CE: Limpa só a entrada atual
    calcUi.expr = '';
  }
  campo.value = calcUi.expr;
  document.getElementById('calcResult').textContent = '0';
  document.getElementById('calcMem').textContent = calcUi.memory ? 'M' : '';
  renderCalcHistory();
  campo.focus();
}

// Backspace: remove último caractere
function calcBackspace() {
  const campo = document.getElementById('calcDisplay');
  if (!campo) return;
  calcUi.expr = calcUi.expr.slice(0, -1);
  campo.value = calcUi.expr;
  campo.focus();
}

// Limpar histórico
function calcClearHistory() {
  if (confirm('Deseja limpar todo o histórico de cálculos?')) {
    calcUi.history = [];
    renderCalcHistory();
  }
}
function calcRun() {
  const campo = document.getElementById('calcDisplay');
  const saida = document.getElementById('calcResult');
  calcUi.expr = campo.value;
  if (!calcUi.expr.trim()) return;
  try {
    const r = calcEval(calcUi.expr);
    calcUi.history.unshift({ expr: calcUi.expr, result: r });
    calcUi.history = calcUi.history.slice(0, 12);
    saida.textContent = fmtNumber(r);
    saida.className = 'calc-result';
    calcUi.expr = String(r);
    campo.value = calcUi.expr;
    renderCalcHistory();
  } catch (e) {
    saida.textContent = t('calc.err');
    saida.className = 'calc-result amount-out';
  }
}
function calcMemory(op) {
  const saida = document.getElementById('calcResult');
  let atual = 0;
  try { atual = calcEval(document.getElementById('calcDisplay').value || '0'); } catch (e) { atual = 0; }
  if (op === 'M+') calcUi.memory += atual;
  if (op === 'M-') calcUi.memory -= atual;
  if (op === 'MC') calcUi.memory = 0;
  if (op === 'MR') { calcKey(String(calcUi.memory)); return; }
  saida.textContent = 'M = ' + fmtNumber(calcUi.memory);
  document.getElementById('calcMem').textContent = calcUi.memory ? 'M' : '';
}
function renderCalcHistory() {
  const box = document.getElementById('calcHistory');
  if (!box) return;
  box.innerHTML = calcUi.history.map((h) => `<li><button type="button" onclick="calcKey('${h.result}')"><span>${escapeHtml(h.expr)}</span><strong>${fmtNumber(h.result)}</strong></button></li>`).join('');
}
function fmtNumber(n) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const casas = abs >= 1000 ? 2 : abs >= 1 ? 4 : 8;
  return Number(n.toFixed(casas)).toLocaleString('pt-BR', { maximumFractionDigits: casas });
}

/* ----- Matemática financeira -----
   Convenção: capital e aportes entram positivos; a taxa é por período. */
const powi = (i, n) => Math.pow(1 + i, n);
function fvOf({ pv, pmt, i, n, begin, simple }) {
  if (simple) {
    // Juros simples: cada aporte rende sobre o tempo que ficou aplicado
    const jurosAportes = pmt * i * ((n - (begin ? 0 : 1)) * n) / 2;
    return pv * (1 + i * n) + pmt * n + jurosAportes;
  }
  if (Math.abs(i) < 1e-12) return pv + pmt * n;
  return pv * powi(i, n) + pmt * ((powi(i, n) - 1) / i) * (begin ? 1 + i : 1);
}
function pvOf({ fv, pmt, i, n, begin }) {
  if (Math.abs(i) < 1e-12) return fv - pmt * n;
  return (fv - pmt * ((powi(i, n) - 1) / i) * (begin ? 1 + i : 1)) / powi(i, n);
}
function pmtOf({ pv, fv, i, n, begin }) {
  if (n <= 0) return 0;
  if (Math.abs(i) < 1e-12) return (fv - pv) / n;
  return (fv - pv * powi(i, n)) / (((powi(i, n) - 1) / i) * (begin ? 1 + i : 1));
}
function nOf({ pv, fv, pmt, i, begin }) {
  if (Math.abs(i) < 1e-12) return pmt !== 0 ? (fv - pv) / pmt : NaN;
  const aj = pmt * (begin ? 1 + i : 1) / i;
  const razao = (fv + aj) / (pv + aj);
  if (razao <= 0) return NaN;
  return Math.log(razao) / Math.log(1 + i);
}
// Taxa: busca por bisseção, que converge sempre no intervalo dado
function iOf({ pv, fv, pmt, n, begin, simple }) {
  const f = (x) => fvOf({ pv, pmt, i: x, n, begin, simple }) - fv;
  let lo = -0.9999, hi = 10;
  let flo = f(lo), fhi = f(hi);
  if (isNaN(flo) || isNaN(fhi) || flo * fhi > 0) return NaN;
  for (let k = 0; k < 300; k++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if (Math.abs(fm) < 1e-10 || hi - lo < 1e-14) return mid;
    if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
  }
  return (lo + hi) / 2;
}
// Conversão de taxas equivalentes (mensal ↔ anual, compostas)
const toMonthly = (anual) => powi(anual, 1 / 12) - 1;
const toYearly = (mensal) => powi(mensal, 12) - 1;

function calcRate(valor, unidade, porPeriodo) {
  const i = (Number(valor) || 0) / 100;
  const anual = unidade === 'year' ? i : toYearly(i);
  const mensal = unidade === 'year' ? toMonthly(i) : i;
  return porPeriodo === 'month' ? mensal : anual;
}
const numIn = (id, padrao) => {
  const el = document.getElementById(id);
  const v = el ? parseMoney(el.value) : null;
  return v == null ? (padrao === undefined ? null : padrao) : v;
};

/* ----- 2. Juros simples e compostos ----- */
function runInterest() {
  const pv = numIn('juPV', 0), pmt = numIn('juPMT', 0);
  const unidade = document.getElementById('juRateUnit').value;
  const periodo = document.getElementById('juPeriod').value; // month | year
  const i = calcRate(numIn('juRate', 0), unidade, periodo);
  const prazoUnid = document.getElementById('juTermUnit').value;
  const prazo = numIn('juTerm', 0);
  const n = Math.round(periodo === 'month' ? (prazoUnid === 'year' ? prazo * 12 : prazo) : (prazoUnid === 'year' ? prazo : prazo / 12));
  const simple = document.getElementById('juType').value === 'simple';
  const begin = document.getElementById('juBegin').checked;
  const inflacao = (numIn('juInflation', 0) || 0) / 100;
  const moeda = document.getElementById('juCurrency').value;
  const saida = document.getElementById('juResult');
  if (n <= 0 || (pv <= 0 && pmt <= 0)) { saida.innerHTML = `<p class="hint">${t('calc.fillHint')}</p>`; return; }

  const fv = fvOf({ pv, pmt, i, n, begin, simple });
  const investido = pv + pmt * n;
  const juros = fv - investido;
  const anos = periodo === 'month' ? n / 12 : n;
  const real = inflacao > 0 && anos > 0 ? fv / powi(inflacao, anos) : null;

  // Série por período para a tabela e o gráfico
  const pontos = [];
  for (let k = 0; k <= n; k++) {
    pontos.push({ k, saldo: fvOf({ pv, pmt, i, n: k, begin, simple }), investido: pv + pmt * k });
  }
  const passo = periodo === 'month' ? 12 : 1;
  const linhas = pontos.filter((p) => p.k > 0 && (p.k % passo === 0 || p.k === n));

  saida.innerHTML = `
    <div class="calc-cards">
      <div><span>${t('calc.finalAmount')}</span><strong class="amount-in">${fmtMoney(fv, moeda)}</strong></div>
      <div><span>${t('calc.invested')}</span><strong>${fmtMoney(investido, moeda)}</strong></div>
      <div><span>${t('calc.interestEarned')}</span><strong>${fmtMoney(juros, moeda)}${investido > 0 ? ` · ${fmtPct((juros / investido) * 100)}` : ''}</strong></div>
      ${real != null ? `<div><span>${t('calc.realValue')}</span><strong>${fmtMoney(real, moeda)}</strong></div>` : ''}
    </div>
    <p class="hint">${t('calc.rateEquiv').replace('{m}', (calcRate(numIn('juRate', 0), unidade, 'month') * 100).toFixed(4).replace('.', ',')).replace('{a}', (calcRate(numIn('juRate', 0), unidade, 'year') * 100).toFixed(2).replace('.', ','))}</p>
    <div id="juChart" class="nav-chart calc-chart"></div>
    <details class="calc-table"><summary>${t('calc.showTable')}</summary>
      <div class="table-scroll"><table class="mini-table">
        <thead><tr><th>${t(periodo === 'month' ? 'calc.year' : 'calc.period')}</th><th>${t('calc.invested')}</th><th>${t('calc.balance')}</th><th>${t('calc.interestEarned')}</th></tr></thead>
        <tbody>${linhas.map((p) => `<tr><td>${periodo === 'month' ? (p.k / 12).toFixed(p.k % 12 ? 1 : 0).replace('.', ',') : p.k}</td>
          <td>${fmtMoney(p.investido, moeda)}</td><td><strong>${fmtMoney(p.saldo, moeda)}</strong></td>
          <td class="amount-in">${fmtMoney(p.saldo - p.investido, moeda)}</td></tr>`).join('')}</tbody>
      </table></div>
    </details>`;
  drawCalcChart('juChart', pontos, moeda, periodo);
}

// Área empilhada simples: investido embaixo, juros acima
function drawCalcChart(id, pontos, moeda, periodo) {
  const box = document.getElementById(id);
  if (!box || pontos.length < 2) return;
  const W = 720, H = 240, padL = 70, padR = 12, padT = 12, padB = 28;
  const max = Math.max(...pontos.map((p) => p.saldo), 1);
  const X = (k) => padL + (k / (pontos.length - 1)) * (W - padL - padR);
  const Y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const area = (campo, cor, op) => `<path d="M${X(0)},${Y(0)} ${pontos.map((p) => `L${X(p.k).toFixed(1)},${Y(p[campo]).toFixed(1)}`).join(' ')} L${X(pontos.length - 1)},${Y(0)} Z" fill="${cor}" fill-opacity="${op}"/>`;
  const pos = getComputedStyle(document.documentElement).getPropertyValue('--positive').trim() || '#15803d';
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('calc.chartTitle')}">`;
  for (let g = 0; g <= 4; g++) {
    const v = (max * g) / 4;
    svg += `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--border)"/>
      <text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${fmtCompact(v)}</text>`;
  }
  svg += area('saldo', pos, 0.25) + area('investido', 'var(--muted)', 0.35);
  svg += `<path d="${pontos.map((p, j) => `${j ? 'L' : 'M'}${X(p.k).toFixed(1)},${Y(p.saldo).toFixed(1)}`).join(' ')}" fill="none" stroke="${pos}" stroke-width="2"/>`;
  const marcas = Math.min(6, pontos.length);
  for (let m = 0; m < marcas; m++) {
    const k = Math.round((m * (pontos.length - 1)) / (marcas - 1 || 1));
    const rotulo = periodo === 'day'
      ? ((pontos[k] && pontos[k].label) || '').slice(2).split('-').reverse().join('/')
      : periodo === 'month' ? (k / 12 >= 1 ? (k / 12).toFixed(0) + 'a' : k + 'm') : k + 'a';
    svg += `<text x="${X(k)}" y="${H - 8}" text-anchor="${m === 0 ? 'start' : m === marcas - 1 ? 'end' : 'middle'}" font-size="11" fill="var(--muted)">${rotulo}</text>`;
  }
  box.innerHTML = svg + '</svg>';
}

/* ----- 3. Resolver (PV, PMT, i, n, FV) ----- */
function runSolve() {
  const alvo = document.querySelector('input[name="solveFor"]:checked').value;
  const emprestimo = document.getElementById('slMode').value === 'loan';
  // No financiamento o dinheiro entra (PV) e as parcelas saem: sinais opostos
  const sinal = emprestimo ? -1 : 1;
  const periodo = document.getElementById('slPeriod').value;
  const begin = document.getElementById('slBegin').checked;
  const moeda = document.getElementById('slCurrency').value;
  const saida = document.getElementById('slResult');
  const pvEntrada = numIn('slPV', 0), pmt = numIn('slPMT', 0), fv = numIn('slFV', 0);
  const pv = pvEntrada * sinal;
  const unidade = document.getElementById('slRateUnit').value;
  const i = calcRate(numIn('slRate', 0), unidade, periodo);
  const prazoUnid = document.getElementById('slTermUnit').value;
  const prazoBruto = numIn('slTerm', 0);
  const n = periodo === 'month' ? (prazoUnid === 'year' ? prazoBruto * 12 : prazoBruto) : (prazoUnid === 'year' ? prazoBruto : prazoBruto / 12);

  let valor = NaN, texto = '', extra = '';
  if (alvo === 'fv') { valor = fvOf({ pv, pmt, i, n, begin }); texto = fmtMoney(valor, moeda); }
  else if (alvo === 'pv') { valor = pvOf({ fv, pmt, i, n, begin }) * sinal; texto = fmtMoney(valor, moeda); }
  else if (alvo === 'pmt') { valor = pmtOf({ pv, fv, i, n, begin }); texto = fmtMoney(valor, moeda); }
  else if (alvo === 'n') {
    valor = nOf({ pv, fv, pmt, i, begin });
    const meses = periodo === 'month' ? valor : valor * 12;
    texto = isFinite(valor) ? t('calc.nResult').replace('{n}', valor.toFixed(1).replace('.', ','))
      .replace('{p}', t(periodo === 'month' ? 'calc.months' : 'calc.years'))
      .replace('{y}', (meses / 12).toFixed(1).replace('.', ',')) : '—';
  } else {
    valor = iOf({ pv, fv, pmt, n, begin });
    if (isFinite(valor)) {
      const mensal = periodo === 'month' ? valor : toMonthly(valor);
      texto = `${(valor * 100).toFixed(4).replace('.', ',')}% ${t(periodo === 'month' ? 'calc.perMonth' : 'calc.perYear')}`;
      extra = t('calc.rateEquiv').replace('{m}', (mensal * 100).toFixed(4).replace('.', ',')).replace('{a}', (toYearly(mensal) * 100).toFixed(2).replace('.', ','));
    } else texto = '—';
  }
  const total = alvo === 'pmt' ? valor * (isFinite(n) ? n : 0) : pmt * (isFinite(n) ? n : 0);
  saida.innerHTML = !isFinite(valor)
    ? `<p class="amount-out">${t('calc.noSolution')}</p>`
    : `<div class="calc-cards">
        <div><span>${t('calc.f.' + alvo)}</span><strong class="amount-in">${texto}</strong></div>
        ${alvo !== 'i' && alvo !== 'n' ? `<div><span>${t('calc.totalPaid')}</span><strong>${fmtMoney(Math.abs(pv) + Math.abs(total), moeda)}</strong></div>` : ''}
      </div>${extra ? `<p class="hint">${extra}</p>` : ''}`;
}
function onSolveTargetChange() {
  const alvo = document.querySelector('input[name="solveFor"]:checked').value;
  ['pv', 'pmt', 'rate', 'term', 'fv'].forEach((campo) => {
    const mapa = { pv: 'pv', pmt: 'pmt', rate: 'i', term: 'n', fv: 'fv' };
    const wrap = document.getElementById('slWrap-' + campo);
    if (wrap) wrap.classList.toggle('is-target', mapa[campo] === alvo);
    const input = document.getElementById('sl' + campo.toUpperCase().slice(0, 1) + campo.slice(1));
  });
  runSolve();
}

/* ----- 4. "E se eu tivesse comprado" ----- */
let whatIfAsset = null;

async function whatIfLookup() {
  const entrada = document.getElementById('wiTicker').value.trim();
  const info = document.getElementById('wiInfo');
  const btn = document.getElementById('wiSearch');
  if (!entrada) { showToast(t('mkt.noTicker')); return; }
  busy(btn, true, t('mkt.searching'));
  info.classList.remove('hidden');
  info.innerHTML = `<span class="hint">${t('mkt.searching')}</span>`;
  try {
    const a = await resolveAsset(entrada);
    whatIfAsset = a;
    info.innerHTML = `<div class="lookup-name">${escapeHtml(a.name)} <span class="tag">${escapeHtml(a.ticker)}</span></div>
      <div>${a.exchange ? escapeHtml(a.exchange) + ' — ' : ''}<strong>${fmtMoney(a.price, a.currency)}</strong> <span class="hint">${t('calc.todayPrice')}</span></div>`;
    runWhatIf();
  } catch (e) {
    whatIfAsset = null;
    info.innerHTML = `<span class="amount-out">${escapeHtml(e.message || String(e))}</span>`;
  } finally { busy(btn, false); }
}

async function runWhatIf() {
  const saida = document.getElementById('wiResult');
  if (!whatIfAsset) { saida.innerHTML = `<p class="hint">${t('calc.wiSearchFirst')}</p>`; return; }
  const data = document.getElementById('wiDate').value;
  const valor = numIn('wiAmount', 0);
  const mensal = numIn('wiMonthly', 0) || 0;
  const comparar = document.getElementById('wiBench').value;
  if (!data || valor <= 0) { saida.innerHTML = `<p class="hint">${t('calc.fillHint')}</p>`; return; }
  if (data >= todayISO()) { saida.innerHTML = `<p class="amount-out">${t('calc.wiFutureDate')}</p>`; return; }
  saida.innerHTML = `<p class="hint">${t('mkt.loadingHist')}</p>`;

  const moedaAtivo = whatIfAsset.currency;
  let hist = [];
  try { hist = await fetchHistory({ ticker: whatIfAsset.ticker, market: whatIfAsset.market }, () => { saida.innerHTML = `<p class="hint">${t('mkt.rateWait')}</p>`; }); }
  catch (e) { /* segue sem histórico */ }
  const precoInicial = closeAt(hist, data);
  if (!precoInicial) {
    saida.innerHTML = `<p class="amount-out">${t('calc.wiNoHistory').replace('{d}', data.split('-').reverse().join('/'))}</p>`;
    return;
  }
  const precoHoje = closeAt(hist, todayISO()) || whatIfAsset.price;

  // Aportes: o inicial na data escolhida e, se pedido, um por mês até hoje
  const aportes = [{ date: data, amount: valor }];
  if (mensal > 0) {
    const d = new Date(data + 'T12:00:00Z');
    d.setUTCMonth(d.getUTCMonth() + 1);
    while (d.toISOString().slice(0, 10) < todayISO()) {
      aportes.push({ date: d.toISOString().slice(0, 10), amount: mensal });
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
  }
  let cotas = 0, investido = 0;
  aportes.forEach((ap) => {
    const p = closeAt(hist, ap.date) || precoHoje;
    cotas += ap.amount / p; investido += ap.amount;
  });
  const hoje = cotas * precoHoje;
  const lucro = hoje - investido;
  const anos = Math.max((new Date(todayISO()) - new Date(data)) / (365.25 * 86400000), 0.01);
  let cagr;
  if (aportes.length > 1) {
    // Com vários aportes, a taxa correta é a TIR (cada aporte rende por tempo diferente)
    const meses = (d) => (new Date(todayISO()) - new Date(d)) / (30.44 * 86400000);
    const f = (im) => aportes.reduce((sm, ap) => sm + ap.amount * Math.pow(1 + im, meses(ap.date)), 0) - hoje;
    let lo = -0.99, hi = 1;
    if (f(lo) * f(hi) <= 0) {
      for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; }
      cagr = (Math.pow(1 + (lo + hi) / 2, 12) - 1) * 100;
    } else cagr = (Math.pow(hoje / investido, 1 / anos) - 1) * 100;
  } else cagr = (Math.pow(hoje / investido, 1 / anos) - 1) * 100;

  // Mesma comparação, com o dinheiro no índice escolhido
  let compTexto = '';
  if (comparar !== 'none') {
    try {
      const cfg = cmpConfig();
      const nv = await benchmarkLevels(comparar, cfg, data, () => {});
      if (nv.points.length) {
        const conv = makeConverter(await fetchFxHistory(data));
        const nivel = (d) => conv(closeAt(nv.points, d) || nv.points[0][1], nv.currency, moedaAtivo, d);
        let cotasB = 0;
        aportes.forEach((ap) => { const p = nivel(ap.date); if (p) cotasB += ap.amount / p; });
        const valorB = cotasB * nivel(todayISO());
        const difer = hoje - valorB;
        compTexto = `<div class="calc-cards calc-cards-sub">
          <div><span>${escapeHtml(benchLabel(comparar, cfg))}</span><strong>${fmtMoney(valorB, moedaAtivo)}</strong></div>
          <div><span>${t('calc.wiDiff')}</span><strong class="${difer >= 0 ? 'amount-in' : 'amount-out'}">${fmtMoney(difer, moedaAtivo)}</strong></div>
        </div>`;
      }
    } catch (e) { compTexto = `<p class="hint">${t('cmp.benchFail').replace('{b}', t('cmp.b.' + comparar))}</p>`; }
  }

  const pontos = [];
  const passo = Math.max(1, Math.floor(hist.filter(([d]) => d >= data).length / 400));
  hist.filter(([d]) => d >= data).forEach(([d, p], idx) => {
    if (idx % passo) return;
    let c = 0, inv = 0;
    aportes.forEach((ap) => { if (ap.date <= d) { c += ap.amount / (closeAt(hist, ap.date) || p); inv += ap.amount; } });
    pontos.push({ k: pontos.length, saldo: c * p, investido: inv, label: d });
  });

  saida.innerHTML = `
    <div class="calc-cards">
      <div><span>${t('calc.wiBought')}</span><strong>${fmtQty(cotas)} × ${fmtMoney(precoInicial, moedaAtivo)}</strong></div>
      <div><span>${t('calc.invested')}</span><strong>${fmtMoney(investido, moedaAtivo)}</strong></div>
      <div><span>${t('calc.wiToday')}</span><strong>${fmtMoney(hoje, moedaAtivo)}</strong></div>
      <div><span>${t('calc.wiResult')}</span><strong class="${lucro >= 0 ? 'amount-in' : 'amount-out'}">${fmtMoney(lucro, moedaAtivo)} · ${fmtPct((lucro / investido) * 100)}</strong></div>
      <div><span>${t('calc.wiCagr')}</span><strong>${fmtPct(cagr)}</strong></div>
    </div>
    ${compTexto}
    <div id="wiChart" class="nav-chart calc-chart"></div>
    <p class="hint">${t('calc.wiNote')}</p>`;
  drawCalcChart('wiChart', pontos, moedaAtivo, 'day');
}

/* ----- Tela ----- */
function renderCalculator() {
  const painel = document.getElementById('tab-calculator');
  if (!painel || !painel.classList.contains('active')) return;
  const box = document.getElementById('calcBody');
  const nav = document.getElementById('calcTabs');
  if (!box || !nav) return;
  const modulos = CALC_MODULES.filter((m) => m !== 'tax' || state.settings.taxEnabled);
  if (!modulos.includes(calcUi.module)) calcUi.module = 'basic';
  nav.innerHTML = modulos.map((m) => `<button type="button" class="${calcUi.module === m ? 'active' : ''}" onclick="setCalcModule('${m}')">${t('calc.m.' + m)}</button>`).join('');
  const moedas = (id, atual) => `<select id="${id}">${CURRENCIES.map((c) => `<option value="${c.code}" ${c.code === (atual || state.settings.baseCurrency) ? 'selected' : ''}>${c.code}</option>`).join('')}</select>`;
  const unidadeTaxa = (id) => `<select id="${id}" onchange="${id.startsWith('ju') ? 'runInterest' : 'runSolve'}()"><option value="year">${t('calc.perYear')}</option><option value="month">${t('calc.perMonth')}</option></select>`;
  const unidadePrazo = (id) => `<select id="${id}" onchange="${id.startsWith('ju') ? 'runInterest' : 'runSolve'}()"><option value="year">${t('calc.years')}</option><option value="month">${t('calc.months')}</option></select>`;

  if (calcUi.module === 'basic') {
    const teclas = ['C', 'CE', '←', '(', ')', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+'];
    box.innerHTML = `
      <div class="calc-basic">
        <div class="calc-screen">
          <input id="calcDisplay" type="text" inputmode="decimal" autocomplete="off" aria-label="${t('calc.m.basic')}"
            value="${escapeHtml(calcUi.expr)}" onkeydown="if(event.key==='Enter'){event.preventDefault();calcRun();}">
          <span id="calcMem" class="calc-mem">${calcUi.memory ? 'M' : ''}</span>
          <div id="calcResult" class="calc-result">0</div>
        </div>
        <div class="calc-mem-row">
          ${['MC', 'MR', 'M+', 'M-'].map((m) => `<button type="button" class="secondary-btn" onclick="calcMemory('${m}')">${m}</button>`).join('')}
          <button type="button" class="secondary-btn" onclick="calcKey('±')">±</button>
          <button type="button" class="secondary-btn" onclick="calcKey('√')">√</button>
          <button type="button" class="secondary-btn" onclick="calcKey('x²')">x²</button>
        </div>
        <div class="calc-pad">
          ${teclas.map((k) => {
            let clickAction = k;
            if (k === 'C') clickAction = "calcClear('all')";
            else if (k === 'CE') clickAction = "calcClear('entry')";
            else if (k === '←') clickAction = "calcBackspace()";
            else clickAction = "calcKey('" + (k === '−' ? '-' : k === '×' ? '*' : k === '÷' ? '/' : k) + "')";
            
            return `<button type="button" class="calc-key ${'÷×−+'.includes(k) ? 'op' : ['C', 'CE', '←'].includes(k) ? 'fn' : ''}" onclick="${clickAction}">${k}</button>`;
          }).join('')}
          <button type="button" class="calc-key eq" onclick="calcRun()">=</button>
        </div>
        <div class="calc-history-header">
          <h4>${t('calc.history') || 'Histórico'}</h4>
          ${calcUi.history.length > 0 ? '<button type="button" class="secondary-btn" onclick="calcClearHistory()" style="font-size:0.8em">Limpar</button>' : ''}
        </div>
        <ul id="calcHistory" class="calc-history"></ul>
      </div>`;
    renderCalcHistory();
    return;
  }

  if (calcUi.module === 'interest') {
    box.innerHTML = `
      <div class="calc-form">
        <label>${t('calc.type')}<select id="juType" onchange="runInterest()"><option value="compound">${t('calc.compound')}</option><option value="simple">${t('calc.simple')}</option></select></label>
        <label>${t('calc.pv')}<input id="juPV" type="text" inputmode="decimal" value="1000" oninput="runInterest()"></label>
        <label>${t('calc.pmt')}<input id="juPMT" type="text" inputmode="decimal" value="100" oninput="runInterest()"></label>
        <label>${t('calc.rate')}<span class="calc-inline"><input id="juRate" type="text" inputmode="decimal" value="10" oninput="runInterest()">${unidadeTaxa('juRateUnit')}</span></label>
        <label>${t('calc.term')}<span class="calc-inline"><input id="juTerm" type="text" inputmode="decimal" value="10" oninput="runInterest()">${unidadePrazo('juTermUnit')}</span></label>
        <label>${t('calc.period')}<select id="juPeriod" onchange="runInterest()"><option value="month">${t('calc.monthly')}</option><option value="year">${t('calc.yearly')}</option></select></label>
        <label>${t('calc.inflation')}<input id="juInflation" type="text" inputmode="decimal" placeholder="0" oninput="runInterest()"></label>
        <label>${t('cmp.currency')}${moedas('juCurrency')}</label>
        <label class="checkline"><input type="checkbox" id="juBegin" onchange="runInterest()"> ${t('calc.begin')}</label>
      </div>
      <div id="juResult" class="calc-out"></div>`;
    document.getElementById('juCurrency').addEventListener('change', runInterest);
    runInterest();
    return;
  }

  if (calcUi.module === 'solve') {
    const campo = (id, chave, valor, extra) => `
      <div class="calc-field" id="slWrap-${chave}">
        <label>${t('calc.f.' + { pv: 'pv', pmt: 'pmt', rate: 'i', term: 'n', fv: 'fv' }[chave])}
          <span class="calc-inline"><input id="${id}" type="text" inputmode="decimal" value="${valor}" oninput="runSolve()">${extra || ''}</span>
        </label>
        <label class="calc-radio"><input type="radio" name="solveFor" value="${{ pv: 'pv', pmt: 'pmt', rate: 'i', term: 'n', fv: 'fv' }[chave]}" onchange="onSolveTargetChange()" ${chave === 'fv' ? 'checked' : ''}> ${t('calc.solveThis')}</label>
      </div>`;
    box.innerHTML = `
      <p class="hint">${t('calc.solveHint')}</p>
      <label class="calc-mode">${t('calc.mode')}
        <select id="slMode" onchange="runSolve()">
          <option value="invest">${t('calc.modeInvest')}</option>
          <option value="loan">${t('calc.modeLoan')}</option>
        </select>
      </label>
      <div class="calc-form calc-solve">
        ${campo('slPV', 'pv', '10000')}
        ${campo('slPMT', 'pmt', '500')}
        ${campo('slRate', 'rate', '12', unidadeTaxa('slRateUnit'))}
        ${campo('slTerm', 'term', '5', unidadePrazo('slTermUnit'))}
        ${campo('slFV', 'fv', '0')}
        <label>${t('calc.period')}<select id="slPeriod" onchange="runSolve()"><option value="month">${t('calc.monthly')}</option><option value="year">${t('calc.yearly')}</option></select></label>
        <label>${t('cmp.currency')}${moedas('slCurrency')}</label>
        <label class="checkline"><input type="checkbox" id="slBegin" onchange="runSolve()"> ${t('calc.begin')}</label>
      </div>
      <div id="slResult" class="calc-out"></div>
      <p class="hint">${t('calc.solveExample')}</p>`;
    document.getElementById('slCurrency').addEventListener('change', runSolve);
    onSolveTargetChange();
    return;
  }

  if (calcUi.module === 'tax') { renderTaxSim(box); return; }

  // "E se eu tivesse comprado"
  const doisAnos = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d.toISOString().slice(0, 10); })();
  box.innerHTML = `
    <p class="hint">${t('calc.wiHint')}</p>
    <div class="lookup-row">
      <input id="wiTicker" placeholder="TTWO, PETR4, US8740541094" onkeydown="if(event.key==='Enter'){event.preventDefault();whatIfLookup();}">
      <button id="wiSearch" type="button" class="secondary-btn" onclick="whatIfLookup()">${t('mkt.search')}</button>
    </div>
    <div id="wiInfo" class="lookup-info hidden"></div>
    <div class="calc-form">
      <label>${t('calc.wiDate')}<input id="wiDate" type="date" value="${doisAnos}" max="${todayISO()}" onchange="runWhatIf()"></label>
      <label>${t('calc.wiAmount')}<input id="wiAmount" type="text" inputmode="decimal" value="1000" oninput="runWhatIf()"></label>
      <label>${t('calc.wiMonthly')}<input id="wiMonthly" type="text" inputmode="decimal" placeholder="0" oninput="runWhatIf()"></label>
      <label>${t('cmp.reference')}<select id="wiBench" onchange="runWhatIf()">
        <option value="none">${t('cmp.refNone')}</option>
        <option value="cdi">${t('cmp.b.cdi')}</option>
        <option value="ibov">${t('cmp.b.ibov')}</option>
        <option value="spx">${t('cmp.b.spx')}</option>
      </select></label>
    </div>
    <div id="wiResult" class="calc-out"></div>`;
  if (whatIfAsset) runWhatIf();
}
function setCalcModule(m) { calcUi.module = m; renderCalculator(); }


/* ================= FASE 12 — Importador da B3 e proventos =================
   Leitor de .xlsx próprio (ZIP + XML), sem bibliotecas externas: funciona offline
   e não expõe o extrato a nenhum servidor.

   Regras do extrato de MOVIMENTAÇÃO da B3 (Área do Investidor):
   - "Transferência - Liquidação": Crédito = compra liquidada, Débito = venda liquidada.
   - "Compra"/"Venda" com Futuro/Opção/Termo: derivativos (day trade) — não formam posição.
   - "Compra"/"Venda" de ações só contam se o papel NÃO tiver liquidações no arquivo
     (evita contar a mesma operação duas vezes).
   - "Transferência" (sem liquidação) e itens "- Transferido": troca de custódia, neutros.
   - Dividendo, JCP e Rendimento: proventos recebidos (valor já líquido).
   - Desdobro/Bonificação: aumentam a quantidade.
   Também aceita o extrato de NEGOCIAÇÃO (Data do Negócio, Código de Negociação…). */

/* ----- XLSX ----- */
async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('NO_DECOMPRESS');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function unzip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let fim = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fim = i; break; }
  }
  if (fim < 0) throw new Error('NOT_XLSX');
  const total = dv.getUint16(fim + 10, true);
  let off = dv.getUint32(fim + 16, true);
  const arquivos = {};
  for (let k = 0; k < total && dv.getUint32(off, true) === 0x02014b50; k++) {
    const nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true);
    arquivos[tdec.decode(u8.subarray(off + 46, off + 46 + nl))] = {
      method: dv.getUint16(off + 10, true), size: dv.getUint32(off + 20, true), local: dv.getUint32(off + 42, true)
    };
    off += 46 + nl + el + cl;
  }
  return async (nome) => {
    const f = arquivos[nome];
    if (!f) return null;
    const ini = f.local + 30 + dv.getUint16(f.local + 26, true) + dv.getUint16(f.local + 28, true);
    const dados = u8.subarray(ini, ini + f.size);
    return tdec.decode(f.method === 0 ? dados : await inflateRaw(dados));
  };
}
function colIndex(ref) {
  const letras = String(ref).match(/^[A-Z]+/);
  if (!letras) return 0;
  return letras[0].split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
}
async function readXlsxRows(file) {
  const ler = unzip(await file.arrayBuffer());
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const compartilhadas = [];
  const ss = await ler('xl/sharedStrings.xml');
  if (ss) [...xml(ss).getElementsByTagName('si')].forEach((si) => compartilhadas.push([...si.getElementsByTagName('t')].map((x) => x.textContent).join('')));

  let caminho = 'xl/worksheets/sheet1.xml';
  const wb = await ler('xl/workbook.xml'), rels = await ler('xl/_rels/workbook.xml.rels');
  if (wb && rels) {
    const primeira = xml(wb).getElementsByTagName('sheet')[0];
    const rid = primeira && (primeira.getAttribute('r:id') || primeira.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
    const rel = [...xml(rels).getElementsByTagName('Relationship')].find((r) => r.getAttribute('Id') === rid);
    if (rel) {
      const alvo = rel.getAttribute('Target');
      caminho = alvo.startsWith('/') ? alvo.slice(1) : 'xl/' + alvo.replace(/^\.\//, '');
    }
  }
  const planilha = await ler(caminho);
  if (!planilha) throw new Error('NOT_XLSX');
  const linhas = [];
  [...xml(planilha).getElementsByTagName('row')].forEach((row) => {
    const cel = [];
    [...row.getElementsByTagName('c')].forEach((c) => {
      const tipo = c.getAttribute('t');
      const v = c.getElementsByTagName('v')[0];
      let valor = '';
      if (tipo === 's') valor = compartilhadas[Number(v && v.textContent)] || '';
      else if (tipo === 'inlineStr') valor = [...c.getElementsByTagName('t')].map((x) => x.textContent).join('');
      else if (v) valor = tipo === 'str' || tipo === 'b' ? v.textContent : (isNaN(Number(v.textContent)) ? v.textContent : Number(v.textContent));
      cel[colIndex(c.getAttribute('r'))] = valor;
    });
    if (cel.some((x) => x !== '' && x != null)) linhas.push(Array.from(cel, (x) => (x == null ? '' : x)));
  });
  return linhas;
}

/* ----- Normalização ----- */
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const chaveCab = (s) => semAcento(s).replace(/[^a-z0-9]/g, '');
function b3Num(v) {
  if (typeof v === 'number') return v;
  const s = String(v || '').replace(/R\$\s?/i, '').trim();
  if (!s || s === '-') return null;
  const n = s.includes(',') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s);
  return isNaN(n) ? null : n;
}
function b3Date(v) {
  if (typeof v === 'number') { // número de série do Excel
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const m = String(v || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const iso = String(v || '').match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? iso[0] : null;
}
function parseProduct(prod) {
  const txt = String(prod || '').trim();
  if (/^(futuro|opcao|opção|termo)\b/i.test(semAcento(txt))) return { derivative: true, name: txt };
  const m = txt.match(/^([A-Z]{4}\d{1,2})F?\s*-\s*(.+)$/);
  if (m) return { ticker: m[1], name: m[2].trim() };
  const so = txt.match(/^([A-Z]{4}\d{1,2})F?$/);
  if (so) return { ticker: so[1], name: so[1] };
  return { ticker: null, name: txt };
}
function guessAssetType(ticker, nome) {
  const n = semAcento(nome);
  if (/fii|imobiliari|fdo inv imob|fundo de investimento imob/.test(n)) return 'fii';
  if (/\betf\b|fundo de indice|ishares|index/.test(n)) return 'etf';
  if (/tesouro/.test(n)) return 'treasury';
  if (/cdb|lci|lca|debenture/.test(n)) return 'cdb';
  if (ticker && /3[2-9]$/.test(ticker)) return 'bdr';
  return 'stock';
}

/* ----- Interpretação ----- */
function detectB3Layout(cabecalho) {
  const k = cabecalho.map(chaveCab);
  const idx = (...nomes) => nomes.map((n) => k.indexOf(n)).find((i) => i >= 0);
  if (k.includes('movimentacao') && k.includes('produto')) {
    return { type: 'mov', io: idx('entradasaida'), date: idx('data'), mov: idx('movimentacao'), prod: idx('produto'),
      inst: idx('instituicao'), qty: idx('quantidade'), price: idx('precounitario'), value: idx('valordaoperacao') };
  }
  if (k.includes('codigodenegociacao')) {
    return { type: 'neg', date: idx('datadonegocio', 'data'), side: idx('tipodemovimentacao'), market: idx('mercado'),
      inst: idx('instituicao'), prod: idx('codigodenegociacao'), qty: idx('quantidade'), price: idx('preco'), value: idx('valor') };
  }
  return null;
}

function interpretB3(linhas) {
  const hi = linhas.findIndex((l) => detectB3Layout(l));
  if (hi < 0) throw new Error('NOT_B3');
  const L = detectB3Layout(linhas[hi]);
  const brutos = linhas.slice(hi + 1);
  const eventos = [], ignorados = {};
  const ignorar = (motivo, desc) => { ignorados[motivo] = ignorados[motivo] || { count: 0, examples: new Set() }; ignorados[motivo].count++; if (desc) ignorados[motivo].examples.add(desc); };
  const ocorrencias = {};
  const chaveImport = (partes) => {
    const base = partes.join('|');
    ocorrencias[base] = (ocorrencias[base] || 0) + 1; // linhas idênticas legítimas continuam distintas
    return 'b3|' + base + '|' + ocorrencias[base];
  };

  if (L.type === 'mov') {
    // Papéis com liquidação no arquivo: Compra/Venda deles seria contagem dupla
    const comLiquidacao = new Set();
    brutos.forEach((r) => {
      if (chaveCab(r[L.mov]) === 'transferencialiquidacao') { const p = parseProduct(r[L.prod]); if (p.ticker) comLiquidacao.add(p.ticker); }
    });
    brutos.forEach((r) => {
      const data = b3Date(r[L.date]);
      if (!data) return;
      const mov = chaveCab(r[L.mov]);
      const credito = chaveCab(r[L.io]).startsWith('cred');
      const p = parseProduct(r[L.prod]);
      const qtd = b3Num(r[L.qty]) || 0, preco = b3Num(r[L.price]), valor = b3Num(r[L.value]);
      const inst = String(r[L.inst] || '').trim();
      const rotulo = String(r[L.mov] || '').trim();
      const base = { date: data, ticker: p.ticker, name: p.name, broker: inst, qty: qtd, price: preco, value: valor, label: rotulo };
      const key = () => chaveImport([data, mov, r[L.prod], inst, qtd, preco, valor, credito ? 'C' : 'D']);

      if (mov.endsWith('transferido')) return ignorar('custody', rotulo);
      if (p.derivative) return ignorar('derivative', rotulo);
      if (mov === 'transferencialiquidacao' || ((mov === 'compra' || mov === 'venda') && !comLiquidacao.has(p.ticker))) {
        if (mov === 'transferencialiquidacao' && !p.ticker) return ignorar('unknown', rotulo + ' — ' + p.name);
        const lado = mov === 'compra' ? 'buy' : mov === 'venda' ? 'sell' : (credito ? 'buy' : 'sell');
        return eventos.push({ ...base, kind: 'trade', side: lado, ticker: p.ticker || p.name, importKey: key() });
      }
      if (mov === 'compra' || mov === 'venda') return ignorar('duplicate', rotulo);
      if (mov === 'transferencia') return ignorar('custody', rotulo);
      if (mov === 'dividendo' || mov === 'jurossobrecapitalproprio' || mov === 'rendimento' || mov === 'amortizacao' || mov === 'restituicaodecapital') {
        if (!credito || !valor) return ignorar('unknown', rotulo);
        const tipo = mov === 'dividendo' ? 'div' : mov === 'rendimento' ? 'rend' : mov === 'jurossobrecapitalproprio' ? 'jcp' : 'amort';
        return eventos.push({ ...base, kind: 'income', incomeType: tipo, importKey: key() });
      }
      if (mov === 'desdobro' || mov === 'bonificacaoemativos') {
        if (!p.ticker || !qtd) return ignorar('review', rotulo);
        return eventos.push({ ...base, kind: 'trade', side: 'bonus', value: mov === 'bonificacaoemativos' ? (valor || 0) : 0, importKey: key() });
      }
      if (mov === 'leilaodefracao' || mov === 'resgate') {
        if (!p.ticker && !p.name) return ignorar('review', rotulo);
        return eventos.push({ ...base, kind: 'trade', side: 'sell', ticker: p.ticker || p.name, importKey: key() });
      }
      if (mov.includes('subscricao') || mov.includes('cessaodedireitos') || mov.includes('direito')) return ignorar('rights', rotulo);
      if (mov.includes('emprestimo')) return ignorar('lending', rotulo);
      return ignorar('review', rotulo);
    });
  } else {
    brutos.forEach((r) => {
      const data = b3Date(r[L.date]);
      if (!data) return;
      const mercado = semAcento(r[L.market]);
      const p = parseProduct(r[L.prod]);
      const rotulo = String(r[L.side] || '').trim();
      if (/opc|futuro|termo/.test(mercado) || p.derivative) return ignorar('derivative', rotulo + ' ' + (r[L.market] || ''));
      if (!p.ticker) return ignorar('unknown', String(r[L.prod]));
      const lado = semAcento(rotulo).startsWith('c') ? 'buy' : 'sell';
      const qtd = b3Num(r[L.qty]) || 0, preco = b3Num(r[L.price]), valor = b3Num(r[L.value]);
      const inst = String(r[L.inst] || '').trim();
      eventos.push({ kind: 'trade', side: lado, date: data, ticker: p.ticker, name: p.ticker, broker: inst, qty: qtd, price: preco,
        value: valor != null ? valor : (preco != null ? preco * qtd : null), label: rotulo,
        importKey: chaveImport([data, lado, p.ticker, inst, qtd, preco, valor]) });
    });
  }
  // Mesma data: entradas antes das saídas, para não "vender o que ainda não chegou"
  const ordem = { buy: 0, bonus: 1, sell: 2 };
  eventos.sort((a, b) => a.date.localeCompare(b.date) || (ordem[a.side] ?? 3) - (ordem[b.side] ?? 3));
  return { layout: L.type, eventos, ignorados, linhas: brutos.length };
}

/* Resumo por ativo: simula a carteira para achar quantidade final, custo e avisos. */
function summarizeB3(eventos) {
  const jaImportadas = new Set(state.invmoves.map((m) => m.importKey).concat(state.dividends.map((d) => d.importKey)).filter(Boolean));
  const porAtivo = new Map();
  let repetidos = 0;
  eventos.forEach((ev) => {
    if (jaImportadas.has(ev.importKey)) { repetidos++; return; }
    const tk = ev.ticker || ev.name;
    if (!porAtivo.has(tk)) porAtivo.set(tk, { ticker: tk, name: ev.name, trades: [], incomes: [], qty: 0, cost: 0, income: 0, missingBuys: 0, noPrice: 0, brokers: new Set() });
    const a = porAtivo.get(tk);
    if (ev.name && ev.name.length > (a.name || '').length) a.name = ev.name;
    if (ev.broker) a.brokers.add(ev.broker);
    if (ev.kind === 'income') { a.incomes.push(ev); a.income += ev.value || 0; return; }
    let qtd = ev.qty, valor = ev.value;
    if (ev.side === 'buy' || ev.side === 'bonus') {
      if (ev.side === 'buy' && valor == null) { valor = ev.price != null ? ev.price * qtd : 0; if (!valor) a.noPrice++; }
      a.qty += qtd; a.cost += valor || 0;
    } else {
      if (qtd > a.qty + 1e-9) { a.missingBuys += qtd - a.qty; qtd = a.qty; } // vendeu o que comprou antes do período
      if (valor == null) valor = ev.price != null ? ev.price * ev.qty : 0;
      // se a quantidade foi reduzida, o valor da venda acompanha a proporção
      if (qtd < ev.qty && ev.qty > 0) valor = valor * (qtd / ev.qty);
      const fatia = a.qty > 0 ? qtd / a.qty : 0;
      a.cost -= a.cost * fatia; a.qty -= qtd;
    }
    a.trades.push({ ...ev, qty: qtd, value: valor });
  });
  porAtivo.forEach((a) => {
    a.qty = Math.round(a.qty * 1e8) / 1e8;
    a.existing = state.positions.find((p) => p.ticker && p.ticker === a.ticker) || null;
    a.manualMoves = a.existing ? invMovesOf(a.existing.id).filter((m) => m.source !== 'b3').length : 0;
    a.closed = a.qty <= 0;
  });
  return { ativos: [...porAtivo.values()].sort((x, y) => (x.closed - y.closed) || x.ticker.localeCompare(y.ticker)), repetidos };
}

/* ----- Tela do importador ----- */
let b3Preview = null;

function openB3Import() {
  b3Preview = null;
  openModal(`
    <h2>${t('b3.title')}</h2>
    <p class="hint">${t('b3.intro')}</p>
    <ol class="b3-steps">
      <li>${t('b3.step1')} <a href="https://www.investidor.b3.com.br" target="_blank" rel="noopener noreferrer">investidor.b3.com.br</a></li>
      <li>${t('b3.step2')}</li>
      <li>${t('b3.step3')}</li>
      <li>${t('b3.step4')}</li>
    </ol>
    <label class="b3-drop" for="b3File">
      <input id="b3File" type="file" accept=".xlsx,.csv" onchange="handleB3File(this.files[0])">
      <strong>${t('b3.choose')}</strong>
      <span class="hint">${t('b3.formats')}</span>
    </label>
    <p class="hint">🔒 ${t('b3.privacy')}</p>
    <div id="b3Result"></div>
  `, true);
}

async function handleB3File(file) {
  const box = document.getElementById('b3Result');
  if (!file || !box) return;
  box.innerHTML = `<p class="hint">${t('b3.reading')}</p>`;
  try {
    let linhas;
    if (/\.csv$/i.test(file.name)) {
      const texto = (await file.text()).replace(/^\uFEFF/, '');
      const sep = detectDelimiter(texto.split(/\r?\n/)[0]);
      linhas = texto.split(/\r?\n/).filter((l) => l.trim()).map((l) => splitCsvLine(l, sep));
    } else {
      linhas = await readXlsxRows(file);
    }
    const lido = interpretB3(linhas);
    b3Preview = { ...lido, ...summarizeB3(lido.eventos), fileName: file.name };
    renderB3Preview();
  } catch (e) {
    console.error('Importação B3:', e);
    const msg = { NOT_B3: t('b3.errNotB3'), NOT_XLSX: t('b3.errFile'), NO_DECOMPRESS: t('b3.errBrowser') }[e.message] || t('b3.errFile');
    box.innerHTML = `<p class="amount-out">${msg}</p>`;
  }
}
function splitCsvLine(linha, sep) {
  const out = []; let cur = '', aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (aspas) { if (ch === '"') { if (linha[i + 1] === '"') { cur += '"'; i++; } else aspas = false; } else cur += ch; }
    else if (ch === '"') aspas = true;
    else if (ch === sep) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function renderB3Preview() {
  const box = document.getElementById('b3Result');
  const P = b3Preview;
  if (!box || !P) return;
  const abertos = P.ativos.filter((a) => !a.closed);
  const fechados = P.ativos.filter((a) => a.closed);
  const totalProv = P.ativos.reduce((s, a) => s + a.income, 0);
  const incluirPadrao = (a) => !a.closed && !a.manualMoves;
  P.ativos.forEach((a) => { if (a.include === undefined) a.include = incluirPadrao(a); });

  const linha = (a) => {
    const avisos = [];
    if (a.missingBuys > 0) avisos.push(t('b3.warnMissing').replace('{n}', fmtQty(a.missingBuys)));
    if (a.noPrice) avisos.push(t('b3.warnNoPrice').replace('{n}', a.noPrice));
    if (a.manualMoves) avisos.push(t('b3.warnManual').replace('{n}', a.manualMoves));
    return `<tr class="${a.closed ? 'b3-closed' : ''}">
      <td><input type="checkbox" ${a.include ? 'checked' : ''} aria-label="${escapeHtml(a.ticker)}" onchange="b3Toggle('${escapeHtml(a.ticker)}', this.checked)"></td>
      <td><strong>${escapeHtml(a.ticker)}</strong><br><span class="hint">${escapeHtml(a.name || '')}</span></td>
      <td>${t(a.existing ? 'b3.existing' : 'b3.new')}</td>
      <td>${a.trades.length}</td>
      <td>${a.closed ? `<span class="hint">${t('b3.closed')}</span>` : fmtQty(a.qty)}</td>
      <td>${a.closed ? '—' : fmtMoney(a.cost, 'BRL')}</td>
      <td>${a.income ? fmtMoney(a.income, 'BRL') : '—'}</td>
      <td class="b3-warn">${avisos.map((w) => `<div>⚠️ ${w}</div>`).join('')}</td>
    </tr>`;
  };
  const motivos = Object.entries(P.ignorados);
  box.innerHTML = `
    <div class="b3-summary">
      <div><span>${t('b3.rows')}</span><strong>${P.linhas}</strong></div>
      <div><span>${t('b3.open')}</span><strong>${abertos.length}</strong></div>
      <div><span>${t('b3.closedCount')}</span><strong>${fechados.length}</strong></div>
      <div><span>${t('b3.income')}</span><strong>${fmtMoney(totalProv, 'BRL')}</strong></div>
    </div>
    ${P.repetidos ? `<p class="hint">↺ ${t('b3.repeated').replace('{n}', P.repetidos)}</p>` : ''}
    ${P.ativos.some((a) => a.missingBuys > 0) ? `<p class="sec-warning">⚠️ ${t('b3.missingExplain')}</p>` : ''}
    ${P.ativos.length ? `
    <div class="b3-bulk">
      <button type="button" class="link-btn" onclick="b3Select('open')">${t('b3.selOpen')}</button>
      <button type="button" class="link-btn" onclick="b3Select('all')">${t('b3.selAll')}</button>
      <button type="button" class="link-btn" onclick="b3Select('none')">${t('b3.selNone')}</button>
    </div>
    <div class="table-scroll"><table class="mini-table b3-table">
      <thead><tr><th></th><th>${t('mkt.asset')}</th><th>${t('b3.status')}</th><th>${t('b3.trades')}</th><th>${t('inv.quantity')}</th><th>${t('b3.cost')}</th><th>${t('b3.income')}</th><th>${t('b3.notes')}</th></tr></thead>
      <tbody>${P.ativos.map(linha).join('')}</tbody>
    </table></div>` : `<p class="empty-state">${t('b3.nothingNew')}</p>`}
    ${motivos.length ? `<details class="b3-ignored"><summary>${t('b3.ignoredTitle').replace('{n}', motivos.reduce((s, [, v]) => s + v.count, 0))}</summary>
      <ul>${motivos.map(([m, v]) => `<li><strong>${v.count}</strong> — ${t('b3.ign.' + m)}${v.examples.size ? ` <span class="hint">(${[...v.examples].slice(0, 4).map(escapeHtml).join(', ')})</span>` : ''}</li>`).join('')}</ul>
    </details>` : ''}
    <label class="checkline"><input type="checkbox" id="b3Income" checked> ${t('b3.importIncome')}</label>
    <label for="b3Account">${t('b3.account')}</label>
    <select id="b3Account">
      <option value="">${t('inv.noAccount')}</option>
      ${state.accounts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)} (${c.currency})</option>`).join('')}
    </select>
    <p class="hint">${t('b3.accountHint')}</p>
    <button type="button" id="b3Go" class="primary-btn" onclick="commitB3Import()" ${P.ativos.length ? '' : 'disabled'}>${t('b3.importN').replace('{n}', P.ativos.filter((a) => a.include).length)}</button>`;
}
function b3Toggle(tk, on) {
  const a = b3Preview && b3Preview.ativos.find((x) => x.ticker === tk);
  if (a) a.include = on;
  const btn = document.getElementById('b3Go');
  if (btn) btn.textContent = t('b3.importN').replace('{n}', b3Preview.ativos.filter((x) => x.include).length);
}
function b3Select(modo) {
  if (!b3Preview) return;
  b3Preview.ativos.forEach((a) => { a.include = modo === 'all' ? true : modo === 'none' ? false : !a.closed; });
  renderB3Preview();
}

async function commitB3Import() {
  const P = b3Preview;
  if (!P) return;
  const btn = document.getElementById('b3Go');
  if (btn) { btn.disabled = true; btn.textContent = t('b3.importing'); }
  const comProventos = document.getElementById('b3Income').checked;
  const conta = document.getElementById('b3Account').value || null;
  let nPos = 0, nMov = 0, nProv = 0;
  for (const a of P.ativos.filter((x) => x.include)) {
    let pos = a.existing;
    if (!pos) {
      const tipo = guessAssetType(a.ticker, a.name);
      pos = {
        id: uid(), name: a.name || a.ticker, ticker: /^[A-Z]{4}\d{1,2}$/.test(a.ticker) ? a.ticker : '',
        kind: 'quote', currency: 'BRL', assetClass: ['treasury', 'cdb'].includes(tipo) ? 'fixed' : 'variable',
        assetType: tipo, market: 'b3', exchange: 'B3', accountId: conta, color: nextFreeColor(), source: 'b3'
      };
      state.positions.push(pos);
      await put('positions', pos);
      nPos++;
    }
    for (const ev of a.trades) {
      const mov = {
        id: uid(), positionId: pos.id, type: ev.side, date: ev.date, quantity: ev.qty, amount: Math.round((ev.value || 0) * 100) / 100,
        source: 'b3', importKey: ev.importKey, broker: ev.broker
      };
      state.invmoves.push(mov);
      await put('invmoves', mov);
      nMov++;
    }
    if (comProventos) {
      for (const ev of a.incomes) {
        const d = {
          id: uid(), positionId: pos.id, ticker: a.ticker, type: ev.incomeType, payDate: ev.date,
          quantity: ev.qty || null, perShare: ev.price, amount: ev.value, currency: 'BRL',
          status: 'received', source: 'b3', importKey: ev.importKey, broker: ev.broker
        };
        await removeMatchingEstimate(d);
        state.dividends.push(d);
        await put('dividends', d);
        nProv++;
      }
    }
  }
  closeModal();
  renderAll();
  showToast(t('b3.done').replace('{p}', nPos).replace('{m}', nMov).replace('{d}', nProv));
}

/* ================= Proventos ================= */
const DIV_TYPES = ['div', 'jcp', 'rend', 'amort', 'other'];
const divUi = { year: 'all', status: 'all', ticker: 'all' };

function dividendsOfPosition(id) { return state.dividends.filter((d) => d.positionId === id); }

// Estimativa automática some quando chega o valor real (B3 ou manual)
async function removeMatchingEstimate(real) {
  const perto = (a, b) => a && b && Math.abs(new Date(a) - new Date(b)) <= 10 * 86400000;
  const alvo = state.dividends.filter((d) => d.source === 'auto' && d.status !== 'received' && d.ticker === real.ticker
    && (d.type === real.type || (d.type === 'rend' && real.type === 'div') || (d.type === 'div' && real.type === 'rend'))
    && perto(d.payDate || d.exDate, real.payDate));
  for (const d of alvo) {
    state.dividends = state.dividends.filter((x) => x.id !== d.id);
    await del('dividends', d.id);
  }
}

/* Busca automática na brapi: para cada provento com "data com" em que você tinha
   o papel, calcula quantidade × valor por ação. JCP sai com 15% de IR retido. */
async function fetchAutoDividends(silencioso) {
  const alvos = state.positions.filter((p) => p.ticker && marketOf(p) === 'b3' && invMovesOf(p.id).length);
  if (!alvos.length) { if (!silencioso) showToast(t('div.noB3')); return 0; }
  const btn = document.getElementById('btnDivFetch');
  if (btn) { btn.disabled = true; btn.textContent = t('div.fetching'); }
  let novos = 0, semPlano = 0, falhas = 0;
  const hoje = todayISO();
  for (const pos of alvos) {
    let lista;
    try {
      const r = brapiResult(await getJSON(brapiUrl('quote/' + encodeURIComponent(pos.ticker), { dividends: 'true' })));
      const dd = r && (r.dividendsData || (r.data && r.data.dividendsData));
      if (!dd) { semPlano++; continue; }
      lista = dd.cashDividends || [];
    } catch (e) { falhas++; continue; }
    const primeira = invMovesOf(pos.id)[0].date;
    for (const cd of lista) {
      const dataCom = String(cd.lastDatePrior || cd.approvedOn || '').slice(0, 10);
      if (!dataCom || dataCom < primeira) continue;
      const qtd = positionStateAt(pos, dataCom).quantity;
      if (qtd <= 0 || !(Number(cd.rate) > 0)) continue;
      const rotulo = semAcento(cd.label);
      const tipo = rotulo.includes('jcp') || rotulo.includes('juros') ? 'jcp' : rotulo.includes('rend') ? 'rend' : rotulo.includes('amort') ? 'amort' : 'div';
      const pag = cd.paymentDate ? String(cd.paymentDate).slice(0, 10) : null;
      const chave = `auto|${pos.ticker}|${tipo}|${dataCom}|${cd.rate}`;
      const bruto = qtd * Number(cd.rate);
      // Já existe o recebimento real? Então a estimativa não é necessária.
      const perto = (a, b) => a && b && Math.abs(new Date(a) - new Date(b)) <= 10 * 86400000;
      if (state.dividends.some((d) => d.source !== 'auto' && d.ticker === pos.ticker && perto(d.payDate, pag || dataCom))) continue;
      const existente = state.dividends.find((d) => d.importKey === chave);
      const reg = {
        ...(existente || {}), id: existente ? existente.id : uid(), positionId: pos.id, ticker: pos.ticker, type: tipo,
        exDate: dataCom, payDate: pag, quantity: qtd, perShare: Number(cd.rate),
        gross: bruto, amount: tipo === 'jcp' ? bruto * 0.85 : bruto, currency: pos.currency || 'BRL',
        status: existente && existente.status === 'received' ? 'received' : (pag && pag <= hoje ? 'toConfirm' : 'expected'),
        source: 'auto', importKey: chave
      };
      if (existente) state.dividends = state.dividends.map((d) => (d.id === reg.id ? reg : d));
      else { state.dividends.push(reg); novos++; }
      await put('dividends', reg);
    }
  }
  await put('settings', { key: HIST_PREFIX + 'divFetchedAt', value: hoje });
  if (btn) { btn.disabled = false; btn.textContent = t('div.fetch'); }
  renderDividends();
  if (!silencioso) {
    let msg = t('div.fetched').replace('{n}', novos);
    if (semPlano) msg += ' ' + t('div.noPlan');
    if (falhas) msg += ' ' + t('div.someFailed').replace('{n}', falhas);
    showToast(msg);
  }
  return novos;
}
async function autoDividendsDaily() {
  if (!apiKey('apiBrapi') && !state.positions.some((p) => marketOf(p) === 'b3')) return;
  if ((await getSetting(HIST_PREFIX + 'divFetchedAt')) === todayISO()) return;
  await fetchAutoDividends(true);
}

function divStatusLabel(s) { return t('div.st.' + (s || 'received')); }

function renderDividends() {
  const tbody = document.querySelector('#divTable tbody');
  if (!tbody) return;
  const base = state.settings.baseCurrency;
  const hoje = todayISO();
  const ano = hoje.slice(0, 4);
  const dozeMeses = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); })();
  const emBase = (d) => toBase(Number(d.amount) || 0, d.currency || 'BRL', d.payDate || hoje);
  const recebidos = state.dividends.filter((d) => d.status === 'received');
  const noAno = recebidos.filter((d) => (d.payDate || '').startsWith(ano)).reduce((s, d) => s + emBase(d), 0);
  const ult12 = recebidos.filter((d) => (d.payDate || '') >= dozeMeses).reduce((s, d) => s + emBase(d), 0);
  const aReceber = state.dividends.filter((d) => d.status !== 'received').reduce((s, d) => s + emBase(d), 0);
  const custo = consolidate(investmentTotals(hoje).cost, base, hoje).total;
  const yoc = custo > 0 ? (ult12 / custo) * 100 : 0;

  const cards = document.getElementById('divCards');
  if (cards) cards.innerHTML = `
    <div class="card"><h3>${t('div.year').replace('{y}', ano)}</h3><p class="big-number amount-in">${fmtMoney(noAno, base)}</p></div>
    <div class="card"><h3>${t('div.last12')}</h3><p class="big-number">${fmtMoney(ult12, base)}</p></div>
    <div class="card"><h3>${t('div.pending')}</h3><p class="big-number">${fmtMoney(aReceber, base)}</p></div>
    <div class="card"><h3>${t('div.yoc')}</h3><p class="big-number">${yoc.toFixed(2).replace('.', ',')}%</p><p class="sub-number">${t('div.yocHint')}</p></div>`;

  // Barras dos últimos 12 meses
  const barras = document.getElementById('divBars');
  if (barras) {
    const meses = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); meses.push(d.toISOString().slice(0, 7)); }
    const somas = meses.map((m) => recebidos.filter((d) => (d.payDate || '').startsWith(m)).reduce((s, d) => s + emBase(d), 0));
    const max = Math.max(...somas, 0.01);
    barras.innerHTML = somas.some((v) => v > 0) ? `<div class="div-bars" role="img" aria-label="${t('div.last12')}">${meses.map((m, i) => `
      <div class="div-bar" title="${m}: ${fmtMoney(somas[i], base)}">
        <span class="div-bar-fill" style="height:${Math.max((somas[i] / max) * 100, somas[i] ? 3 : 0)}%"></span>
        <span class="div-bar-label">${m.slice(5)}/${m.slice(2, 4)}</span>
      </div>`).join('')}</div>` : '';
  }

  // Filtros
  const anos = [...new Set(state.dividends.map((d) => (d.payDate || d.exDate || '').slice(0, 4)).filter(Boolean))].sort().reverse();
  const tickers = [...new Set(state.dividends.map((d) => d.ticker).filter(Boolean))].sort();
  const filtros = document.getElementById('divFilters');
  if (filtros) filtros.innerHTML = `
    <label><span>${t('div.fYear')}</span><select onchange="divUi.year=this.value;renderDividends()"><option value="all">${t('bill.all')}</option>${anos.map((a) => `<option ${divUi.year === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
    <label><span>${t('div.fStatus')}</span><select onchange="divUi.status=this.value;renderDividends()">${['all', 'received', 'toConfirm', 'expected'].map((s) => `<option value="${s}" ${divUi.status === s ? 'selected' : ''}>${s === 'all' ? t('bill.all') : divStatusLabel(s)}</option>`).join('')}</select></label>
    <label><span>${t('mkt.asset')}</span><select onchange="divUi.ticker=this.value;renderDividends()"><option value="all">${t('bill.all')}</option>${tickers.map((tk) => `<option ${divUi.ticker === tk ? 'selected' : ''}>${tk}</option>`).join('')}</select></label>
    ${state.dividends.some((d) => d.status === 'toConfirm') ? `<button type="button" class="secondary-btn" onclick="confirmAllDividends()">${t('div.confirmAll')}</button>` : ''}`;

  const lista = state.dividends
    .filter((d) => divUi.year === 'all' || (d.payDate || d.exDate || '').startsWith(divUi.year))
    .filter((d) => divUi.status === 'all' || d.status === divUi.status)
    .filter((d) => divUi.ticker === 'all' || d.ticker === divUi.ticker)
    .sort((a, b) => (b.payDate || b.exDate || '9999').localeCompare(a.payDate || a.exDate || '9999'));

  const thead = document.querySelector('#divTable thead tr');
  if (thead) thead.innerHTML = `<th>${t('div.payDate')}</th><th>${t('mkt.asset')}</th><th>${t('div.type')}</th><th>${t('inv.quantity')}</th><th>${t('div.perShare')}</th><th>${t('div.amount')}</th><th>${t('div.status')}</th><th>${t('accounts.actions')}</th>`;
  const vazio = document.getElementById('divEmpty');
  if (!lista.length) {
    tbody.innerHTML = '';
    if (vazio) { vazio.textContent = state.dividends.length ? t('news.emptyFilter') : t('div.empty'); vazio.classList.remove('hidden'); }
    return;
  }
  if (vazio) vazio.classList.add('hidden');
  tbody.innerHTML = lista.slice(0, 300).map((d) => `<tr>
    <td>${d.payDate ? d.payDate.split('-').reverse().join('/') : `<span class="hint">${t('div.tbd')}</span>`}${d.exDate ? `<br><span class="hint">${t('div.exDate')} ${d.exDate.split('-').reverse().join('/')}</span>` : ''}</td>
    <td>${colorDot(tickerColor(d.ticker))}<strong>${escapeHtml(d.ticker || '—')}</strong></td>
    <td>${t('div.t.' + (d.type || 'other'))}</td>
    <td>${d.quantity ? fmtQty(d.quantity) : '—'}</td>
    <td>${d.perShare != null ? fmtMoney(d.perShare, d.currency || 'BRL') : '—'}</td>
    <td><strong>${fmtMoney(Number(d.amount) || 0, d.currency || 'BRL')}</strong>${d.type === 'jcp' && d.source === 'auto' ? `<br><span class="hint">${t('div.jcpNet')}</span>` : ''}</td>
    <td><span class="api-badge ${d.status === 'received' ? 'badge-ok' : d.status === 'toConfirm' ? 'badge-warn' : 'badge-muted'}">${divStatusLabel(d.status)}</span>${d.source === 'b3' ? ' <span class="tag">B3</span>' : d.source === 'auto' ? ' <span class="tag">auto</span>' : ''}</td>
    <td>
      ${d.status !== 'received' ? `<button class="secondary-btn" onclick="confirmDividend('${d.id}')">${t('div.confirm')}</button>` : ''}
      <button class="secondary-btn" onclick="openDividendModal('${d.id}')">${t('modal.edit')}</button>
      <button class="secondary-btn" onclick="deleteDividend('${d.id}')">${t('modal.delete')}</button>
    </td>
  </tr>`).join('');
}

async function confirmDividend(id) {
  const d = state.dividends.find((x) => x.id === id);
  if (!d) return;
  const novo = { ...d, status: 'received', payDate: d.payDate || todayISO() };
  state.dividends = state.dividends.map((x) => (x.id === id ? novo : x));
  await put('dividends', novo);
  renderDividends();
}
async function confirmAllDividends() {
  for (const d of state.dividends.filter((x) => x.status === 'toConfirm')) await confirmDividend(d.id);
  showToast(t('toast.saved'));
}
async function deleteDividend(id) {
  if (!confirm(t('modal.delete') + '?')) return;
  state.dividends = state.dividends.filter((x) => x.id !== id);
  await del('dividends', id);
  renderDividends();
}

function openDividendModal(id) {
  const d = id ? state.dividends.find((x) => x.id === id) : null;
  if (!state.positions.length) { showToast(t('div.needPosition')); return; }
  openModal(`
    <h2>${t(d ? 'div.editTitle' : 'div.addTitle')}</h2>
    <label>${t('mkt.asset')}</label>
    <select id="dvPos">${state.positions.map((p) => `<option value="${p.id}" ${d && d.positionId === p.id ? 'selected' : ''}>${escapeHtml(p.ticker || p.name)} — ${escapeHtml(p.name)}</option>`).join('')}</select>
    <label>${t('div.type')}</label>
    <select id="dvType">${DIV_TYPES.map((k) => `<option value="${k}" ${d && d.type === k ? 'selected' : ''}>${t('div.t.' + k)}</option>`).join('')}</select>
    <label>${t('div.payDate')}</label>
    <input id="dvDate" type="date" value="${d && d.payDate ? d.payDate : todayISO()}">
    <label>${t('div.amount')}</label>
    <input id="dvAmount" type="text" inputmode="decimal" value="${d && d.amount != null ? String(d.amount).replace('.', ',') : ''}">
    <label>${t('inv.quantity')} <span class="hint">(${t('div.optional')})</span></label>
    <input id="dvQty" type="text" inputmode="decimal" value="${d && d.quantity ? d.quantity : ''}">
    <label>${t('div.status')}</label>
    <select id="dvStatus">${['received', 'toConfirm', 'expected'].map((s) => `<option value="${s}" ${(d ? d.status : 'received') === s ? 'selected' : ''}>${divStatusLabel(s)}</option>`).join('')}</select>
    <button class="primary-btn" onclick="saveDividend('${d ? d.id : ''}')">${t('modal.save')}</button>
  `);
}
async function saveDividend(id) {
  const pos = state.positions.find((p) => p.id === document.getElementById('dvPos').value);
  const valor = parseMoney(document.getElementById('dvAmount').value);
  if (!pos || valor == null || valor <= 0) { showToast(t('toast.invalidValue')); return; }
  const anterior = id ? state.dividends.find((x) => x.id === id) : null;
  const qtd = parseMoney(document.getElementById('dvQty').value);
  const d = {
    ...(anterior || {}), id: id || uid(), positionId: pos.id, ticker: pos.ticker || pos.name,
    type: document.getElementById('dvType').value, payDate: document.getElementById('dvDate').value,
    amount: valor, quantity: qtd || null, perShare: qtd ? valor / qtd : (anterior ? anterior.perShare : null),
    currency: pos.currency, status: document.getElementById('dvStatus').value, source: anterior ? anterior.source : 'manual'
  };
  if (!anterior && d.status === 'received') await removeMatchingEstimate(d);
  if (anterior) state.dividends = state.dividends.map((x) => (x.id === d.id ? d : x));
  else state.dividends.push(d);
  await put('dividends', d);
  closeModal();
  renderDividends();
  showToast(t('toast.saved'));
}


/* ================= Assistente de chaves de API =================
   Na abertura, testa as três chaves em paralelo (6 s cada), sem travar a tela.
   - Chave faltando ou RECUSADA pela API → abre o assistente.
   - Falha de rede, demora ou limite de uso → só um aviso discreto: a chave
     pode estar certa, e reabrir o assistente toda vez só incomodaria. */

const API_SERVICES = [
  { id: 'finnhub', key: 'apiFinnhub', name: 'Finnhub', signup: 'https://finnhub.io/register', dashboard: 'https://finnhub.io/dashboard' },
  { id: 'twelve', key: 'apiTwelve', name: 'Twelve Data', signup: 'https://twelvedata.com/register', dashboard: 'https://twelvedata.com/account/api-keys' },
  { id: 'brapi', key: 'apiBrapi', name: 'brapi.dev', signup: 'https://brapi.dev/dashboard', dashboard: 'https://brapi.dev/dashboard' }
];
const API_TIMEOUT = 6000;
const apiStatus = {}; // id → { status: 'ok'|'missing'|'invalid'|'error'|'testing', msg }

async function fetchTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { cache: 'no-store', signal: ctrl.signal }); }
  finally { clearTimeout(timer); }
}

// Teste de baixo custo de UMA chave. Não lança erro: devolve o diagnóstico.
async function testApiKey(serviceId, chave) {
  const k = String(chave || '').trim();
  if (!k) return { status: 'missing' };
  const url = {
    finnhub: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(k)}`,
    twelve: `https://api.twelvedata.com/quote?symbol=AAPL&apikey=${encodeURIComponent(k)}`,
    brapi: `https://brapi.dev/api/quote/PETR4?token=${encodeURIComponent(k)}`
  }[serviceId];
  let res, corpo = null;
  try {
    res = await fetchTimeout(url, API_TIMEOUT);
  } catch (e) {
    return { status: 'error', msg: e.name === 'AbortError' ? t('apiw.timeout') : t('apiw.network') };
  }
  try { corpo = await res.json(); } catch (e) { /* sem JSON */ }
  // A Twelve Data responde 200 com o erro dentro do corpo
  const codigo = corpo && corpo.status === 'error' ? Number(corpo.code) : res.status;
  const msgApi = corpo && (corpo.message || corpo.error);
  if (codigo === 401 || codigo === 403) return { status: 'invalid', msg: t('apiw.rejected') };
  if (codigo === 429) return { status: 'error', msg: t('apiw.limit') };
  if (!res.ok || codigo >= 400) return { status: 'error', msg: msgApi || 'HTTP ' + codigo };

  if (serviceId === 'finnhub' && Number(corpo && corpo.c) > 0) return { status: 'ok', msg: 'AAPL ' + fmtMoney(Number(corpo.c), 'USD') };
  if (serviceId === 'twelve' && Number(corpo && corpo.close) > 0) return { status: 'ok', msg: 'AAPL ' + fmtMoney(Number(corpo.close), 'USD') };
  if (serviceId === 'brapi') {
    const r = brapiResult(corpo);
    if (r && Number(r.regularMarketPrice) > 0) return { status: 'ok', msg: 'PETR4 ' + fmtMoney(Number(r.regularMarketPrice), 'BRL') };
  }
  return { status: 'error', msg: t('apiw.unexpected') };
}

// Chamada única na inicialização (depois de carregar as configurações salvas).
async function checkApiKeys() {
  API_SERVICES.forEach((s) => { apiStatus[s.id] = { status: 'testing' }; });
  const resultados = await Promise.all(API_SERVICES.map((s) => testApiKey(s.id, state.settings[s.key])));
  API_SERVICES.forEach((s, i) => { apiStatus[s.id] = resultados[i]; });

  const precisaConfigurar = resultados.some((r) => r.status === 'missing' || r.status === 'invalid');
  const comFalha = API_SERVICES.filter((s, i) => resultados[i].status === 'error').map((s) => s.name);
  const modalAberto = !document.getElementById('modal').classList.contains('hidden');

  if (precisaConfigurar && !modalAberto) openApiSetup();
  else if (comFalha.length) showToast(t('apiw.couldNotCheck').replace('{apis}', comFalha.join(', ')));
  return resultados;
}

function apiBadge(st) {
  const s = (st && st.status) || 'missing';
  const cls = { ok: 'badge-ok', invalid: 'badge-bad', error: 'badge-warn', testing: 'badge-muted', missing: 'badge-muted' }[s];
  return `<span class="api-badge ${cls}">${t('apiw.st.' + s)}</span>`;
}

function apiCardHtml(s) {
  const st = apiStatus[s.id] || { status: state.settings[s.key] ? 'testing' : 'missing' };
  return `<article class="api-card" id="apiCard-${s.id}">
    <header>
      <h3>${s.name}</h3>
      <span id="apiBadge-${s.id}">${apiBadge(st)}</span>
    </header>
    <p class="api-purpose">${t('apiw.purpose.' + s.id)}</p>
    <ol class="api-steps">
      <li><a href="${s.signup}" target="_blank" rel="noopener noreferrer">${t('apiw.step1')}</a></li>
      <li>${t('apiw.step2.' + s.id)} <a href="${s.dashboard}" target="_blank" rel="noopener noreferrer">${t('apiw.openDash')}</a></li>
      <li>${t('apiw.step3')}</li>
    </ol>
    <label for="apiw-${s.id}">${t('apiw.keyLabel')}</label>
    <div class="api-input-row">
      <input id="apiw-${s.id}" type="password" autocomplete="off" spellcheck="false" value="${escapeHtml(state.settings[s.key] || '')}"
        onkeydown="if(event.key==='Enter'){event.preventDefault();testAndSaveKey('${s.id}');}">
      <button type="button" class="secondary-btn api-eye" aria-label="${t('apiw.show')}" onclick="toggleKeyVisibility('${s.id}', this)">👁</button>
    </div>
    <button type="button" class="primary-btn api-save" id="apiwBtn-${s.id}" onclick="testAndSaveKey('${s.id}')">${t('apiw.testSave')}</button>
    <p class="api-msg" id="apiMsg-${s.id}" aria-live="polite">${st.msg ? escapeHtml(st.msg) : ''}</p>
  </article>`;
}

function openApiSetup() {
  openModal(`
    <h2>${t('apiw.title')}</h2>
    <p class="hint">${t('apiw.intro')}</p>
    <div class="api-cards">${API_SERVICES.map(apiCardHtml).join('')}</div>
    <p class="api-security">🔒 ${t('apiw.security')}</p>
    <div class="api-footer">
      <span id="apiwDone" class="amount-in ${API_SERVICES.every((s) => (apiStatus[s.id] || {}).status === 'ok') ? '' : 'hidden'}">${t('apiw.allSet')}</span>
      <button type="button" id="apiwClose" class="secondary-btn" onclick="closeModal()">${t(API_SERVICES.every((s) => (apiStatus[s.id] || {}).status === 'ok') ? 'apiw.finish' : 'apiw.later')}</button>
    </div>
  `, true);
  // Chaves ainda sem resultado (teste em andamento) atualizam o card quando terminar
  API_SERVICES.forEach((s) => {
    if ((apiStatus[s.id] || {}).status === 'testing' || (!apiStatus[s.id] && state.settings[s.key])) {
      testApiKey(s.id, state.settings[s.key]).then((r) => { apiStatus[s.id] = r; refreshApiCard(s.id); });
    }
  });
  const primeira = API_SERVICES.find((s) => ['missing', 'invalid'].includes((apiStatus[s.id] || {}).status));
  if (primeira) setTimeout(() => { const el = document.getElementById('apiw-' + primeira.id); if (el) el.focus(); }, 60);
}

function refreshApiCard(id) {
  const badge = document.getElementById('apiBadge-' + id);
  const msg = document.getElementById('apiMsg-' + id);
  const st = apiStatus[id] || {};
  if (badge) badge.innerHTML = apiBadge(st);
  if (msg) {
    msg.textContent = st.msg || '';
    msg.className = 'api-msg ' + (st.status === 'ok' ? 'amount-in' : st.status === 'invalid' ? 'amount-out' : '');
  }
  const done = document.getElementById('apiwDone');
  const tudoOk = API_SERVICES.every((s) => (apiStatus[s.id] || {}).status === 'ok');
  if (done) done.classList.toggle('hidden', !tudoOk);
  const fechar = document.getElementById('apiwClose');
  if (fechar) {
    fechar.textContent = t(tudoOk ? 'apiw.finish' : 'apiw.later');
    fechar.className = tudoOk ? 'primary-btn' : 'secondary-btn';
  }
}

function toggleKeyVisibility(id, btn) {
  const el = document.getElementById('apiw-' + id);
  if (!el) return;
  const mostrar = el.type === 'password';
  el.type = mostrar ? 'text' : 'password';
  btn.setAttribute('aria-label', t(mostrar ? 'apiw.hide' : 'apiw.show'));
}

async function testAndSaveKey(id) {
  const s = API_SERVICES.find((x) => x.id === id);
  const el = document.getElementById('apiw-' + id);
  const btn = document.getElementById('apiwBtn-' + id);
  if (!s || !el) return;
  const chave = el.value.trim();
  if (!chave) { apiStatus[id] = { status: 'missing', msg: t('apiw.paste') }; refreshApiCard(id); el.focus(); return; }
  if (btn) { btn.disabled = true; btn.textContent = t('api.testing'); }
  apiStatus[id] = { status: 'testing' };
  refreshApiCard(id);
  const r = await testApiKey(id, chave);
  // Salva se funcionou; se só a conexão falhou, salva também (a chave pode estar certa)
  if (r.status === 'ok' || r.status === 'error') {
    state.settings[s.key] = chave;
    await put('settings', { key: s.key, value: chave });
    renderApiSettings();
    if (r.status === 'error') r.msg = (r.msg || '') + ' ' + t('apiw.savedAnyway');
  }
  apiStatus[id] = r;
  refreshApiCard(id);
  if (btn) { btn.disabled = false; btn.textContent = t('apiw.testSave'); }
  if (r.status === 'ok') {
    const proxima = API_SERVICES.find((x) => (apiStatus[x.id] || {}).status !== 'ok');
    const alvo = proxima && document.getElementById('apiw-' + proxima.id);
    if (alvo) alvo.focus();
  }
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
          <div class="action-menu-container">
            <button class="action-circle-btn" onclick="toggleActionMenu(event)">${String.fromCharCode(10133)}</button>
            <div class="action-dropdown-menu">
              <button class="action-menu-item" onclick="openPositionChart('${pos.id}')">${t('mkt.chart')}</button>
              <button class="action-menu-item" onclick="openMoveModal('${pos.id}')">${t('inv.move')}</button>
              <button class="action-menu-item" onclick="openQuotesModal('${pos.id}')">${t('inv.quotes')}</button>
              <button class="action-menu-item" onclick="openPositionModal('${pos.id}')">${t('modal.edit')}</button>
              <button class="action-menu-item" onclick="deletePosition('${pos.id}')">${t('modal.delete')}</button>
            </div>
          </div>
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
  renderDividends();
  renderAllocation();
  renderWatchlist();
  renderCompare();
}

/* Quanto desta posição foi aplicado SEM sair do saldo da conta vinculada.
   É exatamente esse valor que aparece duas vezes no patrimônio. */
function positionUndeducted(pos) {
  if (!pos.accountId) return 0;
  const movs = invMovesOf(pos.id);
  const semLancamento = movs
    .filter((m) => m.type === 'buy' && !m.transactionId && m.source !== 'b3')
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
    <div class="lookup-kind">
      <span>${t('mkt.searchKind')}</span>
      <label><input type="radio" name="poKind" value="" checked> ${t('mkt.kindAuto')}</label>
      <label><input type="radio" name="poKind" value="stock"> ${t('mkt.kindStock')}</label>
      <label><input type="radio" name="poKind" value="crypto"> ${t('mkt.kindCrypto')}</label>
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
          <td>${t(m.type === 'buy' ? 'inv.buy' : m.type === 'bonus' ? 'b3.bonus' : 'inv.sell')}${m.source === 'b3' ? ' <span class="tag">B3</span>' : ''}</td>
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
  renderSecuritySettings();
  renderTaxSettings();
}

/* ---------- Modais ---------- */
function openModal(html, wide) {
  document.getElementById('modalBody').innerHTML = html;
  document.querySelector('#modal .modal-content').classList.toggle('modal-wide', !!wide);
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

/* Dashboard interativo - clique nos cards */
function clickDashboardCard(type) {
  console.log('clickDashboardCard called with type:', type);
  
  const tabMap = {
    'equity': 'flows',
    'accounts': 'flows',
    'investments': 'investments',
    'properties': 'registry',
    'vehicles': 'registry',
    'debt': 'registry'
  };
  
  const targetTab = tabMap[type];
  console.log('targetTab:', targetTab);
  if (!targetTab) return;
  
  // Find and click the tab button
  const tabBtn = document.querySelector(`#mainTabs .tab[data-group="${targetTab}"]`);
  console.log('tabBtn found:', !!tabBtn, tabBtn);
  
  if (tabBtn) {
    console.log('Clicking tab...');
    tabBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* Inicializar listeners dos cards do dashboard */
function setupDashboardCardListeners() {
  const main = document.querySelector('main');
  if (!main) return;
  
  // Remove event listener prévio para evitar duplicatas
  main.removeEventListener('click', handleDashboardCardClick);
  
  // Adicionar listener delegado no elemento main
  main.addEventListener('click', handleDashboardCardClick, false);
  
  console.log('setupDashboardCardListeners: Event delegation setup on main element');
}

function handleDashboardCardClick(e) {
  // Encontrar o card clicado - procurar por data-card-type
  let card = e.target.closest('[data-card-type]');
  if (!card) return;
  
  // Ignorar cliques em botões
  if (e.target.closest('button')) return;
  
  const type = card.getAttribute('data-card-type');
  if (type) {
    console.log('Dashboard card clicked:', type);
    clickDashboardCard(type);
  }
}

function toggleActionMenu(event) {
  event.stopPropagation();
  const menu = event.target.parentElement.querySelector('.action-dropdown-menu');
  const allMenus = document.querySelectorAll('.action-dropdown-menu');
  allMenus.forEach(m => {
    if (m !== menu) m.classList.remove('show');
  });
  menu.classList.toggle('show');
}

document.addEventListener('click', () => {
  document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
});

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
    <label>${t('accounts.holder')}</label>
    <select id="accHolder">
      <option value="individual" ${!a || a.holderType !== 'company' ? 'selected' : ''}>${t('accounts.holder.individual')}</option>
      <option value="company" ${a && a.holderType === 'company' ? 'selected' : ''}>${t('accounts.holder.company')}</option>
    </select>
    <label>${t('accounts.country')}</label>
    <select id="accCountry">
      ${COUNTRIES.map((c) => `<option value="${c}" ${(a && a.country === c) || (!a && c === 'BR') ? 'selected' : ''}>${t('country.' + c)}</option>`).join('')}
    </select>
    <p class="hint">${t('accounts.countryHint')}</p>
    <label>${t('accounts.initialBalance')}</label>
    <input id="accBalance" type="text" inputmode="decimal" value="${a ? a.initialBalance : '0'}">
    <button class="primary-btn" onclick="saveAccount('${a ? a.id : ''}')">${t('modal.save')}</button>
  `);
}

async function saveAccount(id) {
  const name = document.getElementById('accName').value.trim();
  if (!name) return;
  const anterior = id ? accountById(id) : null;
  const account = {
    ...(anterior || {}),
    id: id || uid(),
    name,
    type: document.getElementById('accType').value,
    currency: document.getElementById('accCurrency').value,
    holderType: document.getElementById('accHolder').value,
    country: document.getElementById('accCountry').value,
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

function buildBackupData() {
  return {
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
    dividends: state.dividends,
    // Chaves de API não saem do navegador: um backup é fácil de compartilhar por engano
    settings: Object.fromEntries(Object.entries(state.settings).filter(([k]) => !API_KEYS.includes(k) && !k.startsWith(HIST_PREFIX) && k !== SEC_KEY))
  };
}
async function exportJSON() {
  const data = buildBackupData();
  download(`prof-controller-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json');
  showToast(t('toast.exported'));
}

function exportCSV() {
  if (vaultOn() && !confirm(t('sec.plainExportWarn'))) return;
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
  if (vaultOn() && !confirm(t('sec.plainExportWarn'))) return;
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
    let data = JSON.parse(text);
    if (data.format === 'prof-controller-encrypted') data = await askBackupSecret(data);
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
    for (const dv of (data.dividends || [])) await put('dividends', dv);
    if (data.settings) {
      for (const [k, v] of Object.entries(data.settings)) {
        if (k === 'ui' || k === SEC_KEY || API_KEYS.includes(k) || k.startsWith(HIST_PREFIX)) continue;
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
  investments: ['investments', 'calculator', 'taxes'],
  registry: ['accounts', 'balances', 'budgets', 'fx', 'portfolio'],
  flows: ['transactions', 'payables', 'receivables'],
  news: ['news'],
  settings: ['settings']
};
function groupOf(tab) { return Object.keys(NAV_GROUPS).find((g) => NAV_GROUPS[g].includes(tab)) || 'dashboard'; }

// Telas que reaproveitam outra seção com um filtro fixo
const VIRTUAL_TABS = { payables: { panel: 'bills', kind: 'payable' }, receivables: { panel: 'bills', kind: 'receivable' } };

function showTab(tab) {
  if (tab === 'bills') tab = state.ui.lastSub.flows && state.ui.lastSub.flows !== 'transactions' ? state.ui.lastSub.flows : 'payables';
  const virtual = VIRTUAL_TABS[tab];
  const painel = virtual ? virtual.panel : tab;
  if (!document.getElementById('tab-' + painel)) tab = 'dashboard';
  if (virtual) {
    state.ui.billKind = virtual.kind;
    state.ui.tab = tab;
    const intro = document.querySelector('#tab-bills .tab-intro');
    const titulo = document.querySelector('#tab-bills .panel-header h2');
    const botao = document.getElementById('btnAddBill');
    if (intro) { intro.dataset.i18n = 'help.' + tab; intro.textContent = t('help.' + tab); }
    if (titulo) { titulo.dataset.i18n = 'tabs.' + tab; titulo.textContent = t('tabs.' + tab); }
    if (botao) { botao.dataset.i18n = virtual.kind === 'payable' ? 'bill.addPayable' : 'bill.addReceivable'; botao.textContent = t(botao.dataset.i18n); }
    renderBills();
  }
  const grupo = groupOf(tab);
  state.ui.lastSub[grupo] = tab;
  state.ui.tab = tab;
  document.querySelectorAll('#mainTabs .tab').forEach((b) => {
    const ativo = b.dataset.group === grupo;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-selected', ativo);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + (VIRTUAL_TABS[tab] ? VIRTUAL_TABS[tab].panel : tab)));
  const gear = document.getElementById('btnGear');
  if (gear) gear.classList.toggle('active', grupo === 'settings');
  renderSubTabs();
  if (tab === 'dashboard') { renderNAV(); renderYouVsMarket().catch((e) => console.warn('Você x Mercado:', e)); }
  if (tab === 'investments') renderCompare();
  if (tab === 'calculator') renderCalculator();
  if (tab === 'taxes') renderTaxes().catch((e) => console.warn('Impostos:', e));
  if (tab === 'news') { renderNews(); refreshNews(false).catch(() => {}); }
  window.scrollTo({ top: 0 });
}

function renderSubTabs() {
  const nav = document.getElementById('subTabs');
  if (!nav) return;
  const tab = state.ui.tab || 'dashboard';
  const telas = NAV_GROUPS[groupOf(tab)].filter((k) => k !== 'taxes' || state.settings.taxEnabled);
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

// REMOVIDO: Opções de tema agora são criadas pelo novo sistema em index.html
// function renderThemeOptions() {
//   const sel = document.getElementById('themeSelect');
//   if (!sel) return;
//   sel.innerHTML = ['gray', 'dark', 'gta-vi'].map((th) => `<option value="${th}">${t('theme.' + th)}</option>`).join('');
//   sel.value = state.settings.theme || 'gray';
// }

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
  on('btnApiWizard', 'click', openApiSetup);
  on('btnB3Import', 'click', openB3Import);
  on('btnDivFetch', 'click', () => fetchAutoDividends(false));
  on('btnDivAdd', 'click', () => openDividendModal());
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

  on('btnExportJSON', 'click', () => exportJSONPlain(false));
  on('btnExportEnc', 'click', exportEncryptedBackup);
  on('btnLockNow', 'click', lockNow);
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
  // renderThemeOptions(); // COMENTADO - Opções agora criadas pelo novo sistema em index.html
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
    // Idioma, tema e metadados de segurança ficam abertos: a tela de bloqueio precisa deles
    for (const k of ['lang', 'theme']) {
      const r = await rawGet('settings', k);
      if (r && r.value != null && !r._e) state.settings[k] = r.value;
    }
    const sec = await rawGet('settings', SEC_KEY);
    VAULT.meta = sec ? sec.value : null;
    applyLang();
    applyTheme();
    if (vaultOn()) await showLockScreen();
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
  renderSecuritySettings();

  if (vaultOn()) {
    startAutoLock();
  } else {
    // Oferece a proteção antes do assistente de chaves, para as telas não se sobreporem
    try { await offerSecuritySetup(false); } catch (e) { console.warn('Oferta de proteção:', e); }
  }
  startNewsSchedule();
  // Testa as chaves de API em segundo plano; abre o assistente só se faltar ou for recusada
  checkApiKeys().catch((e) => console.warn('Verificação das chaves:', e));
  // Proventos automáticos: no máximo uma busca por dia, em segundo plano
  autoDividendsDaily().catch((e) => console.warn('Proventos automáticos:', e));
  renderYouVsMarket().catch((e) => console.warn('Você x Mercado:', e));
  askTaxPreference().catch(() => {});

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  // Atualizar versão no footer
  const versionEl = document.getElementById('appVersion');
  if (versionEl) {
    versionEl.textContent = `ProF Controller v${APP_VERSION}`;
  }
}

init();
