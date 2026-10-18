import L from 'leaflet';
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
/** One approved SH pin for venue locations; the viewer's location stays a dot. */
export function createVenueMapPin(name:string,detail='Karaoke venue'){
 return L.divIcon({
  className:'singhub-venue-map-marker',
  html:`<span title="${escape(name+' · '+detail)}" style="display:block;width:48px;height:58px;filter:drop-shadow(0 0 6px rgba(255,25,168,.5)) drop-shadow(0 3px 5px rgba(0,0,0,.7))"><img src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" style="display:block;width:48px;height:58px;max-width:none;object-fit:contain" /></span>`,
  iconSize:[48,58],iconAnchor:[24,55],popupAnchor:[0,-52],
 });
}
