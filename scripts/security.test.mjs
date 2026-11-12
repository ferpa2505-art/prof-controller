import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { safeAssetPath } from './build-www.mjs';
import { compararCsp, extrairCspMetas, lerCsp } from './csp.mjs';

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

// A CSP aprovada, EXATAMENTE. Mudar qualquer fonte exige mudar este teste (e justificar a origem e a diretiva no PR).
// Riscos residuais conhecidos e aceitos por ora: script-src com 'unsafe-inline' (o app tem scripts e handlers inline),
// e img-src/connect-src com https: (feeds de noticias e cotacoes de origens variadas). Nao ampliar alem disto.
const CSP_ESPERADA = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://s3.tradingview.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https:'],
  'frame-src': ['https://*.tradingview.com'],
  'worker-src': ["'self'"],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

test('CSP: uma unica meta, igual a politica aprovada (sem fontes ou diretivas extras)', async () => {
  const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const metas = extrairCspMetas(html);
  assert.equal(metas.length, 1, 'exatamente uma meta Content-Security-Policy (em qualquer ordem de atributos ou aspas)');
  assert.deepEqual(compararCsp(metas[0], CSP_ESPERADA), []);
  const { diretivas } = lerCsp(metas[0]);
  assert.ok(!metas[0].includes("'unsafe-eval'"), 'unsafe-eval nao pode entrar');
  assert.ok(!(diretivas.get('script-src') ?? []).some((f) => f === '*' || f === 'https:' || f === 'data:' || f === 'http:'), 'script-src nao pode aceitar curinga, https:, http: nem data:');
  // A meta precisa vir antes de qualquer <script> para valer para todos eles.
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'), 'CSP meta must precede scripts');
});

test('CSP: o leitor acha metas em qualquer forma (ordem, aspas, caixa, quebra de linha) e ignora comentarios', () => {
  const P = "default-src 'self'";
  const formas = {
    'ordem padrao': `<meta http-equiv="Content-Security-Policy" content="${P}">`,
    'content antes de http-equiv': `<meta content="${P}" http-equiv="Content-Security-Policy">`,
    // dentro de aspas simples a politica nao pode conter 'self': usa-se uma sem aspas internas
    'caixa diferente': `<META HTTP-EQUIV="content-security-policy" CONTENT="${P}">`,
    'quebra de linha entre atributos': `<meta\n  http-equiv="Content-Security-Policy"\n  content="${P}"\n>`,
    'auto-fechada': `<meta http-equiv="Content-Security-Policy" content="${P}" />`,
    'outros atributos no meio': `<meta name="x" http-equiv="Content-Security-Policy" data-a="1" content="${P}">`,
    'http-equiv sem aspas': `<meta http-equiv=Content-Security-Policy content="${P}">`,
  };
  for (const [rotulo, tag] of Object.entries(formas)) {
    assert.deepEqual(extrairCspMetas(`<head>${tag}</head>`), [P], rotulo);
  }
  assert.deepEqual(extrairCspMetas("<meta http-equiv='Content-Security-Policy' content='img-src data:'>"), ['img-src data:'], 'aspas simples');
  // duas metas, a segunda disfarcada (ordem e aspas diferentes): as duas precisam ser vistas
  const duas = `<meta http-equiv="Content-Security-Policy" content="${P}"><meta content='script-src *' HTTP-EQUIV='Content-Security-Policy'>`;
  assert.equal(extrairCspMetas(duas).length, 2);
  // nao conta: comentario, outra meta, report-only (o navegador nao aplica em meta), '>' dentro do valor nao fecha a tag
  assert.deepEqual(extrairCspMetas(`<!-- <meta http-equiv="Content-Security-Policy" content="${P}"> -->`), []);
  // comentario: fechos que o HTML aceita (--!>, <!-->, <!--->), comentario sem fim e o primeiro --> que fecha de verdade
  const meta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">';
  assert.deepEqual(extrairCspMetas(`<!-- a --!> ${meta}`), ["default-src 'self'"], 'fecho --!> encerra o comentario e a meta seguinte vale');
  assert.deepEqual(extrairCspMetas(`<!--> ${meta}`), ["default-src 'self'"], '<!--> e um comentario vazio');
  assert.deepEqual(extrairCspMetas(`<!---> ${meta}`), ["default-src 'self'"], '<!---> e um comentario vazio');
  assert.deepEqual(extrairCspMetas(`<!-- aberto sem fim ${meta}`), [], 'comentario sem fim engole o resto');
  assert.deepEqual(extrairCspMetas(`<!-- <!-- x --> ${meta}`), ["default-src 'self'"], 'o primeiro --> fecha; nao ha comentario aninhado');
  assert.deepEqual(extrairCspMetas(`<!-- ${meta} --> ${meta}`).length, 1, 'so a meta fora do comentario conta');
  assert.deepEqual(extrairCspMetas('<meta name="viewport" content="width=device-width">'), []);
  assert.deepEqual(extrairCspMetas(`<meta http-equiv="Content-Security-Policy-Report-Only" content="${P}">`), []);
  assert.deepEqual(extrairCspMetas('<meta http-equiv="Content-Security-Policy" content="img-src a>b">'), ['img-src a>b']);
});

test('CSP: a comparacao e exata e acusa fonte extra, diretiva extra, falta e repeticao', () => {
  const base = "default-src 'self'; object-src 'none'";
  const esperada = { 'default-src': ["'self'"], 'object-src': ["'none'"] };
  assert.deepEqual(compararCsp(base, esperada), []);
  assert.deepEqual(compararCsp("object-src 'none'; default-src 'self'", esperada), [], 'a ordem das diretivas nao importa');
  assert.match(compararCsp("default-src 'self' https://evil.example; object-src 'none'", esperada).join(), /não autorizada.*evil\.example/);
  // o caso que a checagem por substring deixava passar: a diretiva esperada continua la, com uma fonte a mais
  assert.match(compararCsp("default-src 'self' *; object-src 'none'", esperada).join(), /não autorizada/);
  assert.match(compararCsp("default-src 'self'; object-src 'none'; script-src https:", esperada).join(), /não prevista: script-src/);
  assert.match(compararCsp("default-src 'self'", esperada).join(), /falta a diretiva object-src/);
  assert.match(compararCsp("default-src 'self'; object-src 'none'; object-src *", esperada).join(), /repetida: object-src/);
  assert.match(compararCsp("default-src; object-src 'none'", esperada).join(), /perdeu/);
});

test('CSP: o leitor e a comparacao funcionam sobre o index.html real e acusam um index.html enfraquecido', async () => {
  const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const enfraquecido = html.replace("script-src 'self'", "script-src 'self' https://cdn.evil.example");
  assert.notEqual(enfraquecido, html, 'o fixture precisa alterar o HTML');
  const problemas = compararCsp(extrairCspMetas(enfraquecido)[0], CSP_ESPERADA);
  assert.match(problemas.join(), /script-src permite fonte\(s\) não autorizada\(s\): https:\/\/cdn\.evil\.example/);
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
