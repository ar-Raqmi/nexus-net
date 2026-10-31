"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quest, Startup, Verdict } from "@/lib/types";
import { isApproved, XP_BY_TYPE } from "@/lib/game";
import { sampleProofQuest } from "@/lib/proof";
import { seedQuests, seedStartups } from "@/seed";

interface GameState {
  currentStartupId: string | null;
  startups: Startup[];
  quests: Quest[];

  login: (startupId: string) => void;
  logout: () => void;
  addQuests: (quests: Quest[]) => void;
  updateQuest: (questId: string, patch: Partial<Quest>) => void;
  /** Mark a quest verified and credit its XP to the owning startup. */
  completeQuest: (questId: string, patch?: Partial<Quest>) => void;
  resetDemo: () => void;
  addSampleQuest: (startupId: string) => void;
  recordProof: (questId: string, verdict: Verdict, mode: "live" | "demo") => void;
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

      addSampleQuest: (startupId) => set(state => {
        const startup = state.startups.find(s => s.id === startupId);
        if (!startup) return state;
        const quest = sampleProofQuest(startup);
        return state.quests.some(q => q.id === quest.id) ? state : { quests: [...state.quests, quest] };
      }),

      recordProof: (questId, verdict, mode) => set(state => {
        const quest = state.quests.find(q => q.id === questId);
        if (!quest || quest.status === "verified" || quest.startupId !== state.currentStartupId) return state;
        const approved = isApproved(verdict);
        return {
          quests: state.quests.map(q => q.id !== questId ? q : {
            ...q, verdict, verificationMode: mode,
            status: approved ? "verified" : verdict.decision === "rejected" ? "rejected" : "open",
            ...(approved ? { completedAt: new Date().toISOString().slice(0, 10) } : {}),
          }),
          startups: approved ? state.startups.map(s => s.id === quest.startupId ? { ...s, xp: s.xp + XP_BY_TYPE[quest.type] } : s) : state.startups,
        };
      }),

      addQuests: (quests) =>
        set((state) => ({ quests: [...state.quests, ...quests] })),

      updateQuest: (questId, patch) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId ? { ...q, ...patch } : q,
          ),
        })),

      completeQuest: (questId, patch) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === questId);
          if (!quest || quest.status === "verified" || !patch?.verdict || !isApproved(patch.verdict)) return state;
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
