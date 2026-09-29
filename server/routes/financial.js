import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// ============================================================
//  GET /api/financial/patrimony - Evolução do Patrimônio
// ============================================================
router.get('/patrimony', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar histórico de patrimônio mês a mês
    const query = `
      SELECT 
        month,
        total_assets,
        total_liabilities,
        net_worth
      FROM wealth_history
      WHERE user_id = $1
      ORDER BY month ASC
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        hasData: false,
        message: 'Ainda Sem Dados Para Confecção dos Gráficos'
      });
    }

    res.json({
      hasData: true,
      data: result.rows.map(row => ({
        month: new Date(row.month).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
        totalAssets: parseFloat(row.total_assets),
        totalLiabilities: parseFloat(row.total_liabilities),
        netWorth: parseFloat(row.net_worth)
      }))
    });
  } catch (error) {
    console.error('Error fetching patrimony data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do patrimônio' });
  }
});

// ============================================================
//  GET /api/financial/distribution - Distribuição (Investimentos + Imóveis + Veículos + Contas)
// ============================================================
router.get('/distribution', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar totais
    const investmentsQuery = `SELECT COALESCE(SUM(total_value), 0) as total FROM investments WHERE user_id = $1`;
    const propertiesQuery = `SELECT COALESCE(SUM(current_value), 0) as total FROM properties WHERE user_id = $1`;
    const vehiclesQuery = `SELECT COALESCE(SUM(current_value), 0) as total FROM vehicles WHERE user_id = $1`;
    
    // Saldo de contas (a receber - a pagar)
    const accountsQuery = `
      SELECT 
        COALESCE(SUM(ar.amount), 0) as receivable,
        COALESCE(SUM(ap.amount), 0) as payable
      FROM accounts_receivable ar
      FULL OUTER JOIN accounts_payable ap ON 1=1
      WHERE ar.user_id = $1 OR ap.user_id = $1
    `;

    const [inv, props, vehs, accts] = await Promise.all([
      pool.query(investmentsQuery, [userId]),
      pool.query(propertiesQuery, [userId]),
      pool.query(vehiclesQuery, [userId]),
      pool.query(accountsQuery, [userId])
    ]);

    const investments = parseFloat(inv.rows[0].total);
    const properties = parseFloat(props.rows[0].total);
    const vehicles = parseFloat(vehs.rows[0].total);
    const receivable = parseFloat(accts.rows[0]?.receivable || 0);
    const payable = parseFloat(accts.rows[0]?.payable || 0);
    const accountsBalance = receivable - payable;

    const total = investments + properties + vehicles + Math.max(accountsBalance, 0);

    if (total === 0) {
      return res.json({
        hasData: false,
        message: 'Ainda Sem Dados Para Confecção dos Gráficos'
      });
    }

    const distribution = [
      { name: 'Investimentos', value: investments, percentage: ((investments / total) * 100).toFixed(1) },
      { name: 'Imóveis', value: properties, percentage: ((properties / total) * 100).toFixed(1) },
      { name: 'Veículos', value: vehicles, percentage: ((vehicles / total) * 100).toFixed(1) },
      { name: 'Saldo Contas', value: Math.max(accountsBalance, 0), percentage: (((Math.max(accountsBalance, 0)) / total) * 100).toFixed(1) }
    ];

    res.json({
      hasData: true,
      data: distribution.filter(item => item.value > 0)
    });
  } catch (error) {
    console.error('Error fetching distribution data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de distribuição' });
  }
});

// ============================================================
//  GET /api/financial/cash-flow - Fluxo de Caixa (Receitas vs Despesas efetivas)
// ============================================================
router.get('/cash-flow', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar receitas e despesas mês a mês (efetivas)
    const query = `
      WITH months AS (
        SELECT DATE_TRUNC('month', income_date)::date as month
        FROM income
        WHERE user_id = $1
        UNION
        SELECT DATE_TRUNC('month', expense_date)::date as month
        FROM expenses
        WHERE user_id = $1
      ),
      monthly_data AS (
        SELECT 
          m.month,
          COALESCE(SUM(i.amount), 0) as income_total,
          COALESCE(SUM(e.amount), 0) as expense_total
        FROM months m
        LEFT JOIN income i ON DATE_TRUNC('month', i.income_date)::date = m.month AND i.user_id = $1
        LEFT JOIN expenses e ON DATE_TRUNC('month', e.expense_date)::date = m.month AND e.user_id = $1
        GROUP BY m.month
        ORDER BY m.month ASC
      )
      SELECT * FROM monthly_data
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        hasData: false,
        message: 'Ainda Sem Dados Para Confecção dos Gráficos'
      });
    }

    const data = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }),
      income: parseFloat(row.income_total),
      expense: parseFloat(row.expense_total)
    }));

    res.json({
      hasData: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de fluxo de caixa' });
  }
});

