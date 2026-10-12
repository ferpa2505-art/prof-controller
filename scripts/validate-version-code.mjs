#!/usr/bin/env node
/**
 * Monotonic Android versionCode calculation and validation for Google Play releases.
 *
 * Strategy formula:
 *   versionCode = (MAJOR * 1,000,000) + (MINOR * 10,000) + (PATCH * 100) + BUILD
 *
 * Rules enforced:
 *   1. versionCode must be a positive integer (1 <= versionCode <= 2,100,000,000).
 *   2. For any new release, versionCode must strictly increase (monotonicity).
 *   3. Reusing a versionCode previously used in a release is rejected.
 *   4. Accidental decreases of versionCode are rejected.
 *
 * Usage:
 *   node scripts/validate-version-code.mjs               # Validate current repository state
 *   node scripts/validate-version-code.mjs --release     # Validate strictly as a release
 *   node scripts/validate-version-code.mjs --print       # Output current versionCode only
 */

import { promises as fs } from 'node:fs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

export const MAX_PLAY_VERSION_CODE = 2100000000;
export const MIN_PLAY_VERSION_CODE = 1;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Parse a Semantic Version string (e.g., "1.2.0" or "1.2.0-beta.1").
 */
export function parseSemver(versionStr) {
  if (typeof versionStr !== 'string') {
    throw new TypeError(`version must be a string, got ${typeof versionStr}`);
  }
  const match = versionStr.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) {
    throw new Error(`Invalid semver version format: "${versionStr}". Expected MAJOR.MINOR.PATCH`);
  }
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

/**
 * Compute the monotonic versionCode from semver and an optional build number.
 *
 * Allocation:
 *   MAJOR: 0-2100  (multiplier 1,000,000)
 *   MINOR: 0-99    (multiplier 10,000)
 *   PATCH: 0-99    (multiplier 100)
 *   BUILD: 0-99    (multiplier 1)
 */
export function computeVersionCode(versionStr, buildNumber = 0) {
  const { major, minor, patch } = parseSemver(versionStr);
  const build = Number.parseInt(buildNumber, 10);

  if (!Number.isInteger(build) || build < 0 || build > 99) {
    throw new Error(`Invalid build number "${buildNumber}". Build number must be an integer between 0 and 99.`);
  }
  if (minor > 99) {
    throw new Error(`Minor version ${minor} exceeds supported range (0-99) for standard formula.`);
  }
  if (patch > 99) {
    throw new Error(`Patch version ${patch} exceeds supported range (0-99) for standard formula.`);
  }

  const code = (major * 1000000) + (minor * 10000) + (patch * 100) + build;
  validateVersionCodeBounds(code);
  return code;
}

/**
 * Validates that versionCode is a positive integer within Google Play's 2.1B ceiling.
 */
export function validateVersionCodeBounds(versionCode) {
  const num = Number(versionCode);
  if (!Number.isInteger(num)) {
    throw new Error(`Invalid versionCode "${versionCode}": must be an integer.`);
  }
  if (num < MIN_PLAY_VERSION_CODE) {
    throw new Error(`Invalid versionCode ${num}: Google Play requires a positive integer (>= 1).`);
  }
  if (num > MAX_PLAY_VERSION_CODE) {
    throw new Error(`Invalid versionCode ${num}: exceeds Google Play maximum limit (${MAX_PLAY_VERSION_CODE}).`);
  }
  return true;
}

/**
 * Reads historical releases from android/release-history.json and git tags if available.
 */
