import { useSyncExternalStore } from "react";

export interface LocalPlayerProfile {
  guestId: string;
  displayName: string;
  personalBestScore: number;
  bestSurvivalSeconds: number;
  totalGamesPlayed: number;
  totalMeteorsDestroyed: number;
  recentRuns: {
    runId: string;
    score: number;
    survivalSeconds: number;
    wave: number;
    meteorsDestroyed: number;
    date: string;
  }[];
}

const STORAGE_KEY = "starfall_player_profile";

const SERVER_FALLBACK_PROFILE: LocalPlayerProfile = {
  guestId: "guest_server",
  displayName: "Pilot",
  personalBestScore: 0,
  bestSurvivalSeconds: 0,
  totalGamesPlayed: 0,
  totalMeteorsDestroyed: 0,
  recentRuns: [],
};

let cachedProfile: LocalPlayerProfile | null = null;
const listeners = new Set<() => void>();

function notifyProfileListeners() {
  cachedProfile = null;
  listeners.forEach((l) => l());
}

function subscribeProfile(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      notifyProfileListeners();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getPlayerProfile(): LocalPlayerProfile {
  if (typeof window === "undefined") {
    return SERVER_FALLBACK_PROFILE;
  }

  if (cachedProfile) {
    return cachedProfile;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedProfile = JSON.parse(raw);
      return cachedProfile!;
    }
  } catch (e) {
    console.warn("Error reading player profile:", e);
  }

  // Create new default guest profile
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const defaultProfile: LocalPlayerProfile = {
    guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    displayName: `Star-Pilot-${randomSuffix}`,
    personalBestScore: 0,
    bestSurvivalSeconds: 0,
    totalGamesPlayed: 0,
    totalMeteorsDestroyed: 0,
    recentRuns: [],
  };

  savePlayerProfile(defaultProfile);
  cachedProfile = defaultProfile;
  return defaultProfile;
}

export function savePlayerProfile(profile: LocalPlayerProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    cachedProfile = profile;
    notifyProfileListeners();
  } catch (e) {
    console.warn("Error saving player profile:", e);
  }
}

export function usePlayerProfile(): LocalPlayerProfile {
  return useSyncExternalStore(
    subscribeProfile,
    getPlayerProfile,
    () => SERVER_FALLBACK_PROFILE
  );
}

export function updateProfileAfterRun(
  runId: string,
  score: number,
  survivalSeconds: number,
  wave: number,
  meteorsDestroyed: number
): { profile: LocalPlayerProfile; isNewRecord: boolean } {
  const profile = getPlayerProfile();
  const isNewRecord = score > profile.personalBestScore;

  if (isNewRecord) {
    profile.personalBestScore = score;
  }

  if (survivalSeconds > profile.bestSurvivalSeconds) {
    profile.bestSurvivalSeconds = survivalSeconds;
  }

  profile.totalGamesPlayed += 1;
  profile.totalMeteorsDestroyed += meteorsDestroyed;

  profile.recentRuns.unshift({
    runId,
    score,
    survivalSeconds,
    wave,
    meteorsDestroyed,
    date: new Date().toISOString(),
  });

  // Keep last 15 runs
  if (profile.recentRuns.length > 15) {
    profile.recentRuns = profile.recentRuns.slice(0, 15);
  }

  savePlayerProfile(profile);
  return { profile, isNewRecord };
}
