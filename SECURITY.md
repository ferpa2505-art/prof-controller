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

### 2. Branch Protection
The `main` branch is protected with the following rules:
- ✅ All status checks must pass before merging
- ✅ Code review from code owners required
- ✅ Stale review dismissal on new commits enabled
- ✅ Enforce for administrators enabled

### 3. Code Owners
Code review requirements are defined in `.github/CODEOWNERS`:
- Primary maintainer: @ferpa2505-art
- All pull requests require approval from code owners before merging

### 4. Secret Scanning (Multi-Layer Protection)
GitHub native scanning and TruffleHog provide comprehensive secret detection:
- **CI/CD Layer (TruffleHog):** Scans every pull request via workflow for leaked secrets
- **GitHub Native:** Requires manual enablement in Settings > Security > Secret scanning
  - Prevents secrets from being committed to the repository
  - All commits and pull requests are scanned
  - Maintainers are notified of detected secrets
- **Combined Protection:** Double-layer defense ensures secrets are caught early

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
