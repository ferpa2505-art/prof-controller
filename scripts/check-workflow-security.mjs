import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKFLOWS = fileURLToPath(new URL('../.github/workflows/', import.meta.url));
const errors = [];

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
  if (!/^permissions:/m.test(content)) {
    errors.push(`${name}: workflow must declare top-level permissions`);
  }

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*-\s*uses:\s*(['"]?)([^ \t'"#]+)\1/);
    if (!match || match[2].startsWith('./')) continue;
    if (!/^[^/\s]+\/[^@\s]+@[a-f0-9]{40}$/i.test(match[2])) {
      errors.push(`${name}:${index + 1}: ${match[2]} is not pinned to a full commit SHA`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('All workflows declare permissions and pin external actions to full commit SHAs.');
}
