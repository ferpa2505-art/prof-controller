# 🧪 Testing Checklist - Real Data Integration

## 📋 Pre-Test Setup (5 minutes)

### Step 1: Add npm script
Edit `server/package.json`:
```json
{
  "scripts": {
    "seed:test": "node ../scripts/seed-test-data.js"
  }
}
```

### Step 2: Verify .env Configuration
Check `server/.env` has:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prof_controller
DB_USER=postgres
DB_PASSWORD=your_password
```

### Step 3: Ensure PostgreSQL is Running
```bash
# Windows (PowerShell):
# PostgreSQL should be running as service

# Mac/Linux:
brew services start postgresql
```

### Step 4: Database Schema Created
Verify tables exist:
```bash
psql -U postgres -d prof_controller -c "\dt"
```

Should show:
- `investments`
- `properties`
- `vehicles`
- `income`
- `expenses`
- `accounts_payable`
- `accounts_receivable`
- `wealth_history`

---

## 🌱 Seed Database (2 minutes)

### Run Test Data Seeding
```bash
cd server
npm run seed:test
```

**✅ Expected Output:**
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
```

---

## 🚀 Start Application

### Terminal 1: Start Server
```bash
cd server
npm install  # if needed
npm run dev
```

**Expected:** Server running on http://localhost:3000

### Terminal 2: Start Client
```bash
npm start  # or npm run dev
```

**Expected:** App opens at http://localhost:3000 (or whatever port)

---

## 🔐 Create Test Session

### Option A: Automatic Token (Recommended)

In browser console (F12):
```javascript
const testToken = btoa(JSON.stringify({
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  sub: '550e8400-e29b-41d4-a716-446655440000'
})) + '.header.signature';

localStorage.setItem('auth_token', testToken);
sessionStorage.setItem('auth_token', testToken);

// Refresh page
location.reload();
```

### Option B: Register New User

1. Click **Register** button
2. Fill in test account details:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Submit form
4. Login with same credentials

---

## ✅ Test the 4 Charts

Navigate to **Dashboard** tab. You should see:

### 1️⃣ **Evolução do Patrimônio** (Patrimony Evolution)

**Type:** Line Chart  
**Expected Data:**
- X-axis: Jun, Jul, Aug, Sep, Oct, Nov (2024)
- Y-axis: R$30k → R$128k
- Line should show growth trend

**✅ Success Criteria:**
- [x] Shows 6 data points (one per month)
- [x] Blue line with circular points
- [x] Legend shows "Patrimônio Líquido (R$)"
- [x] Values increase from left to right
- [x] Smooth animation when loading

**Data:**
```
Jun: R$30k → Jul: R$50k → Aug: R$68k → Sep: R$87k → Oct: R$105k → Nov: R$128k
```

---

### 2️⃣ **Distribuição de Investimentos** (Investment Distribution)

**Type:** Bar Chart  
**Expected Data:**
- X-axis: Investment types (Ações, Fundos, Cripto, Renda Fixa, etc.)
- Y-axis: Percentage (%)
- Different colors for each type

**✅ Success Criteria:**
- [x] Shows percentage breakdown
- [x] All bars visible (no overflow)
- [x] Colors are distinct
- [x] Values sum to ~100%
- [x] Labels readable

**Expected Distribution:**
```
Ações: ~32.1%
Criptos: ~24.6%
ETFs: ~19.7%
FIIs: ~10.7%
Tesouro: ~5.0%
Dividendos: ~7.9%
```

---

### 3️⃣ **Receitas vs Despesas** (Income vs Expenses)

**Type:** Bar Chart  
**Expected Data:**
- X-axis: Months (Jun, Jul, Aug, Sep, Oct, Nov)
- Y-axis: Amount (R$)
- Green bars = Income
- Red bars = Expenses

**✅ Success Criteria:**
- [x] 12 bars total (6 months × 2 series)
- [x] Income bars (green) > Expense bars (red)
- [x] Both series show proper alignment
- [x] Legend distinguishes Receitas vs Despesas
- [x] Values are reasonable (income ~8k-15k, expenses ~4k-6k)

**Expected Totals:**
```
Jun: R$12.15k income, R$3.81k expenses
Jul: R$10k income, R$4.47k expenses
Aug: R$11.7k income, R$3.96k expenses
Sep: R$8.88k income, R$4.68k expenses
Oct: R$13.5k income, R$4.48k expenses
Nov: R$8.5k income, R$5.27k expenses
```

