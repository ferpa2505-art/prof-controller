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

const APP_VERSION = '1.0.0';

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
    'theme.gta-vi': 'GTA VI',
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
    'theme.default': 'Light',
    'theme.dark': 'Dark',
    'theme.gray': 'Gray',
    'theme.green': 'Green',
    'theme.blue': 'Blue',
    'theme.gta-vi': 'GTA VI',
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
    'theme.dark': 'Oscuro',
    'theme.green': 'Verde',
    'theme.blue': 'Azul',
    'theme.gta-vi': 'GTA VI',
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
  renderThemeOptions();
  renderAll();
}

function bindEvents() {
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



