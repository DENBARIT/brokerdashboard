import type { OrderRow } from "@/lib/supabase/types";

export interface OrderStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalVolume: number;
  activeInvestors: number;
  averageOrderSize: number;
  monthlyVolume: Array<{ month: string; volume: number }>;
}

/**
 * "Approved" = status "placed" — the DB's "verified" status exists in the
 * schema's CHECK constraint but decideOrder() never writes it; the broker
 * flow is a single-step approve/reject, so "placed" is the only success
 * state. Volume/investor/size stats only count placed orders — pending and
 * rejected orders were never actual investments.
 */
export function computeOrderStats(orders: OrderRow[]): OrderStats {
  const pending = orders.filter((o) => o.status === "pending_verification");
  const approved = orders.filter((o) => o.status === "placed");
  const rejected = orders.filter((o) => o.status === "rejected");

  const totalVolume = approved.reduce((sum, o) => sum + o.amount, 0);
  const activeInvestors = new Set(approved.map((o) => o.user_id)).size;
  const averageOrderSize =
    approved.length > 0 ? totalVolume / approved.length : 0;

  const monthlyMap = new Map<string, number>();
  for (const o of approved) {
    const key = (o.verified_at ?? o.created_at).slice(0, 7); // YYYY-MM
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + o.amount);
  }
  const monthlyVolume = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, volume]) => ({ month, volume }));

  return {
    pendingCount: pending.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    totalVolume,
    activeInvestors,
    averageOrderSize,
    monthlyVolume,
  };
}
