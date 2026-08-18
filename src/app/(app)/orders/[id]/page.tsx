import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/lib/data/orders";
import { listSmsMessages } from "@/lib/data/sms";
import { Badge, Card, EmptyState, PageHeader, formatETB, formatTimestamp } from "@/components/ui";
import { OrderActions } from "./order-actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, allSms] = await Promise.all([getOrder(id), listSmsMessages()]);
  if (!order) notFound();

  const relatedSms = allSms.filter((s) => s.matched_order_id === order.id);

  return (
    <div className="max-w-2xl">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft size={15} />
        Back to orders
      </Link>

      <PageHeader
        title={`${order.asset_name} — ${formatETB(order.amount)}`}
        description={`Order ID ${order.id}`}
        action={<StatusBadge status={order.status} />}
      />

      <Card className="mb-4">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Detail label="Buyer" value={order.user_full_name} />
          <Detail label="CSD account" value={order.csd_account_number} />
          <Detail label="Asset" value={order.asset_name} />
          <Detail label="Amount" value={formatETB(order.amount)} />
          <Detail label="Placed" value={formatTimestamp(order.created_at)} />
          <Detail
            label="Decided"
            value={order.verified_at ? formatTimestamp(order.verified_at) : null}
          />
        </dl>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Matching SMS
        </h2>
        {relatedSms.length === 0 ? (
          <EmptyState>
            No SMS has been matched to this order yet. Paste it in on the SMS
            Log page.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {relatedSms.map((sms) => (
              <li
                key={sms.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  {sms.match_result === "matched" ? (
                    <Badge tone="good">Matched</Badge>
                  ) : (
                    <Badge tone="critical">Mismatch</Badge>
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatTimestamp(sms.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {sms.raw_text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {order.status === "pending_verification" && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Decision
          </h2>
          <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
            The SMS match above is advisory — review it, then place the order
            in the market or reject it.
          </p>
          <OrderActions orderId={order.id} />
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "placed") return <Badge tone="good">Placed</Badge>;
  if (status === "rejected") return <Badge tone="critical">Rejected</Badge>;
  return <Badge tone="warning">Pending verification</Badge>;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
        {value || "—"}
      </dd>
    </div>
  );
}
