import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";

const REQUIRED_HEADERS = [
  "candidate_id",
  "market_slug",
  "venue_name",
  "possible_city",
  "possible_neighborhood",
  "possible_address",
  "claimed_karaoke_day",
  "claimed_karaoke_time",
  "host_kj_name",
  "source_url",
  "source_type",
  "evidence_snippet",
  "confidence_score",
  "confidence_level",
  "review_status",
  "scout_notes",
  "duplicate_of",
  "instagram_handle",
  "facebook_url",
  "venue_website",
  "phone",
  "email",
  "premium_prospect",
];

type Row = Record<string, string>;

function parseTsv(input: string) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const headers = lines[0]?.split("\t") ?? [];
  const rows = lines.slice(1).map((line) => {
    const values = line.split("\t");
    return headers.reduce<Row>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return { headers, rows };
}

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function score(row: Row) {
  const parsed = Number.parseInt(row.confidence_score || "0", 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
}

function priority(value: number) {
  if (value >= 80) return "A";
  if (value >= 60) return "B";
  if (value >= 40) return "C";
  return "D";
}

function reportedSchedule(row: Row) {
  return [clean(row.claimed_karaoke_day), clean(row.claimed_karaoke_time)].filter(Boolean).join(" · ") || null;
}

function scoutStatus(row: Row, confidence: number) {
  if (clean(row.duplicate_of)) return "duplicate";
  if (row.review_status === "rejected") return "confirmed_inactive";
  if (confidence >= 80) return "needs_call";
  return "new_lead";
}

export async function POST(request: NextRequest) {
  await requireAdminAuthorization();

  const body = await request.json().catch(() => null);
  const tsv = typeof body?.tsv === "string" ? body.tsv : "";

  if (!tsv.trim()) {
    return NextResponse.json({ error: "Missing TSV input." }, { status: 400 });
  }

  const parsed = parseTsv(tsv);
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !parsed.headers.includes(header));

  if (missingHeaders.length) {
    return NextResponse.json(
      { error: "Missing required headers.", missingHeaders },
      { status: 400 },
    );
  }

  if (!parsed.rows.length) {
    return NextResponse.json({ error: "No candidate rows found." }, { status: 400 });
  }

  const rowsWithMissingIds = parsed.rows.filter((row) => !clean(row.candidate_id));
  const rowsWithMissingNames = parsed.rows.filter((row) => !clean(row.venue_name));
  const rowsWithMissingMarkets = parsed.rows.filter((row) => !clean(row.market_slug));

  if (rowsWithMissingIds.length || rowsWithMissingNames.length || rowsWithMissingMarkets.length) {
    return NextResponse.json(
      {
        error: "Every row needs candidate_id, market_slug, and venue_name.",
        missingIds: rowsWithMissingIds.length,
        missingNames: rowsWithMissingNames.length,
        missingMarkets: rowsWithMissingMarkets.length,
      },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data: markets, error: marketError } = await supabase
    .from("scout_markets")
    .select("id, slug");

  if (marketError) {
    return NextResponse.json({ error: marketError.message }, { status: 500 });
  }

  const marketIds = new Map((markets ?? []).map((market) => [market.slug, market.id]));
  const unknownMarketSlugs = [
    ...new Set(
      parsed.rows
        .map((row) => row.market_slug.trim())
        .filter((slug) => !marketIds.has(slug)),
    ),
  ];

  if (unknownMarketSlugs.length) {
    return NextResponse.json(
      {
        error: "One or more market_slug values are not registered in SCOUT.",
        unknownMarketSlugs,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const payload = parsed.rows.map((row) => {
    const confidence = score(row);
    const contactPieces = [
      clean(row.email) ? `Email: ${row.email.trim()}` : null,
      clean(row.facebook_url) ? `Facebook: ${row.facebook_url.trim()}` : null,
      row.premium_prospect?.trim().toLowerCase() === "true" ? "Premium prospect flagged in import." : null,
    ].filter(Boolean);

    return {
      candidate_key: row.candidate_id.trim(),
      market_id: marketIds.get(row.market_slug.trim()),
      lead_name: row.venue_name.trim(),
      canonical_guess: row.venue_name.trim(),
      lead_type: "venue",
      city: clean(row.possible_city),
      neighborhood: clean(row.possible_neighborhood),
      address: clean(row.possible_address),
      phone: clean(row.phone),
      website: clean(row.venue_website),
      instagram: clean(row.instagram_handle),
      karaoke_evidence: clean(row.evidence_snippet),
      reported_day_time: reportedSchedule(row),
      reported_host_kj: clean(row.host_kj_name),
      source_name: clean(row.source_type) ?? "scout_import",
      source_url: clean(row.source_url),
      likelihood_score: confidence,
      priority: priority(confidence),
      scout_status: scoutStatus(row, confidence),
      verification_status: row.review_status === "rejected" ? "rejected" : "needs_review",
      enrichment_status: "needs_enrichment",
      notes: clean(row.scout_notes),
      duplicate_of: clean(row.duplicate_of),
      contact_notes: contactPieces.length ? contactPieces.join("\n") : null,
      last_enriched_at: now,
      updated_at: now,
      updated_by: "SCOUT candidate import",
    };
  });

  const { data, error } = await supabase
    .from("scout_leads")
    .upsert(payload, { onConflict: "candidate_key" })
    .select("id, candidate_key, market_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    imported: data?.length ?? payload.length,
    candidateKeys: (data ?? []).map((row) => row.candidate_key),
  });
}
