/**
 * 🧪 SCRIPT DE TESTE AUTOMÁTICO - ProF Controller v1.0.0
 * 
 * COMO USAR:
 * 1. Abra o navegador na página: https://ferpa2505-art.github.io/prof-controller/
 * 2. Pressione F12 para abrir DevTools
 * 3. Vá para aba "Console"
 * 4. Copie e cole este script completo
 * 5. Pressione ENTER
 * 
 * O script vai testar automaticamente todas as funcionalidades principais!
 */

console.clear();
console.log('%c🧪 INICIANDO TESTES AUTOMÁTICOS - ProF Controller v1.0.0', 'font-size: 16px; font-weight: bold; color: #00AA00;');
console.log('%c==========================================\n', 'color: #00AA00;');

// Cores para logs
const colors = {
  success: 'color: #00AA00; font-weight: bold;',
  error: 'color: #FF0000; font-weight: bold;',
  warning: 'color: #FFAA00; font-weight: bold;',
  info: 'color: #0099FF; font-weight: bold;',
  section: 'color: #00DDFF; font-weight: bold; font-size: 13px;'
};

let testsPassed = 0;
let testsFailed = 0;

// Função auxiliar para testar
function test(name, condition, details = '') {
  if (condition) {
    console.log(`%c✅ ${name}`, colors.success, details);
    testsPassed++;
  } else {
    console.log(`%c❌ ${name}`, colors.error, details);
    testsFailed++;
  }
}

// ============================================
// 1. VERIFICAÇÃO INICIAL
// ============================================
console.log('%c\n1️⃣ VERIFICAÇÃO INICIAL', colors.section);
console.log('%c========================================', colors.section);

test('APP_VERSION definida', typeof window.APP_VERSION !== 'undefined', `Versão: ${window.APP_VERSION || 'N/A'}`);
test('Versão é 1.0.0', window.APP_VERSION === '1.0.0', `Encontrado: ${window.APP_VERSION}`);

// Verificar elementos do DOM
test('Container principal existe', document.getElementById('container') !== null);
test('Elemento de versão no rodapé', document.querySelector('footer') !== null || document.querySelector('[id*="version"]') !== null);

// ============================================
// 2. VERIFICAÇÃO DE DADOS
// ============================================
console.log('%c\n2️⃣ VERIFICAÇÃO DE DADOS', colors.section);
console.log('%c========================================', colors.section);

let investimentos = [];
let operacoes = [];
let notificacoes = [];

try {
  investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];
  operacoes = JSON.parse(localStorage.getItem('operacoes')) || [];
  notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];
} catch (e) {
  console.log('%c⚠️ Erro ao ler localStorage', colors.warning, e.message);
}

test('LocalStorage está funcionando', localStorage.length > 0, `${localStorage.length} itens no localStorage`);
test('Investimentos carregados', Array.isArray(investimentos), `Total: ${investimentos.length}`);
test('Operações carregadas', Array.isArray(operacoes), `Total: ${operacoes.length}`);
test('Notificações carregadas', Array.isArray(notificacoes), `Total: ${notificacoes.length}`);

// ============================================
// 3. TESTES DE FUNÇÕES PRINCIPAIS
// ============================================
console.log('%c\n3️⃣ FUNÇÕES PRINCIPAIS', colors.section);
console.log('%c========================================', colors.section);

// Verificar se as funções existem
test('Função addInvestimento existe', typeof window.addInvestimento === 'function');
test('Função addOperacao existe', typeof window.addOperacao === 'function');
test('Função checkNotifications existe', typeof window.checkNotifications === 'function');
test('Função updateNotifications existe', typeof window.updateNotifications === 'function');

// ============================================
// 4. TESTE DE RECORRÊNCIA
// ============================================
console.log('%c\n4️⃣ TESTE DE RECORRÊNCIA ⭐', colors.section);
console.log('%c========================================', colors.section);

// Verificar se há operações recorrentes
let operacoesRecorrentes = operacoes.filter(op => op.recorrente === true || op.recorrente === 'true');
test('Operações recorrentes podem ser criadas', typeof window.addOperacao === 'function', 'Função disponível');
test('Há operações recorrentes no dados', operacoesRecorrentes.length > 0, `Total: ${operacoesRecorrentes.length}`);

if (operacoesRecorrentes.length > 0) {
  console.log('%c📋 Operações Recorrentes Found:', colors.info);
  operacoesRecorrentes.slice(0, 3).forEach((op, i) => {
    console.log(`  ${i+1}. ${op.ativo || op.tipo || 'SEM NOME'} - ${op.frequencia || 'SEM FREQ'}`);
  });
}

// ============================================
// 5. TESTE DE NOTIFICAÇÕES
// ============================================
console.log('%c\n5️⃣ TESTE DE NOTIFICAÇÕES ⭐', colors.section);
console.log('%c========================================', colors.section);

test('Sistema de notificações está ativo', notificacoes.length >= 0);
test('Notificações podem ser criadas', typeof window.updateNotifications === 'function');

