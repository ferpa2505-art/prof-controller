import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { safeAssetPath } from './build-www.mjs';
import { compararCsp, extrairCspMetas, lerCsp } from './csp.mjs';
import { calcularVersionCode, validarSequencia } from './android-version.mjs';
import { parseDocument } from 'yaml';

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

test('Android signing setup handles valid and malformed keystore secrets', { skip: process.platform === 'win32' }, async (t) => {
  const workflow = parse(await fs.readFile(path.join(ROOT, '.github/workflows/android.yml'), 'utf8'));
  const script = workflow.jobs.build.steps.find(({ name }) => name === 'Preparar chave de assinatura (se cadastrada)').run;

  for (const { label, secret, signed } of [
    { label: 'valid Base64', secret: 'a2V5', signed: true },
    { label: 'malformed Base64', secret: 'not valid base64', signed: false },
  ]) {
    await t.test(label, async () => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'prof-controller-signing-'));
      tempDirs.push(dir);
      const envFile = path.join(dir, 'github-env');
      await fs.writeFile(envFile, '');

      const result = spawnSync('bash', ['-e', '-c', script], {
        encoding: 'utf8',
        env: { ...process.env, KEYSTORE_B64: secret, RUNNER_TEMP: dir, GITHUB_ENV: envFile },
      });
      assert.equal(result.status, 0, result.stderr);
      const exportedEnv = await fs.readFile(envFile, 'utf8');

      if (signed) {
        assert.match(exportedEnv, new RegExp(`ANDROID_KEYSTORE_PATH=${dir}/upload\\.jks`));
        assert.equal(await fs.readFile(path.join(dir, 'upload.jks'), 'utf8'), 'key');
      } else {
        assert.equal(exportedEnv, '');
        assert.equal(await fs.access(path.join(dir, 'upload.jks')).then(() => true, () => false), false);
        assert.match(result.stdout, /ANDROID_KEYSTORE_BASE64 inválido/);
      }
    });
  }
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

test('versionCode: formula e tabela documentada', () => {
  const tabela = [['1.2.0', 0, 1020000], ['1.2.0', 1, 1020001], ['1.2.1', 0, 1020100], ['1.3.0', 0, 1030000], ['2.0.0', 0, 2000000], ['1.3.2', 0, 1030200], ['1.3.2', 99, 1030299]];
  for (const [versao, build, esperado] of tabela) assert.equal(calcularVersionCode(versao, build), esperado, `${versao} build ${build}`);
});

test('versionCode: recusa versao fora de MAJOR.MINOR.PATCH e build fora de 0 a 99', async (t) => {
  for (const v of ['1.2', '1.2.0-beta', '1.2.0+7', ' 1.2.0', '1.2.0 ', 'v1.2.0', '1.2.x', '1.100.0', '1.2.100', '10000.0.0', '2101.0.0', '']) {
    await t.test(`versao '${v}'`, () => assert.throws(() => calcularVersionCode(v, 0)));
  }
  for (const b of [100, -1, '1e1', '0x1', '', ' 1', 1.5, 'abc']) {
    await t.test(`build '${b}'`, () => assert.throws(() => calcularVersionCode('1.2.0', b), /buildNumber/));
  }
});

test('versionCode: nunca diminui quando a versao sobe, nem entre builds da mesma versao', () => {
  const versoes = ['1.0.0', '1.0.9', '1.0.99', '1.1.0', '1.2.99', '1.3.0', '1.3.2', '1.99.99', '2.0.0'];
  let anterior = 0;
  for (const v of versoes) {
    const primeiro = calcularVersionCode(v, 0);
    const ultimo = calcularVersionCode(v, 99);
    assert.ok(primeiro > anterior, `${v} build 0 (${primeiro}) deve superar ${anterior}`);
    assert.ok(ultimo > primeiro, 'build 99 supera build 0 da mesma versao');
    anterior = ultimo;
  }
});

test('versionCode: rejeita repeticao e reducao em relacao ao ultimo publicado', () => {
  assert.doesNotThrow(() => validarSequencia(1030200, 1030100));
  assert.doesNotThrow(() => validarSequencia(1030201, 1030200));
  assert.doesNotThrow(() => validarSequencia(1030200, undefined)); // sem o ultimo publicado: nao confere (documentado)
  assert.throws(() => validarSequencia(1030200, 1030200), /repete/);
  assert.throws(() => validarSequencia(1030100, 1030200), /MENOR/);
  assert.throws(() => validarSequencia(1030200, 0), /inválido/);
  assert.throws(() => validarSequencia(1030200, 1.5), /inválido/);
  assert.throws(() => validarSequencia(0, 5), /inválido/);
});

test('versionCode: a CLI falha em repeticao/reducao e aceita aumento', () => {
  const rodar = (...args) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'android-version.mjs'), ...args], { encoding: 'utf8' });
  const atual = JSON.parse(execFileSync(process.execPath, ['-e', "console.log(JSON.stringify(require('./package.json').version))"], { cwd: ROOT, encoding: 'utf8' }));
  const codigo = calcularVersionCode(atual, 0);
  assert.equal(rodar('--ultimo', String(codigo)).status, 1, 'repeticao deve falhar');
  assert.equal(rodar('--ultimo', String(codigo + 1)).status, 1, 'reducao deve falhar');
  assert.equal(rodar('--ultimo', String(codigo - 1)).status, 0, 'aumento deve passar');
  assert.equal(rodar('--ultimo', 'abc').status, 1);
  assert.equal(rodar('--build', '100').status, 1);
  assert.equal(rodar('--ultimo', String(codigo - 1)).stdout.includes(String(codigo)), true);
});

