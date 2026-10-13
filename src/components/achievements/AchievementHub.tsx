"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { accountClient } from "@/lib/v2/singerAccount";
import {
  ACHIEVEMENT_BY_KEY, FOUNDING_ACHIEVEMENTS,
  isAchievementKey,
} from "@/lib/achievements/catalog";

type Award = {
  badge_key: string; badge_name: string; level: number; award_source: string;
  awarded_at: string; updated_at: string;
};
type AwardEvent = {
  id: string; badge_key: string; badge_level: number;
  event_kind: "unlocked" | "upgraded"; awarded_at: string;
};
type Feed = {
  awards: Award[]; events: AwardEvent[];
  nominationUrl: string | null; aliasReady: boolean;
};

/** Synthesized original guitar/amp sting: no sampled or copyrighted game audio. */
function playGuitarSting() {
  try {
    const context = new window.AudioContext();
    void context.resume().then(() => {
      const output = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 1350;
      filter.connect(output); output.connect(context.destination);
      const now = context.currentTime;
      output.gain.setValueAtTime(0.0001, now);
      output.gain.exponentialRampToValueAtTime(0.17, now + 0.035);
      output.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      [110, 146.83, 164.81, 220].forEach((hz, i) => {
        const oscillator = context.createOscillator();
        const amp = context.createGain();
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(hz, now);
        oscillator.frequency.exponentialRampToValueAtTime(hz * 0.998, now + 0.42);
        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.exponentialRampToValueAtTime(0.15, now + 0.025 + i * 0.014);
        amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
        oscillator.connect(amp); amp.connect(filter);
        oscillator.start(now + i * 0.022); oscillator.stop(now + 0.52);
      });
      window.setTimeout(() => { void context.close(); }, 1000);
    }).catch(() => { void context.close(); });
  } catch { /* Silent fallback where Web Audio is unsupported or blocked. */ }
}
const localSeenKey = (userId: string) => "singhub:achievement-events-seen:" + userId;

