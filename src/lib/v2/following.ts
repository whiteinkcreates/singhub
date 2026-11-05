// Owner-only community follows. Saved Picks and hotel plans remain separate.
import { accountClient } from "@/lib/v2/singerAccount";

export type FollowTarget = {
  type: "host" | "venue";
  /** Stable canonical identifier: hostId or venue.id, never a display name. */
  id: string;
  slug: string;
  name: string;
};
export type FollowedEntity = {
  target_type: FollowTarget["type"];
  target_id: string;
  target_slug: string;
  target_name: string;
  notifications_enabled: boolean;
  followed_at: string;
};

async function currentUser() {
  const client = accountClient();
  const {data,error} = await client.auth.getUser();
  if (error) throw error;
  if (!data.user || data.user.is_anonymous) throw new Error("Sign in to follow karaoke hosts and venues.");
  return { client, userId: data.user.id };
}

export async function listFollowing(): Promise<FollowedEntity[]> {
  const {client,userId} = await currentUser();
  const {data,error} = await client.from("singer_follows")
    .select("target_type,target_id,target_slug,target_name,notifications_enabled,followed_at")
    .eq("user_id",userId).order("followed_at",{ascending:false});
  if (error) throw error;
  return (data || []) as FollowedEntity[];
}

export async function followEntity(target: FollowTarget) {
  if (!["host","venue"].includes(target.type) ||
      !target.id.trim() || target.id.length > 128 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.slug) ||
      !target.name.trim() || target.name.trim().length > 180) {
    throw new Error("Cannot follow an unrecognized host or venue.");
  }
  const {client,userId} = await currentUser();
  const {error} = await client.from("singer_follows").upsert({
    user_id:userId,target_type:target.type,target_id:target.id,
    target_slug:target.slug,target_name:target.name.trim(),
  },{onConflict:"user_id,target_type,target_id"});
  if(error)throw error;
}

export async function unfollowEntity(target: Pick<FollowTarget,"type"|"id">) {
  const {client,userId} = await currentUser();
  const {error} = await client.from("singer_follows").delete()
    .eq("user_id",userId).eq("target_type",target.type).eq("target_id",target.id);
  if(error)throw error;
}
