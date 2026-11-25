"use client";

import { useState } from "react";
import { saveKaraokeChange } from "./actions";

type EventOption = {
  eventId:string; venueSlug:string; venueName:string; day:string; startTime:string; endTime:string; hostName:string;
};
type Existing = {
  event_id:string;venue_slug:string;nightlife_date:string;status:string;
  start_time:string|null;end_time:string|null;host_name:string|null;note:string|null;
};
function localDate() {
  const parts = new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"})
    .formatToParts(new Date());
  const p = Object.fromEntries(parts.map(item=>[item.type,item.value]));
  return p.year+"-"+p.month+"-"+p.day;
}
function nextDateFor(day:string,initial=localDate()) {
  const base=new Date(initial+"T12:00:00Z");
  const weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const target=weekdays.findIndex(w=>day.toLowerCase().includes(w.toLowerCase()));
  if(target<0)return initial;
  base.setUTCDate(base.getUTCDate()+((target-base.getUTCDay()+7)%7));
  return base.toISOString().slice(0,10);
}
function timeForInput(value:string|null|undefined) {
  const match=(value||"").match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return "";
  const hour=Number(match[1])%12+(match[3].toUpperCase()==="PM"?12:0);
  return String(hour).padStart(2,"0")+":"+(match[2]||"00");
}

export default function KaraokeChangeForm({events,edit}:{events:EventOption[];edit?:Existing}) {
  const venues=[...new Map(events.map(e=>[e.venueSlug,e.venueName])).entries()]
    .sort((a,b)=>a[1].localeCompare(b[1]));
  const [venue,setVenue]=useState(edit?.venue_slug||venues[0]?.[0]||"");
  const venueEvents=events.filter(e=>e.venueSlug===venue);
  const [chosen,setChosen]=useState(edit?.event_id||venueEvents[0]?.eventId||"");
  const event=venueEvents.find(e=>e.eventId===chosen)||venueEvents[0];
  const [date,setDate]=useState(edit?.nightlife_date||nextDateFor(event?.day||""));
  const [status,setStatus]=useState(edit?.status||"canceled");
  const [start,setStart]=useState(timeForInput(edit?.start_time)||timeForInput(event?.startTime));
  const [end,setEnd]=useState(timeForInput(edit?.end_time)||timeForInput(event?.endTime));
  const [host,setHost]=useState(edit?.host_name||"");
  const inputStyle="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white focus:border-cyan-300";
  const handleVenue=(value:string)=>{
    setVenue(value);
    const first=events.find(e=>e.venueSlug===value);
    setChosen(first?.eventId||"");
    setDate(nextDateFor(first?.day||""));
    setStart(timeForInput(first?.startTime));
    setEnd(timeForInput(first?.endTime));
    setHost("");
  };
  const handleEvent=(value:string)=>{
    setChosen(value);
    const next=events.find(e=>e.eventId===value);
    setDate(nextDateFor(next?.day||""));
    setStart(timeForInput(next?.startTime));
    setEnd(timeForInput(next?.endTime));
    setHost("");
  };
  return <form action={saveKaraokeChange} className="space-y-5 rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-5">
    <div>
      <h2 className="text-2xl font-black">{edit?"Update dated change":"Schedule a one-date change"}</h2>
      <p className="mt-2 text-sm text-slate-300">Pick the exact karaoke event and local date. The normal weekly rotation is never modified.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-bold">Venue
        <select className={inputStyle} name="venue_slug" required value={venue} onChange={e=>handleVenue(e.target.value)}>
          {venues.map(([slug,name])=><option key={slug} value={slug}>{name}</option>)}
        </select>
      </label>
      <label className="text-sm font-bold">Recurring karaoke event
        <select className={inputStyle} name="event_id" required value={event?.eventId||""} onChange={e=>handleEvent(e.target.value)}>
          {venueEvents.map(e=><option key={e.eventId} value={e.eventId}>{e.day} · {e.startTime} · {e.hostName||"Host TBD"}</option>)}
        </select>
      </label>
      <label className="text-sm font-bold">Date to change
        <input className={inputStyle} type="date" name="nightlife_date" value={date} onChange={e=>setDate(e.target.value)} required />
      </label>
      <label className="text-sm font-bold">What changed?
        <select className={inputStyle} name="status" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="canceled">NOT TONIGHT / Canceled</option>
          <option value="time_changed">Time Changed</option>
          <option value="host_changed">Host Changed</option>
        </select>
      </label>
    </div>
    {event&&<p className="rounded-xl border border-white/10 p-3 text-sm text-slate-300">Regular schedule: <strong className="text-white">{event.day}, {event.startTime} to {event.endTime}, {event.hostName||"host to be confirmed"}</strong></p>}
    {status==="time_changed"&&<div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-bold">New start time
        <input required className={inputStyle} name="start_time" type="time" value={start} onChange={e=>setStart(e.target.value)} />
      </label>
      <label className="text-sm font-bold">New end time <span className="font-normal text-slate-400">(optional: blank keeps regular end)</span>
        <input className={inputStyle} name="end_time" type="time" value={end} onChange={e=>setEnd(e.target.value)} />
      </label>
    </div>}
    {status==="host_changed"&&<label className="block text-sm font-bold">Confirmed substitute KJ or host
      <input required className={inputStyle} name="host_name" maxLength={120} value={host} onChange={e=>setHost(e.target.value)} placeholder="Public host name" />
      <span className="mt-1 block text-xs font-normal text-slate-400">Use the confirmed stage name. Signup and tipping links are not inherited from the regular host.</span>
    </label>}
    <label className="block text-sm font-bold">Internal source / reason <span className="font-normal text-slate-400">(recommended)</span>
      <textarea className={inputStyle} rows={2} name="note" maxLength={500} defaultValue={edit?.note||""} placeholder="e.g. Direct confirmation from venue manager, dated Instagram post" />
    </label>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-300">Affects only <strong className="text-white">{date||"the chosen date"}</strong>. Changes can be edited or undone later.</p>
      <button type="submit" className="rounded-xl bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200">
        {edit?"Update this occurrence":"Save dated change"}
      </button>
    </div>
  </form>;
}
