"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quest, Startup } from "@/lib/types";
import { seedQuests, seedStartups } from "@/seed";

interface GameState {
  currentStartupId: string | null;
  startups: Startup[];
  quests: Quest[];

  login: (startupId: string) => void;
  logout: () => void;
  addQuests: (quests: Quest[]) => void;
  /** Swap a startup's untouched open quests for a freshly generated set. */
  replaceOpenQuests: (startupId: string, quests: Quest[]) => void;
  updateQuest: (questId: string, patch: Partial<Quest>) => void;
  /** Mark a quest verified and credit its XP to the owning startup. */
  completeQuest: (questId: string, patch?: Partial<Quest>) => void;
  resetDemo: () => void;
}

const initialData = () => ({
  currentStartupId: null,
  startups: seedStartups,
  quests: seedQuests,
});

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialData(),

      login: (startupId) => set({ currentStartupId: startupId }),
      logout: () => set({ currentStartupId: null }),

      addQuests: (quests) =>
        set((state) => ({ quests: [...state.quests, ...quests] })),

      replaceOpenQuests: (startupId, quests) =>
        set((state) => ({
          quests: [
            ...state.quests.filter(
              (q) => !(q.startupId === startupId && q.status === "open"),
            ),
            ...quests,
          ],
        })),

      updateQuest: (questId, patch) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId ? { ...q, ...patch } : q,
          ),
        })),

      completeQuest: (questId, patch) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === questId);
          if (!quest || quest.status === "verified") return state;
          return {
            quests: state.quests.map((q) =>
              q.id === questId
                ? {
                    ...q,
                    ...patch,
                    status: "verified",
                    completedAt: new Date().toISOString().slice(0, 10),
                  }
                : q,
            ),
            startups: state.startups.map((s) =>
              s.id === quest.startupId ? { ...s, xp: s.xp + quest.xp } : s,
            ),
          };
        }),

      resetDemo: () => set(initialData()),
    }),
    { name: "nexus-net-game", version: 1 },
  ),
);

/** True once the persisted store has loaded from localStorage (avoids SSR hydration mismatches). */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useGameStore.persist.onFinishHydration(onChange),
    () => useGameStore.persist.hasHydrated(),
    () => false,
  );
}
