import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/supabase/types";

// Reads/writes public.orders via the service-role client. RLS lets the
// owning customer SELECT/INSERT their own row but grants no UPDATE — only
// this service-role path can move an order out of pending_verification
// (see birr_gebeya/migrations/004_broker_dashboard.sql).

/** Newest-first — the orders a broker is most likely acting on right now. */
export async function listPendingOrders(): Promise<OrderRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("status", "pending_verification")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Every order regardless of status — feeds the Orders page stats/chart. */
export async function listAllOrders(): Promise<OrderRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle<OrderRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function decideOrder(
  id: string,
  decision: "placed" | "rejected",
  brokerId: string | null,
): Promise<OrderRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      status: decision,
      verified_at: new Date().toISOString(),
      verified_by: brokerId,
    })
    .eq("id", id)
    .eq("status", "pending_verification") // no-op if already decided
    .select("*")
    .single<OrderRow>();
  if (error) throw new Error(error.message);
  return data;
}
