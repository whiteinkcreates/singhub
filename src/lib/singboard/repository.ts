import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type SingBoardRegion = "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";
export type SingBoardPostType = "image" | "note";
export type SingBoardNoteColor = "yellow" | "pink" | "blue" | "green" | "white";
export type SingBoardPosterType = "venue" | "kj" | "admin";
export type PersistedSingBoardPost = { id:string; postType:SingBoardPostType; title:string; venue:string; neighborhood:string; region:SingBoardRegion; detail:string; x:number; y:number; rotation:number; imageUrl?:string; noteText?:string; noteColor?:SingBoardNoteColor; pinned:true; eventDate:string; startTime?:string; hostName?:string; linkUrl?:string };
export type SingBoardEvent = Omit<PersistedSingBoardPost,"pinned"> & { status:"active"|"archived" };
export type SingBoardMetricType = "event_page_view" | "outbound_click";
export type SingBoardAccessMember = { id:string; displayName:string; posterType:SingBoardPosterType; venueId?:string; hostId?:string; active:boolean; createdAt:string; updatedAt:string };
type SingBoardPostRow = {
  id:string;
  post_type:string|null;
  title:string;
  venue_name:string;
  neighborhood:string;
  region:string;
  detail:string|null;
  image_url:string|null;
  note_text:string|null;
  note_color:string|null;
  event_date:string;
  start_time:string|null;
  host_name:string|null;
  link_url:string|null;
  x:number|string;
  y:number|string;
  rotation:number|string;
  status?:string|null;
};

function hashAccessCode(code:string){return createHash("sha256").update(code.trim()).digest("hex")}
function sanDiegoDate(){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));return `${values.year}-${values.month}-${values.day}`}
function mapPost(row:SingBoardPostRow){return {id:row.id,postType:(row.post_type||"image") as SingBoardPostType,title:row.title,venue:row.venue_name,neighborhood:row.neighborhood,region:row.region as SingBoardRegion,detail:row.detail||"",x:Number(row.x),y:Number(row.y),rotation:Number(row.rotation),imageUrl:row.image_url||undefined,noteText:row.note_text||undefined,noteColor:row.note_color as SingBoardNoteColor|undefined,eventDate:row.event_date,startTime:row.start_time||undefined,hostName:row.host_name||undefined,linkUrl:row.link_url||undefined}}

