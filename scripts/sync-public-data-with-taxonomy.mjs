#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const taxonomy = JSON.parse(
  fs.readFileSync(path.join(ROOT, "config", "location-taxonomy.json"), "utf8"),
);

const marketByNeighborhood = new Map();
for (const [market, neighborhoods] of Object.entries(taxonomy.markets || {})) {
  for (const neighborhood of neighborhoods) {
    marketByNeighborhood.set(neighborhood, market);
  }
}

const expansionMarkets = new Map([
  ["Redlands", "Inland Empire"],
  ["Moreno Valley", "Inland Empire"],
  ["Boston", "Boston"],
  ["Boothbay Harbor", "Midcoast Maine"],
]);

const sanDiegoCities = new Set([
  "San Diego", "La Mesa", "Chula Vista", "Bonita", "National City",
  "Imperial Beach", "Santee", "El Cajon", "Lakeside", "Poway",
  "Oceanside", "Vista", "Escondido", "Carlsbad", "Encinitas",
  "San Marcos", "Spring Valley", "Lemon Grove", "Coronado",
  "Solana Beach", "Del Mar", "Alpine",
]);

function clean(value) {
  return String(value ?? "").trim();
}

function applyTaxonomy(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8").trimEnd();
  if (!raw) return;

  const lines = raw.split(/\r?\n/);
  const headers = lines[0].split("\t");
  const neighborhoodIndex = headers.indexOf("neighborhood");
  const cityIndex = headers.indexOf("city");
  if (neighborhoodIndex < 0 || cityIndex < 0) {
    throw new Error(`Cannot apply location taxonomy to ${filePath}: city/neighborhood columns are missing.`);
  }

  let marketIndex = headers.indexOf("market");
  if (marketIndex < 0) {
    headers.splice(neighborhoodIndex + 1, 0, "market");
    marketIndex = neighborhoodIndex + 1;
  }

  const output = [headers.join("\t")];
  const unknown = [];

  for (const line of lines.slice(1)) {
    if (!line) continue;
    const values = line.split("\t");
    const originalNeighborhoodIndex = lines[0].split("\t").indexOf("neighborhood");
    const originalCityIndex = lines[0].split("\t").indexOf("city");
    const neighborhood = clean(values[originalNeighborhoodIndex]);
    const city = clean(values[originalCityIndex]);

    let market = marketByNeighborhood.get(neighborhood) || expansionMarkets.get(city) || "";
    if (neighborhood === "Multiple venues" && city === "San Diego") market = "San Diego";

    if (sanDiegoCities.has(city) && neighborhood !== "Multiple venues" && !marketByNeighborhood.has(neighborhood)) {
      unknown.push(`${city}: ${neighborhood || "(blank)"}`);
    }

    if (headers.length > values.length) {
      values.splice(neighborhoodIndex + 1, 0, market);
    } else {
      values[marketIndex] = market;
    }
    output.push(values.join("\t"));
  }

  if (unknown.length) {
    throw new Error(
      `Unknown canonical San Diego neighborhood(s): ${[...new Set(unknown)].join(", ")}. Update Venues_Canonical and config/location-taxonomy.json together.`,
    );
  }

  fs.writeFileSync(filePath, `${output.join("\n")}\n`);
}

const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", "sync-public-data.mjs"), ...args], {
  cwd: ROOT,
  stdio: "inherit",
  env: process.env,
});
if (result.status !== 0) process.exit(result.status ?? 1);

const outputDirIndex = args.indexOf("--output-dir");
if (outputDirIndex >= 0 && args[outputDirIndex + 1]) {
  applyTaxonomy(path.resolve(ROOT, args[outputDirIndex + 1], "venues.tsv"));
}
if (args.includes("--write")) {
  applyTaxonomy(path.join(ROOT, "public", "data", "venues.tsv"));
}
