# 📊 Integração de Dados Reais - ProF Controller

## ✅ O que foi implementado

### 1. **Schema do Banco de Dados** (`server/config/financial-schema.sql`)

Tabelas criadas para gerenciar dados financeiros:

```sql
-- INVESTIMENTOS (Ações, Criptos, ETFs, FIIs, Dividendos, Tesouro Direto, Outros)
investments
├── user_id (FK)
├── type (acoes, criptos, etfs, fiis, dividendos, tesouro_direto, outros)
├── description
├── quantity
├── unit_price
├── total_value
├── purchase_date
└── currency (default: BRL)

-- IMÓVEIS
properties
├── user_id (FK)
├── address
├── city / state / zip_code
├── property_type (casa, apartamento, comercial, terreno)
├── purchase_date
├── purchase_price
├── current_value
└── mortgage_remaining

-- VEÍCULOS
vehicles
├── user_id (FK)
├── vehicle_type (carro, moto, caminhão)
├── brand / model / year
├── purchase_date
├── purchase_price
├── current_value
└── loan_remaining

-- CONTAS A PAGAR/RECEBER
accounts_payable
├── user_id (FK)
├── creditor
├── amount
├── due_date
├── payment_date
└── status (pending, paid, overdue)

accounts_receivable
├── user_id (FK)
├── debtor
├── amount
├── due_date
├── received_date
└── status (pending, received, overdue)

-- RECEITAS E DESPESAS (efetivas, não previstas)
income
├── user_id (FK)
├── source
├── amount
├── income_date
└── category

expenses
├── user_id (FK)
├── description
├── amount
├── expense_date
└── category

-- HISTÓRICO DE PATRIMÔNIO (snapshot mensal)
wealth_history
├── user_id (FK)
├── month (primeiro dia do mês)
├── investments_total
├── properties_total
├── vehicles_total
├── accounts_payable_total
├── accounts_receivable_total
├── total_assets
├── total_liabilities
└── net_worth
```

### 2. **API Endpoints** (`server/routes/financial.js`)

#### GET Endpoints (com autenticação)

```javascript
GET /api/financial/patrimony
// Response: { hasData, data: [ { month, totalAssets, totalLiabilities, netWorth } ] }
// Busca: Evolução do patrimônio mês a mês

GET /api/financial/distribution
// Response: { hasData, data: [ { name, value, percentage } ] }
// Busca: Investimentos + Imóveis + Veículos + Contas (% de distribuição)

GET /api/financial/cash-flow
// Response: { hasData, data: [ { month, income, expense } ] }
// Busca: Receitas vs Despesas efetivas mês a mês

GET /api/financial/assets
// Response: { hasData, data: [ { name, value, percentage, count } ], total }
// Busca: Composição de ativos por tipo (Ações, Criptos, ETFs, FIIs, etc)
```

#### POST Endpoints (com autenticação)

```javascript
POST /api/financial/investments
Body: { type, description, quantity, unit_price, purchase_date, currency, notes }

POST /api/financial/properties
Body: { address, city, state, property_type, purchase_date, purchase_price, current_value, notes }

POST /api/financial/vehicles
Body: { vehicle_type, brand, model, year, purchase_date, purchase_price, current_value, notes }

POST /api/financial/income
Body: { source, amount, income_date, category, description, notes }

POST /api/financial/expenses
Body: { description, amount, expense_date, category, notes }

POST /api/financial/accounts_payable
Body: { creditor, description, amount, due_date, category, notes }

POST /api/financial/accounts_receivable
Body: { debtor, description, amount, due_date, category, notes }
```

### 3. **Frontend Integration** (`src/charts-api.js`)

Funções JavaScript para buscar e processar dados:

```javascript
// Funções assíncronas disponíveis globalmente:
await fetchPatrimonyData()      // Evolução do patrimônio
await fetchDistributionData()   // Distribuição
await fetchCashFlowData()       // Fluxo de caixa
await fetchAssetsData()         // Composição de ativos

// Inicializar gráficos com dados reais:
initializeChartsWithData()      // Busca e popula todos os gráficos

// Auto-refresh a cada 30 segundos:
startChartsAutoRefresh(30000)   // Opcional
```

### 4. **Comportamento dos Gráficos**

```
┌─────────────────────────────────────────────┐
│  Se houver dados:                           │
│  ✅ Gráfico exibe dados reais               │
│  ✅ Auto-refresh a cada 30 segundos        │
│                                             │
│  Se NÃO houver dados:                      │
│  ⚠️  Exibe mensagem:                        │
│     "Ainda Sem Dados Para Confecção dos     │
│      Gráficos"                             │
│  ✅ Atualiza automaticamente quando dados   │
│     forem adicionados                       │
└─────────────────────────────────────────────┘
```

## 🚀 Setup

