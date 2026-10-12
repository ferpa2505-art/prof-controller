/**
 * SubscriptionContext.js
 * Contexto para gerenciar estado de assinatura
 */

import React, { createContext, useContext, useState } from 'react';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const PRICES = {
    BRL: {
      monthly: 9.67,
      annual: 92.90
    },
    EUR: {
      monthly: 9.67,
      annual: 92.90
    }
  };

  const getPrice = (plan, currency) => {
    return PRICES[currency]?.[plan] || 0;
  };

  const getAnnualSavings = (currency) => {
    const monthlyCost = PRICES[currency].monthly * 12;
    const annualCost = PRICES[currency].annual;
    return monthlyCost - annualCost;
  };

  return (
    <SubscriptionContext.Provider value={{
      selectedPlan,
      setSelectedPlan,
      selectedCurrency,
      setSelectedCurrency,
      isProcessing,
      setIsProcessing,
      error,
      setError,
      PRICES,
      getPrice,
      getAnnualSavings
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider');
  }
  return context;
};
