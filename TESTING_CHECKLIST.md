# 🧪 Checklist de Testes - ProF Controller Notificações & Recorrências

## 📋 Testes Automatizados

### Pré-requisito: Validação de Sintaxe
```bash
node -c app.js
node -c service-worker.js
```
**Status**: ✅ PASSED

---

## 🔬 Testes no Console do Navegador

### Passo 1: Verificação Básica
Abra a aba **Recorrências** e execute no console (F12):

```javascript
// Copie e cole o conteúdo de test-recurrence-basic.js
```

**Esperado**: Todas as linhas começam com ✓

---

## 📱 Testes Manuais na Interface

### Teste 1️⃣: Criar Recorrência Diária
**Status**: ⏳ Não testado em navegador
**Prioridade**: Alta

**Passos:**
1. Abra `index.html` no navegador (ou acesse o app online)
2. Navegue para **Entradas e Saídas** > **Recorrências**
3. Clique **"+ Nova recorrência"**
4. Preencha o formulário:
   ```
   Descrição: "Café diário"
   Conta: [Selecione uma conta existente]
   Valor: 5.00
   Frequência: Diária
   Até quando: Número de instâncias
   Número: 3
   ```
5. Clique **Salvar**

**Resultado esperado:**
- ✅ Toast mostra "Recorrência criada."
- ✅ Item aparece na lista
- ✅ Status mostra "✓ Ativa"
- ✅ Próximo lançamento está definido

**Erro comum:**
- ❌ Modal não abre → Verifique se há contas cadastradas
- ❌ Erro ao salvar → Verifique console para erro específico

---

### Teste 2️⃣: Verificar Geração Automática
**Status**: ⏳ Não testado
**Prioridade**: Alta
**Depende de**: Teste 1

**Passos:**
1. Após completar Teste 1
2. Recarregue o navegador (**F5**)
3. Vá para **Transações**
4. Verifique as últimas transações

**Resultado esperado:**
- ✅ 3 transações novas aparecem
- ✅ Todas com descrição "Café diário"
- ✅ Datas são dia 1, dia 2, dia 3 (em sequência)
- ✅ Valor é 5.00
- ✅ Conta é a selecionada

**Se não apareceu:**
- ❌ Verifique o filtro de mês
- ❌ Confirme que nextDate <= hoje
- ❌ Veja se recurrence.enabled = true no IndexedDB

---

### Teste 3️⃣: Notificação na Topbar
**Status**: ⏳ Não testado
**Prioridade**: Média
**Depende de**: Teste 1

**Passos:**
1. Após criar recorrência
2. Recarregue o navegador
3. Observe a **topbar**

**Resultado esperado:**
- ✅ Ícone sino (🔔) aparece
- ✅ Há um badge com número (ex: "1")
- ✅ Badge tem fundo vermelho

**Se não apareceu:**
- ❌ Verifique se shouldNotify() foi executado
- ❌ Confirme que nextDate está dentro de 3 dias
- ❌ Verifique no IndexedDB se notification foi criada

---

### Teste 4️⃣: Painel de Notificações
**Status**: ⏳ Não testado
**Prioridade**: Média
**Depende de**: Teste 3

**Passos:**
1. Com badge visível (Teste 3)
2. Clique no ícone sino (🔔)
3. Painel deve abrir

**Resultado esperado:**
- ✅ Painel abre à direita
- ✅ Mostra lista de notificações
- ✅ Cada item tem: descrição, botão ✕
- ✅ Clique em ✕ remove a notificação
- ✅ Badge diminui em 1
- ✅ Clique fora do painel fecha

**Se painel não abriu:**
- ❌ Verifique se CSS carregou (styles.css)
- ❌ Verifique no console se há erros JS
- ❌ Confirme que toggleNotificationsPanel() existe

---

### Teste 5️⃣: Pausar/Retomar Recorrência
**Status**: ⏳ Não testado
**Prioridade**: Média
**Depende de**: Teste 1

**Passos:**
1. Na aba **Recorrências**
2. Localize o item "Café diário"
3. Clique no botão **⏸** (pausar)

**Resultado esperado:**
- ✅ Status muda para "⊗ Pausada"
- ✅ Botão muda para **▶** (retomar)

**Passos (continuar):**
4. Recarregue o navegador
5. Vá para **Transações**

**Resultado esperado:**
- ✅ Nenhuma transação nova foi criada
- ✅ Status continua "⊗ Pausada"

**Passos (continuar):**
6. Volte para **Recorrências**
7. Clique **▶** (retomar)

**Resultado esperado:**
- ✅ Status volta para "✓ Ativa"
- ✅ Próximo lançamento é recalculado

---

### Teste 6️⃣: Deletar Recorrência
**Status**: ⏳ Não testado
**Prioridade**: Baixa
**Depende de**: Teste 1

**Passos:**
1. Na aba **Recorrências**
2. Clique no botão **✕** (deletar)
3. Confirme no diálogo

**Resultado esperado:**
- ✅ Item é removido da lista
- ✅ Toast mostra "Deletado"
- ✅ Recarregando, item não aparece mais

---

### Teste 7️⃣: Recorrência com Data Final
**Status**: ⏳ Não testado
**Prioridade**: Média

**Passos:**
1. Clique **+ Nova recorrência**
2. Preencha:
   ```
   Descrição: "Treino até mês que vem"
   Conta: [Selecione]
   Valor: 0
   Frequência: Diária
   Até quando: Data final
   Data final: [30 dias a partir de hoje]
   ```
