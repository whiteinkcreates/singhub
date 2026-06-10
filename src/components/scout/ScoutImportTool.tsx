"use client";

import { useMemo, useState } from "react";

const REQUIRED_HEADERS = [
  "candidate_id",
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

const SAMPLE_TSV = `${REQUIRED_HEADERS.join("\t")}
import-001\tImported Sample Venue\tSan Diego\tNorth Park\tNeeds review\tThursday\t8:00 PM\tSample KJ\thttps://example.com/source\tvenue_calendar\tPlaceholder import row. Replace with real Scout evidence.\t68\tmedium\tneeds_review\tImported through Scout Import preview.\t\t@samplevenue\t\thttps://example.com\t\t\ttrue`;

type ParsedRow = Record<string, string>;

type ParseResult = {
  headers: string[];
  rows: ParsedRow[];
};

function parseTsv(input: string): ParseResult {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const headers = lines[0]?.split("\t") ?? [];
  const rows = lines.slice(1).map((line) => {
    const values = line.split("\t");

    return headers.reduce<ParsedRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return { headers, rows };
}

function toCanonicalTsv(rows: ParsedRow[]) {
  const body = rows.map((row) =>
    REQUIRED_HEADERS.map((header) => row[header] ?? "")
      .map((value) => value.replace(/\r?\n/g, " ").trim())
      .join("\t"),
  );

  return [REQUIRED_HEADERS.join("\t"), ...body].join("\n");
}

function labelize(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ScoutImportTool() {
  const [input, setInput] = useState(SAMPLE_TSV);

  const parsed = useMemo(() => parseTsv(input), [input]);

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !parsed.headers.includes(header),
  );

  const extraHeaders = parsed.headers.filter(
    (header) => !REQUIRED_HEADERS.includes(header),
  );

  const rowsWithMissingIds = parsed.rows.filter((row) => !row.candidate_id?.trim()).length;
  const rowsWithMissingVenueNames = parsed.rows.filter((row) => !row.venue_name?.trim()).length;
  const isValid =
    parsed.headers.length > 0 &&
    parsed.rows.length > 0 &&
    missingHeaders.length === 0 &&
    rowsWithMissingIds === 0 &&
    rowsWithMissingVenueNames === 0;

  const canonicalTsv = useMemo(() => toCanonicalTsv(parsed.rows), [parsed.rows]);

  async function copyCanonicalTsv() {
    await navigator.clipboard.writeText(canonicalTsv);
  }

  function downloadCanonicalTsv() {
    const blob = new Blob([canonicalTsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scout_candidates.tsv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Paste TSV
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Scout candidate import</h2>
          </div>
          <button
            className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-300/20"
            type="button"
            onClick={() => setInput(SAMPLE_TSV)}
          >
            Load sample
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Paste Stage One Scout output here as tab-separated rows. This tool does not write to
          the repo or publish anything. It previews, validates, and formats rows so they can be
          copied into <code className="text-cyan-200">public/data/scout_candidates.tsv</code>.
        </p>

        <textarea
          className="mt-5 min-h-[420px] w-full rounded-3xl border border-white/10 bg-slate-900/90 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
        />
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-300">
            Import status
          </p>
          <p className="mt-3 text-4xl font-black text-white">{parsed.rows.length}</p>
          <p className="text-sm text-slate-300">candidate rows detected</p>

          <div className="mt-5 space-y-3 text-sm">
            <p className={missingHeaders.length ? "text-rose-300" : "text-cyan-200"}>
              {missingHeaders.length ? "Missing headers" : "Required headers present"}
            </p>
            <p className={rowsWithMissingIds ? "text-rose-300" : "text-cyan-200"}>
              {rowsWithMissingIds ? `${rowsWithMissingIds} rows missing IDs` : "Candidate IDs present"}
            </p>
            <p className={rowsWithMissingVenueNames ? "text-rose-300" : "text-cyan-200"}>
              {rowsWithMissingVenueNames
                ? `${rowsWithMissingVenueNames} rows missing venue names`
                : "Venue names present"}
            </p>
          </div>
        </div>

        {missingHeaders.length > 0 && (
          <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-100">
            <h3 className="font-black text-white">Missing headers</h3>
            <p className="mt-2 leading-6">{missingHeaders.join(", ")}</p>
          </div>
        )}

        {extraHeaders.length > 0 && (
          <div className="rounded-3xl border border-purple-400/30 bg-purple-400/10 p-5 text-sm text-purple-100">
            <h3 className="font-black text-white">Extra headers ignored on export</h3>
            <p className="mt-2 leading-6">{extraHeaders.join(", ")}</p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5">
          <h3 className="text-xl font-black text-white">Export clean TSV</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use this after the preview looks right. Then replace the contents of
            <code className="text-cyan-200"> scout_candidates.tsv</code> and commit.
          </p>
          <div className="mt-4 grid gap-3">
            <button
              className="rounded-full bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={!isValid}
              onClick={copyCanonicalTsv}
            >
              Copy formatted TSV
            </button>
            <button
              className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-3 text-sm font-black text-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={!isValid}
              onClick={downloadCanonicalTsv}
            >
              Download TSV file
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-white">Preview</h2>
            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-bold text-slate-200">
              {isValid ? "Ready to export" : "Needs cleanup"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {parsed.rows.slice(0, 12).map((row, index) => (
              <article
                key={`${row.candidate_id || "row"}-${index}`}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                  {row.candidate_id || `Row ${index + 1}`}
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  {row.venue_name || "Missing venue name"}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  {[row.possible_neighborhood, row.possible_city].filter(Boolean).join(" • ") ||
                    "Location needs review"}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <p>
                    <span className="font-bold text-white">Night:</span>{" "}
                    {row.claimed_karaoke_day || "Needs review"}
                  </p>
                  <p>
                    <span className="font-bold text-white">Time:</span>{" "}
                    {row.claimed_karaoke_time || "Needs review"}
                  </p>
                  <p>
                    <span className="font-bold text-white">Source:</span>{" "}
                    {row.source_type ? labelize(row.source_type) : "Unknown"}
                  </p>
                  <p>
                    <span className="font-bold text-white">Status:</span>{" "}
                    {row.review_status ? labelize(row.review_status) : "new"}
                  </p>
                </div>
                {row.evidence_snippet && (
                  <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                    {row.evidence_snippet}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
