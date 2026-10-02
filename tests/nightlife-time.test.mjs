import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const exports = {};
const source = readFileSync(new URL('../src/lib/nightlifeTime.ts', import.meta.url), 'utf8');
vm.runInNewContext(
  ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { exports, Intl, Date },
);
const { getSanDiegoNightlifeWeekday } = exports;

test('Friday hotel visits use Friday after the San Diego 4 a.m. rollover', () => {
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T10:59:59Z')), 'Thursday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T11:00:00Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T18:53:34Z')), 'Friday');
});

test('after-midnight guests keep Friday until Saturday at 4 a.m.', () => {
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T07:00:00Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T10:59:59Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T11:00:00Z')), 'Saturday');
});

test('rollover follows San Diego through both daylight-saving transitions', () => {
  for (const [before, after, previous, current] of [
    ['2026-03-08T10:59:59Z', '2026-03-08T11:00:00Z', 'Saturday', 'Sunday'],
    ['2026-11-01T11:59:59Z', '2026-11-01T12:00:00Z', 'Saturday', 'Sunday'],
    ['2026-10-05T10:59:59Z', '2026-10-05T11:00:00Z', 'Sunday', 'Monday'],
  ]) {
    assert.equal(getSanDiegoNightlifeWeekday(new Date(before)), previous);
    assert.equal(getSanDiegoNightlifeWeekday(new Date(after)), current);
  }
});
