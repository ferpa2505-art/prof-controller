import express from 'express';
import stripe from '../config/stripe.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import {
  handlePaymentSuccess,
  handleInvoicePaymentSucceeded,
  handleCustomerSubscriptionDeleted
} from '../services/stripe.js';
import {
  sendPaymentReceipt,
  sendRenewalReminder
} from '../services/email.js';

const router = express.Router();

/**
 * POST /webhook/stripe
 * Webhook para eventos do Stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erro ao verificar assinatura webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Processar checkout session completada
 */
async function handleCheckoutSessionCompleted(session) {
  const { metadata, customer, id: sessionId } = session;

  try {
    // Atualizar usuário com Stripe customer ID
    const user = await User.updateSubscription(
      parseInt(metadata.userId),
      customer,
      'active',
      null
    );

    // Registrar pagamento
    await Payment.create(parseInt(metadata.userId), {
      stripeTransactionId: sessionId,
      amount: session.amount_total,
      currency: session.currency.toUpperCase(),
      plan: metadata.plan,
      status: 'completed'
    });

    // Enviar comprovante de pagamento
    await sendPaymentReceipt(
      user.email,
      user.name,
      session.amount_total,
      session.currency.toUpperCase(),
      metadata.plan
    );

    console.log(`Checkout completado para usuário ${metadata.userId}`);
  } catch (error) {
    console.error('Erro ao processar checkout completado:', error);
    throw error;
  }
}

/**
 * Processar falha de pagamento
 */
async function handleInvoicePaymentFailed(invoice) {
  const { customer, attempted, amount_paid } = invoice;

  try {
    // Encontrar usuário
    const result = await User.query(
      'SELECT * FROM users WHERE stripe_customer_id = $1',
      [customer]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Registrar tentativa de pagamento falhada
      await Payment.create(user.id, {
        stripeTransactionId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency.toUpperCase(),
        plan: 'unknown',
        status: 'failed'
      });

      console.log(`Pagamento falhado para usuário ${user.id}`);
    }
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error);
    throw error;
  }
}

export default router;