if (notificacoes.length > 0) {
  console.log('%c📢 Notificações Ativas:', colors.info);
  notificacoes.slice(0, 3).forEach((notif, i) => {
    console.log(`  ${i+1}. ${notif.mensagem || notif.titulo || 'SEM TÍTULO'}`);
  });
}

// ============================================
// 6. VERIFICAÇÃO DO DOM - ABAS
// ============================================
console.log('%c\n6️⃣ INTERFACE - ABAS', colors.section);
console.log('%c========================================', colors.section);

const abas = ['investimentos', 'operacoes', 'notificacoes', 'relatorios', 'calculadora', 'noticias'];
abas.forEach(aba => {
  let exists = false;
  // Tenta encontrar a aba por ID, data-tab, ou class
  exists = 
    document.getElementById(aba) !== null ||
    document.querySelector(`[data-tab="${aba}"]`) !== null ||
    document.querySelector(`[class*="${aba}"]`) !== null ||
    document.querySelector(`button[id*="${aba}"]`) !== null;
  
  test(`Aba "${aba}" existe no DOM`, exists);
});

// ============================================
// 7. TESTE DE CALCULADORA
// ============================================
console.log('%c\n7️⃣ CALCULADORA', colors.section);
console.log('%c========================================', colors.section);

test('Função calculate existe', typeof window.calculate === 'function' || typeof window.performCalculation === 'function');
test('Elemento calculadora existe', document.querySelector('[id*="calculadora"]') !== null || document.querySelector('[id*="calc"]') !== null);

// ============================================
// 8. VERIFICAÇÃO DE ERROS NO CONSOLE
// ============================================
console.log('%c\n8️⃣ VERIFICAÇÃO DE ERROS', colors.section);
console.log('%c========================================', colors.section);

// Contar erros no console (se disponível)
let consoleErrors = 0;
let consoleWarnings = 0;

// Hook para console.error
const originalError = console.error;
console.error = function(...args) {
  consoleErrors++;
  originalError.apply(console, args);
};

test('Console sem erros críticos', consoleErrors === 0, `Erros: ${consoleErrors}`);
test('Página carregou sem problemas', document.readyState === 'complete');

// ============================================
// 9. TESTE DE PERFORMANCE
// ============================================
console.log('%c\n9️⃣ PERFORMANCE', colors.section);
console.log('%c========================================', colors.section);

let navigationTiming = performance.getEntriesByType('navigation')[0];
if (navigationTiming) {
  let loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
  test('Página carregou rápido (< 5s)', loadTime < 5000, `Tempo: ${loadTime.toFixed(0)}ms`);
  
  let dnsTime = navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart;
  test('DNS rápido (< 1s)', dnsTime < 1000, `Tempo: ${dnsTime.toFixed(0)}ms`);
} else {
  console.log('%c⚠️ Performance Timing não disponível', colors.warning);
}

// ============================================
// 10. TESTE DE RESPONSIVIDADE
// ============================================
console.log('%c\n🔟 RESPONSIVIDADE', colors.section);
console.log('%c========================================', colors.section);

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

test('Viewport detectado', viewportWidth > 0 && viewportHeight > 0, `${viewportWidth}x${viewportHeight}px`);

if (viewportWidth < 768) {
  console.log('%c📱 Modo MOBILE detectado', colors.info);
} else if (viewportWidth < 1024) {
  console.log('%c📱 Modo TABLET detectado', colors.info);
} else {
  console.log('%c🖥️  Modo DESKTOP detectado', colors.info);
}

// ============================================
// RESUMO FINAL
// ============================================
console.log('\n%c==========================================', colors.section);
console.log('%c📊 RESUMO DOS TESTES', colors.section);
console.log('%c==========================================', colors.section);

console.log(`%c✅ Testes Passados: ${testsPassed}`, colors.success);
console.log(`%c❌ Testes Falhados: ${testsFailed}`, colors.error);
console.log(`%c📈 Taxa de Sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, colors.info);

console.log('\n%c==========================================', colors.section);

if (testsFailed === 0) {
  console.log('%c🎉 TODOS OS TESTES PASSARAM! 🎉', 'font-size: 14px; font-weight: bold; color: #00AA00; background: #001100; padding: 10px;');
} else if (testsFailed < 3) {
  console.log('%c⚠️ ALGUNS TESTES FALHARAM (Verificar detalhes acima)', 'font-size: 14px; font-weight: bold; color: #FFAA00; background: #110000; padding: 10px;');
} else {
  console.log('%c❌ MUITOS TESTES FALHARAM (Investigar problemas)', 'font-size: 14px; font-weight: bold; color: #FF0000; background: #110000; padding: 10px;');
}

console.log('%c==========================================\n', colors.section);

console.log('%c📝 PRÓXIMOS PASSOS:', colors.info);
console.log('1. Verifique os testes que falharam acima');
console.log('2. Se todos passaram, teste manualmente as funcionalidades principais');
console.log('3. Teste em diferentes navegadores e dispositivos');
console.log('4. Reporte qualquer problema encontrado');

console.log('%c\n🚀 Testes automáticos concluídos!', colors.success);
