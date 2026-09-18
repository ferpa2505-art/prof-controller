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
