# 🏦 ProF Controller - Gestor de Patrimônio Offline

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)]()

> **Controle seu patrimônio financeiro com privacidade e segurança. 100% offline. Zero taxas.**

---

## 📸 Screenshots

```
┌─────────────────────────────────────────────────┐
│  ProF Controller - Dashboard                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Financeiro:        R$ 150,000.00              │
│  Patrimônio:        R$ 450,000.00              │
│  Investimentos:     R$ 200,000.00              │
│                                                 │
│  ✅ 5 Contas Ativas                            │
│  ✅ 8 Moedas                                    │
│  ✅ 42 Investimentos                            │
│  ✅ 312 Transações                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✨ Recursos Principais

### 💰 Gestão Financeira
- ✅ Múltiplas contas (banco, carteira, corretora, caixa)
- ✅ 40+ moedas suportadas
- ✅ Câmbio em tempo real
- ✅ Saldos diários automáticos
- ✅ Consolidação multi-moeda

### 📊 Análises & Relatórios
- ✅ Rentabilidade vs. Benchmarks
- ✅ Performance da carteira
- ✅ Composição de patrimônio
- ✅ Fluxo de caixa
- ✅ Estatísticas por categoria

### 🚀 Automação
- ✅ Transações recorrentes
- ✅ Alertas de orçamento
- ✅ Alertas de preço
- ✅ Notificações automáticas
- ✅ Sincronização na nuvem

### 🔐 Segurança
- ✅ Offline-first (funciona sem internet)
- ✅ Dados locais (nunca saem do dispositivo)
- ✅ Proteção com senha
- ✅ Backup criptografado
- ✅ Sem rastreamento

### 🌍 Acessibilidade
- ✅ 3 idiomas (PT-BR, EN, ES)
- ✅ 5 temas (claro, escuro, cinza, verde, azul)
- ✅ Responsivo (mobile/desktop)
- ✅ WCAG 2.1 AA
- ✅ Suporta 12 países

---

## 🚀 Quick Start

### 1. Abrir a App

```bash
# Clonar repositório
git clone https://github.com/ferpa2505-art/prof-controller.git
cd prof-controller

