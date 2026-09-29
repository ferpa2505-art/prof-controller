-- ============================================================
--  SCHEMA FINANCEIRO - ProF Controller
--  Tabelas para Patrimônio, Investimentos, Imóveis, Veículos,
--  Contas a Pagar/Receber, Receitas e Despesas
-- ============================================================

-- INVESTIMENTOS (Ações, Criptos, ETFs, FIIs, Dividendos, Tesouro Direto, Outros)
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'acoes', 'criptos', 'etfs', 'fiis', 'dividendos', 'tesouro_direto', 'outros'
  description VARCHAR(255) NOT NULL,
  quantity NUMERIC(20,8) NOT NULL,
  unit_price NUMERIC(20,2) NOT NULL,
  total_value NUMERIC(20,2) NOT NULL,
  purchase_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type ON investments(type);
CREATE INDEX idx_investments_purchase_date ON investments(purchase_date);

-- IMÓVEIS
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(20),
  property_type VARCHAR(50), -- 'casa', 'apartamento', 'comercial', 'terreno', 'outro'
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(20,2) NOT NULL,
  current_value NUMERIC(20,2),
  mortgage_amount NUMERIC(20,2), -- Valor da hipoteca
  mortgage_remaining NUMERIC(20,2), -- Saldo devedor
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_purchase_date ON properties(purchase_date);

-- VEÍCULOS
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50), -- 'carro', 'moto', 'caminhão', 'outro'
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  purchase_date DATE,
  purchase_price NUMERIC(20,2),
  current_value NUMERIC(20,2),
  loan_amount NUMERIC(20,2), -- Valor do financiamento
  loan_remaining NUMERIC(20,2), -- Saldo devedor
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_purchase_date ON vehicles(purchase_date);

-- CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS accounts_payable (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creditor VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  amount NUMERIC(20,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_payable_user_id ON accounts_payable(user_id);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);

-- CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debtor VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  amount NUMERIC(20,2) NOT NULL,
  due_date DATE NOT NULL,
  received_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'received', 'overdue'
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_receivable_user_id ON accounts_receivable(user_id);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);

-- RECEITAS (efetivas, não previstas)
CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  amount NUMERIC(20,2) NOT NULL,
  income_date DATE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_income_date ON income(income_date);
CREATE INDEX idx_income_category ON income(category);

-- DESPESAS (efetivas, não previstas)
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(20,2) NOT NULL,
  expense_date DATE NOT NULL,
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- HISTÓRICO DE PATRIMÔNIO (snapshot mensal para análise)
CREATE TABLE IF NOT EXISTS wealth_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- Primeiro dia do mês
  investments_total NUMERIC(20,2) DEFAULT 0,
  properties_total NUMERIC(20,2) DEFAULT 0,
  vehicles_total NUMERIC(20,2) DEFAULT 0,
  accounts_payable_total NUMERIC(20,2) DEFAULT 0,
  accounts_receivable_total NUMERIC(20,2) DEFAULT 0,
  total_assets NUMERIC(20,2) DEFAULT 0,
  total_liabilities NUMERIC(20,2) DEFAULT 0,
  net_worth NUMERIC(20,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);

CREATE INDEX idx_wealth_history_user_id ON wealth_history(user_id);
CREATE INDEX idx_wealth_history_month ON wealth_history(month);

-- TRIGGERS para atualizar updated_at
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wealth_history_updated_at BEFORE UPDATE ON wealth_history
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
