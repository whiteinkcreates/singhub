"use client";
import {useEffect,useState} from "react";
import {prepareMonthlyMicPhoto,readMonthlyMicResponse} from "@/lib/monthlyMicUpload.client";
type Item={id:string;image_url:string;alt_text:string;status:string;contributor_name:string|null;created_at:string};
export default function MonthlyMicMediaAdmin(){
 const [items,setItems]=useState<Item[]>([]),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 async function reload(){try{const r=await fetch("/api/admin/monthlymic/media",{cache:"no-store"});if(!r.ok)throw Error("Couldn't load photo list");const j=await r.json();setItems(j.items||[]);}catch(e){setStatus(e instanceof Error?e.message:"Could not load");}}
 useEffect(()=>{
  let active=true;
  fetch("/api/admin/monthlymic/media",{cache:"no-store"})
   .then(r=>{if(!r.ok)throw Error("Couldn't load photo list");return r.json();})
   .then(j=>{if(active)setItems(j.items||[]);})
   .catch(e=>{if(active)setStatus(e instanceof Error?e.message:"Could not load");});
  return ()=>{active=false};
 },[]);
 async function upload(form:FormData){setBusy(true);setStatus("Uploading…");try{const file=form.get("file");if(!(file instanceof File))throw Error("Choose an image.");form.set("file",await prepareMonthlyMicPhoto(file));const r=await fetch("/api/admin/monthlymic/media",{method:"POST",body:form});const j=await readMonthlyMicResponse(r);if(!r.ok)throw Error(j.error||"Upload failed");setStatus("Photo added to public gallery.");await reload();}catch(e){setStatus(e instanceof Error?e.message:"Upload failed");}finally{setBusy(false);}}
 async function setApproval(id:string,value:string){setBusy(true);try{const r=await fetch("/api/admin/monthlymic/media",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:value})});if(!r.ok)throw Error("Could not update photo");await reload();}catch(e){setStatus(e instanceof Error?e.message:"Update failed");}finally{setBusy(false);}}
 return <section className="mt-10 rounded-2xl border border-white/20 p-5"><h2 className="text-2xl font-black">MonthlyMic photos</h2><p className="mt-2 text-sm text-slate-300">Upload your own photos or approve attendee submissions. Only approved photos appear publicly.</p><form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={e=>{e.preventDefault();void upload(new FormData(e.currentTarget));}}><label className="text-sm">Photo<input className="mt-2 block" name="file" type="file" accept="image/jpeg,image/png,image/webp" required/></label><label className="text-sm">Caption / description<input className="mt-2 block rounded-lg p-2 text-slate-950" name="alt" defaultValue="The Mesa at MonthlyMic #001"/></label><button disabled={busy} className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950">Upload photo</button></form><p role="status" className="mt-3 text-sm text-cyan-200">{status}</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><div key={item.id} className="rounded-lg border border-white/15 p-3"><img src={item.image_url} alt={item.alt_text} className="aspect-video w-full rounded-lg object-cover"/><p className="mt-2 text-sm">{item.contributor_name||"SingHUB"} · {item.status}</p><div className="mt-3 flex gap-2">{item.status!=="approved"&&<button disabled={busy} onClick={()=>void setApproval(item.id,"approved")} className="rounded bg-cyan-300 px-3 py-1 text-xs font-bold text-black">Approve</button>}{item.status!=="rejected"&&<button disabled={busy} onClick={()=>void setApproval(item.id,"rejected")} className="rounded border px-3 py-1 text-xs">Hide</button>}</div></div>)}</div></section>;
}
