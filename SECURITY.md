# Security Policy for prof-controller

## Reporting a Vulnerability

If you discover a security vulnerability in prof-controller, please **do not** open a public GitHub issue. Instead, please report it responsibly using one of these methods:

### Private Reporting Options
1. **Email the maintainers directly:** ferpa2505@gmail.com
2. **Use GitHub Security Advisory:** https://github.com/ferpa2505-art/prof-controller/security/advisories/new
   - This creates a private security advisory that only maintainers can see
   - GitHub provides coordinated disclosure workflow

## Security Controls

This repository implements the following security measures:

### 1. Automated Checks (CI/CD)
- **Workflow:** `.github/workflows/checks.yml`
- **Triggers:** All pull requests to `main` and commits to `main`
- **Checks:**
  - Node.js build validation (version 22+)
  - Dependencies installation via npm ci
  - Build process verification (`npm run build`)
  - Output validation (www/ directory and index.html)
  - Secret scanning with TruffleHog

### 2. Branch Protection (PENDING MANUAL ACTIVATION)
The `main` branch is **configured to require** (but NOT YET ACTIVE):
- ⏳ Status checks required: `build` workflow must pass
- ⏳ Code owner review: Must be approved by @ferpa2505-art
- ⏳ Stale review dismissal on new commits enabled
- ⏳ Enforce for administrators enabled

**Current Status:** NOT ACTIVE — Requires manual GitHub UI setup  
**Setup Instructions:** See `.github/CONFIGURE_BRANCH_PROTECTION.md`  
**Timeline:** Must be activated BEFORE this PR is merged

### 3. Code Owners
Code review requirements are defined in `.github/CODEOWNERS`:
- Primary maintainer: @ferpa2505-art
- All pull requests require approval from code owners before merging

### 4. Secret Scanning (Multi-Layer Protection)

#### Layer 1: GitHub Native (PENDING MANUAL ACTIVATION)
⏳ Prevents secrets from being committed to the repository  
⏳ Scans all commits and pull requests  
⏳ Notifies maintainers of detected secrets  
**Status:** NOT YET ACTIVATED — Requires manual GitHub UI setup

#### Layer 2: CI/CD (ACTIVE VIA WORKFLOW)
✅ TruffleHog v3.63.0 integrated in `.github/workflows/checks.yml`  
✅ Scans every PR for leaked secrets using pattern matching  
✅ Uses structured output for detection results  
**Status:** ACTIVE on all pull requests and main branch commits

**Current Implementation:** Partial (TruffleHog active, GitHub native pending)  
**Setup Instructions:** See `.github/CONFIGURE_BRANCH_PROTECTION.md`

### 5. Dependency Management
- **Lock File:** `package-lock.json` is committed to ensure reproducible builds
- **Installation:** CI uses `npm ci` for exact dependency installation
- **Review:** Dependencies are reviewed before major updates

## Development Guidelines

### Before Submitting a Pull Request
1. Ensure your code follows the project structure
2. Build locally: `npm run build`
3. Test the www/ output in your browser
4. Verify no secrets are committed:
   - No API keys, tokens, or private credentials
   - No sensitive personal information
   - No passwords or private keys

### Code Review Process
1. **Automated Checks First:** All CI checks must pass
2. **Code Owner Review:** Code owner review is required
3. **Merge Criteria:** At least one code owner approval required
4. **Continuous:** Reviews must remain active through merge

## Dependency Security

### Keeping Dependencies Updated
- Regularly check for security updates: `npm audit`
- Update dependencies: `npm update`
- Review security advisories before upgrading

### Reporting Dependency Vulnerabilities
If you discover a vulnerability in a dependency:
1. Check if it's already reported to the maintainer
2. File an issue if it hasn't been reported
3. Follow responsible disclosure guidelines

## Node.js Version Policy
- **Required:** Node.js 22 or later
- **CI/CD:** Tests run on Node.js 22.x
- **EOL:** When Node.js version reaches end-of-life, we'll migrate to the next LTS version

## Versioning and Updates

### TruffleHog Version Management
- **Current Version:** v3.63.0 (pinned for stability)
- **Update Frequency:** Monthly review for new versions
- **Testing:** New versions tested in a separate branch before merging
- **Automation:** Manual updates to `.github/workflows/checks.yml` after testing
- **EOL Strategy:** Monitor TruffleHog releases for security patches and critical updates

### npm Audit Policy
- **Tool:** npm audit (runs on all PRs)
- **Severity Level:** Fails on moderate-level vulnerabilities or higher
- **Manual Review:** Use `npm audit --full` for detailed analysis of vulnerabilities
- **Updates:** Review and test security patches immediately
- **Exceptions:** Document any deliberate vulnerabilities not addressed in Pull Request descriptions

### Dependency Update Strategy
- **Review Cycle:** Check for updates monthly
- **Critical Updates:** Apply immediately if security-related
- **Major Updates:** Schedule testing in dedicated branch before merging
- **Lock File:** `package-lock.json` is committed for reproducible builds
- **Notification:** Enable GitHub Dependabot alerts (optional, requires manual activation in Settings)

## Repository Health

This repository maintains security through:
- ✅ Automated testing on all PRs
- ✅ Mandatory code review
- ✅ Secret scanning protection
- ✅ Dependency auditing
- ✅ Branch protection policies

## Changelog

Security updates will be documented in:
- GitHub releases page
- Commit messages with security fixes
- Pull request descriptions

## Additional Resources

- [GitHub Security Overview](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Last Updated:** 2026-10-12  
**Maintainer:** @ferpa2505-art
