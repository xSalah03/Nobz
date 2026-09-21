export type RiotAccount = { puuid: string; gameName: string; tagLine: string };
export type Summoner = { id: string; accountId: string; puuid: string; profileIconId: number; revisionDate: number; summonerLevel: number };
export type LeagueEntry = { leagueId: string; queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number };
export type Mastery = { championId: number; championLevel: number; championPoints: number; lastPlayTime: number };
export type Participant = { puuid: string; championName: string; championId: number; win: boolean; kills: number; deaths: number; assists: number; totalMinionsKilled: number; neutralMinionsKilled: number; visionScore: number; totalDamageDealtToChampions: number; item0: number; item1: number; item2: number; item3: number; item4: number; item5: number; item6: number; summoner1Id: number; summoner2Id: number; riotIdGameName?: string; riotIdTagline?: string };
export type RiotMatch = { metadata: { matchId: string; participants: string[] }; info: { gameCreation: number; gameDuration: number; gameMode: string; queueId: number; participants: Participant[] } };
export type PlayerBundle = {
  account: RiotAccount;
  summoner: Summoner;
  leagues: LeagueEntry[];
  masteries: Mastery[];
  matches: RiotMatch[];
  matchHistory: {
    requested: number;
    loaded: number;
    failed: number;
  };
  dataDragonVersion: string;
};
