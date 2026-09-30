import { getKaraokeEventsByVenueSlug } from '@/lib/eventData';
import { getVenueListingBySlug } from '@/lib/venueData';
import { isPublicVenue } from '@/lib/publicVenueFilters';
import { NextRequest } from 'next/server';
const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const codes=['SU','MO','TU','WE','TH','FR','SA'];
function escape(value:string){return value.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');}
function clock(value:string){const match=value.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);if(!match)return null;let hour=Number(match[1]);if(match[3])hour=hour%12+(match[3].toLowerCase()==='pm'?12:0);if(hour>23||Number(match[2]||0)>59)return null;return String(hour).padStart(2,'0')+(match[2]||'00')+'00';}
export async function GET(request:NextRequest){
 const slug=request.nextUrl.searchParams.get('venue')||'';const venue=await getVenueListingBySlug(slug);if(!venue||!isPublicVenue(venue))return new Response('Venue not found',{status:404});
 const events=await getKaraokeEventsByVenueSlug(slug);const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SingHUB//Karaoke//EN','CALSCALE:GREGORIAN'];let count=0;
 for(const event of events){const day=weekdays.findIndex(day=>event.karaokeDay.toLowerCase()===day.toLowerCase());const time=clock(event.startTime);if(day<0||!time)continue;count++;
  const localDate=new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});const date=new Date(localDate+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+(day-date.getUTCDay()+7)%7);const stamp=date.toISOString().slice(0,10).replaceAll('-','');
  lines.push('BEGIN:VEVENT','UID:'+escape(event.eventId)+'@singhub.app','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;TZID=America/Los_Angeles:'+stamp+'T'+time,'RRULE:FREQ=WEEKLY;BYDAY='+codes[day],'SUMMARY:'+escape('Karaoke at '+venue.venueName),'LOCATION:'+escape(venue.address),'DESCRIPTION:'+escape([event.hostName,event.eventNotes,'https://singhub.app/venues/'+venue.slug].filter(Boolean).join('\n')),'END:VEVENT');
 }
 if(!count)return new Response('No confirmed calendar event',{status:404});lines.push('END:VCALENDAR');
 return new Response(lines.join('\r\n'),{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="'+venue.slug.replace(/[^a-z0-9-]/gi,'')+'.ics"'}});
}
