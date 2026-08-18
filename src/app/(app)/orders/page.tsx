import Link from "next/link";
import { listPendingOrders } from "@/lib/data/orders";
import { listSmsMessages } from "@/lib/data/sms";
import { Badge, Card, EmptyState, PageHeader, formatETB, formatTimestamp } from "@/components/ui";

export default async function OrdersPage() {
  const [orders, smsMessages] = await Promise.all([
    listPendingOrders(),
    listSmsMessages(),
  ]);

  // Most recent matched/mismatched SMS per order, for the at-a-glance badge.
  const smsByOrder = new Map<string, (typeof smsMessages)[number]>();
  for (const sms of smsMessages) {
    if (sms.matched_order_id && !smsByOrder.has(sms.matched_order_id)) {
      smsByOrder.set(sms.matched_order_id, sms);
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${orders.length} order${orders.length === 1 ? "" : "s"} awaiting verification`}
      />

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
    </div>
  );
}
