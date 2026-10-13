import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
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
