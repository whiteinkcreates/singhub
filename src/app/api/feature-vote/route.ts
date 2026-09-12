import { NextResponse } from "next/server";
import {
  CURRENT_FEATURE_POLL,
  FEATURE_OPTION_IDS,
  type FeatureOptionId,
  type FeatureVoteApiResponse,
} from "@/lib/featureVote";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type VoteRow = {
  option_id: string;
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function getFeatureVoteResults(): Promise<FeatureVoteApiResponse> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("feature_poll_votes")
    .select("option_id")
    .eq("poll_slug", CURRENT_FEATURE_POLL.slug);

  if (error) throw error;

  const votes = (data || []) as VoteRow[];
  const counts = votes.reduce<Record<string, number>>((totals, vote) => {
    totals[vote.option_id] = (totals[vote.option_id] || 0) + 1;
    return totals;
  }, {});

  return {
    pollSlug: CURRENT_FEATURE_POLL.slug,
    totalVotes: votes.length,
    options: CURRENT_FEATURE_POLL.options.map((option) => {
      const optionVotes = counts[option.id] || 0;
      return {
        id: option.id,
        title: option.title,
        votes: optionVotes,
        percentage: votes.length
          ? Math.round((optionVotes / votes.length) * 100)
          : 0,
      };
    }),
    user: null,
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getFeatureVoteResults());
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
    const body = (await request.json()) as {
      pollSlug?: string;
      optionId?: string;
      email?: string;
      productUpdatesOptIn?: boolean;
      website?: string;
    };
    const email = body.email?.trim().toLowerCase() || "";

    if (body.website?.trim()) {
      return NextResponse.json(
        { error: "Your feature vote could not be saved." },
        { status: 400 },
      );
    }
    if (
      body.pollSlug !== CURRENT_FEATURE_POLL.slug ||
      !body.optionId ||
      !FEATURE_OPTION_IDS.has(body.optionId)
    ) {
      return NextResponse.json(
        { error: "That feature option is not active." },
        { status: 400 },
      );
    }
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: identity, error: identityError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
    if (identityError) throw identityError;
    if (!identity.user) throw new Error("Email identity could not be created.");

    const { error: submitError } = await supabase.rpc("submit_feature_vote", {
      p_user_id: identity.user.id,
      p_email: email,
      p_poll_slug: CURRENT_FEATURE_POLL.slug,
      p_option_id: body.optionId,
      p_product_updates_opt_in: body.productUpdatesOptIn === true,
    });
    if (submitError) throw submitError;

    return NextResponse.json({
      ...(await getFeatureVoteResults()),
      user: {
        selectedOptionId: body.optionId as FeatureOptionId,
        productUpdatesOptIn: body.productUpdatesOptIn === true,
      },
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