test('Android: build.gradle, workflow e docs descrevem o mesmo versionCode', async () => {
  const gradle = await fs.readFile(path.join(ROOT, 'android/app/build.gradle'), 'utf8');
  assert.match(gradle, /\(vMajor \* 1000000L\) \+ \(vMinor \* 10000L\) \+ \(vPatch \* 100L\) \+ vBuild/, 'a formula do Gradle mudou: atualize scripts/android-version.mjs e os docs');
  assert.match(gradle, /System\.getenv\('BUILD_NUMBER'\)/, 'o Gradle precisa ler BUILD_NUMBER');
  const wf = parseDocument(await fs.readFile(path.join(ROOT, '.github/workflows/android.yml'), 'utf8')).toJS();
  assert.ok(wf.on.workflow_dispatch.inputs.build_number, 'o workflow precisa expor o input build_number');
  assert.ok(wf.on.workflow_dispatch.inputs.ultimo_versioncode, 'o workflow precisa expor o input ultimo_versioncode');
  const env = wf.jobs.build.env;
  assert.match(String(env.BUILD_NUMBER), /inputs\.build_number/, 'BUILD_NUMBER vem do input');
  assert.ok(!('VERSION_CODE' in env), 'VERSION_CODE (numero da execucao) nao pode voltar: o Gradle nao o usa');
  assert.ok(wf.jobs.build.steps.some((s) => String(s.run ?? '').includes('scripts/android-version.mjs')), 'o workflow precisa conferir o versionCode');
  // entradas do usuario nunca entram direto no shell: passam por variavel de ambiente
  assert.ok(!/\$\{\{\s*inputs\./.test(wf.jobs.build.steps.map((s) => String(s.run ?? '')).join('\n')), 'inputs nao podem ser interpolados em run:');
  const docs = await fs.readFile(path.join(ROOT, 'docs/PUBLICAR-ANDROID.md'), 'utf8');
  assert.doesNotMatch(docs, /versionCode[^\n]*número da execução/i, 'o doc nao pode dizer que o versionCode e o numero da execucao');
  const checklist = await fs.readFile(path.join(ROOT, 'docs/RELEASE-CHECKLIST.md'), 'utf8');
  assert.doesNotMatch(checklist, /use `BUILD_NUMBER=1\.\.99`/, 'o checklist nao pode citar BUILD_NUMBER sem input no workflow');
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

const DEPLOY_STEP = `      - id: d\n        uses: actions/deploy-pages@${SHA}\n`;
const pagesWorkflow = (jobExtra = '', env = '    environment:\n      name: github-pages\n') =>
  `permissions:\n  contents: read\non:\n  workflow_dispatch:\njobs:\n  deploy:\n${jobExtra}${env}    runs-on: ubuntu-latest\n    steps:\n${DEPLOY_STEP}`;

test('workflow policy requires the main-only guard on the Pages deploy job', async (t) => {
  const ok = await runPolicy(pagesWorkflow("    if: github.ref == 'refs/heads/main'\n"));
  assert.equal(ok.status, 0, ok.stderr);
  const okExpr = await runPolicy(pagesWorkflow("    if: ${{ github.ref == 'refs/heads/main' }}\n"));
  assert.equal(okExpr.status, 0, okExpr.stderr);
  const ruins = {
    'no guard': '',
    'other branch': "    if: github.ref == 'refs/heads/develop'\n",
    'negated': "    if: github.ref != 'refs/heads/main'\n",
    'substring match': "    if: contains(github.ref, 'main')\n",
    'always': '    if: always()\n',
    'or with true': "    if: github.ref == 'refs/heads/main' || true\n",
    'prefix trick': "    if: github.ref == 'refs/heads/main-evil'\n",
    'non-string': '    if: true\n',
  };
  for (const [label, guard] of Object.entries(ruins)) {
    await t.test(label, async () => {
      const r = await runPolicy(pagesWorkflow(guard));
      assert.notEqual(r.status, 0, `${label} should fail`);
      assert.match(r.stderr, /must be guarded by if: github\.ref == 'refs\/heads\/main'/);
    });
  }
});

test('workflow policy finds the Pages deploy job by environment or by action, in any YAML form', async () => {
  const porAcao = await runPolicy(`permissions:\n  contents: read\njobs:\n  publicar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/deploy-pages@${SHA}\n`);
  assert.notEqual(porAcao.status, 0, 'deploy-pages without guard should fail');
  const porAmbienteTexto = await runPolicy(`permissions:\n  contents: read\njobs:\n  publicar:\n    environment: github-pages\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo oi\n`);
  assert.notEqual(porAmbienteTexto.status, 0, 'github-pages environment without guard should fail');
  const outroJob = await runPolicy(`permissions:\n  contents: read\njobs:\n  testar:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo oi\n`);
  assert.equal(outroJob.status, 0, outroJob.stderr);
});

test('the real workflows pass the policy and pages.yml guards every job to main', async () => {
  const real = spawnSync(process.execPath, [POLICY_SCRIPT], { encoding: 'utf8' });
  assert.equal(real.status, 0, real.stderr);
  const yaml = await fs.readFile(path.join(ROOT, '.github', 'workflows', 'pages.yml'), 'utf8');
  const guards = yaml.match(/if: github\.ref == 'refs\/heads\/main'/g) ?? [];
  assert.equal(guards.length, 3, 'build, deploy e verificar devem ter a guarda de main');
});


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

