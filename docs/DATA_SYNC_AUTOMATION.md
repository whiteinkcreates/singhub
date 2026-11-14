# Canonical sync workflow authentication and safeguards

The SingHUB canonical-to-public sync polls the primary `SingHUB Source of Truth` Google workbook and publishes **validated data only** through GitHub pull requests. It does not sync from the separate venue-review database.

## GitHub Actions authentication

The prior `SINGHUB_AUTOMATION_TOKEN` fine-grained PAT failed on November 14, 2026, at `gh pr create` with `Resource not accessible by personal access token (createPullRequest)`. The pipeline now uses the repo-scoped built-in `GITHUB_TOKEN` with explicit `contents: write`, `pull-requests: write`, and `actions: write` permissions.

**Repository setting:** In Settings > Actions > General > Workflow permissions, **Allow GitHub Actions to create and approve pull requests** must be enabled. Without this setting, the job fails closed and does not publish a new snapshot. The unrelated, expiring `SINGHUB_AUTOMATION_TOKEN` is no longer used by this workflow. Do not paste credential values into chat or source.

## Required validation gate

GitHub intentionally does not start a normal `pull_request` workflow from a PR created using `GITHUB_TOKEN`. After creating the PR, the sync job explicitly dispatches `validate.yml` on **the exact new data branch**, finds the `workflow_dispatch` run for the candidate commit SHA, and waits for the complete workflow to succeed before squash-merging that exact SHA.

A missing dispatch, wrong commit, failed validation, missing GitHub permission, or rejected PR leaves the PR unmerged. Source freshness, intentional removals, stable IDs, public-visibility, integrity and committed data minimum checks remain in place.

## Trigger and source rules

Scheduled source changes and a deliberate `workflow_dispatch` can publish through the guarded PR pipeline. Merely pushing source/workflow code on `main` does **not** publish a new canonical snapshot. This prevents a maintenance merge from unexpectedly advancing karaoke data.

The exporter now preserves the canonical `market` field at the same TSV column position as the published data; dropping this field previously made all venue rows appear modified and risked erasing their market grouping.

## Verify after activation

A successful workflow source change must show: source preflight -> validated candidate -> data PR -> `validate.yml` workflow_dispatch on exact commit -> successful lint/build and data tests -> exact-SHA merge -> data integrity audit. The GitHub Workflow permissions setting must allow PR creation, and any remaining canonical drift must be reviewed before trusting automatic updates. Do not silently weaken the recency/removal guardrails to silence a failing audit.
