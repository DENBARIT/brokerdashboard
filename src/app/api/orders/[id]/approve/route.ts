import { NextResponse } from "next/server";
import { guardBroker } from "@/lib/auth/guardBroker";
import { decideOrder } from "@/lib/data/orders";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await guardBroker();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  try {
    const order = await decideOrder(id, "placed", guard.userId);
    return NextResponse.json({ data: order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 },
    );
  }
}
