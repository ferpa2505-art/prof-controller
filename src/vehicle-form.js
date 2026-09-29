/**
 * Vehicle Form Modal
 * UI para adicionar veículos
 */

class VehicleForm {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.vehicleTypes = [
      'Carro',
      'Moto',
      'Caminhão',
      'Ônibus',
      'Outro'
    ];
  }

  /**
   * Create HTML structure for modal
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'vehicle-modal';
    modal.className = 'financial-modal';
    modal.innerHTML = `
      <div class="financial-modal-overlay"></div>
      <div class="financial-modal-content financial-modal-large">
        <div class="financial-modal-header">
          <h2>Adicionar Veículo</h2>
          <button class="financial-modal-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="financial-form" id="vehicle-form">
          <div class="form-section">
            <h3>Informações do Veículo</h3>

            <div class="form-group">
              <label for="veh-type">Tipo de Veículo *</label>
              <select id="veh-type" name="vehicle_type" required>
                <option value="">Selecione...</option>
                ${this.vehicleTypes.map(type => 
                  `<option value="${type}">${type}</option>`
                ).join('')}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="veh-brand">Marca *</label>
                <input 
                  type="text" 
                  id="veh-brand" 
                  name="brand" 
                  placeholder="Ex: Toyota, BMW, Honda"
                  maxlength="100"
                  required
                />
              </div>
              <div class="form-group">
                <label for="veh-model">Modelo *</label>
                <input 
                  type="text" 
                  id="veh-model" 
                  name="model" 
                  placeholder="Ex: Corolla, 320i"
                  maxlength="100"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="veh-year">Ano *</label>
              <input 
                type="number" 
                id="veh-year" 
                name="year" 
                placeholder="2024"
                min="1900"
                max="2100"
                required
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Valores</h3>

            <div class="form-group">
              <label for="veh-purchase-date">Data de Compra *</label>
              <input 
                type="date" 
                id="veh-purchase-date" 
                name="purchase_date" 
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="veh-purchase-price">Preço de Compra (R$) *</label>
                <input 
                  type="number" 
                  id="veh-purchase-price" 
                  name="purchase_price" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div class="form-group">
                <label for="veh-current-value">Valor Atual (R$)</label>
                <input 
                  type="number" 
                  id="veh-current-value" 
                  name="current_value" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Financiamento (Opcional)</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="veh-loan">Valor do Financiamento (R$)</label>
                <input 
                  type="number" 
                  id="veh-loan" 
                  name="loan_amount" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="veh-loan-remaining">Saldo Devedor (R$)</label>
                <input 
                  type="number" 
                  id="veh-loan-remaining" 
                  name="loan_remaining" 
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
              <label for="veh-notes">Notas Adicionais</label>
              <textarea 
                id="veh-notes" 
                name="notes" 
                placeholder="Informações complementares (opcional)"
                maxlength="500"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="financial-form-actions">
            <button type="button" class="btn btn-secondary" id="veh-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" id="veh-submit">
              <span class="btn-text">Salvar Veículo</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" 
                    stroke="currentColor" stroke-dasharray="31.4 94.2" 
                    style="animation: spin 1s linear infinite;"></circle>
                </svg>
              </span>
            </button>
          </div>

          <div class="financial-form-message" id="veh-message" style="display: none;"></div>
        </form>
      </div>
    `;
    return modal;
  }

  /**
   * Initialize form
   */
  init() {
    if (!document.getElementById('vehicle-modal')) {
      const modal = this.createModal();
      document.body.appendChild(modal);
    }

    this.modal = document.getElementById('vehicle-modal');
    this.form = document.getElementById('vehicle-form');
    this.overlay = document.querySelector('#vehicle-modal .financial-modal-overlay');
    this.closeBtn = document.querySelector('#vehicle-modal .financial-modal-close');
    this.cancelBtn = document.getElementById('veh-cancel');
    this.submitBtn = document.getElementById('veh-submit');

    this.closeBtn.addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Set default date to today
    const dateInput = document.getElementById('veh-purchase-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;

    console.log('✅ Vehicle Form initialized');
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
    document.getElementById('veh-purchase-date').value = today;
  }

  /**
   * Show message
   */
  showMessage(message, type = 'success') {
    const messageEl = document.getElementById('veh-message');
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
    const messageEl = document.getElementById('veh-message');
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
    document.querySelector('#veh-submit .btn-text').style.display = 'none';
    document.querySelector('#veh-submit .btn-loader').style.display = 'flex';

    try {
      const formData = new FormData(this.form);
      const data = {
        vehicle_type: formData.get('vehicle_type'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: parseInt(formData.get('year')),
        purchase_date: formData.get('purchase_date'),
        purchase_price: parseFloat(formData.get('purchase_price')),
        current_value: parseFloat(formData.get('current_value')) || null,
        loan_amount: parseFloat(formData.get('loan_amount')) || null,
        loan_remaining: parseFloat(formData.get('loan_remaining')) || null,
        notes: formData.get('notes') || null
      };

      // Validação
      if (!data.vehicle_type) throw new Error('Selecione o tipo de veículo');
      if (!data.brand.trim()) throw new Error('Digite a marca');
      if (!data.model.trim()) throw new Error('Digite o modelo');
      if (data.year < 1900 || data.year > 2100) throw new Error('Digite um ano válido');
      if (data.purchase_price <= 0) throw new Error('O preço de compra deve ser maior que zero');

      // Enviar para API
      const response = await fetch('/api/financial/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar veículo');
      }

      this.showMessage(`✅ Veículo ${data.brand} ${data.model} adicionado com sucesso!`, 'success');

      setTimeout(() => {
        if (typeof initializeChartsWithData === 'function') {
          initializeChartsWithData();
        }
        setTimeout(() => this.close(), 1000);
      }, 500);

    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.isLoading = false;
      this.submitBtn.disabled = false;
      document.querySelector('#veh-submit .btn-text').style.display = 'inline';
      document.querySelector('#veh-submit .btn-loader').style.display = 'none';
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
    window.vehicleForm = new VehicleForm();
    window.vehicleForm.init();
  });
} else {
  window.vehicleForm = new VehicleForm();
  window.vehicleForm.init();
}
