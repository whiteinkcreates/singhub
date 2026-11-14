import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const sync=readFileSync('.github/workflows/sync-public-data.yml','utf8');
const validation=readFileSync('.github/workflows/validate.yml','utf8');
const exporter=readFileSync('scripts/sync-public-data.mjs','utf8');
const venueTsv=readFileSync('public/data/venues.tsv','utf8');

test('canonical exporter preserves every committed venue TSV column in exact order',()=>{
  const match=exporter.match(/const VENUE_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(match,'VENUE_COLUMNS not found');
  const exported=Array.from(match[1].matchAll(/"([^"]+)"/g),m=>m[1]);
  const published=venueTsv.split(/\r?\n/,1)[0].split('\t');
  assert.deepEqual(exported,published,'all venue fields, especially market, must survive canonical publication');
  assert.match(exporter,/market: clean\(row\.market\)/);
});

test('automated data PRs use built-in token and explicit SHA-bound validation',()=>{
  assert.doesNotMatch(sync,/SINGHUB_AUTOMATION_TOKEN/);
  assert.match(sync,/GH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(sync,/gh workflow run validate\.yml --ref "\$DATA_BRANCH"/);
  assert.match(sync,/--event workflow_dispatch --commit "\$DATA_SHA"/);
  assert.match(sync,/gh run watch "\$RUN_ID" --exit-status/);
  assert.match(sync,/--match-head-commit "\$DATA_SHA"/);
  assert.match(validation,/on:\s*\n\s*workflow_dispatch:/);
});

test('automatic source publication is not started by workflow-code pushes',()=>{
  assert.match(sync,/if: \(github\.event_name == 'schedule' \|\| github\.event_name == 'workflow_dispatch'\) && needs\.preflight\.outputs\.changed == 'true'/);
});
