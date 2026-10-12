/**
 * Unit and integration tests for Android monotonic versionCode strategy and validation.
 *
 * Validates:
 *   - Google Play monotonic-version requirements.
 *   - Positive integer boundaries (1 <= code <= 2,100,000,000).
 *   - Formula mapping from package.json semver to versionCode.
 *   - Accidental decrease rejection.
 *   - Duplicate/reused versionCode rejection in release mode.
 *   - Consistency with android/release-history.json and repository package.json.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import {
  parseSemver,
  computeVersionCode,
  validateVersionCodeBounds,
  checkMonotonicity,
  getReleaseHistory,
  REPO_ROOT,
  MAX_PLAY_VERSION_CODE,
  MIN_PLAY_VERSION_CODE,
} from '../scripts/validate-version-code.mjs';

test('parseSemver parses valid semver versions correctly', () => {
  assert.deepEqual(parseSemver('1.2.0'), { major: 1, minor: 2, patch: 0, prerelease: null });
  assert.deepEqual(parseSemver('0.0.1'), { major: 0, minor: 0, patch: 1, prerelease: null });
  assert.deepEqual(parseSemver('10.25.99'), { major: 10, minor: 25, patch: 99, prerelease: null });
  assert.deepEqual(parseSemver('1.2.0-beta.1'), { major: 1, minor: 2, patch: 0, prerelease: 'beta.1' });
});

test('parseSemver rejects malformed versions', () => {
  assert.throws(() => parseSemver('v1.2.0'), /Invalid semver version format/);
  assert.throws(() => parseSemver('1.2'), /Invalid semver version format/);
  assert.throws(() => parseSemver('beta'), /Invalid semver version format/);
  assert.throws(() => parseSemver(''), /Invalid semver version format/);
  assert.throws(() => parseSemver(null), /version must be a string/);
  assert.throws(() => parseSemver(undefined), /version must be a string/);
});

test('computeVersionCode computes correct monotonic integer from semver', () => {
  assert.equal(computeVersionCode('1.0.0', 0), 1000000);
  assert.equal(computeVersionCode('1.0.0', 1), 1000001);
  assert.equal(computeVersionCode('1.1.0', 0), 1010000);
  assert.equal(computeVersionCode('1.2.0', 0), 1020000);
  assert.equal(computeVersionCode('1.2.0', 5), 1020005);
  assert.equal(computeVersionCode('1.2.1', 0), 1020100);
  assert.equal(computeVersionCode('1.3.0', 0), 1030000);
  assert.equal(computeVersionCode('2.0.0', 0), 2000000);
  assert.equal(computeVersionCode('2.1.3', 12), 2010312);
});

test('computeVersionCode enforces build number boundaries (0..99)', () => {
  assert.equal(computeVersionCode('1.2.0', 0), 1020000);
  assert.equal(computeVersionCode('1.2.0', 99), 1020099);
  assert.throws(() => computeVersionCode('1.2.0', -1), /Invalid build number/);
  assert.throws(() => computeVersionCode('1.2.0', 100), /Invalid build number/);
  assert.throws(() => computeVersionCode('1.2.0', 'abc'), /Invalid build number/);
});

test('computeVersionCode enforces component limits (minor <= 99, patch <= 99)', () => {
  assert.throws(() => computeVersionCode('1.100.0', 0), /Minor version 100 exceeds supported range/);
  assert.throws(() => computeVersionCode('1.0.100', 0), /Patch version 100 exceeds supported range/);
});

test('validateVersionCodeBounds strictly checks positive integer and Google Play 2.1B ceiling', () => {
  assert.equal(validateVersionCodeBounds(1), true);
  assert.equal(validateVersionCodeBounds(1000000), true);
  assert.equal(validateVersionCodeBounds(MAX_PLAY_VERSION_CODE), true);

  // Negative and zero
  assert.throws(() => validateVersionCodeBounds(0), /requires a positive integer \(>= 1\)/);
  assert.throws(() => validateVersionCodeBounds(-1), /requires a positive integer \(>= 1\)/);
  assert.throws(() => validateVersionCodeBounds(-100), /requires a positive integer \(>= 1\)/);

  // Ceilings
  assert.throws(() => validateVersionCodeBounds(MAX_PLAY_VERSION_CODE + 1), /exceeds Google Play maximum limit/);
  assert.throws(() => validateVersionCodeBounds(3000000000), /exceeds Google Play maximum limit/);

  // Non-integers
  assert.throws(() => validateVersionCodeBounds(1.5), /must be an integer/);
  assert.throws(() => validateVersionCodeBounds(NaN), /must be an integer/);
  assert.throws(() => validateVersionCodeBounds('invalid'), /must be an integer/);
});

test('Monotonic sequence test across realistic release progression', () => {
  const versions = [
    { ver: '1.0.0', build: 0 },
    { ver: '1.0.0', build: 1 },
    { ver: '1.0.1', build: 0 },
    { ver: '1.1.0', build: 0 },
    { ver: '1.1.1', build: 0 },
    { ver: '1.2.0', build: 0 },
    { ver: '1.2.0', build: 1 },
    { ver: '1.2.1', build: 0 },
    { ver: '1.3.0', build: 0 },
    { ver: '2.0.0', build: 0 },
  ];

  let previousCode = 0;
  for (const v of versions) {
    const code = computeVersionCode(v.ver, v.build);
    assert.ok(code > previousCode, `Expected ${code} for ${v.ver}#${v.build} to be strictly greater than ${previousCode}`);
    assert.ok(code >= MIN_PLAY_VERSION_CODE);
    assert.ok(code <= MAX_PLAY_VERSION_CODE);
    previousCode = code;
  }
});

test('checkMonotonicity allows valid monotonic progression in check mode', () => {
  const history = [
    { versionName: '1.0.0', versionCode: 1000000, source: 'test' },
    { versionName: '1.1.0', versionCode: 1010000, source: 'test' },
  ];

  const result = checkMonotonicity({
    currentVersionCode: 1020000,
    history,
    isRelease: false,
  });

  assert.equal(result.ok, true);
  assert.equal(result.violations.length, 0);
  assert.equal(result.maxHistorical, 1010000);
});

test('checkMonotonicity rejects accidental decrease in both check and release modes', () => {
  const history = [
    { versionName: '1.0.0', versionCode: 1000000, source: 'test' },
    { versionName: '1.1.0', versionCode: 1010000, source: 'test' },
  ];

  // Proposed 1000500 is lower than 1010000
  const resultCheck = checkMonotonicity({
    currentVersionCode: 1000500,
    history,
    isRelease: false,
  });
  assert.equal(resultCheck.ok, false);
  assert.match(resultCheck.error, /Accidental decrease/);

  const resultRelease = checkMonotonicity({
    currentVersionCode: 1000500,
    history,
    isRelease: true,
  });
  assert.equal(resultRelease.ok, false);
  assert.match(resultRelease.error, /Accidental decrease/);
});

test('checkMonotonicity rejects duplicate/reused versionCode in release mode', () => {
  const history = [
    { versionName: '1.0.0', versionCode: 1000000, source: 'test' },
    { versionName: '1.1.0', versionCode: 1010000, source: 'test' },
  ];

  // In release mode, reusing 1010000 must fail
  const resultRelease = checkMonotonicity({
    currentVersionCode: 1010000,
    history,
    isRelease: true,
  });
  assert.equal(resultRelease.ok, false);
  assert.match(resultRelease.error, /VersionCode reuse detected/);
  assert.match(resultRelease.error, /Release monotonicity failure/);

  // In check/dev mode, building the current version without releasing does not fail
  const resultDev = checkMonotonicity({
    currentVersionCode: 1010000,
    history,
    isRelease: false,
  });
  assert.equal(resultDev.ok, true);
});

test('android/release-history.json ledger is valid, positive, and monotonic', async () => {
  const ledgerPath = path.join(REPO_ROOT, 'android', 'release-history.json');
  const content = JSON.parse(await fs.readFile(ledgerPath, 'utf8'));

  assert.ok(Array.isArray(content.releases));
  assert.ok(content.releases.length >= 2);

  let prev = 0;
  for (const rel of content.releases) {
    assert.ok(typeof rel.versionName === 'string');
    assert.ok(Number.isInteger(rel.versionCode));
    assert.ok(rel.versionCode > 0, `Release ${rel.versionName} has non-positive versionCode`);
    assert.ok(rel.versionCode > prev, `Release ${rel.versionName} (${rel.versionCode}) is not > previous (${prev})`);
    prev = rel.versionCode;
  }
});

test('Current repository state passes release validation', async () => {
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const currentCode = computeVersionCode(pkg.version, 0);

  const history = getReleaseHistory(REPO_ROOT);
  const result = checkMonotonicity({
    currentVersionCode: currentCode,
    history,
    isRelease: true,
  });

  assert.equal(result.ok, true, `Expected current repository version ${pkg.version} (code ${currentCode}) to pass release check: ${result.error}`);
  assert.ok(currentCode > 1010000, 'Current 1.2.0 versionCode must exceed 1.1.0');
});
