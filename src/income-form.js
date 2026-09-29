/**
 * Income Form Modal
 * UI para adicionar receitas
 */

class IncomeForm {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.incomeCategories = [
      'Salário',
      'Freelance',
      'Bônus',
      'Dividendos',
      'Aluguel',
      'Juros',
      'Venda de Ativos',
      'Outro'
    ];
  }

  /**
   * Create HTML structure for modal
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'income-modal';
    modal.className = 'financial-modal';
    modal.innerHTML = `
      <div class="financial-modal-overlay"></div>
      <div class="financial-modal-content">
        <div class="financial-modal-header">
          <h2>Adicionar Receita</h2>
          <button class="financial-modal-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="financial-form" id="income-form">
          <div class="form-group">
            <label for="inc-source">Origem da Receita *</label>
            <input 
              type="text" 
              id="inc-source" 
              name="source" 
              placeholder="Ex: Salário, Freelance, Investimentos"
              maxlength="255"
              required
            />
          </div>

          <div class="form-group">
            <label for="inc-amount">Valor (R$) *</label>
            <input 
              type="number" 
              id="inc-amount" 
              name="amount" 
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="inc-date">Data da Receita *</label>
            <input 
              type="date" 
              id="inc-date" 
              name="income_date" 
              required
            />
          </div>

          <div class="form-group">
            <label for="inc-category">Categoria</label>
            <select id="inc-category" name="category">
              <option value="">Selecione...</option>
              ${this.incomeCategories.map(cat => 
                `<option value="${cat}">${cat}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="inc-description">Descrição</label>
            <textarea 
              id="inc-description" 
              name="description" 
              placeholder="Detalhes adicionais (opcional)"
              maxlength="500"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="inc-notes">Observações</label>
            <textarea 
              id="inc-notes" 
              name="notes" 
              placeholder="Notas (opcional)"
              maxlength="500"
              rows="2"
            ></textarea>
          </div>

          <div class="financial-form-actions">
            <button type="button" class="btn btn-secondary" id="inc-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" id="inc-submit">
              <span class="btn-text">Salvar Receita</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" 
                    stroke="currentColor" stroke-dasharray="31.4 94.2" 
                    style="animation: spin 1s linear infinite;"></circle>
                </svg>
              </span>
            </button>
          </div>

          <div class="financial-form-message" id="inc-message" style="display: none;"></div>
        </form>
      </div>
    `;
    return modal;
  }

  /**
   * Initialize form
   */
  init() {
    if (!document.getElementById('income-modal')) {
      const modal = this.createModal();
      document.body.appendChild(modal);
    }

    this.modal = document.getElementById('income-modal');
    this.form = document.getElementById('income-form');
    this.overlay = document.querySelector('#income-modal .financial-modal-overlay');
    this.closeBtn = document.querySelector('#income-modal .financial-modal-close');
    this.cancelBtn = document.getElementById('inc-cancel');
    this.submitBtn = document.getElementById('inc-submit');

    this.closeBtn.addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Set default date to today
    const dateInput = document.getElementById('inc-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;

    console.log('✅ Income Form initialized');
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
    document.getElementById('inc-date').value = today;
  }

  /**
   * Show message
   */
  showMessage(message, type = 'success') {
    const messageEl = document.getElementById('inc-message');
    messageEl.className = `financial-form-message financial-form-message-${type}`;
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
    const messageEl = document.getElementById('inc-message');
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
    document.querySelector('#inc-submit .btn-text').style.display = 'none';
    document.querySelector('#inc-submit .btn-loader').style.display = 'flex';

    try {
      const formData = new FormData(this.form);
      const data = {
        source: formData.get('source'),
        amount: parseFloat(formData.get('amount')),
        income_date: formData.get('income_date'),
        category: formData.get('category') || null,
        description: formData.get('description') || null,
        notes: formData.get('notes') || null
      };

      // Validação
      if (!data.source.trim()) {
        throw new Error('Digite a origem da receita');
      }
      if (data.amount <= 0) {
        throw new Error('O valor deve ser maior que zero');
      }
      if (!data.income_date) {
        throw new Error('Selecione a data da receita');
      }

      // Enviar para API
      const response = await fetch('/api/financial/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar receita');
      }

      this.showMessage(`✅ Receita de R$ ${data.amount.toFixed(2)} adicionada com sucesso!`, 'success');

      setTimeout(() => {
        if (typeof initializeChartsWithData === 'function') {
          initializeChartsWithData();
        }
        setTimeout(() => this.close(), 1000);
      }, 500);

    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.isLoading = false;
      this.submitBtn.disabled = false;
      document.querySelector('#inc-submit .btn-text').style.display = 'inline';
      document.querySelector('#inc-submit .btn-loader').style.display = 'none';
    }
  }

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.incomeForm = new IncomeForm();
    window.incomeForm.init();
  });
} else {
  window.incomeForm = new IncomeForm();
  window.incomeForm.init();
}
