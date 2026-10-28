"use client";
export async function prepareMonthlyMicPhoto(file:File):Promise<File>{
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Choose a JPG, PNG or WebP image.");
 const bitmap=await createImageBitmap(file);
 try{
  const maxSide=1800, scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image processing unavailable.");
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",0.8));
  if(!blob)throw new Error("Could not prepare image.");
  if(blob.size>3.5*1024*1024)throw new Error("This image is too large. Try a smaller photo.");
  return new File([blob],(file.name.replace(/\.[^.]+$/,"")||"monthlymic")+".jpg",{type:"image/jpeg"});
 }finally{bitmap.close();}
}
export async function readMonthlyMicResponse(response:Response){
 const type=response.headers.get("content-type")||"";
 if(!type.includes("application/json")){
  if(response.status===413)return {error:"Photo is too large for upload. Please choose a smaller image."};
  if(response.status===401||response.status===403)return {error:"Your admin session may have expired. Refresh the page and sign in again."};
  return {error:"Upload request failed (HTTP "+response.status+"). Please try again."};
 }
 return response.json();
}
