"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/orders/${orderId}/${action}`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Failed to save the decision.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => decide("approve")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working…" : "Place order"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => decide("reject")}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
