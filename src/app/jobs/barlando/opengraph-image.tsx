import { ImageResponse } from "next/og";

export const alt = "BarLando is hiring bartenders, servers, and kitchen help in San Diego";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width:"100%",
          height:"100%",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
          background:"#f4f1e8",
          color:"#111318",
          border:"18px solid #111318",
          padding:"54px 64px",
          fontFamily:"Arial, sans-serif",
        }}
      >
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:8,textTransform:"uppercase",color:"#e5482d"}}>Wanted</div>
          <div style={{marginTop:8,fontSize:86,fontWeight:900,lineHeight:.93,textTransform:"uppercase"}}>Join the BarLando crew.</div>
          <div style={{marginTop:30,height:8,width:180,background:"#e5482d"}} />
        </div>

        <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
          {["BARTENDERS","SERVERS","KITCHEN HELP"].map((role)=>(
            <div key={role} style={{border:"4px solid #111318",padding:"15px 22px",fontSize:31,fontWeight:900}}>{role}</div>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"5px solid #111318",paddingTop:24}}>
          <div style={{fontSize:28,fontWeight:800}}>SAN DIEGO • ROLANDO / COLLEGE AREA</div>
          <div style={{fontSize:27,fontWeight:900,color:"#e5482d"}}>FULL AD ON SINGHUB</div>
        </div>
      </div>
    ),
    size,
  );
}
