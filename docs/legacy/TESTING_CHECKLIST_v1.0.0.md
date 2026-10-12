# 🧪 Checklist de Testes - ProF Controller v1.0.0

**Data de Teste:** 2026-09-19  
**Versão:** 1.0.0  
**Ambiente:** GitHub Pages (Live)  
**URL:** https://ferpa2505-art.github.io/prof-controller/

---

## ✅ TESTES GERAIS

### 1. Carregamento Inicial
- [ ] Página carrega sem erros
- [ ] Logo e ícone aparecem
- [ ] Versão (1.0.0) aparece no rodapé
- [ ] Abas estão visíveis: Investimentos, Operações, Notificações, Relatórios, Calculadora, Notícias

### 2. Responsividade
- [ ] Teste em desktop (verificar layout)
- [ ] Teste em tablet (verificar responsividade)
- [ ] Teste em mobile (verificar interface mobile-first)
- [ ] Teste em diferentes navegadores (Chrome, Firefox, Safari, Edge)

---

## 💰 ABA: INVESTIMENTOS

### 3. Adicionar Investimento
- [ ] Clicar em "Adicionar Investimento"
- [ ] Preencher dados: Nome, Tipo, Valor, Data
- [ ] Clicar em Salvar
- [ ] Investimento aparece na lista
- [ ] Saldo total atualiza corretamente

### 4. Editar Investimento
- [ ] Clicar em um investimento existente
- [ ] Editar algum campo (valor, tipo)
- [ ] Clicar em Salvar
- [ ] Dados atualizados aparecem

### 5. Deletar Investimento
- [ ] Clicar em delete de um investimento
- [ ] Confirmar exclusão
- [ ] Investimento some da lista
- [ ] Saldo total atualiza

### 6. Filtros e Busca
- [ ] Buscar por nome de investimento
- [ ] Filtrar por tipo (Ações, Fundos, etc)
- [ ] Ordenar por valor, data, tipo
- [ ] Limpar filtros

---

## 📊 ABA: OPERAÇÕES

### 7. Adicionar Operação Simples
- [ ] Clicar em "Adicionar Operação"
- [ ] Preencher dados básicos (ativo, tipo: compra, quantidade, preço)
- [ ] **NÃO** marcar "Recorrente"
- [ ] Clicar em Salvar
- [ ] Operação aparece no histórico

### 8. Visualizar Operação
- [ ] Clicar em uma operação
- [ ] Ver detalhes (data, hora, tipo, valor total)
- [ ] Fechar modal

---

## 🔄 ABA: OPERAÇÕES - TESTES DE RECORRÊNCIA ⭐

### 9. Adicionar Operação Recorrente - DIÁRIA
- [ ] Clicar em "Adicionar Operação"
- [ ] Preencher dados (ex: PETR4, compra, 10 ações, R$ 20)
- [ ] Marcar "Recorrente" ✓
- [ ] Selecionar "Diário"
- [ ] Deixar data/hora padrão
- [ ] Clicar em Salvar
- [ ] ✅ Operação aparece no histórico
- [ ] ✅ Verificar se há próxima execução listada

### 10. Adicionar Operação Recorrente - SEMANAL
- [ ] Clicar em "Adicionar Operação"
- [ ] Preencher dados (ex: VALE5, venda, 5 ações, R$ 15)
- [ ] Marcar "Recorrente" ✓
- [ ] Selecionar "Semanal"
- [ ] Escolher dia da semana (ex: Segunda-feira)
- [ ] Clicar em Salvar
- [ ] ✅ Operação aparece com "Próxima: [data próxima]"

### 11. Adicionar Operação Recorrente - MENSAL
- [ ] Clicar em "Adicionar Operação"
- [ ] Preencher dados (ex: Dividendo, entrada, R$ 1000)
- [ ] Marcar "Recorrente" ✓
- [ ] Selecionar "Mensal"
- [ ] Escolher dia do mês (ex: dia 15)
- [ ] Clicar em Salvar
- [ ] ✅ Operação aparece com data correta

### 12. Adicionar Operação Recorrente - ANUAL
- [ ] Clicar em "Adicionar Operação"
- [ ] Preencher dados (ex: Bônus anual)
- [ ] Marcar "Recorrente" ✓
- [ ] Selecionar "Anual"
- [ ] Escolher mês e dia (ex: 15 de janeiro)
- [ ] Clicar em Salvar
- [ ] ✅ Operação aparece corretamente

### 13. Editar Operação Recorrente
- [ ] Clicar em editar uma operação recorrente
- [ ] Mudar frequência (ex: diário → semanal)
- [ ] Clicar em Salvar
- [ ] ✅ Frequência atualiza

### 14. Deletar Operação Recorrente
- [ ] Clicar em delete de operação recorrente
- [ ] ✅ Pode escolher: deletar apenas próxima ou toda a série
- [ ] Confirmar
- [ ] ✅ Operação some da lista

---

## 🔔 ABA: NOTIFICAÇÕES ⭐

### 15. Notificação de Lançamento Recorrente
- [ ] Ter uma operação recorrente programada para hoje/próximas horas
- [ ] Ir para aba "Notificações"
- [ ] ✅ Ver aviso: "Lançamento recorrente próximo: [operação] em [horário]"
- [ ] ✅ Notificação do navegador deve aparecer (se permitir)

### 16. Notificação de Transação Pendente
- [ ] Adicionar operação e não confirmar
- [ ] Ir para "Notificações"
- [ ] ✅ Ver: "Transação pendente: [operação]"

### 17. Alerta de Orçamento
- [ ] Definir orçamento de teste
- [ ] Gastar próximo ao limite
- [ ] ✅ Ver alerta: "Atenção! Você está usando [X]% do orçamento"

