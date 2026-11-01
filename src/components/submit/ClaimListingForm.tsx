"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { VenueListing } from "@/types";
import { trackEvent } from "@/lib/analytics";

type ClaimListingFormProps = {
  venues: VenueListing[];
  selectedVenueSlug?: string;
};
type Intent = "claim" | "correction";
function value(form: FormData, name: string) {
  const raw = form.get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

export function ClaimListingForm({ venues, selectedVenueSlug }: ClaimListingFormProps) {
  const [selectedSlug, setSelectedSlug] = useState(selectedVenueSlug ?? "");
  const [intent, setIntent] = useState<Intent>("claim");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedVenue = venues.find(venue => venue.slug === selectedSlug);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const venueName = value(data, "venue-name") || selectedVenue?.venueName || "";
    const email = value(data, "email");
    const contactName = value(data, "name");
    const role = value(data, "role");
    const changes = value(data, "changes");
    if (!venueName || !email || (intent === "claim" && (!contactName || !role)) || (intent === "correction" && !changes)) {
      setErrorMessage(intent === "claim"
        ? "Please include the venue, your name, role and email."
        : "Please include the venue, your email and the correction.");
      return;
    }

    const payload = {
      submissionType: intent === "claim" ? "venue_claim_request" : "claim_update",
      venueName,
      neighborhood: value(data, "neighborhood"),
      venueContact: [contactName, role, email, value(data, "phone")].filter(Boolean).join(" / "),
      submitterName: contactName,
      submitterContact: email,
      sourceLink: selectedSlug ? `/venues/${selectedSlug}` : "/claim-listing",
      companyWebsite: value(data, "company-website"),
      notes: [
        intent === "claim" ? "Request to establish venue authority" : "Public venue listing correction",
        `Listing: ${selectedSlug || "New or not selected"}`,
        `Relationship to the venue: ${role || "Not supplied"}`,
        `Official venue website / social account (optional): ${value(data, "official-link") || "Not supplied"}`,
        `Changes or notes: ${changes || "Current listing appears accurate"}`,
      ].join("\n"),
    };
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmittedMessage("");
    try {
      const response = await fetch("/api/submit-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as {error?: string};
      if (!response.ok) throw new Error(result.error || "Your request could not be sent.");
      setSubmittedMessage(intent === "claim"
        ? `Your claim request for ${venueName} is in the review queue. We'll verify your connection to the venue before changing its status. No account was created and no payment was taken.`
        : `Thanks. Your correction for ${venueName} was sent for review.`);
      trackEvent(intent === "claim" ? "venue_claim_request_submit" : "claim_listing_submit", {
        venue_slug: selectedSlug || "not_listed",
        venue_name: venueName,
      });
      form.reset();
      setSelectedSlug("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Your request could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldStyle = "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-300";
  return (
    <form id="claim-listing" name="claim-listing" onSubmit={handleSubmit} className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="company-website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset className="mb-7">
        <legend className="mb-3 text-sm font-semibold text-slate-100">What would you like to do?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            {id: "claim", title: "I represent this venue", detail: "Claim its listing or request access to keep it accurate."},
            {id: "correction", title: "Something needs correcting", detail: "Report a wrong schedule, host, location or other detail."},
          ] as const).map(option => (
            <label key={option.id} className={`cursor-pointer rounded-2xl border p-4 ${intent === option.id ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/10 bg-slate-950/50"}`}>
              <span className="flex items-center gap-2 font-bold text-white">
                <input type="radio" name="request-intent" value={option.id} checked={intent === option.id}
                  onChange={() => setIntent(option.id)} />{option.title}
              </span>
              <span className="mt-1 block pl-5 text-sm text-slate-300">{option.detail}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">Existing SingHUB listing</span>
          <select name="venue-slug" value={selectedSlug} onChange={event => setSelectedSlug(event.target.value)} className={fieldStyle}>
            <option value="">Choose your listing, or enter the venue below</option>
            {venues.map(venue => <option key={venue.id} value={venue.slug}>{venue.venueName}</option>)}
          </select>
        </label>
        <Field label="Venue name" name="venue-name" defaultValue={selectedVenue?.venueName} key={selectedSlug + "-name"} required />
        <Field label="Neighborhood / city" name="neighborhood" defaultValue={selectedVenue?.neighborhood} key={selectedSlug + "-area"} />
        <Field label="Your name" name="name" required={intent === "claim"} />
        <Field label="Your role at the venue" name="role" placeholder="Owner, manager, booking, KJ..." required={intent === "claim"} />
        <Field label="Email address" name="email" type="email" required />
        <Field label="Phone (optional)" name="phone" type="tel" />
        {intent === "claim" && (
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-200">Official venue website or social link (optional)</span>
            <input className={fieldStyle} name="official-link" type="url" placeholder="https://..." />
            <span className="mt-1 block text-xs text-slate-400">This helps us verify the claim. We may follow up through an official venue contact. Never send passwords or identity documents.</span>
          </label>
        )}
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">{intent === "claim" ? "Anything to update or add? (optional)" : "What needs to change?"}</span>
          <textarea name="changes" rows={4} required={intent === "correction"} className={fieldStyle}
            placeholder={intent === "claim" ? "Photos, KJs, more events, or anything else you'd like us to know." : "Tell us the current and correct details, with a source if possible."} />
        </label>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-300">
        {intent === "claim"
          ? "Claim requests are reviewed by a person. Claiming is free and does not automatically give editing rights or start a Partner subscription."
          : "Corrections are reviewed before public details change. Anyone can report inaccurate information."}
        {" "}<Link href="/support" className="text-cyan-300 underline underline-offset-4">Need help with the site itself?</Link>
      </p>
      {errorMessage && <p role="alert" className="mt-5 rounded-2xl border border-red-300/30 bg-red-400/10 p-4 text-sm text-red-100">{errorMessage}</p>}
      {submittedMessage && <p role="status" className="mt-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100">{submittedMessage}</p>}
      <Button className="mt-6" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : intent === "claim" ? "Request free venue claim" : "Send correction"}
      </Button>
    </form>
  );
}

function Field({label,name,type="text",required=false,defaultValue,placeholder}:{label:string;name:string;type?:string;required?:boolean;defaultValue?:string;placeholder?:string}) {
  return <label className="block">
    <span className="text-sm font-semibold text-slate-200">{label}{required && <span className="text-cyan-300"> *</span>}</span>
    <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder}
      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-300" />
  </label>;
}
