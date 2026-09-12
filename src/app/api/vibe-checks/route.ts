import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getKaraokeEventListings } from "@/lib/eventData";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MAX_VIBE_SELECTIONS,
  VIBE_CHECK_LOOKBACK_DAYS,
  VIBE_CHECK_TAGS,
  VIBE_TAG_SLUGS,
  type VibeCheckApiResponse,
  type VibeTagSlug,
} from "@/lib/vibeChecks";

export const dynamic = "force-dynamic";

type ResponseRow = {
  id: string;
  user_id: string;
  visited_on: string;
  updated_at: string;
  vibe_check_response_tags: { tag_slug: string }[] | null;
};

type MemberProfileRow = {
  product_updates_opt_in: boolean;
};

function bearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

function sanDiegoDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function lookbackDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - VIBE_CHECK_LOOKBACK_DAYS);
  return sanDiegoDate(date);
}

function isRecentVisitDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return value >= lookbackDate() && value <= sanDiegoDate();
}

async function authenticatedUser(request: Request): Promise<{
  user: User | null;
  invalidToken: boolean;
}> {
  const token = bearerToken(request);
  if (!token) return { user: null, invalidToken: false };

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, invalidToken: true };
  return { user: data.user, invalidToken: false };
}

async function findEvent(venueId: string, eventId: string) {
  return (await getKaraokeEventListings()).find(
    (event) => event.eventId === eventId && event.venueId === venueId,
  );
}

async function getResults(
  venueId: string,
  eventId: string,
  user: User | null,
): Promise<VibeCheckApiResponse> {
  const supabase = createAdminClient();
  const responsesPromise = supabase
    .from("vibe_check_responses")
    .select("id,user_id,visited_on,updated_at,vibe_check_response_tags(tag_slug)")
    .eq("venue_id", venueId)
    .eq("event_id", eventId)
    .gte("visited_on", lookbackDate());

  const profilePromise = user
    ? supabase
        .from("singhub_member_profiles")
        .select("product_updates_opt_in")
        .eq("user_id", user.id)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [responsesResult, profileResult] = await Promise.all([
    responsesPromise,
    profilePromise,
  ]);

  if (responsesResult.error) throw responsesResult.error;
  if (profileResult.error) throw profileResult.error;

  const rows = (responsesResult.data || []) as ResponseRow[];
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const selection of row.vibe_check_response_tags || []) {
      counts.set(selection.tag_slug, (counts.get(selection.tag_slug) || 0) + 1);
    }
  }

  const totalResponses = rows.length;
  const userRow = user ? rows.find((row) => row.user_id === user.id) : undefined;
  const lastUpdatedAt = rows.reduce<string | null>(
    (latest, row) => (!latest || row.updated_at > latest ? row.updated_at : latest),
    null,
  );

  return {
    results: {
      totalResponses,
      lookbackDays: VIBE_CHECK_LOOKBACK_DAYS,
      lastUpdatedAt,
      tags: VIBE_CHECK_TAGS.map((tag) => {
        const count = counts.get(tag.slug) || 0;
        return {
          slug: tag.slug,
          label: tag.label,
          count,
          percentage: totalResponses
            ? Math.round((count / totalResponses) * 100)
            : 0,
        };
      }),
    },
    user: user
      ? {
          selectedTagSlugs: (userRow?.vibe_check_response_tags || [])
            .map((selection) => selection.tag_slug)
            .filter((slug): slug is VibeTagSlug => VIBE_TAG_SLUGS.has(slug)),
          visitedOn: userRow?.visited_on || null,
          productUpdatesOptIn: Boolean(
            (profileResult.data as MemberProfileRow | null)?.product_updates_opt_in,
          ),
        }
      : null,
  };
}

export async function GET(request: NextRequest) {
  const venueId = request.nextUrl.searchParams.get("venueId")?.trim() || "";
  const eventId = request.nextUrl.searchParams.get("eventId")?.trim() || "";

  if (!venueId || !eventId) {
    return NextResponse.json(
      { error: "Venue and karaoke night are required." },
      { status: 400 },
    );
  }

  try {
    const [event, auth] = await Promise.all([
      findEvent(venueId, eventId),
      authenticatedUser(request),
    ]);

    if (!event) {
      return NextResponse.json({ error: "Karaoke night not found." }, { status: 404 });
    }

    if (auth.invalidToken) {
      return NextResponse.json({ error: "Your sign-in expired." }, { status: 401 });
    }

    return NextResponse.json(await getResults(venueId, eventId, auth.user));
  } catch (error) {
    console.error("Vibe Check results failed", error);
    return NextResponse.json(
      { error: "Vibe Check results are not available yet." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Confirm your email before posting a Vibe Check." },
        { status: 401 },
      );
    }

    const supabase = createAdminClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (userError || !user?.email || !user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Your email confirmation has expired. Try signing in again." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      venueId?: string;
      eventId?: string;
      visitedOn?: string;
      tagSlugs?: string[];
      productUpdatesOptIn?: boolean;
    };
    const venueId = body.venueId?.trim() || "";
    const eventId = body.eventId?.trim() || "";
    const tagSlugs = Array.isArray(body.tagSlugs)
      ? Array.from(new Set(body.tagSlugs.map((slug) => slug.trim())))
      : [];

    if (!venueId || !eventId || !body.visitedOn) {
      return NextResponse.json(
        { error: "Venue, karaoke night, and visit date are required." },
        { status: 400 },
      );
    }

    if (!isRecentVisitDate(body.visitedOn)) {
      return NextResponse.json(
        { error: `Choose a visit date from the last ${VIBE_CHECK_LOOKBACK_DAYS} days.` },
        { status: 400 },
      );
    }

    if (
      tagSlugs.length < 1 ||
      tagSlugs.length > MAX_VIBE_SELECTIONS ||
      tagSlugs.some((slug) => !VIBE_TAG_SLUGS.has(slug))
    ) {
      return NextResponse.json(
        { error: `Choose between one and ${MAX_VIBE_SELECTIONS} listed vibes.` },
        { status: 400 },
      );
    }

    const event = await findEvent(venueId, eventId);
    if (!event) {
      return NextResponse.json({ error: "Karaoke night not found." }, { status: 404 });
    }

    const { error: submitError } = await supabase.rpc("submit_vibe_check", {
      p_user_id: user.id,
      p_email: user.email,
      p_venue_id: event.venueId,
      p_venue_slug: event.venueSlug,
      p_event_id: event.eventId,
      p_karaoke_day: event.karaokeDay,
      p_visited_on: body.visitedOn,
      p_tag_slugs: tagSlugs,
      p_product_updates_opt_in: body.productUpdatesOptIn === true,
    });

    if (submitError) throw submitError;

    return NextResponse.json({
      ...(await getResults(event.venueId, event.eventId, user)),
      saved: true,
    });
  } catch (error) {
    console.error("Vibe Check submission failed", error);
    return NextResponse.json(
      { error: "Your Vibe Check could not be saved. Try again in a moment." },
      { status: 500 },
    );
  }
}