### 18. Limpar Notificações
- [ ] Clicar em "Limpar Histórico de Notificações"
- [ ] ✅ Lista de notificações fica vazia

---

## 📈 ABA: RELATÓRIOS

### 19. Gráficos de Rentabilidade
- [ ] Ver gráfico de rentabilidade
- [ ] ✅ Gráfico carrega sem erros
- [ ] ✅ Valores fazem sentido

### 20. Distribuição por Tipo
- [ ] Ver gráfico de distribuição
- [ ] ✅ Mostrar proporção de ações, fundos, etc

### 21. Histórico de Operações
- [ ] Ver tabela com todas operações
- [ ] ✅ Ordenação funciona (data, valor, tipo)
- [ ] ✅ Busca filtra corretamente

---

## 🧮 ABA: CALCULADORA

### 22. Cálculos Básicos
- [ ] Teste: 10 + 5 = 15 ✅
- [ ] Teste: 20 - 5 = 15 ✅
- [ ] Teste: 5 × 3 = 15 ✅
- [ ] Teste: 15 ÷ 3 = 5 ✅

### 23. Botões C e CE
- [ ] Clicar C (Clear All) - limpa tudo ✅
- [ ] Clicar CE (Clear Entry) - limpa apenas entrada ✅
- [ ] Clicar "Limpar" - limpa histórico com confirmação ✅

### 24. Histórico de Cálculos
- [ ] Calcular alguns valores
- [ ] ✅ Histórico aparece abaixo
- [ ] ✅ Clicar em item do histórico reutiliza valor

---

## 📰 ABA: NOTÍCIAS

### 25. Carregamento de Notícias
- [ ] Ver aba "Notícias"
- [ ] ✅ Notícias carregam (do NewsAPI ou fallback)
- [ ] ✅ Cada notícia mostra: título, fonte, data

### 26. Fallback de Notícias
- [ ] Se APIs falharem, mostrar notícias placeholder ✅
- [ ] ✅ Mensagem "Notícias indisponíveis no momento"

---

## 💾 ARMAZENAMENTO E PERSISTÊNCIA

### 27. LocalStorage
- [ ] Adicionar um investimento
- [ ] Recarregar página (F5)
- [ ] ✅ Dados aparecem (não foram perdidos)
- [ ] Limpar localStorage (DevTools)
- [ ] Recarregar
- [ ] ✅ App inicia vazio

### 28. Backup/Restauração
- [ ] Procurar por botão "Fazer Backup" ou "Exportar"
- [ ] Se existir, testar salvamento
- [ ] Se existir "Restaurar", testar carregamento

---

## 🔍 VERIFICAÇÃO DE ERROS

### 29. Console do Navegador
- [ ] Abrir DevTools (F12)
- [ ] Ir para aba "Console"
- [ ] ✅ Não deve haver erros vermelhos críticos
- [ ] ✅ Warnings podem existir (não críticos)

### 30. Performance
- [ ] App carrega rápido (< 3 segundos)
- [ ] Interações são responsivas
- [ ] Nenhuma lag ou travamento

---

## 📱 TESTES ESPECÍFICOS MOBILE

### 31. Interface Mobile
- [ ] [ ] Abas em accordion/dropdown (não lado a lado)
- [ ] [ ] Botões com tamanho toque adequado (48px mínimo)
- [ ] [ ] Formulários usáveis em tela pequena
- [ ] [ ] Notificações visíveis no mobile

### 32. Notificações Push
- [ ] [ ] Permitir notificações do navegador
- [ ] [ ] Simular operação recorrente próxima
- [ ] [ ] ✅ Notificação push aparece mesmo com abas inativas

---

## 🎯 TESTES DE CASOS EXTREMOS

### 33. Valores Extremos
- [ ] Adicionar investimento com valor 0
- [ ] Adicionar investimento com valor negativo
- [ ] Adicionar com campos vazios
- [ ] ✅ Validação deve funcionar

### 34. Operações Duplicadas
- [ ] Tentar adicionar a mesma operação 2x rapidamente
- [ ] ✅ Não deve duplicar ou causar erro

### 35. Múltiplas Abas/Janelas
- [ ] Abrir ProF Controller em 2 abas
- [ ] Adicionar algo em uma aba
- [ ] ✅ Dados sincronizam na outra aba automaticamente?

---

## ✨ RESULTADO FINAL

| Aspecto | Status | Notas |
|---------|--------|-------|
| Carregamento | ☐ ✅ / ☐ ❌ | |
| Interface | ☐ ✅ / ☐ ❌ | |
| Investimentos | ☐ ✅ / ☐ ❌ | |
| Operações | ☐ ✅ / ☐ ❌ | |
| **Recorrência** | ☐ ✅ / ☐ ❌ | ⭐ Feature principal |
| **Notificações** | ☐ ✅ / ☐ ❌ | ⭐ Feature principal |
| Calculadora | ☐ ✅ / ☐ ❌ | |
| Notícias | ☐ ✅ / ☐ ❌ | |
| Mobile | ☐ ✅ / ☐ ❌ | |
| Performance | ☐ ✅ / ☐ ❌ | |

---

## 🐛 BUGS ENCONTRADOS

Se encontrar algum problema, descreva aqui:

```
BUG #1: [Descrição]
- Steps to reproduce: 
- Expected: 
- Actual: 

BUG #2: [Descrição]
- Steps to reproduce: 
- Expected: 
- Actual: 
```

---

## ✅ RECOMENDAÇÕES

Depois dos testes, verificar:
- [ ] Todos os testes passaram?
- [ ] Encontrou bugs? Reportar aqui
- [ ] Features funcionando bem?
- [ ] Pronto para enviar aos outros testadores?

---

**🎉 Boa sorte com os testes! Se encontrar algo, me avise! 🚀**
