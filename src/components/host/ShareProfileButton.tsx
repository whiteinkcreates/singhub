"use client";

import { useState } from "react";

export function ShareProfileButton({ hostName }: { hostName: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: `${hostName} on SingHUB`,
      text: `See where ${hostName} is hosting karaoke this week on SingHUB.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this SingHUB profile link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-50 transition hover:border-cyan-200 hover:bg-cyan-300/20"
    >
      {copied ? "Link copied" : "Share karaoke schedule"}
    </button>
  );
}
