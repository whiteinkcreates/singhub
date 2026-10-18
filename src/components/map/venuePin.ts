import L from 'leaflet';
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
/** One approved SH pin for venue locations; the viewer's location stays a dot. */
export function createVenueMapPin(name:string,detail='Karaoke venue',privateRoom=false){
 return L.divIcon({
  className:'singhub-venue-map-marker',
  html:`<span title="${escape(name+' · '+(privateRoom?'Private karaoke rooms · ':'')+detail)}" style="position:relative;display:block;width:48px;height:58px;filter:drop-shadow(0 0 6px ${privateRoom?'rgba(0,200,255,.95)':'rgba(255,25,168,.5)'}) drop-shadow(0 3px 5px rgba(0,0,0,.7))"><img src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" style="display:block;width:48px;height:58px;max-width:none;object-fit:contain" />${privateRoom?'<small class="singhub-private-room-tag" style="position:absolute;left:50%;top:-8px;transform:translateX(-50%);padding:2px 4px;border:1px solid #56ddff;border-radius:4px;background:#063349;color:#d9f8ff;font:800 9px/1.2 Arial,sans-serif;letter-spacing:.03em;white-space:nowrap">PRIVATE</small>':''}</span>`,
  iconSize:[48,58],iconAnchor:[24,55],popupAnchor:[0,-52],
 });
}
