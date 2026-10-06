"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISS_KEY = "singhub-install-dismissed-at";
const VENUES_KEY = "singhub-install-venues-viewed";
const DISMISS_DAYS = 30;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function dismissedRecently() {
  let raw: string | null;
  try { raw = localStorage.getItem(DISMISS_KEY); } catch { return true; }
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function PwaInstallManager() {
  const pathname = usePathname();
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPrompt.current = event;
      setInstallAvailable(true);
      window.dispatchEvent(new Event("singhub:install-available"));
    };

    const onInstalled = () => {
      deferredPrompt.current = null;
      setInstallAvailable(false);
      setShowPrompt(false);
      setShowHelp(false);
      try { localStorage.removeItem(DISMISS_KEY); } catch {}
      trackEvent("pwa_install_completed");
      window.dispatchEvent(new Event("singhub:install-state-changed"));
    };

    const requestInstall = async () => {
      trackEvent("pwa_install_clicked", { source: "install_button" });

      if (deferredPrompt.current) {
        const prompt = deferredPrompt.current;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        trackEvent("pwa_install_choice", { outcome: choice.outcome });
        if (choice.outcome === "accepted") {
          deferredPrompt.current = null;
          setInstallAvailable(false);
        }
        return;
      }

      setShowHelp(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("singhub:request-install", requestInstall);

    if (isIos()) window.dispatchEvent(new Event("singhub:install-available"));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("singhub:request-install", requestInstall);
    };
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/venues/") || pathname === "/venues/premium" || pathname === "/venues/demo") return;
    if (isStandalone() || dismissedRecently()) return;

    const viewed = new Set<string>();
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(VENUES_KEY) || "[]");
      if (Array.isArray(saved)) for (const path of saved) if (typeof path === "string") viewed.add(path);
      viewed.add(pathname);
      localStorage.setItem(VENUES_KEY, JSON.stringify(Array.from(viewed).slice(-12)));
    } catch { return; }

    if (viewed.size >= 2) {
      const timer = window.setTimeout(() => {
        setShowPrompt(true);
        trackEvent("pwa_install_prompt_shown", {
          source: "venue_view",
          venue_views: viewed.size,
          install_available: Boolean(deferredPrompt.current),
        });
      }, 3500);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShowPrompt(false);
    setShowHelp(false);
    trackEvent("pwa_install_prompt_dismissed");
  };

  const install = async () => {
    if (!deferredPrompt.current) {
      setShowPrompt(false);
      setShowHelp(true);
      trackEvent("pwa_save_help_opened", { source: "venue_prompt" });
      return;
    }

    trackEvent("pwa_install_clicked", { source: "venue_prompt" });
    setShowPrompt(false);

    const prompt = deferredPrompt.current;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    trackEvent("pwa_install_choice", { outcome: choice.outcome });
    if (choice.outcome === "accepted") {
      deferredPrompt.current = null;
      setInstallAvailable(false);
    }
  };

  if (pathname.startsWith("/hotelexperience/") || (!showPrompt && !showHelp)) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(74px+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 px-4 py-3 shadow-xl shadow-black/50 backdrop-blur min-[861px]:bottom-4">
      {showHelp ? (
        <div className="pr-8">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss save instructions"
            className="absolute right-3 top-2 min-h-10 min-w-10 text-xl leading-none text-slate-400 transition hover:text-white"
          >
            ×
          </button>
          <p className="text-sm font-black text-white">Save SingHUB for later</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {isIos()
              ? <>In Safari, tap <strong className="text-white">Share</strong>, then <strong className="text-white">Add to Home Screen</strong>.</>
              : <>Open your browser menu and choose <strong className="text-white">Add to Home screen</strong>, <strong className="text-white">Install app</strong>, or <strong className="text-white">Bookmark</strong>, depending on your browser.</>}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-2 min-h-10 rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
          >
            Got it
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-white">Keep SingHUB handy</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-300">Save it for quick access next time.</p>
          </div>
          <button
            type="button"
            onClick={install}
            className="min-h-10 shrink-0 rounded-lg bg-fuchsia-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-fuchsia-300"
          >
            {installAvailable ? "Install" : "How to save"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="min-h-10 min-w-10 shrink-0 text-xl leading-none text-slate-400 transition hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
