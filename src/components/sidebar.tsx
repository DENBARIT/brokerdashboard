"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { UserCheck, ReceiptText, MessageSquareText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/registrations", label: "Registrations", icon: UserCheck },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/sms", label: "SMS Log", icon: MessageSquareText },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white px-3 py-4 dark:border-neutral-800 dark:bg-neutral-900 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white p-1 ring-1 ring-neutral-200 dark:ring-neutral-800">
          <Image
            src="/logo.png"
            alt="Birr Gebeya"
            width={512}
            height={512}
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Birr Gebeya
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Broker
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-lg bg-neutral-50 px-3 py-2.5 text-xs text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400">
        SMS matching runs against the raw text you paste in — no gateway is
        connected yet, so paste each verification SMS manually under
        &quot;SMS Log&quot;.
      </div>
    </aside>
  );
}
