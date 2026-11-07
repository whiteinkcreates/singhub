/** Block older source facts from replacing newer published corrections. */
function verifiedDate(value) {
  const text=String(value??'').trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return null;
  const date=new Date(text+'T12:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===text?text:null;
}
function comparable(field,value){
  const text=String(value??'').trim();
  if(['latitude','longitude'].includes(field)&&text&&Number.isFinite(Number(text)))return String(Number(text));
  return text;
}
export function staleVerifiedChanges(previous,candidates,{idColumn,fields}) {
  const published=new Map(previous.map(row=>[row[idColumn],row]));
  return candidates.flatMap(candidate=>{
    const current=published.get(candidate[idColumn]);
    if(!current)return [];
    const currentDate=verifiedDate(current.last_verified);
    const candidateDate=verifiedDate(candidate.last_verified);
    if(!currentDate||(candidateDate&&candidateDate>=currentDate))return [];
    const changed=fields.filter(field=>comparable(field,current[field])!==comparable(field,candidate[field]));
    return changed.length?[{id:candidate[idColumn],publishedDate:currentDate,candidateDate,fields:changed}]:[];
  });
}
export const VENUE_FACT_FIELDS=['venue_name','slug','address','latitude','longitude','karaoke_day','start_time','end_time','host_name'];
export const EVENT_FACT_FIELDS=['venue_id','venue_slug','karaoke_day','start_time','end_time','host_id','host_name','host_display_name','recurring'];
