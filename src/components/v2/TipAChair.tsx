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
 useEffect(()=>{void load();},[load]);
 const current=nights.find(n=>n.date===selected);
 async function save(intent:'going'|'maybe'|'none'){
  setSaving(true);setMessage('');
  try{
   const {data}=await accountClient().auth.getSession();if(!data.session)throw new Error('Sign in to plan your karaoke night.');
   const res=await fetch('/api/venue-plans',{method:'PUT',headers:{Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({venueSlug,date:selected,intent})});
   const result=await res.json();if(!res.ok)throw new Error(result.error||'Could not save your plan.');
   setMessage(intent==='none'?'Your chair is no longer tipped.':intent==='going'?'Chair tipped! You can change your mind anytime.':'Saved as Maybe.');
   await load();
  }catch(error){setMessage(error instanceof Error?error.message:'Could not save your plan.');}
  finally{setSaving(false);}
 }
 return <section aria-label="Tip a Chair" className="tip-chair">
  <div className="tip-chair-head"><div><span>UPCOMING KARAOKE</span><h3>Tip a Chair</h3></div><span aria-hidden="true">♬</span></div>
  <p>Thinking of going? Let other SingHUB singers know there is interest in this night.</p>
  {!signedIn&&!loading?<a href="/account?signin=1">Sign in to tip a chair →</a>:null}
  {loading?<p role="status">Loading upcoming nights…</p>:null}
  {signedIn&&!loading&&!nights.length?<p>Upcoming karaoke dates are being confirmed.</p>:null}
  {signedIn&&nights.length>0?<div className="tip-chair-fields">
   <label>Night <select value={selected} onChange={e=>setSelected(e.target.value)}>{nights.map(n=><option key={n.date} value={n.date}>{new Date(n.date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'})}</option>)}</select></label>
   <p><strong>{current?.going||0}</strong> chairs tipped by SingHUB members</p>
   <div className="tip-chair-actions">{(['going','maybe','none'] as const).map(intent=><button key={intent} type="button" disabled={saving} aria-pressed={(current?.plan?.intent||'none')===intent} onClick={()=>void save(intent)}>{intent==='going'?"I'm going":intent==='maybe'?'Maybe':'Not going'}</button>)}</div>
   <small>Your plan is private by default. Totals are anonymous SingHUB intentions, not confirmed attendance or a venue capacity forecast.</small>
  </div>:null}
  {message?<p role="status">{message}</p>:null}
 </section>;
}
