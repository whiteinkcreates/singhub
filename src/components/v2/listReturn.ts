"use client";
import {useEffect,useLayoutEffect,useRef} from 'react';

type Entry={version:1;at:number;y:number;state:unknown};
const prefix='singhub:list:v1:';
export function goBackToList(){
 let previous:string|undefined;
 try{previous=sessionStorage.getItem('singhub:last-list')||undefined;if(previous)sessionStorage.setItem('singhub:restore-list',previous);}catch{}
 const sameOrigin=document.referrer&&new URL(document.referrer).origin===location.origin;
 if(history.length>1&&sameOrigin)history.back();
 else location.assign(previous||'/find-karaoke');
}
export function useListReturn<T>(state:T,setState:(state:T)=>void){
 const current=useRef(state);const restoreState=useRef(setState);
 useLayoutEffect(()=>{current.current=state;restoreState.current=setState;},[state,setState]);
 useEffect(()=>{
  const path=location.pathname+location.search,key=prefix+path;
  function save(){try{sessionStorage.setItem(key,JSON.stringify({version:1,at:Date.now(),y:scrollY,state:current.current}));sessionStorage.setItem('singhub:last-list',path);}catch{}}
  const click=(event:MouseEvent)=>{const link=(event.target as Element)?.closest<HTMLAnchorElement>('a[href]');if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0&&new URL(link.href).pathname.startsWith('/venues/'))save();};
  document.addEventListener('click',click,true);window.addEventListener('pagehide',save);
  let raf=0;
  function restore(){
   try{
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
    const returning=navigation?.type==='back_forward'||sessionStorage.getItem('singhub:restore-list')===path;
    if(!returning)return;
    sessionStorage.removeItem('singhub:restore-list');const saved=JSON.parse(sessionStorage.getItem(key)||'null') as Entry|null;
    if(saved?.version!==1||Date.now()-saved.at>=3600000||!Number.isFinite(saved.y))return;
    queueMicrotask(()=>restoreState.current(saved.state as T));let frames=0;
    // A bfcache restore can overwrite a controlled input after pageshow. Restore
    // its DOM value alongside the retained React filter state in the next frame.
    const restoreFrame=()=>{
     const query=(saved.state as {query?:unknown})?.query;
     const input=document.querySelector<HTMLInputElement>('#venue-search');
     if(input&&typeof query==='string'&&input.value!==query)input.value=query;
     window.scrollTo({top:saved.y,behavior:'instant'});
     if(++frames<12)raf=requestAnimationFrame(restoreFrame);
    };cancelAnimationFrame(raf);raf=requestAnimationFrame(restoreFrame);
   }catch{}
  }
  restore();window.addEventListener('pageshow',restore);window.addEventListener('popstate',restore);
  return()=>{document.removeEventListener('click',click,true);window.removeEventListener('pagehide',save);window.removeEventListener('pageshow',restore);window.removeEventListener('popstate',restore);cancelAnimationFrame(raf);};
 },[]);
}
