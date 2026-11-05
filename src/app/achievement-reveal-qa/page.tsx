import {notFound} from "next/navigation";
import {AchievementCelebrations} from "@/components/v2/AchievementCelebrations";
import type {AchievementEvent} from "@/lib/v2/achievementReveals";

export const dynamic="force-dynamic";
export const metadata={title:"SingHUB Achievement Stage Demo",robots:{index:false,follow:false}};

const DEMO_EVENTS:AchievementEvent[]=[{
 id:"demo-first-gig",badge_key:"first_gig",badge_level:1,
 event_kind:"unlocked",awarded_at:"2026-11-03T00:00:00Z",
},{
 id:"demo-building-a-setlist",badge_key:"building_a_setlist",badge_level:2,
 event_kind:"upgraded",awarded_at:"2026-11-03T00:01:00Z",
}];

export default function AchievementRevealQAPage(){
 // Only non-production builds expose synthetic demo awards. Real members never
 // receive demo records, and the demo has no Supabase client or DB writes.
 if(process.env.VERCEL_ENV==="production")notFound();
 return <main className="achievement-reveal-demo" style={{minHeight:"100dvh",background:"#090c18",color:"#fff",padding:"22px max(15px,calc((100vw - 950px)/2))"}}>
  <header style={{display:"grid",gap:"9px",padding:"18px 0 30px"}}>
   <p style={{fontSize:12,letterSpacing:3,color:"#8ceaff",fontWeight:900}}>SINGHUB DESIGN QA</p>
   <h1 style={{fontSize:"clamp(26px,5vw,44px)",fontWeight:900,margin:0}}>Achievement presentations</h1>
   <p style={{maxWidth:600,lineHeight:1.5,color:"#c8d5e7",margin:0}}>
    Visual demo only. First Gig opens automatically. Use the history below
    to replay it or preview a Level II upgrade. No real account or award is involved.
   </p>
  </header>
  <AchievementCelebrations userId={null} alias="Demo Singer" demoEvents={DEMO_EVENTS}/>
 </main>;
}
