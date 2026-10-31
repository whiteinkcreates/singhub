import { NextResponse } from "next/server";
import { isAdminAuthorizationHeaderValid } from "@/lib/adminAccess";
import { reviewSingBoardPost } from "@/lib/singboard/repository";

export const runtime="nodejs";
export async function POST(request:Request) {
  if(!isAdminAuthorizationHeaderValid(request.headers.get("authorization")))
    return NextResponse.json({error:"Unauthorized"},{status:401});
  const origin=request.headers.get("origin");
  if(origin && origin!==new URL(request.url).origin)
    return NextResponse.json({error:"Invalid origin"},{status:403});
  try {
    const form=await request.formData();
    const postId=String(form.get("postId")||"").trim();
    const action=String(form.get("action")||"").trim();
    if(!/^[a-f0-9-]{36}$/i.test(postId)||(action!=="verify"&&action!=="unpublish"))
      return NextResponse.json({error:"Invalid review request"},{status:400});
    await reviewSingBoardPost(postId,action);
    return NextResponse.redirect(new URL("/admin/singboard-review",request.url),303);
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Review failed"},{status:400});
  }
}
