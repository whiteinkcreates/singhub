/** The public Founding Eight eligibility descriptions. Keep in sync with
 * src/lib/achievements/catalog.ts when that pending frontend PR is integrated.
 * Automatic grants are still determined by the server/database, never this UI. */
export type PatchRule = { key: string; name: string; howToEarn: string; category: "Performance"|"Exploration"|"Community" };
export const PATCH_RULES: readonly PatchRule[] = [
  {key:"first_gig",name:"First Gig",howToEarn:"Record your first karaoke performance in My SingHUB.",category:"Performance"},
  {key:"building_a_setlist",name:"Building a Setlist",howToEarn:"Record 10 performances for Level I; 20 for Level II.",category:"Performance"},
  {key:"born_performer",name:"Born Performer",howToEarn:"Record 25 performances for Level I; 100 for Level II.",category:"Performance"},
  {key:"mic_crawl",name:"Mic Crawl",howToEarn:"Collect Tour Stops at 5 distinct confirmed venues; 10 for Level II. Visits may be self-reported.",category:"Exploration"},
  {key:"mix_it_up",name:"Mix It Up",howToEarn:"Record performances at 3 different karaoke venues; 7 for Level II.",category:"Performance"},
  {key:"the_traveller",name:"The Traveller",howToEarn:"Collect Tour Stops at 3 different confirmed venues on one karaoke night; 5 for Level II.",category:"Exploration"},
  {key:"sing_along_superstar",name:"Sing-Along Superstar",howToEarn:"Receive 3 independent witnessed nominations for the same venue and night, then SingHUB admin approval.",category:"Community"},
  {key:"cheer_captain",name:"Cheer Captain",howToEarn:"Receive 3 independent witnessed nominations for supporting singers at the same venue and night, then SingHUB admin approval.",category:"Community"},
];
