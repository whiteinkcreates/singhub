import 'server-only';
import { getVenueListings } from '@/lib/venueData';
import { getKaraokeEventData,groupKaraokeEvents } from '@/lib/eventData';
import { getSanDiegoPublicVenues } from '@/lib/sanDiegoMarket';
import { getVenueEnhancement } from '@/lib/venueEnhancements';
import { getSanDiegoNightlifeWeekday } from '@/lib/nightlifeTime';
import { makeVenueRow } from './presentation';
export async function getDiscoveryData(){
  const [venues,eventData]=await Promise.all([getVenueListings(),getKaraokeEventData()]);
  const publicVenues=getSanDiegoPublicVenues(venues);const events=groupKaraokeEvents(eventData.events);const weekday=getSanDiegoNightlifeWeekday();
  const rows=publicVenues.map(venue=>makeVenueRow(venue,events[venue.slug]||[],weekday,getVenueEnhancement(venue.slug)));
  return {rows,weekday,status:eventData.status};
}
