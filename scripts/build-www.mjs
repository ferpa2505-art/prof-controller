#!/usr/bin/env node
// Monta a pasta www/ só com o que o app precisa para rodar.
//
// É essa pasta (e não a raiz do repositório) que vai para:
//   - o GitHub Pages            (workflow .github/workflows/pages.yml)
//   - o app Android e iOS       (Capacitor, webDir = "www")
//   - o app Windows/Electron    (electron-builder)
//
// O que o script faz:
//   1. Lê o index.html e copia todo arquivo local que ele carrega (CSS, JS, imagens).
//   2. Lê cada CSS copiado e copia as imagens/fontes que ele usa (url(...)).
//   3. Copia manifest, ícones do manifest, política de privacidade e service worker.
//   4. Calcula um BUILD_ID a partir do conteúdo de tudo e grava no service worker,
//      junto com a lista de arquivos para funcionar offline desde a primeira abertura.
//
// Uso:  node scripts/build-www.mjs      (ou: npm run build)
// Sem dependências externas: só Node 18+.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'www');

export function resolveWithin(base, rel) {
  if (typeof rel !== 'string' || !rel || rel.includes('\0') || rel.includes('\\') || path.isAbsolute(rel)) {
    throw new Error(`Caminho inválido: ${rel}`);
  }
  const resolved = path.resolve(base, rel);
  const relative = path.relative(base, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || relative === '') {
    throw new Error(`Caminho fora do diretório permitido: ${rel}`);
  }
  return resolved;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function listFiles(dir, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Link simbólico inesperado no artefato: ${rel}`);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(dir, entry.name), rel));
    else if (entry.isFile()) files.push(rel);
  }
  return files.sort();
}

export async function verifyIntegrity(directory) {
  const manifestPath = resolveWithin(directory, 'asset-integrity.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
    throw new Error('Manifesto de integridade inválido.');
  }

  const entries = Object.entries(manifest);
  for (const [rel, expected] of entries) {
    if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error(`Hash inválido no manifesto: ${rel}`);
    const actual = sha256(await fs.readFile(resolveWithin(directory, rel)));
    if (actual !== expected) throw new Error(`Falha de integridade no artefato: ${rel}`);
  }

  const actualFiles = await listFiles(directory);
  const expectedFiles = [...entries.map(([rel]) => rel), 'asset-integrity.json'].sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error('Arquivos do artefato não correspondem ao manifesto de integridade.');
  }
}

// Arquivos que sempre entram, mesmo que o index.html não os cite diretamente.
const SEMPRE = [
  'index.html',
  'privacy.html',
  'manifest.json',
  'service-worker.js',
  'vendor/LICENSE-chartjs.md',
  'vendor/LICENSE-chartjs-plugin-datalabels.md',
];

const isLocal = (u) => u && !/^(?:[a-z]+:)?\/\//i.test(u) && !/^(data|blob|mailto|tel|javascript):/i.test(u) && !u.startsWith('#');
const semQuery = (u) => u.split('#')[0].split('?')[0];

async function existe(rel) {
  const file = resolveWithin(ROOT, rel);
  try { await fs.access(file); return true; } catch { return false; }
}

function refsHtml(html) {
  const out = new Set();
  const re = /<(?:link|script|img|source)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) if (isLocal(m[1])) out.add(semQuery(m[1]));
  return out;
}

function refsCss(css, cssRel) {
  const out = new Set();
  const re = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  let m;
  while ((m = re.exec(css))) {
    if (!isLocal(m[1])) continue;
    out.add(path.posix.normalize(path.posix.join(path.posix.dirname(cssRel), semQuery(m[1]))));
  }
  return out;
}

export async function build() {
  const arquivos = new Set();
  const faltando = [];

  for (const f of SEMPRE) if (await existe(f)) arquivos.add(f);

  const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  for (const r of refsHtml(html)) arquivos.add(r);

  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.json'), 'utf8'));
  for (const i of [...(manifest.icons || []), ...(manifest.screenshots || [])]) arquivos.add(semQuery(i.src));
  for (const s of manifest.shortcuts || []) for (const i of s.icons || []) arquivos.add(semQuery(i.src));

  // CSS pode puxar imagens; repete até não aparecer nada novo.
  const cssVistos = new Set();
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const f of [...arquivos]) {
      if (!f.endsWith('.css') || cssVistos.has(f)) continue;
      cssVistos.add(f);
      if (!(await existe(f))) continue;
      for (const r of refsCss(await fs.readFile(path.join(ROOT, f), 'utf8'), f)) {
        if (!arquivos.has(r)) { arquivos.add(r); mudou = true; }
      }
    }
  }

  for (const f of arquivos) if (!(await existe(f))) faltando.push(f);
  if (faltando.length) {
    console.error('\n✖ Arquivos citados pelo app que não existem no repositório:');
    for (const f of faltando) console.error('   - ' + f);
    console.error('\nCorrija os caminhos (ou crie os arquivos) e rode o build de novo.\n');
    process.exit(1);
  }

  await fs.rm(OUT, { recursive: true, force: true });
  const hash = crypto.createHash('sha256');
  const lista = [...arquivos].sort();

  for (const f of lista) {
    const dest = resolveWithin(OUT, f);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const buf = await fs.readFile(resolveWithin(ROOT, f));
    if (f !== 'service-worker.js') hash.update(f).update(buf);
    await fs.writeFile(dest, buf);
  }

  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const buildId = `${pkg.version}-${hash.digest('hex').slice(0, 10)}`;
  const precache = ['./', ...lista.filter((f) => f !== 'service-worker.js' && !f.endsWith('.md')).map((f) => './' + f)];

  const swPath = path.join(OUT, 'service-worker.js');
  let sw = await fs.readFile(swPath, 'utf8');
  const antes = sw;
  sw = sw.replace(/const BUILD_ID = [^;]+; \/\*__BUILD_ID__\*\//, `const BUILD_ID = ${JSON.stringify(buildId)};`);
  sw = sw.replace(/const ASSETS = \[[^\]]*\]; \/\*__ASSETS__\*\//, `const ASSETS = ${JSON.stringify(precache, null, 2)};`);
  if (sw === antes || sw.includes('__BUILD_ID__') || sw.includes('__ASSETS__')) {
    console.error('✖ Não encontrei os marcadores __BUILD_ID__/__ASSETS__ no service-worker.js.');
    process.exit(1);
  }
  await fs.writeFile(swPath, sw);

  // Evita que o GitHub Pages ignore pastas/arquivos que começam com "_".
  await fs.writeFile(resolveWithin(OUT, '.nojekyll'), '');

  const integrity = {};
  for (const f of [...lista.filter((f) => f !== 'service-worker.js'), 'service-worker.js', '.nojekyll'].sort()) {
    integrity[f] = sha256(await fs.readFile(resolveWithin(OUT, f)));
  }
  await fs.writeFile(resolveWithin(OUT, 'asset-integrity.json'), `${JSON.stringify(integrity, null, 2)}\n`);
  await verifyIntegrity(OUT);

  let total = 0;
  for (const f of lista) total += (await fs.stat(resolveWithin(OUT, f))).size;
  console.log(`✔ www/ montada: ${lista.length} arquivos, ${(total / 1024).toFixed(0)} KB, BUILD_ID ${buildId}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((err) => { console.error(err); process.exit(1); });
}
