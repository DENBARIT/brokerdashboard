import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SmsMessageRow } from "@/lib/supabase/types";
import { decideOrder, listPendingOrders } from "./orders";
import { findMatch } from "@/lib/matching";

/** Newest-first. */
export async function listSmsMessages(): Promise<SmsMessageRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("broker_sms_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<SmsMessageRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Matches [rawText] against currently pending orders and logs the result.
 * Shared by the manual paste-in form (POST /api/sms/ingest, broker-session
 * authorized) and the webhook stub (POST /api/sms/webhook, shared-secret
 * authorized) — see birr_gebeya/migrations/004_broker_dashboard.sql. A
 * clean "matched" result (amount, name, and asset all line up) is treated
 * as verification and auto-approves the order — see decideOrder() below.
 * "mismatched"/"unmatched" results still leave the order in
 * pending_verification for a broker to review manually on /orders/[id].
 */
export async function ingestSms(
  rawText: string,
  brokerId: string | null,
): Promise<SmsMessageRow> {
  const pendingOrders = await listPendingOrders();
  const outcome = findMatch(rawText, pendingOrders);
  const matchedOrder = pendingOrders.find((o) => o.id === outcome.orderId);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("broker_sms_messages")
    .insert({
      broker_id: brokerId,
      raw_text: rawText,
      parsed_amount: outcome.parsedAmount,
      parsed_user_name: matchedOrder?.user_full_name ?? null,
      parsed_asset_name: matchedOrder?.asset_name ?? null,
      matched_order_id: outcome.orderId,
      match_result: outcome.result,
    })
    .select("*")
    .single<SmsMessageRow>();
  if (error) throw new Error(error.message);

  if (outcome.result === "matched" && matchedOrder) {
    try {
      await decideOrder(matchedOrder.id, "placed", brokerId);
    } catch {
      // The order may have already been decided (e.g. a broker acted on it
      // manually moments earlier) — the SMS is still logged either way.
    }
  }

  return data;
}
