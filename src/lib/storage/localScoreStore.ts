import { LeaderboardEntry } from "../supabase/types";

export interface StoredGameRun {
  id: string;
  displayName: string;
  score: number;
  survivalSeconds: number;
  meteorsDestroyed: number;
  highestWave: number;
  verificationStatus: "verified" | "flagged" | "local";
  createdAt: string;
  isGuest: boolean;
}

// In-memory fallback seeded with initial high score pilots
const INITIAL_PILOTS: StoredGameRun[] = [
  {
    id: "seed-1",
    displayName: "Nova-Valkyrie",
    score: 4850,
    survivalSeconds: 245,
    meteorsDestroyed: 94,
    highestWave: 10,
    verificationStatus: "verified",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isGuest: false,
  },
  {
    id: "seed-2",
    displayName: "CosmicDrifter",
    score: 3620,
    survivalSeconds: 198,
    meteorsDestroyed: 78,
    highestWave: 8,
    verificationStatus: "verified",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isGuest: false,
  },
  {
    id: "seed-3",
    displayName: "AstroApex",
    score: 2940,
    survivalSeconds: 162,
    meteorsDestroyed: 61,
    highestWave: 7,
    verificationStatus: "verified",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    isGuest: false,
  },
  {
    id: "seed-4",
    displayName: "Starlight-Ace",
    score: 2150,
    survivalSeconds: 130,
    meteorsDestroyed: 48,
    highestWave: 5,
    verificationStatus: "verified",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isGuest: false,
  },
  {
    id: "seed-5",
    displayName: "VoidRider",
    score: 1680,
    survivalSeconds: 110,
    meteorsDestroyed: 37,
    highestWave: 4,
    verificationStatus: "verified",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isGuest: false,
  },
];

let inMemoryRuns: StoredGameRun[] = [...INITIAL_PILOTS];

export function addLocalRun(run: StoredGameRun): StoredGameRun {
  inMemoryRuns.unshift(run);
  return run;
}

export function getLocalLeaderboard(
  timeframe: "all-time" | "weekly" | "today" = "all-time",
  limit: number = 25
): LeaderboardEntry[] {
  let filtered = [...inMemoryRuns];
  const now = Date.now();

  if (timeframe === "today") {
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= oneDayAgo);
  } else if (timeframe === "weekly") {
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= sevenDaysAgo);
  }

  // Sort ranking rules:
  // 1. score DESC
  // 2. survivalSeconds DESC
  // 3. createdAt ASC
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.survivalSeconds !== a.survivalSeconds) return b.survivalSeconds - a.survivalSeconds;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return filtered.slice(0, limit).map((r, index) => ({
    rank: index + 1,
    id: r.id,
    display_name: r.displayName,
    score: r.score,
    survival_seconds: r.survivalSeconds,
    meteors_destroyed: r.meteorsDestroyed,
    highest_wave: r.highestWave,
    created_at: r.createdAt,
    is_guest: r.isGuest,
  }));
}
