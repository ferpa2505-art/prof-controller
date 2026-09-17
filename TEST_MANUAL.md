# Teste Manual - Notificações e Recorrências

## Pré-requisitos
1. Aplicativo aberto no navegador
2. Ter pelo menos uma conta criada

## Teste 1: Criar Recorrência Diária

1. Acesse a aba **"Entradas e saídas"** (Fluxo)
2. Clique na sub-aba **"Recorrências"**
3. Clique no botão **"+ Nova recorrência"**
4. Preencha o modal:
   - Descrição: "Café diário"
   - Conta: Selecione uma conta (ex: "Dinheiro")
   - Valor: 5
   - Frequência: Diária
   - Até quando: Número de instâncias
   - Número de instâncias: 3
5. Clique em **"Salvar"**
6. **Resultado esperado**: 
   - Toast confirmando "Recorrência criada."
   - Item aparece na lista com status "✓ Ativa"
   - Próximo lançamento é hoje

## Teste 2: Verificar Geração Automática

1. Após criar a recorrência, **recarregue o navegador** (F5)
2. Volte para **"Transações"**
3. **Resultado esperado**:
   - Devem aparecer lançamentos gerados automaticamente para os próximos dias

## Teste 3: Pausa/Resume

1. Na aba **"Recorrências"**, clique no botão **⏸** (pausar) do item
2. **Resultado esperado**: Status muda para "⊗ Pausada"
3. Clique novamente (botão muda para **▶**)
4. **Resultado esperado**: Status volta para "✓ Ativa"

## Teste 4: Deletar Recorrência

1. Na aba **"Recorrências"**, clique no botão **✕** (deletar)
2. Confirme no diálogo
3. **Resultado esperado**: Item é removido da lista

## Teste 5: Notificações

1. Crie uma recorrência com próximo lançamento nos **próximos 3 dias**
2. Recarregue o navegador
3. Observe o **ícone de sino (🔔)** na topbar
4. **Resultado esperado**: Deve aparecer um **badge com número** de notificações
5. Clique no sino
6. **Resultado esperado**: Painel abre com a notificação "Próximo lançamento: [descrição]"
7. Clique na notificação ou no ✕
8. **Resultado esperado**: Notificação é marcada como lida/deletada

## Checklist de Funcionalidades

- [ ] Modal de recorrência abre corretamente
- [ ] Recorrência é criada e salva
- [ ] Recorrência aparece na lista
- [ ] Status "Ativa" é exibido corretamente
- [ ] Próximo lançamento está correto (hoje ou em breve)
- [ ] Botão pausar/retomar funciona
- [ ] Botão deletar funciona
- [ ] Notificações aparecem após recarregar
- [ ] Sino com badge está visível
- [ ] Painel de notificações abre/fecha
- [ ] Notificações podem ser marcadas como lidas
- [ ] Notificações podem ser deletadas

## Notas
- Recorrências com condição "nunca termina" geram lançamento todos os dias até serem pausadas
- Recorrências com data final geram até a data informada
- Recorrências com contador geram N instâncias e então param
