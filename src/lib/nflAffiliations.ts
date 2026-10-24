import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

export type NflAffiliation = { venueId: string; team: string; teamCode: string; affiliationType: string };
const FILE = path.join(process.cwd(), 'public/data/nfl_venue_affiliations.csv');

/** Only reviewed affiliations are exposed. Conflicted observations remain in source data for review. */
export function getPublicNflAffiliations(): NflAffiliation[] {
  if (!fs.existsSync(FILE)) return [];
  const lines = fs.readFileSync(FILE, 'utf8').trim().split(/\r?\n/);
  return lines.slice(1).flatMap(line => {
    // CSV fields before verification_note contain no commas in the canonical seed.
    const fields = line.split(',');
    const [venueId, team, teamCode, affiliationType, confidence] = fields;
    if (!venueId || !team || !teamCode || !['high','medium'].includes(confidence)) return [];
    return [{venueId, team, teamCode, affiliationType}];
  });
}
