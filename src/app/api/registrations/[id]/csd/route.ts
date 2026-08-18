import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardBroker } from "@/lib/auth/guardBroker";
import { setCsdAccount } from "@/lib/data/registrations";

const PatchSchema = z.object({
  csd_account_number: z.string().trim().min(1, "CSD account number is required."),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await guardBroker();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const profile = await setCsdAccount(id, parsed.data.csd_account_number);
    return NextResponse.json({ data: profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 },
    );
  }
}
