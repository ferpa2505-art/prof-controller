/**
 * useAppleLogin.js
 * Hook para login com Apple Sign-In
 */

import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

// Carregar Apple SDK quando componente monta
if (typeof window !== 'undefined' && !window.AppleID) {
  const script = document.createElement('script');
  script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export const useAppleLogin = () => {
  const { login } = useAuth();

  const handleAppleSuccess = async (response) => {
    try {
      const { identityToken, user } = response.authorization;
      const userIdentifier = response.user?.sub;

      const { token, user: userData } = await apiService.loginWithApple(
        identityToken,
        userIdentifier,
        user?.email,
        user?.name?.firstName
      );

      login(token, userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleAppleError = (error) => {
    console.error('Apple login error:', error);
    return { success: false, error: 'Login com Apple falhou' };
  };

  const renderAppleButton = (elementId) => {
    if (typeof window !== 'undefined' && window.AppleID?.auth) {
      window.AppleID.auth.init({
        clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
        teamId: process.env.REACT_APP_APPLE_TEAM_ID,
        keyId: process.env.REACT_APP_APPLE_KEY_ID,
        redirectURI: window.location.origin + '/subscription/success'
      });

      const button = document.getElementById(elementId);
      if (button) {
        button.addEventListener('click', async () => {
          try {
            const response = await window.AppleID.auth.signIn();
            await handleAppleSuccess(response);
          } catch (error) {
            handleAppleError(error);
          }
        });
      }
    }
  };

  return { renderAppleButton, handleAppleSuccess };
};
