/**
 * SubscriptionPage.jsx
 * Página principal de assinatura
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginButtons from '../components/LoginButtons';
import PlanCards from '../components/PlanCards';
import CheckoutButton from '../components/CheckoutButton';
import SubscriptionDashboard from '../components/SubscriptionDashboard';
import '../styles/SubscriptionPage.css';

export const SubscriptionPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="subscription-page loading">
        <div className="spinner" />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <header className="subscription-header">
        <h1>ProF Controller Premium</h1>
        <p>Desbloqueie todos os recursos da plataforma</p>
      </header>

      <main className="subscription-content">
        {!user ? (
          // Fluxo de login
          <section className="login-section">
            <LoginButtons />
          </section>
        ) : user.subscriptionStatus === 'active' ? (
          // Usuário já é assinante
          <SubscriptionDashboard />
        ) : (
          // Usuário está logado mas não é assinante - mostrar opções
          <>
            <section className="plans-section">
              <PlanCards />
            </section>

            <section className="checkout-section">
              <CheckoutButton />
            </section>

            <section className="benefits-section">
              <h2>Por que assinar?</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <h3>📱 Notificações</h3>
                  <p>Receba alertas em tempo real sobre suas transações</p>
                </div>
                <div className="benefit-card">
                  <h3>🔄 Recorrência</h3>
                  <p>Configure transações que se repetem automaticamente</p>
                </div>
                <div className="benefit-card">
                  <h3>📊 Relatórios</h3>
                  <p>Analise detalhadamente suas finanças</p>
                </div>
                <div className="benefit-card">
                  <h3>⚡ Sem Limite</h3>
                  <p>Acesso ilimitado a todos os recursos</p>
                </div>
              </div>
            </section>

            <section className="faq-section">
              <h2>Perguntas Frequentes</h2>
              <div className="faq-items">
                <details>
                  <summary>Posso cancelar a qualquer momento?</summary>
                  <p>
                    Sim! Você pode cancelar sua assinatura a qualquer momento
                    através do seu painel de controle. O cancelamento é imediato
                    e você não será cobrado novamente.
                  </p>
                </details>

                <details>
                  <summary>Qual a política de reembolso?</summary>
                  <p>
                    Se você não estiver satisfeito, pode solicitar um reembolso
                    dentro de 7 dias do pagamento. Basta entrar em contato com
                    nosso suporte.
                  </p>
                </details>

                <details>
                  <summary>Vocês guardam meus dados?</summary>
                  <p>
                    Seus dados são armazenados com segurança e criptografia.
                    Consulte nossa Política de Privacidade para detalhes.
                  </p>
                </details>

                <details>
                  <summary>Posso mudar de plano?</summary>
                  <p>
                    Sim! Você pode fazer upgrade ou downgrade de seu plano
                    a qualquer momento pelo seu painel de controle.
                  </p>
                </details>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="subscription-footer">
        <p>
          <a href="/terms">Termos de Serviço</a> •
          <a href="/privacy">Política de Privacidade</a> •
          <a href="mailto:suporte@profcontroller.app">Suporte</a>
        </p>
        <p>© 2026 ProF Controller. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default SubscriptionPage;
