import { redirect } from "next/navigation";
import { requireBroker, NotAuthorizedError } from "@/lib/auth/requireBroker";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null;

  try {
    const session = await requireBroker();
    email = session.email;
  } catch (err) {
    if (err instanceof NotAuthorizedError) {
      const supabase = await createClient();
      await supabase.auth.signOut();
      redirect("/login?error=unauthorized");
    }
    throw err;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar email={email} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
