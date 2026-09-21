import type {
  LeagueEntry,
  Mastery,
  PlayerBundle,
  RiotAccount,
  RiotMatch,
  Summoner,
} from "@/types/riot";
import { getRegion } from "./routing";

const RIOT_REQUEST_TIMEOUT_MS = 8_000;
const STATIC_DATA_TIMEOUT_MS = 5_000;
const MATCH_REQUEST_CONCURRENCY = 4;
const DEFAULT_DDRAGON_VERSION = "16.17.1";

export type RiotApiErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "PLAYER_NOT_FOUND"
  | "INCORRECT_REGION"
  | "RATE_LIMITED"
  | "RIOT_SERVER_ERROR"
  | "REQUEST_TIMEOUT"
  | "NETWORK_ERROR"
  | "BAD_REQUEST";

export class RiotApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: RiotApiErrorCode,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

type RiotFetchOptions = {
  notFoundCode?: "PLAYER_NOT_FOUND" | "INCORRECT_REGION";
  notFoundMessage?: string;
};

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timeoutId) };
}

async function riotFetch<T>(
  url: string,
  apiKey: string,
  options: RiotFetchOptions = {},
): Promise<T> {
  const timeout = timeoutSignal(RIOT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "X-Riot-Token": apiKey },
      cache: "no-store",
      signal: timeout.signal,
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    if (response.status === 401 || response.status === 403) {
      throw new RiotApiError(
        "The Riot API key is invalid, expired, or does not have access.",
        503,
        "INVALID_API_KEY",
      );
    }

    if (response.status === 404) {
      throw new RiotApiError(
        options.notFoundMessage ?? "The requested Riot resource was not found.",
        404,
        options.notFoundCode ?? "PLAYER_NOT_FOUND",
      );
    }

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const retryAfterSeconds = Number.isFinite(retryAfter)
        ? retryAfter
        : undefined;
      throw new RiotApiError(
        retryAfterSeconds
          ? `Riot's rate limit was reached. Try again in about ${retryAfterSeconds} seconds.`
          : "Riot's rate limit was reached. Try again shortly.",
        429,
        "RATE_LIMITED",
        retryAfterSeconds,
      );
    }

    if (response.status >= 500) {
      throw new RiotApiError(
        "Riot's servers are temporarily unavailable. Try again shortly.",
        502,
        "RIOT_SERVER_ERROR",
      );
    }

    throw new RiotApiError(
      "Riot rejected the request. Check the Riot ID and selected region.",
      400,
      "BAD_REQUEST",
    );
  } catch (error) {
    if (error instanceof RiotApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new RiotApiError(
        "Riot took too long to respond. Try again.",
        504,
        "REQUEST_TIMEOUT",
      );
    }
    throw new RiotApiError(
      "Nobz could not reach Riot's servers. Check your connection and try again.",
      502,
      "NETWORK_ERROR",
    );
  } finally {
    timeout.cancel();
  }
}

async function getDataDragonVersion() {
  const timeout = timeoutSignal(STATIC_DATA_TIMEOUT_MS);
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
      { cache: "no-store", signal: timeout.signal },
    );
    if (!response.ok) return DEFAULT_DDRAGON_VERSION;
    const versions = (await response.json()) as string[];
    return versions[0] ?? DEFAULT_DDRAGON_VERSION;
  } catch {
    return DEFAULT_DDRAGON_VERSION;
  } finally {
    timeout.cancel();
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>,
) {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      try {
        results[currentIndex] = {
          status: "fulfilled",
          value: await worker(items[currentIndex]),
        };
      } catch (reason) {
        results[currentIndex] = { status: "rejected", reason };
      }
    }
  }

  const workerCount = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return results;
}

export async function getPlayerBundle(
  platform: string,
  riotId: string,
): Promise<PlayerBundle> {
  const region = getRegion(platform);
  if (!region) {
    throw new RiotApiError(
      "This League region is not supported by Nobz.",
      400,
      "INCORRECT_REGION",
    );
  }

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    throw new RiotApiError(
      "Nobz is not connected to Riot yet because its API key is missing.",
      503,
      "MISSING_API_KEY",
    );
  }

  let decodedRiotId: string;
  try {
    decodedRiotId = decodeURIComponent(riotId).trim();
  } catch {
    throw new RiotApiError(
      "Use a valid Riot ID in the format GameName#TAG.",
      400,
      "BAD_REQUEST",
    );
  }

  const split = decodedRiotId.lastIndexOf("#");
  if (split < 1 || split === decodedRiotId.length - 1) {
    throw new RiotApiError(
      "Use a Riot ID in the format GameName#TAG.",
      400,
      "BAD_REQUEST",
    );
  }

  const gameName = decodedRiotId.slice(0, split);
  const tagLine = decodedRiotId.slice(split + 1);
  const regionalBase = `https://${region.regional}.api.riotgames.com`;
  const platformBase = `https://${region.platform}.api.riotgames.com`;

  const account = await riotFetch<RiotAccount>(
    `${regionalBase}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    apiKey,
    {
      notFoundCode: "PLAYER_NOT_FOUND",
      notFoundMessage: "No Riot account matches that GameName#TAG.",
    },
  );

  const [summoner, leagues, masteries, matchIds, dataDragonVersion] =
    await Promise.all([
      riotFetch<Summoner>(
        `${platformBase}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`,
        apiKey,
        {
          notFoundCode: "INCORRECT_REGION",
          notFoundMessage:
            "This Riot account was found, but it does not belong to the selected League region.",
        },
      ),
      riotFetch<LeagueEntry[]>(
        `${platformBase}/lol/league/v4/entries/by-puuid/${encodeURIComponent(account.puuid)}`,
        apiKey,
      ),
      riotFetch<Mastery[]>(
        `${platformBase}/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(account.puuid)}/top?count=3`,
        apiKey,
      ),
      riotFetch<string[]>(
        `${regionalBase}/lol/match/v5/matches/by-puuid/${encodeURIComponent(account.puuid)}/ids?start=0&count=20`,
        apiKey,
      ),
      getDataDragonVersion(),
    ]);

  const matchResults = await mapWithConcurrency(
    matchIds,
    MATCH_REQUEST_CONCURRENCY,
    (matchId) =>
      riotFetch<RiotMatch>(
        `${regionalBase}/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
        apiKey,
      ),
  );
  const matches = matchResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  return {
    account,
    summoner,
    leagues,
    masteries,
    matches,
    matchHistory: {
      requested: matchIds.length,
      loaded: matches.length,
      failed: matchIds.length - matches.length,
    },
    dataDragonVersion,
  };
}
