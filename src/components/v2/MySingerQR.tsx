'use client';
import {useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';
import {accountClient} from '@/lib/v2/singerAccount';

export function MySingerQR({userId,alias}:{userId:string;alias:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [qr,setQr]=useState('');
 const [url,setUrl]=useState('');
 const [visible,setVisible]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 async function authorized(method:'GET'|'PATCH',value?:boolean){
  const {data,error:authError}=await accountClient().auth.getSession();
  if(authError||!data.session)throw new Error('Sign in again to access your personal QR.');
  const response=await fetch('/api/my-qr',{method,headers:{Authorization:'Bearer '+data.session.access_token,...(method==='PATCH'?{'Content-Type':'application/json'}:{})},...(method==='PATCH'?{body:JSON.stringify({discoverable:value})}:{}) ,cache:'no-store'});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'Could not load your QR.');
  return result as {id:string;discoverable:boolean};
 }
 async function open(){
  dialog.current?.showModal();setLoading(true);setError('');setQr('');
  try{
   const info=await authorized('GET');
   const link=location.origin+'/s/'+info.id;
   const image=await QRCode.toDataURL(link,{width:480,margin:2,color:{dark:'#070c14',light:'#ffffff'}});
   setUrl(link);setQr(image);setVisible(info.discoverable);
  }catch(err){setError(err instanceof Error?err.message:'QR unavailable.');}
  finally{setLoading(false);}
 }
 async function setPrivacy(checked:boolean){
  setLoading(true);setError('');
  try{const result=await authorized('PATCH',checked);setVisible(result.discoverable);}
  catch(err){setError(err instanceof Error?err.message:'Could not save your privacy setting.');}
  finally{setLoading(false);}
 }
 useEffect(()=>{setUrl('');setQr('');setVisible(false);},[userId]);
 return <>
  <button className="my-qr-tab" type="button" onClick={()=>void open()} aria-label="Show My QR"><span aria-hidden="true">▦</span> My QR</button>
  <dialog ref={dialog} className="my-qr-dialog" aria-label="My personal SingHUB QR" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
   <div className="my-qr-shell">
    <button type="button" className="my-qr-close" onClick={()=>dialog.current?.close()} aria-label="Close My QR">×</button>
    <p className="my-qr-eyebrow">My SingHUB · Personal QR</p>
    <h2>{alias||'My karaoke identity'}</h2>
    <p>Let someone scan to discover SingHUB. Your profile stays private unless you choose to share it.</p>
    {loading&&!qr?<p role="status">Preparing your QR…</p>:null}
    {qr?<img src={qr} alt="Your personal SingHUB QR code" width={240} height={240}/>:null}
    {url?<p className="my-qr-url">{url}</p>:null}
    {qr?<label className="my-qr-privacy"><input type="checkbox" disabled={loading} checked={visible} onChange={e=>void setPrivacy(e.target.checked)}/> Show my singer alias when someone scans</label>:null}
    {url?<button className="my-qr-copy" type="button" onClick={()=>void navigator.clipboard.writeText(url).catch(()=>setError('Copy failed. You can select the link above.'))}>Copy my link</button>:null}
    {error?<p role="alert" className="my-qr-error">{error}</p>:null}
   </div>
  </dialog>
 </>;
}
