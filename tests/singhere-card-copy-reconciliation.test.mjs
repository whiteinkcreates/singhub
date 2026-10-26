import assert from 'node:assert/strict';import test from 'node:test';import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../src/app/venues/[slug]/page.tsx',import.meta.url),'utf8');
const cards=readFileSync(new URL('../src/components/v2/VenueRows.tsx',import.meta.url),'utf8');
const presentation=readFileSync(new URL('../src/lib/v2/presentation.ts',import.meta.url),'utf8');
test('Host signup URL is passed to venue SingHERE alongside tip URL',()=>{assert.match(page,/tipLink:h\.tipLink,signupLink:h\.signupLink/);});
test('No duplicated generic karaoke badges on venue cards',()=>{assert.doesNotMatch(cards,/'Public karaoke'/);assert.match(presentation,/'Karaoke venue'/);assert.match(presentation,/tag\.trim\(\)/);});
