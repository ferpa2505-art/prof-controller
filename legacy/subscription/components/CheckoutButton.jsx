/**
 * CheckoutButton.jsx
 * Botão para iniciar checkout no Stripe
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import useStripe from '../hooks/useStripe';
import '../styles/CheckoutButton.css';

export const CheckoutButton = () => {
  const { user } = useAuth();
  const { isProcessing, error, selectedPlan, selectedCurrency, getPrice } = useSubscription();
  const { startCheckout } = useStripe();

  if (!user) {
    return (
      <div className="checkout-disabled">
        <p>Faça login para continuar</p>
      </div>
    );
  }

  const price = getPrice(selectedPlan, selectedCurrency);

  return (
    <div className="checkout-button-container">
      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      <button
        className="checkout-button"
        onClick={startCheckout}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="spinner" />
            Processando...
          </>
        ) : (
          <>
            Pagar {selectedCurrency} {price.toFixed(2)}
          </>
        )}
      </button>

      <p className="payment-info">
        Você será redirecionado para o Stripe para completar o pagamento
      </p>

      <div className="secure-badge">
        🔒 Pagamento seguro via Stripe
      </div>
    </div>
  );
};

export default CheckoutButton;
