# ProF Controller v1.0.0 - Guia de Instalação e Teste 🚀

**Data:** September 18, 2026  
**Versão:** 1.0.0  
**Status:** Production Ready ✅

---

## 📥 Instalação

### **Opção 1: Clonar do GitHub (Recomendado)**

```bash
# 1. Clone o repositório
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller

# 2. Checkout da tag v1.0.0
git checkout v1.0.0

# 3. Abra em seu navegador
# Opção A: Inicie um servidor local
python -m http.server 8000

# Opção B: Ou acesse pelo File Explorer
# Clique duas vezes em index.html
```

### **Opção 2: Download do ZIP**

1. Acesse: https://github.com/ferpa2505-art/prof-controller/releases/tag/v1.0.0
2. Clique em "Download ZIP"
3. Extraia o arquivo
4. Abra `index.html` no navegador

### **Opção 3: Usar a Branch Feature (Desenvolvimento)**

```bash
# Clone a branch com todas as features
git clone --branch ferpa2505-art-notifications-recurrence \
  https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller
python -m http.server 8000
```

---

## 🌐 Acessar a Aplicação

### **Opção A: Servidor Local Python (Linux/Mac/Windows)**

```bash
cd /caminho/para/prof-controller
python -m http.server 8000
```

Abra no navegador: **http://localhost:8000**

### **Opção B: Servidor Node.js (alternativa)**

```bash
# Se tiver Node.js instalado
npx http-server -p 8000
```

### **Opção C: Abrir arquivo local**

Simplesmente clique duas vezes em `index.html` no File Explorer/Finder.

---

## 🧪 Roteiro de Testes Completo

### **Fase 1: Autenticação & Setup (5 min)**

#### Teste 1.1: Primeiro Acesso
- [ ] Abra a aplicação
- [ ] Verifique se a tela de login aparece
- [ ] Veja o ícone do ProF (sem borda branca) ✅
- **Status esperado:** Logo limpo, sem bordas brancas

#### Teste 1.2: Login Local
- [ ] Clique em "Entrar com Email e Senha"
- [ ] Preencha: Email e Senha
- [ ] Clique em "Entrar"
- **Status esperado:** Dashboard carregado

#### Teste 1.3: Configurações Iniciais
- [ ] Vá para **Preferências** → **Moeda Base**
- [ ] Selecione BRL (ou sua moeda)
- [ ] Clique em **Salvar**
- **Status esperado:** Configuração salva

---

### **Fase 2: Dashboard & Portfolio (10 min)**

#### Teste 2.1: Dashboard Principal
- [ ] Verifique seção de **Investimentos**
- [ ] Veja valor total (deve estar em R$ ou sua moeda)
- [ ] Verifique seção de **Câmbio**
- **Status esperado:** Dashboard carregado com resumo

#### Teste 2.2: Filtro de Câmbio (Task 3 ✅)
- [ ] Vá para **Investimentos** → **Câmbio**
- [ ] Verifique se mostra apenas os 2 últimos dias
- [ ] Procure pelas setas de direção:
  - 📈 Verde (subiu)
  - 📉 Vermelho (desceu)
  - → Amarelo (igual)
- **Status esperado:** Câmbio filtrado com indicadores visuais

#### Teste 2.3: NAV Gráfico Padrão (Task 6 ✅)
- [ ] Clique em **Investimentos** → **Gráfico**
- [ ] Verifique dropdown "Separar por"
- [ ] Confirme que está em **"Conta / Bem"** por padrão
- **Status esperado:** Gráfico mostra "Conta / Bem" inicialmente

---

### **Fase 3: Gerenciamento de Posições (15 min)**

#### Teste 3.1: Adicionar Posição
- [ ] Clique em **+ Adicionar Posição**
- [ ] Preencha:
  - Nome: "Apple Stock"
  - Tipo: "Ação"
  - Conta: Selecione uma
  - Quantidade: 10
  - Preço: 150.00
  - Moeda: USD
- [ ] Clique em **Salvar**
- **Status esperado:** Posição adicionada à tabela

#### Teste 3.2: Actions Toggle (Task 5 ✅) - **NOVO**
- [ ] Na tabela de posições, procure coluna **Ações**
- [ ] Clique no botão **+** ao lado da posição
- **Status esperado:**
  - Botão muda para **−**
  - Botões aparecem abaixo:
    - Gráfico
    - Mover
    - Cotações
    - Editar
    - Deletar
- [ ] Clique em **−** para recolher
- **Status esperado:**
  - Botão volta para **+**
  - Ações desaparecem (animação suave)

#### Teste 3.3: Editar Posição
- [ ] Clique em **+** para expandir ações
- [ ] Clique em **Editar**
- [ ] Altere o preço para 160.00
- [ ] Salve as alterações
- **Status esperado:** Valor atualizado na tabela

#### Teste 3.4: Deletar Posição
- [ ] Clique em **+** para expandir ações
- [ ] Clique em **Deletar**
- [ ] Confirme a exclusão
- **Status esperado:** Posição removida

