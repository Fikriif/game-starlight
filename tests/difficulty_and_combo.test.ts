import test from "node:test";
import assert from "node:assert/strict";
import { DifficultySystem } from "../src/game/systems/DifficultySystem";
import { ScoreSystem } from "../src/game/systems/ScoreSystem";
import { DIFFICULTY_CONFIG } from "../src/game/config/constants";

test("DifficultySystem wave progression at 30s boundaries", () => {
  const difficulty = new DifficultySystem();
  assert.equal(difficulty.wave, 1);
  assert.equal(difficulty.getWaveTitle(), "Survival Training");

  // Advance to 29.5 seconds - still Wave 1
  let waveChanged = difficulty.update(29.5);
  assert.equal(waveChanged, false);
  assert.equal(difficulty.wave, 1);

  // Advance past 30 seconds - transitions to Wave 2
  waveChanged = difficulty.update(1.0);
  assert.equal(waveChanged, true);
  assert.equal(difficulty.wave, 2);
  assert.equal(difficulty.getWaveTitle(), "Increasing Pressure");

  // Advance past 60 seconds - Wave 3
  difficulty.update(30.0);
  assert.equal(difficulty.wave, 3);
  assert.equal(difficulty.getWaveTitle(), "Dangerous Skies");

  // Advance past 90 seconds - Wave 4
  difficulty.update(30.0);
  assert.equal(difficulty.wave, 4);
  assert.equal(difficulty.getWaveTitle(), "Meteor Storm");

  // Advance past 120 seconds - Wave 5+
  difficulty.update(30.0);
  assert.equal(difficulty.wave, 5);
  assert.equal(difficulty.getWaveTitle(), "Endless Survival");
});

test("DifficultySystem enforces bounded spawn intervals and maximum hazards", () => {
  const difficulty = new DifficultySystem();

  // Wave 1 initial interval
  const initialInterval = difficulty.getSpawnInterval();
  assert.equal(initialInterval, DIFFICULTY_CONFIG.INITIAL_SPAWN_INTERVAL);

  // Fast forward by 600 seconds (10 minutes)
  for (let i = 0; i < 20; i++) {
    difficulty.update(30);
  }

  // Interval must not drop below minimum floor
  const extremeInterval = difficulty.getSpawnInterval();
  assert.ok(
    extremeInterval >= DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL,
    `Interval ${extremeInterval} must be >= MIN_SPAWN_INTERVAL ${DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL}`
  );

  // Max active meteors must not exceed absolute ceiling
  const maxMeteors = difficulty.getMaxMeteors();
  assert.ok(
    maxMeteors <= DIFFICULTY_CONFIG.MAX_METEORS_LIMIT,
    `Max meteors ${maxMeteors} must be <= MAX_METEORS_LIMIT ${DIFFICULTY_CONFIG.MAX_METEORS_LIMIT}`
  );

  // Speed multiplier must not exceed ceiling
  const speedScale = difficulty.getWaveSpeedMultiplier();
  assert.ok(
    speedScale <= 1.35,
    `Speed multiplier ${speedScale} must remain bounded`
  );
});

