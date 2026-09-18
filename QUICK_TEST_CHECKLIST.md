# ⚡ Quick Test Checklist - Fases 1-12
## Resumo Executivo para Testes Rápidos

**Tempo Estimado:** 30-45 minutos  
**Data:** 2026-09-17

---

## 🚀 Quick Start (5 min)

```bash
# 1. Terminal
cd [pasta da app]
python -m http.server 8000

# 2. Navegador
http://localhost:8000

# 3. DevTools
F12 (abrir Console)

# 4. Limpar dados (primeira vez)
indexedDB.deleteDatabase('ProfController');
localStorage.clear();
location.reload();
```

---

## ✅ Checklist Rápido (Marque conforme testa)

### 🏗️ Infraestrutura (2 min)
- [ ] DevTools > Application > IndexedDB > `recurrences` store existe
- [ ] DevTools > Application > IndexedDB > `notifications` store existe
- [ ] Console: `state.recurrences` = `[]` (array vazio)
- [ ] Console: `state.notifications` = `[]` (array vazio)

### 🔔 Notificações UI (3 min)
- [ ] Botão 🔔 visível na topbar (lado esquerdo)
- [ ] Badge 0 mostra no botão
- [ ] Clicar 🔔 abre painel direito
- [ ] Painel fecha ao clicar 🔔 novamente
- [ ] Painel fecha ao abrir ⚙️

### 📋 Recorrências UI (3 min)
- [ ] Aba "Recorrências" visível em Transações
- [ ] Botão "+ Nova recorrência" clicável
- [ ] Lista de recorrências vazia inicialmente
- [ ] Mensagem "Nenhuma recorrência cadastrada" mostra

### ➕ Criar Recorrência (5 min)
- [ ] Modal abre ao clicar "+ Nova recorrência"
- [ ] Campo "Transação" presente
- [ ] Dropdown "Frequência" mostra: Diária, Semanal, Mensal, Anual
- [ ] Dropdown "Até quando" mostra: Nunca termina, Data final, Número
- [ ] Ao selecionar "Data final" → campo de data aparece
- [ ] Ao selecionar "Número" → campo de número aparece
- [ ] Criar recorrência mensal com "Nunca termina" funciona
- [ ] Recorrência aparece na lista

### ✏️ Editar Recorrência (3 min)
- [ ] Botão edição (🖊️) aparece na lista
- [ ] Modal abre com dados preenchidos
- [ ] Alterar frequência e salvar funciona
- [ ] Lista atualiza

### ⏸️ Pausar Recorrência (2 min)
- [ ] Botão pausa/toggle aparece
- [ ] Clicar muda visual (desativado)
- [ ] Campo `enabled` muda no console: `state.recurrences[0].enabled` = `false`

### 🗑️ Deletar Recorrência (2 min)
- [ ] Botão delete (🗑️) aparece
- [ ] Clicar remove da lista
- [ ] Confirmação pode aparecer

### 🔄 Gerar Instâncias (5 min)
- [ ] Criar recorrência diária para hoje
- [ ] Fechar/reabrir navegador (reload)
- [ ] Console: `state.recurrences[0].generatedCount` = 1
- [ ] Console: `state.recurrences[0].nextDate` = amanhã
- [ ] Nova transação aparece em "Transações"

### 🔔 Notificações (3 min)
- [ ] Criar recorrência com nextDate = amanhã
- [ ] Recarregar página
- [ ] Badge 🔔 mostra número 1
- [ ] Clicar 🔔 → painel mostra notificação
- [ ] Texto: "Lançamento recorrente próximo"

### 📤 Backup v7 (3 min)
- [ ] Criar recorrência
- [ ] Configurações ⚙️ > Exportar
- [ ] Arquivo JSON baixado
- [ ] Abrir JSON em editor > `"version": 7` ✅
- [ ] JSON contém `"recurrences": [...]` ✅
- [ ] JSON contém `"notifications": [...]` ✅

