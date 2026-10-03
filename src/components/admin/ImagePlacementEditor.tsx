"use client";
import {useId,useState,useRef} from 'react';
import {legacyPlacement,type ResponsiveImagePlacement,type ImagePlacement,type ImageViewport} from '@/lib/imagePlacement';
import {PositionedImage} from '@/components/media/PositionedImage';

export function ImagePlacementEditor({src,alt,label,value,position='center',onChange,shape='hero',fit='cover'}:{src:string;alt:string;label:string;value?:ResponsiveImagePlacement;position?:string;onChange:(value:ResponsiveImagePlacement)=>void;shape?:'hero'|'square'|'gallery';fit?:'cover'|'contain'}) {
  const aspect=useRef(1);const id=useId();const [viewport,setViewport]=useState<ImageViewport>('desktop');
  const defaults=legacyPlacement(position);const current=value||{desktop:{...defaults},mobile:{...defaults}};
  const selected=current[viewport];
  function edit(patch:Partial<ImagePlacement>){onChange({...current,[viewport]:{...selected,...patch}});}
  function nudge(axis:'x'|'y',amount:number){const contained=axis==='x'?Math.min(1,aspect.current):Math.min(1,1/aspect.current);const direction=fit==='contain'&&contained*selected.zoom<=1?-1:1;edit({[axis]:Math.max(0,Math.min(100,selected[axis]+amount*direction))});}
  const button='rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white disabled:opacity-40';
  return <section aria-label={`${label} placement`} className="space-y-3 rounded-xl border border-white/15 bg-slate-950/60 p-3 text-white">
    <h4 className="text-sm font-bold">{label} placement</h4>
    <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} viewport`}>{(['desktop','mobile'] as const).map(mode=><button type="button" key={mode} aria-pressed={viewport===mode} className={button+(viewport===mode?' bg-cyan-300/20':'')} onClick={()=>setViewport(mode)}>{mode==='desktop'?'Desktop':'Mobile'}</button>)}</div>
    <div className="grid items-start gap-3 sm:grid-cols-[1fr_120px]">{(['desktop','mobile'] as const).map(mode=><figure key={mode}><figcaption className="mb-1 text-xs text-slate-400">{mode==='desktop'?'Desktop':'Mobile'}</figcaption><div className="overflow-hidden rounded-lg bg-black" style={{aspectRatio:shape==='square'?'1':shape==='gallery'?'4 / 3':mode==='desktop'?'16 / 9':'4 / 5'}}><PositionedImage onLoad={event=>{aspect.current=event.currentTarget.naturalWidth/event.currentTarget.naturalHeight||1;}} src={src} alt={alt} placement={current} viewport={mode} className="h-full w-full" style={{objectFit:fit}} /></div></figure>)}</div>
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Move ${label.toLowerCase()} image`}><button type="button" className={button} aria-label={`Move ${label.toLowerCase()} image left`} onClick={()=>nudge('x',5)}>← Left</button><button type="button" className={button} aria-label={`Move ${label.toLowerCase()} image right`} onClick={()=>nudge('x',-5)}>Right →</button><button type="button" className={button} aria-label={`Move ${label.toLowerCase()} image up`} onClick={()=>nudge('y',5)}>↑ Up</button><button type="button" className={button} aria-label={`Move ${label.toLowerCase()} image down`} onClick={()=>nudge('y',-5)}>↓ Down</button></div>
    {(['x','y','zoom'] as const).map(axis=><label key={axis} htmlFor={`${id}-${axis}`} className="block text-xs font-bold">{axis==='x'?'Horizontal focus':axis==='y'?'Vertical focus':'Zoom'} · {axis==='zoom'?`${selected[axis].toFixed(2)}×`:`${selected[axis]}%`}<input id={`${id}-${axis}`} aria-label={`${label} ${viewport} ${axis==='x'?'horizontal focus':axis==='y'?'vertical focus':'zoom'}`} type="range" min={axis==='zoom'?1:0} max={axis==='zoom'?3:100} step={axis==='zoom'?0.05:1} value={selected[axis]} onChange={event=>edit({[axis]:Number(event.target.value)})} className="mt-2 block w-full accent-cyan-300" /></label>)}
    <div className="flex flex-wrap gap-2"><button type="button" className={button} onClick={()=>edit({...defaults})}>Reset {viewport} crop</button><button type="button" className={button} onClick={()=>onChange({...current,[viewport==='desktop'?'mobile':'desktop']:{...selected}})}>Copy to {viewport==='desktop'?'mobile':'desktop'}</button></div>
    <p className="text-xs font-normal text-slate-400">Desktop and mobile save separately. Zoom in if the photo has no extra space to move. Changes are a draft until saved.</p>
  </section>;
}
