import { query } from '../config/database.js';
import { generateSerial } from '../utils/serial.js';

export class User {
  /**
   * Encontra ou cria um usuário via Google
   */
  static async findOrCreateGoogle(googleId, email, name) {
    const text = `
      SELECT * FROM users WHERE google_id = $1
    `;
    const result = await query(text, [googleId]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Criar novo usuário
    const serial = generateSerial();
    const insertText = `
      INSERT INTO users (google_id, email, name, serial, subscription_status, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const insertResult = await query(insertText, [
      googleId,
      email,
      name,
      serial,
      'free'
    ]);

    return insertResult.rows[0];
  }

  /**
   * Encontra ou cria um usuário via Apple
   */
  static async findOrCreateApple(appleId, email, name) {
    const text = `
      SELECT * FROM users WHERE apple_id = $1
    `;
    const result = await query(text, [appleId]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Criar novo usuário
    const serial = generateSerial();
    const insertText = `
      INSERT INTO users (apple_id, email, name, serial, subscription_status, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const insertResult = await query(insertText, [
      appleId,
      email,
      name,
      serial,
      'free'
    ]);

    return insertResult.rows[0];
  }

  /**
   * Encontra usuário por ID
   */
  static async findById(userId) {
    const text = 'SELECT * FROM users WHERE id = $1';
    const result = await query(text, [userId]);
    return result.rows[0];
  }

  /**
   * Atualiza status de assinatura
   */
  static async updateSubscription(userId, stripeCustomerId, subscriptionStatus, nextBillingDate) {
    const text = `
      UPDATE users
      SET stripe_customer_id = $1, subscription_status = $2, next_billing_date = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await query(text, [stripeCustomerId, subscriptionStatus, nextBillingDate, userId]);
    return result.rows[0];
  }

  /**
   * Cancela assinatura
   */
  static async cancelSubscription(userId) {
    const text = `
      UPDATE users
      SET subscription_status = 'cancelled', next_billing_date = NULL, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [userId]);
    return result.rows[0];
  }
}

export default User;