export function AchievementHub({ userId, alias, refreshKey }: {
  userId?: string; alias?: string; refreshKey: number;
}) {
  const [feed,setFeed] = useState<Feed | null>(null);
  const [qrImage,setQrImage] = useState<string | null>(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [reveal,setReveal] = useState<AwardEvent | null>(null);
  const [soundEnabled,setSoundEnabled] = useState(false);
  const dismissRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!userId) { queueMicrotask(() => { setFeed(null);setQrImage(null);setReveal(null); });return; }
    let alive = true;
    queueMicrotask(() => { if (alive) { setLoading(true);setError(""); } });
    void (async () => {
      try {
        const {data,error:sessionError}=await accountClient().auth.getSession();
        if (sessionError || !data.session) throw new Error("Sign in to view your patches.");
        const response=await fetch("/api/achievements",{
          headers:{Authorization:"Bearer "+data.session.access_token},cache:"no-store",
        });
        const next=await response.json() as Feed & {error?:string};
        if (!response.ok) throw new Error(next.error || "Achievement feed could not load.");
        if (!alive) return;
        setFeed(next);
        setQrImage(null);
        if (next.nominationUrl) {
          void QRCode.toDataURL(next.nominationUrl, {
            width:320,margin:2,errorCorrectionLevel:"M",
            color:{dark:"#0A1020",light:"#FFFFFF"},
          }).then(image=>{if(alive)setQrImage(image);}).catch(()=>{});
        }
        const seen = (() => {
          try { return new Set<string>(JSON.parse(localStorage.getItem(localSeenKey(userId))||"[]")); }
          catch { return new Set<string>(); }
        })();
        const unseen = [...next.events].reverse().find(event=>!seen.has(event.id));
        if (unseen) setReveal(current=>current||unseen);
      } catch(e) {
        if(alive)setError(e instanceof Error?e.message:"Could not load achievements.");
      } finally { if(alive)setLoading(false); }
    })();
    return ()=>{alive=false;};
  },[userId,alias,refreshKey]);
  const awards = useMemo(()=>new Map((feed?.awards||[]).map(a=>[a.badge_key,a])),[feed]);
  function dismissReveal() {
    if (!reveal || !userId) return;
    const seen = (() => {
      try { return new Set<string>(JSON.parse(localStorage.getItem(localSeenKey(userId))||"[]")); }
      catch { return new Set<string>(); }
    })();
    seen.add(reveal.id);
    try { localStorage.setItem(localSeenKey(userId),JSON.stringify([...seen].slice(-150))); } catch {}
    const next=[...(feed?.events||[])].reverse().find(event=>!seen.has(event.id));
    setReveal(next||null);
    if (!next) window.setTimeout(()=>document.getElementById("jacket")?.scrollIntoView({behavior:"smooth",block:"start"}),40);
  }
  useEffect(()=>{
    if (!reveal) return;
    dismissRef.current?.focus();
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")dismissReveal();};
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
    // We intentionally attach the listener for each reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[reveal]);
  async function copyLink() {
    if (!feed?.nominationUrl) return;
    try { await navigator.clipboard.writeText(feed.nominationUrl);setError("Your nomination link was copied."); }
    catch { setError("Copy isn't available. Long-press or select the link below."); }
  }
  const revealName = reveal && isAchievementKey(reveal.badge_key)
    ? ACHIEVEMENT_BY_KEY[reveal.badge_key].name : "Achievement";
  return <section className="panel panel-bevel" id="achievements" aria-labelledby="achievement-hub-title">
    <header className="panel-head">
      <div>
        <p className="eyebrow">THE FOUNDING EIGHT</p>
        <h2 id="achievement-hub-title">Achievements</h2>
        <p>One earned patch per achievement. Level II upgrades its neon-pink border without using another jacket space.</p>
      </div>
      <span className="rounded-full border border-fuchsia-300/40 px-3 py-1.5 text-xs font-bold text-fuchsia-200">
        {feed ? feed.awards.length : "—"} / 8 earned
      </span>
    </header>
    {error && <p role="status" className="rounded-xl border border-fuchsia-300/30 p-3 text-sm text-slate-200">{error}</p>}
    {!userId ? <p className="text-sm text-slate-300">Sign in to My SingHUB and set your karaoke alias to start earning patches and sharing your nomination QR.</p>
    : loading && !feed ? <p className="text-sm text-slate-400">Loading your achievements…</p> :
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {FOUNDING_ACHIEVEMENTS.map(item=>{
        const earned=awards.get(item.key);
        return <article key={item.key}
          className={"rounded-2xl border p-4 "+(earned
            ? earned.level>=2?"border-[#ff2aa3] bg-fuchsia-400/[.08] shadow-[0_0_18px_rgba(255,42,163,.32)]":"border-cyan-300/50 bg-cyan-300/[.05]"
            :"border-white/10 bg-white/[.02]")}>
          <p className={"text-xs font-black uppercase tracking-wider "+(earned?"text-cyan-200":"text-slate-500")}>
            {earned ? "Earned · Level "+(earned.level===2?"II":"I") : "Locked"}
          </p>
          <h3 className="mt-2 text-base font-black text-white">{item.name}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">I · {item.levelOne}</p>
          {item.levelTwo&&<p className="mt-1 text-xs leading-5 text-fuchsia-200">II · {item.levelTwo}</p>}
          <p className="mt-2 text-[11px] text-slate-500">{item.kind==="nominated"?"Community nomination + SingHUB review":"Automatic · singer-reported evidence"}</p>
        </article>;
      })}
    </div>}
    {userId && <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-[#08111c] p-5 md:grid-cols-[minmax(0,1fr)_170px]">
      <div>
        <p className="eyebrow">YOUR PERSONAL QR</p>
        <h3 className="mt-1 text-xl font-black text-white">Let the room nominate you.</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Share your QR with singers, the audience, or a KJ. Anyone with a confirmed SingHUB account can nominate
          a great sing-along or an audience Cheer Captain. Three independent nominations and admin review are required.
          KJ participation is always optional.
        </p>
        {feed?.nominationUrl ? <>
          <button onClick={()=>void copyLink()} className="mt-4 rounded-full border border-cyan-300/50 px-5 py-2.5 text-sm font-bold text-cyan-200">
            Copy my nomination link
          </button>
          <p className="mt-2 break-all text-[11px] text-slate-500">{feed.nominationUrl}</p>
        </> : <p className="mt-4 text-xs text-amber-200">Set your karaoke alias above to unlock your QR.</p>}
      </div>
      <div className="flex items-center justify-center">
        {qrImage ? /* eslint-disable-next-line @next/next/no-img-element */
          <img src={qrImage} alt="QR code to nominate this SingHUB member" width={160} height={160} className="rounded-lg bg-white p-2"/> :
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-white/15 text-center text-xs text-slate-500">QR available once your alias is set.</div>}
      </div>
    </div>}
    {reveal&&<div role="presentation" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4">
      <div role="dialog" aria-modal="true" aria-label={"Achievement unlocked: "+revealName}
        className="w-full max-w-md rounded-3xl border border-fuchsia-300/50 bg-[#090e1c] p-7 text-center shadow-[0_0_50px_rgba(255,42,163,.18)]">
        <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">
          {reveal.event_kind==="upgraded"?"Patch levelled up!":"Achievement unlocked!"}
        </p>
        <div key={reveal.id} className="mx-auto my-7 flex h-36 w-36 items-center justify-center rounded-2xl border-4 border-fuchsia-400 bg-[#182136] text-7xl text-cyan-200 sh-patch-reveal"
          style={{boxShadow:"0 0 32px rgba(255,42,163,.5)"}} aria-hidden="true">★</div>
        <h2 className="text-3xl font-black text-white">{revealName}</h2>
        <p className="mt-2 text-sm text-cyan-200">
          Level {reveal.badge_level===2?"II · Neon-pink border unlocked":"I · Patch added to My Jacket"}
        </p>
        <p className="mt-3 text-xs text-slate-400">Original guitar-amp reveal · No game audio sampled</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={()=>{setSoundEnabled(true);playGuitarSting();}}
            className="rounded-full border border-cyan-300/35 px-4 py-2 text-xs font-bold text-cyan-100">
            {soundEnabled?"Replay guitar sting":"Play guitar sting"}
          </button>
          <button ref={dismissRef} onClick={dismissReveal}
            className="rounded-full bg-fuchsia-400 px-6 py-2.5 text-sm font-black text-[#090e1c]">
            See My Jacket
          </button>
        </div>
      </div>
    </div>}
    <style>{`
      @keyframes sh-patch-pop {
        0% { transform:scale(.18) rotate(-8deg);opacity:.5;filter:brightness(3); }
        28% { transform:scale(1.5) rotate(4deg);opacity:1;filter:brightness(1.9); }
        56% { transform:scale(.88) rotate(-2deg); }
        76% { transform:scale(1.07) rotate(1deg); }
        100% { transform:scale(1) rotate(0deg);filter:brightness(1); }
      }
      .sh-patch-reveal { animation:sh-patch-pop .82s cubic-bezier(.18,.95,.2,1) both; }
      @media (prefers-reduced-motion: reduce) { .sh-patch-reveal {animation:none!important;} }
    `}</style>
  </section>;
}
