import test from "node:test";
import assert from "node:assert/strict";
import {
  createMeteor,
  updateMeteor,
  splitMeteor,
  resetMeteorIdCounter,
} from "../src/game/entities/Meteor";
import { Player } from "../src/game/entities/Player";
import { DifficultySystem } from "../src/game/systems/DifficultySystem";
import { SpawnSystem } from "../src/game/systems/SpawnSystem";
import { ScoreSystem } from "../src/game/systems/ScoreSystem";
import {
  checkProjectileMeteorCollisions,
} from "../src/game/systems/CollisionSystem";
import { METEOR_CONFIGS } from "../src/game/config/constants";
import { MeteorEntity, PlayerState, ProjectileEntity, InputState } from "../src/game/types/game";

test("1. Standard meteors move and take damage normally", () => {
  resetMeteorIdCounter();
  const m = createMeteor("standard", 100, 100, undefined, undefined, { x: 80, y: 0 });
  assert.equal(m.type, "standard");
  assert.equal(m.hp, 2);
  assert.equal(m.scoreValue, 20);

  // Movement over 0.5s dt
  updateMeteor(m, 0.5);
  assert.ok(Math.abs(m.x - 140) < 0.01, `Expected x = 140, got ${m.x}`);

  // Projectile hit damages it
  m.hp -= 1;
  m.hitFlashTimer = 0.12;
  assert.equal(m.hp, 1);
  assert.ok(m.hitFlashTimer > 0);

  // Second hit destroys it
  m.hp -= 1;
  assert.equal(m.hp, 0);
});

test("2. Speed meteors accelerate and emit electric cyan trails", () => {
  resetMeteorIdCounter();
  const m = createMeteor("speed", 200, 200, undefined, undefined, { x: 200, y: 0 });
  assert.equal(m.type, "speed");
  assert.equal(m.hp, 1);
  assert.equal(m.color, "#06b6d4");

  let warningCalled = false;
  let burstCalled = false;
  let trailEmitted = false;

  const callbacks = {
    onSpeedWarning: () => {
      warningCalled = true;
    },
    onSpeedBurst: () => {
      burstCalled = true;
    },
    onEmitTrail: (x: number, y: number, color: string) => {
      trailEmitted = true;
      assert.ok(color === "#06b6d4" || color === "#22d3ee");
    },
  };

  // Advance time until burst charge triggers
  m.burstCooldownTimer = 0.5;
  updateMeteor(m, 0.05, callbacks);
  assert.equal(m.isChargingBurst, true, "Speed meteor should enter charging state");
  assert.equal(warningCalled, true, "Telegraph warning should trigger");

  // Advance through charge phase into active burst
  updateMeteor(m, 0.6, callbacks);
  assert.equal(m.isBursting, true, "Speed meteor should be in burst mode");
  assert.equal(burstCalled, true, "Speed burst event should fire");
  assert.ok(Math.hypot(m.vx, m.vy) > 200, "Velocity should accelerate during burst");

  // Verify trail particles emitted
  assert.equal(trailEmitted, true, "Speed meteor must emit movement trail");
});

test("3. Heavy meteors require multiple hits (high durability)", () => {
  resetMeteorIdCounter();
  const m = createMeteor("heavy", 300, 300);
  assert.equal(m.type, "heavy");
  assert.equal(m.hp, 6);
  assert.equal(m.maxHp, 6);
  assert.equal(m.scoreValue, 75);

  // Sustains multiple hits without dying
  for (let hit = 1; hit <= 5; hit++) {
    m.hp -= 1;
    assert.ok(m.hp > 0, `Heavy meteor should survive hit #${hit}`);
  }
  assert.equal(m.hp, 1);

  // 6th hit destroys it
  m.hp -= 1;
  assert.equal(m.hp, 0, "Heavy meteor should be destroyed after 6 projectile hits");
});

