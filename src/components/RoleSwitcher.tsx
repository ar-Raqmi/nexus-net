"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLE_BY_ID, ROLES, type Role } from "@/lib/roles";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import PixelIcon from "./PixelIcon";

export default function RoleSwitcher() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const storedRole = useGameStore((s) => s.role);
  const setRole = useGameStore((s) => s.setRole);
  const role = hydrated ? storedRole : "startup";
  const current = ROLE_BY_ID[role];

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Role) => {
    setOpen(false);
    if (next === role) return;
    setRole(next);
    router.push(ROLE_BY_ID[next].home);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Viewing as ${current.label}. Switch role`}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-sm gap-2"
      >
        <PixelIcon name={current.icon} size={20} />
        <span className="hidden sm:inline text-muted font-semibold">Viewing as</span>
        <span>{current.label}</span>
        <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choose a role"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-3xl border-2 border-ink bg-white p-2 shadow-[4px_4px_0_#222] motion-safe:animate-fade-up"
        >
          {ROLES.map((r) => {
            const selected = r.id === role;
            return (
              <li key={r.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(r.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    selected ? "bg-primary/10" : "hover:bg-paper"
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper">
                    <PixelIcon name={r.icon} size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">{r.label}</span>
                    <span className="block text-xs text-muted">{r.blurb}</span>
                  </span>
                  {selected && <PixelIcon name="check" size={18} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
