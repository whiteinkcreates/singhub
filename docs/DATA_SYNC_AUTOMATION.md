# Canonical sync workflow authentication

GitHub requires approval for PR workflows created using the built-in GITHUB_TOKEN. The canonical sync previously created and immediately merged such a PR, expiring its unapproved validation run.

The sync now creates the PR using `SINGHUB_AUTOMATION_TOKEN`, waits for `Validate SingHUB` on the exact generated commit to succeed, and only then merges. Data guardrails, regression tests, lint/build validation, protected main and the merged-snapshot integrity audit remain enabled. A failed or missing validation leaves the PR open.

## One-time credential setup

Create a fine-grained GitHub personal access token for resource owner `whiteinkcreates`, restricted to the `singhub` repository. Grant repository permissions: Contents read-only, Pull requests read/write. Metadata read is automatic. The token is used only to create the PR; checkout, push, observing runs, merging and audit dispatch retain the built-in job token. Choose an expiration and renew the secret before it expires. A dedicated GitHub App installation token is an alternative for a future credential-lifecycle improvement.

In repository Settings > Secrets and variables > Actions, add the token as a repository secret named `SINGHUB_AUTOMATION_TOKEN`. Never paste the token into chat or commit it.

Until the secret is configured, unchanged scheduled polls still succeed. A changed-data publish stops before pushing a branch with a specific missing-secret error. Do not activate this workflow change until credential setup is complete.

## Acceptance

After credential setup and merge, verify a changed-data sync creates a PR whose Validate SingHUB run starts without manual approval. Confirm the sync waits for that run to succeed, merges the same head SHA, and the subsequent integrity audit passes. Do not fabricate canonical changes just to exercise this flow. The expired historical run cannot be retried or turned green.
