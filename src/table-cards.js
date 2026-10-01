/**
 * Tabelas que cabem na tela em qualquer dispositivo
 *
 * Copia o título de cada coluna (thead) para as células (data-label) e liga
 * a classe fit-cards quando a tabela deve virar cartões "Rótulo: valor"
 * (styles/fit-screen.css): sempre no tablet e no celular, e em qualquer tela
 * quando a tabela não cabe na largura disponível. Assim nunca há rolagem lateral.
 *
 * As tabelas são redesenhadas pelo app.js a todo momento, por isso um
 * MutationObserver refaz os rótulos depois de cada mudança.
 */
(function () {
  function rotulosDe(table) {
    const ths = table.tHead ? table.tHead.querySelectorAll('tr:last-child th, tr:last-child td') : [];
    const rotulos = [];
    ths.forEach((th) => {
      const span = Number(th.getAttribute('colspan')) || 1;
      const txt = th.textContent.trim();
      for (let i = 0; i < span; i++) rotulos.push(txt);
    });
    return rotulos;
  }

  function rotular(table) {
    const rotulos = rotulosDe(table);
    if (!rotulos.length) return;
    table.classList.add('fit-table');
    table.querySelectorAll('tbody tr, tfoot tr').forEach((tr) => {
      let col = 0;
      Array.from(tr.cells).forEach((td) => {
        const span = Number(td.getAttribute('colspan')) || 1;
        if (span > 1) td.classList.add('fit-span');
        const rot = rotulos[col] || '';
        if (rot && span === 1) {
          if (td.dataset.label !== rot) td.dataset.label = rot;
        } else if (td.hasAttribute('data-label') && !rot) {
          td.removeAttribute('data-label');
        }
        col += span;
      });
    });
  }

  const CARTOES_ATE = 900; // px: tablet e celular sempre em cartões

  // Mede no formato tabela; se passar da largura do contêiner, vira cartões
  function ajustarFormato(table) {
    if (window.innerWidth <= CARTOES_ATE) { table.classList.add('fit-cards'); return; }
    if (!table.offsetParent) return; // aba escondida: mede quando aparecer
    const caixa = table.parentElement;
    table.classList.remove('fit-cards');
    const naoCabe = table.scrollWidth > caixa.clientWidth + 2;
    table.classList.toggle('fit-cards', naoCabe);
  }

  function rotularTudo() {
    document.querySelectorAll('main table').forEach((table) => {
      rotular(table);
      if (table.classList.contains('fit-table')) ajustarFormato(table);
    });
  }

  let agendado = false;
  function agendar() {
    if (agendado) return;
    agendado = true;
    // setTimeout e não requestAnimationFrame: este pausa com a aba em segundo plano
    setTimeout(() => { agendado = false; rotularTudo(); }, 30);
  }

  function iniciar() {
    rotularTudo();
    const main = document.querySelector('main');
    if (main) new MutationObserver(agendar).observe(main, { childList: true, subtree: true });
    // Trocar de aba só muda classes (a tabela aparece): mede de novo
    document.addEventListener('click', () => setTimeout(agendar, 0));
    window.addEventListener('resize', agendar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