### 📥 Import v7 (3 min)
- [ ] Deletar banco: `indexedDB.deleteDatabase('ProfController')`
- [ ] Recarregar
- [ ] Configurações ⚙️ > Importar > Selecionar JSON
- [ ] App recarrega
- [ ] Recorrências restauradas em "Recorrências"
- [ ] Notificações restauradas no painel 🔔

### 🔧 Service Worker (2 min)
- [ ] DevTools > Application > Service Workers
- [ ] `service-worker.js` listado como "activated and running"
- [ ] Console: `navigator.serviceWorker.getRegistrations()` mostra 1

### 📱 Notificação do Sistema (2 min)
- [ ] Criar recorrência para amanhã
- [ ] Recarregar
- [ ] Verificar se notificação nativa aparece (canto da tela)
- [ ] Clicar na notificação → app ganha foco

### 🌐 Linguagem PT-BR (2 min)
- [ ] Todos os textos em português
- [ ] "Recorrências" ✅
- [ ] "Frequência" ✅
- [ ] "Diária, Semanal, Mensal, Anual" ✅
- [ ] "Lançamento recorrente próximo" ✅

### 🌐 Linguagem English (2 min)
- [ ] Todos os textos em inglês
- [ ] "Recurrences" ✅
- [ ] "Frequency" ✅
- [ ] "Daily, Weekly, Monthly, Annual" ✅
- [ ] "Upcoming recurring entry" ✅

### 🌐 Linguagem Español (2 min)
- [ ] Todos os textos em espanhol
- [ ] "Recurrencias" ✅
- [ ] "Frecuencia" ✅
- [ ] "Diaria, Semanal, Mensual, Anual" ✅
- [ ] "Próxima entrada recurrente" ✅

### 🐛 Sem Erros (2 min)
- [ ] Console (F12) sem mensagens vermelhas 🔴
- [ ] Warnings ⚠️ são aceitáveis
- [ ] Não há erros de sintaxe

---

## 📊 Resultado Final

**Total de Checkboxes:** 63

**Passaram:** ___ / 63  
**Falharam:** ___ / 63  
**Avisos:** ___ / 63

**Taxa de Sucesso:** ___% 

```
30/63  = 48%  🔴 Crítico
45/63  = 71%  🟠 Necessita correções
55/63  = 87%  🟡 Bom
60/63  = 95%  🟢 Excelente
63/63  = 100% ✅ Perfeito
```

---

## 🐛 Erros Encontrados

### Erro 1
**Descrição:** [descreva brevemente]  
**Teste:** [qual teste falhou]  
**Severidade:** 🔴 Crítico / 🟠 Alto / 🟡 Médio / 🟢 Baixo  
**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Console Error (se houver):**
```
[cola mensagem de erro aqui]
```

### Erro 2
[repita formato acima]

---

## 💬 Observações Gerais

[Espaço para notas adicionais]

---

---

## 📊 FASE 13: Você x Mercado (Teste Adicional)

**Tempo Estimado:** 15-20 minutos  
**Requer:** App rodando, IndexedDB limpo

### 🏦 BCB API Integration (3 min)
- [ ] DevTools > IndexedDB > `benchmarks` store existe
- [ ] Store mostra 0 registros inicialmente
- [ ] Navegador > Configurações ⚙️
- [ ] Expandir "Fase 13 — Você x Mercado"
- [ ] Botão "Atualizar taxas BCB" visível
- [ ] Clicar botão → mostra "⏳ Atualizando..."
- [ ] Após 2-3 segundos → "✓ Taxas e IBOV atualizados!"
- [ ] Console: Sem erros de API
- [ ] DevTools > IndexedDB > `benchmarks` → 4 registros (SELIC, CDI, USD/BRL, IBOV)

