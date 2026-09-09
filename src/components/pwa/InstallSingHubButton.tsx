"use client";

import { useEffect, useState } from "react";

declare global {
  interface WindowEventMap {
    "singhub:install-available": Event;
    "singhub:install-state-changed": Event;
    "singhub:request-install": Event;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallSingHubButton({ onClick }: { onClick?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const refresh = () => setVisible(!isStandalone() && isIos());
    const show = () => setVisible(!isStandalone());

    refresh();
    window.addEventListener("singhub:install-available", show);
    window.addEventListener("singhub:install-state-changed", refresh);

    return () => {
      window.removeEventListener("singhub:install-available", show);
      window.removeEventListener("singhub:install-state-changed", refresh);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        window.dispatchEvent(new Event("singhub:request-install"));
      }}
      className="flex min-h-11 w-full items-center rounded-xl bg-cyan-300/10 px-3 py-2 text-left text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15 hover:text-white"
    >
      Install SingHUB
    </button>
  );
}
