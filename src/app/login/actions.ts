"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BrokerRow } from "@/lib/supabase/types";

const LoginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid e-mail." }),
  password: z.string().min(1, { message: "Password is required." }),
  // FormData.get() returns null (not undefined) for an absent field — e.g.
  // the hidden `next` input is only rendered when a ?next= param is present
  // — so this has to accept null, not just undefined .optional() would.
  next: z.string().nullish(),
});

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password, next } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Incorrect e-mail or password." };
  }

  // The anon-key session proves *who* signed in; broker membership is only
  // ever trusted from the service-role client, never from the client-side
  // session, so a non-broker can never talk themselves into the dashboard.
  const admin = createAdminClient();
  const { data: broker } = await admin
    .from("brokers")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle<BrokerRow>();

  if (!broker) {
    await supabase.auth.signOut();
    return {
      error:
        "This account isn't registered as a broker. Ask an admin to add you to the brokers table.",
    };
  }

  redirect(next && next.startsWith("/") ? next : "/registrations");
}
