# Fase 16: Alertas de Preço + Regras Fiscais Internacionais

**Status**: 📋 Planejamento  
**Data**: 18 Set 2026  
**Prioridade**: 🔴 ALTA  
**Complexidade**: 🟠 MÉDIA

---

## 🎯 Objetivo Geral

Implementar **alertas de preço em tempo real** e **tabela de alíquotas fiscais internacionais** para permitir que usuários:
1. Monitorem preços de ativos com alertas acima/abaixo de valores-alvo
2. Recebam notificações de navegador quando alertas disparam
3. Consultem alíquotas de IR dos 12 principais países/regiões

---

## 📚 Escopo

### ✅ Já Implementado (Fase 13)
- BCB API (SELIC, CDI, USD/BRL)
- IBOV fetch via Alpha Vantage
- Portfolio comparison dashboard
- IR tax assistant simplificado
- Market event notifications

### 🔧 Fase 16 - 4 Tarefas

1. **Tarefa 1**: IndexedDB store para alertas + UI de gestão
2. **Tarefa 2**: Lógica de verificação de preços + notificações
3. **Tarefa 3**: Tabela fiscal interativa (12 países)
4. **Tarefa 4**: Melhorias de servidor + documentação

---

## 📖 Detalhes das Tarefas

### TAREFA 1: IndexedDB + UI Alertas

#### 📦 Novo Store

```javascript
{
  name: 'priceAlerts',
  keyPath: 'id',
  indexes: [{ name: 'symbol', unique: false }]
}

// Estrutura:
{
  id: 'alert-uuid',
  symbol: 'PETR4',
  type: 'above' | 'below',
  targetPrice: 28.50,
  currency: 'BRL',
  triggerPrice: null,  // preço em que foi disparado
  triggered: false,
  createdAt: '2026-09-18T...',
  updatedAt: '2026-09-18T...',
  enabled: true,
  market: 'B3' | 'NYSE' | 'CRYPTO' | 'AUTO'
}
```

#### 🎨 UI Components

- **Botão**: "+ Novo Alerta de Preço" (em Investimentos > Ativos)
- **Modal**: Criar/editar alerta
  - Campo: Ticker (search + auto)
  - Campo: Tipo (Acima de / Abaixo de)
  - Campo: Preço-alvo
  - Toggle: Ativo/Inativo
  - Nota: "Máximo 3 alertas ativos"
- **Lista**: Alertas com status
  - Card por alerta
  - Badge: Distância do target (%)
  - Botão: Editar, Deletar
  - Checkbox: Ativar/Desativar

#### 🔧 Validações

- Máximo 3 alertas **ativos** simultaneamente
- Target price válido (> 0)
- Ticker único por tipo (não há 2 alertas "acima" para PETR4)
- Alertas desativados não contam no limite

---

### TAREFA 2: Lógica de Verificação + Notificações

#### 🔄 Função `checkPriceAlerts()`

```javascript
async function checkPriceAlerts() {
  // 1. Buscar todos os alertas ativos
  const alerts = await getAll('priceAlerts', r => r.enabled);
  
  // 2. Para cada alerta, buscar preço atual
  for (const alert of alerts) {
    const currentPrice = await fetchAssetPrice(alert.symbol, alert.market);
    if (!currentPrice) continue;
    
    // 3. Verificar se dispara
    const shouldTrigger = alert.type === 'above' 
      ? currentPrice >= alert.targetPrice
      : currentPrice <= alert.targetPrice;
    
    if (shouldTrigger && !alert.triggered) {
      // 4. Disparar notificação
      await triggerPriceAlert(alert, currentPrice);
      
      // 5. Marcar como disparado
      alert.triggered = true;
      alert.triggerPrice = currentPrice;
      alert.updatedAt = new Date().toISOString();
      await update('priceAlerts', alert);
      
      // 6. Adicionar ao histórico
      await addNotification({
        type: 'price_alert',
        title: `${alert.symbol}: Alerta de Preço`,
        message: `${alert.symbol} atingiu R$ ${currentPrice.toFixed(2)}`,
        relatedId: alert.id
      });
    }
  }
}

async function triggerPriceAlert(alert, currentPrice) {
  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`⚠️ Alerta: ${alert.symbol}`, {
      body: `${alert.type === 'above' ? '▲' : '▼'} ${alert.symbol} ${alert.type === 'above' ? '>=' : '<='} R$ ${alert.targetPrice.toFixed(2)} (Atual: R$ ${currentPrice.toFixed(2)})`,
      tag: `price-alert-${alert.symbol}`,
      icon: 'icon-192.png'
    });
  }
  
  // In-app notification
  showToast(`⚠️ Alerta: ${alert.symbol} - Preço alvo atingido!`);
}
```