---

### **Fase 4: Proventos/Dividendos (10 min)**

#### Teste 4.1: Status Padrão (Task 4 ✅)
- [ ] Vá para **Investimentos** → **Proventos**
- [ ] Clique em **+ Adicionar Provento**
- [ ] Verifique o dropdown de **Status**
- **Status esperado:** Status padrão é **"À confirmar"** (não "Recebido")

#### Teste 4.2: Confirmar Provento
- [ ] Mantenha o status em "À confirmar"
- [ ] Clique em **Salvar**
- [ ] Clique no botão **✓ Confirmar** ao lado do provento
- **Status esperado:** Provento muda para "Recebido"

---

### **Fase 5: Notificações (5 min)** ✅ Recurso Novo

#### Teste 5.1: Ativar Notificações
- [ ] Vá para **Preferências** → **Notificações**
- [ ] Ative **"Avisos de Navegador"**
- [ ] Clique em **Permitir** quando o navegador perguntar
- **Status esperado:** Notificações ativas

#### Teste 5.2: Receber Notificação
- [ ] Vá para **Investimentos** → **Transações**
- [ ] Crie uma transação recorrente (veja Fase 6)
- **Status esperado:** Notificação aparece quando data próxima

---

### **Fase 6: Recorrência de Transações (10 min)** ✅ Recurso Novo

#### Teste 6.1: Criar Transação Recorrente
- [ ] Vá para **Carteira** → **Transações**
- [ ] Clique em **+ Adicionar Transação**
- [ ] Preencha:
  - Tipo: "Receita"
  - Categoria: "Salário"
  - Valor: 5000.00
  - Data: Hoje
  - Descrição: "Salário Mensal"
- [ ] Procure por opção **"Recorrência"**
- [ ] Selecione **"Mensal"**
- **Status esperado:** Campo de recorrência ativo

#### Teste 6.2: Gerar Instâncias Automáticas
- [ ] Confirme a frequência **"Mensal"**
- [ ] Clique em **Salvar**
- **Status esperado:** Transação criada com recorrência configurada

#### Teste 6.3: Verificar Próximas Ocorrências
- [ ] Vá para **Carteira** → **Futuro**
- [ ] Procure pela transação recorrente
- [ ] Verifique próximas datas (próximos 12 meses)
- **Status esperado:** Transações futuras listadas

---

### **Fase 7: Configurações Avançadas (10 min)**

#### Teste 7.1: Painel de Atualização (Task 2 ✅)
- [ ] Vá para **Preferências** → **Configurações Avançadas**
- [ ] Procure por seção **"Atualizações"**
- [ ] Verifique:
  - ✅ Data e hora da última atualização
  - ✅ Versão atual (deve ser 1.0.0)
  - ✅ Botão "Atualizar Agora"
- **Status esperado:** Painel mostra informações completas

#### Teste 7.2: Botão Atualizar
- [ ] Clique em **"Atualizar Agora"**
- [ ] Aguarde sincronização
- [ ] Verifique data/hora atualizada
- **Status esperado:** Câmbio e cotações atualizados

#### Teste 7.3: Botão Atualizar no Dashboard (Task 2 ✅)
- [ ] Vá para o Dashboard
- [ ] Procure ícone de **engrenagem** (Preferências)
- [ ] Ao lado deve haver botão de **🔄 Atualizar**
- [ ] Clique nele
- **Status esperado:** Atualização sem sair do app

#### Teste 7.4: Cloud Sync
- [ ] Vá para **Preferências** → **Cloud Sync**
- [ ] Clique em **"Sincronizar com Google Drive"**
- [ ] Autorize acesso
- **Status esperado:** Dados sincronizados

---

### **Fase 8: Análise & Relatórios (10 min)**

#### Teste 8.1: Performance vs Benchmarks
- [ ] Vá para **Análise** → **Você x Mercado**
- [ ] Veja comparação com índices (Ibovespa, S&P500)
- [ ] Verifique se seu retorno é comparado
- **Status esperado:** Gráfico comparativo carregado

#### Teste 8.2: Notícias do Mercado
- [ ] Vá para **Análise** → **Notícias**
- [ ] Procure por notícias financeiras
- [ ] Filtre por categoria
- **Status esperado:** Notícias carregadas

#### Teste 8.3: Alocação de Ativos
- [ ] Vá para **Dashboard** → **Alocação**
- [ ] Verifique gráfico de distribuição
- [ ] Procure por % em cada ativo
- **Status esperado:** Alocação corretamente calculada

---

### **Fase 9: Fiscal & Compliance (10 min)**

#### Teste 9.1: Relatório Fiscal (Brasil)
- [ ] Vá para **Relatórios** → **Fiscal**
- [ ] Selecione país: **Brasil**
- [ ] Selecione ano: 2024
- **Status esperado:** Relatório carregado

