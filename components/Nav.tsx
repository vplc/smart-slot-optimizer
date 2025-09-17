"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/policy", label: "Policy" },
  { href: "/results", label: "Results" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          OverbookIQ
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-md px-3 py-2 transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
