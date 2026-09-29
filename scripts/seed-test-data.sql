/**
 * Seed Test Data - Real Financial Data for Testing
 * Populates all financial tables with realistic example data
 * Run this AFTER creating the schema
 */

-- Set test user ID (replace with actual user_id from your auth system)
-- For testing, we'll use a fixed test user ID
SET search_path = public;

-- Delete existing test data (optional - comment out to keep data)
DELETE FROM wealth_history WHERE 1=1;
DELETE FROM expenses WHERE 1=1;
DELETE FROM income WHERE 1=1;
DELETE FROM accounts_receivable WHERE 1=1;
DELETE FROM accounts_payable WHERE 1=1;
DELETE FROM vehicles WHERE 1=1;
DELETE FROM properties WHERE 1=1;
DELETE FROM investments WHERE 1=1;

-- Generate a test user ID (in production, use actual user from auth)
-- For now, use UUIDv4: 550e8400-e29b-41d4-a716-446655440000
INSERT INTO investments (
  user_id, investment_type, quantity, unit_price, purchase_date, current_value, notes
) VALUES
-- Ações Brasileiras
('550e8400-e29b-41d4-a716-446655440000', 'Ações', 100, 45.50, '2024-01-15', 4850.00, 'PETR4 - Petrobras'),
('550e8400-e29b-41d4-a716-446655440000', 'Ações', 50, 89.30, '2024-02-10', 4690.00, 'VALE3 - Vale'),
('550e8400-e29b-41d4-a716-446655440000', 'Ações', 200, 12.45, '2024-03-05', 2590.00, 'BBDC4 - Bradesco'),

-- Criptomoedas
('550e8400-e29b-41d4-a716-446655440000', 'Criptos', 0.5, 180000.00, '2024-04-20', 95000.00, 'Bitcoin'),
('550e8400-e29b-41d4-a716-446655440000', 'Criptos', 5, 8500.00, '2024-05-10', 42500.00, 'Ethereum'),

-- ETFs
('550e8400-e29b-41d4-a716-446655440000', 'ETFs', 150, 58.75, '2024-02-15', 8962.50, 'BOVA11 - Ibovespa'),
('550e8400-e29b-41d4-a716-446655440000', 'ETFs', 80, 92.10, '2024-03-20', 7368.00, 'IFIX11 - FIIs'),

-- FIIs
('550e8400-e29b-41d4-a716-446655440000', 'FIIs', 200, 110.50, '2024-01-30', 22100.00, 'FII Imobiliário'),

-- Tesouro Direto
('550e8400-e29b-41d4-a716-446655440000', 'Tesouro Direto', 10000, 1.00, '2024-02-01', 10350.00, 'Tesouro Selic'),

-- Dividendos (acumulados)
('550e8400-e29b-41d4-a716-446655440000', 'Dividendos', 1, 1850.00, '2024-06-30', 1850.00, 'Dividendos acumulados');

-- Insert properties
INSERT INTO properties (
  user_id, address, city, state, zip_code, property_type, purchase_date, 
  purchase_price, current_value, mortgage_amount, mortgage_remaining, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Rua das Flores 123', 'São Paulo', 'SP', '01234-567', 
 'Apartamento', '2020-06-15', 450000.00, 580000.00, 350000.00, 220000.00, 'Apartamento 3 quartos - Vila Mariana'),
('550e8400-e29b-41d4-a716-446655440000', 'Avenida Paulista 1000', 'São Paulo', 'SP', '01311-100', 
 'Comercial', '2021-03-20', 1200000.00, 1450000.00, 900000.00, 650000.00, 'Sala comercial');

-- Insert vehicles
INSERT INTO vehicles (
  user_id, vehicle_type, brand, model, year, purchase_date, 
  purchase_price, current_value, loan_amount, loan_remaining, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Carro', 'Toyota', 'Corolla', 2022, '2022-05-10', 
 120000.00, 110000.00, 80000.00, 45000.00, 'Corolla XEi automático'),
('550e8400-e29b-41d4-a716-446655440000', 'Moto', 'Honda', 'CB 500', 2023, '2023-02-20', 
 28000.00, 26500.00, NULL, NULL, 'Moto de passeio');

-- Insert income (last 6 months)
INSERT INTO income (
  user_id, description, amount, income_date, category, notes
) VALUES
-- June 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Junho', 8500.00, '2024-06-30', 'Salário', 'Salário empresa'),
('550e8400-e29b-41d4-a716-446655440000', 'Bônus Semestral', 3200.00, '2024-06-30', 'Bônus', 'Bônus semestral'),
('550e8400-e29b-41d4-a716-446655440000', 'Dividendos', 450.00, '2024-06-20', 'Dividendos', 'Dividendos de ações'),

-- July 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Julho', 8500.00, '2024-07-31', 'Salário', 'Salário empresa'),
('550e8400-e29b-41d4-a716-446655440000', 'Freelance', 1500.00, '2024-07-15', 'Freelance', 'Projeto web'),

-- August 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Agosto', 8500.00, '2024-08-31', 'Salário', 'Salário empresa'),
('550e8400-e29b-41d4-a716-446655440000', 'Freelance', 2000.00, '2024-08-20', 'Freelance', 'Consultoria'),
('550e8400-e29b-41d4-a716-446655440000', 'Vendas', 1200.00, '2024-08-25', 'Vendas', 'Venda de itens usados'),

