import type {KaraokeEventListing} from '@/types';
import type {SingHereConfig} from '@/lib/venueEnhancements';
import {eventRunsOnNight} from '@/lib/eventOccurrence';

/**
 * Verified host-night signup destinations.
 * A link belongs to a specific KJ on a verified venue rotation, never
 * to the venue as an all-week default.
 *
 * Add additional host-night destinations only after direct confirmation.
 */
const HOST_SIGNUPS:Readonly<Record<string,Readonly<Record<string,{url:string;label:string}>>>>={
  'jts-tavern': {
    will: {url:'https://amp-up-karaoke.lovable.app/',label:'Sign up with Will'},
  },
};

export function singHereForHostNight(
  venueSlug:string,
  events:readonly KaraokeEventListing[],
  weekday:string,
  base:SingHereConfig|undefined,
  hosts:readonly {hostId:string;hostName:string;publicDisplayName:string;tipLink?:string;signupLink?:string}[]=[]
):SingHereConfig|undefined {
  const active=events.filter(event=>eventRunsOnNight(event,weekday)&&event.activeStatus==='active');
  // Ambiguous rotations should never silently show a signup for the wrong host.
  if(active.length!==1)return {...base,kjName:undefined,kjTips:undefined};
  const host=active[0].hostName?.trim();
  if(!host)return {...base,kjName:undefined,kjTips:undefined};
  const key=host.toLocaleLowerCase('en-US');
  const verifiedOverride=HOST_SIGNUPS[venueSlug]?.[key];
  const byId=active[0].hostId?hosts.filter(h=>h.hostId===active[0].hostId):[];
  const normalized=(value:string)=>value.trim().toLowerCase();
  const byName=hosts.filter(h=>normalized(h.hostName)===key||normalized(h.publicDisplayName)===key);
  const matched=byId.length===1?byId[0]:byId.length===0&&byName.length===1?byName[0]:null;
  const signupLink=matched?.signupLink?.trim();
  const signup=verifiedOverride||(signupLink&&/^https:\/\//i.test(signupLink)?{url:signupLink,label:'Sign up with '+matched!.publicDisplayName}:undefined);
  const link=matched?.tipLink?.trim();
  const kjTips=link&&/^https:\/\//i.test(link)?[{label:'Tip '+matched!.publicDisplayName,url:link}]:undefined;
  if(!signup)return {...base,kjName:matched?.publicDisplayName,kjTips};
  return {
    ...base,
    kjName:matched?.publicDisplayName,
    kjTips,
    mode:'external',
    url:signup.url,
    title:'Ready to sing?',
    instructions:`${host} is hosting tonight. Use their signup page to join the karaoke rotation.`,
    linkLabel:signup.label,
  };
}
