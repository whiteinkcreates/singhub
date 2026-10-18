'use client';

import {useState,useSyncExternalStore} from 'react';
import type {CSSProperties} from 'react';
import {HOME_HEROES} from '@/lib/homeHeroPool';

const SESSION_KEY='singhub:home-hero:visit:v1';
const LAST_KEY='singhub:home-hero:last:v1';
const INITIAL=HOME_HEROES[0];
const FALLBACK_SRC='/images/singhub-v2/singhub-city-discovery.webp';

function safeGet(store:Storage,key:string):string|null {
  try{return store.getItem(key);}catch{return null;}
}
function safeSet(store:Storage,key:string,value:string):void {
  try{store.setItem(key,value);}catch{/* Storage can be unavailable in private mode. */}
}
function currentHeroId(){
  if(typeof window==='undefined')return INITIAL.id;
  const id=safeGet(window.sessionStorage,SESSION_KEY);
  return HOME_HEROES.find(hero=>hero.id===id)?.id||INITIAL.id;
}
function subscribeHero(onChange:()=>void){
  // The external store owns the selection. React reads its snapshot;
  // no synchronous setState inside a React effect is necessary.
  const saved=safeGet(window.sessionStorage,SESSION_KEY);
  if(!HOME_HEROES.some(hero=>hero.id===saved)){
    const last=safeGet(window.localStorage,LAST_KEY);
    const eligible=HOME_HEROES.length>1?HOME_HEROES.filter(hero=>hero.id!==last):HOME_HEROES;
    const chosen=eligible[Math.floor(Math.random()*eligible.length)]||INITIAL;
    safeSet(window.sessionStorage,SESSION_KEY,chosen.id);
    safeSet(window.localStorage,LAST_KEY,chosen.id);
  }
  onChange();
  return ()=>{};
}

/** A randomly selected hero persists in the browser tab's session.
 * Returning to / from Discovery does not cause a change.
 * A new session avoids the previous selection when possible.
 */
export function HomepageHeroImage(){
  const id=useSyncExternalStore(subscribeHero,currentHeroId,()=>INITIAL.id);
  const hero=HOME_HEROES.find(item=>item.id===id)||INITIAL;
  const [failed,setFailed]=useState(false);

  return <picture className="landing-hero-picture" style={{'--hero-photo':`url("${failed?FALLBACK_SRC:hero.src}")`} as CSSProperties}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="landing-hero-image"
      src={failed?FALLBACK_SRC:hero.src}
      alt={failed?'San Diego karaoke at night':hero.alt}
      style={{objectPosition:hero.position,'--mobile-hero-position':hero.mobilePosition} as CSSProperties}
      fetchPriority="high"
      decoding="async"
      onError={()=>{if(!failed)setFailed(true);}}
    />
  </picture>;
}