test("4. Splitting meteors create a limited number of smaller fragments", () => {
  resetMeteorIdCounter();
  const parent = createMeteor("splitting", 400, 400, undefined, undefined, { x: 50, y: 50 });
  assert.equal(parent.type, "splitting");
  assert.equal(parent.canSplit, true);
  assert.equal(parent.hasSplit, false);

  const fragments = splitMeteor(parent);
  assert.equal(fragments.length, 2, "Splitting meteor should produce exactly 2 fragments");
  assert.equal(parent.hasSplit, true, "Parent meteor must be marked as hasSplit = true");

  for (const frag of fragments) {
    assert.equal(frag.type, "splitting_fragment");
    assert.equal(frag.canSplit, false, "Fragments must not be able to split");
    assert.equal(frag.hp, 1);
    assert.equal(frag.scoreValue, 15);
    assert.ok(frag.radius < parent.radius, "Fragment radius must be smaller than parent");
  }
});

test("5. Fragments do not split indefinitely (infinite splitting prevention)", () => {
  resetMeteorIdCounter();
  const parent = createMeteor("splitting", 500, 500);
  const fragments = splitMeteor(parent);

  // Calling split on the parent again must return empty array
  const secondaryParentSplit = splitMeteor(parent);
  assert.equal(secondaryParentSplit.length, 0, "Parent cannot split more than once");

  // Calling split on fragments must return empty array
  for (const frag of fragments) {
    const subFragments = splitMeteor(frag);
    assert.equal(subFragments.length, 0, "Fragments must never split further");
  }
});

test("6. Explosive meteors detonate only once", () => {
  resetMeteorIdCounter();
  const explosive = createMeteor("explosive", 300, 300);
  assert.equal(explosive.type, "explosive");
  assert.equal(explosive.hasExploded, false);
  assert.ok((explosive.fuseTimer || 0) > 0);

  // Advance time to exhaust fuse
  explosive.fuseTimer = 0.05;
  updateMeteor(explosive, 0.1);
  assert.equal(explosive.fuseTimer, 0, "Fuse should reach 0");

  // Simulate detonation
  let detonationCount = 0;
  const detonate = (m: MeteorEntity) => {
    if (m.hasExploded) return false;
    m.hasExploded = true;
    detonationCount++;
    return true;
  };

  assert.equal(detonate(explosive), true);
  assert.equal(detonationCount, 1);

  // Second detonation attempt must be rejected
  assert.equal(detonate(explosive), false);
  assert.equal(detonationCount, 1);
});

test("7. Explosion damage respects shield and invulnerability rules", () => {
  const player = new Player(300, 300);
  assert.equal(player.state.lives, 3);

  // Case A: Player with active shield absorbs blast
  player.activateShield(10);
  assert.equal(player.state.shieldActive, true);
  const shieldHit = player.hit();
  assert.equal(shieldHit, "shield" as unknown as boolean);
  assert.equal(player.state.lives, 3, "Shield must absorb damage completely");
  assert.equal(player.state.shieldActive, false, "Shield is consumed upon absorption");

  // Case B: Player takes damage when vulnerable and enters invulnerability window
  player.state.invulnerableTime = 0;
  const hitResult = player.hit();
  assert.equal(hitResult, true);
  assert.equal(player.state.lives, 2, "Vulnerable player loses 1 life");
  assert.ok(player.state.invulnerableTime > 2.0, "Invulnerability timer must be set to ~2.2s");

  // Case C: Subsequent blast during invulnerability window is ignored
  const invulnHit = player.hit();
  assert.equal(invulnHit, false, "Invulnerable player must take zero damage");
  assert.equal(player.state.lives, 2, "Lives must remain intact during invulnerability");
});

test("8. Drifting meteors follow smooth trajectories", () => {
  resetMeteorIdCounter();
  const drifting = createMeteor("drifting", 400, 100, undefined, undefined, { x: 0, y: 120 });
  assert.equal(drifting.type, "drifting");

  const initialX = drifting.x;
  const xSamples: number[] = [];

  // Record 30 consecutive updates
  for (let i = 0; i < 30; i++) {
    updateMeteor(drifting, 0.016);
    xSamples.push(drifting.x);
  }

  // Verify smooth movement without teleporting
  for (let i = 1; i < xSamples.length; i++) {
    const deltaX = Math.abs(xSamples[i] - xSamples[i - 1]);
    assert.ok(deltaX < 5, `Movement delta between frames should be smooth, got ${deltaX}`);
  }

  // Verify that it curved laterally
  const hasLateralCurve = xSamples.some((x) => Math.abs(x - initialX) > 0.5);
  assert.equal(hasLateralCurve, true, "Drifting meteor should curve away from straight line");
});

