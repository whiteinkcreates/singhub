import fs from "node:fs";
import path from "node:path";
import { parseTsv } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "ticker.tsv");

const FALLBACK_TICKER_ITEMS = [
  "WELCOME TO SINGHUB!",
  "LET'S FIND YOU A MICROPHONE.",
  "YOU'RE UP NEXT.",
];

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function getTickerItems(): string[] {
  if (!fs.existsSync(DATA_PATH)) {
    return FALLBACK_TICKER_ITEMS;
  }

  const content = fs.readFileSync(DATA_PATH, "utf8");
  const items = parseTsv(content)
    .filter((row) => parseBoolean(row.active))
    .map((row) => row.message?.trim())
    .filter((message): message is string => Boolean(message));

  return items.length > 0 ? items : FALLBACK_TICKER_ITEMS;
}
