import {requireAdminAuthorization} from "@/lib/adminAuthorization";
"use server";
import {revalidatePath} from "next/cache";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";
export async function cancelMonthlyMicRsvp(formData:FormData){
 await requireAdminAuthorization();
 const id=String(formData.get("id")||"");
 if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("Invalid RSVP.");
 const {error}=await createAdminClient().from("monthlymic_rsvps").update({status:"cancelled",updated_at:new Date().toISOString()}).eq("id",id).eq("event_id",monthlyMic.id);
 if(error)throw error;
 revalidatePath("/admin/monthlymic");
}
