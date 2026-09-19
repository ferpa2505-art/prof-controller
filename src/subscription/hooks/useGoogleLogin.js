/**
 * useGoogleLogin.js
 * Hook para login com Google
 */

import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

// Carregar Google SDK quando componente monta
if (typeof window !== 'undefined' && !window.google) {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export const useGoogleLogin = () => {
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { token, user } = await apiService.loginWithGoogle(
        credentialResponse.credential
      );
      login(token, user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleGoogleError = () => {
    return { success: false, error: 'Login com Google falhou' };
  };

  const renderGoogleButton = (elementId) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%'
        }
      );

      window.google.accounts.id.oneTap({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError
      });
    }
  };

  return { renderGoogleButton, handleGoogleSuccess };
};
