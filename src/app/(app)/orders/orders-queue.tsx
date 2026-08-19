"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, formatETB, formatTimestamp } from "@/components/ui";
import type { OrderRow, SmsMessageRow } from "@/lib/supabase/types";

const POLL_INTERVAL_MS = 8000;

export function OrdersQueue({
  initialOrders,
  initialSmsMessages,
}: {
  initialOrders: OrderRow[];
  initialSmsMessages: SmsMessageRow[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [smsMessages, setSmsMessages] = useState(initialSmsMessages);
  const inFlight = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const body = await res.json();
          setOrders(body.orders ?? []);
          setSmsMessages(body.smsMessages ?? []);
        }
      } catch {
        // Transient network hiccup — next poll will retry.
      } finally {
        inFlight.current = false;
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const smsByOrder = new Map<string, SmsMessageRow>();
  for (const sms of smsMessages) {
    if (sms.matched_order_id && !smsByOrder.has(sms.matched_order_id)) {
      smsByOrder.set(sms.matched_order_id, sms);
    }
  }

  return (
    <Card className="overflow-x-auto p-0">
      {orders.length === 0 ? (
        <div className="p-5">
          <EmptyState>No orders are awaiting verification.</EmptyState>
        </div>
      ) : (
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">CSD account</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">SMS match</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const sms = smsByOrder.get(order.id);
              return (
                <tr
                  key={order.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-neutral-900 hover:text-emerald-700 dark:text-neutral-100 dark:hover:text-emerald-400"
                    >
                      {order.user_full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {order.csd_account_number}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {order.asset_name}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {formatETB(order.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    {formatTimestamp(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {sms?.match_result === "matched" ? (
                      <Badge tone="good">SMS matched</Badge>
                    ) : sms?.match_result === "mismatched" ? (
                      <Badge tone="critical">Mismatch</Badge>
                    ) : (
                      <Badge>No SMS yet</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
