"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/profile", label: "Company" },
  { href: "/needs", label: "My needs" },
  { href: "/quests", label: "Quests" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/85 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-3 flex flex-col gap-3 sm:flex-row items-center justify-between">
        <Link href="/" className="font-display text-lg sm:text-xl tracking-tight text-ink">
          Nexus<span className="text-primary"> Net</span>
        </Link>
        <ul className="flex max-w-full flex-wrap items-center justify-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-block rounded-full px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-white hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
