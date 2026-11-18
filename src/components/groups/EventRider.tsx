"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import "./event-rider.css";

type Service = "venue" | "kj" | "both";
type Rider = {
  occasion: string;
  service: Service | "";
  size: string;
  area: string;
  areaNotes: string;
  date: string;
  flexible: boolean;
  time: string;
  budget: string;
  wishes: string[];
  contactName: string;
  contactEmail: string;
  company: string;
  phone: string;
  notes: string;
  consent: boolean;
  website: string;
};

const occasions = [
  { value: "Holiday party", icon: "✦", note: "Bring some cheer to the year-end celebration" },
  { value: "Company / team outing", icon: "♬", note: "Trade the conference room for the chorus" },
  { value: "Birthday / celebration", icon: "★", note: "It's somebody's night" },
  { value: "Bachelorette / bachelor", icon: "♫", note: "For the whole crew" },
  { value: "Friends / social group", icon: "◎", note: "Just a good reason to get together" },
  { value: "Something else", icon: "＋", note: "We've heard stranger encore requests" },
];
const services: {value:Service;title:string;detail:string}[] = [
  { value: "venue", title: "Find our karaoke venue", detail: "A great place to bring our group" },
  { value: "kj", title: "Hire a karaoke host", detail: "We have a location. Bring the mic and the music" },
  { value: "both", title: "Venue + karaoke host", detail: "Help put the whole experience together" },
];
const groupSizes = ["2–10", "11–20", "21–50", "51–100", "100+"];
const areas = ["Anywhere in San Diego County", "Downtown / Gaslamp", "Central San Diego", "La Mesa / East County", "Coastal San Diego", "North County", "South Bay"];
const wishList = ["Room / reserved tables", "Food or catering", "Drink packages", "Private singing time", "Karaoke equipment", "Accessibility", "Custom event shirts"];
const steps = ["The occasion", "The setup", "The crowd", "The venue", "Showtime", "The rider", "The handoff"];
const initial: Rider = {
  occasion:"", service:"", size:"", area:"", areaNotes:"", date:"", flexible:true, time:"", budget:"Not sure yet",
  wishes:[], contactName:"", contactEmail:"", company:"", phone:"", notes:"", consent:false, website:""
};

