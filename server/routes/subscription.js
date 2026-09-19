import express from 'express';
import {
  createCheckoutSession,
  getCheckoutSession,
  createPortalSession
} from '../services/stripe.js';
import Payment from '../models/Payment.js';

const router = express.Router();

/**
 * POST /subscription/checkout
 * Criar sessão de checkout
 */
router.post('/checkout', async (req, res) => {
  try {
    const { plan, currency = 'BRL' } = req.body;

    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const session = await createCheckoutSession(req.userId, plan, currency);

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /subscription/session/:sessionId
 * Recuperar detalhes da sessão de checkout
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getCheckoutSession(sessionId);

    res.json({
      sessionId: session.id,
      status: session.status,
      customer: session.customer,
      subscription: session.subscription
    });
  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /subscription/payments
 * Listar histórico de pagamentos
 */
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.findByUserId(req.userId);

    res.json({
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        plan: p.plan,
        status: p.status,
        date: p.created_at
      }))
    });
  } catch (error) {
    console.error('Erro ao recuperar pagamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscription/portal
 * Criar sessão do portal de gerenciamento
 */
router.post('/portal', async (req, res) => {
  try {
    const session = await createPortalSession(req.userId);

    res.json({
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
