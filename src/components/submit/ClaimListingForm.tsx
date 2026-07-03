"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { VenueListing } from "@/types";

type ClaimListingFormProps = {
  venues: VenueListing[];
  selectedVenueSlug?: string;
};

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

export function ClaimListingForm({ venues, selectedVenueSlug }: ClaimListingFormProps) {
  const [selectedSlug, setSelectedSlug] = useState(selectedVenueSlug ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedVenue = venues.find((venue) => venue.slug === selectedSlug);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const venueName = getFormValue(formData, "venue-name") || selectedVenue?.venueName || "Listing update";
    const changes = getFormValue(formData, "changes");
    const email = getFormValue(formData, "email");

    if (!venueName || !changes || !email) {
      setSubmittedMessage("");
      setErrorMessage("Please include the venue, your email, and what needs to change.");
      return;
    }

    const payload = {
      venueName,
      neighborhood: getFormValue(formData, "neighborhood"),
      venueContact: [getFormValue(formData, "name"), email, getFormValue(formData, "phone"), getFormValue(formData, "role")]
        .filter(Boolean)
        .join(" / "),
      notes: `Claim/update request for ${venueName}\n\nSelected listing: ${selectedSlug || "Not selected"}\n\nRequested changes:\n${changes}`,
      submitterName: getFormValue(formData, "name"),
      submitterContact: email,
      sourceLink: selectedSlug ? `/venues/${selectedSlug}` : "",
      companyWebsite: getFormValue(formData, "company-website"),
    };

    setIsSubmitting(true);
    setErrorMessage("");
    setSubmittedMessage("");

    try {
      const response = await fetch("/api/submit-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Update request failed. Please try again.");
      }

      setSubmittedMessage(`Thanks. Your update for ${venueName} was sent to SingHUB.`);
      form.reset();
      setSelectedSlug("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update request failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="company-website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">Existing listing</span>
          <select
            name="venue-slug"
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
          >
            <option value="">Select a listing, or enter the venue below</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.slug}>
                {venue.venueName}
              </option>
            ))}
          </select>
        </label>

        <FormField label="Venue name" name="venue-name" defaultValue={selectedVenue?.venueName} required />
        <FormField label="Neighborhood" name="neighborhood" defaultValue={selectedVenue?.neighborhood} />
        <FormField label="Your name" name="name" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Venue phone" name="phone" />
        <FormField label="Role at venue" name="role" />
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">What needs to change?</span>
          <textarea
            name="changes"
            rows={5}
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
          />
        </label>
      </div>

      {errorMessage && (
        <p className="mt-5 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-4 text-sm font-semibold text-fuchsia-100">
          {errorMessage}
        </p>
      )}

      {submittedMessage && (
        <p className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100">
          {submittedMessage}
        </p>
      )}

      <Button className="mt-6" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Request Claim / Update"}
      </Button>
    </form>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-fuchsia-300">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}