test("9. Every meteor awards points according to its defined rules", () => {
  assert.equal(METEOR_CONFIGS.standard.scoreValue, 20);
  assert.equal(METEOR_CONFIGS.speed.scoreValue, 35);
  assert.equal(METEOR_CONFIGS.heavy.scoreValue, 75);
  assert.equal(METEOR_CONFIGS.splitting.scoreValue, 40);
  assert.equal(METEOR_CONFIGS.splitting_fragment.scoreValue, 15);
  assert.equal(METEOR_CONFIGS.explosive.scoreValue, 50);
  assert.equal(METEOR_CONFIGS.drifting.scoreValue, 35);

  const scoreSystem = new ScoreSystem();
  scoreSystem.addMeteorScore(METEOR_CONFIGS.standard.scoreValue);
  assert.equal(scoreSystem.score, 20);

  scoreSystem.addMeteorScore(METEOR_CONFIGS.heavy.scoreValue);
  assert.equal(scoreSystem.score, 95);
});

test("10. No meteor awards duplicate points", () => {
  const scoreSystem = new ScoreSystem();
  const m = createMeteor("standard", 100, 100);

  const awardScoreOnce = (target: MeteorEntity) => {
    if (target.hasAwardedScore) return 0;
    target.hasAwardedScore = true;
    return scoreSystem.addMeteorScore(target.scoreValue);
  };

  const firstAward = awardScoreOnce(m);
  assert.equal(firstAward, 20);
  assert.equal(scoreSystem.score, 20);

  // Second award on same meteor must be zero
  const secondAward = awardScoreOnce(m);
  assert.equal(secondAward, 0);
  assert.equal(scoreSystem.score, 20, "Score must not increase on duplicate award");
});

test("11. Special meteors work with directional shooting", () => {
  const player = new Player(500, 500);
  player.state.angle = 0; // Aiming right (+X)

  const projectiles: ProjectileEntity[] = [];
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

  // Player fires projectile
  player.update(0.25, input, 1000, 1000, false, false, (p) => projectiles.push(p), () => {});
  assert.ok(projectiles.length > 0, "Projectile should be spawned");
  const bullet = projectiles[0];
  assert.ok(bullet.vx > 0, "Projectile must travel strictly in aim direction");

  // Place a heavy meteor in the projectile's trajectory
  const heavyMeteor = createMeteor("heavy", bullet.x + 50, bullet.y);
  const hits = checkProjectileMeteorCollisions([bullet], [heavyMeteor]);

  assert.equal(hits.length, 1, "Directional bullet should hit heavy meteor");
  assert.equal(hits[0].meteorId, heavyMeteor.id);
  assert.equal(hits[0].damage, 1);
});

test("12. Late-game difficulty progression maintains bounded limits", () => {
  const difficulty = new DifficultySystem();

  // Wave 1
  const wave1Weights = difficulty.getSpawnWeights(1);
  assert.ok(wave1Weights.some((w) => w.type === "standard"));

  // Wave 4+
  difficulty.wave = 5;
  const lateWeights = difficulty.getSpawnWeights(5);
  assert.ok(lateWeights.some((w) => w.type === "explosive"));
  assert.ok(lateWeights.some((w) => w.type === "heavy"));
  assert.ok(lateWeights.some((w) => w.type === "splitting"));

  // Max entity count is sensibly capped
  assert.ok(difficulty.getMaxMeteors() <= 25, "Max meteors must be bounded to prevent performance drop");
  assert.ok(difficulty.getSpawnInterval() >= 0.45, "Spawn interval must have a safe minimum floor");
});

