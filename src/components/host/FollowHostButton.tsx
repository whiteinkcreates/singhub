"use client";
import {useEffect,useState} from "react";
import {accountClient} from "@/lib/v2/singerAccount";
type Props={hostId:string;hostSlug:string;hostName:string};
export function FollowHostButton({hostId,hostSlug,hostName}:Props){
 const [following,setFollowing]=useState(false),[working,setWorking]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{let active=true;let client:ReturnType<typeof accountClient>;try{client=accountClient();}catch{return()=>{active=false;};}void client.auth.getUser().then(async ({data})=>{if(!data.user)return;const {data:entry}=await client.from("singer_follows").select("target_id").eq("user_id",data.user.id).eq("target_type","host").eq("target_id",hostId).maybeSingle();if(active)setFollowing(Boolean(entry));}).catch(()=>{});return()=>{active=false;};},[hostId]);
 async function toggle(){
  if(working)return;setWorking(true);setMessage("");
  try{
   const client=accountClient();const {data,error}=await client.auth.getUser();if(error&&error.name!=="AuthSessionMissingError")throw error;
   if(!data.user){location.assign("/account?followHost="+encodeURIComponent(hostSlug));return;}
   if(following){const result=await client.from("singer_follows").delete().eq("user_id",data.user.id).eq("target_type","host").eq("target_id",hostId);if(result.error)throw result.error;setFollowing(false);setMessage("Unfollowed.");}
   else{const result=await client.from("singer_follows").upsert({user_id:data.user.id,target_type:"host",target_id:hostId,target_slug:hostSlug,target_name:hostName,notifications_enabled:false},{onConflict:"user_id,target_type,target_id"});if(result.error)throw result.error;setFollowing(true);setMessage("Following. You'll find this KJ in My SingHUB.");}
  }catch(e){setMessage(e instanceof Error?e.message:"Could not update your following.");}
  finally{setWorking(false);}
 }
 return <span className="host-follow-control"><button type="button" className="host-follow-button" aria-pressed={following} disabled={working} onClick={()=>void toggle()}>{working?"Saving…":following?"✓ Following":"+ Follow KJ"}</button><span className={message.includes("Could not")||message.includes("unavailable")?"host-follow-error":"sr-only"} role="status">{message}</span></span>;
}
