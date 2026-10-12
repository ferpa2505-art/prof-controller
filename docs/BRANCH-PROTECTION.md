# Protecting `main`

Repository branch protections are GitHub settings, not repository files. An administrator must apply these settings in **Settings → Rules → Rulesets** (or a branch protection rule) for `main`; this proposal does not change `main` or attempt to apply settings remotely.

Configure a ruleset targeting the `main` branch with enforcement active and an empty bypass list. Require:

- Pull requests before merging.
- At least one approval, dismiss stale approvals when new commits are pushed, and require approval of the most recent reviewable push.
- Approval from a code owner for changes covered by [`.github/CODEOWNERS`](../.github/CODEOWNERS).
- The `CI / validate` status check, with the branch required to be up to date before merging.
- All pull request conversations to be resolved.
- No force pushes and no branch deletion.
- No administrator, actor, or integration bypass.

If using classic branch protection instead of a ruleset, enable **Include administrators** and configure the equivalent requirements, including required status checks and conversation resolution. Do not leave any bypass actors or teams configured. Avoid overlapping rulesets or rules whose combined behavior is unclear.

`@ferpa2505-art` is the current code owner for sensitive paths. GitHub does not allow a pull request author to approve their own pull request. Before relying on this policy, add at least one other trusted reviewer with repository write access as a code owner for these paths. A solo code owner cannot approve their own sensitive change; do not weaken the rules to work around that limitation.

## Safe verification

1. In the repository settings UI, inspect the active ruleset or `main` branch protection rule and confirm every requirement above, including that the bypass list is empty and force pushes/deletion are blocked. This is read-only; do not test protections by pushing directly to `main`, force-pushing, deleting a branch, or attempting to bypass a rule.
2. An administrator can inspect classic branch protection with this read-only GitHub CLI request:

   ```sh
   gh api repos/ferpa2505-art/prof-controller/branches/main/protection
   ```

   Confirm `required_pull_request_reviews` has an approval count of at least `1`, stale-review dismissal and most-recent-push approval enabled; `required_status_checks` includes `CI / validate` and requires strict/up-to-date branches; `required_conversation_resolution.enabled` is true; `enforce_admins.enabled` is true; and both `allow_force_pushes.enabled` and `allow_deletions.enabled` are false. A ruleset is inspected in the UI under **Rules → Rulesets**; do not use write or update API calls for verification.
3. To check the PR workflow without touching `main`, open a draft pull request from a temporary branch. Confirm `CI / validate` runs and succeeds. If the draft changes a CODEOWNERS-covered path, confirm GitHub requests review from the matching code owner. Close the draft when finished. Do not merge it or create fake approvals; verify approval and conversation requirements in the settings UI.

If the protection API returns an authorization error, use the settings UI with an administrator rather than changing permissions or disabling protections.
