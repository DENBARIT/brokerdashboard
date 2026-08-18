"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SmsMessageRow } from "@/lib/supabase/types";
import { Badge } from "@/components/ui";

export function SmsPasteForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmsMessageRow | null>(null);

  function submit() {
    setError(null);
    setResult(null);
    const rawText = text.trim();
    if (!rawText) {
      setError("Paste the SMS text first.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/sms/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Failed to log the SMS.");
        return;
      }
      setResult(body.data as SmsMessageRow);
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="raw_text"
          className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Paste verification SMS
        </label>
        <textarea
          id="raw_text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. You have transferred ETB 5,000.00 to Abebe Kebede for 91-Day T-Bill..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Matching…" : "Match & log SMS"}
        </button>
      </div>

      {result && <ResultBanner sms={result} />}
    </div>
  );
}

function ResultBanner({ sms }: { sms: SmsMessageRow }) {
  if (sms.match_result === "matched") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone="good">Matched</Badge>
          <span className="text-emerald-800 dark:text-emerald-300">
            {sms.parsed_user_name} · {sms.parsed_asset_name}
          </span>
        </div>
        <Link
          href={`/orders/${sms.matched_order_id}`}
          className="text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Review the order →
        </Link>
      </div>
    );
  }

  if (sms.match_result === "mismatched") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/40">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone="critical">Amount matched, but name/asset didn&apos;t</Badge>
        </div>
        <p className="text-red-700 dark:text-red-400">
          Parsed amount ETB {sms.parsed_amount?.toLocaleString("en-US")} lined
          up with a pending order, but the buyer name or asset didn&apos;t —
          eyeball it before approving.
        </p>
        <Link
          href={`/orders/${sms.matched_order_id}`}
          className="mt-1 inline-block text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Review the order →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
      <Badge>No pending order matched</Badge>
      <p className="mt-1">
        {sms.parsed_amount !== null
          ? `Parsed amount ETB ${sms.parsed_amount.toLocaleString("en-US")}, but no pending order has that amount.`
          : "Couldn't find an amount in that text."}
      </p>
    </div>
  );
}
