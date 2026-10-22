import test from "node:test";
import assert from "node:assert/strict";
import { Player } from "../src/game/entities/Player";
import { createProjectile, updateProjectile } from "../src/game/entities/Projectile";
import { InputState, ProjectileEntity } from "../src/game/types/game";
import { PLAYER_CONFIG } from "../src/game/config/constants";

test("Spaceship aims toward mouse position independently of movement", () => {
  const player = new Player(500, 500);

  // Mouse cursor positioned directly to the right of the ship (dx > 0, dy = 0 -> angle = 0 rad)
  // Ship is moving downwards (down: true -> vy > 0)
  const input: InputState = {
    up: false,
    down: true,
    left: false,
    right: false,
    touchVector: null,
    touchAimVector: null,
    mousePos: { x: 700, y: 500 },
    isFiring: false,
    spacePressed: false,
  };

  // Run update for 20 frames (approx 0.3s)
  for (let i = 0; i < 20; i++) {
    player.update(0.016, input, 1000, 800, false, false, () => {}, () => {});
  }

  // Ship movement must have moved downward (+Y)
  assert.ok(player.state.y > 500, "Ship must move downward based on movement keys");
  
  // Ship angle must aim directly at mouse from ship's new world position
  const expectedAngle = Math.atan2(input.mousePos!.y - player.state.y, input.mousePos!.x - player.state.x);
  assert.ok(
    Math.abs(player.state.angle - expectedAngle) < 0.05,
    `Ship angle (${player.state.angle}) should match vector to mouse (${expectedAngle})`
  );
});

test("Projectiles travel strictly in the direction the ship is facing", () => {
  const player = new Player(400, 300);
  player.state.angle = 0; // Facing directly right (+X axis)

  const spawnedProjectiles: ProjectileEntity[] = [];

  const input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    touchVector: null,
    touchAimVector: null,
    mousePos: { x: 600, y: 300 }, // Aiming right
    isFiring: true, // Firing
    spacePressed: false,
  };

  // Advance time past firing cooldown
  player.update(0.25, input, 1000, 800, false, false, (p) => spawnedProjectiles.push(p), () => {});

  assert.equal(spawnedProjectiles.length, 1, "Should fire 1 projectile");
  const p = spawnedProjectiles[0];

  // Projectile must spawn at the front muzzle
  assert.ok(p.x > player.state.x, "Projectile must spawn forward at ship nose");
  assert.equal(Math.round(p.y), Math.round(player.state.y), "Y should match ship nose");

  // Projectile velocity must be directed along the facing angle (+X)
  assert.ok(p.vx > 0, "Velocity X must be positive");
  assert.equal(Math.round(p.vy), 0, "Velocity Y must be 0 for angle 0");
  assert.equal(p.speed, PLAYER_CONFIG.PROJECTILE_SPEED);
});

test("Projectiles do not change direction or home in on targets after being fired", () => {
  const p = createProjectile(100, 100, Math.PI / 4); // 45 degrees
  const initialVx = p.vx;
  const initialVy = p.vy;

  // Advance projectile simulation over multiple frames
  for (let i = 0; i < 20; i++) {
    updateProjectile(p, 0.016);
  }

  assert.equal(p.vx, initialVx, "Projectile Vx must remain constant");
  assert.equal(p.vy, initialVy, "Projectile Vy must remain constant");
});

test("Spread Shot fires multiple projectiles in an angular fan centered on aim direction", () => {
  const player = new Player(500, 500);
  player.state.angle = -Math.PI / 2; // Facing straight up (-Y axis)

  const spawnedProjectiles: ProjectileEntity[] = [];

  const input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    touchVector: null,
    touchAimVector: null,
    mousePos: { x: 500, y: 200 }, // Aiming straight up
    isFiring: true,
    spacePressed: false,
  };

  // Update with hasSpreadShot = true
  player.update(0.25, input, 1000, 800, false, true, (p) => spawnedProjectiles.push(p), () => {});

  assert.equal(spawnedProjectiles.length, 3, "Spread shot must spawn 3 projectiles");

  // Check center projectile
  const center = spawnedProjectiles[0];
  assert.equal(Math.round(center.vx), 0, "Center projectile Vx must be ~0 when aiming up");
  assert.ok(center.vy < -700, "Center projectile Vy must be negative when aiming up");

  // Left spread projectile
  const left = spawnedProjectiles[1];
  assert.ok(left.vx < 0, "Left spread projectile Vx must diverge left");

  // Right spread projectile
  const right = spawnedProjectiles[2];
  assert.ok(right.vx > 0, "Right spread projectile Vx must diverge right");
});

test("Rapid Fire increases firing frequency without modifying aim angle", () => {
  const playerNormal = new Player(500, 500);
  const playerRapid = new Player(500, 500);
  playerNormal.state.angle = 0; // Pre-aligned to mouse
  playerRapid.state.angle = 0;

  const normalShots: ProjectileEntity[] = [];
  const rapidShots: ProjectileEntity[] = [];

  const input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    touchVector: null,
    touchAimVector: null,
    mousePos: { x: 700, y: 500 },
    isFiring: true,
    spacePressed: false,
  };

  // Simulate 0.35 seconds
  const dt = 0.016;
  const steps = Math.floor(0.35 / dt);

  for (let i = 0; i < steps; i++) {
    playerNormal.update(dt, input, 1000, 800, false, false, (p) => normalShots.push(p), () => {});
    playerRapid.update(dt, input, 1000, 800, true, false, (p) => rapidShots.push(p), () => {});
  }

  assert.ok(
    rapidShots.length > normalShots.length,
    `Rapid fire (${rapidShots.length}) should produce more projectiles than normal fire (${normalShots.length})`
  );
  assert.equal(normalShots[0].vx, rapidShots[0].vx, "Firing direction must be identical");
});
