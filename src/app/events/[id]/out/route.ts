import { NextResponse } from "next/server";
import { getSingBoardEvent, recordSingBoardEventMetric } from "@/lib/singboard/repository";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const event=await getSingBoardEvent(id);
  if(!event?.linkUrl)return NextResponse.redirect(new URL(`/events/${id}`,process.env.NEXT_PUBLIC_SITE_URL||"https://singhub.app"));
  await recordSingBoardEventMetric(id,"outbound_click");
  return NextResponse.redirect(event.linkUrl);
}