### 💹 Portfolio Comparison UI (3 min)
- [ ] Dashboard > Card "Você x Mercado" visível
- [ ] Card mostra: "Portfolio: R$X", "IBOV: +Y%", "CDI: Z%"
- [ ] Datas de atualização presentes
- [ ] Clicar na taxa → Tooltip explica métrica (opcional)

### 📋 IR Tax Assistant (3 min)
- [ ] Dashboard > Botão "📋 Assistente de IR" visível
- [ ] Clicar → Modal abre
- [ ] Tabela mostra: Ganho/Perda, Dividendos, IR Estimado
- [ ] Ano = ano atual (ex: 2026)
- [ ] Valores baseados em transações do app
- [ ] Aviso em rodapé: "Cálculo simplificado..."
- [ ] Fechar modal > Dashboard mantém estado

### 🔔 Market Event Notifications (3 min)
- [ ] Console: 
  ```javascript
  const event = {
    id: 'test-event-1',
    symbol: 'PETR4',
    type: 'dividend',
    date: new Date().toISOString().split('T')[0],  // hoje
    description: 'Dividendo PETR4 - R$0.50',
    amount: 0.50,
    status: 'pending'
  };
  await put('marketEvents', event);
  ```
- [ ] Abrir Configurações > Notificações > Permitir
- [ ] Aguardar até 60 seg
- [ ] Notificação do navegador aparece: "PETR4: Dividendo..."
- [ ] Notificação "in-app" aparece em painel 🔔
- [ ] Notificação marca como 'notified' automaticamente

### 🔧 Sem Erros Fase 13 (2 min)
- [ ] Console sem erros vermelhos
- [ ] Mensagens esperadas:
  - "Banco Central - SELIC"
  - "Banco Central - CDI"
  - "Banco Central - USDBRL"
  - "Alpha Vantage - IBOV"
- [ ] Nenhum erro de rede (404, 500, etc)

### 📤 Backup v7+ com Fase 13 (3 min)
- [ ] Criar/atualizar recorrência + evento de mercado
- [ ] Configurações ⚙️ > Exportar
- [ ] JSON contém: `"benchmarks": [...]` ✅
- [ ] JSON contém: `"marketEvents": [...]` ✅
- [ ] JSON contém: `"portfolioMetrics": [...]` ✅

### 📥 Import v7+ Restaura Fase 13 (3 min)
- [ ] Deletar: `indexedDB.deleteDatabase('prof-controller')`
- [ ] Importar JSON da backup anterior
- [ ] DevTools > benchmarks → contém 4 registros
- [ ] DevTools > marketEvents → contém evento teste
- [ ] Dashboard > "Você x Mercado" mostra valores
- [ ] Painel 🔔 mostra notificação restaurada

## ✅ Pronto para Próximas Tarefas?

- [ ] Sim, Fase 13 Tarefas 1-5 completas ✅
- [ ] Sim, com avisos (listar):
    - 
- [ ] Não, há falhas (listar):
  -

---

## 🎯 Próximo Passo

```
Se ✅ Todos passaram:
  → Aplicar PHASE13_ADJUSTMENTS.md ao PHASE13_PLAN.md
  → Começar Tarefa 1 (IndexedDB stores)

Se ⚠️ Com avisos:
  → Documentar aviso
  → Proceder com Fase 13 com cautela
  → Monitorar durante implementação

Se ❌ Falhas críticas:
  → Revisar app.js
  → Verificar console por erros
  → Abrir issue/discussion
```

---

**Data do Teste:** ___________  
**Testador:** ________________  
**Navegador:** _______________  
**SO:** ______________________  
**Resultado:** ✅ / ⚠️ / ❌

---

**Próximo:** Compartilhe os resultados! 📊

---

---

## 📊 FASE 16 - TAREFA 1: Alertas de Preço (IndexedDB + UI)

**Tempo Estimado:** 10-15 minutos  
**Requer:** App rodando, Fase 13 completa

