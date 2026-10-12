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
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'www');
const ROOT_REAL = await fs.realpath(ROOT);

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

function assertWithin(base, rel, label) {
  if (typeof rel !== 'string' || !rel || path.isAbsolute(rel) || path.posix.isAbsolute(rel) || rel.includes('\\') || rel.includes('\0')) {
    throw new Error(`Caminho inválido em ${label}: ${JSON.stringify(rel)}`);
  }
  if (rel.split('/').includes('..')) throw new Error(`Travessia de diretório em ${label}: ${rel}`);
  const resolved = path.resolve(base, rel);
  const relative = path.relative(base, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Caminho fora dos limites em ${label}: ${rel}`);
  }
  return resolved;
}

function refsHtml(html) {
  const out = new Set();
  const content = html.replace(/<!--[\s\S]*?-->/g, '');
  const starts = /<(?:link|script|img|source)\b/gi;
  let start;
  while ((start = starts.exec(content))) {
    const end = content.indexOf('>', starts.lastIndex);
    if (end < 0) throw new Error('Referência HTML malformada: tag sem fechamento.');
    const tag = content.slice(starts.lastIndex, end);
    const attrs = /\b(href|src)\b/gi;
    let attr;
    while ((attr = attrs.exec(tag))) {
      const tail = tag.slice(attrs.lastIndex);
      const value = /^\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/.exec(tail);
      if (!value || value[3] !== undefined) throw new Error(`Referência HTML malformada: ${attr[1]}.`);
      const ref = value[1] ?? value[2];
      if (!ref) throw new Error(`Referência HTML vazia: ${attr[1]}.`);
      if (isLocal(ref)) out.add(semQuery(ref));
      attrs.lastIndex += value[0].length;
    }
    starts.lastIndex = end + 1;
  }
  return out;
}

function refsCss(css, cssRel) {
  const out = new Set();
  const content = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const starts = /url\s*\(/gi;
  let start;
  while ((start = starts.exec(content))) {
    const tail = content.slice(starts.lastIndex);
    const value = /^\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/.exec(tail);
    if (!value) throw new Error(`Referência CSS malformada em ${cssRel}.`);
    const ref = (value[1] ?? value[2] ?? value[3]).trim();
    if (!ref || (value[3] !== undefined && /['"]/.test(ref))) {
      throw new Error(`Referência CSS inválida em ${cssRel}.`);
    }
    if (isLocal(ref)) {
      const decoded = decodeURIComponent(semQuery(ref));
      assertWithin(ROOT, decoded, `CSS ${cssRel}`);
      const combined = path.posix.join(path.posix.dirname(cssRel), decoded);
      assertWithin(ROOT, combined, `CSS ${cssRel}`);
      out.add(combined);
    }
    starts.lastIndex += value[0].length;
  }
  return out;
}

function htmlPath(ref) {
  const decoded = decodeURIComponent(semQuery(ref));
  assertWithin(ROOT, decoded, 'HTML/manifest');
  return decoded;
}

async function existe(rel) {
  const file = assertWithin(ROOT, rel, 'origem');
  try {
    await fs.access(file);
    const real = await fs.realpath(file);
    const relative = path.relative(ROOT_REAL, real);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Origem fora dos limites do repositório: ${rel}`);
    }
    return true;
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return false;
    throw err;
  }
}

async function main() {
  const arquivos = new Set();
  const faltando = [];

  for (const f of SEMPRE) if (await existe(f)) arquivos.add(f);

  const html = await fs.readFile(assertWithin(ROOT, 'index.html', 'origem'), 'utf8');
  for (const r of refsHtml(html)) arquivos.add(htmlPath(r));

  const manifest = JSON.parse(await fs.readFile(assertWithin(ROOT, 'manifest.json', 'origem'), 'utf8'));
  for (const i of [...(manifest.icons || []), ...(manifest.screenshots || [])]) arquivos.add(htmlPath(i.src));
  for (const s of manifest.shortcuts || []) for (const i of s.icons || []) arquivos.add(htmlPath(i.src));

  // CSS pode puxar imagens; repete até não aparecer nada novo.
  const cssVistos = new Set();
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const f of [...arquivos]) {
      if (!f.endsWith('.css') || cssVistos.has(f)) continue;
      cssVistos.add(f);
      if (!(await existe(f))) continue;
      for (const r of refsCss(await fs.readFile(assertWithin(ROOT, f, 'origem'), 'utf8'), f)) {
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
  const outRealParent = await fs.realpath(path.dirname(OUT));
  const out = path.join(outRealParent, path.basename(OUT));
  const hash = crypto.createHash('sha256');
  const lista = [...arquivos].sort();

  for (const f of lista) {
    const dest = assertWithin(out, f, 'destino');
    assertWithin(ROOT, f, 'origem');
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const buf = await fs.readFile(assertWithin(ROOT, f, 'origem'));
    if (f !== 'service-worker.js') hash.update(f).update(buf);
    await fs.writeFile(dest, buf);
  }

  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const buildId = `${pkg.version}-${hash.digest('hex').slice(0, 10)}`;
  const precache = ['./', ...lista.filter((f) => f !== 'service-worker.js' && !f.endsWith('.md')).map((f) => './' + f)];

  const swPath = assertWithin(out, 'service-worker.js', 'destino');
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
  await fs.writeFile(assertWithin(out, '.nojekyll', 'destino'), '');

  let total = 0;
  for (const f of lista) total += (await fs.stat(assertWithin(out, f, 'destino'))).size;
  console.log(`✔ www/ montada: ${lista.length} arquivos, ${(total / 1024).toFixed(0)} KB, BUILD_ID ${buildId}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
