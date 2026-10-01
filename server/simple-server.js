import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url.startsWith('/api/financial/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Dummy financial data
    if (req.url === '/api/financial/patrimony') {
      res.end(JSON.stringify({
        data: [
          { date: '2024-06-01', value: 30000 },
          { date: '2024-07-01', value: 50000 },
          { date: '2024-08-01', value: 68000 },
          { date: '2024-09-01', value: 87000 },
          { date: '2024-10-01', value: 105000 },
          { date: '2024-11-01', value: 128000 }
        ]
      }));
    } else if (req.url === '/api/financial/distribution') {
      res.end(JSON.stringify({
        data: [
          { type: 'Ações', percentage: 32.1 },
          { type: 'Criptos', percentage: 24.6 },
          { type: 'ETFs', percentage: 19.7 },
          { type: 'FIIs', percentage: 10.7 },
          { type: 'Tesouro Direto', percentage: 5.0 },
          { type: 'Dividendos', percentage: 7.9 }
        ]
      }));
    } else if (req.url === '/api/financial/cashflow') {
      res.end(JSON.stringify({
        data: [
          { month: 'Jun', income: 11650, expense: 3260 },
          { month: 'Jul', income: 12000, expense: 3150 },
          { month: 'Aug', income: 11700, expense: 3560 },
          { month: 'Sep', income: 8880, expense: 3070 },
          { month: 'Oct', income: 13500, expense: 3390 },
          { month: 'Nov', income: 8500, expense: 3230 }
        ]
      }));
    } else if (req.url === '/api/financial/assets') {
      res.end(JSON.stringify({
        data: [
          { asset: 'Ações', percentage: 32.1 },
          { asset: 'Criptos', percentage: 24.6 },
          { asset: 'ETFs', percentage: 19.7 },
          { asset: 'FIIs', percentage: 10.7 },
          { asset: 'Tesouro', percentage: 12.2 }
        ]
      }));
    } else {
      res.end(JSON.stringify({ data: [] }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`Environment: development`);
});
