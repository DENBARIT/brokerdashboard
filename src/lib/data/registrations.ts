import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/lib/supabase/types";

// Reads/writes public.profiles via the service-role client — brokers don't
// own these rows, so bypassing RLS is required (mirrors admin-dashboard's
// lib/data/users.ts).

/** Oldest-first — a broker works this like a queue. */
export async function listPendingRegistrations(): Promise<ProfileRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("csd_account_status", "pending")
    .order("created_at", { ascending: true })
    .returns<ProfileRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProfile(id: string): Promise<ProfileRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProfileRow>();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Issues a CSD account for a customer — the mobile app's Realtime
 * subscription on `profiles` picks this up and shows it under the user's
 * name (see birr_gebeya/lib/models/app_state.dart:subscribeToProfileUpdates).
 */
export async function setCsdAccount(
  id: string,
  csdAccountNumber: string,
): Promise<ProfileRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      csd_account_number: csdAccountNumber,
      csd_account_status: "active",
    })
    .eq("id", id)
    .select("*")
    .single<ProfileRow>();
  if (error) throw new Error(error.message);
  return data;
}
