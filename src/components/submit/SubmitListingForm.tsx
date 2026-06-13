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

export function SubmitListingForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedDays = formData.getAll("karaoke-days").map(String);

    if (selectedDays.length === 0) {
      setSubmittedMessage("");
      setErrorMessage("Choose at least one karaoke day before submitting.");
      return;
    }

    const submissionSummary = [
      `Venue: ${getFormValue(formData, "venue-name")}`,
      `Days: ${selectedDays.join(", ")}`,
      `Start: ${getFormValue(formData, "start-time")}`,
      `End: ${getFormValue(formData, "end-time")}`,
    ].join(" | ");

    setErrorMessage("");
    setSubmittedMessage(
      `Submission captured for review: ${submissionSummary}. Backend delivery will be connected in the next data workflow step.`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-2 md:p-8"
    >
      <FormField label="Venue name" name="venue-name" required />
      <FormField label="Neighborhood" name="neighborhood" required />
      <FormField label="Address" name="address" required className="md:col-span-2" />

      <fieldset className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:col-span-2">
        <legend className="px-2 text-sm font-semibold text-slate-200">
          Karaoke days <span className="text-fuchsia-300">*</span>
        </legend>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Select every day this venue has karaoke.
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

      <FormField label="Start time" name="start-time" required />
      <FormField label="End time" name="end-time" required />
      <FormField label="Host/KJ name" name="host-name" />
      <FormField label="Venue website" name="venue-website" type="url" />
      <FormField label="Venue Instagram" name="venue-instagram" />
      <FormField label="Venue contact email" name="venue-email" type="email" />
      <FormField label="Your name" name="submitter-name" required />
      <FormField label="Your email" name="submitter-email" type="email" required />

      <label className="block md:col-span-2">
        <span className="text-sm font-semibold text-slate-200">
          Notes for singers
        </span>
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
        <Button type="submit">Submit Listing</Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-fuchsia-300">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  );
}
