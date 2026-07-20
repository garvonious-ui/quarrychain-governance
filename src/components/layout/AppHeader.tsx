"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Sticky global header.
 *
 * Brand lockup is spec-mandated: "Quarry" in #007BFF, "Chain" in true black.
 * The logo asset is optional — if /public/assets/quarrychain-logo.png is
 * absent the wordmark stands on its own rather than showing a broken image.
 */

const NAV = [
  { label: "Governance", href: "/governance" },
  { label: "Voting", href: "/voting" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6">
        <Link href="/governance" className="flex items-center gap-3">
          {!logoFailed && (
            <Image
              src="/assets/quarrychain-logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
              onError={() => setLogoFailed(true)}
              priority
            />
          )}
          <span className="text-xl font-bold tracking-tight">
            <span className="text-brand">Quarry</span>
            <span className="text-ink">Chain</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex gap-1 rounded-lg bg-well p-1">
          {NAV.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-card text-brand shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
