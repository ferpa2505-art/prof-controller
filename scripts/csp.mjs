// Leitura da Content-Security-Policy de uma página HTML, sem regex frágil de atributos.
//
// Antes o teste procurava `<meta http-equiv="Content-Security-Policy" content="...">` numa ÚNICA ordem de atributos
// e com aspas duplas: uma segunda meta com `content` antes de `http-equiv`, aspas simples, maiúsculas ou quebra de
// linha passava despercebida (e o navegador aplicaria as duas políticas). Aqui toda tag <meta> é lida como o
// navegador lê (qualquer ordem, aspas simples/duplas/sem aspas, nomes sem diferenciar maiúsculas).

const CSP_EQUIV = 'content-security-policy';

/**
 * Tira os comentários HTML lendo como o navegador lê (sem regex de substituição, que deixa passar formas como
 * `--!>` e `<!-->`): o navegador não interpreta o que está em comentário, então uma meta comentada não vale.
 * Comentário sem fim vai até o fim do documento.
 */
function semComentarios(html) {
  let saida = '';
  let i = 0;
  while (i < html.length) {
    const ini = html.indexOf('<!--', i);
    if (ini === -1) { saida += html.slice(i); break; }
    saida += html.slice(i, ini);
    let j = ini + 4;
    if (html.startsWith('>', j)) { i = j + 1; continue; } // <!--> : comentário vazio (fecho abrupto)
    if (html.startsWith('->', j)) { i = j + 2; continue; } // <!---> : idem
    let fim = -1;
    for (; j < html.length; j++) {
      if (html.startsWith('-->', j)) { fim = j + 3; break; }
      if (html.startsWith('--!>', j)) { fim = j + 4; break; } // o HTML aceita --!> como fecho
    }
    if (fim === -1) break; // sem fim: o resto é comentário
    i = fim;
  }
  return saida;
}

/** Lê os atributos de UMA tag a partir de `<meta ...>`; o primeiro valor de cada nome vale (como no HTML). */
function lerAtributos(texto) {
  const attrs = new Map();
  const duplicados = [];
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const nome = m[1].toLowerCase();
    const valor = m[2] ?? m[3] ?? m[4] ?? '';
    if (attrs.has(nome)) duplicados.push(nome);
    else attrs.set(nome, valor);
  }
  return { attrs, duplicados };
}

/** Percorre o HTML achando cada <meta ...>, respeitando aspas (um '>' dentro de um valor não fecha a tag). */
function* tagsMeta(html) {
  const re = /<meta(?=[\s\/>])/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let i = m.index + m[0].length;
    let aspas = null;
    for (; i < html.length; i++) {
      const c = html[i];
      if (aspas) { if (c === aspas) aspas = null; } else if (c === '"' || c === "'") aspas = c;
      else if (c === '>') break;
    }
    yield html.slice(m.index + m[0].length, i);
    re.lastIndex = i;
  }
}

/** Todas as políticas aplicadas por <meta http-equiv="Content-Security-Policy">, na ordem do documento. */
export function extrairCspMetas(html) {
  const politicas = [];
  for (const corpo of tagsMeta(semComentarios(html))) {
    const { attrs } = lerAtributos(corpo);
    if ((attrs.get('http-equiv') ?? '').trim().toLowerCase() === CSP_EQUIV) politicas.push(attrs.get('content') ?? '');
  }
  return politicas;
}

/** Diretiva -> lista de fontes. Diretiva repetida: a primeira vale (como no navegador) e a repetição é reportada. */
export function lerCsp(politica) {
  const diretivas = new Map();
  const repetidas = [];
  for (const parte of politica.split(';')) {
    const itens = parte.trim().split(/\s+/).filter(Boolean);
    if (itens.length === 0) continue;
    const nome = itens[0].toLowerCase();
    if (diretivas.has(nome)) repetidas.push(nome);
    else diretivas.set(nome, itens.slice(1));
  }
  return { diretivas, repetidas };
}

/** Compara a política com a esperada, EXATAMENTE (mesmas diretivas, mesmas fontes, ordem livre). Devolve as diferenças. */
export function compararCsp(politica, esperada) {
  const { diretivas, repetidas } = lerCsp(politica);
  const problemas = repetidas.map((d) => `diretiva repetida: ${d}`);
  for (const [nome, fontes] of Object.entries(esperada)) {
    const atual = diretivas.get(nome);
    if (!atual) { problemas.push(`falta a diretiva ${nome}`); continue; }
    const extra = atual.filter((f) => !fontes.includes(f));
    const falta = fontes.filter((f) => !atual.includes(f));
    if (extra.length) problemas.push(`${nome} permite fonte(s) não autorizada(s): ${extra.join(' ')}`);
    if (falta.length) problemas.push(`${nome} perdeu fonte(s) esperada(s): ${falta.join(' ')}`);
    if (atual.length !== new Set(atual).size) problemas.push(`${nome} repete fontes`);
  }
  for (const nome of diretivas.keys()) if (!(nome in esperada)) problemas.push(`diretiva não prevista: ${nome}`);
  return problemas;
}
