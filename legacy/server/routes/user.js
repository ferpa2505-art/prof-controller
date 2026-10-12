import express from 'express';
import User from '../models/User.js';
import stripe from '../config/stripe.js';
import { sendCancellationEmail } from '../services/email.js';

const router = express.Router();

/**
 * GET /user/profile
 * Obter perfil do usuário
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        serial: user.serial,
        subscriptionStatus: user.subscription_status,
        nextBillingDate: user.next_billing_date,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao recuperar perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /user/cancel-subscription
 * Cancelar assinatura
 */
router.post('/cancel-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.stripe_customer_id) {
      return res.status(400).json({ error: 'Sem assinatura ativa' });
    }

    // Cancelar em Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      limit: 1
    });

    if (subscriptions.data.length > 0) {
      await stripe.subscriptions.del(subscriptions.data[0].id);
    }

    // Atualizar no banco de dados
    const updatedUser = await User.cancelSubscription(req.userId);

    // Enviar email de cancelamento
    try {
      await sendCancellationEmail(updatedUser.email, updatedUser.name);
    } catch (error) {
      console.error('Erro ao enviar email de cancelamento:', error);
    }

    res.json({
      message: 'Assinatura cancelada com sucesso',
      user: {
        id: updatedUser.id,
        subscriptionStatus: updatedUser.subscription_status
      }
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /user/subscription-status
 * Verificar status da assinatura
 */
router.get('/subscription-status', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      status: user.subscription_status,
      nextBillingDate: user.next_billing_date,
      stripeCustomer: user.stripe_customer_id ? 'linked' : 'not_linked'
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
