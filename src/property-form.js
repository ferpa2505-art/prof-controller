/**
 * Property Form Modal
 * UI para adicionar imóveis
 */

class PropertyForm {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.propertyTypes = [
      'Casa',
      'Apartamento',
      'Comercial',
      'Terreno',
      'Outro'
    ];
  }

  /**
   * Create HTML structure for modal
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'property-modal';
    modal.className = 'financial-modal';
    modal.innerHTML = `
      <div class="financial-modal-overlay"></div>
      <div class="financial-modal-content financial-modal-large">
        <div class="financial-modal-header">
          <h2>Adicionar Imóvel</h2>
          <button class="financial-modal-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="financial-form" id="property-form">
          <div class="form-section">
            <h3>Informações Básicas</h3>
            
            <div class="form-group">
              <label for="prop-address">Endereço *</label>
              <input 
                type="text" 
                id="prop-address" 
                name="address" 
                placeholder="Rua, Avenida, etc"
                maxlength="255"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="prop-city">Cidade *</label>
                <input 
                  type="text" 
                  id="prop-city" 
                  name="city" 
                  placeholder="Cidade"
                  maxlength="100"
                  required
                />
              </div>
              <div class="form-group">
                <label for="prop-state">Estado *</label>
                <input 
                  type="text" 
                  id="prop-state" 
                  name="state" 
                  placeholder="SP, RJ, etc"
                  maxlength="2"
                  required
                />
              </div>
              <div class="form-group">
                <label for="prop-zip">CEP</label>
                <input 
                  type="text" 
                  id="prop-zip" 
                  name="zip_code" 
                  placeholder="00000-000"
                  maxlength="20"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="prop-type">Tipo de Imóvel *</label>
              <select id="prop-type" name="property_type" required>
                <option value="">Selecione...</option>
                ${this.propertyTypes.map(type => 
                  `<option value="${type}">${type}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div class="form-section">
            <h3>Valores</h3>

            <div class="form-group">
              <label for="prop-purchase-date">Data da Compra *</label>
              <input 
                type="date" 
                id="prop-purchase-date" 
                name="purchase_date" 
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="prop-purchase-price">Preço de Compra (R$) *</label>
                <input 
                  type="number" 
                  id="prop-purchase-price" 
                  name="purchase_price" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div class="form-group">
                <label for="prop-current-value">Valor Atual (R$)</label>
                <input 
                  type="number" 
                  id="prop-current-value" 
                  name="current_value" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Hipoteca (Opcional)</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="prop-mortgage">Valor da Hipoteca (R$)</label>
                <input 
                  type="number" 
                  id="prop-mortgage" 
                  name="mortgage_amount" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="prop-mortgage-remaining">Saldo Devedor (R$)</label>
                <input 
                  type="number" 
                  id="prop-mortgage-remaining" 
                  name="mortgage_remaining" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Observações</h3>
            <div class="form-group">
              <label for="prop-notes">Notas Adicionais</label>
              <textarea 
                id="prop-notes" 
                name="notes" 
                placeholder="Informações complementares (opcional)"
                maxlength="500"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="financial-form-actions">
            <button type="button" class="btn btn-secondary" id="prop-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" id="prop-submit">
              <span class="btn-text">Salvar Imóvel</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" 
                    stroke="currentColor" stroke-dasharray="31.4 94.2" 
                    style="animation: spin 1s linear infinite;"></circle>
                </svg>
              </span>
            </button>
          </div>

          <div class="financial-form-message" id="prop-message" style="display: none;"></div>
        </form>
      </div>
    `;
    return modal;
  }

  /**
   * Initialize form
   */
  init() {
    if (!document.getElementById('property-modal')) {
      const modal = this.createModal();
      document.body.appendChild(modal);
    }

    this.modal = document.getElementById('property-modal');
    this.form = document.getElementById('property-form');
    this.overlay = document.querySelector('#property-modal .financial-modal-overlay');
    this.closeBtn = document.querySelector('#property-modal .financial-modal-close');
    this.cancelBtn = document.getElementById('prop-cancel');
    this.submitBtn = document.getElementById('prop-submit');

    this.closeBtn.addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Set default date to today
    const dateInput = document.getElementById('prop-purchase-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;

    console.log('✅ Property Form initialized');
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
    document.getElementById('prop-purchase-date').value = today;
  }

  /**
   * Show message
   */
  showMessage(message, type = 'success') {
    const messageEl = document.getElementById('prop-message');
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
    const messageEl = document.getElementById('prop-message');
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
    document.querySelector('#prop-submit .btn-text').style.display = 'none';
    document.querySelector('#prop-submit .btn-loader').style.display = 'flex';

    try {
      const formData = new FormData(this.form);
      const data = {
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip_code') || null,
        property_type: formData.get('property_type'),
        purchase_date: formData.get('purchase_date'),
        purchase_price: parseFloat(formData.get('purchase_price')),
        current_value: parseFloat(formData.get('current_value')) || null,
        mortgage_amount: parseFloat(formData.get('mortgage_amount')) || null,
        mortgage_remaining: parseFloat(formData.get('mortgage_remaining')) || null,
        notes: formData.get('notes') || null
      };

      // Validação
      if (!data.address.trim()) throw new Error('Digite o endereço');
      if (!data.city.trim()) throw new Error('Digite a cidade');
      if (!data.state.trim()) throw new Error('Digite o estado');
      if (!data.property_type) throw new Error('Selecione o tipo de imóvel');
      if (data.purchase_price <= 0) throw new Error('O preço de compra deve ser maior que zero');

      // Enviar para API
      const response = await fetch('/api/financial/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar imóvel');
      }

      this.showMessage(`✅ Imóvel adicionado com sucesso! Endereço: ${data.address}`, 'success');

      setTimeout(() => {
        if (typeof initializeChartsWithData === 'function') {
          initializeChartsWithData();
        }
        setTimeout(() => this.close(), 1000);
      }, 500);

    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.isLoading = false;
      this.submitBtn.disabled = false;
      document.querySelector('#prop-submit .btn-text').style.display = 'inline';
      document.querySelector('#prop-submit .btn-loader').style.display = 'none';
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
    window.propertyForm = new PropertyForm();
    window.propertyForm.init();
  });
} else {
  window.propertyForm = new PropertyForm();
  window.propertyForm.init();
}
