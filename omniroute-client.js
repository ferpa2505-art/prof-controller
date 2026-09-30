/**
 * OmniRoute Client - Cliente para chamar Claude via OmniRoute Gateway
 * Use em qualquer lugar do prof-controller
 * 
 * Exemplo:
 *   const claude = new OmniRouteClient();
 *   const resposta = await claude.call('Sua pergunta aqui');
 */

const OMNIROUTE_CONFIG = {
  API_URL: 'http://localhost:20128/v1/messages',
  MODEL: 'claude-sonnet-5-5',
  MAX_TOKENS: 2048,
  TIMEOUT: 30000 // 30 segundos
};

class OmniRouteClient {
  constructor(config = {}) {
    this.config = { ...OMNIROUTE_CONFIG, ...config };
    this.isOnline = false;
    this.checkConnection();
  }

  /**
   * Verifica se OmniRoute está online
   */
  async checkConnection() {
    try {
      const response = await fetch(this.config.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.MODEL,
          max_tokens: 100,
          system: 'Responda com "OK"',
          messages: [{ role: 'user', content: 'OK' }]
        })
      });
      this.isOnline = response.ok;
      console.log('[OmniRoute] Status:', this.isOnline ? '🟢 Online' : '🔴 Offline');
    } catch (error) {
      this.isOnline = false;
      console.warn('[OmniRoute] Offline:', error.message);
    }
  }

  /**
   * Chama Claude via OmniRoute
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} systemPrompt - Prompt do sistema (opcional)
   * @param {object} options - Opções adicionais (maxTokens, etc)
   * @returns {Promise<string>} Resposta de Claude
   */
  async call(userMessage, systemPrompt = '', options = {}) {
    if (!this.isOnline) {
      await this.checkConnection();
      if (!this.isOnline) {
        throw new Error('OmniRoute não está disponível. Certifique-se que está rodando em localhost:20128');
      }
    }

    try {
      const requestBody = {
        model: this.config.MODEL,
        max_tokens: options.max_tokens || this.config.MAX_TOKENS,
        system: systemPrompt || 'Você é um assistente útil e prestativo.',
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.TIMEOUT);

      const response = await fetch(this.config.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`OmniRoute API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0]) {
        throw new Error('Resposta inválida do OmniRoute');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('[OmniRoute Error]', error.message);
      throw error;
    }
  }

  /**
   * Chama Claude com streaming (para implementação futura)
   */
  async stream(userMessage, systemPrompt = '', onChunk) {
    return this.call(userMessage, systemPrompt);
  }

  /**
   * Analisa dados financeiros
   */
  async analisarDados(dados, tipo = 'geral') {
    const systemPrompts = {
      geral: 'Você é um analista financeiro experiente. Forneça análises claras, concisas e acionáveis.',
      portfolio: 'Você é especialista em análise de portfólio. Avalie a alocação e risco.',
      cashflow: 'Você é especialista em fluxo de caixa. Analise a saúde financeira.',
      investimentos: 'Você é especialista em investimentos. Dê recomendações baseadas em dados.'
    };

    const mensagem = `
      Analise estes dados financeiros e forneça insights:
      
      ${JSON.stringify(dados, null, 2)}
      
      Seja conciso e forneça ações práticas.
    `;

    return this.call(mensagem, systemPrompts[tipo] || systemPrompts.geral, {
      max_tokens: 1024
    });
  }

  /**
   * Gera sugestões de economia
   */
  async sugerirEconomia(gastos) {
    const mensagem = `
      Com base nestes gastos mensais, sugira 3 formas práticas de economizar:
      ${JSON.stringify(gastos, null, 2)}
    `;

    return this.call(
      mensagem,
      'Você é um consultor financeiro pessoal. Dê sugestões práticas e realistas.',
      { max_tokens: 512 }
    );
  }

  /**
   * Explica um conceito financeiro
   */
  async explicar(conceito) {
    const mensagem = `Explique de forma simples este conceito financeiro: ${conceito}`;
    
    return this.call(
      mensagem,
      'Explique conceitos financeiros de forma simples e didática.',
      { max_tokens: 512 }
    );
  }
}

// Exportar para Node.js/Electron
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OmniRouteClient, OMNIROUTE_CONFIG };
}

// Criar instância global
const omniroute = new OmniRouteClient();
