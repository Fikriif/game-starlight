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
  FIRE_RATE_BASE: 0.22, // seconds per shot (approx 4.5 shots/sec)
  FIRE_RATE_RAPID: 0.11, // seconds per shot (approx 9 shots/sec)
  PROJECTILE_SPEED: 720,
  PROJECTILE_RADIUS: 4,
  PROJECTILE_DAMAGE: 1,
  AUTO_TARGET_RANGE: 650,
};

export const METEOR_CONFIGS = {
  small: {
    type: "small" as const,
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
    color: "#ff007f",
    glowColor: "rgba(255, 0, 127, 0.9)",
    description: "Cosmic shockwave destroys nearby meteors",
    icon: "💥",
  },
};

export const POWER_UP_DROP_RATE = 0.22; // 22% chance on meteor destruction

export const DIFFICULTY_CONFIG = {
  INITIAL_SPAWN_INTERVAL: 1.6, // seconds between meteor spawns
  MIN_SPAWN_INTERVAL: 0.45,
  SPAWN_DECAY_PER_WAVE: 0.12,
  WAVE_DURATION_SECONDS: 25,
  PASSIVE_SCORE_INTERVAL: 10, // seconds
  PASSIVE_SCORE_POINTS: 5,
};
