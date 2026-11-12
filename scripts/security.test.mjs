import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { safeAssetPath } from './build-www.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build-www.mjs');
const POLICY_SCRIPT = path.join(ROOT, 'scripts', 'check-workflow-security.mjs');
const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function fixture({ html, css = 'body { background: url("images/bg.svg"); }' } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prof-controller-build-'));
  tempDirs.push(dir);
  await fs.mkdir(path.join(dir, 'scripts'), { recursive: true });
  await fs.mkdir(path.join(dir, 'images'));
  await fs.copyFile(BUILD_SCRIPT, path.join(dir, 'scripts', 'build-www.mjs'));
  await fs.writeFile(path.join(dir, 'index.html'), html ?? '<link rel="stylesheet" href="site.css"><script src="app.js"></script>');
  await fs.writeFile(path.join(dir, 'site.css'), css);
  await fs.writeFile(path.join(dir, 'app.js'), 'window.app = true;');
  await fs.writeFile(path.join(dir, 'images', 'bg.svg'), '<svg/>');
  await fs.writeFile(path.join(dir, 'icon.png'), 'icon');
  await fs.writeFile(path.join(dir, 'privacy.html'), '<p>privacy</p>');
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify({ icons: [{ src: 'icon.png' }] }));
  await fs.writeFile(path.join(dir, 'service-worker.js'), 'const BUILD_ID = "dev"; /*__BUILD_ID__*/\nconst ASSETS = []; /*__ASSETS__*/');
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ version: '1.0.0' }));
  return dir;
}

function runBuild(dir) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'build-www.mjs')], { encoding: 'utf8' });
}

async function runPolicy(workflowYaml) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prof-controller-wf-'));
  tempDirs.push(dir);
  await fs.writeFile(path.join(dir, 'test.yml'), workflowYaml);
  return spawnSync(process.execPath, [POLICY_SCRIPT, dir], { encoding: 'utf8' });
}

const toPosix = (p) => p.split(path.sep).join('/');
const SHA = '3d3c42e5aac5ba805825da76410c181273ba90b1';

test('build asset paths stay within their source and output roots', () => {
  assert.equal(safeAssetPath('assets/icon.png'), 'assets/icon.png');
  assert.equal(safeAssetPath('../image.svg', 'styles'), 'image.svg');
  for (const unsafePath of ['../../outside.html', '/outside.html', 'C:/outside.html', '%2e%2e/%2e%2e/outside.html', '%252e%252e/outside.html', 'bad\\path']) {
    assert.throws(() => safeAssetPath(unsafePath));
  }
});

test('build output contains only required and discovered assets', async () => {
  const dir = await fixture();
  const result = runBuild(dir);
  assert.equal(result.status, 0, result.stderr);

  const output = path.join(dir, 'www');
  const files = (await fs.readdir(output, { recursive: true })).map(toPosix);
  assert.deepEqual(files.sort(), [
    '.nojekyll',
    'app.js',
    'icon.png',
    'images',
    'images/bg.svg',
    'index.html',
    'manifest.json',
    'privacy.html',
    'service-worker.js',
    'site.css',
  ].sort());
  assert.equal(await fs.access(path.join(output, 'unreferenced.txt')).then(() => true, () => false), false);
});

test('build rejects traversal and absolute asset references', async (t) => {
  for (const reference of ['../outside.html', '/outside.html', 'C:/outside.html', '%2e%2e/outside.html']) {
    await t.test(reference, async () => {
      const dir = await fixture({ html: `<img src="${reference}">` });
      const result = runBuild(dir);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Caminho absoluto|Travessia/);
    });
  }

  const dir = await fixture({ css: 'body { background: url("../../outside.svg"); }' });
  const result = runBuild(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Travessia/);
});