### 🏗️ Infraestrutura (2 min)
- [ ] DevTools > IndexedDB > `priceAlerts` store existe
- [ ] Store está vazio inicialmente
- [ ] Console: `state.priceAlerts` = `[]` (array vazio)
- [ ] DB_VERSION = 8 (Console: `DB_VERSION`)

### 🎯 UI - Botão Alertas (2 min)
- [ ] Aba "Investimentos" visível
- [ ] Novo painel: "Alertas de Preço" aparece após "Proventos"
- [ ] Botão "+ Novo Alerta" clicável
- [ ] Mensagem vazia: "Nenhum alerta de preço."

### 📋 Modal - Novo Alerta (3 min)
- [ ] Clicar "+ Novo Alerta" → modal abre
- [ ] Campo 1: "Ativo (ex: PETR4, BTC)" → input text
- [ ] Campo 2: "Tipo" → dropdown (Acima de / Abaixo de)
- [ ] Campo 3: "Preço-alvo" → input number (min=0)
- [ ] Botões: Cancelar / Salvar
- [ ] Fechar modal → desaparece

### ✅ Criar Alerta - Caso Válido (3 min)
- [ ] Preencher:
  - Ativo: `PETR4`
  - Tipo: `Acima de`
  - Preço-alvo: `30.50`
- [ ] Clicar Salvar
- [ ] Toast: "Alerta de preço criado."
- [ ] Modal fecha
- [ ] Alerta aparece na lista

### 🎨 Alerta na Lista (3 min)
- [ ] Card visível com:
  - Símbolo: `PETR4`
  - Badge: `↑ 30.50` (verde para "acima")
  - Preço atual: `N/A` (sem cotação ainda)
  - Checkbox "Ativa" marcado
  - Botão "Deletar"

### ❌ Validações (4 min)
**Máximo 3 alertas ativos:**
- [ ] Criar 3 alertas diferentes (PETR4, VALE3, ITUB4)
- [ ] Tentar criar 4º alerta → Toast: "Máximo de 3 alertas ativos atingido."
- [ ] 4º alerta NÃO aparece na lista

**Sem duplicatas:**
- [ ] Tentar criar alerta idêntico (PETR4 + Acima)
- [ ] Toast: "Alerta para este ativo + tipo já existe."

**Preço inválido:**
- [ ] Deixar preço vazio ou zero
- [ ] Tentar salvar → Toast: "Preencha todos os campos corretamente."

**Símbolos vazios:**
- [ ] Deixar campo de ativo vazio
- [ ] Tentar salvar → Toast: "Preencha todos os campos corretamente."

### 🗑️ Deletar Alerta (2 min)
- [ ] Clicar botão "Deletar" → alerta desaparece
- [ ] Lista atualiza
- [ ] Agora pode criar novo alerta (slot liberado)

### 🔘 Ativar/Desativar Alerta (2 min)
- [ ] Criar alerta e deixar marcado ("Ativa")
- [ ] Clicar checkbox → desmarcar
- [ ] Card fica com opacidade reduzida (disabled)
- [ ] Console: `state.priceAlerts[0].enabled` = `false`
- [ ] Clicar novamente → volta a ativar

### 💾 Backup v8 com Alertas (3 min)
- [ ] Criar 2 alertas (PETR4 ↑ 31, VALE3 ↓ 22)
- [ ] Configurações ⚙️ > Exportar
- [ ] JSON baixado
- [ ] Abrir em editor > `"version": 8` ✅
- [ ] JSON contém `"priceAlerts": [...]` com 2 alertas ✅
- [ ] Cada alerta tem: id, symbol, type, targetPrice, enabled, createdAt

### 📥 Import v8 Restaura Alertas (3 min)
- [ ] Deletar: `indexedDB.deleteDatabase('ProfController')`
- [ ] Recarregar app
- [ ] Lista vazia novamente
- [ ] Importar JSON anterior
- [ ] App recarrega
- [ ] 2 alertas restaurados na lista
- [ ] Dados mantidos: PETR4 ↑ 31, VALE3 ↓ 22

