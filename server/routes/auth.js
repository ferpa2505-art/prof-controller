import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { verifyAppleToken } from 'apple-signin-auth';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/email.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /auth/google
 * Login via Google OAuth
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token não fornecido' });
    }

    // Verificar token Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Encontrar ou criar usuário
    const user = await User.findOrCreateGoogle(googleId, email, name);

    // Gerar JWT
    const token = generateToken(user.id, user.email);

    // Enviar email de boas-vindas se for novo usuário
    if (user.subscription_status === 'free') {
      try {
        await sendWelcomeEmail(user.email, user.name, user.serial, 'free');
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        serial: user.serial,
        subscriptionStatus: user.subscription_status
      }
    });
  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(401).json({ error: 'Falha na autenticação Google' });
  }
});

/**
 * POST /auth/apple
 * Login via Apple Sign-In
 */
router.post('/apple', async (req, res) => {
  try {
    const { identityToken, userIdentifier, email, name } = req.body;

    if (!identityToken) {
      return res.status(400).json({ error: 'Identity token não fornecido' });
    }

    // Verificar token Apple
    const appleIdTokenClaims = await verifyAppleToken({
      idToken: identityToken
    });

    const appleId = userIdentifier || appleIdTokenClaims.sub;

    // Encontrar ou criar usuário
    const user = await User.findOrCreateApple(
      appleId,
      email || appleIdTokenClaims.email,
      name || 'Usuário Apple'
    );

    // Gerar JWT
    const token = generateToken(user.id, user.email);

    // Enviar email de boas-vindas se for novo usuário
    if (user.subscription_status === 'free') {
      try {
        await sendWelcomeEmail(user.email, user.name, user.serial, 'free');
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        serial: user.serial,
        subscriptionStatus: user.subscription_status
      }
    });
  } catch (error) {
    console.error('Erro no login Apple:', error);
    res.status(401).json({ error: 'Falha na autenticação Apple' });
  }
});

export default router;
