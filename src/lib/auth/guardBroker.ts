import "server-only";
import { NextResponse } from "next/server";
import { requireBroker, type BrokerSession } from "./requireBroker";

// Route Handler variant of requireBroker(): returns the session, or a
// ready-to-return 401 NextResponse. Callers do:
//   const guard = await guardBroker();
//   if (guard instanceof NextResponse) return guard;
export async function guardBroker(): Promise<BrokerSession | NextResponse> {
  try {
    return await requireBroker();
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
}
