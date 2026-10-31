"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import PixelIcon, { type PixelIconName } from "./PixelIcon";

const links: { href: string; label: string; icon: PixelIconName }[] = [
  { href: "/needs", label: "My needs", icon: "compass" },
  { href: "/quests", label: "Quests", icon: "sparkle" },
  { href: "/events", label: "Events", icon: "meeting" },
  { href: "/leaderboard", label: "Leaderboard", icon: "trophy" },
  { href: "/cradle", label: "Cradle view", icon: "funding" },
];

export default function TopNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap font-display text-xl tracking-tight text-ink"
          >
            <Logo size={32} />
            <span>
              Nexus<span className="text-primary"> Net</span>
            </span>
          </Link>
          <nav aria-label="Main" className="hidden sm:block">
            <ul className="flex items-center gap-2">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
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
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would otherwise become the containing block for fixed. */}
      <nav
        aria-label="Main"
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-5">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[11px] font-semibold ${
                    active ? "text-primary-dark" : "text-muted"
                  }`}
                >
                  <PixelIcon
                    name={link.icon}
                    size={22}
                    className={active ? "" : "opacity-70"}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
