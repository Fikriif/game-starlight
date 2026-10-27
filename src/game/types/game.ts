export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export type MeteorType =
  | "standard"
  | "speed"
  | "heavy"
  | "splitting"
  | "splitting_fragment"
  | "explosive"
  | "drifting"
  | "small"
  | "medium"
  | "large"
  | "pulsar";

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
  angle: number; // Current visual and firing rotation angle in radians
  lives: number;
  maxLives: number;
  invulnerableTime: number; // in seconds
  shieldActive: boolean;
  shieldTime: number;
  muzzleFlashTimer: number; // Muzzle flash animation timer
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
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
  hitFlashTimer?: number; // Timer for damage hit flash

  // Special ability and variant states
  baseSpeed?: number;
  baseVx?: number;
  baseVy?: number;
  hasAwardedScore?: boolean;

  // Speed Meteor properties
  burstCooldownTimer?: number;
  burstChargeTimer?: number;
  burstActiveTimer?: number;
  isChargingBurst?: boolean;
  isBursting?: boolean;

  // Explosive Meteor properties
  fuseTimer?: number;
  maxFuse?: number;
  explosionRadius?: number;
  hasExploded?: boolean;
  warningPulsePhase?: number;

  // Splitting Meteor properties
  canSplit?: boolean;
  hasSplit?: boolean;
  generation?: number;

  // Drifting Meteor properties
  driftPhase?: number;
  driftFrequency?: number;
  driftAmplitude?: number;

  // Trail particle timer
  trailTimer?: number;
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
  maxCombo: number;
}

export interface ComboState {
  count: number;
  multiplier: number;
  timeRemaining: number;
  maxDuration: number;
  tierLabel: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  touchVector: Vector2D | null; // Movement stick
  touchAimVector: Vector2D | null; // Aim & fire stick for mobile
  mousePos: Vector2D | null; // Cursor coordinates in canvas world space
  isFiring: boolean; // Mouse button held down or space pressed or touch aim active
  spacePressed: boolean;
}

export interface MeteorAlertInfo {
  type: MeteorType;
  label: string;
  description: string;
  color: string;
}

export interface EngineCallbacks {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onWaveChange?: (wave: number) => void;
  onWaveTransition?: (wave: number, title: string) => void;
  onComboChange?: (comboState: ComboState) => void;
  onGameOver?: (stats: GameStats) => void;
  onPowerUpCollected?: (powerUp: PowerUpConfig) => void;
  onPowerUpExpired?: (type: PowerUpType) => void;
  onStatusChange?: (status: GameStatus) => void;
  onMeteorAlert?: (alert: MeteorAlertInfo) => void;
}
