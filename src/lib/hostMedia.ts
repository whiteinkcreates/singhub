import type {HeroPosition} from '@/lib/venueEnhancements';
export const HOST_DIRECTORY_MEDIA_KEY='singhub-hosts-directory';
export const HOST_BOOTH_IMAGE='/images/hosts/hosts-booth.webp';
export type HostMediaSettings={portraitUrl?:string;portraitPosition?:HeroPosition;heroUrl?:string;heroAlt?:string;heroPosition?:HeroPosition;imageSource?:string;usageRights?:string};
export function parseHostMediaSettings(input:unknown):HostMediaSettings{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Host media settings are required.');
 const value=input as Record<string,unknown>;const output:HostMediaSettings={};
 for(const key of ['portraitUrl','heroUrl','heroAlt','imageSource','usageRights'] as const){
  if(value[key]===undefined)continue;
  const limit=key==='heroAlt'?300:2048;
  if(typeof value[key]!=='string'||value[key].length>limit)throw new Error(`Invalid ${key}.`);
  output[key]=value[key].trim();
 }
 for(const key of ['portraitUrl','heroUrl'] as const){if(output[key]){if(output[key]===HOST_BOOTH_IMAGE)continue;const url=new URL(output[key]!);if(!['https:','http:'].includes(url.protocol))throw new Error('Images must use HTTP or HTTPS.');}}
 for(const key of ['portraitPosition','heroPosition'] as const){if(value[key]!==undefined){if(!['center','top','bottom','left','right'].includes(String(value[key])))throw new Error('Invalid image focal point.');output[key]=value[key] as HeroPosition;}}
 if(output.heroUrl&&!output.heroAlt)throw new Error('Add a description for the hero image.');
 return output;
}
