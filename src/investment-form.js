/**
 * Investment Form Modal
 * UI para adicionar investimentos (Ações, Criptos, ETFs, FIIs, etc)
 */

class InvestmentForm {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.investmentTypes = {
      'acoes': 'Ações',
      'criptos': 'Criptos',
      'etfs': 'ETFs',
      'fiis': 'FIIs',
      'dividendos': 'Dividendos',
      'tesouro_direto': 'Tesouro Direto',
      'outros': 'Outros'
    };
  }

  /**
   * Create HTML structure for modal
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'investment-modal';
    modal.className = 'investment-modal';
    modal.innerHTML = `
      <div class="investment-modal-overlay"></div>
      <div class="investment-modal-content">
        <div class="investment-modal-header">
          <h2>Adicionar Investimento</h2>
          <button class="investment-modal-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="investment-form" id="investment-form">
          <div class="form-group">
            <label for="inv-type">Tipo de Investimento *</label>
            <select id="inv-type" name="type" required>
              <option value="">Selecione...</option>
              ${Object.entries(this.investmentTypes).map(([key, label]) => 
                `<option value="${key}">${label}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="inv-description">Descrição (Ex: BBAS3, BTC) *</label>
            <input 
              type="text" 
              id="inv-description" 
              name="description" 
              placeholder="Nome do ativo ou ticker"
              maxlength="255"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="inv-quantity">Quantidade *</label>
              <input 
                type="number" 
                id="inv-quantity" 
                name="quantity" 
                placeholder="0.00"
                step="0.00000001"
                min="0"
                required
              />
            </div>

            <div class="form-group">
              <label for="inv-unit-price">Preço Unitário (R$) *</label>
              <input 
                type="number" 
                id="inv-unit-price" 
                name="unit_price" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="inv-purchase-date">Data de Compra *</label>
            <input 
              type="date" 
              id="inv-purchase-date" 
              name="purchase_date" 
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="inv-currency">Moeda</label>
              <select id="inv-currency" name="currency">
                <option value="BRL">BRL (Real)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="inv-total-value">Total (Calculado)</label>
              <input 
                type="text" 
                id="inv-total-value" 
                name="total_value" 
                placeholder="R$ 0,00"
                disabled
                class="input-disabled"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="inv-notes">Observações</label>
            <textarea 
              id="inv-notes" 
              name="notes" 
              placeholder="Notas adicionais (opcional)"
              maxlength="500"
              rows="3"
            ></textarea>
          </div>

          <div class="investment-form-actions">
            <button type="button" class="btn btn-secondary" id="inv-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" id="inv-submit">
              <span class="btn-text">Salvar Investimento</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" 
                    stroke="currentColor" stroke-dasharray="31.4 94.2" 
                    style="animation: spin 1s linear infinite;"></circle>
                </svg>
              </span>
            </button>
          </div>

          <div class="investment-form-message" id="inv-message" style="display: none;"></div>
        </form>
      </div>
    `;
    return modal;
  }

  /**
   * Initialize form
   */
  init() {
    // Create and append modal
    if (!document.getElementById('investment-modal')) {
      const modal = this.createModal();
      document.body.appendChild(modal);
    }

    this.modal = document.getElementById('investment-modal');
    this.form = document.getElementById('investment-form');
    this.overlay = document.querySelector('.investment-modal-overlay');
    this.closeBtn = document.querySelector('.investment-modal-close');
    this.cancelBtn = document.getElementById('inv-cancel');
    this.submitBtn = document.getElementById('inv-submit');

    // Event listeners
    this.closeBtn.addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Calculate total on input change
    const quantityInput = document.getElementById('inv-quantity');
    const priceInput = document.getElementById('inv-unit-price');
    const totalInput = document.getElementById('inv-total-value');

    [quantityInput, priceInput].forEach(input => {
      input.addEventListener('change', () => this.calculateTotal());
      input.addEventListener('input', () => this.calculateTotal());
    });

    // Set default date to today
    const dateInput = document.getElementById('inv-purchase-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;

    console.log('✅ Investment Form initialized');
  }

  /**
   * Calculate total value (quantity * unit_price)
   */
  calculateTotal() {
    const quantity = parseFloat(document.getElementById('inv-quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('inv-unit-price').value) || 0;
    const total = quantity * unitPrice;
    const currencyInput = document.getElementById('inv-currency').value;

    const totalInput = document.getElementById('inv-total-value');
    totalInput.value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyInput
    }).format(total);
  }

  /**
   * Open modal
   */
  open() {
    this.isOpen = true;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal
   */
  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.form.reset();
    this.clearMessage();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inv-purchase-date').value = today;
  }

  /**
   * Show message
   */
  showMessage(message, type = 'success') {
    const messageEl = document.getElementById('inv-message');
    messageEl.className = `investment-form-message investment-form-message-${type}`;
    messageEl.innerHTML = `
      <div class="message-icon">
        ${type === 'success' ? 
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' :
          '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
        }
      </div>
      <div class="message-text">${message}</div>
    `;
    messageEl.style.display = 'flex';
  }

  /**
   * Clear message
   */
  clearMessage() {
    const messageEl = document.getElementById('inv-message');
    messageEl.style.display = 'none';
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isLoading) return;

    this.isLoading = true;
    this.submitBtn.disabled = true;
    document.querySelector('.btn-text').style.display = 'none';
    document.querySelector('.btn-loader').style.display = 'flex';

    try {
      const formData = new FormData(this.form);
      const data = {
        type: formData.get('type'),
        description: formData.get('description'),
        quantity: parseFloat(formData.get('quantity')),
        unit_price: parseFloat(formData.get('unit_price')),
        purchase_date: formData.get('purchase_date'),
        currency: formData.get('currency'),
        notes: formData.get('notes') || null
      };

      // Validação básica no frontend
      if (!data.type) {
        throw new Error('Selecione o tipo de investimento');
      }
      if (!data.description.trim()) {
        throw new Error('Digite a descrição do investimento');
      }
      if (data.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      if (data.unit_price <= 0) {
        throw new Error('Preço unitário deve ser maior que zero');
      }
      if (!data.purchase_date) {
        throw new Error('Selecione a data de compra');
      }

      // Enviar para API
      const response = await fetch('/api/financial/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar investimento');
      }

      const result = await response.json();

      // Sucesso!
      this.showMessage(`✅ Investimento "${data.description}" adicionado com sucesso!`, 'success');

      // Atualizar gráficos em 1 segundo
      setTimeout(() => {
        if (typeof initializeChartsWithData === 'function') {
          initializeChartsWithData();
        }
        // Fechar modal após 2 segundos
        setTimeout(() => this.close(), 1000);
      }, 500);

    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.isLoading = false;
      this.submitBtn.disabled = false;
      document.querySelector('.btn-text').style.display = 'inline';
      document.querySelector('.btn-loader').style.display = 'none';
    }
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    // Ajustar conforme sua implementação de autenticação
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.investmentForm = new InvestmentForm();
    window.investmentForm.init();
  });
} else {
  window.investmentForm = new InvestmentForm();
  window.investmentForm.init();
}
