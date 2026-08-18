"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProfileRow } from "@/lib/supabase/types";

function generateCandidateId(): string {
  const year = new Date().getFullYear();
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `CSD-${year}-${digits}`;
}

export function CsdAccountForm({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const [value, setValue] = useState(profile.csd_account_number ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function submit(formData: FormData) {
    setError(null);
    const csdAccountNumber = String(formData.get("csd_account_number") ?? "").trim();
    if (!csdAccountNumber) {
      setError("Enter or generate a CSD account number.");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/registrations/${profile.id}/csd`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csd_account_number: csdAccountNumber }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Failed to save the CSD account.");
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  const isActive = profile.csd_account_status === "active";

  return (
    <form action={submit} className="space-y-4">
      <div>
        <label
          htmlFor="csd_account_number"
          className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          CSD account number
        </label>
        <div className="flex gap-2">
          <input
            id="csd_account_number"
            name="csd_account_number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="CSD-2026-482913"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <button
            type="button"
            onClick={() => setValue(generateCandidateId())}
            className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Generate
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Generated ids are a starting point — edit before saving if your CSD
          records use a different number.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving…"
            : isActive
              ? "Update CSD account"
              : "Create CSD account"}
        </button>
        {savedAt && !isPending && (
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            Saved — the customer will see this in their app.
          </span>
        )}
      </div>
    </form>
  );
}
