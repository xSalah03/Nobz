import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Crosshair,
  Eye,
  Swords,
  Trophy,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { RiotSearch } from "@/components/riot-search";
import { Badge } from "@/components/ui/badge";
import { getPlayerBundle, RiotApiError } from "@/lib/riot/client";
import { getRegion } from "@/lib/riot/routing";
import type { LeagueEntry, PlayerBundle, RiotMatch } from "@/types/riot";

type PlayerPageResult =
  | { ok: true; data: PlayerBundle }
  | { ok: false; error: RiotApiError };

function queueLabel(queueId: number) {
  return (
    {
      420: "Ranked Solo",
      440: "Ranked Flex",
      450: "ARAM",
      400: "Normal Draft",
      490: "Quickplay",
    } as Record<number, string>
  )[queueId] ?? "League";
}

function relativeTime(timestamp: number) {
  const hours = Math.max(
    1,
    Math.floor((Date.now() - timestamp) / 3_600_000),
  );
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function loadPlayerPageData(
  region: string,
  riotId: string,
): Promise<PlayerPageResult> {
  try {
    return { ok: true, data: await getPlayerBundle(region, riotId) };
  } catch (error) {
    if (error instanceof RiotApiError) return { ok: false, error };
    return {
      ok: false,
      error: new RiotApiError(
        "Nobz could not load this player. Try again.",
        500,
        "NETWORK_ERROR",
      ),
    };
  }
}

function RankCard({
  entry,
  title,
}: {
  entry?: LeagueEntry;
  title: string;
}) {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-white/8 bg-card p-5">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <p className="mt-5 text-xl font-bold">Unranked</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No current placement
        </p>
      </div>
    );
  }

  const games = entry.wins + entry.losses;
  return (
    <div className="rounded-2xl border border-white/8 bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <Trophy className="size-4 text-primary" />
      </div>
      <p className="mt-5 text-2xl font-black capitalize">
        {entry.tier.toLowerCase()} {entry.rank}
      </p>
      <p className="mt-1 font-mono text-sm text-primary">
        {entry.leaguePoints} LP
      </p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {entry.wins}W · {entry.losses}L
        </span>
        <span className="font-bold">
          {games > 0 ? Math.round((entry.wins / games) * 100) : 0}% WR
        </span>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  puuid,
  version,
}: {
  match: RiotMatch;
  puuid: string;
  version: string;
}) {
  const player = match.info.participants.find(
    (participant) => participant.puuid === puuid,
  );
  if (!player) return null;

  const cs = player.totalMinionsKilled + player.neutralMinionsKilled;
  const minutes = Math.max(1, match.info.gameDuration / 60);
  const kda = (player.kills + player.assists) / Math.max(1, player.deaths);
  const items = [
    player.item0,
    player.item1,
    player.item2,
    player.item3,
    player.item4,
    player.item5,
  ].filter(Boolean);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-card transition-transform hover:-translate-y-0.5 ${
        player.win ? "border-emerald-400/20" : "border-rose-400/20"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          player.win ? "bg-emerald-400" : "bg-rose-400"
        }`}
      />
      <div className="grid items-center gap-5 p-4 pl-5 sm:grid-cols-[minmax(190px,1.2fr)_1fr_auto]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${player.championName}.png`}
              alt={`${player.championName} icon`}
              width={56}
              height={56}
              className="size-14 rounded-2xl object-cover"
            />
            <span
              className={`absolute -bottom-1 -right-1 rounded-md px-1.5 py-0.5 text-[10px] font-black text-black ${
                player.win ? "bg-emerald-400" : "bg-rose-400"
              }`}
            >
              {player.win ? "W" : "L"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{player.championName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {queueLabel(match.info.queueId)} ·{" "}
              {relativeTime(match.info.gameCreation)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-lg font-black">
            <span className="text-foreground">{player.kills}</span>
            <span className="text-muted-foreground">
              {" "}
              / {player.deaths} /{" "}
            </span>
            <span className="text-foreground">{player.assists}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {kda.toFixed(2)} KDA · {cs} CS · {(cs / minutes).toFixed(1)}/min
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:justify-end">
          {items.map((item, index) => (
            <Image
              key={`${item}-${index}`}
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item}.png`}
              alt={`Item ${item}`}
              width={32}
              height={32}
              className="size-8 rounded-md bg-white/5"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/6 px-5 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          {Math.floor(minutes)} min
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" />
          {player.visionScore} vision
        </span>
        <span className="flex items-center gap-1.5">
          <Crosshair className="size-3.5" />
          {Math.round(player.totalDamageDealtToChampions / 1000)}k damage
        </span>
      </div>
    </article>
  );
}

function PlayerError({ error }: { error: RiotApiError }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-card p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-400/10">
          <AlertTriangle className="size-6 text-amber-300" />
        </div>
        <h1 className="mt-5 text-2xl font-black">Player lookup unavailable</h1>
        <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
          {error.message}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to search
        </Link>
      </div>
    </main>
  );
}

function PlayerProfile({
  data,
  region,
}: {
  data: PlayerBundle;
  region: string;
}) {
  const solo = data.leagues.find(
    (entry) => entry.queueType === "RANKED_SOLO_5x5",
  );
  const flex = data.leagues.find(
    (entry) => entry.queueType === "RANKED_FLEX_SR",
  );
  const displayRegion = getRegion(region)?.label ?? region.toUpperCase();

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="border-b border-white/7 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <BrandMark />
          <RiotSearch compact />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          New search
        </Link>
        <section className="flex flex-col gap-6 border-b border-white/8 pb-8 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${data.dataDragonVersion}/img/profileicon/${data.summoner.profileIconId}.png`}
              alt={`${data.account.gameName} profile icon`}
              width={96}
              height={96}
              priority
              className="size-24 rounded-[1.75rem] border border-primary/30 object-cover"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#111916] px-2.5 py-1 text-xs font-bold">
              {data.summoner.summonerLevel}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-[-.04em]">
                {data.account.gameName}
                <span className="text-muted-foreground">
                  #{data.account.tagLine}
                </span>
              </h1>
              <Badge
                variant="outline"
                className="border-primary/25 text-primary"
              >
                {displayRegion}
              </Badge>
            </div>
            <p className="mt-3 text-muted-foreground">
              Latest ranked profile and {data.matchHistory.loaded} recent
              matches
            </p>
          </div>
        </section>
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <RankCard entry={solo} title="Ranked Solo / Duo" />
            <RankCard entry={flex} title="Ranked Flex" />
            <div className="rounded-2xl border border-white/8 bg-card p-5">
              <p className="flex items-center gap-2 font-bold">
                <Swords className="size-4 text-primary" />
                Champion mastery
              </p>
              <div className="mt-4 space-y-3">
                {data.masteries.map((item) => (
                  <div
                    key={item.championId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      Champion #{item.championId}
                    </span>
                    <span className="font-mono font-bold">
                      {Math.round(item.championPoints / 1000)}k pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.16em] text-primary">
                  Match history
                </p>
                <h2 className="mt-1 text-2xl font-black">Recent games</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.matchHistory.loaded} matches
              </span>
            </div>
            {data.matchHistory.failed > 0 && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/8 px-4 py-3 text-sm text-amber-100"
              >
                {data.matchHistory.failed} recent{" "}
                {data.matchHistory.failed === 1 ? "match" : "matches"} could
                not be loaded. The available matches are shown below.
              </div>
            )}
            {data.matches.length > 0 ? (
              <div className="space-y-3">
                {data.matches.map((match) => (
                  <MatchCard
                    key={match.metadata.matchId}
                    match={match}
                    puuid={data.account.puuid}
                    version={data.dataDragonVersion}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/8 bg-card p-8 text-center text-muted-foreground">
                No recent matches could be loaded.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default async function SummonerPage({
  params,
}: {
  params: Promise<{ region: string; riotId: string }>;
}) {
  const { region, riotId } = await params;
  const result = await loadPlayerPageData(region, riotId);

  if (!result.ok) return <PlayerError error={result.error} />;
  return <PlayerProfile data={result.data} region={region} />;
}