export async function getActiveSingBoardFlyers():Promise<PersistedSingBoardPost[]> {const supabase=createAdminClient();const today=sanDiegoDate();const{error:archiveError}=await supabase.from("singboard_flyers").update({status:"archived",archived_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("status","active").lt("event_date",today);if(archiveError)throw new Error(`Failed to archive expired SingBOARD posts: ${archiveError.message}`);const{data,error}=await supabase.from("singboard_flyers").select("id,post_type,title,venue_name,neighborhood,region,detail,image_url,note_text,note_color,event_date,start_time,host_name,link_url,x,y,rotation").eq("status","active").order("pinned_at",{ascending:true});if(error)throw new Error(`Failed to load SingBOARD posts: ${error.message}`);return(data||[]).map(row=>({...mapPost(row as SingBoardPostRow),pinned:true as const}))}
export async function getSingBoardEvent(id:string):Promise<SingBoardEvent|null>{const supabase=createAdminClient();const{data,error}=await supabase.from("singboard_flyers").select("id,post_type,title,venue_name,neighborhood,region,detail,image_url,note_text,note_color,event_date,start_time,host_name,link_url,x,y,rotation,status").eq("id",id).maybeSingle();if(error)throw new Error(`Failed to load SingBOARD event: ${error.message}`);if(!data)return null;const row=data as SingBoardPostRow;const status=(row.status==="archived"||row.event_date<sanDiegoDate())?"archived":"active";return {...mapPost(row),status}}
export async function recordSingBoardEventMetric(flyerId:string,metricType:SingBoardMetricType){const supabase=createAdminClient();const{error}=await supabase.from("singboard_event_metrics").insert({flyer_id:flyerId,metric_type:metricType});if(error)console.error(`Failed to record SingBOARD metric ${metricType}:`,error.message)}

export async function getAuthorizedSingBoardPoster(accessCode:string){const supabase=createAdminClient();const{data,error}=await supabase.from("singboard_posters").select("id,display_name,poster_type,venue_id,host_id").eq("access_code_hash",hashAccessCode(accessCode)).eq("active",true).maybeSingle();if(error)throw new Error(`Failed to verify SingBOARD access: ${error.message}`);return data}
export async function listSingBoardAccessMembers():Promise<SingBoardAccessMember[]>{const supabase=createAdminClient();const{data,error}=await supabase.from("singboard_posters").select("id,display_name,poster_type,venue_id,host_id,active,created_at,updated_at").order("active",{ascending:false}).order("display_name",{ascending:true});if(error)throw new Error(`Failed to load SingBOARD access members: ${error.message}`);return(data||[]).map(row=>({id:row.id,displayName:row.display_name,posterType:row.poster_type as SingBoardPosterType,venueId:row.venue_id||undefined,hostId:row.host_id||undefined,active:Boolean(row.active),createdAt:row.created_at,updatedAt:row.updated_at}))}
export async function createSingBoardAccessMember(input:{displayName:string;posterType:SingBoardPosterType;accessCode:string;venueId?:string;hostId?:string}){const displayName=input.displayName.trim();const code=input.accessCode.trim();if(!displayName)throw new Error("Name is required.");if(code.length<8)throw new Error("Access code must be at least 8 characters.");const supabase=createAdminClient();const{error}=await supabase.from("singboard_posters").insert({display_name:displayName,poster_type:input.posterType,venue_id:input.venueId?.trim()||null,host_id:input.hostId?.trim()||null,access_code_hash:hashAccessCode(code),active:true});if(error)throw new Error(error.code==="23505"?"That access code is already assigned.":`Failed to create SingBOARD access: ${error.message}`)}
export async function rotateSingBoardAccessCode(memberId:string,accessCode:string){const code=accessCode.trim();if(code.length<8)throw new Error("Access code must be at least 8 characters.");const supabase=createAdminClient();const{error}=await supabase.from("singboard_posters").update({access_code_hash:hashAccessCode(code),updated_at:new Date().toISOString()}).eq("id",memberId);if(error)throw new Error(error.code==="23505"?"That access code is already assigned.":`Failed to replace SingBOARD access code: ${error.message}`)}
export async function setSingBoardAccessActive(memberId:string,active:boolean){const supabase=createAdminClient();const{error}=await supabase.from("singboard_posters").update({active,updated_at:new Date().toISOString()}).eq("id",memberId);if(error)throw new Error(`Failed to update SingBOARD access: ${error.message}`)}
export async function createSingBoardPost(input:{posterId:string;postType:SingBoardPostType;title:string;venueName:string;neighborhood:string;region:SingBoardRegion;detail:string;imageUrl?:string;imagePublicId?:string;noteText?:string;noteColor?:SingBoardNoteColor;eventDate:string;startTime?:string;hostName?:string;linkUrl?:string;x:number;y:number;rotation:number}){const supabase=createAdminClient();const{data,error}=await supabase.from("singboard_flyers").insert({poster_id:input.posterId,post_type:input.postType,title:input.title,venue_name:input.venueName,neighborhood:input.neighborhood,region:input.region,detail:input.detail,image_url:input.imageUrl||null,image_public_id:input.imagePublicId||null,note_text:input.noteText||null,note_color:input.noteColor||null,event_date:input.eventDate,start_time:input.startTime||null,host_name:input.hostName||null,link_url:input.linkUrl||null,x:input.x,y:input.y,rotation:input.rotation,status:"active"}).select("id").single();if(error)throw new Error(`Failed to publish SingBOARD post: ${error.message}`);return data.id as string}
export async function archiveSingBoardPost(postId:string,accessCode:string){const poster=await getAuthorizedSingBoardPoster(accessCode);if(!poster)throw new Error("Invalid or inactive SingBOARD access code.");const supabase=createAdminClient();const{data:post,error:loadError}=await supabase.from("singboard_flyers").select("poster_id").eq("id",postId).maybeSingle();if(loadError)throw new Error(`Failed to load SingBOARD post: ${loadError.message}`);if(!post)throw new Error("SingBOARD post not found.");if(post.poster_id!==poster.id&&poster.poster_type!=="admin")throw new Error("That access code cannot remove this post.");const{error}=await supabase.from("singboard_flyers").update({status:"archived",archived_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",postId);if(error)throw new Error(`Failed to archive SingBOARD post: ${error.message}`)}
