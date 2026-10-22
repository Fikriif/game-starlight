import { MeteorEntity, PlayerState } from "../types/game";
import { METEOR_CONFIGS } from "../config/constants";
import { createMeteor } from "../entities/Meteor";
import { DifficultySystem } from "./DifficultySystem";

export class SpawnSystem {
  private timer: number = 0;

  public reset() {
    this.timer = 0;
  }

  public update(
    dt: number,
    arenaWidth: number,
    arenaHeight: number,
    player: PlayerState,
    currentCount: number,
    difficulty: DifficultySystem
  ): MeteorEntity | null {
    if (currentCount >= difficulty.getMaxMeteors()) {
      return null;
    }

    this.timer += dt;
    const interval = difficulty.getSpawnInterval();

    if (this.timer >= interval) {
      this.timer = 0;
      return this.spawnMeteor(arenaWidth, arenaHeight, player, difficulty);
    }

    return null;
  }

  private spawnMeteor(
    width: number,
    height: number,
    player: PlayerState,
    difficulty: DifficultySystem
  ): MeteorEntity {
    const type = difficulty.getRandomMeteorType();
    const config = METEOR_CONFIGS[type];
    const r = config.radius;

    // Pick an edge: 0 = top, 1 = right, 2 = bottom, 3 = left
    let edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    // Retry if too close to player (at least 200px safety buffer)
    for (let attempts = 0; attempts < 6; attempts++) {
      if (edge === 0) {
        // Top
        x = Math.random() * width;
        y = -r - 5;
      } else if (edge === 1) {
        // Right
        x = width + r + 5;
        y = Math.random() * height;
      } else if (edge === 2) {
        // Bottom
        x = Math.random() * width;
        y = height + r + 5;
      } else {
        // Left
        x = -r - 5;
        y = Math.random() * height;
      }

      const distToPlayer = Math.hypot(x - player.x, y - player.y);
      if (distToPlayer > 180) {
        break;
      }
      edge = (edge + 1) % 4;
    }

    // Target a spot roughly near the player or across the center
    const targetX = player.x + (Math.random() - 0.5) * 200;
    const targetY = player.y + (Math.random() - 0.5) * 200;

    return createMeteor(type, x, y, targetX, targetY);
  }
}
