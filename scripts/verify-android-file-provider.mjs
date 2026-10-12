import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(repositoryRoot, 'android', 'app');
const sourcePathsFile = path.join(appRoot, 'src/main/res/xml/file_paths.xml');
const sourcePaths = await readFile(sourcePathsFile, 'utf8');
const nativeSource = await readFile(path.join(repositoryRoot, 'native.js'), 'utf8');
const sourcePathEntries = [...sourcePaths.matchAll(/<([\w-]+)\b([^>]*)\/>/g)]
  .filter(([, tag]) => tag !== 'paths')
  .map(([, tag, attributes]) => ({ tag, attributes }));

assert.equal(sourcePathEntries.length, 1, 'FileProvider must declare exactly one path');
assert.equal(sourcePathEntries[0].tag, 'cache-path', 'FileProvider must not expose external storage');
assert.match(sourcePathEntries[0].attributes, /\bname="shared_files"/);
assert.match(sourcePathEntries[0].attributes, /\bpath="shared\/"/);
assert.match(nativeSource, /const SHARE_DIRECTORY = 'shared';/);
assert.match(nativeSource, /path: `\$\{SHARE_DIRECTORY\}\/\$\{nome\}`/);
assert.match(nativeSource, /directory: 'CACHE', recursive: true/);

if (process.argv.includes('--source-only')) {
  console.log('FileProvider source verification passed: app cache/shared/ only.');
  process.exit(0);
}

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(entryPath) : [entryPath];
  }));
  return files.flat();
}

const intermediates = path.join(appRoot, 'build/intermediates');
const generatedFiles = await findFiles(intermediates);
const releaseManifestFiles = generatedFiles.filter((file) =>
  path.basename(file) === 'AndroidManifest.xml' &&
  file.includes(`${path.sep}release${path.sep}`) &&
  /merged_manifest/i.test(file)
);
const mergedPathFiles = generatedFiles.filter((file) =>
  path.basename(file) === 'xml_file_paths.xml' &&
  file.includes(`${path.sep}release${path.sep}`) &&
  /merged_res/i.test(file)
);

assert.equal(releaseManifestFiles.length, 1, 'Expected one merged release AndroidManifest.xml');
assert.equal(mergedPathFiles.length, 1, 'Expected one merged release file_paths.xml resource');

const mergedManifest = await readFile(releaseManifestFiles[0], 'utf8');
const provider = [...mergedManifest.matchAll(/<provider\b[\s\S]*?<\/provider>/g)]
  .map(([element]) => element)
  .find((element) => element.includes('androidx.core.content.FileProvider'));

assert.ok(provider, 'Merged release manifest must contain the app FileProvider');
assert.match(provider, /android:authorities="com\.profcontroller\.app\.fileprovider"/);
assert.match(provider, /android:exported="false"/);
assert.match(provider, /android:grantUriPermissions="true"/);
assert.match(provider, /android\.support\.FILE_PROVIDER_PATHS/);
assert.match(provider, /android:resource="@xml\/file_paths"/);

const mergedPaths = await readFile(mergedPathFiles[0], 'utf8');
assert.match(mergedPaths, /<cache-path\b[^>]*\bname="shared_files"[^>]*\bpath="shared\/"/);
assert.doesNotMatch(mergedPaths, /<external-path\b/);

console.log('FileProvider verification passed.');
console.log(`Merged manifest: ${path.relative(repositoryRoot, releaseManifestFiles[0])}`);
console.log(`Merged paths: ${path.relative(repositoryRoot, mergedPathFiles[0])}`);
console.log('Share scope: app cache/shared/ only; no external-path.');
