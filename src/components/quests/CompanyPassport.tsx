import type { Quest, Startup } from "@/lib/types";
import { COUNTRY_FLAGS, COUNTRY_NAMES, getLevel, isApproved } from "@/lib/game";

export default function CompanyPassport({ startup, quests }: { startup: Startup; quests: Quest[] }) {
  const stamps = quests.filter(q => q.startupId === startup.id && q.status === "verified" && q.verdict && isApproved(q.verdict) && q.verificationMode);
  const live = stamps.filter(q => q.verificationMode === "live");
  const demoOnly = stamps.length > 0 && live.length === 0;
  const displayed = live.length ? live : stamps;
  return <section id="company-passport" aria-labelledby="passport-title" className="passport-card relative overflow-hidden rounded-3xl bg-[#202849] text-white shadow-card">
    <div className="relative grid gap-7 p-6 sm:p-8 md:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#C8D0FF]">Nexus Net / ASEAN network</p>
        <h2 id="passport-title" className="font-display text-2xl mt-3">Company passport</h2>
        <div className="my-6 flex items-center gap-4"><span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 text-3xl">{COUNTRY_FLAGS[startup.country]}</span><div><h3 className="text-xl font-bold">{startup.name}</h3><p className="text-sm text-white/70">{COUNTRY_NAMES[startup.country]} · {startup.sector}</p></div></div>
        <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-white/60 text-xs">Passport ID</dt><dd className="font-score mt-1 break-all">NN-{startup.id.toUpperCase()}</dd></div><div><dt className="text-white/60 text-xs">Network level</dt><dd className="font-score mt-1">{getLevel(startup.xp).name} · {startup.xp} XP</dd></div></dl>
        <p className="mt-6 text-xs leading-relaxed text-white/60">A record of quest evidence checked by AI. This is not legal identity or company registration verification. Saved in this browser.</p>
      </div>
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Outcome stamps</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${live.length ? "bg-[#ABF1D1] text-[#16402C]" : "bg-yellow text-ink"}`}>{live.length ? `${live.length} AI-checked` : demoOnly ? "Demo passport" : "Awaiting first proof"}</span></div>
        {displayed.length ? <ul className="mt-5 space-y-3 max-h-72 overflow-y-auto">{displayed.map(q => <li key={q.id} className="rounded-xl border border-dashed border-[#ABF1D1]/50 p-4"><div className="flex justify-between gap-3 text-xs text-[#ABF1D1]"><span>{COUNTRY_FLAGS[q.targetCountry]} {COUNTRY_NAMES[q.targetCountry]} / {q.type.toUpperCase()}</span><span>{q.completedAt}</span></div><p className="font-semibold text-sm mt-2">{q.title}</p><p className="text-xs text-white/60 mt-2">{q.verificationMode === "demo" ? "Sample approval · not AI checked" : `${Math.round(q.verdict!.confidence * 100)}% confidence · ${q.verdict!.documentType}`}</p></li>)}</ul> : <div className="py-8 text-center"><span className="text-4xl text-white/30" aria-hidden>◎</span><p className="mt-3 font-semibold">Your next outcome belongs here.</p><p className="mt-2 text-sm text-white/60">Upload proof for an active quest. An approval of 70% confidence or higher adds your first stamp.</p></div>}
      </div>
    </div>
    <div aria-hidden className="border-t border-white/15 bg-black/10 px-6 py-3 font-score text-xs tracking-[0.18em] text-white/40 break-all">NEXUS&lt;NET&lt;{startup.country}&lt;{startup.id.toUpperCase()}&lt;&lt;ASEAN&lt;OUTCOMES</div>
  </section>;
}
