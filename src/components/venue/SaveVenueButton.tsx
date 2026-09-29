"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SaveVenueButtonProps = {
  slug: string;
  name: string;
  neighborhood?: string;
};

export function SaveVenueButton({ slug, name, neighborhood }: SaveVenueButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase
        .from("singer_saved_venues")
        .select("venue_slug")
        .eq("user_id", data.user.id)
        .eq("venue_slug", slug)
        .maybeSingle();
      setSaved(Boolean(row));
    });
  }, [slug]);

  async function toggleSaved() {
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const query = new URLSearchParams({ save: slug, name, neighborhood: neighborhood ?? "" });
      router.push(`/account?${query.toString()}`);
      return;
    }

    if (saved) {
      await supabase
        .from("singer_saved_venues")
        .delete()
        .eq("user_id", data.user.id)
        .eq("venue_slug", slug);
      setSaved(false);
    } else {
      await supabase.from("singer_saved_venues").upsert({
        user_id: data.user.id,
        venue_slug: slug,
        venue_name: name,
        neighborhood: neighborhood || null,
      });
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={busy}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-fuchsia-300/45 bg-fuchsia-300/10 px-5 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-300/20 disabled:opacity-60"
    >
      {saved ? "Saved to My SingHUB" : "Save venue"}
    </button>
  );
}
