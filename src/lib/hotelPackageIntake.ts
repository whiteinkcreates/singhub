type Source={slug:string;hotelSiteUrl?:string};
export function normalizeHotelPackageUrl(value:string){
 let url:URL;try{url=new URL(value.trim());}catch{return null;}
 if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
 return url.hostname.toLowerCase().replace(/^www\./,'')+url.pathname.replace(/\/+$/,'').toLowerCase();
}
export function resolveHotelPackageUrl(value:string,sources:readonly Source[]){
 const normalized=normalizeHotelPackageUrl(value);if(!normalized)return {status:'invalid' as const};
 const matches=sources.filter(source=>source.hotelSiteUrl&&normalizeHotelPackageUrl(source.hotelSiteUrl)===normalized);
 if(matches.length!==1)return {status:'unmatched' as const};
 return {status:'matched' as const,slug:matches[0].slug};
}