test("ScoreSystem combo streak scales multipliers across tiers", () => {
  const scoreSystem = new ScoreSystem();

  // Hit 1: Base multiplier (1.0x)
  const pts1 = scoreSystem.addMeteorScore(10, 1, true);
  assert.equal(pts1, 10);
  assert.equal(scoreSystem.combo, 1);
  assert.equal(scoreSystem.comboMultiplier, 1.0);

  // Hit 2: Tier 1 Combo (1.5x)
  const pts2 = scoreSystem.addMeteorScore(10, 1, true);
  assert.equal(pts2, 15);
  assert.equal(scoreSystem.combo, 2);
  assert.equal(scoreSystem.comboMultiplier, 1.5);
  assert.equal(scoreSystem.getComboTierLabel(), "COMBO");

  // Hit 4: Tier 2 Super Combo (2.0x)
  scoreSystem.addMeteorScore(10, 1, true); // Hit 3 (1.5x)
  const pts4 = scoreSystem.addMeteorScore(20, 1, true); // Hit 4 (2.0x)
  assert.equal(pts4, 40);
  assert.equal(scoreSystem.combo, 4);
  assert.equal(scoreSystem.comboMultiplier, 2.0);
  assert.equal(scoreSystem.getComboTierLabel(), "SUPER COMBO");

  // Hit 7: Tier 3 Mega Combo (2.5x)
  scoreSystem.addMeteorScore(10, 1, true); // Hit 5 (2.0x)
  scoreSystem.addMeteorScore(10, 1, true); // Hit 6 (2.0x)
  const pts7 = scoreSystem.addMeteorScore(20, 1, true); // Hit 7 (2.5x)
  assert.equal(pts7, 50);
  assert.equal(scoreSystem.combo, 7);
  assert.equal(scoreSystem.comboMultiplier, 2.5);
  assert.equal(scoreSystem.getComboTierLabel(), "MEGA COMBO");

  // Hit 10: Tier 4 Ultra Combo (3.0x ceiling)
  scoreSystem.addMeteorScore(10, 1, true); // Hit 8 (2.5x)
  scoreSystem.addMeteorScore(10, 1, true); // Hit 9 (2.5x)
  const pts10 = scoreSystem.addMeteorScore(30, 1, true); // Hit 10 (3.0x)
  assert.equal(pts10, 90);
  assert.equal(scoreSystem.combo, 10);
  assert.equal(scoreSystem.comboMultiplier, 3.0);
  assert.equal(scoreSystem.getComboTierLabel(), "ULTRA COMBO");
});

test("ScoreSystem combo window decays when player does not hit within time limit", () => {
  const scoreSystem = new ScoreSystem();

  // Build combo to 3
  scoreSystem.addMeteorScore(10, 1, true);
  scoreSystem.addMeteorScore(10, 1, true);
  scoreSystem.addMeteorScore(10, 1, true);
  assert.equal(scoreSystem.combo, 3);
  assert.equal(scoreSystem.comboMultiplier, 1.5);

  // Update with 1.5s (window is 2.8s, so combo should still be active)
  scoreSystem.update(1.5);
  assert.equal(scoreSystem.combo, 3);
  assert.equal(scoreSystem.comboMultiplier, 1.5);

  // Update with another 1.5s (total 3.0s > 2.8s window -> resets)
  scoreSystem.update(1.5);
  assert.equal(scoreSystem.combo, 0);
  assert.equal(scoreSystem.comboMultiplier, 1.0);
});

test("ScoreSystem tracks maxCombo throughout session", () => {
  const scoreSystem = new ScoreSystem();

  // Build combo to 5
  for (let i = 0; i < 5; i++) {
    scoreSystem.addMeteorScore(10, 1, true);
  }
  assert.equal(scoreSystem.combo, 5);
  assert.equal(scoreSystem.maxCombo, 5);

  // Allow combo to decay
  scoreSystem.update(3.0);
  assert.equal(scoreSystem.combo, 0);
  assert.equal(scoreSystem.maxCombo, 5, "maxCombo should be preserved after decay");

  // Build another smaller combo of 3
  for (let i = 0; i < 3; i++) {
    scoreSystem.addMeteorScore(10, 1, true);
  }
  assert.equal(scoreSystem.combo, 3);
  assert.equal(scoreSystem.maxCombo, 5, "maxCombo should still be the session peak (5)");

  // Build a larger combo of 7
  for (let i = 0; i < 4; i++) {
    scoreSystem.addMeteorScore(10, 1, true); // reaches 7
  }
  assert.equal(scoreSystem.combo, 7);
  assert.equal(scoreSystem.maxCombo, 7, "maxCombo should update when beaten");
});

test("ScoreSystem resets combo and maxCombo on reset()", () => {
  const scoreSystem = new ScoreSystem();
  for (let i = 0; i < 5; i++) {
    scoreSystem.addMeteorScore(10, 1, true);
  }
  assert.equal(scoreSystem.maxCombo, 5);

  scoreSystem.reset();
  assert.equal(scoreSystem.score, 0);
  assert.equal(scoreSystem.combo, 0);
  assert.equal(scoreSystem.maxCombo, 0);
  assert.equal(scoreSystem.comboMultiplier, 1.0);
});