# Abrir em navegador
# Chrome/Firefox: Ctrl+O → index.html
# Ou copiar arquivo para servidor web
```

### 2. Criar Primeira Conta

```
Dashboard → Contas → "+ Nova conta"
└─ Nome: "Conta Corrente"
└─ Tipo: Bancária
└─ Moeda: BRL
└─ Saldo Inicial: R$ 5.000,00
```

### 3. Registrar Transações

```
Entradas e Saídas → "+ Novo lançamento"
└─ Data: 18/09/2026
└─ Tipo: Receita
└─ Categoria: Salário
└─ Valor: R$ 5.000,00
```

### 4. Adicionar Investimentos

```
Carteira → "+ Nova posição"
└─ Ativo: PETR4 (busca automática)
└─ Quantidade: 100
└─ Preço médio: R$ 28,50
└─ Data: 18/09/2026
```

---

## 📚 Guia Completo de Uso

### Dashboard
- **Visualizar patrimônio consolidado**
- Resumo mensal de receitas/despesas
- Últimas transações
- Alerta de metas financeiras

### Contas
- Criar conta (banco, carteira, corretora, caixa, liquidez)
- Editar informações
- Deletar conta
- Acompanhar saldo atual
- Histórico de saldos

### Transações
- Registrar receita, despesa, transferência
- Categorizar por 30+ categorias
- Filtrar por período, categoria, conta
- Exportar para CSV
- Importar de CSV

### Investimentos
- Buscar ativo por ticker
- Acompanhar cotação em tempo real
- Calcular ganho/perda automático
- Comparar ativos
- Watchlist de observação

### Orçamentos
- Definir limite mensal por categoria
- Visualizar progresso (0-100%)
- Alertas em 80% e 100%
- Histórico mensal

### Análises
- Composição do patrimônio (gráfico)
- Fluxo de caixa (gráfico)
- Performance vs. benchmarks
- Rentabilidade por ativo

### Proventos
- Registrar dividendos/juros
- Importar extrato B3
- Buscar automático
- Histórico de proventos

### Notícias
- Hub de notícias financeiras
- Filtrar por categoria
- Favoritar
- Arquivar
- Atualização automática

### Cloud Sync
- Login com Google
- Sincronizar dados
- Restaurar da nuvem
- Auto-sync (1h)
- Histórico de sincronizações

---

## ⚙️ Configuração

### Preferências
```
Menu de Engrenagem (⚙️)
├─ Tema: Claro, Escuro, Cinza, Verde, Azul
├─ Idioma: Português, English, Español
└─ Mostrar Explicações: Ativado/Desativado
```

### Configurações Avançadas
```
Configurações → Configurações Avançadas
├─ Moeda Base: (consolidação de patrimônio)
├─ Proteção: Senha + bloqueio automático
├─ Backup: JSON, JSON criptografado, CSV
├─ Chaves de API: Finnhub, Twelve Data, brapi
└─ Cloud Sync: Google Drive
```

### Chaves de API (Cotações)

Obtenha grátis em:

1. **Finnhub** (ações internacionais)
   - Site: https://finnhub.io
   - Copiar chave gratuita
   - Colar em Settings → Cotações

2. **Twelve Data** (múltiplos ativos)
   - Site: https://twelvedata.com
   - Criar conta gratuita
   - Copiar chave
   - Colar em Settings → Cotações

3. **brapi.dev** (ativos brasileiros)
   - Site: https://brapi.dev
   - Gerar chave
   - Colar em Settings → Cotações

---

## 📱 Instalar como App

### Chrome/Edge (Desktop)
1. Abrir app no navegador
2. Menu (⋮) → "Instalar ProF Controller"
3. Confirmar
4. App aparece na barra de tarefas

### Android (Chrome)
1. Abrir app no Chrome
2. Menu (⋮) → "Instalar app"
3. Confirmar
4. App aparece no menu de apps

### iOS (Safari)
1. Abrir app no Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. Nomear "ProF Controller"
4. Criar
5. App aparece na home

---

## 🔒 Segurança & Privacidade

### Dados Locais
- ✅ Todos os dados armazenados **localmente em IndexedDB**
- ✅ Nenhuma transmissão sem sua autorização
- ✅ Funciona **100% offline**

### Proteção de Senha
- ✅ Criptografia AES-256 (opcional)
- ✅ Bloqueio automático após 5 minutos
- ✅ Reset seguro disponível

### Backup & Exportação
- ✅ Exportar JSON (sem criptografia)
- ✅ Exportar JSON criptografado
- ✅ Exportar CSV (para Excel)
- ✅ Importar backups

### Sincronização na Nuvem
- ✅ Opcional (desativado por padrão)
- ✅ Somente com seu consentimento
- ✅ Autenticação Google OAuth
- ✅ Dados criptografados

---

## 🐛 Troubleshooting

### App não funciona offline?
1. Verificar se Service Worker está registrado
   - DevTools → Application → Service Workers
   - Status: "activated and running"
2. Limpar cache: Settings → Backup → Limpar dados

### Cotações não atualizam?
1. Verificar chaves de API
   - Settings → Cotações de Mercado
   - Testar conexões (botão "Testar")
2. Verificar conexão com internet

### Dados não sincronizam?
1. Verificar autenticação Google
   - Settings → Cloud Sync
   - Status: "✅ Conectado"
2. Ativar sincronização automática
   - Checkbox "Sincronização automática"
3. Sincronizar manualmente
   - Botão "Sincronizar agora"

### Browser não suportado?
- Requerido: Chrome 55+, Firefox 45+, Safari 11+, Edge 79+
- Não suportado: IE11 (use Edge)
- Mobile: iOS Safari 13.4+, Android Chrome 55+

---

## 📊 Exemplos de Uso

### Caso 1: Acompanhar Carteira de Ações

```
1. Criar conta "Corretora XYZ" (BRL)
2. Registrar saldo inicial (R$ 50.000)
3. Adicionar posições:
   - PETR4: 100 @28,50 = R$ 2.850
   - VALE3: 50 @75,00 = R$ 3.750
   - ITUB4: 200 @9,50 = R$ 1.900
4. App calcula:
   - Total investido: R$ 8.500
   - Valor atual: (atualiza em tempo real)
   - Ganho/Perda: +/-
   - Rentabilidade: +/- %
