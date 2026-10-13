import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

// Uso: node scripts/check-workflow-security.mjs [pasta-de-workflows]
const WORKFLOWS = process.argv[2]
  ? path.resolve(process.argv[2])
  : fileURLToPath(new URL('../.github/workflows/', import.meta.url));
const errors = [];

const PINNED_ACTION = /^[^/\s]+\/[^@\s]+@[a-f0-9]{40}$/i;
const PINNED_DOCKER = /^docker:\/\/[^@\s]+@sha256:[a-f0-9]{64}$/i;

async function workflowFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return workflowFiles(file);
    return entry.isFile() && /\.ya?ml$/i.test(entry.name) ? [file] : [];
  }));
  return nestedFiles.flat();
}

// Percorre o valor JS ja resolvido: chaves decodificadas (aspas, escapes
// unicode), aliases (*ref) e merge keys (<<) expandidos.
function* usesValues(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) yield* usesValues(item, seen);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'uses') yield child;
    yield* usesValues(child, seen);
  }
}

for (const file of await workflowFiles(WORKFLOWS)) {
  const name = path.relative(WORKFLOWS, file);
  const content = await readFile(file, 'utf8');
  const doc = parseDocument(content, { merge: true, uniqueKeys: true });

  if (doc.errors.length > 0) {
    errors.push(`${name}: invalid YAML document`);
    continue;
  }

  let root;
  try {
    root = doc.toJS({ maxAliasCount: 100 });
  } catch {
    errors.push(`${name}: invalid YAML document`);
    continue;
  }
  if (root === null || typeof root !== 'object' || Array.isArray(root)) {
    errors.push(`${name}: invalid YAML document`);
    continue;
  }

  // permissions precisa ser chave do mapa raiz; texto dentro de scalars nao conta.
  if (!Object.prototype.hasOwnProperty.call(root, 'permissions')) {
    errors.push(`${name}: workflow must declare top-level permissions`);
  }

  for (const ref of usesValues(root)) {
    if (typeof ref !== 'string' || ref === '') {
      errors.push(`${name}: uses must be a non-empty string (got ${JSON.stringify(ref)}) and is not pinned to a full commit SHA`);
      continue;
    }
    if (ref.startsWith('./')) continue;
    const ok = ref.startsWith('docker://') ? PINNED_DOCKER.test(ref) : PINNED_ACTION.test(ref);
    if (!ok) errors.push(`${name}: ${ref} is not pinned to a full commit SHA`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All workflows declare permissions and pin external actions to full commit SHAs.');
}
