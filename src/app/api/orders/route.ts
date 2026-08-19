import { NextResponse } from "next/server";
import { guardBroker } from "@/lib/auth/guardBroker";
import { listPendingOrders } from "@/lib/data/orders";
import { listSmsMessages } from "@/lib/data/sms";

// Polled by the client-side orders queue (see orders-queue.tsx) so a newly
// placed order shows up without the broker having to reload the page —
// there's no Realtime subscription here since RLS only grants customers
// SELECT on their own order rows, not brokers.
export async function GET() {
  const guard = await guardBroker();
  if (guard instanceof NextResponse) return guard;

  const [orders, smsMessages] = await Promise.all([
    listPendingOrders(),
    listSmsMessages(),
  ]);
  return NextResponse.json({ orders, smsMessages });
}
