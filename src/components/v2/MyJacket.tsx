/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';
// Coordinates are copied literally from singer.html. No fabricated awards.
const slots=[[31,29,-7],[43,28,4],[56,29,-3],[69,29,6],[30,40,4],[43,40,-5],[56,40,5],[70,40,-4],[30,51,-5],[43,51,4],[56,51,-3],[70,51,5],[30,62,5],[43,62,-4],[56,62,3],[70,62,-5],[30,73,-3],[43,73,5],[56,73,-4],[70,73,4],[31,84,4],[44,84,-5],[57,84,5],[69,84,-3]];
const stars=[[15,35,-7],[12,43,6],[16,51,-4],[12,59,8],[16,67,-5],[12,75,5],[16,83,-7],[11,88,4],[19,91,-4],[85,35,7],[88,43,-6],[84,51,4],[88,59,-8],[84,67,5],[88,75,-5],[84,83,7],[89,88,-4],[81,91,4]];
export function MyJacket({skin,patches=[],performanceStars=0,onPatch}:{skin:'denim'|'neon';patches?:{name:string;className:string;level?:number}[];performanceStars?:number;onPatch:(patch:{name:string;className:string})=>void}){
 return <div className="jacket-layer" data-jacket-layer aria-label="Achievement jacket with 24 fixed patch spaces">
   <img src={'/images/singhub-v2/jacket-'+(skin==='neon'?'neon':'denim')+'-blank.png'} alt={(skin==='neon'?'Black neon premium':'Denim')+' SingHUB achievement jacket'} data-jacket-image />
   {slots.map(([x,y,r],index)=>{const patch=patches[index];const style={left:x+'%',top:y+'%','--r':r+'deg', ...(patch?.level===2?{outline:'3px solid #ff2aa3',boxShadow:'0 0 20px rgba(255,42,163,.9), inset 0 0 9px rgba(255,42,163,.45)'}:{})} as CSSProperties;return patch?<button key={index} className={'patch-slot earned '+patch.className} style={style} onClick={()=>onPatch(patch)} aria-label={'Open '+patch.name+' patch'} title={patch.name+(patch.level===2?' · Level II':' · Level I')} />:<span key={index} className="patch-slot empty" style={style} title="Open patch space" />;})}
   {stars.slice(0,performanceStars).map(([x,y,r],index)=><span className="performance-star" key={index} style={{left:x+'%',top:y+'%','--r':r+'deg'} as CSSProperties} title="SR · Singer-reported performance" aria-label="Self-reported performance star">★<abbr className="star-sr" title="Self-reported performance">SR</abbr></span>)}
   {performanceStars>stars.length?<span title={`${performanceStars} total singer-reported performance stars`} aria-label={`${performanceStars-stars.length} additional performance stars beyond the visible sleeve positions`} style={{position:"absolute",left:"78%",top:"91%",fontSize:"11px",fontWeight:900,color:"#fff",background:"#a02083",padding:"2px 6px",borderRadius:"8px",boxShadow:"0 0 12px rgba(255,42,163,.4)"}}>+{performanceStars-stars.length}</span>:null}
 </div>;
}
