'use client';
import {useEffect,useState} from 'react';
import {useMap} from 'react-leaflet';
import {maplibreGL} from '@maplibre/maplibre-gl-leaflet';
import {setWorkerUrl} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './singHubBasemap.css';

// Keep the renderer worker on this deployment, using Next's emitted asset URL.
setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs',import.meta.url).toString());
const attribution='<a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const styles={night:'https://tiles.openfreemap.org/styles/dark',street:'https://tiles.openfreemap.org/styles/positron'};

/** Native vector styling, shared by discovery, venue, places and Tour maps. */
export function SingHubBasemap({theme='night'}:{theme?:'night'|'street'}){
 const map=useMap();const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;let layer:ReturnType<typeof maplibreGL>|undefined;let ready=false;
  const container=map.getContainer();container.dataset.mapStyle=theme;container.dataset.mapState='loading';
  const update=(value:typeof status)=>{if(active){container.dataset.mapState=value;setStatus(value);}};
  queueMicrotask(()=>update('loading'));
  const timer=setTimeout(()=>{if(!ready)update('error');},20000);
  try{
   layer=maplibreGL({style:styles[theme],attributionControl:{customAttribution:attribution}});
   layer.addTo(map);
   const renderer=layer.getMaplibreMap();
   renderer.on('idle',()=>{if(renderer.isStyleLoaded()&&renderer.areTilesLoaded()){ready=true;clearTimeout(timer);update('ready');}});
   renderer.on('error',()=>update('error'));
  }catch{queueMicrotask(()=>update('error'));}
  return()=>{active=false;clearTimeout(timer);layer?.remove();delete container.dataset.mapStyle;delete container.dataset.mapState;};
 },[map,theme,retry]);
 return status==='ready'?null:<div className="singhub-map-status" role="status">{status==='loading'?'Loading map…':<>The map could not finish loading. <button type="button" onClick={()=>setRetry(value=>value+1)}>Retry map</button></>}</div>;
}
