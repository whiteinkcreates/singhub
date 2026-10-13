import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = new URL("../",import.meta.url);
function source(path) { return readFileSync(new URL(path,root),"utf8"); }
const catalog = source("src/lib/achievements/catalog.ts");
const migration = source("supabase/achievements-founding-eight.sql");
const nominate = source("src/app/api/achievements/nominations/route.ts");
const admin = source("src/app/api/admin/achievements/route.ts");

const automatic = [
  "first_gig","building_a_setlist","born_performer",
  "mic_crawl","mix_it_up","the_traveller",
];
const nominated = ["sing_along_superstar","cheer_captain"];

test("exactly the agreed eight founding achievement keys",()=>{
  const keys = [...catalog.matchAll(/key: "([a-z_]+)"/g)].map(match=>match[1]);
  assert.deepEqual(keys,[...automatic,...nominated]);
  assert.equal(new Set(keys).size,8);
});

test("every automatic catalogue award is granted by the database trigger",()=>{
  for (const key of automatic) assert.match(migration,new RegExp("'"+key+"'"));
  assert.match(migration,/AFTER INSERT OR UPDATE OR DELETE ON public\.singer_performances/);
  assert.match(migration,/AFTER INSERT OR UPDATE OR DELETE ON public\.singer_venue_visits/);
  assert.match(migration,/count\(DISTINCT venue_id\)/);
  assert.match(migration,/GROUP BY nightlife_date/);
  assert.match(migration,/GREATEST\(public\.singer_achievements\.level,EXCLUDED\.level\)/);
});

test("audience awards need signed-in independent nominators and admin approval",()=>{
  for (const key of nominated) assert.ok(catalog.includes(key));
  assert.match(migration,/achievement_nomination_not_self/);
  assert.match(migration,/achievement_nomination_one_per_night/);
  assert.match(nominate,/authenticatedSinger\(request\)/);
  assert.match(nominate,/nominee\.data\.user_id === user\.id/);
  assert.match(nominate,/>= 5/);
  assert.match(admin,/uniqueNominators\.size < 3/);
  assert.match(admin,/requireAdminAuthorization\(\)/);
  assert.match(migration,/ALTER TABLE public\.achievement_nominations ENABLE ROW LEVEL SECURITY/);
  assert.doesNotMatch(migration,/CREATE POLICY[^\\n]*ON public\\.achievement_nominations/);
});

test("personal QR has an opaque random token and does not expose the user's email",()=>{
  assert.match(migration,/nomination_token uuid NOT NULL DEFAULT gen_random_uuid\(\)/);
  assert.match(migration,/singer_profiles_nomination_token_unique/);
  const publicPage = source("src/app/nominate/[token]/page.tsx");
  assert.match(publicPage,/\.select\("karaoke_alias"\)/);
  assert.doesNotMatch(publicPage,/email,/);
});
