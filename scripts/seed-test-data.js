/**
 * Seed Test Data Script
 * Populates PostgreSQL with realistic financial test data
 * 
 * Usage: node scripts/seed-test-data.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = require('pg');

const testUserId = '550e8400-e29b-41d4-a716-446655440000';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'prof_controller'
});

const seedData = {
  investments: [
    // Ações
    { type: 'Ações', qty: 100, price: 45.50, date: '2024-01-15', value: 4850.00, notes: 'PETR4 - Petrobras' },
    { type: 'Ações', qty: 50, price: 89.30, date: '2024-02-10', value: 4690.00, notes: 'VALE3 - Vale' },
    { type: 'Ações', qty: 200, price: 12.45, date: '2024-03-05', value: 2590.00, notes: 'BBDC4 - Bradesco' },
    
    // Criptos
    { type: 'Criptos', qty: 0.5, price: 180000.00, date: '2024-04-20', value: 95000.00, notes: 'Bitcoin' },
    { type: 'Criptos', qty: 5, price: 8500.00, date: '2024-05-10', value: 42500.00, notes: 'Ethereum' },
    
    // ETFs
    { type: 'ETFs', qty: 150, price: 58.75, date: '2024-02-15', value: 8962.50, notes: 'BOVA11 - Ibovespa' },
    { type: 'ETFs', qty: 80, price: 92.10, date: '2024-03-20', value: 7368.00, notes: 'IFIX11 - FIIs' },
    
    // FIIs
    { type: 'FIIs', qty: 200, price: 110.50, date: '2024-01-30', value: 22100.00, notes: 'FII Imobiliário' },
    
    // Tesouro Direto
    { type: 'Tesouro Direto', qty: 10000, price: 1.00, date: '2024-02-01', value: 10350.00, notes: 'Tesouro Selic' },
    
    // Dividendos
    { type: 'Dividendos', qty: 1, price: 1850.00, date: '2024-06-30', value: 1850.00, notes: 'Dividendos acumulados' }
  ],
  properties: [
    {
      address: 'Rua das Flores 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '01234-567',
      type: 'Apartamento',
      purchase_date: '2020-06-15',
      purchase_price: 450000.00,
      current_value: 580000.00,
      mortgage_amount: 350000.00,
      mortgage_remaining: 220000.00,
      notes: 'Apartamento 3 quartos - Vila Mariana'
    },
    {
      address: 'Avenida Paulista 1000',
      city: 'São Paulo',
      state: 'SP',
      zip: '01311-100',
      type: 'Comercial',
      purchase_date: '2021-03-20',
      purchase_price: 1200000.00,
      current_value: 1450000.00,
      mortgage_amount: 900000.00,
      mortgage_remaining: 650000.00,
      notes: 'Sala comercial'
    }
  ],
  vehicles: [
    {
      type: 'Carro',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      purchase_date: '2022-05-10',
      purchase_price: 120000.00,
      current_value: 110000.00,
      loan_amount: 80000.00,
      loan_remaining: 45000.00,
      notes: 'Corolla XEi automático'
    },
    {
      type: 'Moto',
      brand: 'Honda',
      model: 'CB 500',
      year: 2023,
      purchase_date: '2023-02-20',
      purchase_price: 28000.00,
      current_value: 26500.00,
      loan_amount: null,
      loan_remaining: null,
      notes: 'Moto de passeio'
    }
  ],
  income: [
    { desc: 'Salário Junho', amount: 8500.00, date: '2024-06-30', cat: 'Salário', notes: 'Salário empresa' },
    { desc: 'Bônus Semestral', amount: 3200.00, date: '2024-06-30', cat: 'Bônus', notes: 'Bônus semestral' },
    { desc: 'Dividendos', amount: 450.00, date: '2024-06-20', cat: 'Dividendos', notes: 'Dividendos de ações' },
    
    { desc: 'Salário Julho', amount: 8500.00, date: '2024-07-31', cat: 'Salário', notes: 'Salário empresa' },
    { desc: 'Freelance', amount: 1500.00, date: '2024-07-15', cat: 'Freelance', notes: 'Projeto web' },
    
    { desc: 'Salário Agosto', amount: 8500.00, date: '2024-08-31', cat: 'Salário', notes: 'Salário empresa' },
    { desc: 'Freelance', amount: 2000.00, date: '2024-08-20', cat: 'Freelance', notes: 'Consultoria' },
    { desc: 'Vendas', amount: 1200.00, date: '2024-08-25', cat: 'Vendas', notes: 'Venda de itens usados' },
    
    { desc: 'Salário Setembro', amount: 8500.00, date: '2024-09-30', cat: 'Salário', notes: 'Salário empresa' },
    { desc: 'Dividendos', amount: 380.00, date: '2024-09-15', cat: 'Dividendos', notes: 'Dividendos FII' },
    
    { desc: 'Salário Outubro', amount: 8500.00, date: '2024-10-31', cat: 'Salário', notes: 'Salário empresa' },
    { desc: 'Bônus Anual', amount: 5000.00, date: '2024-10-31', cat: 'Bônus', notes: 'Bônus anual' },
    
    { desc: 'Salário Novembro', amount: 8500.00, date: '2024-11-30', cat: 'Salário', notes: 'Salário empresa' }
  ],
  expenses: [
    // June
    { desc: 'Aluguel Junho', amount: 1800.00, date: '2024-06-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 650.00, date: '2024-06-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 280.00, date: '2024-06-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 350.00, date: '2024-06-20', cat: 'Utilidades', notes: 'Conta luz' },
    { desc: 'Internet', amount: 100.00, date: '2024-06-20', cat: 'Utilidades', notes: 'Provedor internet' },
    { desc: 'Academia', amount: 150.00, date: '2024-06-05', cat: 'Saúde', notes: 'Mensalidade academia' },
    { desc: 'Cinema', amount: 80.00, date: '2024-06-22', cat: 'Lazer', notes: 'Entrada cinema' },
    
    // July
    { desc: 'Aluguel Julho', amount: 1800.00, date: '2024-07-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 720.00, date: '2024-07-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 320.00, date: '2024-07-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 380.00, date: '2024-07-20', cat: 'Utilidades', notes: 'Conta luz' },
    { desc: 'Seguro Carro', amount: 250.00, date: '2024-07-10', cat: 'Seguros', notes: 'IPVA e seguro' },
    
    // August
    { desc: 'Aluguel Agosto', amount: 1800.00, date: '2024-08-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 680.00, date: '2024-08-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 300.00, date: '2024-08-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 360.00, date: '2024-08-20', cat: 'Utilidades', notes: 'Conta luz' },
    { desc: 'Consulta Médica', amount: 200.00, date: '2024-08-12', cat: 'Saúde', notes: 'Consulta particular' },
    { desc: 'Refeições Fora', amount: 420.00, date: '2024-08-25', cat: 'Alimentação', notes: 'Refeições e bar' },
    
    // September
    { desc: 'Aluguel Setembro', amount: 1800.00, date: '2024-09-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 700.00, date: '2024-09-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 310.00, date: '2024-09-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 370.00, date: '2024-09-20', cat: 'Utilidades', notes: 'Conta luz' },
    { desc: 'Educação', amount: 500.00, date: '2024-09-05', cat: 'Educação', notes: 'Curso online' },
    
    // October
    { desc: 'Aluguel Outubro', amount: 1800.00, date: '2024-10-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 710.00, date: '2024-10-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 330.00, date: '2024-10-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 390.00, date: '2024-10-20', cat: 'Utilidades', notes: 'Conta luz' },
    { desc: 'Restaurante', amount: 250.00, date: '2024-10-28', cat: 'Alimentação', notes: 'Jantar especial' },
    
    // November
    { desc: 'Aluguel Novembro', amount: 1800.00, date: '2024-11-01', cat: 'Moradia', notes: 'Aluguel apartamento' },
    { desc: 'Supermercado', amount: 730.00, date: '2024-11-10', cat: 'Alimentação', notes: 'Compras mês' },
    { desc: 'Combustível', amount: 340.00, date: '2024-11-15', cat: 'Transporte', notes: 'Gasolina' },
    { desc: 'Energia', amount: 400.00, date: '2024-11-20', cat: 'Utilidades', notes: 'Conta luz' }
  ],
  wealth_history: [
    { date: '2024-06-01', assets: 150000.00, liabilities: 120000.00, net: 30000.00 },
    { date: '2024-07-01', assets: 165000.00, liabilities: 115000.00, net: 50000.00 },
    { date: '2024-08-01', assets: 180000.00, liabilities: 112000.00, net: 68000.00 },
    { date: '2024-09-01', assets: 195000.00, liabilities: 108000.00, net: 87000.00 },
    { date: '2024-10-01', assets: 210000.00, liabilities: 105000.00, net: 105000.00 },
    { date: '2024-11-01', assets: 228000.00, liabilities: 100000.00, net: 128000.00 }
  ]
};

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seed with test data...\n');

    // Delete existing data
    console.log('🗑️  Cleaning existing test data...');
    await client.query('DELETE FROM wealth_history WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM expenses WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM income WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM accounts_receivable WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM accounts_payable WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM vehicles WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM properties WHERE user_id = $1', [testUserId]);
    await client.query('DELETE FROM investments WHERE user_id = $1', [testUserId]);

    // Insert investments
    console.log('💰 Inserting investments...');
    for (const inv of seedData.investments) {
      await client.query(
        'INSERT INTO investments (user_id, investment_type, quantity, unit_price, purchase_date, current_value, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [testUserId, inv.type, inv.qty, inv.price, inv.date, inv.value, inv.notes]
      );
    }
    console.log(`  ✅ ${seedData.investments.length} investments inserted`);

    // Insert properties
    console.log('🏠 Inserting properties...');
    for (const prop of seedData.properties) {
      await client.query(
        'INSERT INTO properties (user_id, address, city, state, zip_code, property_type, purchase_date, purchase_price, current_value, mortgage_amount, mortgage_remaining, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [testUserId, prop.address, prop.city, prop.state, prop.zip, prop.type, prop.purchase_date, prop.purchase_price, prop.current_value, prop.mortgage_amount, prop.mortgage_remaining, prop.notes]
      );
    }
    console.log(`  ✅ ${seedData.properties.length} properties inserted`);

    // Insert vehicles
    console.log('🚗 Inserting vehicles...');
    for (const veh of seedData.vehicles) {
      await client.query(
        'INSERT INTO vehicles (user_id, vehicle_type, brand, model, year, purchase_date, purchase_price, current_value, loan_amount, loan_remaining, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [testUserId, veh.type, veh.brand, veh.model, veh.year, veh.purchase_date, veh.purchase_price, veh.current_value, veh.loan_amount, veh.loan_remaining, veh.notes]
      );
    }
    console.log(`  ✅ ${seedData.vehicles.length} vehicles inserted`);

    // Insert income
    console.log('📈 Inserting income records...');
    for (const inc of seedData.income) {
      await client.query(
        'INSERT INTO income (user_id, description, amount, income_date, category, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [testUserId, inc.desc, inc.amount, inc.date, inc.cat, inc.notes]
      );
    }
    console.log(`  ✅ ${seedData.income.length} income records inserted`);

    // Insert expenses
    console.log('📉 Inserting expense records...');
    for (const exp of seedData.expenses) {
      await client.query(
        'INSERT INTO expenses (user_id, description, amount, expense_date, category, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [testUserId, exp.desc, exp.amount, exp.date, exp.cat, exp.notes]
      );
    }
    console.log(`  ✅ ${seedData.expenses.length} expense records inserted`);

    // Insert wealth history
    console.log('💎 Inserting wealth history...');
    for (const wh of seedData.wealth_history) {
      await client.query(
        'INSERT INTO wealth_history (user_id, snapshot_date, total_assets, total_liabilities, net_worth) VALUES ($1, $2, $3, $4, $5)',
        [testUserId, wh.date, wh.assets, wh.liabilities, wh.net]
      );
    }
    console.log(`  ✅ ${seedData.wealth_history.length} wealth history records inserted`);

    // Verify data
    console.log('\n✅ Seed complete! Data summary:');
    const result = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM investments WHERE user_id = $1) as investments,
        (SELECT COUNT(*) FROM properties WHERE user_id = $1) as properties,
        (SELECT COUNT(*) FROM vehicles WHERE user_id = $1) as vehicles,
        (SELECT COUNT(*) FROM income WHERE user_id = $1) as income,
        (SELECT COUNT(*) FROM expenses WHERE user_id = $1) as expenses,
        (SELECT COUNT(*) FROM wealth_history WHERE user_id = $1) as wealth_history
    `, [testUserId]);
    
    const counts = result.rows[0];
    console.log(`\n📊 Database now contains:`);
    console.log(`   💰 ${counts.investments} investments`);
    console.log(`   🏠 ${counts.properties} properties`);
    console.log(`   🚗 ${counts.vehicles} vehicles`);
    console.log(`   📈 ${counts.income} income records`);
    console.log(`   📉 ${counts.expenses} expense records`);
    console.log(`   💎 ${counts.wealth_history} wealth history snapshots`);
    console.log(`\n✨ Test user ID: ${testUserId}`);
    console.log(`\n🎯 To test: Open the app and check if the 4 charts now show real data!`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