-- September 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Setembro', 8500.00, '2024-09-30', 'Salário', 'Salário empresa'),
('550e8400-e29b-41d4-a716-446655440000', 'Dividendos', 380.00, '2024-09-15', 'Dividendos', 'Dividendos FII'),

-- October 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Outubro', 8500.00, '2024-10-31', 'Salário', 'Salário empresa'),
('550e8400-e29b-41d4-a716-446655440000', 'Bônus Anual', 5000.00, '2024-10-31', 'Bônus', 'Bônus anual'),

-- November 2024
('550e8400-e29b-41d4-a716-446655440000', 'Salário Novembro', 8500.00, '2024-11-30', 'Salário', 'Salário empresa');

-- Insert expenses (last 6 months)
INSERT INTO expenses (
  user_id, description, amount, expense_date, category, notes
) VALUES
-- June 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Junho', 1800.00, '2024-06-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 650.00, '2024-06-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 280.00, '2024-06-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 350.00, '2024-06-20', 'Utilidades', 'Conta luz'),
('550e8400-e29b-41d4-a716-446655440000', 'Internet', 100.00, '2024-06-20', 'Utilidades', 'Provedor internet'),
('550e8400-e29b-41d4-a716-446655440000', 'Academia', 150.00, '2024-06-05', 'Saúde', 'Mensalidade academia'),
('550e8400-e29b-41d4-a716-446655440000', 'Cinema', 80.00, '2024-06-22', 'Lazer', 'Entrada cinema'),

-- July 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Julho', 1800.00, '2024-07-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 720.00, '2024-07-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 320.00, '2024-07-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 380.00, '2024-07-20', 'Utilidades', 'Conta luz'),
('550e8400-e29b-41d4-a716-446655440000', 'Seguro Carro', 250.00, '2024-07-10', 'Seguros', 'IPVA e seguro'),

-- August 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Agosto', 1800.00, '2024-08-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 680.00, '2024-08-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 300.00, '2024-08-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 360.00, '2024-08-20', 'Utilidades', 'Conta luz'),
('550e8400-e29b-41d4-a716-446655440000', 'Consulta Médica', 200.00, '2024-08-12', 'Saúde', 'Consulta particular'),
('550e8400-e29b-41d4-a716-446655440000', 'Refeições Fora', 420.00, '2024-08-25', 'Alimentação', 'Refeições e bar'),

-- September 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Setembro', 1800.00, '2024-09-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 700.00, '2024-09-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 310.00, '2024-09-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 370.00, '2024-09-20', 'Utilidades', 'Conta luz'),
('550e8400-e29b-41d4-a716-446655440000', 'Educação', 500.00, '2024-09-05', 'Educação', 'Curso online'),

-- October 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Outubro', 1800.00, '2024-10-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 710.00, '2024-10-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 330.00, '2024-10-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 390.00, '2024-10-20', 'Utilidades', 'Conta luz'),
('550e8400-e29b-41d4-a716-446655440000', 'Restaurante', 250.00, '2024-10-28', 'Alimentação', 'Jantar especial'),

-- November 2024
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel Novembro', 1800.00, '2024-11-01', 'Moradia', 'Aluguel apartamento'),
('550e8400-e29b-41d4-a716-446655440000', 'Supermercado', 730.00, '2024-11-10', 'Alimentação', 'Compras mês'),
('550e8400-e29b-41d4-a716-446655440000', 'Combustível', 340.00, '2024-11-15', 'Transporte', 'Gasolina'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia', 400.00, '2024-11-20', 'Utilidades', 'Conta luz');

-- Insert accounts payable (dívidas)
INSERT INTO accounts_payable (
  user_id, creditor, amount, due_date, paid_date, category, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Cartão de Crédito', 2500.00, '2024-11-15', NULL, 'Crédito', 'Fatura pendente'),
('550e8400-e29b-41d4-a716-446655440000', 'Banco do Brasil', 5000.00, '2024-12-01', NULL, 'Empréstimo', 'Parcela empréstimo pessoal');

-- Insert accounts receivable (a receber)
INSERT INTO accounts_receivable (
  user_id, debtor, amount, due_date, received_date, category, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Cliente Projeto Web', 3000.00, '2024-11-30', NULL, 'Freelance', 'Projeto ainda em progresso');

-- Insert wealth history (patrimony snapshots)
-- These will be automatically calculated by the trigger, but we can insert initial values
INSERT INTO wealth_history (user_id, snapshot_date, total_assets, total_liabilities, net_worth) VALUES
('550e8400-e29b-41d4-a716-446655440000', '2024-06-01', 150000.00, 120000.00, 30000.00),
('550e8400-e29b-41d4-a716-446655440000', '2024-07-01', 165000.00, 115000.00, 50000.00),
('550e8400-e29b-41d4-a716-446655440000', '2024-08-01', 180000.00, 112000.00, 68000.00),
('550e8400-e29b-41d4-a716-446655440000', '2024-09-01', 195000.00, 108000.00, 87000.00),
('550e8400-e29b-41d4-a716-446655440000', '2024-10-01', 210000.00, 105000.00, 105000.00),
('550e8400-e29b-41d4-a716-446655440000', '2024-11-01', 228000.00, 100000.00, 128000.00);

-- Verify data was inserted
SELECT 'Investments' as table_name, COUNT(*) as count FROM investments WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Properties', COUNT(*) FROM properties WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Income', COUNT(*) FROM income WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Wealth History', COUNT(*) FROM wealth_history WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
