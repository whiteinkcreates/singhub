"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { VenueListing } from "@/types";

type FoundingVenueInquiryFormProps = {
  venues: VenueListing[];
  selectedVenueSlug?: string;
};

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

export function FoundingVenueInquiryForm({
  venues,
  selectedVenueSlug,
}: FoundingVenueInquiryFormProps) {
  const [selectedSlug, setSelectedSlug] = useState(selectedVenueSlug ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedVenue = venues.find((venue) => venue.slug === selectedSlug);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const venueName = getFormValue(formData, "venue-name") || selectedVenue?.venueName || "";
    const contactName = getFormValue(formData, "name");
    const email = getFormValue(formData, "email");
    const karaokeDetails = getFormValue(formData, "karaoke-details");

    if (!venueName || !contactName || !email || !karaokeDetails) {
      setSubmittedMessage("");
      setErrorMessage("Please include the venue, your name, email, and current karaoke details.");
      return;
    }

    const payload = {
      submissionType: "founding_venue_inquiry",
      venueName,
      neighborhood: getFormValue(formData, "neighborhood"),
      venueContact: [
        contactName,
        getFormValue(formData, "role"),
        email,
        getFormValue(formData, "phone"),
      ]
        .filter(Boolean)
        .join(" / "),
      submitterName: contactName,
      submitterContact: email,
      sourceLink: selectedSlug ? `/venues/${selectedSlug}` : "/venues/premium",
      companyWebsite: getFormValue(formData, "company-website"),
      notes: [
        `Founding Venue inquiry for ${venueName}`,
        `Selected listing: ${selectedSlug || "Not selected"}`,
        `Preferred contact: ${getFormValue(formData, "preferred-contact") || "No preference"}`,
        `Best time to connect: ${getFormValue(formData, "best-time") || "Not provided"}`,
        `Current karaoke details:\n${karaokeDetails}`,
        `Promotion goals:\n${getFormValue(formData, "promotion-goals") || "Not provided"}`,
        `Additional notes:\n${getFormValue(formData, "notes") || "None"}`,
      ].join("\n\n"),
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

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Inquiry failed. Please try again.");
      }

      setSubmittedMessage(
        `Thanks, ${contactName}. Your Founding Venue inquiry for ${venueName} is in. Corey will follow up personally.`,
      );
      form.reset();
      setSelectedSlug("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Inquiry failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-[2rem] border border-fuchsia-300/35 bg-slate-950/80 p-5 shadow-2xl shadow-fuchsia-950/30 sm:p-7 md:p-8"
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="company-website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mb-7 border-b border-white/10 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
          90-Day Founding Venue Pilot
        </p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Tell us about your karaoke night
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          This is an inquiry, not a payment form. SingHUB will review your current presence and follow up personally about fit, setup, and next steps.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">Existing SingHUB listing</span>
          <select
            name="venue-slug"
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-300"
          >
            <option value="">Select your venue, or enter it below</option>
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
        <FormField label="Role at venue" name="role" placeholder="Owner, GM, marketing, events..." />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Phone" name="phone" type="tel" />

        <label className="block">
          <span className="text-sm font-semibold text-slate-200">Preferred contact</span>
          <select
            name="preferred-contact"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-300"
          >
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Text">Text</option>
            <option value="No preference">No preference</option>
          </select>
        </label>
        <FormField label="Best time to connect" name="best-time" placeholder="Weekday mornings, after 2pm..." />

        <TextAreaField
          label="Current karaoke night(s)"
          name="karaoke-details"
          helper="Days, approximate times, host or KJ, and anything that regularly changes."
          required
        />
        <TextAreaField
          label="What would you most like to promote?"
          name="promotion-goals"
          helper="A slower night, a new host, specials, private rooms, a specific crowd, or general awareness."
        />
        <TextAreaField
          label="Anything else we should know?"
          name="notes"
          helper="Questions, current marketing efforts, multiple locations, or concerns about the pilot."
          className="md:col-span-2"
        />
      </div>

      {errorMessage && (
        <p className="mt-5 rounded-2xl border border-red-300/30 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
          {errorMessage}
        </p>
      )}

      {submittedMessage && (
        <p className="mt-5 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100">
          {submittedMessage}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending inquiry..." : "Request Founding Venue Review"}
        </Button>
        <p className="text-xs leading-5 text-slate-400">
          No payment today. No long-term commitment. We will contact you before anything begins.
        </p>
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-cyan-300"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  helper,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  helper: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-fuchsia-300">*</span>}
      </span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">{helper}</span>
      <textarea
        name={name}
        rows={5}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