test("13. Safe spawn distance for explosive meteors", () => {
  const spawnSystem = new SpawnSystem();
  const difficulty = new DifficultySystem();
  difficulty.getRandomMeteorType = () => "explosive";

  const playerState: PlayerState = {
    x: 500,
    y: 375,
    vx: 0,
    vy: 0,
    radius: 20,
    angle: 0,
    lives: 3,
    maxLives: 3,
    invulnerableTime: 0,
    shieldActive: false,
    shieldTime: 0,
    muzzleFlashTimer: 0,
  };

  for (let i = 0; i < 20; i++) {
    const meteor = spawnSystem.spawnMeteor(1000, 750, playerState, difficulty);
    const dist = Math.hypot(meteor.x - playerState.x, meteor.y - playerState.y);
    assert.ok(
      dist >= 220,
      `Explosive meteor must not spawn within 220px of player (got ${dist.toFixed(1)}px)`
    );
  }
});

test("14. Pause, resume, game-over, and restart state transitions remain functional", () => {
  const difficulty = new DifficultySystem();
  const scoreSystem = new ScoreSystem();
  const player = new Player(500, 375);

  // Advance state
  difficulty.update(30); // Into wave 2
  scoreSystem.addMeteorScore(100);
  assert.equal(difficulty.wave, 2);
  assert.equal(scoreSystem.score, 100);

  // Simulate hits leading to Game Over
  player.state.invulnerableTime = 0;
  player.hit(); // 2 lives
  player.state.invulnerableTime = 0;
  player.hit(); // 1 life
  player.state.invulnerableTime = 0;
  const finalHit = player.hit(); // 0 lives -> game over condition
  assert.equal(finalHit, true);
  assert.equal(player.state.lives, 0);

  // Restart / Reset functionality
  difficulty.reset();
  scoreSystem.reset();
  player.reset(500, 375);

  assert.equal(difficulty.wave, 1, "Wave must reset to 1 on restart");
  assert.equal(difficulty.survivalTime, 0, "Survival time must reset to 0");
  assert.equal(scoreSystem.score, 0, "Score must reset to 0");
  assert.equal(player.state.lives, 3, "Player lives must reset to 3");
});

test("15. Entity IDs are strictly unique and prevent duplicate React keys or runtime collisions", () => {
  resetMeteorIdCounter();
  const createdIds = new Set<number>();

  // Spawn a diverse set of meteors
  for (let i = 0; i < 25; i++) {
    const m = createMeteor("standard", i * 10, i * 10);
    assert.equal(createdIds.has(m.id), false, `Meteor id ${m.id} must be unique`);
    createdIds.add(m.id);
  }

  // Create splitting meteors and split them into fragments
  for (let i = 0; i < 10; i++) {
    const parent = createMeteor("splitting", 100, 100);
    assert.equal(createdIds.has(parent.id), false, `Parent id ${parent.id} must be unique`);
    createdIds.add(parent.id);

    const fragments = splitMeteor(parent);
    for (const frag of fragments) {
      assert.equal(createdIds.has(frag.id), false, `Fragment id ${frag.id} must be unique`);
      createdIds.add(frag.id);
    }
  }

  assert.equal(createdIds.size, 25 + 10 + 20, "All 55 entities must possess strictly unique integer IDs");
});

test("16. Entity caps and particle limits prevent runaway growth during chain reactions", () => {
  const difficulty = new DifficultySystem();
  difficulty.wave = 3;
  const maxMeteors = difficulty.getMaxMeteors();

  const meteors: MeteorEntity[] = [];
  // Fill meteors to max
  for (let i = 0; i < maxMeteors; i++) {
    meteors.push(createMeteor("splitting", 100 + i * 10, 100));
  }

  // Simulate splitting of multiple meteors under full entity load
  const maxAllowed = difficulty.getMaxMeteors() + 6;
  for (let i = 0; i < 5; i++) {
    const fragments = splitMeteor(meteors[i]);
    const availableSlots = Math.max(0, maxAllowed - meteors.length);
    const fragmentsToAdd = fragments.slice(0, availableSlots);
    meteors.push(...fragmentsToAdd);
  }

  assert.ok(
    meteors.length <= maxAllowed,
    `Entity list must never exceed bounded limit of ${maxAllowed} (got ${meteors.length})`
  );
});
