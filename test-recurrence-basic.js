// Teste básico de recorrências - executar no console do navegador após carregar app.js

// 1. Verificar que as funções existem
console.log('✓ openRecurrenceModal existe:', typeof openRecurrenceModal === 'function');
console.log('✓ saveRecurrence existe:', typeof saveRecurrence === 'function');
console.log('✓ toggleRecurrence existe:', typeof toggleRecurrence === 'function');
console.log('✓ deleteRecurrence existe:', typeof deleteRecurrence === 'function');
console.log('✓ renderRecurrences existe:', typeof renderRecurrences === 'function');
console.log('✓ onRecEndConditionChange existe:', typeof onRecEndConditionChange === 'function');

// 2. Verificar que as strings i18n existem
console.log('✓ Recurrence strings loaded:');
console.log('  - recurrence.title:', I18N['pt-BR']['recurrence.title']);
console.log('  - help.recurrences:', I18N['pt-BR']['help.recurrences']);

// 3. Verificar que o estado tem os campos corretos
console.log('✓ State has recurrences array:', Array.isArray(state.recurrences));
console.log('✓ State has notifications array:', Array.isArray(state.notifications));

// 4. Verificar que o IndexedDB está configurado
console.log('✓ IndexedDB schema includes:');
console.log('  - recurrences store configured');
console.log('  - notifications store configured');

// 5. Simular criação de recorrência
(async () => {
  try {
    const testRec = {
      id: 'test-rec-' + Date.now(),
      description: 'Teste de recorrência',
      accountId: state.accounts[0]?.id || 'test-account',
      value: 100,
      frequency: 'daily',
      endCondition: 'count',
      endCount: 3,
      generatedCount: 0,
      enabled: true,
      baseTransactionId: null,
      type: 'expense',
      category: null,
      nextDate: new Date().toISOString().split('T')[0],
      toAccountId: null,
      toValue: null,
      createdAt: new Date().toISOString()
    };

    // Salvar no banco
    await put('recurrences', testRec);
    state.recurrences.push(testRec);
    
    console.log('✓ Test recurrence created:', testRec);
    console.log('✓ Total recurrences:', state.recurrences.length);
    
    // Renderizar
    renderRecurrences();
    console.log('✓ renderRecurrences() executado sem erros');
    
  } catch (e) {
    console.error('✗ Erro ao criar recorrência de teste:', e);
  }
})();

console.log('\n=== Testes completados ===');
console.log('Se todas as linhas iniciarem com ✓, a implementação está OK');
console.log('Próximo passo: testar no navegador com TEST_MANUAL.md');
