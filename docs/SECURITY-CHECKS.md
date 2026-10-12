# Pull request security checks

The `Security gates` workflow runs against the checked-out commit for pull
requests targeting `main` and for branch pushes. It does not publish or deploy
artifacts. The stable checks are:

- `Security gates / Build and syntax`
- `Security gates / npm audit`
- `Security gates / Secret scan`
- `Security gates / Security regression tests`
- `Security gates / Workflow policy`

The audit job covers both the root `package-lock.json` and the retained
`legacy/server/package-lock.json`. The workflow policy check requires explicit
top-level token permissions in every workflow and immutable full-SHA references
for external actions.

## Administrator setup

Repository settings cannot be changed by workflow files. An administrator must:

1. In **Settings → Rules → Rulesets** (or branch protection for `main`), require
   all five checks listed above, require branches to be up to date, and prevent
   bypass, force-push, and deletion as appropriate for the repository.
2. In **Settings → Code security and analysis**, enable Secret Scanning and
   Push protection when those features are available. The `Secret scan` check
   runs Gitleaks independently; enabling GitHub's native controls adds
   server-side detection and push blocking.
3. Confirm the checks have reported on the desired PR head commits before
   requiring them. Open PRs that predate this workflow may need their head
   branch updated or a check rerun after the workflow is available on `main`.
