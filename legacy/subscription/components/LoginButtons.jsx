/**
 * LoginButtons.jsx
 * Botões de login com Google e Apple
 */

import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useAppleLogin } from '../hooks/useAppleLogin';
import '../styles/LoginButtons.css';

export const LoginButtons = ({ onLoginSuccess }) => {
  const { renderGoogleButton } = useGoogleLogin();
  const { renderAppleButton } = useAppleLogin();
  const [error, setError] = useState(null);

  useEffect(() => {
    renderGoogleButton('google-signin-button');
  }, [renderGoogleButton]);

  useEffect(() => {
    renderAppleButton('apple-signin-button');
  }, [renderAppleButton]);

  return (
    <div className="login-buttons">
      <h2>Escolha uma forma de login</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div id="google-signin-button" className="google-button" />

      <div className="divider">OU</div>

      <button
        id="apple-signin-button"
        className="apple-button"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.3-3.16-2.54-1.73-2.39-3.01-6.59-1.25-9.67.94-1.71 2.85-2.78 4.76-2.88 1.32-.1 2.54.77 3.29.77.74 0 2.33-1.03 3.92-.98 1.5.05 2.42.75 2.95 1.48-1.04 1.18-1.21 2.99-1.21 4.35 0 2.46 1.24 4.36 2.79 5.38"/>
        </svg>
        Continuar com Apple
      </button>

      <p className="terms">
        Ao fazer login, você concorda com nossos{' '}
        <a href="/terms">Termos de Serviço</a> e{' '}
        <a href="/privacy">Política de Privacidade</a>
      </p>
    </div>
  );
};

export default LoginButtons;
