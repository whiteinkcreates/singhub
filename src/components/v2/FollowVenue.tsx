'use client';
import {useEffect,useState} from 'react';
import {accountClient} from '@/lib/v2/singerAccount';
export function FollowVenue({venueId,venueSlug,venueName}:{venueId:string;venueSlug:string;venueName:string}){
 const [signedIn,setSignedIn]=useState(false),[following,setFollowing]=useState(false),[enabled,setEnabled]=useState(false);
 const [busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{let active=true;
  void (async()=>{try{
   const db=accountClient();const {data}=await db.auth.getUser();
   if(!active)return;setSignedIn(Boolean(data.user));
   if(data.user){const {data:row,error}=await db.from('singer_follows').select('notifications_enabled').eq('user_id',data.user.id).eq('target_type','venue').eq('target_id',venueId).maybeSingle();if(error)throw error;
    if(active){setFollowing(Boolean(row));setEnabled(Boolean(row?.notifications_enabled));}}
  }catch{if(active)setStatus('Follow status unavailable.');}finally{if(active)setLoaded(true);}})();
  return()=>{active=false;};
 },[venueId]);
 async function save(action:'follow'|'unfollow'|'alerts'){
  setBusy(true);setStatus('');
  try{
   const db=accountClient();const {data,error}=await db.auth.getUser();
   if(error||!data.user)throw Error('Sign in to follow this venue.');
   if(action==='unfollow'){
    const result=await db.from('singer_follows').delete().eq('user_id',data.user.id).eq('target_type','venue').eq('target_id',venueId);
    if(result.error)throw result.error;setFollowing(false);setEnabled(false);setStatus('Venue unfollowed.');
   }else if(action==='follow'){
    const result=await db.from('singer_follows').upsert({user_id:data.user.id,target_type:'venue',target_id:venueId,target_slug:venueSlug,target_name:venueName,notifications_enabled:false},{onConflict:'user_id,target_type,target_id'});
    if(result.error)throw result.error;setFollowing(true);setEnabled(false);setStatus('Following! Updates are off until you turn them on.');
   }else{
    const next=!enabled;
    const result=await db.from('singer_follows').update({notifications_enabled:next}).eq('user_id',data.user.id).eq('target_type','venue').eq('target_id',venueId).select('notifications_enabled').single();
    if(result.error)throw result.error;setEnabled(result.data.notifications_enabled);setStatus(next?'In-app venue updates enabled.':'Venue updates paused.');
   }
  }catch(e){setStatus(e instanceof Error?e.message:'Could not save your preference.');}
  finally{setBusy(false);}
 }
 return <section className="follow-venue" aria-label="Follow this venue"><div><strong>Keep this room on your radar</strong><p>Follow for your next karaoke night. Opt into in-app updates about upcoming karaoke and members planning to go.</p></div>
  {!loaded?<span>Loading…</span>:!signedIn?<a href="/account?signin=1">Sign in to follow →</a>:<>
   <button type="button" disabled={busy} aria-pressed={following} onClick={()=>void save(following?'unfollow':'follow')}>{following?'✓ Following · Unfollow':'+ Follow venue'}</button>
   {following?<label><input type="checkbox" disabled={busy} checked={enabled} onChange={()=>void save('alerts')}/> Show updates in My SingHUB</label>:null}
  </>}
  {status?<p role="status">{status}</p>:null}
 </section>;
}
