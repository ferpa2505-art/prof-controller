# 🧪 ProF Controller - Test Guide with Real Data

## Quick Start - Populate Database with Test Data

### Prerequisites
- PostgreSQL running and configured
- Node.js and npm installed
- Server environment variables set up (.env file)

### Step 1: Update package.json

Add this script to your `server/package.json`:

```json
{
  "scripts": {
    "seed:test": "node ../scripts/seed-test-data.js"
  }
}
```

### Step 2: Run the Seed Script

From the project root:

```bash
cd server
npm run seed:test
```

**Output will look like:**
```
🌱 Starting database seed with test data...

🗑️  Cleaning existing test data...
💰 Inserting investments...
  ✅ 10 investments inserted
🏠 Inserting properties...
  ✅ 2 properties inserted
🚗 Inserting vehicles...
  ✅ 2 vehicles inserted
📈 Inserting income records...
  ✅ 13 income records inserted
📉 Inserting expense records...
  ✅ 35 expense records inserted
💎 Inserting wealth history...
  ✅ 6 wealth history records inserted

✅ Seed complete! Data summary:

📊 Database now contains:
   💰 10 investments
   🏠 2 properties
   🚗 2 vehicles
   📈 13 income records
   📉 35 expense records
   💎 6 wealth history snapshots

✨ Test user ID: 550e8400-e29b-41d4-a716-446655440000

🎯 To test: Open the app and check if the 4 charts now show real data!
```

## Step 3: Log In with Test User

To see the test data in action, you need to authenticate as the test user:

**Option A: Using Test Token (Recommended)**

The seed script uses this test user ID:
```
550e8400-e29b-41d4-a716-446655440000
```

You can manually create a JWT token for testing:

```javascript
// In browser console:
const token = btoa(JSON.stringify({
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000)
})) + '.' + btoa('header') + '.' + btoa('signature');

localStorage.setItem('auth_token', token);
// Refresh the page
```

**Option B: Register New Test User**

Create a new user through the app's registration flow.

## Step 4: View the Charts with Real Data

Once logged in as the test user, navigate to **Dashboard** and you should see:

### 📈 **Evolução do Patrimônio** (Patrimony Evolution)
- Line chart showing 6 months of net worth growth
- Data: June (R$30k) → November (R$128k)
- Shows total assets, liabilities, and net worth

### 🎯 **Distribuição de Investimentos** (Investment Distribution)
- Bar chart showing investment allocation by type
- Categories: Ações (Stocks), Criptos, ETFs, FIIs, Tesouro Direto, Dividendos
- Real percentages: 32.1% Stocks, 29.5% Crypto, 24.6% ETFs, etc.

### 💰 **Receitas vs Despesas** (Income vs Expenses)
- Bar chart comparing monthly income vs expenses
- Green bars = Income (salary + bonuses + freelance)
- Red bars = Expenses (rent + utilities + food + transport)
- Shows consistent monthly patterns

### 🏆 **Composição de Ativos** (Asset Composition)
- Doughnut chart showing percentage breakdown
- Includes: Stocks, ETFs, Cryptos, Funds, Fixed Income, Properties, Vehicles

## Test Data Summary

### 💰 Investments (10 total)
- **PETR4 (Petrobras)** - 100 shares @ R$45.50 = R$4,850
- **VALE3 (Vale)** - 50 shares @ R$89.30 = R$4,690
- **BBDC4 (Bradesco)** - 200 shares @ R$12.45 = R$2,590
- **Bitcoin** - 0.5 BTC @ R$180k = R$95,000
- **Ethereum** - 5 ETH @ R$8,500 = R$42,500
- **BOVA11 (Ibovespa ETF)** - 150 shares = R$8,962.50
- **IFIX11 (Real Estate ETF)** - 80 shares = R$7,368
- **FII** - 200 shares @ R$110.50 = R$22,100
- **Tesouro Selic** - R$10k @ 1.0 = R$10,350
- **Accumulated Dividends** - R$1,850

**Total Investments: R$203,255**

### 🏠 Properties (2 total)
- **Apartment** (Vila Mariana, São Paulo)
  - Purchase: R$450,000 (Jun 2020)
  - Current: R$580,000
  - Mortgage: R$350,000 initial → R$220,000 remaining

- **Commercial Space** (Avenida Paulista)
  - Purchase: R$1,200,000 (Mar 2021)
  - Current: R$1,450,000
  - Mortgage: R$900,000 initial → R$650,000 remaining

