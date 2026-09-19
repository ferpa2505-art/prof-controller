/**
 * 🎨 UI CLEANUP - ProF Controller
 * 
 * Melhoria visual:
 * 1. Botões de ação em menu (+ clicável)
 * 2. Câmbio: mostrar apenas 2 últimos dias com setas de comparação
 */

document.addEventListener('DOMContentLoaded', () => {
  initActionMenus();
  initCurrencyComparison();
});

// ============ 1. ACTION MENUS (+ botão) ============
function initActionMenus() {
  // Encontrar todas as linhas de tabelas com botões
  const tables = document.querySelectorAll('table tbody');
  
  tables.forEach(tbody => {
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
      // Procurar por célula com múltiplos botões de ação
      const cells = row.querySelectorAll('td');
      const lastCell = cells[cells.length - 1];
      
      if (!lastCell) return;
      
      const buttons = lastCell.querySelectorAll('button');
      
      // Se houver 3+ botões, converter para menu
      if (buttons.length >= 3) {
        convertToActionMenu(row, lastCell, buttons);
      }
    });
  });
}

function convertToActionMenu(row, cell, buttons) {
  // Esconder botões originais
  buttons.forEach(btn => {
    btn.style.display = 'none';
  });
  
  // Criar container para menu
  const menuContainer = document.createElement('div');
  menuContainer.className = 'action-menu-container';
  menuContainer.style.cssText = `
    position: relative;
    display: inline-block;
  `;
  
  // Criar botão "+"
  const plusBtn = document.createElement('button');
  plusBtn.className = 'action-plus-btn';
  plusBtn.innerHTML = '⊕';
  plusBtn.style.cssText = `
    background: none;
    border: 1px solid #666;
    color: #0099FF;
    font-size: 18px;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  `;
  
  plusBtn.onmouseover = () => {
    plusBtn.style.background = '#0099FF';
    plusBtn.style.color = '#fff';
  };
  plusBtn.onmouseout = () => {
    plusBtn.style.background = 'none';
    plusBtn.style.color = '#0099FF';
  };
  
  // Criar menu dropdown
  const menu = document.createElement('div');
  menu.className = 'action-dropdown-menu';
  menu.style.cssText = `
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: #1a1a2e;
    border: 1px solid #333;
    border-radius: 4px;
    min-width: 140px;
    z-index: 1000;
    margin-top: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  // Copiar botões para o menu
  buttons.forEach((btn, idx) => {
    const menuItem = document.createElement('button');
    menuItem.className = 'action-menu-item';
    menuItem.textContent = btn.textContent || btn.title;
    menuItem.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: #ccc;
      text-align: left;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
      border-bottom: ${idx < buttons.length - 1 ? '1px solid #333' : 'none'};
    `;
    
    menuItem.onmouseover = () => {
      menuItem.style.background = '#0099FF';
      menuItem.style.color = '#fff';
    };
    menuItem.onmouseout = () => {
      menuItem.style.background = 'transparent';
      menuItem.style.color = '#ccc';
    };
    
    // Clica no botão original ao clicar no menu
    menuItem.onclick = (e) => {
      e.preventDefault();
      btn.click();
      menu.style.display = 'none';
    };
    
    menu.appendChild(menuItem);
  });
  
  // Toggle menu ao clicar no "+"
  plusBtn.onclick = (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  };
  
  // Fechar menu ao clicar fora
  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });
  
  // Montar container
  menuContainer.appendChild(plusBtn);
  menuContainer.appendChild(menu);
  
  // Limpar célula e adicionar novo menu
  cell.innerHTML = '';
  cell.appendChild(menuContainer);
}

// ============ 2. CURRENCY COMPARISON ============
function initCurrencyComparison() {
  const exchangeTable = document.querySelector('table');
  if (!exchangeTable || !exchangeTable.textContent.includes('EUR')) return;
  
  // Encontrar tabela de câmbio
  const tbody = exchangeTable.querySelector('tbody');
  if (!tbody) return;
  
  // Agrupar por moeda
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const currencyGroups = {};
  
  rows.forEach(row => {
    const dateCell = row.cells[0];
    const currencyCell = row.cells[1];
    
    if (!dateCell || !currencyCell) return;
    
    const date = dateCell.textContent.trim();
    const currency = currencyCell.textContent.trim();
    
    if (!currencyGroups[currency]) {
      currencyGroups[currency] = [];
    }
    
    currencyGroups[currency].push({
      date: date,
      row: row,
      rateCell: row.cells[2]
    });
  });
  
  // Para cada moeda, manter apenas 2 últimos dias
  Object.keys(currencyGroups).forEach(currency => {
    const entries = currencyGroups[currency]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2); // Últimos 2 dias
    
    // Esconder outros
    currencyGroups[currency].forEach(entry => {
      if (!entries.includes(entry)) {
        entry.row.style.display = 'none';
      }
    });
    
    // Adicionar seta de comparação
    if (entries.length === 2) {
      const oldRate = parseFloat(
        entries[1].rateCell.textContent.replace(/[^\d.,-]/g, '').replace(',', '.')
      );
      const newRate = parseFloat(
        entries[0].rateCell.textContent.replace(/[^\d.,-]/g, '').replace(',', '.')
      );
      
      const comparison = newRate > oldRate ? '↑' : newRate < oldRate ? '↓' : '→';
      const color = newRate > oldRate ? '#00AA00' : newRate < oldRate ? '#FF0000' : '#FFAA00';
      
      // Inserir seta na célula de rate
      const arrow = document.createElement('span');
      arrow.style.cssText = `
        color: ${color};
        font-weight: bold;
        margin-left: 6px;
      `;
      arrow.textContent = comparison;
      
      entries[0].rateCell.appendChild(arrow);
    }
  });
}

console.log('✅ UI Cleanup loaded - Action menus and currency comparison ready!');
