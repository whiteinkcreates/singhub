import type {CSSProperties} from 'react';

export type ImagePlacement = {x:number;y:number;zoom:number};
export type ResponsiveImagePlacement = {desktop:ImagePlacement;mobile:ImagePlacement};
export type ImageViewport = 'desktop'|'mobile';

export function legacyPlacement(position = 'center'): ImagePlacement {
  return {x:position==='left'?0:position==='right'?100:50,y:position==='top'?0:position==='bottom'?100:50,zoom:1};
}

export function parseImagePlacement(input:unknown): ResponsiveImagePlacement|undefined {
  if(input===undefined)return undefined;
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid image placement.');
  const value=input as Record<string,unknown>;
  const read=(key:ImageViewport):ImagePlacement=>{
    const raw=value[key];
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error(`Invalid ${key} image placement.`);
    const crop=raw as Record<string,unknown>;
    for(const [field,min,max] of [['x',0,100],['y',0,100],['zoom',1,3]] as const){
      if(typeof crop[field]!=='number'||!Number.isFinite(crop[field])||crop[field]<min||crop[field]>max)throw new Error(`Invalid ${key} image ${field}.`);
    }
    return {x:crop.x as number,y:crop.y as number,zoom:crop.zoom as number};
  };
  return {desktop:read('desktop'),mobile:read('mobile')};
}

export function placementStyle(placement?:ResponsiveImagePlacement,position?:string,viewport?:ImageViewport):CSSProperties {
  if(!placement)return position?{objectPosition:position}:{};
  const desktop=placement[viewport||'desktop'];const mobile=placement[viewport||'mobile'];
  return {
    '--image-desktop-position':`${desktop.x}% ${desktop.y}%`,
    '--image-mobile-position':`${mobile.x}% ${mobile.y}%`,
    '--image-desktop-zoom':desktop.zoom,
    '--image-mobile-zoom':mobile.zoom,
  } as CSSProperties;
}
