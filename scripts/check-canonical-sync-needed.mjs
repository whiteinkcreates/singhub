#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "singhub-sync-preflight-"));
const publicDir = path.join(ROOT, "public", "data");

const PUBLIC_CONTENT_FILES = [
  "venues.tsv",
  "events_by_night.tsv",
  "generated_events_review.tsv",
  "venue_slug_aliases.tsv",
];

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

try {
  const result = spawnSync(
    process.execPath,
    [
      path.join(ROOT, "scripts", "sync-public-data-with-taxonomy.mjs"),
      "--dry-run",
      "--output-dir",
      outputDir,
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const changedFiles = PUBLIC_CONTENT_FILES.filter((fileName) => {
    const committed = read(path.join(publicDir, fileName));
    const candidate = read(path.join(outputDir, fileName));
    return committed !== candidate;
  });

  const changed = changedFiles.length > 0;
  console.log(
    changed
      ? `Canonical data changed public output: ${changedFiles.join(", ")}`
      : "Canonical data produces the same public snapshot. Skipping full sync.",
  );

  writeOutput("changed", changed ? "true" : "false");
  writeOutput("changed_files", changedFiles.join(","));
} finally {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
