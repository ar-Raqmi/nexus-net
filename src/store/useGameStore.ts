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
  /** Event IDs each startup has subscribed to, keyed by startup id. */
  subscriptions: Record<string, string[]>;
  /**
   * Event IDs that have already granted XP, per startup. Kept separate from
   * `subscriptions` so unsubscribing and re-subscribing can't farm XP.
   */
  creditedEvents: Record<string, string[]>;

  login: (startupId: string) => void;
  logout: () => void;
  addQuests: (quests: Quest[]) => void;
  updateQuest: (questId: string, patch: Partial<Quest>) => void;
  /** Mark a quest verified and credit its XP to the owning startup. */
  completeQuest: (questId: string, patch?: Partial<Quest>) => void;
  /** Subscribe a startup to an event calendar and credit the given XP once. */
  subscribeToEvent: (startupId: string, eventId: string, xp: number) => void;
  /** Remove a subscription. XP already earned is kept. */
  unsubscribeFromEvent: (startupId: string, eventId: string) => void;
  resetDemo: () => void;
}

const initialData = () => ({
  currentStartupId: null,
  startups: seedStartups,
  quests: seedQuests,
  subscriptions: {} as Record<string, string[]>,
  creditedEvents: {} as Record<string, string[]>,
});

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialData(),

      login: (startupId) => set({ currentStartupId: startupId }),
      logout: () => set({ currentStartupId: null }),

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

      subscribeToEvent: (startupId, eventId, xp) =>
        set((state) => {
          const current = state.subscriptions[startupId] ?? [];
          if (current.includes(eventId)) return state;

          // Only credit XP the first time this startup subscribes to the event.
          const credited = state.creditedEvents[startupId] ?? [];
          const firstTime = !credited.includes(eventId);
          const award = firstTime ? xp : 0;

          return {
            subscriptions: { ...state.subscriptions, [startupId]: [...current, eventId] },
            creditedEvents: firstTime
              ? { ...state.creditedEvents, [startupId]: [...credited, eventId] }
              : state.creditedEvents,
            startups: award
              ? state.startups.map((s) =>
                  s.id === startupId ? { ...s, xp: s.xp + award } : s,
                )
              : state.startups,
          };
        }),

      unsubscribeFromEvent: (startupId, eventId) =>
        set((state) => {
          const current = state.subscriptions[startupId] ?? [];
          if (!current.includes(eventId)) return state;
          return {
            subscriptions: {
              ...state.subscriptions,
              [startupId]: current.filter((id) => id !== eventId),
            },
          };
        }),

      resetDemo: () => set(initialData()),
    }),
    { name: "nexus-net-game", version: 2 },
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
