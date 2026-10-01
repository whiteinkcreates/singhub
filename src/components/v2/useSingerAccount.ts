"use client";
import {useCallback,useEffect,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {accountClient,loadSingerAccount} from '@/lib/v2/singerAccount';
export function useSingerAccount(){
 const [user,setUser]=useState<User|null>(null);const [account,setAccount]=useState<Awaited<ReturnType<typeof loadSingerAccount>>|null>(null);const [error,setError]=useState('');
 const refresh=useCallback(async()=>{try{const client=accountClient();const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;setUser(data.user);if(data.user)setAccount(await loadSingerAccount(data.user.id));else setAccount(null);setError('');}catch(error){setError(error instanceof Error?error.message:'Your account could not load.');}},[]);
 useEffect(()=>{let subscription:{unsubscribe:()=>void}|undefined;queueMicrotask(()=>void refresh());try{subscription=accountClient().auth.onAuthStateChange(()=>{setTimeout(()=>void refresh(),0);}).data.subscription;}catch{}return()=>subscription?.unsubscribe();},[refresh]);
 return {user,account,error,refresh};
}
