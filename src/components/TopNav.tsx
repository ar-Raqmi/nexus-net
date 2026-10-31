"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/quests", label: "Quests" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/cradle", label: "Cradle view" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/85 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          Nexus<span className="text-primary"> Net</span>
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-full px-3 sm:px-4 py-2 text-sm font-semibold transition-colors ${
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
