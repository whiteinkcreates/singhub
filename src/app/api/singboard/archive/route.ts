import { NextResponse } from "next/server";
import { archiveSingBoardPost } from "@/lib/singboard/repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { postId?: string; accessCode?: string };
    if (!body.postId || !body.accessCode) return NextResponse.json({ error: "Post and access code are required." }, { status: 400 });
    await archiveSingBoardPost(body.postId, body.accessCode);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to archive post." }, { status: 400 });
  }
}
