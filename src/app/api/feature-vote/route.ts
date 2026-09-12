import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import {
  CURRENT_FEATURE_POLL,
  FEATURE_OPTION_IDS,
  type FeatureOptionId,
  type FeatureVoteApiResponse,
} from "@/lib/featureVote";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type VoteRow = {
  user_id: string;
  option_id: string;
};

function bearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

async function getOptionalUser(request: Request): Promise<{
  user: User | null;
  invalidToken: boolean;
}> {
  const token = bearerToken(request);
  if (!token) return { user: null, invalidToken: false };

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user
    ? { user: null, invalidToken: true }
    : { user: data.user, invalidToken: false };
}

async function getFeatureVoteResults(user: User | null): Promise<FeatureVoteApiResponse> {
  const supabase = createAdminClient();
  const votesPromise = supabase
    .from("feature_poll_votes")
    .select("user_id,option_id")
    .eq("poll_slug", CURRENT_FEATURE_POLL.slug);
  const profilePromise = user
    ? supabase
        .from("singhub_member_profiles")
        .select("product_updates_opt_in")
        .eq("user_id", user.id)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [votesResult, profileResult] = await Promise.all([
    votesPromise,
    profilePromise,
  ]);
  if (votesResult.error) throw votesResult.error;
  if (profileResult.error) throw profileResult.error;

  const votes = (votesResult.data || []) as VoteRow[];
  const counts = votes.reduce<Record<string, number>>((totals, vote) => {
    totals[vote.option_id] = (totals[vote.option_id] || 0) + 1;
    return totals;
  }, {});
  const selectedOption = user
    ? votes.find((vote) => vote.user_id === user.id)?.option_id
    : undefined;

  return {
    pollSlug: CURRENT_FEATURE_POLL.slug,
    totalVotes: votes.length,
    options: CURRENT_FEATURE_POLL.options.map((option) => {
      const optionVotes = counts[option.id] || 0;
      return {
        id: option.id,
        title: option.title,
        votes: optionVotes,
        percentage: votes.length ? Math.round((optionVotes / votes.length) * 100) : 0,
      };
    }),
    user: user
      ? {
          selectedOptionId:
            selectedOption && FEATURE_OPTION_IDS.has(selectedOption)
              ? (selectedOption as FeatureOptionId)
              : null,
          productUpdatesOptIn: Boolean(
            (profileResult.data as { product_updates_opt_in?: boolean } | null)
              ?.product_updates_opt_in,
          ),
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const auth = await getOptionalUser(request);
    if (auth.invalidToken) {
      return NextResponse.json({ error: "Your sign-in expired." }, { status: 401 });
    }
    return NextResponse.json(await getFeatureVoteResults(auth.user));
  } catch (error) {
    console.error("Feature vote results failed", error);
    return NextResponse.json(
      { error: "Feature voting is not available yet." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Confirm your email before voting." },
        { status: 401 },
      );
    }

    const supabase = createAdminClient();
    const { data, error: userError } = await supabase.auth.getUser(token);
    const user = data.user;
    if (userError || !user?.email || !user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Your email confirmation has expired. Try signing in again." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      pollSlug?: string;
      optionId?: string;
      productUpdatesOptIn?: boolean;
    };
    if (
      body.pollSlug !== CURRENT_FEATURE_POLL.slug ||
      !body.optionId ||
      !FEATURE_OPTION_IDS.has(body.optionId)
    ) {
      return NextResponse.json({ error: "That feature option is not active." }, { status: 400 });
    }

    const { error: submitError } = await supabase.rpc("submit_feature_vote", {
      p_user_id: user.id,
      p_email: user.email,
      p_poll_slug: CURRENT_FEATURE_POLL.slug,
      p_option_id: body.optionId,
      p_product_updates_opt_in: body.productUpdatesOptIn === true,
    });
    if (submitError) throw submitError;

    return NextResponse.json({
      ...(await getFeatureVoteResults(user)),
      saved: true,
    });
  } catch (error) {
    console.error("Feature vote submission failed", error);
    return NextResponse.json(
      { error: "Your feature vote could not be saved. Try again in a moment." },
      { status: 500 },
    );
  }
}
