import { Activity, BrainCircuit, LineChart, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { RiotSearch } from "@/components/riot-search";

const signals = [
  { icon: Activity, label: "Match data", value: "20 recent games" },
  { icon: LineChart, label: "Performance", value: "Trends, not guesses" },
  { icon: BrainCircuit, label: "Next step", value: "Actionable coaching" },
];

export default function Home() {
  const riotConfigured = Boolean(process.env.RIOT_API_KEY);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="noise" />
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <BrandMark />
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          {riotConfigured ? "Riot connection ready" : "Riot connection pending"}
        </div>
      </nav>
      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-24">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-sm font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" /> League performance intelligence
          </div>
          <h1 className="max-w-2xl text-balance text-[clamp(3.7rem,8vw,7.6rem)] font-black leading-[.82] tracking-[-.07em]">
            Play smarter.<span className="block text-primary">Climb faster.</span>
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl">
            Nobz turns your recent games into clear performance signals — so you know exactly what to improve next.
          </p>
          <div className="mt-10 max-w-2xl"><RiotSearch /><p className="mt-3 px-1 text-sm text-muted-foreground">Enter your Riot ID exactly as it appears in-game, including the tag.</p></div>
          <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
            {signals.map(({ icon: Icon, label, value }) => (
              <div key={label} className="group border-l border-white/10 py-1 pl-4 transition-colors hover:border-primary/70">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Icon className="size-4 text-primary" /> {label}</div>
                <p className="font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative hidden min-h-[620px] lg:block" aria-hidden="true">
          <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_56%)] blur-2xl" />
          <div className="absolute left-1/2 top-1/2 h-[485px] w-[365px] -translate-x-1/2 -translate-y-1/2 rotate-3 rounded-[2.5rem] border border-primary/20 bg-[#0d1312] p-5 shadow-[0_40px_120px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Example analysis</p><p className="mt-1 text-2xl font-bold">Salah#NOBZ</p></div>
              <div className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 font-black text-primary">N</div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[[ "64%", "Win rate" ], [ "3.4", "KDA" ], [ "7.1", "CS/min" ]].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/7 bg-white/[0.025] p-3"><p className="text-xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-white/8 bg-[#111a18] p-5">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/10"><BrainCircuit className="size-5 text-primary" /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nobz focus</p><p className="font-bold">Survive the first 10 min</p></div></div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">42% of your deaths happen before minute 10. Track the enemy jungler and protect your third-wave crash.</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full w-[68%] rounded-full bg-primary" /></div>
            </div>
            <div className="mt-3 space-y-2">
              {["Win · Renekton · 8 / 2 / 6", "Loss · Aatrox · 4 / 7 / 3", "Win · Renekton · 11 / 3 / 5"].map((match, i) => (
                <div key={match} className="flex items-center justify-between rounded-2xl border border-white/7 bg-white/[0.02] px-4 py-3 text-sm"><span>{match}</span><span className={i === 1 ? "text-rose-400" : "text-primary"}>{i === 1 ? "L" : "W"}</span></div>
              ))}
            </div>
          </div>
          <span className="absolute right-5 top-28 font-mono text-xs uppercase tracking-[.25em] text-primary/60">Illustrative preview</span>
          <span className="absolute bottom-20 left-0 font-mono text-xs uppercase tracking-[.25em] text-muted-foreground">Built for the climb</span>
        </div>
      </section>
    </main>
  );
}
