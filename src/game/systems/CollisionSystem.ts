import {
  MeteorEntity,
  PlayerState,
  PowerUpEntity,
  ProjectileEntity,
} from "../types/game";

export interface CollisionResult {
  projectileId: number;
  meteorId: number;
  damage: number;
  hitX: number;
  hitY: number;
}

/**
 * Circle-circle collision test helper
 */
export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distSq = dx * dx + dy * dy;
  const radSum = r1 + r2;
  return distSq <= radSum * radSum;
}

/**
 * Checks all active projectiles against all active meteors
 */
export function checkProjectileMeteorCollisions(
  projectiles: ProjectileEntity[],
  meteors: MeteorEntity[]
): CollisionResult[] {
  const results: CollisionResult[] = [];
  const hitProjectiles = new Set<number>();

  for (const p of projectiles) {
    if (hitProjectiles.has(p.id)) continue;

    for (const m of meteors) {
      if (checkCircleCollision(p.x, p.y, p.radius, m.x, m.y, m.radius)) {
        hitProjectiles.add(p.id);
        results.push({
          projectileId: p.id,
          meteorId: m.id,
          damage: p.damage,
          hitX: (p.x + m.x) / 2,
          hitY: (p.y + m.y) / 2,
        });
        break; // A projectile hits only one meteor
      }
    }
  }

  return results;
}

/**
 * Checks if the player collided with any active meteor
 */
export function checkPlayerMeteorCollisions(
  player: PlayerState,
  meteors: MeteorEntity[]
): MeteorEntity | null {
  // If player is currently invulnerable, don't trigger damage collision
  if (player.invulnerableTime > 0) return null;

  for (const m of meteors) {
    if (checkCircleCollision(player.x, player.y, player.radius * 0.8, m.x, m.y, m.radius * 0.9)) {
      return m;
    }
  }

  return null;
}

/**
 * Checks if the player collected any power-up
 */
export function checkPlayerPowerUpCollisions(
  player: PlayerState,
  powerUps: PowerUpEntity[]
): PowerUpEntity | null {
  for (const p of powerUps) {
    if (checkCircleCollision(player.x, player.y, player.radius, p.x, p.y, p.radius + 10)) {
      return p;
    }
  }

  return null;
}