test('build rejects a source symlink that escapes the repository', { skip: process.platform === 'win32' }, async () => {
  const dir = await fixture({ html: '<img src="outside.html">' });
  const outside = path.join(os.tmpdir(), `${path.basename(dir)}-outside.html`);
  tempDirs.push(outside);
  await fs.writeFile(outside, '<p>outside</p>');
  await fs.symlink(outside, path.join(dir, 'outside.html'));

  const result = runBuild(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Origem fora dos limites/);
});

test('workflow policy accepts SHA-pinned actions', async () => {
  const result = await runPolicy(`permissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@${SHA}\n      - uses: ./local-action\n`);
  assert.equal(result.status, 0, result.stderr);
});

test('workflow policy rejects mutable refs in every YAML form', async (t) => {
  const forms = {
    'plain list item': '      - uses: actions/checkout@v4',
    'quoted key': '      - "uses": actions/checkout@v4',
    'single-quoted key and value': "      - 'uses': 'actions/checkout@v4'",
    'inline mapping': '      - { uses: actions/checkout@v4 }',
    'key not first in step': `      - name: x\n        uses: actions/checkout@v4`,
    'unpinned docker image': '      - uses: docker://alpine:3',
  };
  for (const [label, step] of Object.entries(forms)) {
    await t.test(label, async () => {
      const result = await runPolicy(`permissions:\n  contents: read\njobs:\n  a:\n    steps:\n${step}\n`);
      assert.notEqual(result.status, 0, `${label} should fail`);
      assert.match(result.stderr, /not pinned/);
    });
  }
});

