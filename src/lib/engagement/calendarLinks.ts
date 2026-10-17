const TIME=/^\s*(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)\s*$/i;
export function calendarClock(raw:string){
 const match=raw.match(TIME);
 if(!match)return null;
 let hour=Number(match[1])%12;
 if(match[3].toUpperCase()==='PM')hour+=12;
 return hour*60+Number(match[2]);
}
function localStamp(date:string,minute:number,dayOffset:number){
 const value=new Date(date+'T12:00:00Z');
 if(Number.isNaN(value.valueOf()))return null;
 value.setUTCDate(value.getUTCDate()+dayOffset);
 const day=value.toISOString().slice(0,10).replaceAll('-','');
 return day+'T'+String(Math.floor(minute/60)).padStart(2,'0')+String(minute%60).padStart(2,'0')+'00';
}
/** No guessed closing times, recurrence or duration. All timestamps are venue-local. */
export function karaokeCalendarUrl(input:{date:string;venueName:string;startTime:string;endTime:string;hostName?:string|null;venueUrl:string}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date))return null;
 const start=calendarClock(input.startTime),end=calendarClock(input.endTime);
 if(start===null||end===null)return null;
 const offset=end<=start?1:0;
 const from=localStamp(input.date,start,0),to=localStamp(input.date,end,offset);
 if(!from||!to)return null;
 const title='Karaoke at '+input.venueName;
 const params=new URLSearchParams({action:'TEMPLATE',text:title,dates:from+'/'+to,ctz:'America/Los_Angeles',details:'Planned via SingHUB. Check venue for schedule updates. '+(input.hostName?'Hosted by '+input.hostName+'. ':'')+'https://singhub.app'+input.venueUrl,location:input.venueName});
 return 'https://calendar.google.com/calendar/render?'+params.toString();
}
