# 🚀 GUIA DE TESTE RÁPIDO - ProF Controller v1.0.0

## ⏱️ Tempo estimado: 5 minutos

---

## 📋 PASSO 1: Verificação Inicial (1 min)

Na página aberta: https://ferpa2505-art.github.io/prof-controller/

### Checklist Visual:
- [ ] Página carrega sem erros
- [ ] Logo e título aparecem no topo
- [ ] **Versão 1.0.0** aparece no rodapé
- [ ] 6 abas estão visíveis:
  - [ ] Investimentos
  - [ ] Operações
  - [ ] Notificações
  - [ ] Relatórios
  - [ ] Calculadora
  - [ ] Notícias

---

## 📊 PASSO 2: Teste Automático (1 min)

### Para rodar testes automáticos no console:

**OPÇÃO A - Mais fácil:**
1. Pressione **F12** (abre DevTools)
2. Vá para aba **"Console"**
3. Cole este comando:

```javascript
fetch('https://raw.githubusercontent.com/ferpa2505-art/prof-controller/ferpa2505-art-notifications-recurrence/test-auto.js')
  .then(r => r.text())
  .then(code => eval(code))
  .catch(e => console.error('Erro ao carregar testes:', e))
```

4. Pressione **ENTER**
5. Aguarde os testes rodarem (~2 segundos)

---

## ⭐ PASSO 3: Teste Recorrência (2 min)

### Objetivo: Verificar se operações recorrentes funcionam

**Passos:**

1. **Clique na aba "Operações"**

2. **Clique em "Adicionar Operação"** (ou botão similar)

3. **Preencha o formulário:**
   - Ativo: `PETR4` (ou qualquer código)
   - Tipo: `Compra` (ou Venda)
   - Quantidade: `10`
   - Preço/Valor: `20`

4. **IMPORTANTE - Marque "Recorrente"** ✓
   - Deve aparecer um dropdown com opções:
     - Diário
     - Semanal
     - Mensal
     - Anual

5. **Selecione "Diário"**

6. **Clique em "Salvar"**

7. **Verificações:**
   - [ ] Operação aparece na lista
   - [ ] Mostra que é "Recorrente - Diário"
   - [ ] Mostra "Próxima execução: [data/hora]"

---

## 🔔 PASSO 4: Teste Notificações (1 min)

### Objetivo: Verificar se notificações funcionam

**Passos:**

1. **Clique na aba "Notificações"**

2. **Você deve ver:**
   - [ ] Avisos de lançamentos recorrentes próximos
   - [ ] Status de transações pendentes (se houver)
   - [ ] Alertas de orçamento (se configurado)

3. **Exemplo de mensagens esperadas:**
   - "Lançamento recorrente próximo: PETR4 em [horário]"
   - "Transação pendente: [descrição]"

---

## 🧮 PASSO 5: Teste Calculadora (1 min)

### Objetivo: Verificar calculadora

**Passos:**

1. **Clique na aba "Calculadora"**

2. **Teste operações básicas:**
   - [ ] Digite: `10 + 5` e pressione `=` → Deve aparecer `15`
   - [ ] Digite: `20 - 5` e pressione `=` → Deve aparecer `15`
   - [ ] Digite: `5 × 3` e pressione `=` → Deve aparecer `15`
   - [ ] Digite: `15 ÷ 3` e pressione `=` → Deve aparecer `5`

3. **Teste botões especiais:**
   - [ ] Clique `C` → Tudo limpa
   - [ ] Digite algo → Digite número novo
   - [ ] Clique `CE` → Limpa apenas a entrada atual
   - [ ] Clique "Limpar" → Limpa histórico

4. **Verificações:**
   - [ ] Histórico de cálculos aparece abaixo
   - [ ] Pode clicar no histórico para reutilizar valores

---

## 📱 PASSO 6: Teste Responsividade (Bonus)

### Verificar em diferentes tamanhos:

1. **Pressione F12** → DevTools
2. **Clique no ícone de dispositivo** (lado esquerdo superior do DevTools)
3. **Teste em:**
   - [ ] Mobile (iPhone 12): 390×844
   - [ ] Tablet (iPad): 768×1024
   - [ ] Desktop: 1920×1080

4. **Verificações:**
   - [ ] Abas se adaptam ao tamanho
   - [ ] Botões ficam maiores em mobile
   - [ ] Nenhum texto sai da tela

---

## 🐛 PASSO 7: Reportar Problemas

Se encontrar qualquer erro, anote:

```
PROBLEMA: [O que não funciona]
COMO REPRODUZIR:
  1. ...
  2. ...
  3. ...

ESPERADO: [O que deveria acontecer]
ATUAL: [O que aconteceu]

AMBIENTE: [Navegador, dispositivo, SO]
```

---

## ✅ RESULTADO ESPERADO

Ao final dos testes, você deve ter:

- ✅ Página carrega sem erros
- ✅ Todas as 6 abas funcionando
- ✅ Operações recorrentes criadas com sucesso
- ✅ Notificações aparecendo
- ✅ Calculadora operacional
- ✅ Interface responsiva em todos os tamanhos

---

## 🎯 Resumo Rápido

| Teste | Status | Notas |
|-------|--------|-------|
| Carregamento | ☐ OK / ☐ ERRO | |
| Versão 1.0.0 | ☐ OK / ☐ ERRO | |
| Abas | ☐ OK / ☐ ERRO | |
| **Recorrência** | ☐ OK / ☐ ERRO | ⭐ PRINCIPAL |
| **Notificações** | ☐ OK / ☐ ERRO | ⭐ PRINCIPAL |
| Calculadora | ☐ OK / ☐ ERRO | |
| Responsividade | ☐ OK / ☐ ERRO | |

---

## 🆘 Se Algo Não Funcionar

1. **Limpar cache:**
   - Pressione `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Selecione tudo e clique "Limpar"
   - Recarregue a página

2. **Verificar console:**
   - Pressione F12
   - Vá para "Console"
   - Procure por mensagens em vermelho

3. **Tentar em outro navegador:**
   - Chrome, Firefox, Safari, Edge

---

## ✨ Sucesso!

Se todos os testes passarem, a aplicação está **100% pronta**! 🎉

**Próximo passo:** Enviar instaladores aos testadores
- Windows: `.exe` (141 MB)
- Linux: `.zip` (95 MB)
- Web: GitHub Pages (já online)

---

**Dúvidas? Me avise! 🚀**
