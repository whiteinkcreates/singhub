import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type SingBoardRegion = "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";

export type PersistedSingBoardFlyer = {
  id: string;
  title: string;
  venue: string;
  neighborhood: string;
  region: SingBoardRegion;
  detail: string;
  x: number;
  y: number;
  rotation: number;
  imageUrl: string;
  pinned: true;
  eventDate: string;
};

function hashAccessCode(code: string) {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export async function getActiveSingBoardFlyers(): Promise<PersistedSingBoardFlyer[]> {
  const supabase = createAdminClient();
  await supabase.rpc("singboard_archive_expired");

  const { data, error } = await supabase
    .from("singboard_flyers")
    .select("id,title,venue_name,neighborhood,region,detail,image_url,event_date,x,y,rotation")
    .eq("status", "active")
    .order("pinned_at", { ascending: true });

  if (error) throw new Error(`Failed to load SingBOARD flyers: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    venue: row.venue_name,
    neighborhood: row.neighborhood,
    region: row.region as SingBoardRegion,
    detail: row.detail || "",
    x: Number(row.x),
    y: Number(row.y),
    rotation: Number(row.rotation),
    imageUrl: row.image_url,
    pinned: true as const,
    eventDate: row.event_date,
  }));
}

export async function getAuthorizedSingBoardPoster(accessCode: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singboard_posters")
    .select("id,display_name,poster_type,venue_id,host_id")
    .eq("access_code_hash", hashAccessCode(accessCode))
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to verify SingBOARD access: ${error.message}`);
  return data;
}

export async function createSingBoardFlyer(input: {
  posterId: string;
  title: string;
  venueName: string;
  neighborhood: string;
  region: SingBoardRegion;
  detail: string;
  imageUrl: string;
  imagePublicId?: string;
  eventDate: string;
  x: number;
  y: number;
  rotation: number;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singboard_flyers")
    .insert({
      poster_id: input.posterId,
      title: input.title,
      venue_name: input.venueName,
      neighborhood: input.neighborhood,
      region: input.region,
      detail: input.detail,
      image_url: input.imageUrl,
      image_public_id: input.imagePublicId || null,
      event_date: input.eventDate,
      x: input.x,
      y: input.y,
      rotation: input.rotation,
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to publish SingBOARD flyer: ${error.message}`);
  return data.id as string;
}
