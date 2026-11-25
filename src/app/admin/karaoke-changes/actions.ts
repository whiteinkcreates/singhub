"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKaraokeEventListings } from "@/lib/eventData";
import { eventRunsOnNight } from "@/lib/eventOccurrence";
import { KARAOKE_OVERRIDES_CACHE_TAG, DISCOVERY_OVERRIDES_CACHE_TAG } from "@/lib/karaokeOverrides.server";

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function get(form: FormData, key: string, max = 500) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0,max) : "";
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Choose a valid date.");
  const date = new Date(value+"T12:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==value) throw new Error("Choose a real calendar date.");
  // Only recent or future exceptions are editable. This does not change historical canonical records.
  const today = new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T12:00:00Z");
  const difference = (date.getTime()-today.getTime())/86400000;
  if (difference < -2 || difference > 730) throw new Error("Choose a date from the last two days or next two years.");
  return date;
}
function readableTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Choose a time in HH:MM format.");
  const [hour,minute] = value.split(":").map(Number);
  return String(hour%12||12)+":"+String(minute).padStart(2,"0")+(hour>=12?" PM":" AM");
}
function refresh(slug: string) {
  updateTag(KARAOKE_OVERRIDES_CACHE_TAG);
  updateTag(DISCOVERY_OVERRIDES_CACHE_TAG);
  for (const path of ["/","/discover","/find-karaoke","/venues/"+slug,"/karaoke-tonight-san-diego","/backyard","/hosts","/api/v2/calendar"]) {
    revalidatePath(path);
  }
  revalidatePath("/admin/karaoke-changes");
}
async function validatedEvent(form: FormData) {
  const eventId = get(form,"event_id",150);
  const venueSlug = get(form,"venue_slug",150);
  const day = get(form,"nightlife_date",10);
  if (!eventId || !venueSlug) throw new Error("Select a verified karaoke event.");
  const date = validDate(day);
  const event = (await getKaraokeEventListings()).find(item=>item.eventId===eventId && item.venueSlug===venueSlug && item.activeStatus==="active");
  if (!event) throw new Error("Event is not in the active canonical schedule.");
  // Validate against the unchanged recurrence so an existing cancellation can be edited or undone.
  const weekday = WEEKDAYS[date.getUTCDay()];
  if (!eventRunsOnNight({...event,dateOverrides:[]},weekday,date)) {
    throw new Error("That recurring event does not run on the selected date. Choose its scheduled weekday.");
  }
  return {eventId,venueSlug,day};
}

export async function saveKaraokeChange(form: FormData) {
  await requireAdminAuthorization();
  const {eventId,venueSlug,day} = await validatedEvent(form);
  const status = get(form,"status",30);
  if (!["canceled","time_changed","host_changed"].includes(status)) throw new Error("Choose a supported change.");
  const note = get(form,"note",500) || null;
  const startTime = status==="time_changed" ? readableTime(get(form,"start_time",5)) : null;
  const endTime = status==="time_changed" && get(form,"end_time",5) ? readableTime(get(form,"end_time",5)) : null;
  const hostName = status==="host_changed" ? get(form,"host_name",120) : null;
  if (status==="host_changed" && (!hostName || /^(tbd|unknown|rotating)$/i.test(hostName))) {
    throw new Error("Enter the confirmed replacement host's public name.");
  }
  const {error} = await createAdminClient().from("karaoke_event_overrides").upsert({
    event_id:eventId,venue_slug:venueSlug,nightlife_date:day,status,
    start_time:startTime,end_time:endTime,host_id:null,host_name:hostName,
    note,updated_at:new Date().toISOString(),
  },{onConflict:"event_id,nightlife_date"});
  if (error) throw new Error("Could not save the karaoke change: "+error.message);
  refresh(venueSlug);
  redirect("/admin/karaoke-changes?saved=1");
}

export async function removeKaraokeChange(form: FormData) {
  await requireAdminAuthorization();
  const eventId = get(form,"event_id",150);
  const venueSlug = get(form,"venue_slug",150);
  const day = get(form,"nightlife_date",10);
  if (!eventId || !venueSlug) throw new Error("Choose a saved change.");
  validDate(day);
  const {data,error} = await createAdminClient().from("karaoke_event_overrides")
    .delete().eq("event_id",eventId).eq("venue_slug",venueSlug).eq("nightlife_date",day)
    .select("event_id");
  if (error) throw new Error("Could not undo the karaoke change: "+error.message);
  if (!data?.length) throw new Error("The change was already removed.");
  refresh(venueSlug);
  redirect("/admin/karaoke-changes?removed=1");
}
