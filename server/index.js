import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

// Routes
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import userRoutes from './routes/user.js';
import webhookRoutes from './routes/webhook.js';

// Middleware
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (sem autenticação)
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

// Routes (com autenticação)
app.use('/subscription', verifyToken, subscriptionRoutes);
app.use('/user', verifyToken, userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