---

### 4️⃣ **Composição de Ativos** (Asset Composition)

**Type:** Doughnut Chart  
**Expected Data:**
- Center hole (doughnut style)
- Colored segments for each asset type
- Legend below chart

**✅ Success Criteria:**
- [x] Shows 5+ asset segments
- [x] Center appears hollow (doughnut)
- [x] Colors are vibrant and distinct
- [x] Legend visible and readable
- [x] Segments proportional to percentages
- [x] Percentages sum to 100%

**Expected Breakdown:**
```
Stocks (Ações): ~29.5%
Cryptos: ~24.6%
ETFs: ~19.7%
Funds (Fundos): ~10.7%
Fixed Income: ~7.5%
(+ Properties + Vehicles if included)
```

---

## 🔍 Additional Verification

### Database Query Check
```sql
-- From PostgreSQL console:

-- Count records
SELECT COUNT(*) as investments FROM investments WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
SELECT COUNT(*) as properties FROM properties WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
SELECT COUNT(*) as vehicles FROM vehicles WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
SELECT COUNT(*) as income FROM income WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
SELECT COUNT(*) as expenses FROM expenses WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Expected: 10, 2, 2, 13, 35
```

### API Health Check
```javascript
// In browser console:

// Test patrimony endpoint
fetch('/api/financial/patrimony', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('auth_token')}`}
}).then(r => r.json()).then(d => console.log(d));

// Should return: { hasData: true, data: [array of 6 months] }
```

### Browser Console Logs
Open DevTools (F12) → Console tab

**✅ Should see:**
```
📊 Inicializando gráficos com dados reais (usuário: 550e8400-e29b-41d4-a716-446655440000 )
✅ Gráfico de patrimônio carregado
✅ Gráfico de distribuição carregado
✅ Gráfico de fluxo carregado
✅ Gráfico de ativos carregado
✅ Auto-refresh configurado a cada 30s
```

**❌ Should NOT see:**
```
❌ Erro ao carregar gráfico
Cannot read property 'data'
Unauthorized
401
```

---

## 🚫 Troubleshooting

### Issue: "Ainda Sem Dados Para Confecção dos Gráficos"

**Cause:** Database not seeded OR wrong user ID

**Solution:**
1. Run seed again: `npm run seed:test`
2. Check token in localStorage has user ID: `550e8400-e29b-41d4-a716-446655440000`
3. Reload page

---

### Issue: Charts are blank/white

**Cause:** Chart.js not initializing

**Solution:**
1. Check console (F12) for errors
2. Verify Chart.js loaded: `console.log(window.Chart)`
3. Clear cache: Ctrl+Shift+Delete → Clear browsing data
4. Hard refresh: Ctrl+Shift+R

---

### Issue: "Cannot read property 'data' of undefined"

**Cause:** API returned empty response

**Solution:**
1. Check database connection
2. Verify .env file correct
3. Restart server: `npm run dev`
4. Reseed: `npm run seed:test`

---

### Issue: Slow loading (takes >5 seconds)

**Cause:** Large dataset or slow database

**Solution:**
1. Check database performance
2. Verify no other queries running
3. Check network tab (F12) for slow API calls
4. Can be normal for first load

---

## 📊 Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Charts load time | <3s | __ |
| All 4 charts display | ✓ | __ |
| Data is real (not fake) | ✓ | __ |
| Responsive on mobile | ✓ | __ |
| Auto-refresh works | ✓ | __ |
| FAB buttons work | ✓ | __ |
| Add investment updates charts | ✓ | __ |
| Add income updates charts | ✓ | __ |
| Add expense updates charts | ✓ | __ |

---

## 🎯 Next Steps After Testing

1. **✅ Verify All Charts Work**
   - Confirm 4 charts display real data
   - Check responsive design
   - Test on mobile

2. **Phase 2: Validations**
   - Add backend validation
   - Improve error messages
   - Add data constraints

3. **Phase 3: Calculations**
   - Auto-calculate patrimony
   - Monthly snapshots
   - Trend analysis

4. **Phase 4: Tests**
   - Unit tests for API
   - E2E tests for forms
   - Chart rendering tests

---

## 📞 Questions?

If something doesn't work:
1. Check TEST_GUIDE.md for detailed instructions
2. Review IMPLEMENTATION_SUMMARY.md for architecture
3. Check browser console (F12) for errors
4. Reseed database: `npm run seed:test`

**Happy Testing! 🚀**