5. Ver comparação com benchmarks (Ibovespa, S&P 500, CDB)
```

### Caso 2: Controlar Orçamento Mensal

```
1. Criar orçamentos:
   - Moradia: R$ 1.500
   - Alimentação: R$ 600
   - Saúde: R$ 300
   - Educação: R$ 400
2. Registrar transações durante o mês
3. App alerta em 80% e 100% do orçamento
4. No final do mês:
   - Visualizar gastos por categoria
   - Comparar com mês anterior
   - Planejar mês seguinte
```

### Caso 3: Preparar Imposto de Renda

```
1. Registrar todas as transações com categorias
2. Abrir Assistente de IR (Dashboard)
3. App calcula:
   - Ganho/perda em investimentos
   - Rendimento de dividendos
   - Deduções permitidas
4. Gerar relatório para apresentar à contadora
5. Exportar para Excel se necessário
```

---

## 🛠️ Desenvolvimento

### Stack Técnico
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Armazenamento:** IndexedDB, LocalStorage
- **Offline:** Service Worker
- **Empacotamento:** PWA Manifest

### Estrutura de Arquivos
```
prof-controller/
├── index.html              # Estrutura HTML (570 linhas)
├── app.js                  # Lógica principal (14,500+ linhas)
├── styles.css              # Estilos (1,300+ linhas)
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
├── icon-192.png            # Ícone 192x192
├── icon-512.png            # Ícone 512x512
├── DOCUMENTATION.md        # Documentação completa
├── EXECUTIVE_SUMMARY.md    # Sumário executivo
└── README.md               # Este arquivo
```

### Extensões Possíveis
- [ ] Plugin para integração bancária
- [ ] Extensão para Chrome/Firefox
- [ ] Sync com Planilhas Google
- [ ] Integração com Robôs de Investimento
- [ ] Análise com Machine Learning

---

## 📈 Roadmap

### v1.1 (Q4 2026)
- [ ] Google Drive API real
- [ ] Versionamento de backups
- [ ] Detecção de conflitos

### v1.2 (Q1 2027)
- [ ] App mobile nativo
- [ ] API REST
- [ ] Criptografia E2E

### v2.0 (Q2 2027)
- [ ] Multi-usuário
- [ ] Colaboração em tempo real
- [ ] IA para categorização

---

## 🤝 Contribuindo

Encontrou um bug? Tem uma ideia?

1. **Abrir Issue:** Descrever problema com passos
2. **Pull Request:** Fazer fork → clonar → criar branch → commit → push → PR
3. **Discussão:** Sugerir recursos em Discussions

---

## 📄 Licença

MIT License - Use livremente para projetos pessoais e comerciais

Veja [LICENSE](LICENSE) para detalhes

---

## 📞 Suporte

- **Documentação:** [DOCUMENTATION.md](DOCUMENTATION.md)
- **Sumário:** [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)
- **Issues:** [GitHub Issues](https://github.com/ferpa2505-art/prof-controller/issues)
- **Discussões:** [GitHub Discussions](https://github.com/ferpa2505-art/prof-controller/discussions)
- **Email:** support@profcontroller.dev

---

## 🎯 Estatísticas

| Métrica | Valor |
|---------|-------|
| Fases Completas | 15/15 ✅ |
| Linhas de Código | 16,000+ |
| Funções | 200+ |
| Moedas | 40+ |
| Idiomas | 3 |
| Temas | 5 |
| APIs | 3+ |
| Tamanho | ~500KB |

---

## 🙏 Agradecimentos

- 🏦 Banco Central do Brasil (câmbio)
- 📊 Finnhub (cotações internacionais)
- 📈 Twelve Data (múltiplos ativos)
- 🇧🇷 brapi.dev (ativos brasileiros)
- 🔐 Comunidade de segurança web

---

## 🌟 Star ⭐ se gostou!

Se ProF Controller ajudou você, deixe uma ⭐ no GitHub para apoiar o projeto!

---

**ProF Controller v1.0** — *Seu patrimônio, seu controle, sua privacidade.* 🔐💰📊

Desenvolvido com ❤️ para controle financeiro pessoal  
© 2026 ProF Controller | MIT License
