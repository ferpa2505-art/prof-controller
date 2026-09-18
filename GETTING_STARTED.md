# 🎯 ProF Controller v1.0.0 - Getting Started Guide

## 📥 Passo 1: Instalação (Escolha Uma Opção)

### **OPÇÃO A: GitHub Clone (Recomendado para Desenvolvedores)**

```bash
# Abra o terminal/prompt de comando na pasta desejada
git clone https://github.com/ferpa2505-art/prof-controller.git

# Entre na pasta
cd prof-controller

# Checkout da versão 1.0.0 (opcional, mas recomendado)
git checkout v1.0.0

# Inicie servidor Python (requer Python 3 instalado)
python -m http.server 8000

# Saída esperada:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...

# Abra navegador em: http://localhost:8000
```

**Vantagens:** Último código, fácil atualizar

---

### **OPÇÃO B: Download ZIP (Mais Fácil)**

1. Acesse: https://github.com/ferpa2505-art/prof-controller
2. Clique no botão verde **Code**
3. Selecione **Download ZIP**
4. Extraia em pasta de sua escolha
5. Clique duas vezes em **index.html**
6. App abre no navegador padrão

**Vantagens:** Rápido, sem linha de comando

---

### **OPÇÃO C: Usar Servidor Local Node.js**

```bash
# Se tiver Node.js instalado
cd /caminho/para/prof-controller
npx http-server -p 8000 -o

# App abre automaticamente em http://localhost:8000
```

**Vantagens:** Performance melhor que Python

---

## 🌐 Passo 2: Acessar a Aplicação

```
Desktop
├── prof-controller/
│   ├── index.html  ← CLIQUE AQUI (ou abra via servidor)
│   ├── app.js
│   ├── styles.css
│   └── ...
```

### **Se rodando em servidor:**
- Navegador: **http://localhost:8000**

### **Se arquivo local:**
- Clique duplo em **index.html**