#### ⏰ Scheduler

```javascript
async function scheduleAlertCheck() {
  // Verificar a cada 5 minutos se app estiver aberto
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      checkPriceAlerts().catch(e => console.warn('Erro ao verificar alertas:', e));
    }
  }, 5 * 60 * 1000);
}
```

#### 📱 Notificações

- **Tipo**: Browser + In-app
- **Conteúdo**: "PETR4: ▲ Atingiu R$ 28,50"
- **Badge**: Número de alertas disparados no dia
- **Ação**: Clicar abre card do ativo

#### ⚠️ **Limitação Sem Servidor**

```
❌ Problema: Verificação só funciona com app ABERTO
✅ Solução Atual: User deve deixar app aberto no navegador/aba
```

---

### TAREFA 3: Tabela Fiscal Interativa

#### 📊 Implementação

Usar dados do `TAX_RATES_RESEARCH_2026.md` já pesquisado.

#### 🎨 UI Components

- **Nova aba**: "Impostos" (em Investimentos ou Configurações Avançadas)
- **Seletor de país**: Dropdown com 12 países
- **Tabela dinâmica**: Alíquotas por faixa de renda
- **Comparador**: "Comparar 2 países" (slider lado-a-lado)
- **Calculadora**: Input de renda → resultado de IR estimado
- **Data de revisão**: "Dados atualizados em: 18/09/2026"

#### 🔧 Estrutura de Dados

```javascript
const taxRules = {
  'PT': {
    name: 'Portugal',
    currency: 'EUR',
    lastUpdate: '2026-09-18',
    pf: [ // Pessoa Física
      { min: 0, max: 7091, rate: 0.145, label: 'Até €7.091' },
      { min: 7091, max: 10700, rate: 0.23, label: 'Até €10.700' },
      // ...
    ],
    pj: 0.19, // Pessoa Jurídica
    notes: 'Imposto de solidariedade adicional acima de €80.640',
    exemptionLimit: 7091,
    source: 'Wikipedia - Tax rates in Europe'
  },
  'ES': { /* ... */ },
  'IT': { /* ... */ },
  // ... 12 países
};
```

#### 🧮 Função de Cálculo

```javascript
function estimateTaxByCountry(income, country, type = 'pf') {
  const rules = taxRules[country];
  if (!rules) return null;
  
  if (type === 'pf') {
    let tax = 0;
    for (const bracket of rules.pf) {
      if (income > bracket.min) {
        const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
        tax += taxableInThisBracket * bracket.rate;
      }
    }
    return { tax, rate: (tax / income * 100).toFixed(2) + '%' };
  } else {
    return { tax: income * rules.pj, rate: (rules.pj * 100) + '%' };
  }
}
```

---

### TAREFA 4: Servidor + Documentação

#### 🖥️ Alternativas para Melhorar (Future)

##### Opção 1: Service Worker + Background Sync ⭐ (Recomendado)
```
Vantagem: Sem servidor necessário
- SW continua ativo mesmo com app fechado
- Sincroniza a cada N minutos
- Suporte: Chrome 49+, Firefox 75+, Safari 15.1+

Limitação: Sistema pode "dormir" SW após horas inativo
Implementação: Registrar sync tag: 'check-price-alerts'
```

##### Opção 2: Firebase Cloud Messaging
```
Vantagem: Push notifications 24/7
Requer: Backend Firebase
Custo: Gratuito até 1M mensagens/mês
Ideal para: Produção com muitos usuários
```

##### Opção 3: Servidor Node.js + Cron
```
Vantagem: Controle total
Requer: Servidor rodando 24/7
Custo: $$$ (hosting)
Ideal para: App premium enterprise
```