### 1. **Executar Schema do Banco de Dados**

```bash
# Copiar conteúdo de server/config/financial-schema.sql
# Executar no seu banco PostgreSQL

psql -U postgres -d prof_controller -f server/config/financial-schema.sql
```

### 2. **Verificar Tabelas Criadas**

```bash
# No psql:
\dt            # Listar todas as tabelas
\d investments # Ver estrutura de uma tabela
```

### 3. **Testar Endpoints da API**

```bash
# Terminal (com Bearer token):
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/financial/patrimony

curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/financial/assets
```

### 4. **Frontend Automático**

Os gráficos serão atualizados automaticamente quando o usuário:
- Acessar a página (carrega dados reais)
- Adicionar investimentos/receitas/despesas (refresh a cada 30s)
- Atualizar a página (recarrega dados)

## 📝 Exemplos de Uso

### Adicionar um Investimento

```bash
curl -X POST http://localhost:3001/api/financial/investments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "acoes",
    "description": "BBAS3 - Banco do Brasil",
    "quantity": 100,
    "unit_price": 28.50,
    "purchase_date": "2024-01-15",
    "currency": "BRL",
    "notes": "Ação de Dividendo"
  }'
```

### Adicionar uma Receita

```bash
curl -X POST http://localhost:3001/api/financial/income \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Salário",
    "amount": 5000.00,
    "income_date": "2024-09-01",
    "category": "Salário",
    "description": "Salário mensal"
  }'
```

### Adicionar uma Despesa

```bash
curl -X POST http://localhost:3001/api/financial/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Aluguel",
    "amount": 2000.00,
    "expense_date": "2024-09-01",
    "category": "Aluguel"
  }'
```

## 🎯 Próximas Implementações

### 1. **UI para Cadastro de Dados**
- Formulários para adicionar investimentos
- Formulários para registrar receitas/despesas
- Integração com banco de dados automática

### 2. **Cálculo Automático de Patrimônio**
- Função que atualiza `wealth_history` mensalmente
- Soma automática de todos os ativos
- Subtração de passivos

### 3. **Validações**
- Validar tipos de investimentos válidos
- Limitar valores negativos
- Verificar datas (não futuras)

### 4. **Relatórios**
- PDF com análise mensal
- Comparativo ano-a-ano
- Gráficos de tendência

### 5. **Mobile Responsiveness**
- Versão mobile dos formulários
- Touch-friendly date pickers
- Otimização para telas pequenas

## 🔧 Troubleshooting

### "Ainda Sem Dados Para Confecção dos Gráficos"

**Problema**: Gráficos não exibem dados

**Solução**:
1. Verificar se usuário está autenticado (Bearer token válido)
2. Verificar se `financial-schema.sql` foi executado
3. Verificar logs do backend: `console.log` em `server/routes/financial.js`
4. Testar endpoint manualmente com curl

### Gráficos não atualizam

**Problema**: Dados adicionados via API não aparecem nos gráficos

**Solução**:
1. Verificar se `charts-api.js` foi carregado (F12 > Console)
2. Atualizar página manualmente (F5)
3. Aguardar 30 segundos (auto-refresh)
4. Verificar se resposta da API contém `hasData: true`

## 📊 Estrutura de Dados: Exemplo Completo

```javascript
// Patrimony Evolution
{
  hasData: true,
  labels: ['01/2024', '02/2024', '03/2024'],
  datasets: [
    {
      label: 'Patrimônio Líquido',
      data: [100000, 110000, 115000]
    }
  ]
}

// Distribution
{
  hasData: true,
  labels: ['Investimentos', 'Imóveis', 'Veículos', 'Saldo Contas'],
  datasets: [
    {
      data: [50000, 300000, 40000, 25000],
      backgroundColor: ['#0099FF', '#FF6B35', '#FFC107', '#00D4FF']
    }
  ]
}

// Cash Flow
{
  hasData: true,
  labels: ['01/2024', '02/2024', '03/2024'],
  datasets: [
    { label: 'Receitas', data: [5000, 5000, 5500], type: 'bar' },
    { label: 'Despesas', data: [3000, 3200, 3100], type: 'bar' }
  ]
}

// Assets Composition
{
  hasData: true,
  labels: ['Ações', 'Criptos', 'ETFs', 'FIIs'],
  datasets: [
    {
      data: [20000, 15000, 10000, 5000],
      backgroundColor: ['#0099FF', '#FF6B35', '#FFC107', '#00D4FF']
    }
  ]
}
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs em `server/` (erros de DB)
2. Verificar Console do navegador (F12)
3. Testar endpoints com Postman/Insomnia
4. Verificar autenticação (token válido)

---

**Versão**: 1.0.0  
**Data**: 2024-09-29  
**Status**: ✅ Pronto para desenvolvimento
