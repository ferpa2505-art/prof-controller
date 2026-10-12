import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import userRoutes from './routes/user.js';
import webhookRoutes from './routes/webhook.js';
import financialRoutes from './routes/financial.js';

// Middleware
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());

// Serve index.html para rota raiz PRIMEIRO
app.get('/', (req, res) => {
  console.log('Serving index.html from:', path.join(projectRoot, 'index.html'));
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// Serve static files (CSS, JS, images, etc) com extensão explícita
app.use(express.static(projectRoot, {
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'svg', 'ico']
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (sem autenticação)
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

// Routes (com autenticação - DESABILITADA PARA TESTES)
// app.use('/subscription', verifyToken, subscriptionRoutes);
// app.use('/user', verifyToken, userRoutes);
app.use('/api/financial', financialRoutes); // Modo teste: sem auth

// Fallback: serve index.html para qualquer rota não encontrada
app.get('*', (req, res) => {
  console.log('Fallback: serving index.html for:', req.url);
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
