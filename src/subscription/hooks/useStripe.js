/**
 * useStripe.js
 * Hook para gerenciar Stripe checkout
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import apiService from '../services/api';

// Carregar Stripe SDK quando componente monta
if (typeof window !== 'undefined' && !window.Stripe) {
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export const useStripe = () => {
  const { token } = useAuth();
  const { selectedPlan, selectedCurrency, setIsProcessing, setError } = useSubscription();
  const [stripe, setStripe] = useState(null);

  // Inicializar Stripe
  const initStripe = async () => {
    if (typeof window !== 'undefined' && window.Stripe) {
      const stripeInstance = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      setStripe(stripeInstance);
      return stripeInstance;
    }
  };

  // Iniciar checkout
  const startCheckout = async () => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Criar sessão no backend
      const { sessionId, url } = await apiService.createCheckoutSession(
        token,
        selectedPlan,
        selectedCurrency
      );

      // Redirecionar para Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        // Alternativa: usar stripe.redirectToCheckout
        const stripeInstance = stripe || await initStripe();
        if (stripeInstance) {
          const { error } = await stripeInstance.redirectToCheckout({
            sessionId
          });
          if (error) {
            setError(error.message);
          }
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Verificar status da sessão após sucesso
  const checkSessionStatus = async (sessionId) => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const session = await apiService.getCheckoutSession(token, sessionId);
      return session;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  return {
    initStripe,
    startCheckout,
    checkSessionStatus,
    stripe
  };
};

export default useStripe;
