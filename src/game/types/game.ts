export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export type MeteorType = "small" | "medium" | "large" | "pulsar";

export type PowerUpType =
  | "rapid_fire"
  | "spread_shot"
  | "energy_shield"
  | "repair_core"
  | "score_multiplier"
  | "nova_burst";

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  duration: number; // in seconds (0 for instant)
  color: string;
  glowColor: string;
  description: string;
  icon: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  lives: number;
  maxLives: number;
  invulnerableTime: number; // in seconds
  shieldActive: boolean;
  shieldTime: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  glowColor: string;
  life: number;
}

export interface MeteorEntity {
  id: number;
  type: MeteorType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  rotation: number;
  rotationSpeed: number;
  vertices: Vector2D[];
  color: string;
  coreColor: string;
  glowColor: string;
  wobblePhase?: number;
}

export interface PowerUpEntity {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  duration: number;
  color: string;
  glowColor: string;
  icon: string;
  age: number;
  maxLife: number;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glow: boolean;
}

export interface FloatingTextEntity {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface ActivePowerUpState {
  type: PowerUpType;
  name: string;
  color: string;
  timeRemaining: number;
  totalDuration: number;
}

export interface GameStats {
  score: number;
  survivalSeconds: number;
  wave: number;
  meteorsDestroyed: number;
  powerUpsCollected: number;
  accuracyShotsFired: number;
  accuracyShotsHit: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  touchVector: Vector2D | null;
  spacePressed: boolean;
}

export interface EngineCallbacks {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onWaveChange?: (wave: number) => void;
  onGameOver?: (stats: GameStats) => void;
  onPowerUpCollected?: (powerUp: PowerUpConfig) => void;
  onPowerUpExpired?: (type: PowerUpType) => void;
  onStatusChange?: (status: GameStatus) => void;
}
