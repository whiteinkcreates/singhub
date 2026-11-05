import type {ReactNode} from "react";

/** Stage-only symbols, not replacements for the approved collectible patch art. */
export function AchievementSymbol({badgeKey}:{badgeKey:string}){
 let art:ReactNode;
 switch(badgeKey){
  case "first_gig":
   art=<><rect x="29" y="7" width="32" height="51" rx="16"/><path d="M18 41v4c0 17 12 29 27 29s27-12 27-29v-4M45 74v18M27 92h36M33 27h24M33 38h24"/></>;
   break;
  case "building_a_setlist":
   art=<><rect x="18" y="8" width="54" height="84" rx="7"/><path d="M30 25h30M30 40h30M30 56h18M30 73h30"/><path d="M54 53v20c-4-2-10 1-10 5 0 6 10 6 10-1"/></>;
   break;
  case "born_performer":
   art=<><path d="m45 6 12 27 30 4-22 21 6 31-26-15-26 15 6-31L3 37l30-4Z"/><path d="M45 25v23m-12-8 12 8 12-8" strokeWidth="3"/></>;
   break;
  case "mic_crawl":
   art=<><path d="M20 18c-8 0-14 6-14 14 0 11 14 22 14 22s14-11 14-22c0-8-6-14-14-14ZM70 47c-8 0-14 6-14 14 0 11 14 22 14 22s14-11 14-22c0-8-6-14-14-14Z"/><circle cx="20" cy="32" r="4"/><circle cx="70" cy="61" r="4"/><path d="M28 64c12 0 18-4 18-13S44 34 54 34" strokeDasharray="4 8"/></>;
   break;
  case "mix_it_up":
   art=<><path d="M13 26h17c23 0 18 43 43 43h8"/><path d="m70 58 11 11-11 11M13 73h17c11 0 14-8 18-16M53 39c5-8 11-12 20-12h8"/><path d="m70 16 11 11-11 11"/></>;
   break;
  case "the_traveller":
   art=<><path d="m10 22 22-10 25 10 23-10v64L57 86 32 76 10 86Z"/><path d="M32 12v64M57 22v64"/><path d="M19 61c9-18 15 9 28-8s16-12 24-22" strokeDasharray="4 8"/></>;
   break;
  case "sing_along_superstar":
   art=<><circle cx="45" cy="23" r="11"/><circle cx="19" cy="39" r="8"/><circle cx="71" cy="39" r="8"/><path d="M26 78V66c0-12 8-20 19-20s19 8 19 20v12M5 76V66c0-8 6-14 13-14M85 76V66c0-8-6-14-13-14"/><path d="m45 59 4 7 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1Z" strokeWidth="2.5"/></>;
   break;
  case "cheer_captain":
   art=<><path d="M17 59V35c0-6 11-6 11 0v-9c0-6 11-6 11 0v-8c0-6 11-6 11 0v12c0-6 12-6 12 0v26l8-11c4-5 12 1 8 7L61 80c-5 6-10 9-20 9-14 0-24-12-24-30Z"/><path d="m12 16 6-7M67 10l7-6M71 27h12"/></>;
   break;
  default:
   art=<path d="m45 6 12 27 30 4-22 21 6 31-26-15-26 15 6-31L3 37l30-4Z"/>;
 }
 return <svg viewBox="0 0 90 100" width="96" height="108" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{art}</svg>;
}
