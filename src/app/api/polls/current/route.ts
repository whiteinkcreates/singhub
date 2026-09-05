import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getPollBySlug, getPollForDate, getPreviousPoll } from "@/lib/pollBank";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type VoteRow = { option_id: string };

async function getResults(slug: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_slug", slug);
    if (error) throw error;
    const rows = (data || []) as VoteRow[];
    return rows.reduce<Record<string, number>>((totals, row) => {
      totals[row.option_id] = (totals[row.option_id] || 0) + 1;
      return totals;
    }, {});
  } catch (error) {
    console.error("Poll results unavailable", error);
    return {};
  }
}

function resultPayload(poll: ReturnType<typeof getPollForDate>, results: Record<string, number>) {
  const totalVotes = Object.values(results).reduce((sum, value) => sum + value, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map((option) => ({
      ...option,
      votes: results[option.id] || 0,
      percentage: totalVotes ? Math.round(((results[option.id] || 0) / totalVotes) * 100) : 0,
    })),
  };
}

export async function GET() {
  const poll = getPollForDate();
  const previousPoll = getPreviousPoll();
  const [results, previousResults] = await Promise.all([
    getResults(poll.slug),
    getResults(previousPoll.slug),
  ]);

  return NextResponse.json({
    poll: resultPayload(poll, results),
    previous: resultPayload(previousPoll, previousResults),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pollSlug?: string;
      optionId?: string;
      clientId?: string;
    };
    const poll = body.pollSlug ? getPollBySlug(body.pollSlug) : undefined;
    if (!poll || poll.slug !== getPollForDate().slug) {
      return NextResponse.json({ error: "That poll is no longer active." }, { status: 400 });
    }
    if (!body.optionId || !poll.options.some((option) => option.id === body.optionId)) {
      return NextResponse.json({ error: "Invalid poll option." }, { status: 400 });
    }
    if (!body.clientId || body.clientId.length < 12) {
      return NextResponse.json({ error: "Missing voter token." }, { status: 400 });
    }

    const voterHash = createHash("sha256")
      .update(`${poll.slug}:${body.clientId}:${process.env.POLL_HASH_SALT || "singhub-poll"}`)
      .digest("hex");
    const supabase = createAdminClient();
    const { error } = await supabase.from("poll_votes").insert({
      poll_slug: poll.slug,
      option_id: body.optionId,
      voter_hash: voterHash,
    });

    if (error && error.code !== "23505") throw error;
    const results = await getResults(poll.slug);
    return NextResponse.json({ poll: resultPayload(poll, results), alreadyVoted: error?.code === "23505" });
  } catch (error) {
    console.error("Poll vote failed", error);
    return NextResponse.json({ error: "Vote could not be saved." }, { status: 500 });
  }
}
