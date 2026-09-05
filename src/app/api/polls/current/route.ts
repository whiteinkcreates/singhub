import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPollBySlug, getPollForDate, getPreviousPoll } from "@/lib/pollBank";

export const dynamic = "force-dynamic";

type ResultRow = { option_id: string; votes: number | string };
type SubmitRow = { selected_option_id: string | null; inserted: boolean };

function createPollClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) return null;

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getResults(slug: string) {
  const supabase = createPollClient();
  if (!supabase) return {} as Record<string, number>;

  try {
    const { data, error } = await supabase.rpc("poll_results", {
      p_poll_slug: slug,
    });
    if (error) throw error;

    return ((data || []) as ResultRow[]).reduce<Record<string, number>>(
      (totals, row) => {
        totals[row.option_id] = Number(row.votes) || 0;
        return totals;
      },
      {},
    );
  } catch (error) {
    console.error("Poll results unavailable", error);
    return {};
  }
}

function resultPayload(
  poll: ReturnType<typeof getPollForDate>,
  results: Record<string, number>,
) {
  const totalVotes = Object.values(results).reduce((sum, value) => sum + value, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map((option) => ({
      ...option,
      votes: results[option.id] || 0,
      percentage: totalVotes
        ? Math.round(((results[option.id] || 0) / totalVotes) * 100)
        : 0,
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
      return NextResponse.json(
        { error: "That poll is no longer active." },
        { status: 400 },
      );
    }

    if (!body.optionId || !poll.options.some((option) => option.id === body.optionId)) {
      return NextResponse.json({ error: "Invalid poll option." }, { status: 400 });
    }

    if (!body.clientId || body.clientId.length < 12) {
      return NextResponse.json({ error: "Missing voter token." }, { status: 400 });
    }

    const supabase = createPollClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Voting is not configured yet." },
        { status: 503 },
      );
    }

    const voterHash = createHash("sha256")
      .update(
        `${poll.slug}:${body.clientId}:${process.env.POLL_HASH_SALT || "singhub-poll-v1"}`,
      )
      .digest("hex");

    const { data, error } = await supabase.rpc("submit_poll_vote", {
      p_poll_slug: poll.slug,
      p_option_id: body.optionId,
      p_voter_hash: voterHash,
    });

    if (error) throw error;

    const submission = ((data || []) as SubmitRow[])[0];
    const selectedOptionId = submission?.selected_option_id || body.optionId;
    const results = await getResults(poll.slug);

    return NextResponse.json({
      poll: resultPayload(poll, results),
      selectedOptionId,
      alreadyVoted: submission ? !submission.inserted : false,
    });
  } catch (error) {
    console.error("Poll vote failed", error);
    return NextResponse.json(
      { error: "Vote could not be saved. Try again in a moment." },
      { status: 500 },
    );
  }
}