### **Erro de segurança (CORS)?**
- Sempre use servidor (não arquivo local com file://)
- Servidor garante acesso correto a dados

---

## 🧪 Passo 3: Teste Rápido (2 Minutos)

Quando app abrir, verifique:

### **Teste 1: Logo do ProF**
```
┌─────────────────────┐
│  🏦 ProF Controller │  ← Ícone deve estar limpo, SEM borda branca
└─────────────────────┘
```
✅ Logo limpo e profissional

---

### **Teste 2: Entrar na Aplicação**
```
1. Clique em "Entrar"
2. Escolha: Email/Senha ou Google
3. Preencha credenciais
4. Dashboard deve carregar
```
✅ Login funciona

---

### **Teste 3: Câmbio (2 Últimos Dias com Setas)**
```
Caminho: 
  Investimentos 
    → Câmbio

Procure por:
  USD  150.00  📈  (subiu - verde)
  EUR  160.00  📉  (desceu - vermelho)
  GBP  170.00  →   (igual - amarelo)
```
✅ Câmbio filtrado com indicadores

---

### **Teste 4: Actions Toggle (+ / -)**
```
Caminho:
  Investimentos
    → (tabela de posições)

Procure coluna "Ações":
  [+] Gráfico | Mover | Cotações | Editar | Deletar

Clique [+]:
  [-] (botão muda para -)
      Ações expandem
      
Clique [-]:
  [+] (botão volta para +)
      Ações recolhem
```
✅ Toggle +/- funciona com animação suave

---

### **Teste 5: Proventos (Padrão "À Confirmar")**
```
Caminho:
  Investimentos
    → Proventos
    → Adicionar Provento

Status padrão deve ser: "À confirmar"
(não "Recebido")
```
✅ Padrão correto

---

### **Teste 6: Painel Atualização**
```
Caminho:
  Preferências
    → Configurações Avançadas
    → Procure por "Atualizações"

Deve mostrar:
  ✓ Data/hora da última atualização
  ✓ Versão atual: 1.0.0
  ✓ Botão "Atualizar Agora"
```
✅ Painel completo

---

### **Teste 7: NAV Padrão**
```
Caminho:
  Investimentos
    → Gráfico

Dropdown "Separar por" deve estar em:
  "Conta / Bem"
```
✅ Padrão correto

---

## 📊 Passo 4: Testes Mais Detalhados (Opcional)

Para testar mais a fundo:

### **Adicionar uma Posição**
1. Clique em **+ Adicionar Posição**
2. Preencha:
   - Nome: "Apple"
   - Tipo: "Ação"
   - Conta: Selecione uma
   - Quantidade: 10
   - Preço: 150.00
   - Moeda: USD
3. Clique **Salvar**
4. Veja na tabela com toggle funcionando

---

### **Testar Recorrência** ⭐ Nova Feature
1. Vá para **Carteira** → **Transações**
2. Clique **+ Adicionar**
3. Tipo: "Receita"
4. Valor: 5000
5. Procure por: **Recorrência**
6. Selecione: **Mensal**
7. Salve
8. Vá para **Futuro** para ver próximas ocorrências

---

### **Testar Notificações** ⭐ Nova Feature
1. Vá para **Preferências** → **Notificações**
2. Ative **"Avisos de Navegador"**
3. Clique **Permitir** no prompt
4. Crie transação recorrente
5. Aguarde notificação do navegador

---

## 🐛 Passo 5: Troubleshooting

### **Problema: Página em branco**

**Solução:**
```
1. Ctrl+Shift+Delete (Windows) ou Cmd+Shift+Delete (Mac)
   → Selecione "Limpar cookies e dados do site"
2. Feche e reabra navegador
3. Recarregue página (Ctrl+R ou Cmd+R)
```

---

### **Problema: "Não consegue conectar ao servidor"**

**Solução:**
```bash
# Certifique-se que servidor está rodando
# Terminal deve mostrar:
# Serving HTTP on 0.0.0.0 port 8000

# Se não estiver:
python -m http.server 8000

# Se porta 8000 está em uso:
python -m http.server 8001
# Acesse: http://localhost:8001
```

---

### **Problema: Dados não carregam**

**Solução:**
```
1. Abra DevTools (F12)
2. Vá para aba: Network
3. Recarregue página (Ctrl+R)
4. Procure por requisições em vermelho
5. Se houver CORS error:
   → Certifique-se que está usando servidor HTTP
   → Não use file://
```

---

### **Problema: Notificações não funcionam**

**Solução:**
```
1. Vá para: Preferências → Notificações
2. Ative: "Avisos de Navegador"
3. Autorize no prompt do navegador
4. Se ainda não funcionar:
   → Vá para configurações do navegador
   → Permissões → Notificações
   → Permita prof-controller
```

---

## ✅ Checklist de Verificação

```
INSTALAÇÃO:
□ App abre no navegador
□ Logo carrega sem erro
□ Consegue fazer login

UI IMPROVEMENTS (6 Tasks):
□ Logo sem borda branca
□ Câmbio mostra 2 últimos dias + setas
□ Proventos padrão "À confirmar"
□ Ações têm toggle +/-
□ Painel de atualização mostra data/hora/versão
□ NAV padrão em "Conta/Bem"

FUNCIONALIDADES:
□ Pode adicionar posição
□ Pode editar posição
□ Pode deletar posição
□ Pode criar transação recorrente
□ Notificações funcionam

PERFORMANCE:
□ Página carrega em < 2 segundos
□ Animações são suaves
□ Sem lags ao navegar
□ Modo offline funciona

BROWSERS TESTADOS:
□ Chrome/Chromium
□ Firefox
□ Safari
□ Edge
```

---

## 📱 Testes em Mobile (Opcional)

```
DevTools (F12) → Clique em ícone de celular → Toggle Device Toolbar

Tamanhos para testar:
□ iPhone SE (375px)
□ iPhone 12 (390px)
□ iPad (768px)
□ Galaxy Tab (1024px)
```

---

## 🎓 Próximos Passos

### **Se tudo funcionou:** ✅
- Parabéns! v1.0.0 está funcionando perfeitamente
- Leia `INSTALL_AND_TEST.md` para testes mais detalhados
- Veja `RELEASE_NOTES_1.0.0.md` para features completas

### **Se algo não funcionou:** 🔧
1. Consulte seção **Troubleshooting** acima
2. Abra issue em: https://github.com/ferpa2505-art/prof-controller/issues
3. Inclua: navegador, SO, mensagem de erro

### **Quer explorar código?** 💻
- Abra `app.js` em editor
- Procure por funções principais:
  - `renderInvestments()` - Tabela de investimentos
  - `toggleInvestmentActions()` - Toggle de ações
  - `renderFx()` - Câmbio filtrado
  - `renderUpdateSettings()` - Painel de atualização

---

## 📞 Contato & Suporte

**GitHub:** https://github.com/ferpa2505-art/prof-controller

**Issues:** https://github.com/ferpa2505-art/prof-controller/issues

**Discussions:** https://github.com/ferpa2505-art/prof-controller/discussions

---

## 🎉 Pronto!

Você tem tudo que precisa para:
- ✅ Instalar v1.0.0
- ✅ Testar funcionalidades
- ✅ Diagnosticar problemas
- ✅ Contribuir com melhorias

**Divirta-se com ProF Controller! 🚀**

---

**Made with ❤️ by ProF Team**