### 🌐 Multilíngue (3 min)
**Português:**
- [ ] "Alertas de Preço" ✅
- [ ] "+ Novo Alerta" ✅
- [ ] "Acima de / Abaixo de" ✅
- [ ] "Preço-alvo" ✅
- [ ] "Nenhum alerta de preço." ✅

**English:**
- [ ] Trocar idioma → "Price Alerts" ✅
- [ ] "+ New Alert" ✅
- [ ] "Above / Below" ✅
- [ ] "Target price" ✅
- [ ] "No price alerts." ✅

**Español:**
- [ ] Trocar idioma → "Alertas de Precio" ✅
- [ ] "+ Nueva Alerta" ✅
- [ ] "Por encima de / Por debajo de" ✅
- [ ] "Precio objetivo" ✅
- [ ] "Sin alertas de precio." ✅

### 🐛 Sem Erros (2 min)
- [ ] Console (F12) sem mensagens vermelhas 🔴
- [ ] Warnings ⚠️ são aceitáveis
- [ ] Não há erros ao criar/deletar alertas
- [ ] IndexedDB operations funcionam (DevTools confirma)

---

## ✅ Fase 16 - Tarefa 1 Completa?

- [ ] Sim, todos os testes passaram ✅
- [ ] Sim, com avisos (listar):
    - 
- [ ] Não, há falhas (listar):
  -

---

## 🎯 Próximo Passo

```
Se ✅ Todos passaram:
  → Pronto para Tarefa 2 (checkPriceAlerts + notificações)
  → Implementar verificação automática de preços
  → Adicionar notificações quando atingir target

Se ⚠️ Com avisos:
  → Documentar aviso
  → Proceder com cautela
  → Monitorar na Tarefa 2

Se ❌ Falhas críticas:
  → Revisar funções CRUD em app.js
  → Verificar IDs dos elementos no HTML
  → Confirmar CSS carregou (v40)
  → Executar: location.reload(true)  // hard refresh
```

---

**Data do Teste:** ___________  
**Testador:** ________________  
**Navegador:** _______________  
**SO:** ______________________  
**Resultado:** ✅ / ⚠️ / ❌

---

**Fase 16 - Tarefa 1 Pronta!** 🚀

---

---

## 📊 FASE 16 - TAREFA 2: Verificação Automática + Notificações

**Tempo Estimado:** 15-20 minutos  
**Requer:** Fase 16 Tarefa 1 completa, Chaves de API

### ✅ Configuração de API (2 min)
- [ ] Abrir Configurações ⚙️
- [ ] Expandir "Cotações de mercado"
- [ ] Preencherfinnhub (ou Twelve Data ou brapi.dev)
- [ ] Clicar "Salvar chaves"
- [ ] Toast: "Chaves salvas"
- [ ] Clicar "Testar conexões"
- [ ] Esperar 2-3 seg → Conexões verificadas

### 🔔 Permissão de Notificações (2 min)
- [ ] Ao abrir app → navegador pede permissão
- [ ] Clicar "Permitir" (ou "Bloquear" se não quiser)
- [ ] Console: `Notification.permission` = `"granted"` (ou "denied")

### ⏱️ Verificador Iniciado (2 min)
- [ ] Console (F12): `state.priceAlerts.length` = algum número
- [ ] Console: `window.priceAlertCheckInterval` → número (ID do intervalo)
- [ ] Mensagem: "✓ Verificador de alertas iniciado (5 min)"

### 📍 Teste Imediato - Alerta Já Atingido (5 min)
**Cenário:** Criar alerta com target ABAIXO do preço atual → dispara imediatamente

1. [ ] Ir para Investimentos > Alertas de Preço
2. [ ] Criar novo alerta:
   - Ativo: `PETR4` (ou qualquer ação B3)
   - Tipo: `Abaixo de`
   - Preço-alvo: `1.00` (abaixo de qualquer preço real)
