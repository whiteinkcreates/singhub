export function hotelPlanReturnPath(path:string,venueSlug:string,saveHotel:boolean){
 const url=new URL(path,'https://singhub.app');
 if(url.origin!=='https://singhub.app')throw new Error('Invalid hotel return path.');
 url.searchParams.set('plan',venueSlug);url.searchParams.set('saveHotel',saveHotel?'1':'0');
 return url.pathname+url.search;
}
