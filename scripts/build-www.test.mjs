import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./build-www.mjs', import.meta.url));
const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function fixture({ html, css = 'body { background: url("images/bg.svg"); }', linkedFile = true } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'build-www-'));
  tempDirs.push(dir);
  await fs.mkdir(path.join(dir, 'scripts'), { recursive: true });
  await fs.mkdir(path.join(dir, 'vendor'), { recursive: true });
  await fs.mkdir(path.join(dir, 'images'), { recursive: true });
  await fs.mkdir(path.join(dir, 'scripts-assets'), { recursive: true });
  await fs.copyFile(SCRIPT, path.join(dir, 'scripts', 'build-www.mjs'));
  await fs.writeFile(path.join(dir, 'index.html'), html ?? '<link rel="stylesheet" href="site.css"><script src="app.js"></script>');
  await fs.writeFile(path.join(dir, 'site.css'), css);
  await fs.writeFile(path.join(dir, 'app.js'), 'window.app = true;');
  await fs.writeFile(path.join(dir, 'images', 'bg.svg'), '<svg/>');
  await fs.writeFile(path.join(dir, 'icon.png'), 'icon');
  await fs.writeFile(path.join(dir, 'privacy.html'), '<p>privacy</p>');
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify({ icons: [{ src: 'icon.png' }] }));
  await fs.writeFile(path.join(dir, 'service-worker.js'), 'const BUILD_ID = "dev"; /*__BUILD_ID__*/\nconst ASSETS = []; /*__ASSETS__*/');
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ version: '1.0.0' }));
  await fs.writeFile(path.join(dir, 'vendor', 'LICENSE-chartjs.md'), 'license');
  await fs.writeFile(path.join(dir, 'vendor', 'LICENSE-chartjs-plugin-datalabels.md'), 'license');
  if (linkedFile) await fs.writeFile(path.join(dir, 'unreferenced.txt'), 'not for publishing');
  return dir;
}

function runBuild(dir) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'build-www.mjs')], { encoding: 'utf8' });
}

test('build output contains only discovered and required artifacts', async () => {
  const dir = await fixture();
  const result = runBuild(dir);
  assert.equal(result.status, 0, result.stderr);

  const output = path.join(dir, 'www');
  const files = [];
  async function collect(folder, prefix = '') {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const rel = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) await collect(path.join(folder, entry.name), rel);
      else files.push(rel);
    }
  }
  await collect(output);
  assert.deepEqual(files.sort(), [
    '.nojekyll',
    'app.js',
    'icon.png',
    'images/bg.svg',
    'index.html',
    'manifest.json',
    'privacy.html',
    'service-worker.js',
    'site.css',
    'vendor/LICENSE-chartjs-plugin-datalabels.md',
    'vendor/LICENSE-chartjs.md',
  ].sort());
  assert.equal(await fs.access(path.join(output, 'unreferenced.txt')).then(() => true, () => false), false);
});

test('rejects traversal and absolute HTML references', async (t) => {
  for (const reference of ['../outside.html', '/outside.html']) {
    await t.test(reference, async () => {
      const dir = await fixture({ html: `<img src="${reference}">` });
      const result = runBuild(dir);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Travessia|inválido|limites/);
    });
  }
});

test('rejects CSS traversal and malformed references', async (t) => {
  for (const css of ['body { background: url("../outside.svg"); }', 'body { background: url("image.svg"; }']) {
    await t.test(css, async () => {
      const dir = await fixture({ css });
      const result = runBuild(dir);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Travessia|malformada|inválido|limites/);
    });
  }
});

test('rejects a source symlink that escapes the repository', async () => {
  const dir = await fixture({ html: '<img src="outside.html">' , linkedFile: false });
  const outside = path.join(path.dirname(dir), 'outside.html');
  await fs.writeFile(outside, '<p>outside</p>');
  tempDirs.push(outside);
  await fs.symlink(outside, path.join(dir, 'outside.html'));
  const result = runBuild(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Origem fora dos limites/);
});
