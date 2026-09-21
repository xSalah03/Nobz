"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/riot/routing";

export function RiotSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [riotId, setRiotId] = useState("");
  const [region, setRegion] = useState("euw1");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = riotId.trim();
    const separator = value.lastIndexOf("#");
    if (separator < 1 || separator === value.length - 1) {
      setError("Use the format GameName#TAG");
      return;
    }
    setError("");
    router.push(`/summoner/${region}/${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="relative" noValidate>
      <div className={`flex gap-2 rounded-2xl border border-white/10 bg-[#101715]/95 p-2 shadow-[0_20px_70px_rgba(0,0,0,.35)] ${compact ? "max-w-2xl" : ""}`}>
        <Select value={region} onValueChange={(value) => value && setRegion(value)}>
          <SelectTrigger className="h-12 w-[112px] shrink-0 border-0 bg-white/[0.04] font-bold shadow-none md:w-[135px]"><SelectValue /></SelectTrigger>
          <SelectContent>{REGIONS.map((item) => <SelectItem key={item.platform} value={item.platform}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={riotId} onChange={(event) => setRiotId(event.target.value)} aria-label="Riot ID" placeholder="GameName#TAG" className="h-12 border-0 bg-transparent pl-10 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0" />
        </div>
        <Button type="submit" size="lg" className="h-12 rounded-xl px-4 font-bold md:px-6"><span className="hidden sm:inline">Find player</span><ArrowRight className="size-4" /></Button>
      </div>
      {error && <p role="alert" className="absolute left-2 top-[calc(100%+.5rem)] text-sm font-medium text-rose-400">{error}</p>}
    </form>
  );
}