3. [ ] Salvar → Alerta criado
4. [ ] Esperar 2-3 segundos
5. [ ] **Resultado esperado:**
   - Toast: "Abaixo de 1.00 | Atual: [preço real]" (verde)
   - Browser notification aparece: "🎯 PETR4"
   - Alerta na lista muda: card fica com borda verde à esquerda
   - Console: `state.priceAlerts[0].triggered` = `true`
6. [ ] Fechar notificação

### 🔄 Resetar Alertas (2 min)
- [ ] Console: `resetPriceAlerts()`
- [ ] Mensagem: "✓ Alertas resetados"
- [ ] Alerta volta ao estado normal (sem borda verde)
- [ ] Console: `state.priceAlerts[0].triggered` = `false`

### ⏲️ Teste 5 Minutos (Opcional - demorado)
- [ ] Criar alerta com preço-alvo realista (ex: PETR4 ↑ preço-atual + 50%)
- [ ] Esperar até 5 minutos (horário do check)
- [ ] Verificador deve chamar `checkPriceAlerts()` automaticamente
- [ ] Se preço mudou e atingiu target → notificação dispara

### 🛑 Parar Verificador (2 min)
- [ ] Console: `stopPriceAlertChecker()`
- [ ] Mensagem: "✗ Verificador de alertas parado"
- [ ] Console: `window.priceAlertCheckInterval` = `null`
- [ ] Recarregar página
- [ ] Verificador reinicia (como esperado)

### 🌐 Multilíngue - Notificações (3 min)
**Português:**
- [ ] Toast: "Acima de 100 | Atual: 105.50" ✅
- [ ] Notification title: "🎯 PETR4" ✅
- [ ] Notification body: Mensagem em português ✅

**English:**
- [ ] Trocar idioma
- [ ] Resetar alertas
- [ ] Disparar novamente
- [ ] Toast: "Above 100 | Current: 105.50" ✅
- [ ] Notification: "Above 100 | Current: 105.50" ✅

**Español:**
- [ ] Trocar idioma
- [ ] Resetar alertas
- [ ] Disparar novamente
- [ ] Toast: "Por encima de 100 | Actual: 105.50" ✅
- [ ] Notification: "Por encima de 100 | Actual: 105.50" ✅

### 🐛 Fallback de APIs (3 min)
**Se Finnhub não funciona:**
- [ ] Deletar chave Finnhub
- [ ] Resetar alertas: `resetPriceAlerts()`
- [ ] Disparar alerta novamente
- [ ] Deve tentar Twelve Data automaticamente
- [ ] Notificação aparece (sem erro)

**Se nenhuma API funciona:**
- [ ] Deletar todas as chaves
- [ ] Disparar alerta
- [ ] Console: aviso "Erro ao buscar preço"
- [ ] Notificação NÃO dispara (correto)
- [ ] Alerta NÃO marca como triggered

### 💾 Backup/Restore com Status Disparado (3 min)
- [ ] Criar alerta e disparar (triggered=true)
- [ ] Exportar backup
- [ ] JSON contém: `"triggered": true` ✅
- [ ] Deletar DB
- [ ] Importar JSON
- [ ] Alerta restaurado com `triggered: true`
- [ ] Resetar: `resetPriceAlerts()`
- [ ] Alerta volta a `triggered: false`

### 🐛 Sem Erros Console (2 min)
- [ ] F12 > Console
- [ ] Nenhuma mensagem vermelha 🔴
- [ ] Warnings ⚠️ aceitáveis:
  - "Mixed Content warning" (se HTTP + HTTPS)
  - CORS warnings (se API bloqueada)
- [ ] Nenhum erro de sintaxe

### 📊 Telemetria (Info apenas - não é teste)
Console:
- `setInterval ID`: número (ex: 123456)
- `notification.permission`: "granted" ou "denied"
- `state.priceAlerts.length`: qtd de alertas
- `lastCheck`: timestamp do último check (opcional implementar)