#### Teste 9.2: Ganho de Capital
- [ ] No relatório fiscal, procure por **Ganho de Capital**
- [ ] Verifique se aparecem:
  - ✅ Compras
  - ✅ Vendas
  - ✅ Ganho/Perda líquida
- **Status esperado:** Cálculo fiscal correto

#### Teste 9.3: Outra Jurisdição
- [ ] Vá para **Relatórios** → **Fiscal**
- [ ] Selecione país: **USA** (ou outro)
- **Status esperado:** Relatório adapta para esse país

---

### **Fase 10: Responsividade & Performance (5 min)**

#### Teste 10.1: Responsividade Mobile
- [ ] Abra DevTools (F12)
- [ ] Clique em ícone de **Dispositivo Mobile** (toggle device toolbar)
- [ ] Teste em diferentes tamanhos:
  - iPhone (375px)
  - Tablet (768px)
  - Desktop (1920px)
- **Status esperado:** Layout se adapta corretamente

#### Teste 10.2: Performance
- [ ] Abra DevTools → **Performance**
- [ ] Clique em **Registrar**
- [ ] Navegue por várias seções
- [ ] Pare o registro
- **Status esperado:** Tempo de carregamento < 2s

#### Teste 10.3: Modo Offline
- [ ] Desconecte internet
- [ ] Use a aplicação
- [ ] Verifique se dados são carregados do cache
- **Status esperado:** App funciona offline com dados em cache

---

## ✅ Checklist de Testes

```markdown
## Dashboard
- [ ] Logo sem borda branca
- [ ] Valores em moeda correta
- [ ] Gráfico carrega corretamente

## Investimentos
- [ ] Adicionar posição
- [ ] Editar posição
- [ ] Deletar posição
- [ ] Actions toggle (+/-) funciona
- [ ] Câmbio mostra 2 últimos dias com setas

## Proventos
- [ ] Status padrão = "À confirmar"
- [ ] Pode confirmar provento
- [ ] Valor aparece corretamente

## Transações
- [ ] Criar transação
- [ ] Transação recorrente funciona
- [ ] Próximas ocorrências aparecem

## Configurações
- [ ] Painel de atualização mostra data/hora/versão
- [ ] Botão "Atualizar Agora" funciona
- [ ] Sincronização com Cloud funciona

## Análise
- [ ] Performance vs Benchmarks carrega
- [ ] Notícias aparecem
- [ ] Alocação correta

## Relatórios
- [ ] Fiscal para Brasil
- [ ] Fiscal para USA
- [ ] Ganhos de capital calculados

## UX/Performance
- [ ] Responsivo em mobile
- [ ] Funciona offline
- [ ] Notificações funcionam
- [ ] Sem erros no console
```

---

## 🐛 Se Algo Não Funcionar

### **Problema: Página em branco**
```bash
# Limpe cache do navegador
# Ctrl+Shift+Delete (Windows) ou Cmd+Shift+Delete (Mac)
# Ou abra DevTools e marque "Disable cache"
```

### **Problema: Dados não carregam**
```bash
# Verifique console (F12 → Console)
# Procure por erros de rede (CORS, etc)
# Tente em modo offline (DevTools → Network)
```

### **Problema: Notificações não aparecem**
```bash
# Vá para Preferências → Notificações
# Clique em "Permitir Notificações"
# Autorize no prompt do navegador
```

### **Problema: Cloud Sync falha**
```bash
# Vá para Preferências → Cloud Sync
# Desconecte e reconecte sua conta Google
# Verifique permissões no Google Account
```

---

## 📊 Testes de Stress (Opcional)

### **Adicionar muitas posições**
```javascript
// Cole no console (F12) para criar 100 posições teste
for(let i=0; i<100; i++) {
  state.positions.push({
    id: uid(), name: `Stock ${i}`, quantity: 10,
    price: 100 + Math.random()*50
  });
}
renderInvestments();
```

### **Testar performance com muitos dados**
- Carregue arquivo grande de dados
- Monitore uso de memória
- Verifique se UI continua responsiva

---

## 📞 Suporte

Se encontrar bugs:

1. **Abra Issue no GitHub:** https://github.com/ferpa2505-art/prof-controller/issues
2. **Inclua:**
   - Descrição do problema
   - Passos para reproduzir
   - Screenshot/video
   - Browser e SO

---

## ✅ Conclusão

**Parabéns! Você testou ProF Controller v1.0.0!** 🎉

Todos os 6 aprimoramentos cosméticos estão funcionando:
- ✅ Task 1: Ícone sem borda branca
- ✅ Task 2: Painel de atualização
- ✅ Task 3: Câmbio com 2 dias + setas
- ✅ Task 4: Proventos em "À confirmar"
- ✅ Task 5: Actions com toggle +/−
- ✅ Task 6: NAV padrão em "Conta/Bem"

**Versão pronta para produção!** 🚀

---

**Made with ❤️ by ProF Team**
