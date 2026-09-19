import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;

// Preços em centavos
export const PRICES = {
  BRL: {
    monthly: 967,    // R$ 9.67
    annual: 9290     // R$ 92.90 (desconto 20%)
  },
  EUR: {
    monthly: 967,    // €9.67
    annual: 9290     // €92.90 (desconto 20%)
  }
};

// Descrições dos planos
export const PLAN_DESCRIPTIONS = {
  monthly: 'ProF Controller - Plano Mensal',
  annual: 'ProF Controller - Plano Anual (com 20% de desconto)'
};
