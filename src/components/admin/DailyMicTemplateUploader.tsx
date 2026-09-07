"use client";

import { useMemo, useState } from "react";
import type { PollCategory } from "@/lib/pollBank";
import { DAILY_MIC_TEMPLATES } from "@/lib/dailyMicBrand";

const ORDER: PollCategory[] = [
  "kill-one",
  "karaoke-court",
  "this-or-that",
  "song-battle",
  "would-you-rather",
  "confessions",
  "open-mic",
  "wild-card",
];

type UploadState = "idle" | "uploading" | "ready" | "error";

export function DailyMicTemplateUploader() {
  const [key, setKey] = useState("");
  const [files, setFiles] = useState<Partial<Record<PollCategory, File>>>({});
  const [states, setStates] = useState<Partial<Record<PollCategory, UploadState>>>({});
  const [messages, setMessages] = useState<Partial<Record<PollCategory, string>>>({});
  const selectedCount = useMemo(() => Object.values(files).filter(Boolean).length, [files]);

  async function uploadOne(category: PollCategory) {
    const file = files[category];
    if (!file) return;
    setStates((current) => ({ ...current, [category]: "uploading" }));
    setMessages((current) => ({ ...current, [category]: "" }));
    try {
      const form = new FormData();
      form.append("category", category);
      form.append("file", file);
      const response = await fetch("/api/admin/daily-mic/templates", {
        method: "POST",
        headers: { "x-daily-mic-upload-key": key },
        body: form,
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Upload failed.");
      setStates((current) => ({ ...current, [category]: "ready" }));
      setMessages((current) => ({ ...current, [category]: "Stored as the live master." }));
    } catch (error) {
      setStates((current) => ({ ...current, [category]: "error" }));
      setMessages((current) => ({
        ...current,
        [category]: error instanceof Error ? error.message : "Upload failed.",
      }));
    }
  }

  async function uploadAll() {
    for (const category of ORDER) {
      if (files[category]) await uploadOne(category);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Template library</p>
          <h2 className="mt-2 text-2xl font-black">Load the eight approved masters once</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            These files become the permanent category artwork. Daily posts reuse them and only replace the question and answer text.
          </p>
        </div>
        <button
          type="button"
          onClick={uploadAll}
          disabled={!key || selectedCount === 0 || Object.values(states).some((state) => state === "uploading")}
          className="rounded-xl bg-fuchsia-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Upload selected ({selectedCount})
        </button>
      </div>

      <label className="mt-5 block max-w-md text-xs font-black uppercase tracking-[.16em] text-slate-400">
        Upload key
        <input
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          autoComplete="off"
          placeholder="DAILY_MIC_UPLOAD_KEY"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-fuchsia-300/50"
        />
      </label>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {ORDER.map((category) => {
          const template = DAILY_MIC_TEMPLATES[category];
          const state = states[category] || "idle";
          return (
            <div key={category} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-white">{template.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{template.visualDirection}</p>
                </div>
                <a
                  href={`${template.masterPath}?t=${Date.now()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-black text-cyan-200"
                >
                  View live
                </a>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setFiles((current) => ({ ...current, [category]: file }));
                  setStates((current) => ({ ...current, [category]: "idle" }));
                  setMessages((current) => ({ ...current, [category]: file.name }));
                }}
                className="mt-3 block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-black file:text-white"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className={`text-xs font-semibold ${state === "error" ? "text-rose-300" : state === "ready" ? "text-emerald-300" : "text-slate-500"}`}>
                  {state === "uploading" ? "Uploading…" : messages[category] || "Choose the approved master image."}
                </p>
                <button
                  type="button"
                  onClick={() => uploadOne(category)}
                  disabled={!key || !files[category] || state === "uploading"}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-black disabled:opacity-40"
                >
                  Upload
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
