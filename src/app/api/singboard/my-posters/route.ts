import {NextResponse} from "next/server";
import {listAuthorizedSingBoardPostersForToken} from "@/lib/singboard/repository";

export const dynamic="force-dynamic";
export async function GET(request:Request){
 const token=request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1]||"";
 if(!token)return NextResponse.json({posters:[]},{headers:{"Cache-Control":"private, no-store"}});
 try{
  const posters=await listAuthorizedSingBoardPostersForToken(token);
  return NextResponse.json({posters},{headers:{"Cache-Control":"private, no-store"}});
 }catch{
  return NextResponse.json({error:"Unable to load your SingBOARD posting identities."},{status:503});
 }
}
