"use client";
import { useEffect, useState, type FormEvent } from "react";
import { accountClient, sendAccountLink } from "@/lib/v2/singerAccount";

type VenueChoice = { slug: string; name: string; neighborhood: string };
export function CommunityNominationForm({ token, alias, venues }: {
  token: string; alias: string; venues: VenueChoice[];
}) {
  const [userId,setUserId] = useState<string | null>(null);
  const [ready,setReady] = useState(false);
  const [email,setEmail] = useState("");
  const [sent,setSent] = useState(false);
  const [badgeKey,setBadgeKey] = useState<"sing_along_superstar" | "cheer_captain">("sing_along_superstar");
  const [venueSlug,setVenueSlug] = useState("");
  const [reason,setReason] = useState("");
  const [witnessed,setWitnessed] = useState(false);
  const [pending,setPending] = useState(false);
  const [result,setResult] = useState("");
  const [saved,setSaved] = useState(false);
  useEffect(() => {
    const client = accountClient();
    void client.auth.getUser().then(({data})=>{setUserId(data.user?.id||null);setReady(true);})
      .catch(()=>setReady(true));
    const sub = client.auth.onAuthStateChange((_event,session)=>setUserId(session?.user?.id||null));
    return () => sub.data.subscription.unsubscribe();
  }, []);
  async function signIn(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setPending(true);setResult("");
    try {
      await sendAccountLink(email, "/nominate/"+token);
      setSent(true);setResult("Check your inbox for the SingHUB sign-in link. Return here to finish nominating.");
    } catch(error) {setResult(error instanceof Error?error.message:"Sign-in couldn't be started.");}
    finally {setPending(false);}
  }
  async function nominate(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!witnessed || saved || pending) return;
    setPending(true);setResult("");
    try {
      const client=accountClient();
      const {data,error}=await client.auth.getSession();
      if (error || !data.session) throw new Error("Please sign in to nominate.");
      const response=await fetch("/api/achievements/nominations", {
        method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+data.session.access_token},
        body:JSON.stringify({token,badgeKey,venueSlug,reason}),
      });
      const body=await response.json();
      if (!response.ok) throw new Error(body.error || "Nomination wasn't saved.");
      setSaved(true);setResult(body.message);
    } catch(error) {setResult(error instanceof Error?error.message:"Couldn't save nomination.");}
    finally {setPending(false);}
  }
  const fieldClass="mt-2 w-full min-h-12 rounded-xl border border-white/20 bg-[#081322] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300";
  return <section className="mt-8 rounded-2xl border border-fuchsia-300/20 bg-[#0b1422] p-5 text-white">
    <h2 className="text-2xl font-black">Give {alias} their flowers</h2>
    <p className="mt-2 text-sm leading-6 text-slate-300">
      A great sing-along or a great supporter in the crowd deserves recognition.
      A nomination is a recommendation, not an instant patch. SingHUB reviews qualifying community awards.
    </p>
    {!ready?<p className="mt-5 text-sm text-slate-400">Checking SingHUB sign-in…</p>
    :!userId?<form onSubmit={signIn} className="mt-5 space-y-3">
      <p className="text-sm text-slate-300">Sign in with your free SingHUB account to nominate. KJs can participate if they want to, but they&apos;re not required to verify awards.</p>
      <label className="block text-sm font-bold text-slate-200">Email address
        <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className={fieldClass}/>
      </label>
      <button type="submit" disabled={pending||sent} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-40">
        {sent?"Link sent":"Email my sign-in link"}
      </button>
    </form>:<form onSubmit={nominate} className="mt-5 space-y-4">
      <label className="block text-sm font-bold text-slate-200">What are you nominating?
        <select className={fieldClass} value={badgeKey} onChange={e=>setBadgeKey(e.target.value as typeof badgeKey)} disabled={saved}>
          <option value="sing_along_superstar">Sing-Along Superstar · led a room-wide sing-along</option>
          <option value="cheer_captain">Cheer Captain · supported singers from the crowd</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-slate-200">Where did it happen?
        <select className={fieldClass} value={venueSlug} onChange={e=>setVenueSlug(e.target.value)} required disabled={saved}>
          <option value="">Choose karaoke venue…</option>
          {venues.map(venue=><option key={venue.slug} value={venue.slug}>{venue.name} · {venue.neighborhood}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold text-slate-200">What happened?
        <textarea className={fieldClass} rows={3} minLength={10} maxLength={280} value={reason}
          onChange={e=>setReason(e.target.value)} required disabled={saved}
          placeholder="Tell us about the sing-along or what made their support special."/>
      </label>
      <label className="flex items-start gap-3 text-sm text-slate-300">
        <input type="checkbox" className="mt-1 accent-fuchsia-400" checked={witnessed} onChange={e=>setWitnessed(e.target.checked)} disabled={saved} required/>
        I personally witnessed this moment and I&apos;m not nominating myself.
      </label>
      <button type="submit" disabled={pending||saved||!witnessed}
        className="rounded-full bg-fuchsia-400 px-6 py-3 text-sm font-black text-[#0b1120] disabled:opacity-40">
        {saved?"Nomination received":pending?"Sending…":"Submit nomination"}
      </button>
    </form>}
    {result&&<p role="status" className={"mt-5 rounded-xl border p-3 text-sm "+(saved?"border-emerald-300/30 text-emerald-100":"border-white/15 text-slate-200")}>{result}</p>}
    <p className="mt-5 text-xs leading-5 text-slate-500">
      One nomination per person, award, and nightlife date. A confirmed SingHUB account is required.
      Nominations are private and reviewed by SingHUB. No public voter list.
    </p>
  </section>;
}
