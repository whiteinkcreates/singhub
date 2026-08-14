# SingHUB Public Data Sync Runbook

The public finder reads validated snapshots from `public/data`. Google Sheets is the operational source of truth, but the website does not query schedules from Sheets at request time.

## Required secrets

Store these as GitHub Actions secrets and Vercel server-side environment variables. Never prefix them with `NEXT_PUBLIC_` and never commit them to the repository.

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEETS_ID` if the canonical workbook differs from `config/data-sources.json`

The service account needs read-only access to the canonical workbook.

## Review a candidate sync

1. Run the `Sync public karaoke data` GitHub Action.
2. Download the `singhub-public-data-candidate` artifact.
3. Review `sync-validation-report.md`, `sync-diff-report.md`,
   `generated_events_review.tsv`, and `live_only_events_review.tsv`.
4. Fix canonical Sheet rows if guardrails fail. Do not lower thresholds merely to make CI green.

Generated venue schedule candidates are review-only. Promote a candidate by creating or correcting the corresponding row in `Events_Canonical`, not by copying it directly into `events_by_night.tsv`.

Rows in `live_only_events_review.tsv` exist in the committed public snapshot but not
in the authoritative candidate. Preserve intentional retirements in the canonical
workbook's `Live_Only_Event_Review` tab. A hand-entered event may disappear only
when its event ID is recorded in `config/approved-live-only-removals.json`.

The sync also rejects stable venue IDs that switch to a different slug and address.
Assign a new venue ID for a new venue, then update the corresponding
`Events_Canonical` references.

## Publish validated data

From a clean feature branch with the Google credentials configured:

```bash
npm run sync:data -- --write
npm run check:data
npm run lint
npm run build
```

The write command creates a timestamped local backup in `.data-backups`, validates temporary candidate files, and replaces public files only after guardrails pass. Review the Git diff and publish through a pull request.

## Recover from a bad snapshot

1. Stop the merge or deployment.
2. Locate the newest good files in `.data-backups/<timestamp>` or Git history.
3. Restore only the affected files in `public/data`.
4. Run `npm run check:data` and `npm run build`.
5. Open a focused pull request explaining what failed and which snapshot was restored.

Do not run the sync again until the canonical Sheet or sync logic that caused the bad output has been corrected.

## Failure signals

- GitHub Action failure means credentials, Sheet access, source data, or guardrails need attention.
- A stale-data banner means the deployed snapshot exceeds `SINGHUB_MAX_DATA_AGE_DAYS`, seven days by default.
- An unexpected 200 response from `/admin/scout` without credentials is a security failure. Run `SINGHUB_SMOKE_BASE_URL=https://preview.example npm run smoke:admin` against previews.