test('workflow policy requires top-level permissions', async () => {
  const result = await runPolicy(`jobs:\n  a:\n    steps:\n      - uses: actions/checkout@${SHA}\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /top-level permissions/);
});

test('workflow policy decodes unicode-escaped keys', async () => {
  // A chave "u\0073es" decodifica para "uses" no YAML: o parser precisa enxerga-la.
  const result = await runPolicy(`permissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - "u\\u0073es": actions/checkout@v4\n`);
  assert.notEqual(result.status, 0, 'unicode-escaped uses key should fail');
  assert.match(result.stderr, /not pinned/);
});

test('workflow policy ignores permissions text inside multiline scalars', async () => {
  // A linha fisica "permissions: read" esta dentro do scalar `name`, nao no mapa raiz.
  // Nos dois casos (parser estrito ou leniente) o gate falha (fail-closed).
  const result = await runPolicy(`name: "build\npermissions: read\ncontinue"\njobs:\n  a:\n    steps:\n      - uses: actions/checkout@${SHA}\n`);
  assert.notEqual(result.status, 0, 'multiline scalar must not satisfy root permissions');
  assert.match(result.stderr, /top-level permissions|invalid YAML/);
});

test('workflow policy resolves YAML aliases and merge keys', async (t) => {
  const cases = {
    'alias value': `permissions:\n  contents: read\nx-ref: &ref actions/checkout@v4\njobs:\n  a:\n    steps:\n      - uses: *ref\n`,
    'merge key': `permissions:\n  contents: read\nx-step: &step\n  uses: actions/checkout@v4\njobs:\n  a:\n    steps:\n      - <<: *step\n        name: x\n`,
    'non-string uses': `permissions:\n  contents: read\njobs:\n  a:\n    steps:\n      - uses: [actions/checkout@v4]\n`,
  };
  for (const [label, yaml] of Object.entries(cases)) {
    await t.test(label, async () => {
      const result = await runPolicy(yaml);
      assert.notEqual(result.status, 0, `${label} should fail`);
      assert.match(result.stderr, /not pinned/);
    });
  }
});

test('Android FileProvider only exposes CACHE/shared/', async () => {
  const xml = await fs.readFile(path.join(ROOT, 'android/app/src/main/res/xml/file_paths.xml'), 'utf8');
  // Só elementos auto-fechados (<tag ... />) contam como caminho; comentários XML não casam.
  const entries = [...xml.matchAll(/<([\w-]+)\b([^>]*)\/>/g)].map(([, tag, attrs]) => ({ tag, attrs }));
  assert.equal(entries.length, 1, 'file_paths.xml must declare exactly one path');
  assert.equal(entries[0].tag, 'cache-path', 'only cache-path is allowed (no external/files/root paths)');
  assert.match(entries[0].attrs, /\bpath="shared\/"/);
  assert.doesNotMatch(xml, /<(external|external-files|external-cache|files|root|external-media)-path\b/);

  const native = await fs.readFile(path.join(ROOT, 'native.js'), 'utf8');
  assert.match(native, /const SHARE_DIRECTORY = 'shared';/);
  assert.match(native, /path: `\$\{SHARE_DIRECTORY\}\/\$\{nome\}`, data, directory: 'CACHE', recursive: true/);
});

test('CSP restricts scripts, frames, workers, objects, and base URLs', async () => {
  const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/gi)];
  assert.equal(metas.length, 1, 'exactly one Content-Security-Policy meta tag is required');
  const csp = metas[0][1];
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://s3.tradingview.com",
    "worker-src 'self'",
    'frame-src https://*.tradingview.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]) assert.ok(csp.includes(directive), `Missing CSP directive: ${directive}`);
  assert.doesNotMatch(csp, /'unsafe-eval'/, 'unsafe-eval must not be allowed');
  assert.doesNotMatch(csp, /script-src[^;]*\shttps:(?:\s|;|$)/, 'script-src must not allow any https origin');
  // A meta precisa vir antes de qualquer <script> para valer para todos eles.
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'), 'CSP meta must precede scripts');
});

test('service worker only caches same-origin GETs and rejects external notification URLs', async () => {
  const source = await fs.readFile(path.join(ROOT, 'service-worker.js'), 'utf8');
  assert.match(source, /if \(e\.request\.method !== 'GET'\) return;/);
  assert.match(source, /new URL\(e\.request\.url\)\.origin !== self\.location\.origin/);

  const listeners = {};
  let openedUrl;
  const context = {
    URL,
    clients: {
      matchAll: async () => [],
      openWindow: async (url) => { openedUrl = url; },
    },
    self: {
      location: { href: 'https://app.example/index.html', origin: 'https://app.example' },
      addEventListener: (type, listener) => { listeners[type] = listener; },
    },
  };
  vm.runInNewContext(source, context);
  let completed;
  listeners.notificationclick({
    notification: { data: { url: 'https://attacker.example/' }, close() {} },
    waitUntil: (promise) => { completed = promise; },
  });
  await completed;
  assert.equal(openedUrl, './');

  listeners.notificationclick({
    notification: { data: { url: '/portfolio' }, close() {} },
    waitUntil: (promise) => { completed = promise; },
  });
  await completed;
  assert.equal(openedUrl, 'https://app.example/portfolio');
});

test('service worker caches runtime responses in dev mode so offline works before a build', async () => {
  // Sem BUILD_ID de build (raiz do repositório, BUILD_ID = 'dev') o SW usava só
  // rede e nada era guardado: a segunda abertura offline abria em branco.
  const source = await fs.readFile(path.join(ROOT, 'service-worker.js'), 'utf8');
  const store = new Map();
  const cache = {
    addAll: async () => {},
    put: async (req, res) => { store.set(typeof req === 'string' ? req : req.url, res); },
    keys: async () => [...store.keys()],
  };
  const listeners = {};
  const okResponse = { ok: true, clone: () => ({ ok: true }) };
  let online = true;

  const context = {
    URL,
    caches: {
      open: async () => cache,
      match: async (req) => store.get(typeof req === 'string' ? req : req.url),
      keys: async () => [],
      delete: async () => true,
    },
    clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
    fetch: async () => { if (!online) throw new Error('offline'); return okResponse; },
    self: {
      location: { href: 'https://app.example/index.html', origin: 'https://app.example' },
      addEventListener: (type, listener) => { listeners[type] = listener; },
      skipWaiting: async () => {},
    },
  };
  vm.runInNewContext(source, context, { filename: 'service-worker.js' });

  const request = { method: 'GET', url: 'https://app.example/app.js', mode: 'no-cors' };
  let response;
  listeners.fetch({ request, respondWith: (promise) => { response = promise; } });
  await response;
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.ok(store.has('https://app.example/app.js'), 'dev mode must cache the fetched file');

  online = false;
  listeners.fetch({ request, respondWith: (promise) => { response = promise; } });
  assert.equal(await response, store.get('https://app.example/app.js'), 'offline must fall back to the cache');
});

// ---- DOM XSS em app.js: texto do DOM ou de API nunca vira HTML (alertas CodeQL "DOM text reinterpreted as HTML") ----
// app.js e um script de navegador (12 mil linhas, sem exports): as funcoes puras sao extraidas pelo nome e rodadas num vm.
function extrairFuncao(codigo, nome) {
  const ini = codigo.indexOf(`function ${nome}(`);
  assert.notEqual(ini, -1, `funcao ${nome} nao encontrada em app.js`);
  let i = codigo.indexOf('{', ini);
  let fundo = 0;
  for (let j = i; j < codigo.length; j++) {
    if (codigo[j] === '{') fundo++;
    else if (codigo[j] === '}' && --fundo === 0) return codigo.slice(ini, j + 1);
  }
  throw new Error(`funcao ${nome} sem fim`);
}

async function moedaDoApp() {
  const codigo = await fs.readFile(path.join(ROOT, 'app.js'), 'utf8');
  const tabela = codigo.match(/const CURRENCIES = \[[\s\S]*?\];/)[0];
  const seguro = codigo.match(/const CODIGO_MOEDA_SEGURO = [^;]+;/)[0];
  const contexto = vm.createContext({});
  vm.runInContext([tabela, seguro, extrairFuncao(codigo, 'escapeHtml'), extrairFuncao(codigo, 'currency'), extrairFuncao(codigo, 'fmtMoney'),
    'this.currency = currency; this.fmtMoney = fmtMoney; this.escapeHtml = escapeHtml;'].join('\n'), contexto);
  return { contexto, codigo };
}

test('DOM XSS: moeda desconhecida (de <select> ou de API) nunca chega crua ao HTML', async () => {
  const { contexto } = await moedaDoApp();
  const hostis = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', "'+alert(1)+'", 'US$<b>', 'brl', 'USD ', '', null, undefined, '<svg/onload=alert(1)>'];
  for (const h of hostis) {
    const c = contexto.currency(h);
    assert.doesNotMatch(c.symbol, /[<>"'&]/, `symbol com caractere de HTML para ${JSON.stringify(h)}`);
    assert.match(contexto.fmtMoney(1234.5, h), /^[^<>"'&]*$/, `fmtMoney devolveu HTML para ${JSON.stringify(h)}`);
    assert.ok(contexto.fmtMoney(1234.5, h).startsWith('¤'), 'codigo invalido vira o simbolo neutro');
  }
});

test('DOM XSS: moedas conhecidas e codigos validos continuam formatando como antes', async () => {
  const { contexto } = await moedaDoApp();
  // o app separa o simbolo do numero com espaco NAO separavel (U+00A0), de proposito
  assert.equal(contexto.fmtMoney(1234.5, 'BRL'), 'R$ 1.234,50');
  assert.equal(contexto.fmtMoney(1234.5, 'USD'), 'US$ 1.234,50');
  assert.equal(contexto.fmtMoney(1234, 'JPY'), '¥ 1.234');
  assert.equal(contexto.fmtMoney(1234.5, 'USDT'), 'USDT 1.234,50', 'codigo de 4 letras (cripto) continua aceito');
  assert.equal(contexto.currency('USDT').decimals, 2);
});

test('DOM XSS: escapeHtml cobre os cinco caracteres perigosos', async () => {
  const { contexto } = await moedaDoApp();
  assert.equal(contexto.escapeHtml('<a href="x" onclick=\'y\'>&</a>'), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});

test('DOM XSS: os cinco pontos de innerHTML do alerta escapam o que vem do DOM ou de API (guarda de regressao)', async () => {
  const { codigo } = await moedaDoApp();
  const proibidos = [
    ['erro da previa de compra', '<div class="amount-out">${r.error}</div>'],
    ['data da cotacao na previa de compra', ".replace('{data}', r.priceDate || '')"],
    ['chave de traducao montada com o <select>', ".replace('{b}', t('cmp.b.' + comparar))"],
    ['data do <input> no historico', ".replace('{d}', data.split('-').reverse().join('/'))"],
    ['codigo de moeda cru', "{ code, symbol: code + ' ', decimals: 2 }"],
  ];
  for (const [rotulo, trecho] of proibidos) assert.ok(!codigo.includes(trecho), `regrediu (${rotulo}): ${trecho}`);
  const exigidos = [
    '<div class="amount-out">${escapeHtml(r.error)}</div>',
    ".replace('{data}', escapeHtml(r.priceDate || ''))",
    ".replace('{b}', escapeHtml(t('cmp.b.' + comparar)))",
    ".replace('{d}', escapeHtml(data.split('-').reverse().join('/')))",
    'return escapeHtml(c.symbol.trimEnd())',
  ];
  for (const trecho of exigidos) assert.ok(codigo.includes(trecho), `falta a protecao: ${trecho}`);
});

test('DOM XSS: o alvo do resolver (valor de <input radio>) so aceita a lista fechada e o HTML escapa', async () => {
  const codigo = await fs.readFile(path.join(ROOT, 'app.js'), 'utf8');
  const lista = codigo.match(/const ALVOS_RESOLVER = \[([^\]]+)\];/);
  assert.ok(lista, 'ALVOS_RESOLVER precisa existir');
  const alvos = lista[1].split(',').map((x) => x.trim().replace(/['"]/g, '')).sort();
  assert.deepEqual(alvos, ['fv', 'i', 'n', 'pmt', 'pv'], 'lista fechada de alvos');
  // os valores dos radios gerados na tela sao exatamente estes
  const radios = codigo.match(/\{ pv: 'pv', pmt: 'pmt', rate: 'i', term: 'n', fv: 'fv' \}/);
  assert.ok(radios, 'mapa dos radios do resolver mudou: atualize ALVOS_RESOLVER');
  // as duas leituras do radio passam pela validacao; nenhuma le .value cru do radio marcado
  assert.equal((codigo.match(/input\[name="solveFor"\]:checked'\)\.value/g) || []).length, 0, 'leitura crua do radio marcado');
  assert.ok(codigo.includes('const alvo = alvoDoResolver();'));
  // o sink escapa a chave de traducao montada com o alvo, o texto e o extra
  for (const trecho of ["${escapeHtml(t('calc.f.' + alvo))}", '${escapeHtml(texto)}', '${escapeHtml(extra)}']) {
    assert.ok(codigo.includes(trecho), `falta o escape: ${trecho}`);
  }
  // simulacao da validacao com entradas hostis
  const valida = (v) => (['fv', 'pv', 'pmt', 'n', 'i'].includes(v) ? v : 'fv');
  for (const hostil of ['<img src=x onerror=alert(1)>', '"><script>', '', 'FV', ' pv', '__proto__', 'constructor']) assert.equal(valida(hostil), 'fv');
});

test('DOM XSS: a pagina de teste legado escapa o textContent antes do innerHTML', async () => {
  const html = await fs.readFile(path.join(ROOT, 'tools/legacy-tests/test-nav-icons.html'), 'utf8');
  assert.ok(!html.includes("subtabTitle.textContent : 'NÃO'"), 'textContent cru em innerHTML');
  assert.ok(html.includes('esc(subtabTitle.textContent)'), 'o titulo precisa passar por esc()');
  // o escape da pagina trata os 5 caracteres
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  assert.equal(esc('<b onclick="x">&\'</b>'), '&lt;b onclick=&quot;x&quot;&gt;&amp;&#39;&lt;/b&gt;');
});