---

## ✅ Fase 16 - Tarefa 2 Completa?

- [ ] Sim, todos os testes passaram ✅
- [ ] Sim, com avisos (listar):
    - 
- [ ] Não, há falhas (listar):
  -

---

## 🎯 Próximo Passo

```
Se ✅ Todos passaram:
  → Pronto para Tarefa 3 (Tabela fiscal 12 países)
  → Ou Tarefa 4 (Documentação + servidor)

Se ⚠️ Com avisos:
  → Documentar aviso
  → Proceder com cautela

Se ❌ Falhas críticas:
  → Verificar console por erros
  → Confirmar chaves de API válidas
  → Testar cada API separadamente
```

---

**Data do Teste:** ___________  
**Testador:** ________________  
**Navegador:** _______________  
**SO:** ______________________  
**Resultado:** ✅ / ⚠️ / ❌

---

**Fase 16 - Tarefa 2 Pronta!** 🔔

---

---

## 💼 FASE 16 - TAREFA 3: Tabela Fiscal Internacional (12 Países)

**Tempo Estimado:** 10-15 minutos  
**Requer:** Nenhuma dependência externa

### ✅ Estrutura de Dados (2 min)
- [ ] Abrir DevTools (F12) > Console
- [ ] Digitar: `Object.keys(TAX_RULES)` → Deve retornar 12 códigos
  - [ ] PT, ES, IT, DE, FR, IE, LU, MT, GB, CH, AD, US
- [ ] Digitar: `TAX_RULES['PT']` → Deve mostrar object com name, pf[], pj, notes
- [ ] Verificar: `TAX_RULES['PT'].pf.length` → Deve ser 7 (sete faixas)

### 📋 Interface de Seleção (3 min)
1. [ ] Ir para aba **Impostos**
2. [ ] Scroll até final → "Alíquotas Fiscais Internacionais"
3. [ ] **Dropdown de países:**
   - [ ] Clicar → Lista todos os 12 (com flags: 🇵🇹 Portugal, etc)
   - [ ] Selecionar 🇪🇸 Espanha
   - [ ] Tabela muda para dados espanhóis ✅
4. [ ] **Toggle PF/PJ:**
   - [ ] Selecionado: PF (Pessoa Física)
   - [ ] Alternar para: PJ (Pessoa Jurídica)
   - [ ] Cards e tabela atualizam ✅

### 🔢 Cálculo de Imposto (4 min)
**Teste com Portugal, PF, Renda: €50.000**
1. [ ] Campo "Renda Estimada" mostra: 50000
2. [ ] **Cards aparecem:**
   - [ ] Imposto Estimado: ~€12.425
   - [ ] Taxa Efetiva: ~24,85%
   - [ ] Alíquota Marginal: 37%
   - [ ] Renda Líquida: ~€37.575
3. [ ] **Tabela mostra 7 faixas:**
   - [ ] Faixa 1 (€0-€7.091): €0 | 14,5% | Completa (~€1.028)
   - [ ] Faixa 2 (€7.091-€10.700): ~€829 | 23%
   - [ ] Faixa 3 (€10.700-€20.261): ~€2.699 | 28,5% | DESTACADA (azul)
   - [ ] Faixa 4 (€20.261-€25.000): ~€1.664 | 35% | DESTACADA
   - [ ] Faixa 5+ seguem...
   - [ ] Coluna "Acumulado" mostra soma até cada faixa ✅

