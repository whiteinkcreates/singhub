import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type GoLinkStatus = "active" | "paused" | "archived";
export type GoLink = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  linkType: string;
  campaign: string;
  partner: string;
  channel: string;
  placement: string;
  tags: string[];
  notes: string;
  status: GoLinkStatus;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type GoLinkRow = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  link_type: string | null;
  campaign: string | null;
  partner: string | null;
  channel: string | null;
  placement: string | null;
  tags: string[] | null;
  notes: string | null;
  status: GoLinkStatus;
  click_count: number | string | null;
  last_clicked_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: GoLinkRow): GoLink {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    destination: row.destination,
    linkType: row.link_type || "other",
    campaign: row.campaign || "",
    partner: row.partner || "",
    channel: row.channel || "",
    placement: row.placement || "",
    tags: row.tags || [],
    notes: row.notes || "",
    status: row.status,
    clickCount: Number(row.click_count || 0),
    lastClickedAt: row.last_clicked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeGoSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function normalizeGoDestination(input: string) {
  const value = input.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Destination must use http or https.");
  return url.toString();
}

export function parseGoTags(input: string) {
  return [...new Set(input.split(",").map(tag => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

export function getGoPublicUrl(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://singhub.app").replace(/\/$/, "");
  return `${base}/go/${slug}`;
}

export async function listGoLinks() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singhub_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data || []) as GoLinkRow[]).map(mapRow);
}

export async function getGoLinkBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singhub_links")
    .select("*")
    .eq("slug", normalizeGoSlug(slug))
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as GoLinkRow) : null;
}

export async function getGoLinkById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singhub_links")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as GoLinkRow) : null;
}

export async function createGoLink(input: {
  name: string;
  slug: string;
  destination: string;
  linkType?: string;
  campaign?: string;
  partner?: string;
  channel?: string;
  placement?: string;
  tags?: string[];
  notes?: string;
}) {
  const slug = normalizeGoSlug(input.slug);
  if (slug.length < 3) throw new Error("Slug must be at least 3 characters.");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singhub_links")
    .insert({
      name: input.name.trim(),
      slug,
      destination: normalizeGoDestination(input.destination),
      link_type: input.linkType?.trim() || "other",
      campaign: input.campaign?.trim() || null,
      partner: input.partner?.trim() || null,
      channel: input.channel?.trim() || null,
      placement: input.placement?.trim() || null,
      tags: input.tags || [],
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as GoLinkRow);
}

export async function updateGoLink(id: string, input: {
  name: string;
  destination: string;
  linkType?: string;
  campaign?: string;
  partner?: string;
  channel?: string;
  placement?: string;
  tags?: string[];
  notes?: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("singhub_links")
    .update({
      name: input.name.trim(),
      destination: normalizeGoDestination(input.destination),
      link_type: input.linkType?.trim() || "other",
      campaign: input.campaign?.trim() || null,
      partner: input.partner?.trim() || null,
      channel: input.channel?.trim() || null,
      placement: input.placement?.trim() || null,
      tags: input.tags || [],
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as GoLinkRow);
}

export async function setGoLinkStatus(id: string, status: GoLinkStatus) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("singhub_links")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function cloneGoLink(id: string, input: { name: string; slug: string; channel?: string; placement?: string }) {
  const source = await getGoLinkById(id);
  if (!source) throw new Error("Source link not found.");
  return createGoLink({
    name: input.name,
    slug: input.slug,
    destination: source.destination,
    linkType: source.linkType,
    campaign: source.campaign,
    partner: source.partner,
    channel: input.channel?.trim() || source.channel,
    placement: input.placement?.trim() || source.placement,
    tags: source.tags,
    notes: source.notes,
  });
}

export async function recordGoLinkClick(linkId: string, input: { referrer?: string; userAgent?: string; isBot: boolean }) {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("record_singhub_link_click", {
    p_link_id: linkId,
    p_referrer: input.referrer || null,
    p_user_agent: input.userAgent || null,
    p_is_bot: input.isBot,
  });
  if (error) throw error;
}
