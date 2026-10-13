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
  const body = xml.replace(/<!--[\s\S]*?-->/g, '');
  const entries = [...body.matchAll(/<([\w-]+)\b([^>]*)\/>/g)].map(([, tag, attrs]) => ({ tag, attrs }));
  assert.equal(entries.length, 1, 'file_paths.xml must declare exactly one path');
  assert.equal(entries[0].tag, 'cache-path', 'only cache-path is allowed (no external/files/root paths)');
  assert.match(entries[0].attrs, /\bpath="shared\/"/);
  assert.doesNotMatch(body, /<(external|external-files|external-cache|files|root|external-media)-path\b/);

  const native = await fs.readFile(path.join(ROOT, 'native.js'), 'utf8');
  assert.match(native, /const SHARE_DIRECTORY = 'shared';/);
  assert.match(native, /path: `\$\{SHARE_DIRECTORY\}\/\$\{nome\}`, data, directory: 'CACHE', recursive: true/);
});

// O teste de CSP do index.html fica no PR separado de CSP (issue #5 / antigo PR #12).

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
