import {parseImagePlacement,type ResponsiveImagePlacement} from './imagePlacement';
import type {HeroPosition} from '@/lib/venueEnhancements';
export const HOST_DIRECTORY_MEDIA_KEY='singhub-hosts-directory';
export const HOST_BOOTH_IMAGE='/images/hosts/hosts-booth.webp';
export const SITE_DISCOVERY_HERO_KEY='singhub-discovery-hero';
export const SITE_VENUES_HERO_KEY='singhub-venues-hero';
export const SITE_ACCOUNT_HERO_KEY='singhub-account-hero';
export const SITE_SINGBOARD_HERO_KEY='singhub-singboard-hero';
export const SITE_BACKYARD_HERO_KEY='singhub-backyard-hero';
export const SITE_HOTELS_INDEX_HERO_KEY='singhub-hotels-index-hero';
export const SITE_PARTNER_OFFERS_HERO_KEY='singhub-partner-offers-hero';
export const SITE_RADAR_HERO_KEY='singhub-radar-hero';
export const SITE_NEIGHBORHOODS_HERO_KEY='singhub-neighborhoods-hero';
export const SITE_SAN_DIEGO_KARAOKE_HERO_KEY='singhub-san-diego-karaoke-hero';
export const SITE_HERO_KEYS=[SITE_DISCOVERY_HERO_KEY,SITE_VENUES_HERO_KEY,SITE_ACCOUNT_HERO_KEY,SITE_SINGBOARD_HERO_KEY,SITE_BACKYARD_HERO_KEY,SITE_HOTELS_INDEX_HERO_KEY,SITE_RADAR_HERO_KEY,SITE_NEIGHBORHOODS_HERO_KEY,SITE_SAN_DIEGO_KARAOKE_HERO_KEY,SITE_PARTNER_OFFERS_HERO_KEY] as const;
export type HostMediaSettings={heroPlacement?:ResponsiveImagePlacement;portraitPlacement?:ResponsiveImagePlacement;portraitUrl?:string;portraitPosition?:HeroPosition;heroUrl?:string;heroAlt?:string;heroPosition?:HeroPosition;imageSource?:string;usageRights?:string;houseRules?:string;rotationPolicy?:string};
export function parseHostMediaSettings(input:unknown):HostMediaSettings{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Host media settings are required.');
 const value=input as Record<string,unknown>;const output:HostMediaSettings={};
 for(const key of ['portraitUrl','heroUrl','heroAlt','imageSource','usageRights','houseRules','rotationPolicy'] as const){
  if(value[key]===undefined)continue;
  const limit=key==='heroAlt'?300:key==='houseRules'||key==='rotationPolicy'?1200:2048;
  if(typeof value[key]!=='string'||value[key].length>limit)throw new Error(`Invalid ${key}.`);
  output[key]=value[key].trim();
 }
 for(const key of ['portraitUrl','heroUrl'] as const){if(output[key]){if(output[key]===HOST_BOOTH_IMAGE)continue;const url=new URL(output[key]!);if(!['https:','http:'].includes(url.protocol))throw new Error('Images must use HTTP or HTTPS.');}}
 for(const key of ['portraitPosition','heroPosition'] as const){if(value[key]!==undefined){if(!['center','top','bottom','left','right'].includes(String(value[key])))throw new Error('Invalid image focal point.');output[key]=value[key] as HeroPosition;}}
 if(output.heroUrl&&!output.heroAlt)throw new Error('Add a description for the hero image.');
 output.heroPlacement=parseImagePlacement(value.heroPlacement);output.portraitPlacement=parseImagePlacement(value.portraitPlacement);
 return output;
}
