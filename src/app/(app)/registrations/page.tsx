import Link from "next/link";
import { listRegistrations } from "@/lib/data/registrations";
import { Badge, Card, EmptyState, PageHeader, formatTimestamp } from "@/components/ui";
import type { ProfileRow } from "@/lib/supabase/types";

export default async function RegistrationsPage() {
  const profiles = await listRegistrations();
  const pending = profiles.filter((p) => p.csd_account_status === "pending");
  const active = profiles.filter((p) => p.csd_account_status === "active");

  return (
    <div>
      <PageHeader
        title="Registrations"
        description={`${pending.length} customer${pending.length === 1 ? "" : "s"} waiting on a CSD account · ${active.length} issued`}
      />

      <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Awaiting CSD account
      </h2>
      <Card className="mb-8 overflow-x-auto p-0">
        {pending.length === 0 ? (
          <div className="p-5">
            <EmptyState>No registrations are waiting right now.</EmptyState>
          </div>
        ) : (
          <RegistrationsTable profiles={pending} />
        )}
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        CSD account issued
      </h2>
      <Card className="overflow-x-auto p-0">
        {active.length === 0 ? (
          <div className="p-5">
            <EmptyState>No customers have a CSD account yet.</EmptyState>
          </div>
        ) : (
          <RegistrationsTable profiles={active} showCsdAccount />
        )}
      </Card>
    </div>
  );
}

function RegistrationsTable({
  profiles,
  showCsdAccount = false,
}: {
  profiles: ProfileRow[];
  showCsdAccount?: boolean;
}) {
  return (
    <table className="w-full min-w-[720px] text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <th className="px-4 py-3">Customer</th>
          <th className="px-4 py-3">Contact</th>
          <th className="px-4 py-3">National ID</th>
          <th className="px-4 py-3">Region</th>
          {showCsdAccount && <th className="px-4 py-3">CSD account</th>}
          <th className="px-4 py-3">Registered</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((p) => (
          <tr
            key={p.id}
            className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
          >
            <td className="px-4 py-3">
              <Link
                href={`/registrations/${p.id}`}
                className="font-medium text-neutral-900 hover:text-emerald-700 dark:text-neutral-100 dark:hover:text-emerald-400"
              >
                {p.full_name || p.username}
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                @{p.username}
              </p>
            </td>
            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
              <p>{p.phone_number ?? p.email ?? "—"}</p>
            </td>
            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
              {p.national_id ?? "—"}
            </td>
            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
              {p.region ?? "—"}
            </td>
            {showCsdAccount && (
              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                <Badge tone="good">{p.csd_account_number}</Badge>
              </td>
            )}
            <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
              {formatTimestamp(p.created_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