export function getReleaseHistory(repoRoot = REPO_ROOT) {
  const historyMap = new Map();

  // 1. Check android/release-history.json
  const ledgerPath = path.join(repoRoot, 'android', 'release-history.json');
  if (existsSync(ledgerPath)) {
    try {
      const data = JSON.parse(readFileSync(ledgerPath, 'utf8'));
      if (Array.isArray(data.releases)) {
        for (const rel of data.releases) {
          if (rel.versionCode && Number.isInteger(rel.versionCode)) {
            historyMap.set(rel.versionCode, {
              versionName: rel.versionName || 'unknown',
              versionCode: rel.versionCode,
              source: 'release-history.json',
              tag: rel.tag || null,
            });
          }
        }
      }
    } catch (e) {
      // Continue if unreadable; error will be logged in strict checks
    }
  }

  // 2. Check git tags if git is available
  try {
    const rawTags = execSync('git tag -l "v*"', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (rawTags) {
      const tags = rawTags.split('\n').map((t) => t.trim()).filter(Boolean);
      for (const tag of tags) {
        try {
          const rawPkg = execSync(`git show ${tag}:package.json`, {
            cwd: repoRoot,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
          });
          const pkg = JSON.parse(rawPkg);
          if (pkg.version) {
            const code = computeVersionCode(pkg.version, 0);
            if (!historyMap.has(code)) {
              historyMap.set(code, {
                versionName: pkg.version,
                versionCode: code,
                source: `git tag ${tag}`,
                tag,
              });
            }
          }
        } catch {
          // Tag may not have package.json or git show failed
        }
      }
    }
  } catch {
    // Git not available or not a git repo
  }

  return Array.from(historyMap.values()).sort((a, b) => a.versionCode - b.versionCode);
}

/**
 * Validates that currentVersionCode maintains monotonicity with respect to release history.
 */
export function checkMonotonicity({ currentVersionCode, history = [], isRelease = false }) {
  validateVersionCodeBounds(currentVersionCode);

  if (history.length === 0) {
    return { ok: true, maxHistorical: 0, violations: [] };
  }

  const maxHistorical = Math.max(...history.map((h) => h.versionCode));
  const violations = [];

  // Check for any historical release with a higher versionCode (accidental decrease)
  for (const entry of history) {
    if (currentVersionCode < entry.versionCode) {
      violations.push(
        `Accidental decrease: proposed versionCode ${currentVersionCode} is lower than prior release ` +
        `versionCode ${entry.versionCode} (${entry.versionName} from ${entry.source}).`
      );
    }
  }

  // Check for reuse
  for (const entry of history) {
    if (currentVersionCode === entry.versionCode) {
      if (isRelease) {
        violations.push(
          `VersionCode reuse detected: proposed versionCode ${currentVersionCode} was already released ` +
          `for version ${entry.versionName} (${entry.source}). Google Play rejects duplicate version codes on new uploads.`
        );
      }
    }
  }

  // Strict release requirement: strictly greater than the historical maximum
  if (isRelease && currentVersionCode <= maxHistorical) {
    const errorMsg =
      `Release monotonicity failure: proposed versionCode ${currentVersionCode} is not strictly greater ` +
      `than previous release maximum versionCode ${maxHistorical}.`;
    if (!violations.includes(errorMsg)) {
      violations.push(errorMsg);
    }
  }

  if (violations.length > 0) {
    return {
      ok: false,
      maxHistorical,
      violations,
      error: violations.join('\n'),
    };
  }

  return { ok: true, maxHistorical, violations: [] };
}

/**
 * Main execution when invoked directly.
 */
async function main() {
  const args = process.argv.slice(2);
  const isRelease = args.includes('--release');
  const printOnly = args.includes('--print');
  const jsonOutput = args.includes('--json');

  let customVersion = null;
  const versionIdx = args.indexOf('--version');
  if (versionIdx !== -1 && args[versionIdx + 1]) {
    customVersion = args[versionIdx + 1];
  }

  let customVersionCode = null;
  const codeIdx = args.indexOf('--version-code');
  if (codeIdx !== -1 && args[codeIdx + 1]) {
    customVersionCode = Number.parseInt(args[codeIdx + 1], 10);
  }

  let buildNumber = 0;
  const buildIdx = args.indexOf('--build-number');
  if (buildIdx !== -1 && args[buildIdx + 1]) {
    buildNumber = Number.parseInt(args[buildIdx + 1], 10);
  } else if (process.env.BUILD_NUMBER) {
    buildNumber = Number.parseInt(process.env.BUILD_NUMBER, 10);
  }

  const pkgPath = path.join(REPO_ROOT, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  const versionName = customVersion || pkg.version;

  let versionCode;
  if (customVersionCode !== null) {
    versionCode = customVersionCode;
    validateVersionCodeBounds(versionCode);
  } else if (process.env.VERSION_CODE) {
    versionCode = Number.parseInt(process.env.VERSION_CODE, 10);
    validateVersionCodeBounds(versionCode);
  } else {
    versionCode = computeVersionCode(versionName, buildNumber);
  }

  if (printOnly) {
    process.stdout.write(String(versionCode));
    return;
  }

  const history = getReleaseHistory(REPO_ROOT);
  const result = checkMonotonicity({
    currentVersionCode: versionCode,
    history,
    isRelease,
  });

  if (jsonOutput) {
    console.log(JSON.stringify({
      versionName,
      versionCode,
      isRelease,
      historyCount: history.length,
      maxHistorical: result.maxHistorical,
      valid: result.ok,
      violations: result.violations,
    }, null, 2));
    if (!result.ok) process.exit(1);
    return;
  }

  console.log('--- Android versionCode Validator ---');
  console.log(`Version Name (package.json): ${versionName}`);
  console.log(`Calculated versionCode:      ${versionCode}`);
  console.log(`Validation Mode:             ${isRelease ? 'RELEASE (strictly monotonic)' : 'CHECK / BUILD'}`);
  console.log(`Known release history:       ${history.length} release(s) found`);
  if (history.length > 0) {
    for (const h of history) {
      console.log(`  - v${h.versionName}: code ${h.versionCode} (${h.source})`);
    }
  }

  if (!result.ok) {
    console.error('\n✖ VERSIONCODE VALIDATION FAILED:');
    for (const v of result.violations) {
      console.error(`  - ${v}`);
    }
    console.error('\nGoogle Play requires versionCode to be a strictly increasing positive integer.');
    console.error('To resolve this:');
    console.error('  1. Bump "version" in package.json (e.g. 1.2.0 -> 1.2.1), or');
    console.error('  2. For a rebuild of the same version, pass BUILD_NUMBER (1-99), or');
    console.error('  3. Explicitly pass a monotonic VERSION_CODE environment variable.\n');
    process.exit(1);
  }

  console.log('\n✔ versionCode is valid, positive, and monotonic.\n');
}

// Execute if run directly from CLI
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error('\n✖ Fatal validation error:', err.message);
    process.exit(1);
  });
}
