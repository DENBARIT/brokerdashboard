import Link from "next/link";
import { listPendingRegistrations } from "@/lib/data/registrations";
import { Card, EmptyState, PageHeader, formatTimestamp } from "@/components/ui";

export default async function RegistrationsPage() {
  const profiles = await listPendingRegistrations();

  return (
    <div>
      <PageHeader
        title="Pending Registrations"
        description={`${profiles.length} customer${profiles.length === 1 ? "" : "s"} waiting on a CSD account`}
      />

      <Card className="overflow-x-auto p-0">
        {profiles.length === 0 ? (
          <div className="p-5">
            <EmptyState>No registrations are waiting right now.</EmptyState>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">National ID</th>
                <th className="px-4 py-3">Region</th>
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
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    {formatTimestamp(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
