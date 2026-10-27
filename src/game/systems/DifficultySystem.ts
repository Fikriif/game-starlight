import { MeteorType } from "../types/game";
import { DIFFICULTY_CONFIG, WAVE_TITLES } from "../config/constants";

export interface MeteorSpawnWeight {
  type: MeteorType;
  weight: number;
}

export class DifficultySystem {
  public survivalTime: number = 0;
  public wave: number = 1;

  public reset() {
    this.survivalTime = 0;
    this.wave = 1;
  }

  public update(dt: number): boolean {
    this.survivalTime += dt;
    const newWave = Math.floor(this.survivalTime / DIFFICULTY_CONFIG.WAVE_DURATION_SECONDS) + 1;
    if (newWave !== this.wave) {
      this.wave = newWave;
      return true; // wave changed
    }
    return false;
  }

  public getWaveTitle(wave: number = this.wave): string {
    return WAVE_TITLES[wave] || "Endless Survival";
  }

  /**
   * Bounded spawn interval scaling:
   * Wave 1: 1.55s (moderate learning rate)
   * Wave 2: 1.28s (+17% frequency)
   * Wave 3: 1.05s (+18% frequency)
   * Wave 4: 0.82s (+22% frequency, storm pressure)
   * Wave 5+: 0.65s down to safe minimum floor 0.45s
   */
  public getSpawnInterval(): number {
    const intervals: Record<number, number> = {
      1: 1.55,
      2: 1.28,
      3: 1.05,
      4: 0.82,
      5: 0.65,
    };

    if (intervals[this.wave]) {
      return intervals[this.wave];
    }

    const decay = (this.wave - 5) * 0.05;
    return Math.max(DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL, 0.65 - decay);
  }

  /**
   * Safe maximum concurrent meteor count:
   * Scales from 8 up to max 24 to keep the screen readable and maintain 60 FPS
   */
  public getMaxMeteors(): number {
    return Math.min(24, 8 + (this.wave - 1) * 3);
  }

  /**
   * Bounded meteor speed scaling:
   * 1.0x in Wave 1, ramping gently by +6% per wave up to a strictly bounded maximum of 1.30x
   */
  public getMeteorSpeedMultiplier(wave: number = this.wave): number {
    return 1.0 + Math.min(0.30, (wave - 1) * 0.06);
  }

  public getWaveSpeedMultiplier(wave: number = this.wave): number {
    return this.getMeteorSpeedMultiplier(wave);
  }

  /**
   * Returns spawn weights matching the wave progression:
   * Wave 1 (0–30s): Survival Training (mostly standard, occasional speed & drifting)
   * Wave 2 (30–60s): Increasing Pressure (more speed, drifting, and heavy debut)
   * Wave 3 (60–90s): Dangerous Skies (heavy & splitting clusters introduced)
   * Wave 4 (90–120s): Meteor Storm (explosive hazards debut, mixed fast + durable targets)
   * Wave 5+ (120s+): Endless Survival (full hazard spectrum with controlled pressure)
   */
  public getSpawnWeights(wave: number = this.wave): MeteorSpawnWeight[] {
    if (wave === 1) {
      return [
        { type: "standard", weight: 70 },
        { type: "speed", weight: 20 },
        { type: "drifting", weight: 10 },
      ];
    }

    if (wave === 2) {
      return [
        { type: "standard", weight: 45 },
        { type: "speed", weight: 25 },
        { type: "heavy", weight: 15 },
        { type: "drifting", weight: 15 },
      ];
    }

    if (wave === 3) {
      return [
        { type: "standard", weight: 30 },
        { type: "speed", weight: 22 },
        { type: "heavy", weight: 20 },
        { type: "splitting", weight: 16 },
        { type: "drifting", weight: 12 },
      ];
    }

    if (wave === 4) {
      return [
        { type: "standard", weight: 22 },
        { type: "speed", weight: 22 },
        { type: "heavy", weight: 20 },
        { type: "splitting", weight: 16 },
        { type: "explosive", weight: 10 },
        { type: "drifting", weight: 10 },
      ];
    }

    // Wave 5+: Endless Survival
    return [
      { type: "standard", weight: 18 },
      { type: "speed", weight: 24 },
      { type: "heavy", weight: 22 },
      { type: "splitting", weight: 16 },
      { type: "explosive", weight: 10 },
      { type: "drifting", weight: 10 },
    ];
  }

  /**
   * Uses weighted random selection to choose the next meteor type
   */
  public getRandomMeteorType(customWeights?: MeteorSpawnWeight[]): MeteorType {
    const weights = customWeights || this.getSpawnWeights(this.wave);
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

    let roll = Math.random() * totalWeight;
    for (const item of weights) {
      if (roll < item.weight) {
        return item.type;
      }
      roll -= item.weight;
    }

    return weights[0]?.type || "standard";
  }
}
