import { signOutAction } from "@/app/actions";
import { LogOut } from "lucide-react";
import { MobileNav } from "./mobile-nav";

export function Topbar({ email }: { email: string | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 md:px-6">
      <MobileNav />
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-neutral-600 dark:text-neutral-400 sm:inline">
          {email}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
