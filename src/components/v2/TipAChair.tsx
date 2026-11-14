'use client';
import {useCallback,useEffect,useState} from 'react';
import {accountClient} from '@/lib/v2/singerAccount';
type Night={date:string;going:number;plan:{intent:'going'|'maybe'}|null};
export function TipAChair({venueSlug}:{venueSlug:string}){
 const [nights,setNights]=useState<Night[]>([]);
 const [selected,setSelected]=useState('');
 const [signedIn,setSignedIn]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);
  try{
   const {data}=await accountClient().auth.getSession();
   setSignedIn(Boolean(data.session));
   if(!data.session){setNights([]);return;}
   const res=await fetch('/api/venue-plans?venueSlug='+encodeURIComponent(venueSlug),{headers:{Authorization:'Bearer '+data.session.access_token},cache:'no-store'});
   const json=await res.json();if(!res.ok)throw new Error(json.error||'Could not load plans.');
   setNights(json.nights||[]);
   setSelected(current=>(json.nights||[]).some((night:Night)=>night.date===current)?current:(json.nights?.[0]?.date||''));
  }catch(error){setMessage(error instanceof Error?error.message:'Plans unavailable.');}
  finally{setLoading(false);}
 },[venueSlug]);
 useEffect(()=>{queueMicrotask(()=>void load());},[load]);
 const current=nights.find(n=>n.date===selected);
 async function save(intent:'going'|'maybe'|'none'){
  setSaving(true);setMessage('');
  try{
   const {data}=await accountClient().auth.getSession();if(!data.session)throw new Error('Sign in to plan your karaoke night.');
   const res=await fetch('/api/venue-plans',{method:'PUT',headers:{Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({venueSlug,date:selected,intent})});
   const result=await res.json();if(!res.ok)throw new Error(result.error||'Could not save your plan.');
   setMessage(intent==='none'?'Plan cleared.':intent==='going'?'Chair tipped! You can change your mind anytime.':'Saved as Maybe.');
   await load();
  }catch(error){setMessage(error instanceof Error?error.message:'Could not save your plan.');}
  finally{setSaving(false);}
 }
 return <section aria-label="Tip a Chair" className="tip-chair">
  <div className="tip-chair-head"><div><span>UPCOMING KARAOKE</span><h3>Tip a Chair</h3></div><p>Thinking of going? Show some interest in this night.</p></div>
  {!signedIn&&!loading?<a className="tip-chair-signin" href="/account?signin=1">Sign in to tip a chair</a>:null}
  {loading?<p className="tip-chair-message" role="status">Loading upcoming nights…</p>:null}
  {signedIn&&!loading&&!nights.length?<p className="tip-chair-message">Upcoming karaoke dates are being confirmed.</p>:null}
  {signedIn&&nights.length>0?<div className="tip-chair-fields">
   <div className="tip-chair-night">
    <label>Night <select value={selected} onChange={e=>setSelected(e.target.value)}>{nights.map(n=><option key={n.date} value={n.date}>{new Date(n.date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'})}</option>)}</select></label>
    <p className="tip-chair-count"><strong>{current?.going||0}</strong><span>chairs tipped</span></p>
   </div>
   <div className="tip-chair-actions">
    <button type="button" disabled={saving} aria-pressed={current?.plan?.intent==='going'} onClick={()=>void save('going')}>I&apos;m going</button>
    <button type="button" disabled={saving} aria-pressed={current?.plan?.intent==='maybe'} onClick={()=>void save('maybe')}>Maybe</button>
    {current?.plan?<button className="tip-chair-clear" type="button" disabled={saving} onClick={()=>void save('none')}>Clear plan</button>:null}
   </div>
   <small>Chairs are anonymous intentions, not confirmed attendance, a reservation or a check-in.</small>
  </div>:null}
  {message?<p className="tip-chair-message" role="status">{message}</p>:null}
 </section>;
}
