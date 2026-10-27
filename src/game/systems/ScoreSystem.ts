import { DIFFICULTY_CONFIG, COMBO_CONFIG } from "../config/constants";
import { ComboState } from "../types/game";

export class ScoreSystem {
  public score: number = 0;
  public multiplier: number = 1;
  public multiplierTimeRemaining: number = 0;
  public meteorsDestroyed: number = 0;
  public powerUpsCollected: number = 0;
  public shotsFired: number = 0;
  public shotsHit: number = 0;

  // Combo Streak Mechanics
  public combo: number = 0;
  public comboTimer: number = 0;
  public maxCombo: number = 0;

  private passiveTimer: number = 0;

  public reset() {
    this.score = 0;
    this.multiplier = 1;
    this.multiplierTimeRemaining = 0;
    this.meteorsDestroyed = 0;
    this.powerUpsCollected = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.passiveTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
  }

  public update(dt: number): number {
    let gainedScore = 0;

    // Power-up Multiplier timer
    if (this.multiplierTimeRemaining > 0) {
      this.multiplierTimeRemaining -= dt;
      if (this.multiplierTimeRemaining <= 0) {
        this.multiplier = 1;
        this.multiplierTimeRemaining = 0;
      }
    }

    // Combo Streak timer countdown
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboTimer = 0;
      }
    }

    // Passive survival bonus: 5 pts every 10 seconds
    this.passiveTimer += dt;
    if (this.passiveTimer >= DIFFICULTY_CONFIG.PASSIVE_SCORE_INTERVAL) {
      this.passiveTimer -= DIFFICULTY_CONFIG.PASSIVE_SCORE_INTERVAL;
      const bonus = DIFFICULTY_CONFIG.PASSIVE_SCORE_POINTS * this.multiplier;
      this.score += bonus;
      gainedScore += bonus;
    }

    return gainedScore;
  }

  public get comboMultiplier(): number {
    return this.getComboMultiplier();
  }

  public getComboMultiplier(): number {
    for (const tier of COMBO_CONFIG.TIERS) {
      if (this.combo >= tier.minCombo) {
        return tier.multiplier;
      }
    }
    return 1.0;
  }

  public getComboTierLabel(): string {
    for (const tier of COMBO_CONFIG.TIERS) {
      if (this.combo >= tier.minCombo) {
        return tier.label;
      }
    }
    return "";
  }

  public getComboState(): ComboState {
    return {
      count: this.combo,
      multiplier: this.getComboMultiplier(),
      timeRemaining: Math.max(0, this.comboTimer),
      maxDuration: COMBO_CONFIG.WINDOW_DURATION,
      tierLabel: this.getComboTierLabel(),
    };
  }

  /**
   * Adds score for destroying a meteor entity.
   * If applyCombo is true (active gameplay), advances the combo streak and awards combo & wave multipliers.
   * If applyCombo is false (standard test calls), awards base score multiplied only by active 2X power-up.
   */
  public addMeteorScore(
    basePoints: number,
    currentWave: number = 1,
    applyCombo: boolean = false
  ): number {
    this.meteorsDestroyed++;

    if (applyCombo) {
      this.combo++;
      this.comboTimer = COMBO_CONFIG.WINDOW_DURATION;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }

      const waveBonus = Math.max(0, (currentWave - 1) * 5);
      const comboMult = this.getComboMultiplier();
      const points = Math.round((basePoints + waveBonus) * this.multiplier * comboMult);
      this.score += points;
      return points;
    }

    const points = basePoints * this.multiplier;
    this.score += points;
    return points;
  }

  public addPowerUpScore(bonusPoints: number = 15): number {
    this.powerUpsCollected++;
    const points = bonusPoints * this.multiplier;
    this.score += points;
    return points;
  }

  public setMultiplier(multiplier: number, duration: number) {
    this.multiplier = multiplier;
    this.multiplierTimeRemaining = duration;
  }
}
