import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build, resolveWithin, verifyIntegrity } from '../scripts/build-www.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'www');

test('build paths cannot escape their allowed directory', () => {
  assert.equal(resolveWithin(ROOT, 'assets/icon.png'), path.join(ROOT, 'assets/icon.png'));
  for (const untrustedPath of ['../outside.txt', '../../tmp/evil.js', '/etc/passwd', 'C:\\Windows\\win.ini', 'assets\\..\\outside']) {
    assert.throws(() => resolveWithin(ROOT, untrustedPath));
  }
});

test('web policy permits only required same-origin scripts and service workers', async () => {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/i)?.[1];
  assert.ok(csp, 'Content-Security-Policy meta tag is required');
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://s3.tradingview.com",
    "connect-src 'self' https:",
    "worker-src 'self'",
    'frame-src https://*.tradingview.com',
    "object-src 'none'",
    "base-uri 'self'",
  ]) assert.ok(csp.includes(directive), `Missing CSP directive: ${directive}`);

  const app = await readFile(path.join(ROOT, 'app.js'), 'utf8');
  assert.match(app, /!window\.Capacitor\?\.isNativePlatform\?\.\(\).*location\.protocol !== 'file:'/);
  const sw = await readFile(path.join(ROOT, 'service-worker.js'), 'utf8');
  assert.match(sw, /if \(e\.request\.method !== 'GET'\) return;/);
  assert.match(sw, /new URL\(e\.request\.url\)\.origin !== self\.location\.origin/);
});

test('generated web artifact verifies its hashes and rejects tampering', async () => {
  await build();
  await verifyIntegrity(OUT);

  const asset = path.join(OUT, 'index.html');
  const original = await readFile(asset);
  try {
    await writeFile(asset, Buffer.concat([original, Buffer.from('\n<!-- altered -->')]));
    await assert.rejects(verifyIntegrity(OUT), /integridade/);
  } finally {
    await writeFile(asset, original);
  }
});
