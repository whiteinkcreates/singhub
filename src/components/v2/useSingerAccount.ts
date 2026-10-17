'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {accountClient,loadSingerAccount} from '@/lib/v2/singerAccount';
export function useSingerAccount(){
 const [user,setUser]=useState<User|null>(null);
 const [account,setAccount]=useState<Awaited<ReturnType<typeof loadSingerAccount>>|null>(null);
 const [error,setError]=useState('');const [ready,setReady]=useState(false);
 const generation=useRef(0);
 const refresh=useCallback(async()=>{
  const current=++generation.current;
  setReady(false);setAccount(null);setError('');
  try{
   const client=accountClient();const {data,error}=await client.auth.getUser();
   if(current!==generation.current)return;
   if(error&&error.name!=='AuthSessionMissingError')throw error;
   setUser(data.user);
   const loaded=data.user?await loadSingerAccount(data.user.id):null;
   if(current===generation.current)setAccount(loaded);
  }catch(error){
   if(current===generation.current){setUser(null);setAccount(null);setError(error instanceof Error?error.message:'Your account could not load.');}
  }finally{if(current===generation.current)setReady(true);}
 },[]);
 useEffect(()=>{
  let subscription:{unsubscribe:()=>void}|undefined;
  let timer:ReturnType<typeof setTimeout>|undefined;
  let active=true;const requests=generation;
  queueMicrotask(()=>{if(active)void refresh();});
  try{
   subscription=accountClient().auth.onAuthStateChange((_event,session)=>{
    // Clear the previous member immediately and reject their in-flight reads.
    ++generation.current;setAccount(null);setReady(false);setUser(session?.user??null);
    clearTimeout(timer);timer=setTimeout(()=>{if(active)void refresh();},0);
   }).data.subscription;
  }catch{}
  return()=>{active=false;++requests.current;clearTimeout(timer);subscription?.unsubscribe();};
 },[refresh]);
 return {user,account,error,ready,refresh};
}
