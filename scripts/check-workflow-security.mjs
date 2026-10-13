import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMap, isScalar, isSeq, parseDocument } from 'yaml';

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

function lineAt(content, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i += 1) {
    if (content[i] === '\n') line += 1;
  }
  return line;
}

// Percorre os pares chave/valor do documento YAML ja decodificado, cobrindo
// chaves com aspas, escapes unicode ("u\0073es") e mapas inline ({ uses: ... }).
function* visitPairs(node) {
  if (isMap(node)) {
    for (const pair of node.items) {
      yield pair;
      yield* visitPairs(pair.value);
    }
  } else if (isSeq(node)) {
    for (const item of node.items) {
      yield* visitPairs(item);
    }
  }
}

for (const file of await workflowFiles(WORKFLOWS)) {
  const name = path.relative(WORKFLOWS, file);
  const content = await readFile(file, 'utf8');
  const doc = parseDocument(content);

  if (doc.errors.length > 0 || !isMap(doc.contents)) {
    errors.push(`${name}: invalid YAML document`);
    continue;
  }

  // permissions precisa existir como chave do mapa raiz do documento;
  // texto dentro de scalars multiline nao conta.
  const hasRootPermissions = doc.contents.items.some(
    (pair) => isScalar(pair.key) && pair.key.value === 'permissions',
  );
  if (!hasRootPermissions) {
    errors.push(`${name}: workflow must declare top-level permissions`);
  }

  for (const pair of visitPairs(doc.contents)) {
    if (!isScalar(pair.key) || pair.key.value !== 'uses') continue;
    const ref = isScalar(pair.value) && typeof pair.value.value === 'string'
      ? pair.value.value
      : '';
    if (ref === '' || ref.startsWith('./')) continue;
    const ok = ref.startsWith('docker://') ? PINNED_DOCKER.test(ref) : PINNED_ACTION.test(ref);
    if (!ok) {
      const offset = pair.value?.range?.[0] ?? 0;
      errors.push(`${name}:${lineAt(content, offset)}: ${ref} is not pinned to a full commit SHA`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All workflows declare permissions and pin external actions to full commit SHAs.');
}