#### 📝 Documentação

- **README_ALERTS.md**: Como criar/gerenciar alertas
- **LIMITATIONS.md**: Adicionar seção sobre verificação sem servidor
- **TAX_RATES_RESEARCH_2026.md**: Já criado ✅

#### 🔄 Plano de Melhoria Futura (Fase 17+)

```
Fase 17: Service Worker Background Sync
- Registrar 'check-price-alerts' sync tag
- Periodicity: A cada 10 min (configurável)
- Fallback: Se SW falhar, verificar ao abrir app

Fase 18: Push Notifications (optional)
- Integrar Firebase Cloud Messaging
- Permitir notificações mesmo com app fechado
```

---

## 📋 Checklist de Implementação

### Tarefa 1
- [ ] Adicionar `priceAlerts` store ao DB_VERSION 8
- [ ] Criar modal de novo alerta
- [ ] Renderizar lista de alertas
- [ ] Validar máximo 3 alertas ativos
- [ ] Implementar toggle ativo/inativo
- [ ] Adicionar botões editar/deletar
- [ ] Testar backup/restore com alertas

### Tarefa 2
- [ ] Implementar `fetchAssetPrice()` (usar quotes existentes)
- [ ] Implementar `checkPriceAlerts()`
- [ ] Implementar `triggerPriceAlert()`
- [ ] Implementar `scheduleAlertCheck()`
- [ ] Testar notificações do navegador
- [ ] Testar notificações in-app
- [ ] Documentar limitação de servidor

### Tarefa 3
- [ ] Criar aba "Impostos" em UI
- [ ] Implementar dropdown de país
- [ ] Renderizar tabela de alíquotas
- [ ] Implementar calculadora de IR
- [ ] Implementar comparador de países
- [ ] Adicionar data de última atualização
- [ ] Testar cálculos por país
- [ ] i18n: Traduzir nomes de países

### Tarefa 4
- [ ] Escrever README_ALERTS.md
- [ ] Escrever LIMITATIONS.md
- [ ] Criar PHASE17_PLAN.md (Future Server Sync)
- [ ] Fazer commit com todos os arquivos

---

## 🔗 Arquivos Afetados

```
app.js
├── DB_VERSION: 6 → 8
├── state.priceAlerts: []
├── state.notifications: (melhorado)
├── taxRules: { PT, ES, IT, ... }
├── checkPriceAlerts()
├── scheduleAlertCheck()
├── estimateTaxByCountry()
├── openAlertModal()
├── renderAlerts()
└── i18n: alertas + impostos

index.html
├── Nova aba "Impostos" (em Investimentos)
├── Botão "+ Novo Alerta"
├── Modal de alerta
├── Lista de alertas
├── Tabela de impostos
└── Calculadora de IR por país

styles.css
├── .price-alert-card
├── .tax-table
├── .tax-compare
└── .alert-badge

TAX_RATES_RESEARCH_2026.md ✅ (já criado)
```

---

## ⏱️ Estimativa de Tempo

| Tarefa | Horas | Status |
|--------|-------|--------|
| 1. Alertas (IndexedDB + UI) | 3h | 📋 TODO |
| 2. Verificação + Notif | 2h | 📋 TODO |
| 3. Tabela Fiscal | 2h | 📋 TODO |
| 4. Docs + Tests | 1h | 📋 TODO |
| **Total** | **8h** | **30% Pesquisa** |

---

## 📌 Dependências

- ✅ Fase 13 (APIs, Market Events)
- ✅ Service Worker funcionando
- ✅ Notificações do navegador
- TAX_RATES_RESEARCH_2026.md ✅

---

## 🚀 Próximos Passos

1. **Hoje**: Começar Tarefa 1 (IndexedDB + UI)
2. **Amanhã**: Tarefas 2-3 (Lógica + Tabela)
3. **Dia 3**: Tarefa 4 (Documentação + Testes)
4. **Fase 17**: Service Worker Background Sync (melhorar servidor)

---

**Responsável**: Copilot  
**Data de Criação**: 18 Set 2026  
**Última Revisão**: 18 Set 2026  
**Status**: ✅ Pronto para Implementação