### 🌍 Comparação entre Países (4 min)
1. [ ] Abaixo da tabela fiscal: "Comparação entre Países"
2. [ ] Campo "Renda Estimada": já prefenchido com €50.000
3. [ ] Tabela aparece com 12 linhas (uma por país):
   - [ ] 🇮🇪 Irlanda | €10.000 | 20,00% | €40.000
   - [ ] 🇦🇩 Andorra | €5.000 | 10,00% | €45.000 ← **Menor imposto**
   - [ ] 🇴🇸 Portugal | €12.425 | 24,85% | €37.575
   - [ ] 🇬🇧 UK | €9.742 | 19,48% | €40.258
   - [ ] 🇺🇸 USA | €6.060 | 12,12% | €43.940 ← **Muito baixo**
   - [ ] 🇲🇹 Malta | €12.500 | 25,00% | €37.500
   - [ ] ...continua com os 12
4. [ ] Mudar renda para €200.000:
   - [ ] Todos os valores atualizam ✅
   - [ ] Ranking muda (países progressivos aumentam mais) ✅
5. [ ] Mudar para PJ:
   - [ ] Tabela mostra alíquotas flat por país
   - [ ] Exemplo PT: €39.000 (19,5%) vs €160.000 (80%) USA ✅

### 🎨 Multilíngue - Tarefa 3 (3 min)
**Português (padrão):**
- [ ] "Alíquotas Fiscais Internacionais" ✅
- [ ] "País/Região:" ✅
- [ ] "Imposto Estimado" ✅
- [ ] "Renda Líquida" ✅
- [ ] "Faixas de Imposição" ✅

**English:**
- [ ] Trocar idioma
- [ ] "International Tax Rates" ✅
- [ ] "Country/Region:" ✅
- [ ] "Estimated Tax" ✅
- [ ] "Net Income" ✅

**Español:**
- [ ] Trocar idioma
- [ ] "Tasas Fiscales Internacionales" ✅
- [ ] "País/Región:" ✅
- [ ] "Impuesto Estimado" ✅
- [ ] "Ingresos Netos" ✅

### 🐛 Casos Extremos (3 min)
**Renda muito baixa (€1.000):**
- [ ] Todos os impostos recalculam
- [ ] Muitos países mostram 0% ou taxa mínima
- [ ] Renda líquida ~= Renda bruta ✅

**Renda muito alta (€500.000):**
- [ ] Alíquotas progressivas "explodem"
- [ ] Portugal: ~€240k imposto (48% aprox)
- [ ] Andorra: ~€200k (40%)
- [ ] Comparação clara das diferenças ✅

**Renda fracionada (€12.345,67):**
- [ ] Cálculo funciona com decimais
- [ ] Resultado mostra decimais corretos ✅

### 💾 Sem Erros Console (2 min)
- [ ] F12 > Console
- [ ] Nenhuma mensagem vermelha 🔴
- [ ] Warnings: aceitáveis (CORS, etc)
- [ ] Switching países: sem erros
- [ ] Changing renda: sem erros ✅

### 📊 Dados Validados (Info - não é teste)
**Fonte:** TAX_RATES_RESEARCH_2026.md
- Portugal: 48% + 5% solidariedade = 53% max
- Andorra: 40% max
- USA: 37% federal + estadual até 13,3% = até 50,3%
- Irlanda: 12,5% corporativa (mais baixa)

---

## ✅ Fase 16 - Tarefa 3 Completa?

- [ ] Sim, todos os testes passaram ✅
- [ ] Sim, com avisos (listar):
    - 
- [ ] Não, há falhas (listar):
  -

---

## 🎯 Próximo Passo

```
Se ✅ Todos passaram:
  → Pronto para Tarefa 4 (Documentação + Servidor)
  → Ou encerrar Fase 16

Se ⚠️ Com avisos:
  → Documentar aviso
  → Proceder com cautela

Se ❌ Falhas críticas:
  → Verificar i18n strings
  → Testar estimateTaxByCountry() manualmente
  → Verificar renderTaxTable() vs renderTaxComparison()
```

---

**Data do Teste:** ___________  
**Testador:** ________________  
**Navegador:** _______________  
**SO:** ______________________  
**Resultado:** ✅ / ⚠️ / ❌

---

**Fase 16 - Tarefa 3 Pronta!** 💼
