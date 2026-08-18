import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BrokerRow } from "@/lib/supabase/types";

export interface BrokerSession {
  userId: string;
  email: string | null;
  broker: BrokerRow;
}

export class NotAuthorizedError extends Error {}

// Confirms the current cookie session belongs to a signed-in user with a
// row in public.brokers — broker staff are a separate allow-list from
// customer `profiles`, not a flag on them (see
// birr_gebeya/migrations/004_broker_dashboard.sql). The lookup always goes
// through the service-role client so RLS (which grants brokers no special
// access to their own row) can't hide a mismatch — the anon-key session
// only proves *who* is asking.
export async function requireBroker(): Promise<BrokerSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new NotAuthorizedError("Not signed in.");
  }

  const admin = createAdminClient();
  const { data: broker, error } = await admin
    .from("brokers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<BrokerRow>();

  if (error || !broker) {
    throw new NotAuthorizedError("This account is not a broker.");
  }

  return { userId: user.id, email: user.email ?? null, broker };
}
