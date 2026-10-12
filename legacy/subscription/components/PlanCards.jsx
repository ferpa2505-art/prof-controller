/**
 * PlanCards.jsx
 * Cards para seleção de plano (mensal/anual)
 */

import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import '../styles/PlanCards.css';

export const PlanCards = () => {
  const {
    selectedPlan,
    setSelectedPlan,
    selectedCurrency,
    getPrice,
    getAnnualSavings
  } = useSubscription();

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      description: 'Acesso por um mês',
      features: [
        '✓ Notificações ilimitadas',
        '✓ Transações recorrentes',
        '✓ Calculadora financeira',
        '✓ Suporte por email'
      ]
    },
    {
      id: 'annual',
      name: 'Anual',
      description: 'Acesso por um ano',
      features: [
        '✓ Tudo do plano mensal',
        '✓ 20% de desconto',
        '✓ Prioridade no suporte',
        '✓ Relatórios avançados'
      ]
    }
  ];

  const annualSavings = getAnnualSavings(selectedCurrency);

  return (
    <div className="plan-cards">
      <h2>Escolha seu plano</h2>

      <div className="currency-selector">
        <label>Moeda:</label>
        <select
          value={selectedCurrency}
          onChange={(e) => {
            // Atualizar moeda no contexto
            window.dispatchEvent(new CustomEvent('changeCurrency', { detail: e.target.value }));
          }}
        >
          <option value="BRL">R$ Brasileiro</option>
          <option value="EUR">€ Euro</option>
        </select>
      </div>

      <div className="cards-container">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.id === 'annual' && (
              <div className="savings-badge">
                Economize {annualSavings.toFixed(2)} {selectedCurrency}!
              </div>
            )}

            <h3>{plan.name}</h3>
            <p className="description">{plan.description}</p>

            <div className="price">
              <span className="amount">
                {selectedCurrency} {getPrice(plan.id, selectedCurrency).toFixed(2)}
              </span>
              <span className="period">
                {plan.id === 'monthly' ? '/mês' : '/ano'}
              </span>
            </div>

            <ul className="features">
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <button
              className="select-button"
              disabled={selectedPlan === plan.id}
            >
              {selectedPlan === plan.id ? '✓ Selecionado' : 'Selecionar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanCards;
