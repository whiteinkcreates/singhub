"use client";
import {useRef,useState} from "react";
import {toPng} from "html-to-image";
import {MyJacket} from "./MyJacket";
import type {Achievement} from "@/lib/v2/singerAccount";

/** Real award records only. These are typographic share cards, not unapproved patch illustrations. */
type DisplayPatch={name:string;className:string};
function savePng(dataUrl:string,name:string){
 const link=document.createElement("a");link.href=dataUrl;link.download=name;
 document.body.appendChild(link);link.click();link.remove();
}
function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55)||"singer";}
const panelStyle:React.CSSProperties={
 width:1080,height:1350,overflow:"hidden",color:"#fff",boxSizing:"border-box",
 background:"radial-gradient(circle at 18% 15%,rgba(14,206,231,.24),transparent 38%), radial-gradient(circle at 85% 75%,rgba(255,42,163,.26),transparent 43%), #080b16",
 fontFamily:"Barlow,Arial,sans-serif",padding:"66px 96px",
};
const logo="/images/singhub-v2/singhub-wordmark.png";
export function JacketShareStudio({alias,awards,skin,patches,performanceStars}:{
 alias:string;awards:Achievement[];skin:"denim"|"neon";patches:DisplayPatch[];performanceStars:number;
}){
 const portrait=useRef<HTMLDivElement>(null);
 const cards=useRef<Record<string,HTMLDivElement|null>>({});
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 async function exportNode(node:HTMLElement|null,file:string,key:string){
   if(!node||busy)return;
   setError("");setBusy(key);
   try{
     await document.fonts.ready;
     const url=await toPng(node,{pixelRatio:1,cacheBust:true,backgroundColor:"#080b16"});
     savePng(url,file);
   }catch(e){
     console.error("SingHUB Jacket share export",e);
     setError("Export wasn't available in this browser. Please try again.");
   }finally{setBusy(null);}
 }
 const owner=alias.trim()||"SingHUB singer";
 const safeOwner=safeName(owner);
 const n=awards.length;
 return <section className="jacket-share-studio" aria-label="Share My Jacket and earned badges">
   <h3>Share your karaoke story</h3>
   <p>Download a portrait with your jacket and close-ups of every earned patch. Each earned award also has its own share card for a carousel.</p>
   <button id="jacket-export-portrait" className="button primary" type="button" disabled={Boolean(busy)}
     onClick={()=>void exportNode(portrait.current,"singhub-"+safeOwner+"-jacket-portrait.png","portrait")}>
     {busy==="portrait"?"Preparing portrait…":"Download jacket portrait"}
   </button>
   {n>0&&<div className="jacket-share-awards">
     {awards.map(award=><button type="button" className="button" key={award.id} disabled={Boolean(busy)}
       onClick={()=>void exportNode(cards.current[award.id],"singhub-"+safeOwner+"-"+safeName(award.badge_name)+".png",award.id)}>
       {busy===award.id?"Preparing…":"Award card: "+award.badge_name}
     </button>)}
   </div>}
   {!n&&<p className="jacket-share-note">As soon as you earn a patch, its award card will appear here.</p>}
   {error&&<p role="alert" className="jacket-share-error">{error}</p>}
   {/* Offscreen export DOM stays rendered and measurable for html-to-image. */}
   <div aria-hidden="true" style={{position:"fixed",top:0,left:"-30000px",pointerEvents:"none",zIndex:-1}}>
     <div ref={portrait} style={panelStyle}>
       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
         <img src={logo} alt="" style={{width:272,height:"auto"}}/>
         <span style={{fontWeight:900,letterSpacing:4,fontSize:24,color:"#8beeff"}}>MY SINGHUB</span>
       </div>
       <div style={{marginTop:12,fontSize:66,fontWeight:900,textTransform:"uppercase",lineHeight:1.05}}>{owner}</div>
       <div style={{marginTop:6,fontSize:23,color:"#eac9ee"}}>{performanceStars} Performance Stars · {n} earned patches</div>
       <div style={{width:460,margin:"-5px auto 12px",filter:"drop-shadow(0 20px 22px rgba(0,0,0,.6))"}}>
         <MyJacket skin={skin} patches={patches} performanceStars={performanceStars} onPatch={()=>{}}/>
       </div>
       <div style={{borderTop:"2px solid rgba(255,255,255,.2)",paddingTop:20}}>
         <div style={{fontSize:28,fontWeight:900,letterSpacing:3,color:"#ff6bcc",marginBottom:12}}>EARNED ACHIEVEMENTS</div>
         <div style={{display:"grid",gridTemplateColumns:n>8?"repeat(4,1fr)":"repeat(2,1fr)",gap:10}}>
           {(n?awards:[{id:"empty",badge_name:"Your first patch is waiting",badge_key:"",awarded_at:""}]).map(a=>
             <div key={a.id} style={{minHeight:n>10?48:76,display:"flex",alignItems:"center",gap:12,border:"1px solid rgba(111,232,248,.45)",borderRadius:10,background:"rgba(2,11,29,.85)",padding:"10px 14px",boxSizing:"border-box"}}>
               <span style={{fontSize:n>10?22:34,color:"#ffcf49"}}>★</span>
               <div style={{fontSize:n>10?15:20,fontWeight:900}}>{a.badge_name}</div>
             </div>
           )}
         </div>
       </div>
       <div style={{marginTop:18,fontSize:17,letterSpacing:2,color:"#b6c6db",textAlign:"right"}}>SINGHUB.APP · MY JACKET</div>
     </div>
     {awards.map(award=><div key={award.id} ref={el=>{cards.current[award.id]=el;}}
       style={{...panelStyle,display:"flex",flexDirection:"column",justifyContent:"space-between",alignItems:"center",textAlign:"center"}}>
       <img src={logo} alt="" style={{width:350,height:"auto"}}/>
       <div style={{fontSize:26,letterSpacing:8,fontWeight:900,color:"#92eafd"}}>ACHIEVEMENT UNLOCKED</div>
       <div style={{width:500,height:500,borderRadius:80,border:"14px solid #f933ac",boxShadow:"0 0 90px rgba(255,34,172,.35),inset 0 0 70px rgba(25,205,240,.22)",display:"grid",placeItems:"center",fontSize:300,color:"#ffcf49",background:"#101b30"}}>★</div>
       <div style={{fontSize:82,fontWeight:900,lineHeight:1,textTransform:"uppercase"}}>{award.badge_name}</div>
       <div style={{fontSize:32,color:"#b8e5f5"}}>{owner} · My SingHUB</div>
       <div style={{fontSize:21,letterSpacing:4,color:"#c4b9d7"}}>SINGHUB.APP · KARAOKE COMMUNITY</div>
     </div>)}
   </div>
 </section>;
}