// ============================================================
//  GET /api/financial/assets - Composição de Ativos (por tipo)
// ============================================================
router.get('/assets', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar investimentos por tipo
    const query = `
      SELECT 
        type,
        COALESCE(SUM(total_value), 0) as total,
        COUNT(*) as count
      FROM investments
      WHERE user_id = $1
      GROUP BY type
      ORDER BY total DESC
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        hasData: false,
        message: 'Ainda Sem Dados Para Confecção dos Gráficos'
      });
    }

    const totalValue = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

    const typeLabels = {
      'acoes': 'Ações',
      'criptos': 'Criptos',
      'etfs': 'ETFs',
      'fiis': 'FIIs',
      'dividendos': 'Dividendos',
      'tesouro_direto': 'Tesouro Direto',
      'outros': 'Outros'
    };

    const assets = result.rows.map(row => ({
      name: typeLabels[row.type] || row.type,
      value: parseFloat(row.total),
      percentage: ((parseFloat(row.total) / totalValue) * 100).toFixed(1),
      count: row.count
    }));

    res.json({
      hasData: true,
      data: assets,
      total: totalValue
    });
  } catch (error) {
    console.error('Error fetching assets data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de ativos' });
  }
});

// ============================================================
//  POST /api/financial/investments - Adicionar Investimento
// ============================================================
router.post('/investments', verifyToken, async (req, res) => {
  try {
    const { type, description, quantity, unit_price, purchase_date, currency, notes } = req.body;
    const userId = req.user.id;
    const total_value = quantity * unit_price;

    const query = `
      INSERT INTO investments (user_id, type, description, quantity, unit_price, total_value, purchase_date, currency, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, type, description, quantity, unit_price, total_value, purchase_date, currency, notes]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Erro ao cadastrar investimento' });
  }
});

// ============================================================
//  POST /api/financial/properties - Adicionar Imóvel
// ============================================================
router.post('/properties', verifyToken, async (req, res) => {
  try {
    const { address, city, state, property_type, purchase_date, purchase_price, current_value, notes } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO properties (user_id, address, city, state, property_type, purchase_date, purchase_price, current_value, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, address, city, state, property_type, purchase_date, purchase_price, current_value, notes]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Erro ao cadastrar imóvel' });
  }
});

// ============================================================
//  POST /api/financial/vehicles - Adicionar Veículo
// ============================================================
router.post('/vehicles', verifyToken, async (req, res) => {
  try {
    const { vehicle_type, brand, model, year, purchase_date, purchase_price, current_value, notes } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO vehicles (user_id, vehicle_type, brand, model, year, purchase_date, purchase_price, current_value, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, vehicle_type, brand, model, year, purchase_date, purchase_price, current_value, notes]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Erro ao cadastrar veículo' });
  }
});

// ============================================================
//  POST /api/financial/income - Adicionar Receita
// ============================================================
router.post('/income', verifyToken, async (req, res) => {
  try {
    const { source, amount, income_date, category, description, notes } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO income (user_id, source, amount, income_date, category, description, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, source, amount, income_date, category, description, notes]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Erro ao cadastrar receita' });
  }
});

// ============================================================
//  POST /api/financial/expenses - Adicionar Despesa
// ============================================================
router.post('/expenses', verifyToken, async (req, res) => {
  try {
    const { description, amount, expense_date, category, notes } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO expenses (user_id, description, amount, expense_date, category, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, description, amount, expense_date, category, notes]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Erro ao cadastrar despesa' });
  }
});

export default router;
