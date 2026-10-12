import express from 'express';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/test
 * Teste de autenticação (sem validação real)
 */
router.post('/test', (req, res) => {
  const token = generateToken('550e8400-e29b-41d4-a716-446655440000', 'test@example.com');
  res.json({
    token,
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'Test User'
    }
  });
});

export default router;