**Total Properties: R$2,030,000**

### 🚗 Vehicles (2 total)
- **Toyota Corolla 2022**
  - Purchase: R$120,000
  - Current: R$110,000
  - Loan: R$80,000 initial → R$45,000 remaining

- **Honda CB 500 2023**
  - Purchase: R$28,000
  - Current: R$26,500
  - No loan (paid off)

**Total Vehicles: R$136,500**

### 📈 Income (13 records, 6 months)
- **Monthly Salary**: R$8,500 × 6 = R$51,000
- **Bonuses**: R$3,200 (June) + R$5,000 (October) = R$8,200
- **Freelance**: R$1,500 + R$2,000 = R$3,500
- **Dividends**: R$450 + R$380 = R$830
- **Other**: R$1,200 (sales)

**Total Income: R$64,730**

### 📉 Expenses (35 records, 6 months)
- **Rent**: R$1,800 × 6 = R$10,800
- **Food/Groceries**: R$4,130
- **Fuel**: R$1,880
- **Utilities**: R$2,250
- **Health/Gym**: R$350
- **Entertainment**: R$80
- **Insurance**: R$250
- **Education**: R$500
- **Restaurants**: R$670
- **Medical**: R$200
- **Other**: R$540

**Total Expenses: R$21,650**

### 💎 Wealth History (6 months)
```
Jun 2024: Assets R$150k - Liabilities R$120k = Net Worth R$30k
Jul 2024: Assets R$165k - Liabilities R$115k = Net Worth R$50k
Aug 2024: Assets R$180k - Liabilities R$112k = Net Worth R$68k
Sep 2024: Assets R$195k - Liabilities R$108k = Net Worth R$87k
Oct 2024: Assets R$210k - Liabilities R$105k = Net Worth R$105k
Nov 2024: Assets R$228k - Liabilities R$100k = Net Worth R$128k
```

**Total Net Worth Growth: +R$98,000 (+327% in 6 months!)**

## Expected Chart Results

### ✅ What Should Happen

1. **On first page load** → API calls fetch real data
2. **Charts render** with actual values (NOT fake data)
3. **Show smooth animations** with data labels
4. **Auto-refresh every 30 seconds** if database updates
5. **Responsive design** works on mobile/tablet/desktop

### ❌ If Something's Wrong

**Charts show "Ainda Sem Dados Para Confecção dos Gráficos"**
- ✅ This is CORRECT if user not logged in or no data exists
- ✅ Check browser console (F12) for errors
- ✅ Verify token is in localStorage

**Error in console:**
```
❌ Erro ao carregar gráfico: Cannot read property 'data'
```
- Check if database connection is working
- Run: `npm run seed:test` again
- Verify .env file has correct DB credentials

**Blank charts (no data)**
- User ID in token doesn't match test data (550e8400...)
- Database not seeded properly
- API returning empty `hasData: false`

## Manual Test Checklist

- [ ] Database seeded successfully
- [ ] Charts load without errors
- [ ] Show real data (not fake values)
- [ ] Clicking tabs switches between charts
- [ ] Data updates every 30 seconds
- [ ] Works on mobile (responsive)
- [ ] "Sem Dados" message shows when appropriate
- [ ] Add new investment via FAB button
- [ ] Charts update after adding new data

## Next Steps

After verifying charts work with test data:

1. **Add Form Validation** (Phase 2)
   - Backend validation for each field
   - Frontend error handling
   - Database constraints

2. **Implement Patrimony Calculations** (Phase 3)
   - Auto-calculate wealth_history monthly snapshots
   - Update totals when new data is added
   - Historical trend analysis

3. **Add Unit Tests** (Phase 4)
   - API endpoint tests
   - Form submission tests
   - Chart rendering tests

## Browser Developer Tools

Press **F12** and open the **Console** tab to see:

```javascript
// Check if charts manager is initialized
console.log(window.chartsManager);

// Manually refresh charts
window.chartsManager.refresh();

// Check user ID
const token = localStorage.getItem('auth_token');
console.log(JSON.parse(atob(token.split('.')[1])));

// Monitor API calls
// Network tab → filter by 'financial' → see requests/responses
```

## Support

If you encounter issues:

1. Check browser console for error messages
2. Check server logs: `npm run dev`
3. Verify database connection: `psql -U postgres -d prof_controller`
4. Reseed database: `npm run seed:test`
