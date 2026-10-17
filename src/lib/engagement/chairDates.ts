import {nightlifeDate} from '@/lib/tourStops';
export function upcomingNightlifeDates(days=21,now=new Date()){
 const today=nightlifeDate(now);
 const base=new Date(today+'T12:00:00Z');
 return Array.from({length:days},(_,i)=>{const day=new Date(base);day.setUTCDate(day.getUTCDate()+i);return day.toISOString().slice(0,10);});
}
export function validChairDate(date:string,allowed:readonly string[]){
 return /^\d{4}-\d{2}-\d{2}$/.test(date)&&allowed.includes(date);
}
