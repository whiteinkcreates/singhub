'use client';

import {useEffect,useState} from 'react';
import {HOME_HEROES} from '@/lib/homeHeroPool';

const SESSION_KEY='singhub:home-hero:visit:v1';
const LAST_KEY='singhub:home-hero:last:v1';
const INITIAL=HOME_HEROES[0];

function safeGet(store:Storage,key:string):string|null {
  try{return store.getItem(key);}catch{return null;}
}
function safeSet(store:Storage,key:string,value:string):void {
  try{store.setItem(key,value);}catch{/* Private browsers may disallow storage. */}
}
function selectHero(){
  const saved=safeGet(window.sessionStorage,SESSION_KEY);
  const existing=HOME_HEROES.find(hero=>hero.id===saved);
  if(existing)return existing;

  const last=safeGet(window.localStorage,LAST_KEY);
  const eligible=HOME_HEROES.length>1?HOME_HEROES.filter(hero=>hero.id!==last):HOME_HEROES;
  const randomIndex=Math.floor(Math.random()*eligible.length);
  const chosen=eligible[randomIndex]||INITIAL;
  safeSet(window.sessionStorage,SESSION_KEY,chosen.id);
  safeSet(window.localStorage,LAST_KEY,chosen.id);
  return chosen;
}

/** One image per tab session, never a timed carousel.
 * Re-entering / from any SingHUB screen keeps the current hero.
 * Each new tab session chooses another, avoiding last-used where possible.
 */
export function HomepageHeroImage(){
  const [hero,setHero]=useState(INITIAL);
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    setHero(selectHero());
  },[]);

  return <picture className="landing-hero-picture">
    <img
      className="landing-hero-image"
      src={failed?INITIAL.src:hero.src}
      alt={failed?INITIAL.alt:hero.alt}
      style={{objectPosition:hero.position,'--mobile-hero-position':hero.mobilePosition} as React.CSSProperties}
      fetchPriority="high"
      decoding="async"
      onError={()=>setFailed(true)}
    />
  </picture>;
}