export function EventRider({ defaultService = "", holiday = false }: { defaultService?:Service|""; holiday?:boolean }) {
  const [step, setStep] = useState(0);
  const [rider, setRider] = useState<Rider>({...initial,service:defaultService,occasion:holiday?"Holiday party":""});
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [complete,setComplete] = useState(false);
  const update = <K extends keyof Rider>(key:K, value:Rider[K]) => setRider(old=>({...old,[key]:value}));
  const choose = <K extends keyof Rider>(key:K, value:Rider[K]) => { update(key,value); setError(""); setStep(s=>Math.min(6,s+1)); };
  const back = () => {setError("");setStep(s=>Math.max(0,s-1));};
  const next = () => {
    if(step===3 && !rider.area) return setError("Choose an area so we know where to look.");
    if(step===4 && !rider.date && !rider.flexible) return setError("Choose a date or tell us you're flexible.");
    setError("");setStep(s=>Math.min(6,s+1));
  };
  const toggleWish=(wish:string)=>update("wishes",rider.wishes.includes(wish)?rider.wishes.filter(w=>w!==wish):[...rider.wishes,wish]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!rider.contactName.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rider.contactEmail)||!rider.consent){
      setError("Please add your name, valid email and permission for us to follow up.");return;
    }
    setBusy(true);setError("");
    const payload={
      submissionType:"karaoke_event_inquiry",
      submitterName:rider.contactName.trim(),
      submitterContact:rider.contactEmail.trim(),
      venueName:"",
      eventType:rider.occasion,
      bookingNeed:rider.service,
      groupSize:rider.size,
      neighborhood:rider.area,
      areaNotes:rider.areaNotes.trim(),
      preferredDate:rider.date,
      dateFlexible:rider.flexible,
      timePreference:rider.time,
      budget:rider.budget,
      requirements:rider.wishes,
      companyName:rider.company.trim(),
      phone:rider.phone.trim(),
      contactConsent:rider.consent,
      sourceLink:defaultService==="kj"?"/hire-a-kj":"/plan-karaoke",
      companyWebsite:rider.website,
      notes:rider.notes.trim(),
    };
    try{
      const response=await fetch("/api/submit-listing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await response.json() as {error?:string};
      if(!response.ok) throw new Error(body.error||"Your rider could not be sent. Try again.");
      trackEvent("karaoke_event_inquiry_submit",{service:rider.service,occasion:rider.occasion,group_size:rider.size});
      setComplete(true);
    }catch(e){setError(e instanceof Error?e.message:"Unable to send your rider.");}
    finally{setBusy(false);}
  }

  return <section className="rider-shell" aria-label="Plan your karaoke event" id="start-your-rider">
    <div className="rider-stamp"><span className="rider-stamp-icon" aria-hidden="true">✦</span> SINGHUB / EVENT DESK <span className="rider-stamp-right">SAN DIEGO, CA</span></div>
    {complete?<div className="rider-success" role="status">
      <div className="rider-success-symbol" aria-hidden="true">✓</div>
      <p className="rider-kicker">Rider received</p>
      <h2>You're on the list.</h2>
      <p>Thanks, {rider.contactName.split(" ")[0]}. We have your event details and will review possible venues or karaoke hosts. This is an inquiry, not a confirmed reservation. No payment has been taken.</p>
      <Link href="/find-karaoke">Explore San Diego karaoke</Link>
    </div>:<>
      <div className="rider-progress-top"><span>YOUR EVENT RIDER</span><span>{String(step+1).padStart(2,"0")} / 07</span></div>
      <div className="rider-progress" role="progressbar" aria-label="Event rider progress" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={7}><span style={{width:((step+1)/7*100)+"%"}}/></div>
      <div key={step} className="rider-stage" aria-live="polite">
        <p className="rider-kicker">{steps[step]}</p>
        {step===0&&<><h2>What's the occasion?</h2><p className="rider-subtitle">Every great show starts somewhere.</p>
          <div className="rider-options rider-two">{occasions.map(option=><button type="button" key={option.value} onClick={()=>choose("occasion",option.value)} className="rider-option">
            <span className="rider-option-icon" aria-hidden="true">{option.icon}</span><span><strong>{option.value}</strong><small>{option.note}</small></span><span className="rider-chevron" aria-hidden="true">↗</span></button>)}</div>
        </>}
        {step===1&&<><h2>What's your ideal setup?</h2><p className="rider-subtitle">We'll help with the right people, place, or both.</p>
          <div className="rider-options">{services.map(option=><button type="button" key={option.value} onClick={()=>choose("service",option.value)} className={"rider-option"+(rider.service===option.value?" rider-selected":"")}>
            <span className="rider-option-icon" aria-hidden="true">{option.value==="venue"?"⌖":option.value==="kj"?"♫":"✦"}</span><span><strong>{option.title}</strong><small>{option.detail}</small></span><span className="rider-chevron" aria-hidden="true">↗</span></button>)}</div>
        </>}
        {step===2&&<><h2>How big is your entourage?</h2><p className="rider-subtitle">Just an estimate is perfect. No backstage headcount required.</p>
          <div className="rider-options rider-size-options">{groupSizes.map(size=><button type="button" key={size} onClick={()=>choose("size",size)} className="rider-option rider-size"><strong>{size}</strong><small>people</small></button>)}</div>
        </>}
        {step===3&&<><h2>Where's the show?</h2><p className="rider-subtitle">San Diego County first. We'll narrow things down from here.</p>
          <div className="rider-options rider-two">{areas.map(area=><button type="button" key={area} onClick={()=>choose("area",area)} className={"rider-option"+(rider.area===area?" rider-selected":"")}><strong>{area}</strong><span className="rider-chevron" aria-hidden="true">↗</span></button>)}</div>
          <label className="rider-field"><span>{rider.service==="kj"?"Already have an event location?":"Specific neighborhood or venue in mind? (optional)"}</span>
            <input value={rider.areaNotes} onChange={e=>update("areaNotes",e.target.value)} maxLength={160} placeholder="e.g., office in Mission Valley, or a favorite bar"/></label>
        </>}
        {step===4&&<><h2>When do we take the stage?</h2><p className="rider-subtitle">Dates and times are requests until the venue or KJ confirms.</p>
          <div className="rider-fields rider-date-grid"><label className="rider-field"><span>Preferred date</span><input type="date" min={new Date().toLocaleDateString("en-CA")} value={rider.date} onChange={e=>update("date",e.target.value)}/></label>
          <label className="rider-field"><span>Ideal time</span><select value={rider.time} onChange={e=>update("time",e.target.value)}><option value="">We're flexible</option><option>Afternoon</option><option>Early evening (5–8 PM)</option><option>Evening (8–11 PM)</option><option>Late night</option></select></label></div>
          <label className="rider-check"><input type="checkbox" checked={rider.flexible} onChange={e=>update("flexible",e.target.checked)}/><span>Our date is flexible</span></label>
        </>}
        {step===5&&<><h2>Let's build your rider.</h2><p className="rider-subtitle">What matters most? Choose any that apply. Nothing here is booked yet.</p>
          <div className="rider-options rider-two">{wishList.map(wish=><button type="button" aria-pressed={rider.wishes.includes(wish)} key={wish} onClick={()=>toggleWish(wish)} className={"rider-option rider-wish"+(rider.wishes.includes(wish)?" rider-selected":"")}><span className="rider-wish-mark" aria-hidden="true">{rider.wishes.includes(wish)?"✓":"＋"}</span><strong>{wish}</strong></button>)}</div>
          <label className="rider-field rider-budget"><span>Approximate total budget</span><select value={rider.budget} onChange={e=>update("budget",e.target.value)}>
            <option>Not sure yet</option><option>Under $500</option><option>$500–$1,000</option><option>$1,000–$2,500</option><option>$2,500–$5,000</option><option>$5,000+</option>
          </select></label>
        </>}
        {step===6&&<><h2>Who gets the setlist?</h2><p className="rider-subtitle">Last step. Where should we send the follow-up about your event?</p>
          <form onSubmit={submit} id="event-rider-form" className="rider-contact">
            <div className="rider-fields"><label className="rider-field"><span>Your name *</span><input required autoComplete="name" maxLength={100} value={rider.contactName} onChange={e=>update("contactName",e.target.value)} placeholder="First and last name"/></label>
              <label className="rider-field"><span>Work or personal email *</span><input required type="email" maxLength={200} autoComplete="email" value={rider.contactEmail} onChange={e=>update("contactEmail",e.target.value)} placeholder="you@company.com"/></label>
              <label className="rider-field"><span>Company or organization (optional)</span><input maxLength={120} value={rider.company} onChange={e=>update("company",e.target.value)} placeholder="Company / team name"/></label>
              <label className="rider-field"><span>Phone (optional)</span><input type="tel" maxLength={40} autoComplete="tel" value={rider.phone} onChange={e=>update("phone",e.target.value)} placeholder="Best number to reach you"/></label></div>
            <label className="rider-field"><span>Anything else the venue or KJ should know? (optional)</span><textarea rows={3} maxLength={1200} value={rider.notes} onChange={e=>update("notes",e.target.value)} placeholder="Food preferences, accessibility, what would make this a great night..."/></label>
            <div className="rider-honeypot" aria-hidden="true"><label>Website <input tabIndex={-1} autoComplete="off" value={rider.website} onChange={e=>update("website",e.target.value)}/></label></div>
            <label className="rider-check"><input required type="checkbox" checked={rider.consent} onChange={e=>update("consent",e.target.checked)}/><span>I agree that SingHUB may contact me about this request and, with my consent, share relevant event details with potential venues or KJs. No booking is confirmed by submitting.</span></label>
            <p className="rider-privacy">You're requesting introductions, not purchasing an event. No charge or guaranteed availability. <Link href="/privacy">Privacy policy</Link>.</p>
            <button type="submit" className="rider-next rider-submit" disabled={busy}>{busy?"Sending your rider...":"Send my event rider →"}</button>
          </form>
        </>}
      </div>
      {error&&<p className="rider-error" role="alert">{error}</p>}
      {step<6&&<nav aria-label="Rider navigation" className="rider-actions">{step>0?<button type="button" onClick={back} className="rider-back">← Back</button>:<span/>}
        {step>=3?<button type="button" onClick={next} className="rider-next">Continue →</button>:<span className="rider-auto">Select an answer to continue</span>}
      </nav>}
      {step===6&&<button type="button" onClick={back} className="rider-back rider-bottom-back">← Back to your rider</button>}
    </>}
  </section>;
}