3. Salve

**Resultado esperado:**
- ✅ Recorrência criada com status "Ativa"
- ✅ Recarregando, gera transações até a data final
- ✅ Após a data, para automaticamente

---

### Teste 8️⃣: Recorrência Mensal
**Status**: ⏳ Não testado
**Prioridade**: Média

**Passos:**
1. Clique **+ Nova recorrência**
2. Preencha:
   ```
   Descrição: "Aluguel"
   Conta: [Selecione]
   Valor: 1000
   Frequência: Mensal
   Até quando: Número de instâncias
   Número: 3
   ```
3. Salve
4. Recarregue o navegador
5. Vá para **Transações**

**Resultado esperado:**
- ✅ 3 transações aparecem
- ✅ Espaçadas com ~30 dias entre elas
- ✅ Valor é 1000

**⚠️ Nota**: Frequência mensal usa 30 dias fixos (não é true day-of-month)

---

### Teste 9️⃣: Notificações Nativas do Navegador
**Status**: ⏳ Não testado
**Prioridade**: Alta
**Requer**: Chrome/Firefox/Edge (não Safari)

**Passos:**
1. Ao abrir o app, navegador pede permissão
2. Clique **"Permitir"** (ou configure em Configurações)
3. Crie uma recorrência com próximo lançamento hoje
4. Recarregue o navegador
5. Minimize o app
6. Volte para o navegador/aba

**Resultado esperado:**
- ✅ Notificação nativa aparece no canto inferior/superior
- ✅ Mostra título "ProF Controller"
- ✅ Mostra descrição (ex: "Café diário — R$ 5,00")
- ✅ Pode ser clicada (volta ao app)

**Se notificação não apareceu:**
- ❌ Confirme que permissão foi concedida
- ❌ Service Worker pode estar desativado (F12 > Application > Service Workers)
- ❌ Navegador pode estar em modo silencioso

---

### Teste 🔟: Backup e Restauração
**Status**: ⏳ Não testado
**Prioridade**: Alta

**Passos (Exportar):**
1. Crie 2-3 recorrências diferentes
2. Vá para **Configurações > Backup Criptografado**
3. Clique **"Exportar"** (salva JSON)
4. Copie para local seguro

**Passos (Restaurar):**
5. Abra navegador anônimo ou outro perfil
6. Abra o app (banco de dados vazio)
7. Vá para **Configurações > Importar**
8. Selecione o arquivo exportado
9. Confirm

**Resultado esperado:**
- ✅ Dados são importados
- ✅ Recorrências aparecem na aba **Recorrências**
- ✅ Notificações também foram restauradas
- ✅ Versão do backup é v7

**Se importação falhou:**
- ❌ Verifique se arquivo é válido JSON
- ❌ Confirme que backup é v7 (procure por "recurrences" e "notifications")
- ❌ Verifique console para erro específico

---

## ✅ Checklist de Conclusão

### Antes de Publicar
- [ ] Teste 1: Criar Recorrência Diária
- [ ] Teste 2: Verificar Geração Automática
- [ ] Teste 3: Notificação na Topbar
- [ ] Teste 4: Painel de Notificações
- [ ] Teste 5: Pausar/Retomar
- [ ] Teste 6: Deletar Recorrência
- [ ] Teste 7: Recorrência com Data Final
- [ ] Teste 8: Recorrência Mensal
- [ ] Teste 9: Notificações Nativas
- [ ] Teste 10: Backup e Restauração

### Testes Opcionais
- [ ] Recorrência Semanal (7 dias)
- [ ] Recorrência Anual (365 dias)
- [ ] Múltiplas recorrências simultâneas
- [ ] Editar descrição de recorrência existente
- [ ] Filtro de notificações por tipo
- [ ] Multi-idioma (en, es)

---

## 🐛 Problemas Conhecidos & Workarounds

### Problema: Frequência mensal não é exata
**Causa**: Usa 30 dias fixos (não considera dias do mês)
**Workaround**: Usar semanal (7 dias) ou criar múltiplas recorrências

### Problema: Notificações nativas não aparecem
**Causa**: Permissão bloqueada
**Workaround**: 
1. Abra Configurações do navegador
2. Procure "Notificações"
3. Permita para este site

### Problema: Recorrências não geram após recarregar
**Causa**: nextDate ainda é futuro
**Workaround**: Aguarde até que nextDate <= hoje

---

## 📊 Relatório de Testes (Pós-Implementação)

| Teste | Resultado | Data | Notas |
|-------|-----------|------|-------|
| 1. Criar Recorrência | ⏳ | - | Aguardando execução |
| 2. Geração Automática | ⏳ | - | Aguardando execução |
| 3. Notificação Badge | ⏳ | - | Aguardando execução |
| 4. Painel Notificações | ⏳ | - | Aguardando execução |
| 5. Pausar/Retomar | ⏳ | - | Aguardando execução |
| 6. Deletar | ⏳ | - | Aguardando execução |
| 7. Data Final | ⏳ | - | Aguardando execução |
| 8. Recorrência Mensal | ⏳ | - | Aguardando execução |
| 9. Notificações Nativas | ⏳ | - | Aguardando execução |
| 10. Backup/Restaurar | ⏳ | - | Aguardando execução |

---

## 🎯 Conclusão

**Implementação**: ✅ 100% Completa
**Testes Automatizados**: ✅ Sintaxe Validada
**Testes Manuais**: ⏳ Aguardando Execução

Recomenda-se completar os testes manuais antes de publicar em produção.
