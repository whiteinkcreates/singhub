"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

const karaokeDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

function getUsefulDetailCount(formData: FormData) {
  const detailFields = [
    "venue-name",
    "source-link",
    "venue-website",
    "venue-instagram",
    "host-name",
    "notes",
  ];

  return detailFields.filter((fieldName) => getFormValue(formData, fieldName)).length;
}

export function SubmitListingForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedDays = formData.getAll("karaoke-days").map(String);
    const usefulDetailCount = getUsefulDetailCount(formData);

    if (usefulDetailCount === 0 && selectedDays.length === 0) {
      setSubmittedMessage("");
      setErrorMessage("Send at least one clue: venue name, host name, link, IG, day, or a quick note.");
      return;
    }

    const venueName = getFormValue(formData, "venue-name") || "Name not provided yet";
    const daySummary = selectedDays.length > 0 ? selectedDays.join(", ") : "Days unknown";
    const sourceLink = getFormValue(formData, "source-link") || "No source link provided";

    const submissionSummary = [
      `Venue/night: ${venueName}`,
      `Days: ${daySummary}`,
      `Source: ${sourceLink}`,
    ].join(" | ");

    setErrorMessage("");
    setSubmittedMessage(`Thanks. We captured what you know for review: ${submissionSummary}.`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-2 md:p-8"
    >
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 md:col-span-2">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">
          Incomplete is okay
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Send whatever you know. A venue name, host name, Instagram, flyer link, Google link, or one karaoke day is enough to get it into the SingHUB review queue.
        </p>
      </div>

      <FormField label="Venue or karaoke night name" name="venue-name" helper="Example: Pal Joey's, Karaoke with Trini, Thursday karaoke at The Luau" />
      <FormField label="Neighborhood / city" name="neighborhood" helper="Optional. Close enough is fine." />
      <FormField label="Address" name="address" className="md:col-span-2" helper="Optional. A Google link or IG is fine instead." />

      <fieldset className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:col-span-2">
        <legend className="px-2 text-sm font-semibold text-slate-200">
          Karaoke days
        </legend>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Select any days you know. Leave blank if you are not sure.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {karaokeDays.map((day) => (
            <label
              key={day}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-100"
            >
              <input
                type="checkbox"
                name="karaoke-days"
                value={day}
                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-fuchsia-400 focus:ring-fuchsia-400"
              />
              {day}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="Start time" name="start-time" helper="Optional. Approximate is fine." />
      <FormField label="End time" name="end-time" helper="Optional." />
      <FormField label="Host/KJ name" name="host-name" helper="Optional, but very helpful." />
      <FormField label="Source link" name="source-link" type="url" helper="Google link, flyer, event page, or anything that points us in the right direction." />
      <FormField label="Venue website" name="venue-website" type="url" />
      <FormField label="Venue Instagram" name="venue-instagram" helper="Handle or link." />
      <FormField label="Venue contact" name="venue-contact" helper="Phone, email, or booking contact if known." />
      <FormField label="Your name" name="submitter-name" helper="Optional." />
      <FormField label="Your contact" name="submitter-contact" helper="Optional. Only needed if we should follow up." />

      <label className="block md:col-span-2">
        <span className="text-sm font-semibold text-slate-200">
          Notes for SingHUB
        </span>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Tell us anything: “I think they do karaoke Thursdays,” “this flyer is old,” “call before posting,” or “KJ is on IG.”
        </p>
        <textarea
          name="notes"
          rows={5}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
      </label>

      {errorMessage && (
        <p className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-4 text-sm font-semibold text-fuchsia-100 md:col-span-2">
          {errorMessage}
        </p>
      )}

      {submittedMessage && (
        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100 md:col-span-2">
          {submittedMessage}
        </p>
      )}

      <div className="md:col-span-2">
        <Button type="submit">Submit what I know</Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  type = "text",
  helper,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  helper?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-200">
        {label}
      </span>
      {helper && <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>}
      <input
        name={name}
        type={type}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  );
}
