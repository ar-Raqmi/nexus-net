"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompanyProfile, CompanyVerification, Quest, Startup } from "@/lib/types";
import { parseCompanyProfile } from "@/lib/proof";
import type { Role } from "@/lib/roles";
import { seedQuests, seedStartups } from "@/seed";

interface GameState {
  /** Which persona the demo is viewed as; only changes navigation and landing pages. */
  role: Role;
  setRole: (role: Role) => void;
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
  /** Swap a startup's untouched open quests for a freshly generated set. */
  replaceOpenQuests: (startupId: string, quests: Quest[]) => void;
  updateQuest: (questId: string, patch: Partial<Quest>) => void;
  /** Mark a quest verified and credit its XP to the owning startup. */
  completeQuest: (questId: string, patch?: Partial<Quest>) => void;
  /** Subscribe a startup to an event calendar and credit the given XP once. */
  subscribeToEvent: (startupId: string, eventId: string, xp: number) => void;
  /** Remove a subscription. XP already earned is kept. */
  unsubscribeFromEvent: (startupId: string, eventId: string) => void;
  resetDemo: () => void;
  companyProfiles: Record<string, CompanyProfile>;
  companyVerifications: Record<string, CompanyVerification>;
  saveCompanyProfile: (profile: CompanyProfile) => void;
  recordCompanyVerification: (verification: CompanyVerification) => void;
}

const initialData = () => ({
  role: "startup" as Role,
  companyProfiles: {} as Record<string, CompanyProfile>,
  companyVerifications: {} as Record<string, CompanyVerification>,
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

      setRole: (role) => set({ role }),
      login: (startupId) => set({ currentStartupId: startupId }),
      logout: () => set({ currentStartupId: null }),

      saveCompanyProfile: (input) => set(state => {
        const profile = parseCompanyProfile(input);
        const existing = state.companyProfiles[profile.startupId];
        const changed = JSON.stringify(existing) !== JSON.stringify(profile);
        const verifications = { ...state.companyVerifications };
        if (changed) delete verifications[profile.startupId];
        const previous = state.startups.find(s => s.id === profile.startupId);
        const startup: Startup = {
          id: profile.startupId, name: profile.legalName, country: profile.country,
          sector: profile.sector, stage: profile.stage, description: profile.description, xp: previous?.xp ?? 0,
        };
        return {
          currentStartupId: startup.id,
          startups: previous ? state.startups.map(s => s.id === startup.id ? startup : s) : [...state.startups, startup],
          companyProfiles: { ...state.companyProfiles, [startup.id]: profile },
          companyVerifications: verifications,
        };
      }),

      recordCompanyVerification: (verification) => set(state => {
        const id = verification.profile.startupId;
        const profile = state.companyProfiles[id];
        // Ignore responses for a profile that was edited while a request was in flight.
        if (!profile || state.currentStartupId !== id || JSON.stringify(profile) !== JSON.stringify(verification.profile)) return state;
        return { companyVerifications: { ...state.companyVerifications, [id]: verification } };
      }),

      addQuests: (quests) =>
        set((state) => ({ quests: [...state.quests, ...quests] })),

      replaceOpenQuests: (startupId, quests) =>
        set((state) => ({
          quests: [
            ...state.quests.filter(
              (q) => !(q.startupId === startupId && q.status === "open" && !q.talentRole),
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
