/**
 * 🎨 UI CLEANUP - ProF Controller
 * 
 * Melhoria visual:
 * 1. Botões de ação em menu circular com "+"
 * 2. Câmbio: mostrar apenas 2 últimos dias com setas de comparação coloridas
 */

console.log('✅ ui-cleanup.js iniciado');

// Aguarda renderAll() completar - aumentar timeout para garantir
function initUI() {
  console.log('🔄 Inicializando UI cleanup...');
  initActionMenus();
  initCurrencyComparison();
  console.log('✅ UI cleanup completo');
}

// Tentar rodar logo quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initUI, 800);
  });
} else {
  // DOM já está pronto
  setTimeout(initUI, 800);
}

// Re-inicializar quando tab muda (se renderAll for chamado)
window.addEventListener('profileLoaded', initUI);
window.addEventListener('dataChanged', initUI);

// ============ 1. ACTION MENUS (+ botão) ============
function initActionMenus() {
  console.log('🎯 initActionMenus: começando...');
  
  // Encontrar todas as linhas de tabelas com botões
  const tables = document.querySelectorAll('table tbody');
  console.log('📊 Encontradas ' + tables.length + ' tabelas');
  
  let menuCount = 0;
  
  tables.forEach((tbody, tbodyIdx) => {
    const rows = tbody.querySelectorAll('tr');
    console.log('📈 Tabela ' + tbodyIdx + ' tem ' + rows.length + ' linhas');
    
    rows.forEach((row, rowIdx) => {
      // Procurar por célula com múltiplos botões de ação
      const cells = row.querySelectorAll('td');
      const lastCell = cells[cells.length - 1];
      
      if (!lastCell) return;
      
      const buttons = lastCell.querySelectorAll('button');
      
      // Se houver 3+ botões, converter para menu
      if (buttons.length >= 3) {
        console.log('🔘 Linha ' + rowIdx + ' tem ' + buttons.length + ' botões - convertendo para menu');
        convertToActionMenu(row, lastCell, buttons);
        menuCount++;
      }
    });
  });
  
  console.log('✅ ' + menuCount + ' menus de ação criados');
}

function convertToActionMenu(row, cell, buttons) {
  // Esconder botões originais
  buttons.forEach(btn => {
    btn.style.display = 'none';
  });
  
  // Criar container para menu
  const menuContainer = document.createElement('div');
  menuContainer.className = 'action-menu-container';
  
  // Criar botão "+" em círculo
  const plusBtn = document.createElement('button');
  plusBtn.className = 'action-plus-btn';
  plusBtn.type = 'button';
  plusBtn.innerHTML = '+';
  plusBtn.title = 'Ações';
  
  // Criar menu dropdown
  const menu = document.createElement('div');
  menu.className = 'action-dropdown-menu';
  
  // Copiar botões para o menu
  buttons.forEach((btn) => {
    const menuItem = document.createElement('button');
    menuItem.type = 'button';
    menuItem.className = 'action-menu-item';
    menuItem.textContent = btn.textContent || btn.title;
    menuItem.title = btn.title;
    
    // Clica no botão original ao clicar no menu
    menuItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.click();
      menu.classList.remove('active');
    });
    
    menu.appendChild(menuItem);
  });
  
  // Toggle menu ao clicar no "+"
  plusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('active');
  });
  
  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!menuContainer.contains(e.target)) {
      menu.classList.remove('active');
    }
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
  console.log('DEBUG: Iniciando Currency Comparison');
  
  // Encontrar todas as tabelas da página
  const tables = document.querySelectorAll('table');
  console.log('DEBUG: ' + tables.length + ' tabelas encontradas');
  
  tables.forEach((table, tableIdx) => {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    console.log('DEBUG: Tabela ' + tableIdx + ' tem ' + rows.length + ' linhas');
    
    if (rows.length === 0) return;
    
    // Detectar se é tabela de câmbio (DATA, MOEDA, TAXA)
    const firstRow = rows[0];
    const cellCount = firstRow.cells.length;
    const isExchangeTable = cellCount >= 3 && 
                           rows.some(r => r.cells[1] && ['USD', 'EUR', 'BRL', 'GBP', 'JPY', 'CHF'].includes(r.cells[1].textContent.trim()));
    
    if (!isExchangeTable) {
      console.log('DEBUG: Tabela ' + tableIdx + ' não é tabela de câmbio');
      return;
    }
    
    console.log('DEBUG: Tabela ' + tableIdx + ' é tabela de câmbio!');
    
    // Agrupar por moeda
    const currencyGroups = {};
    
    rows.forEach((row, rowIdx) => {
      if (!row.cells[0] || !row.cells[1] || !row.cells[2]) return;
      
      const dateStr = row.cells[0].textContent.trim();
      const currency = row.cells[1].textContent.trim();
      const rateStr = row.cells[2].textContent.trim();
      
      // Tentar fazer parse da data
      let dateVal;
      try {
        dateVal = new Date(dateStr);
        if (isNaN(dateVal.getTime())) throw new Error('Invalid date');
      } catch (e) {
        console.log('DEBUG: Data inválida:', dateStr);
        return;
      }
      
      if (!currencyGroups[currency]) {
        currencyGroups[currency] = [];
      }
      
      currencyGroups[currency].push({
        date: dateVal,
        dateStr: dateStr,
        currency: currency,
        row: row,
        rateCell: row.cells[2],
        rateStr: rateStr
      });
    });
    
    console.log('DEBUG: Moedas encontradas:', Object.keys(currencyGroups));
    
    // Para cada moeda, manter apenas 2 últimos dias
    Object.entries(currencyGroups).forEach(([currency, entries]) => {
      // Ordenar por data (mais recente primeiro)
      entries.sort((a, b) => b.date - a.date);
      
      console.log('DEBUG: Moeda ' + currency + ' tem ' + entries.length + ' entradas');
      
      // Manter apenas últimos 2
      const toShow = entries.slice(0, 2);
      const toHide = entries.slice(2);
      
      // Esconder linhas antigas
      toHide.forEach(entry => {
        entry.row.classList.add('currency-hidden-row');
        entry.row.style.display = 'none';
      });
      
      // Adicionar seta no registro mais recente
      if (toShow.length === 2) {
        const newest = toShow[0];
        const oldest = toShow[1];
        
        // Parse rates
        const newRate = parseFloat(newest.rateStr.replace(/[^\d.,-]/g, '').replace(',', '.'));
        const oldRate = parseFloat(oldest.rateStr.replace(/[^\d.,-]/g, '').replace(',', '.'));
        
        if (!isNaN(newRate) && !isNaN(oldRate)) {
          let arrow, arrowClass;
          
          if (newRate > oldRate) {
            arrow = '↑';
            arrowClass = 'up';
          } else if (newRate < oldRate) {
            arrow = '↓';
            arrowClass = 'down';
          } else {
            arrow = '→';
            arrowClass = 'equal';
          }
          
          // Limpar conteúdo da célula e readicionar taxa + seta
          newest.rateCell.textContent = newest.rateStr;
          
          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'currency-arrow ' + arrowClass;
          arrowSpan.textContent = ' ' + arrow;
          
          newest.rateCell.appendChild(arrowSpan);
          
          console.log('DEBUG: ' + currency + ' - Nova taxa: ' + newRate + ', Taxa antiga: ' + oldRate + ', Seta: ' + arrow);
        }
      }
    });
  });
  
  console.log('DEBUG: Currency Comparison concluído');
}

console.log('✅ UI Cleanup loaded - Action menus and currency comparison ready!');
