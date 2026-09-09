"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
const DISMISS_DAYS = 14;

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
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function track(eventName: string, params: Record<string, unknown> = {}) {
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", eventName, params);
}

export function PwaInstallManager() {
  const pathname = usePathname();
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPrompt.current = event;
      window.dispatchEvent(new Event("singhub:install-available"));
    };

    const onInstalled = () => {
      deferredPrompt.current = null;
      setShowPrompt(false);
      setShowIosHelp(false);
      track("pwa_install_completed");
      window.dispatchEvent(new Event("singhub:install-state-changed"));
    };

    const requestInstall = async () => {
      track("pwa_install_clicked", { source: "install_button" });

      if (deferredPrompt.current) {
        const prompt = deferredPrompt.current;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        track("pwa_install_choice", { outcome: choice.outcome });
        if (choice.outcome === "accepted") deferredPrompt.current = null;
        return;
      }

      if (isIos()) {
        setShowIosHelp(true);
        return;
      }

      setShowPrompt(true);
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

    const viewed = new Set<string>(JSON.parse(localStorage.getItem(VENUES_KEY) || "[]"));
    viewed.add(pathname);
    localStorage.setItem(VENUES_KEY, JSON.stringify(Array.from(viewed).slice(-12)));

    if (viewed.size >= 2) {
      const timer = window.setTimeout(() => {
        setShowPrompt(true);
        track("pwa_install_prompt_shown", { source: "venue_view", venue_views: viewed.size });
      }, 3500);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
    setShowIosHelp(false);
    track("pwa_install_prompt_dismissed");
  };

  const install = async () => {
    track("pwa_install_clicked", { source: "venue_prompt" });
    setShowPrompt(false);

    if (deferredPrompt.current) {
      const prompt = deferredPrompt.current;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      track("pwa_install_choice", { outcome: choice.outcome });
      if (choice.outcome === "accepted") deferredPrompt.current = null;
      return;
    }

    if (isIos()) setShowIosHelp(true);
    else setShowPrompt(true);
  };

  if (!showPrompt && !showIosHelp) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-2xl shadow-black/60 backdrop-blur">
      {showIosHelp ? (
        <>
          <p className="text-base font-black text-white">Add SingHUB to your Home Screen</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            In Safari, tap the Share button, choose <strong className="text-white">Add to Home Screen</strong>, then tap Add.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 min-h-11 w-full rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Got it
          </button>
        </>
      ) : (
        <>
          <p className="text-base font-black text-white">Find karaoke faster next time.</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Install SingHUB on your phone for quick access to karaoke near you.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={install}
              className="min-h-11 rounded-xl bg-fuchsia-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-fuchsia-300"
            >
              Install SingHUB
            </button>
          </div>
        </>
      )}
    </div>
  );
}
