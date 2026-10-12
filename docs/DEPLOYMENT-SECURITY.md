# Deployment security checks

The Pages and native build workflows require a security job before building or
publishing. The job installs from the lockfile, fails on high or critical
production dependency advisories, runs the security tests, and scans for
exposed secrets. Any failed check blocks the dependent build.

The web build writes `www/asset-integrity.json` with SHA-256 hashes for every
published file and verifies the manifest before upload. Before deployment,
the downloaded Pages artifact is checked for GitHub's artifact digest and its
file hashes are verified again.

## Required checks for `main`

In the branch protection rules for `main`, require both Pages checks:

- `Publicar no GitHub Pages / Security checks`
- `Publicar no GitHub Pages / Build`

The deployment job runs only for pushes to `main` or manual dispatch, never
for pull requests. Audit covers production dependencies (`npm audit --omit=dev`)
because development tools are not shipped in the app.
