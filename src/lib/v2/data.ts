import 'server-only';
import { unstable_cache } from 'next/cache';
import { getVenueListings } from '@/lib/venueData';
import { getKaraokeEventData,groupKaraokeEvents } from '@/lib/eventData';
import { getSanDiegoPublicVenues } from '@/lib/sanDiegoMarket';
import { getVenueEnhancement } from '@/lib/venueEnhancements';
import { getSanDiegoNightlifeWeekday } from '@/lib/nightlifeTime';
import { nightlifeDate } from '@/lib/tourStops';
import { makeVenueRow } from './presentation';
// Share the search-ready directory across requests. The weekday is an explicit
// cache key plus local nightlife date so next week's same weekday cannot reuse tonight's exceptions.
const getCachedDiscoveryData = unstable_cache(async (weekday:string,_nightlifeDate:string) => {
  const [venues,eventData]=await Promise.all([getVenueListings(),getKaraokeEventData()]);
  const publicVenues=getSanDiegoPublicVenues(venues);const events=groupKaraokeEvents(eventData.events);
  const rows=publicVenues.map(venue=>makeVenueRow(venue,events[venue.slug]||[],weekday,getVenueEnhancement(venue.slug)));
  return {rows,weekday,status:eventData.status};
}, ['singhub-public-discovery-rows-v2'], {revalidate:300,tags:['singhub-discovery-events']});

export async function getDiscoveryData(){
  return getCachedDiscoveryData(getSanDiegoNightlifeWeekday(),nightlifeDate());
}
