"use client";

import { useState } from "react";

export function GoLinkCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-200 hover:bg-cyan-300/10"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
