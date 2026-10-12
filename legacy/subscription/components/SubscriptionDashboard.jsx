/**
 * SubscriptionDashboard.jsx
 * Dashboard com informações de assinatura e histórico
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import '../styles/SubscriptionDashboard.css';

export const SubscriptionDashboard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [profileData, statusData, paymentsData] = await Promise.all([
          apiService.getUserProfile(token),
          apiService.getSubscriptionStatus(token),
          apiService.getPaymentHistory(token)
        ]);

        setProfile(profileData.user);
        setStatus(statusData);
        setPayments(paymentsData.payments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  if (!profile) {
    return <div className="error">Dados do perfil não encontrados</div>;
  }

  const statusText = {
    'free': 'Gratuito',
    'active': 'Ativo',
    'cancelled': 'Cancelado',
    'past_due': 'Pagamento Pendente'
  };

  return (
    <div className="subscription-dashboard">
      <div className="dashboard-header">
        <h2>Minha Assinatura</h2>
        <p className="subtitle">Gerencie sua conta e assinatura</p>
      </div>

      <div className="profile-section">
        <h3>Perfil</h3>
        <div className="profile-info">
          <div className="info-item">
            <label>Nome:</label>
            <span>{profile.name}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{profile.email}</span>
          </div>
          <div className="info-item">
            <label>Número Serial:</label>
            <span className="serial">{profile.serial}</span>
          </div>
        </div>
      </div>

      <div className="subscription-section">
        <h3>Status da Assinatura</h3>
        <div className="subscription-info">
          <div className="status-badge">
            Status: <span className={`badge ${status?.status}`}>
              {statusText[status?.status] || 'Desconhecido'}
            </span>
          </div>

          {status?.status === 'active' && profile.nextBillingDate && (
            <div className="billing-date">
              <label>Próxima Renovação:</label>
              <span>{new Date(profile.nextBillingDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {status?.status === 'active' && (
          <button className="cancel-button" onClick={() => {
            // Abrir modal de cancelamento
            alert('Cancelamento: Esta ação é irreversível');
          }}>
            Cancelar Assinatura
          </button>
        )}
      </div>

      {payments.length > 0 && (
        <div className="payments-section">
          <h3>Histórico de Pagamentos</h3>
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Plano</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr key={idx}>
                    <td>{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                    <td>{payment.currency} {(payment.amount / 100).toFixed(2)}</td>
                    <td>{payment.plan === 'monthly' ? 'Mensal' : 'Anual'}</td>
                    <td>
                      <span className={`status ${payment.status}`}>
                        {payment.status === 'completed' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="help-section">
        <h3>Precisa de ajuda?</h3>
        <p>
          <a href="mailto:suporte@profcontroller.app">Contate nosso suporte</a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
