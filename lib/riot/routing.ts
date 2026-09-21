export const REGIONS = [
  { platform: "euw1", label: "EUW", regional: "europe" },
  { platform: "eun1", label: "EUNE", regional: "europe" },
  { platform: "na1", label: "NA", regional: "americas" },
  { platform: "kr", label: "KR", regional: "asia" },
  { platform: "br1", label: "BR", regional: "americas" },
  { platform: "jp1", label: "JP", regional: "asia" },
  { platform: "la1", label: "LAN", regional: "americas" },
  { platform: "la2", label: "LAS", regional: "americas" },
  { platform: "oc1", label: "OCE", regional: "sea" },
  { platform: "tr1", label: "TR", regional: "europe" },
  { platform: "ru", label: "RU", regional: "europe" },
] as const;

export function getRegion(platform: string) {
  return REGIONS.find((item) => item.platform === platform.toLowerCase());
}
