import { MeteorType } from "../types/game";
import { DIFFICULTY_CONFIG } from "../config/constants";

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

  public getSpawnInterval(): number {
    const decay = (this.wave - 1) * DIFFICULTY_CONFIG.SPAWN_DECAY_PER_WAVE;
    return Math.max(
      DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL,
      DIFFICULTY_CONFIG.INITIAL_SPAWN_INTERVAL - decay
    );
  }

  public getMaxMeteors(): number {
    // 7 base + 3 per wave, capped at 25
    return Math.min(25, 7 + (this.wave - 1) * 3);
  }

  public getRandomMeteorType(): MeteorType {
    const roll = Math.random();

    if (this.wave === 1) {
      return roll < 0.8 ? "small" : "medium";
    }

    if (this.wave === 2) {
      if (roll < 0.6) return "small";
      if (roll < 0.88) return "medium";
      return "pulsar";
    }

    if (this.wave === 3) {
      if (roll < 0.45) return "small";
      if (roll < 0.75) return "medium";
      if (roll < 0.9) return "large";
      return "pulsar";
    }

    // Wave 4+
    if (roll < 0.3) return "small";
    if (roll < 0.62) return "medium";
    if (roll < 0.82) return "large";
    return "pulsar";
  }
}
