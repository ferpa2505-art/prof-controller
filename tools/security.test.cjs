const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const policy = require('../navigation-policy.js');

const root = path.join(__dirname, '..');

test('main document declares explicit restrictive CSP directives', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/i)?.[1];
  assert.ok(csp);
  for (const directive of ['script-src', 'connect-src', 'img-src', 'frame-src']) {
    assert.match(csp, new RegExp(`(?:^|; )${directive} `));
  }
  assert.doesNotMatch(csp, /(?:^|; )(?:script-src|connect-src|img-src|frame-src) [^;]*\bhttps:\s*(?:;|$)/);
  assert.doesNotMatch(html, /<script>\s*[\s\S]*?<\/script>/i);
});

test('external navigation only accepts approved HTTPS destinations', () => {
  const appUrl = 'https://ferpa2505-art.github.io/prof-controller/';
  assert.equal(policy.isApprovedExternalUrl('https://finance.yahoo.com/quote/AAPL', appUrl), true);
  assert.equal(policy.isApprovedExternalUrl('http://finance.yahoo.com/quote/AAPL', appUrl), false);
  assert.equal(policy.isApprovedExternalUrl('https://finance.yahoo.com.attacker.example/', appUrl), false);
  assert.equal(policy.isApprovedExternalUrl('https://attacker.example/', appUrl), false);
  assert.equal(policy.isApprovedExternalUrl('https://user@finance.yahoo.com/', appUrl), false);
});

test('service worker opens only same-origin notification URLs and falls back safely', async () => {
  const handlers = {};
  const opened = [];
  const workerLocation = {
    href: 'https://app.example.test/prof/service-worker.js',
    origin: 'https://app.example.test'
  };
  const self = {
    location: workerLocation,
    ProfNavigationPolicy: policy,
    addEventListener: (name, handler) => { handlers[name] = handler; }
  };
  const context = {
    self,
    importScripts() {},
    clients: {
      matchAll: async () => [],
      openWindow: async (url) => { opened.push(url); }
    },
    caches: {},
    console
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);

  async function click(url) {
    let wait;
    handlers.notificationclick({
      notification: { data: { url }, close() {} },
      waitUntil: (promise) => { wait = promise; }
    });
    await wait;
    return opened.pop();
  }

  assert.equal(await click('/prof/settings'), 'https://app.example.test/prof/settings');
  assert.equal(await click('https://attacker.example/login'), 'https://app.example.test/prof/');
  assert.equal(await click('javascript:alert(1)'), 'https://app.example.test/prof/');
  assert.equal(await click(undefined), 'https://app.example.test/prof/');
  assert.equal(await click(''), 'https://app.example.test/prof/');
});
