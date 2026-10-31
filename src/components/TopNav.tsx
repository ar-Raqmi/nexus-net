"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import PixelIcon from "./PixelIcon";
import RoleSwitcher from "./RoleSwitcher";
import { NAV_BY_ROLE } from "@/lib/roles";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

export default function TopNav() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const storedRole = useGameStore((s) => s.role);
  const setRole = useGameStore((s) => s.setRole);
  const links = NAV_BY_ROLE[hydrated ? storedRole : "startup"];

  // Deep links to a role-only page (e.g. a shared /talent URL) adopt that role so the nav matches.
  useEffect(() => {
    if (!hydrated) return;
    const owner = pathname.startsWith("/talent") ? "talent" : pathname.startsWith("/investor") ? "investor" : null;
    if (owner && owner !== storedRole) setRole(owner);
  }, [hydrated, pathname, storedRole, setRole]);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 whitespace-nowrap font-display text-xl tracking-tight text-ink"
          >
            <span className="inline-flex origin-center group-hover:animate-wiggle">
              <Logo size={32} />
            </span>
            <span>
              Nexus<span className="text-primary"> Net</span>
            </span>
          </Link>
          <nav aria-label="Main" className="hidden sm:block ml-auto">
            <ul className="flex items-center gap-2">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                        active
                          ? "animate-pop bg-primary text-white"
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
          <RoleSwitcher />
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would otherwise become the containing block for fixed. */}
      <nav
        aria-label="Main"
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-14 flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[11px] font-semibold ${
                    active ? "text-primary-dark" : "text-muted"
                  }`}
                >
                  <PixelIcon
                    name={link.icon}
                    size={22}
                    className={`group-hover:animate-wiggle group-active:animate-wiggle ${active ? "animate-pop" : "opacity-70"}`}
                  />
                  {link.short ?? link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
