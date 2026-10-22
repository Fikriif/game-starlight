import { DIFFICULTY_CONFIG } from "../config/constants";

export class ScoreSystem {
  public score: number = 0;
  public multiplier: number = 1;
  public multiplierTimeRemaining: number = 0;
  public meteorsDestroyed: number = 0;
  public powerUpsCollected: number = 0;
  public shotsFired: number = 0;
  public shotsHit: number = 0;

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
  }

  public update(dt: number): number {
    let gainedScore = 0;

    // Multiplier timer
    if (this.multiplierTimeRemaining > 0) {
      this.multiplierTimeRemaining -= dt;
      if (this.multiplierTimeRemaining <= 0) {
        this.multiplier = 1;
        this.multiplierTimeRemaining = 0;
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

  public addMeteorScore(basePoints: number): number {
    this.meteorsDestroyed++;
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
