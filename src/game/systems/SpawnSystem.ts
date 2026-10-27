import { MeteorEntity, PlayerState } from "../types/game";
import { METEOR_CONFIGS } from "../config/constants";
import { createMeteor } from "../entities/Meteor";
import { DifficultySystem } from "./DifficultySystem";

export class SpawnSystem {
  private timer: number = 0;
  private pincerTimer: number = 0;

  public reset() {
    this.timer = 0;
    this.pincerTimer = 0;
  }

  public update(
    dt: number,
    arenaWidth: number,
    arenaHeight: number,
    player: PlayerState,
    currentCount: number,
    difficulty: DifficultySystem
  ): MeteorEntity[] {
    const spawned: MeteorEntity[] = [];
    const maxAllowed = difficulty.getMaxMeteors();

    if (currentCount >= maxAllowed) {
      return spawned;
    }

    this.timer += dt;
    this.pincerTimer += dt;
    const interval = difficulty.getSpawnInterval();

    // Occasional Coordinated Pincer Spawn in Wave 3+
    // Spawns 2 meteors from opposite arena edges converging across the field
    if (
      difficulty.wave >= 3 &&
      this.pincerTimer >= 11.0 &&
      currentCount + 2 <= maxAllowed
    ) {
      this.pincerTimer = 0;
      const horizontal = Math.random() > 0.5;
      const edgeA = horizontal ? 3 : 0; // Left or Top
      const edgeB = horizontal ? 1 : 2; // Right or Bottom

      const targetX = arenaWidth * 0.5 + (Math.random() - 0.5) * 160;
      const targetY = arenaHeight * 0.5 + (Math.random() - 0.5) * 160;

      const mA = this.spawnMeteor(arenaWidth, arenaHeight, player, difficulty, edgeA, { x: targetX, y: targetY });
      const mB = this.spawnMeteor(arenaWidth, arenaHeight, player, difficulty, edgeB, { x: targetX, y: targetY });
      spawned.push(mA, mB);
      this.timer = 0;
      return spawned;
    }

    if (this.timer >= interval) {
      this.timer = 0;
      const m = this.spawnMeteor(arenaWidth, arenaHeight, player, difficulty);
      spawned.push(m);
    }

    return spawned;
  }

  public spawnMeteor(
    width: number,
    height: number,
    player: PlayerState,
    difficulty: DifficultySystem,
    forcedEdge?: number,
    forcedTarget?: { x: number; y: number }
  ): MeteorEntity {
    const type = difficulty.getRandomMeteorType();
    const config = METEOR_CONFIGS[type] || METEOR_CONFIGS.standard;
    const r = config.radius;

    // Minimum safe distance from the player (greater for explosive meteors to guarantee fairness)
    const minSafeDist = type === "explosive" ? 220 : 180;

    // Pick an edge: 0 = top, 1 = right, 2 = bottom, 3 = left
    let edge = forcedEdge !== undefined ? forcedEdge : Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    // Retry if too close to player
    for (let attempts = 0; attempts < 8; attempts++) {
      if (edge === 0) {
        // Top
        x = Math.random() * width;
        y = -r - 12;
      } else if (edge === 1) {
        // Right
        x = width + r + 12;
        y = Math.random() * height;
      } else if (edge === 2) {
        // Bottom
        x = Math.random() * width;
        y = height + r + 12;
      } else {
        // Left
        x = -r - 12;
        y = Math.random() * height;
      }

      const distToPlayer = Math.hypot(x - player.x, y - player.y);
      if (distToPlayer >= minSafeDist || forcedEdge !== undefined) {
        break;
      }
      edge = (edge + 1) % 4;
    }

    // Target a spot near the player or forced coordinate with natural aiming lead
    const targetX = forcedTarget ? forcedTarget.x : player.x + (Math.random() - 0.5) * 220;
    const targetY = forcedTarget ? forcedTarget.y : player.y + (Math.random() - 0.5) * 220;

    const meteor = createMeteor(type, x, y, targetX, targetY);

    // Apply wave speed scaling
    const speedMult = difficulty.getMeteorSpeedMultiplier();
    if (speedMult !== 1.0) {
      meteor.vx *= speedMult;
      meteor.vy *= speedMult;
      if (meteor.baseVx !== undefined) meteor.baseVx *= speedMult;
      if (meteor.baseVy !== undefined) meteor.baseVy *= speedMult;
    }

    return meteor;
  }
}
