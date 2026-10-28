import { PowerUpConfig, PowerUpType } from "../types/game";

export const GAME_CANVAS = {
  BASE_WIDTH: 1000,
  BASE_HEIGHT: 750,
  ASPECT_RATIO: 1000 / 750,
};

export const PLAYER_CONFIG = {
  RADIUS: 20,
  SPEED: 340, // pixels per second
  MAX_LIVES: 3,
  INVULNERABLE_DURATION: 2.2, // seconds after hit
  FIRE_RATE_BASE: 0.20, // seconds per shot (5 shots/sec)
  FIRE_RATE_RAPID: 0.10, // seconds per shot (10 shots/sec)
  PROJECTILE_SPEED: 820,
  PROJECTILE_RADIUS: 4,
  PROJECTILE_DAMAGE: 1,
};

export const METEOR_CONFIGS = {
  standard: {
    type: "standard" as const,
    name: "Standard",
    radius: 22,
    hp: 2,
    speedMin: 110,
    speedMax: 165,
    scoreValue: 20,
    color: "#f97316",
    coreColor: "#7c2d12",
    glowColor: "rgba(249, 115, 22, 0.75)",
  },
  speed: {
    type: "speed" as const,
    name: "Speed",
    radius: 17,
    hp: 1,
    speedMin: 220,
    speedMax: 300,
    scoreValue: 35,
    color: "#06b6d4",
    coreColor: "#083344",
    glowColor: "rgba(6, 182, 212, 0.9)",
    burstInterval: 3.2,
    burstChargeTime: 0.5,
    burstDuration: 0.8,
    burstSpeedMultiplier: 1.65,
  },
  heavy: {
    type: "heavy" as const,
    name: "Heavy",
    radius: 46,
    hp: 6,
    speedMin: 48,
    speedMax: 75,
    scoreValue: 75,
    color: "#a855f7",
    coreColor: "#3b0764",
    glowColor: "rgba(168, 85, 247, 0.8)",
  },
  splitting: {
    type: "splitting" as const,
    name: "Splitting",
    radius: 36,
    hp: 3,
    speedMin: 80,
    speedMax: 125,
    scoreValue: 40,
    color: "#10b981",
    coreColor: "#064e3b",
    glowColor: "rgba(16, 185, 129, 0.8)",
    fragmentsCount: 2,
  },
  splitting_fragment: {
    type: "splitting_fragment" as const,
    name: "Fragment",
    radius: 18,
    hp: 1,
    speedMin: 140,
    speedMax: 200,
    scoreValue: 15,
    color: "#34d399",
    coreColor: "#065f46",
    glowColor: "rgba(52, 211, 153, 0.7)",
  },
  explosive: {
    type: "explosive" as const,
    name: "Explosive",
    radius: 26,
    hp: 2,
    speedMin: 85,
    speedMax: 135,
    scoreValue: 50,
    color: "#ef4444",
    coreColor: "#7f1d1d",
    glowColor: "rgba(239, 68, 68, 0.9)",
    fuseDuration: 6.5,
    explosionRadius: 115,
    explosionDamage: 1,
    chainMeteorDamage: 3,
  },
  drifting: {
    type: "drifting" as const,
    name: "Drifting",
    radius: 24,
    hp: 2,
    speedMin: 100,
    speedMax: 145,
    scoreValue: 35,
    color: "#818cf8",
    coreColor: "#312e81",
    glowColor: "rgba(129, 140, 248, 0.8)",
    driftFrequency: 2.2,
    driftAmplitude: 85,
  },
  // Legacy backward-compatibility entries
  small: {
    type: "small" as const,
    name: "Small",
    radius: 16,
    hp: 1,
    speedMin: 140,
    speedMax: 210,
    scoreValue: 10,
    color: "#60a5fa",
    coreColor: "#1e3a8a",
    glowColor: "rgba(96, 165, 250, 0.7)",
  },
  medium: {
    type: "medium" as const,
    name: "Medium",
    radius: 28,
    hp: 3,
    speedMin: 90,
    speedMax: 140,
    scoreValue: 25,
    color: "#c084fc",
    coreColor: "#581c87",
    glowColor: "rgba(192, 132, 252, 0.6)",
  },
  large: {
    type: "large" as const,
    name: "Large",
    radius: 46,
    hp: 6,
    speedMin: 55,
    speedMax: 90,
    scoreValue: 50,
    color: "#fb7185",
    coreColor: "#881337",
    glowColor: "rgba(251, 113, 133, 0.6)",
  },
  pulsar: {
    type: "pulsar" as const,
    name: "Pulsar",
    radius: 20,
    hp: 2,
    speedMin: 200,
    speedMax: 270,
    scoreValue: 40,
    color: "#38bdf8",
    coreColor: "#0369a1",
    glowColor: "rgba(56, 189, 248, 0.8)",
  },
};

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  rapid_fire: {
    type: "rapid_fire",
    name: "Rapid Fire",
    duration: 10,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.8)",
    description: "Doubles primary blaster firing rate",
    icon: "⚡",
  },
  spread_shot: {
    type: "spread_shot",
    name: "Spread Shot",
    duration: 10,
    color: "#00f0ff",
    glowColor: "rgba(0, 240, 255, 0.8)",
    description: "Tri-beam spread laser volley",
    icon: "🔱",
  },
  energy_shield: {
    type: "energy_shield",
    name: "Energy Shield",
    duration: 12,
    color: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.9)",
    description: "Absorbs incoming impact damage",
    icon: "🛡️",
  },
  repair_core: {
    type: "repair_core",
    name: "Repair Core",
    duration: 0, // instant
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.8)",
    description: "Restores +1 Starship life",
    icon: "❤️",
  },
  score_multiplier: {
    type: "score_multiplier",
    name: "2X Multiplier",
    duration: 12,
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.8)",
    description: "Doubles all points earned",
    icon: "✖️2",
  },
  nova_burst: {
    type: "nova_burst",
    name: "Nova Burst",
    duration: 0, // instant
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.9)",
    description: "Cosmic shockwave destroys nearby meteors",
    icon: "nova",
  },
};

export const POWER_UP_DROP_RATE = 0.22; // 22% starting chance on meteor destruction

export const DIFFICULTY_CONFIG = {
  INITIAL_SPAWN_INTERVAL: 1.55, // seconds between meteor spawns in Wave 1
  MIN_SPAWN_INTERVAL: 0.45,
  SPAWN_DECAY_PER_WAVE: 0.18,
  WAVE_DURATION_SECONDS: 30, // 30 seconds per wave
  PASSIVE_SCORE_INTERVAL: 10, // seconds
  PASSIVE_SCORE_POINTS: 5,
  MAX_METEORS_LIMIT: 24, // maximum concurrent active hazards
};

export const WAVE_TITLES: Record<number, string> = {
  1: "Survival Training",
  2: "Increasing Pressure",
  3: "Dangerous Skies",
  4: "Meteor Storm",
  5: "Endless Survival",
};

export const COMBO_CONFIG = {
  WINDOW_DURATION: 2.8, // seconds before combo streak decays
  TIERS: [
    { minCombo: 10, multiplier: 3.0, label: "ULTRA COMBO" },
    { minCombo: 7, multiplier: 2.5, label: "MEGA COMBO" },
    { minCombo: 4, multiplier: 2.0, label: "SUPER COMBO" },
    { minCombo: 2, multiplier: 1.5, label: "COMBO" },
    { minCombo: 1, multiplier: 1.0, label: "" },
  ],
};
