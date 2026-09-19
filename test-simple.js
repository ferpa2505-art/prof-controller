/**
 * 🧪 TESTE SIMPLES - ProF Controller v1.0.0
 * 
 * Testa apenas o que realmente existe na página
 */

console.clear();
console.log('%c🧪 TESTE SIMPLES - ProF Controller v1.0.0', 'font-size:16px;font-weight:bold;color:#00AA00;');
console.log('%c==========================================\n', 'color:#00AA00;');

let passed = 0, failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`%c✅ ${name}`, 'color:#00AA00;font-weight:bold;', details);
    passed++;
  } else {
    console.log(`%c❌ ${name}`, 'color:#FF0000;font-weight:bold;', details);
    failed++;
  }
}

// ============ TESTES ============

// 1. Versão no HTML
let appVersionEl = document.getElementById('appVersion');
test('Footer com versão existe', appVersionEl !== null, `Texto: "${appVersionEl?.textContent}"`);
test('Versão é 1.0.0', appVersionEl?.textContent?.includes('1.0.0'), `Encontrado: ${appVersionEl?.textContent}`);

// 2. Elementos principais
test('Header existe', document.querySelector('header') !== null);
test('Main existe', document.querySelector('main') !== null);
test('Footer existe', document.querySelector('footer') !== null);

// 3. Abas
let tabs = document.querySelectorAll('.tab');
test(`${tabs.length} abas encontradas`, tabs.length > 0, `Total: ${tabs.length}`);

// Verificar nomes das abas
let tabNames = [];
tabs.forEach(tab => {
  let name = tab.getAttribute('data-i18n') || tab.textContent.trim();
  tabNames.push(name);
});
test('Aba Dashboard existe', tabNames.join('|').includes('dashboard'), `Abas: ${tabNames.join(', ')}`);

// 4. Modal
let modal = document.getElementById('modal');
test('Modal existe', modal !== null);

// 5. Toast
let toast = document.getElementById('toast');
test('Toast existe', toast !== null);

// 6. LocalStorage
test('LocalStorage funciona', typeof localStorage !== 'undefined');

// 7. Funções globais (se existirem)
let customFunctions = [];
for (let key in window) {
  if (typeof window[key] === 'function' && !key.includes('webkit') && !key.includes('chrome')) {
    if (key.toLowerCase().includes('tab') || key.toLowerCase().includes('modal') || key.toLowerCase().includes('toast')) {
      customFunctions.push(key);
    }
  }
}
test('Funções customizadas no escopo global', customFunctions.length > 0, `Funções: ${customFunctions.slice(0, 3).join(', ')}`);

// 8. Styles
let styles = document.querySelectorAll('style, link[rel="stylesheet"]');
test('Estilos carregados', styles.length > 0, `Total: ${styles.length}`);

// 9. PWA Manifest
let manifest = document.querySelector('link[rel="manifest"]');
test('PWA Manifest existe', manifest !== null, `href: ${manifest?.href}`);

// 10. Scripts
let scripts = document.querySelectorAll('script');
test('Scripts carregados', scripts.length > 0, `Total: ${scripts.length}`);

// ============ RESUMO ============
console.log('\n%c==========================================', 'color:#00AA00;');
console.log(`%c✅ Testes Passados: ${passed}`, 'color:#00AA00;font-weight:bold;');
console.log(`%c❌ Testes Falhados: ${failed}`, 'color:#FF0000;font-weight:bold;');

let percent = ((passed / (passed + failed)) * 100).toFixed(1);
let color = percent >= 80 ? '#00AA00' : percent >= 50 ? '#FFAA00' : '#FF0000';
console.log(`%c📈 Taxa de Sucesso: ${percent}%`, `color:${color};font-weight:bold;`);

console.log('%c==========================================\n', 'color:#00AA00;');

if (failed === 0) {
  console.log('%c🎉 TUDO OK! Página carregou corretamente! 🎉', 'font-size:13px;font-weight:bold;color:#00AA00;background:#001100;padding:10px;border-radius:4px;');
} else {
  console.log(`%c⚠️ ${failed} teste(s) falharam - verificar acima`, 'font-size:13px;font-weight:bold;color:#FFAA00;background:#110000;padding:10px;border-radius:4px;');
}

console.log('\n%cPróximo passo: Teste manualmente a funcionalidade!', 'color:#0099FF;font-style:italic;');
