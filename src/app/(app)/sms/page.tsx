import Link from "next/link";
import { listSmsMessages } from "@/lib/data/sms";
import { Badge, Card, EmptyState, PageHeader, formatTimestamp } from "@/components/ui";
import { SmsPasteForm } from "./sms-paste-form";

export default async function SmsPage() {
  const messages = await listSmsMessages();

  return (
    <div>
      <PageHeader
        title="SMS Log"
        description="No gateway is connected yet — paste each verification SMS as it arrives and it's matched against pending orders automatically."
      />

      <Card className="mb-6">
        <SmsPasteForm />
      </Card>

      <Card className="p-0">
        {messages.length === 0 ? (
          <div className="p-5">
            <EmptyState>No SMS has been logged yet.</EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {messages.map((sms) => (
              <li key={sms.id} className="p-4">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {sms.match_result === "matched" ? (
                      <Badge tone="good">Matched</Badge>
                    ) : sms.match_result === "mismatched" ? (
                      <Badge tone="critical">Mismatch</Badge>
                    ) : (
                      <Badge>Unmatched</Badge>
                    )}
                    {sms.matched_order_id && (
                      <Link
                        href={`/orders/${sms.matched_order_id}`}
                        className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {sms.parsed_user_name ?? "View order"}
                        {sms.parsed_asset_name ? ` — ${sms.parsed_asset_name}` : ""}
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatTimestamp(sms.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {sms.raw_text}
                </p>
                {sms.parsed_amount !== null && (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Parsed amount: ETB {sms.parsed_amount.toLocaleString("en-US")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
