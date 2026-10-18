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
  base:SingHereConfig|undefined
):SingHereConfig|undefined {
  const active=events.filter(event=>eventRunsOnNight(event,weekday)&&event.activeStatus==='active');
  // Ambiguous rotations should never silently show a signup for the wrong host.
  if(active.length!==1)return base;
  const host=active[0].hostName?.trim();
  if(!host)return base;
  const key=host.toLocaleLowerCase('en-US');
  const signup=HOST_SIGNUPS[venueSlug]?.[key];
  if(!signup)return base;
  return {
    ...base,
    mode:'external',
    url:signup.url,
    title:'Ready to sing?',
    instructions:`${host} is hosting tonight. Use their signup page to join the karaoke rotation.`,
    linkLabel:signup.label,
  };
}
