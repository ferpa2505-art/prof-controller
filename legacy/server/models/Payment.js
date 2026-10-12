import { query } from '../config/database.js';

export class Payment {
  /**
   * Registra um novo pagamento
   */
  static async create(userId, {
    stripeTransactionId,
    amount,
    currency,
    plan,
    status = 'completed'
  }) {
    const text = `
      INSERT INTO payment_history
      (user_id, stripe_transaction_id, amount, currency, plan, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const result = await query(text, [
      userId,
      stripeTransactionId,
      amount,
      currency,
      plan,
      status
    ]);
    return result.rows[0];
  }

  /**
   * Encontra pagamentos de um usuário
   */
  static async findByUserId(userId, limit = 50) {
    const text = `
      SELECT * FROM payment_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await query(text, [userId, limit]);
    return result.rows;
  }

  /**
   * Encontra pagamento por ID de transação Stripe
   */
  static async findByStripeTransactionId(transactionId) {
    const text = `
      SELECT * FROM payment_history
      WHERE stripe_transaction_id = $1
    `;
    const result = await query(text, [transactionId]);
    return result.rows[0];
  }

  /**
   * Atualiza status de um pagamento
   */
  static async updateStatus(paymentId, status) {
    const text = `
      UPDATE payment_history
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(text, [status, paymentId]);
    return result.rows[0];
  }
}

export default Payment;
