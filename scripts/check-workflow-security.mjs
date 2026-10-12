import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Uso: node scripts/check-workflow-security.mjs [pasta-de-workflows]
const WORKFLOWS = process.argv[2]
  ? path.resolve(process.argv[2])
  : fileURLToPath(new URL('../.github/workflows/', import.meta.url));
const errors = [];

// Pega qualquer chave `uses`, com ou sem aspas, em lista (`- uses:`),
// em mapa inline (`{ uses: ... }`) ou em linha normal.
const USES = /(?:^|[\s{,\-])(["']?)uses\1\s*:\s*(["']?)([^\s"',}#]+)\2/g;
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

for (const file of await workflowFiles(WORKFLOWS)) {
  const name = path.relative(WORKFLOWS, file);
  const content = await readFile(file, 'utf8');
  if (!/^["']?permissions["']?\s*:/m.test(content)) {
    errors.push(`${name}: workflow must declare top-level permissions`);
  }

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (/^\s*#/.test(line)) continue;
    for (const match of line.matchAll(USES)) {
      const ref = match[3];
      if (ref.startsWith('./')) continue;
      const ok = ref.startsWith('docker://') ? PINNED_DOCKER.test(ref) : PINNED_ACTION.test(ref);
      if (!ok) errors.push(`${name}:${index + 1}: ${ref} is not pinned to a full commit SHA`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All workflows declare permissions and pin external actions to full commit SHAs.');
}
