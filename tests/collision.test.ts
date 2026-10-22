import test from "node:test";
import assert from "node:assert/strict";
import {
  checkCircleCollision,
  checkPlayerMeteorCollisions,
  checkPlayerPowerUpCollisions,
  checkProjectileMeteorCollisions,
} from "../src/game/systems/CollisionSystem";
import { MeteorEntity, PlayerState, PowerUpEntity, ProjectileEntity } from "../src/game/types/game";

test("checkCircleCollision accurately detects overlapping circles", () => {
  // Overlapping
  assert.equal(checkCircleCollision(0, 0, 10, 15, 0, 10), true);
  // Touching exactly
  assert.equal(checkCircleCollision(0, 0, 10, 20, 0, 10), true);
  // Far apart
  assert.equal(checkCircleCollision(0, 0, 10, 50, 0, 10), false);
});

test("checkProjectileMeteorCollisions identifies hits and damages target", () => {
  const projectiles: ProjectileEntity[] = [
    {
      id: 1,
      x: 100,
      y: 100,
      vx: 0,
      vy: -500,
      radius: 4,
      damage: 1,
      color: "#00f0ff",
      glowColor: "#00f0ff",
      life: 1,
    },
    {
      id: 2,
      x: 500,
      y: 500,
      vx: 0,
      vy: -500,
      radius: 4,
      damage: 1,
      color: "#00f0ff",
      glowColor: "#00f0ff",
      life: 1,
    },
  ];

  const meteors: MeteorEntity[] = [
    {
      id: 10,
      type: "small",
      x: 102,
      y: 103,
      vx: 0,
      vy: 100,
      radius: 16,
      hp: 1,
      maxHp: 1,
      scoreValue: 10,
      rotation: 0,
      rotationSpeed: 1,
      vertices: [],
      color: "#60a5fa",
      coreColor: "#1e3a8a",
      glowColor: "#60a5fa",
    },
  ];

  const results = checkProjectileMeteorCollisions(projectiles, meteors);
  assert.equal(results.length, 1);
  assert.equal(results[0].projectileId, 1);
  assert.equal(results[0].meteorId, 10);
  assert.equal(results[0].damage, 1);
});

test("checkPlayerMeteorCollisions ignores collision during invulnerability window", () => {
  const player: PlayerState = {
    x: 200,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 20,
    angle: 0,
    lives: 3,
    maxLives: 3,
    invulnerableTime: 1.5, // Currently invulnerable!
    shieldActive: false,
    shieldTime: 0,
  };

  const meteors: MeteorEntity[] = [
    {
      id: 99,
      type: "medium",
      x: 205,
      y: 205,
      vx: 0,
      vy: 0,
      radius: 28,
      hp: 3,
      maxHp: 3,
      scoreValue: 25,
      rotation: 0,
      rotationSpeed: 0,
      vertices: [],
      color: "#c084fc",
      coreColor: "#581c87",
      glowColor: "#c084fc",
    },
  ];

  const hit = checkPlayerMeteorCollisions(player, meteors);
  assert.equal(hit, null, "Invulnerable player must not collide with meteors");

  // When invulnerability expires
  player.invulnerableTime = 0;
  const hitAfter = checkPlayerMeteorCollisions(player, meteors);
  assert.notEqual(hitAfter, null, "Vulnerable player should register collision");
});

test("checkPlayerPowerUpCollisions detects pickup within radius", () => {
  const player: PlayerState = {
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 20,
    angle: 0,
    lives: 3,
    maxLives: 3,
    invulnerableTime: 0,
    shieldActive: false,
    shieldTime: 0,
  };

  const powerUps: PowerUpEntity[] = [
    {
      id: 7,
      type: "rapid_fire",
      x: 310,
      y: 310,
      vx: 0,
      vy: 0,
      radius: 18,
      duration: 10,
      color: "#f59e0b",
      glowColor: "#f59e0b",
      icon: "⚡",
      age: 1,
      maxLife: 15,
    },
  ];

  const collected = checkPlayerPowerUpCollisions(player, powerUps);
  assert.notEqual(collected, null);
  assert.equal(collected?.id, 7);
});
