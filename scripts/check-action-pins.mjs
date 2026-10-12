import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workflowsDirectory = process.argv[2] ?? fileURLToPath(new URL('../.github/workflows/', import.meta.url));

async function workflowFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return workflowFiles(path);
    return /\.(?:yml|yaml)$/i.test(entry.name) ? [path] : [];
  }));
  return nestedFiles.flat();
}

const errors = [];
for (const path of await workflowFiles(workflowsDirectory)) {
  const content = await readFile(path, 'utf8');
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*(?:-\s*)?uses:\s*(['"]?)([^\s'"#]+)\1/);
    if (!match) continue;

    const reference = match[2];
    if (reference.startsWith('./')) continue;
    if (!/^[^/\s]+\/[^@\s]+@[a-f0-9]{40}$/i.test(reference)) {
      errors.push(`${path}:${index + 1}: ${reference} is not pinned to a full commit SHA`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All third-party workflow actions are pinned to full commit SHAs.');
}
