import stripe from '../config/stripe.js';
import { PRICES, PLAN_DESCRIPTIONS } from '../config/stripe.js';
import User from '../models/User.js';

/**
 * Cria uma sessão de checkout Stripe
 */
export const createCheckoutSession = async (userId, plan, currency = 'BRL') => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Usuário não encontrado');

  const priceInCents = PRICES[currency][plan];
  if (!priceInCents) throw new Error('Plano ou moeda inválido');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: PLAN_DESCRIPTIONS[plan]
          },
          unit_amount: priceInCents
        },
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      plan: plan,
      serial: user.serial
    }
  });

  return session;
};

/**
 * Recupera detalhes de uma sessão de checkout
 */
export const getCheckoutSession = async (sessionId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
};

/**
 * Processa um webhook de pagamento
 */
export const handlePaymentSuccess = async (session) => {
  const { metadata, customer, subscription } = session;

  const user = await User.updateSubscription(
    parseInt(metadata.userId),
    customer,
    'active',
    null // próxima data será do webhook de invoice
  );

  return user;
};

/**
 * Processa renovação automática
 */
export const handleInvoicePaymentSucceeded = async (invoice) => {
  const { customer, period_end } = invoice;

  // Encontrar usuário por stripe_customer_id
  const result = await User.query(
    'SELECT * FROM users WHERE stripe_customer_id = $1',
    [customer]
  );

  if (result.rows.length > 0) {
    const user = result.rows[0];
    const nextBillingDate = new Date(period_end * 1000);

    await User.updateSubscription(
      user.id,
      customer,
      'active',
      nextBillingDate
    );
  }
};

/**
 * Processa cancelamento de assinatura
 */
export const handleCustomerSubscriptionDeleted = async (subscription) => {
  const { customer } = subscription;

  // Encontrar usuário por stripe_customer_id
  const result = await User.query(
    'SELECT * FROM users WHERE stripe_customer_id = $1',
    [customer]
  );

  if (result.rows.length > 0) {
    const user = result.rows[0];
    await User.cancelSubscription(user.id);
  }
};

/**
 * Cria um portal de gerenciamento de assinatura
 */
export const createPortalSession = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.stripe_customer_id) {
    throw new Error('Usuário ou customer Stripe não encontrado');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: process.env.FRONTEND_URL
  });

  return session;
};

export default {
  createCheckoutSession,
  getCheckoutSession,
  handlePaymentSuccess,
  handleInvoicePaymentSucceeded,
  handleCustomerSubscriptionDeleted,
  createPortalSession
};
