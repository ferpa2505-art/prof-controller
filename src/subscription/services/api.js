/**
 * api.js
 * Serviço para comunicar com backend
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiService = {
  /**
   * Login com Google
   */
  loginWithGoogle: async (idToken) => {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer login com Google');
    }

    return response.json();
  },

  /**
   * Login com Apple
   */
  loginWithApple: async (identityToken, userIdentifier, email, name) => {
    const response = await fetch(`${API_URL}/auth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identityToken,
        userIdentifier,
        email,
        name
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer login com Apple');
    }

    return response.json();
  },

  /**
   * Criar sessão de checkout
   */
  createCheckoutSession: async (token, plan, currency) => {
    const response = await fetch(`${API_URL}/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan, currency })
    });

    if (!response.ok) {
      throw new Error('Erro ao criar sessão de checkout');
    }

    return response.json();
  },

  /**
   * Recuperar status da sessão de checkout
   */
  getCheckoutSession: async (token, sessionId) => {
    const response = await fetch(`${API_URL}/subscription/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao recuperar sessão');
    }

    return response.json();
  },

  /**
   * Obter perfil do usuário
   */
  getUserProfile: async (token) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao recuperar perfil');
    }

    return response.json();
  },

  /**
   * Obter status de assinatura
   */
  getSubscriptionStatus: async (token) => {
    const response = await fetch(`${API_URL}/user/subscription-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar status');
    }

    return response.json();
  },

  /**
   * Listar histórico de pagamentos
   */
  getPaymentHistory: async (token) => {
    const response = await fetch(`${API_URL}/subscription/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao recuperar histórico');
    }

    return response.json();
  },

  /**
   * Criar portal de gerenciamento
   */
  createBillingPortal: async (token) => {
    const response = await fetch(`${API_URL}/subscription/portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao criar portal');
    }

    return response.json();
  },

  /**
   * Cancelar assinatura
   */
  cancelSubscription: async (token) => {
    const response = await fetch(`${API_URL}/user/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao cancelar assinatura');
    }

    return response.json();
  }
};

export default apiService;
