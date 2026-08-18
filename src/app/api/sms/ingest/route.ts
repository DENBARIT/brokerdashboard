import { NextResponse } from "next/server";
import { guardBroker } from "@/lib/auth/guardBroker";
import { ingestSms } from "@/lib/data/sms";

// Manual paste-in flow: a signed-in broker pastes a verification SMS here
// and it's matched against pending orders immediately (see
// src/lib/data/sms.ts and birr_gebeya/migrations/004_broker_dashboard.sql).
// The gateway webhook this shares ingestSms() with is a separate,
// not-yet-built route authorized by SMS_WEBHOOK_SECRET instead of a broker
// session.
export async function POST(request: Request) {
  const guard = await guardBroker();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const rawText = typeof body?.raw_text === "string" ? body.raw_text.trim() : "";
  if (!rawText) {
    return NextResponse.json({ error: "Paste the SMS text first." }, { status: 400 });
  }

  try {
    const sms = await ingestSms(rawText, guard.userId);
    return NextResponse.json({ data: sms });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to log the SMS." },
      { status: 500 },
    );
  }
}
