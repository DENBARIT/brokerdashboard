import { listAllOrders, listPendingOrders } from "@/lib/data/orders";
import { listSmsMessages } from "@/lib/data/sms";
import { computeOrderStats } from "@/lib/data/order-stats";
import { Card, PageHeader, StatTile, formatETB } from "@/components/ui";
import { MonthlyVolumeChart } from "@/components/charts/monthly-volume-chart";
import { OrdersQueue } from "./orders-queue";

export default async function OrdersPage() {
  const [allOrders, pendingOrders, smsMessages] = await Promise.all([
    listAllOrders(),
    listPendingOrders(),
    listSmsMessages(),
  ]);
  const stats = computeOrderStats(allOrders);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Investment activity across every customer order."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Pending Orders" value={stats.pendingCount.toLocaleString()} />
        <StatTile label="Approved Orders" value={stats.approvedCount.toLocaleString()} />
        <StatTile label="Rejected Orders" value={stats.rejectedCount.toLocaleString()} />
        <StatTile
          label="Total Investment Volume (ETB)"
          value={formatETB(stats.totalVolume)}
          sublabel="Sum of approved orders"
        />
        <StatTile
          label="Active Investors"
          value={stats.activeInvestors.toLocaleString()}
          sublabel="Distinct customers with an approved order"
        />
        <StatTile
          label="Average Order Size"
          value={formatETB(stats.averageOrderSize)}
        />
      </div>

      <Card className="mt-4 mb-6">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Monthly growth
        </h2>
        <MonthlyVolumeChart data={stats.monthlyVolume} />
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Awaiting verification
      </h2>
      <OrdersQueue initialOrders={pendingOrders} initialSmsMessages={smsMessages} />
    </div>
  );
}
