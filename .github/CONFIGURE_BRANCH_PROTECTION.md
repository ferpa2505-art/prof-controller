# Manual Configuration Steps for Branch Protection & Secret Scanning

This guide outlines the remaining manual configuration steps needed to complete the security hardening of prof-controller.

## Overview

The following files have been added to this repository:
- `.github/workflows/checks.yml` - Automated CI/CD checks
- `.github/CODEOWNERS` - Code owner review requirements
- `SECURITY.md` - Security policy documentation

However, some GitHub settings require manual configuration through the repository settings:

## 1. Enable Branch Protection on Main Branch

**Location:** Repository Settings → Branches → Branch protection rules

### Steps:
1. Go to: https://github.com/ferpa2505-art/prof-controller/settings/branches
2. Click "Add rule"
3. Enter branch name pattern: `main`
4. Enable the following:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
     - ✅ Require review from Code Owners
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Wait for the "build" workflow to appear, then select it
   - ✅ **Enforce all the above rules for administrators**
   - ✅ **Restrict who can push to matching branches** (optional - only if you want to limit pushes to admins)

5. Click "Create"

### Expected Result:
- All PRs to `main` must have the `build` workflow passing
- All PRs to `main` must have approval from `@ferpa2505-art` (CODEOWNERS)
- Stale reviews are automatically dismissed when code changes
- Admins cannot bypass these rules

---

## 2. Enable Secret Scanning

**Location:** Repository Settings → Security → Secret scanning

### Steps:
1. Go to: https://github.com/ferpa2505-art/prof-controller/settings/security_analysis
2. Under "Secret scanning" section, click "Enable"
3. (Optional) Enable "Push protection" to prevent commits with secrets

### Expected Result:
- GitHub automatically scans all commits for known secret patterns
- Any detected secrets are reported to repository administrators
- Contributors are warned before committing secrets

---

## 3. Enable Dependabot (Dependency Scanning)

**Location:** Repository Settings → Security → Dependency graph

### Steps:
1. Go to: https://github.com/ferpa2505-art/prof-controller/settings/security_analysis
2. Enable "Dependabot alerts"
3. (Optional) Enable "Dependabot security updates" for automatic updates

### Expected Result:
- GitHub monitors npm dependencies for known vulnerabilities
- Alerts are sent when vulnerable packages are detected
- (If enabled) Automatic PRs are created to update vulnerable packages

---

## 4. Verify CI Workflow is Working

Once the first PR is merged, the workflow should be active:

1. Create a test PR to `main`
2. Verify the "build" workflow appears and runs
3. The build job should:
   - Install Node.js 22
   - Run `npm ci`
   - Run `npm run build`
   - Validate www/ output

---

## 5. Review Existing PRs (#11-#17)

Once branch protection and CI are active:

1. Review each PR to determine if it should:
   - Be closed (if no longer relevant)
   - Be converted to draft (if work is incomplete)
   - Be updated to meet the new checks

2. Repository maintainers should:
   - Ensure all checks pass
   - Request CODEOWNERS review
   - Merge when all requirements are met

---

## Verification Checklist

- [ ] Branch protection rule created for `main`
- [ ] Status checks required (build workflow)
- [ ] CODEOWNERS review required
- [ ] Secret scanning enabled
- [ ] First PR created and CI workflow runs successfully
- [ ] Branch protection enforced on PR merge attempts
- [ ] Existing PRs reviewed and updated

---

## Troubleshooting

### "Build" workflow not showing in branch protection settings
- The workflow may not have run yet. Create a test PR to trigger it, then return to settings.

### Secret scanning already enabled
- Verify it's actually enabled and not disabled by organization policy.

### CODEOWNERS approval not working
- Ensure `.github/CODEOWNERS` file exists and is properly formatted
- Verify the GitHub usernames in CODEOWNERS are correct

---

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Actions Status Checks](https://docs.github.com/en/status-checks)

---

**Last Updated:** 2026-10-12  
**Status:** Configuration guide pending manual setup
