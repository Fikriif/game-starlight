import test from "node:test";
import assert from "node:assert/strict";
import { ScoreSystem } from "../src/game/systems/ScoreSystem";

test("ScoreSystem accurately tallies base meteor scores", () => {
  const system = new ScoreSystem();
  assert.equal(system.score, 0);

  // Destroy small meteor
  const pts1 = system.addMeteorScore(10);
  assert.equal(pts1, 10);
  assert.equal(system.score, 10);
  assert.equal(system.meteorsDestroyed, 1);

  // Destroy medium meteor
  const pts2 = system.addMeteorScore(25);
  assert.equal(pts2, 25);
  assert.equal(system.score, 35);
  assert.equal(system.meteorsDestroyed, 2);

  // Destroy large meteor
  const pts3 = system.addMeteorScore(50);
  assert.equal(pts3, 50);
  assert.equal(system.score, 85);
  assert.equal(system.meteorsDestroyed, 3);
});

test("ScoreSystem doubles points when 2X multiplier is active", () => {
  const system = new ScoreSystem();
  system.setMultiplier(2, 10); // 2X for 10 seconds

  const pts = system.addMeteorScore(50);
  assert.equal(pts, 100, "50 base points should yield 100 with 2X multiplier");
  assert.equal(system.score, 100);

  const powerUpPts = system.addPowerUpScore(20);
  assert.equal(powerUpPts, 40, "20 bonus points should yield 40 with 2X multiplier");
  assert.equal(system.score, 140);
});

test("ScoreSystem awards passive survival bonus every 10 seconds", () => {
  const system = new ScoreSystem();

  // 9 seconds elapsed (no passive bonus yet)
  const g1 = system.update(9.0);
  assert.equal(g1, 0);
  assert.equal(system.score, 0);

  // 1.5 more seconds elapsed (total > 10s)
  const g2 = system.update(1.5);
  assert.equal(g2, 5, "Should award 5 passive survival bonus points at 10s");
  assert.equal(system.score, 5);
});

test("ScoreSystem multiplier expires accurately after duration", () => {
  const system = new ScoreSystem();
  system.setMultiplier(2, 5.0); // 5 seconds duration

  system.update(3.0);
  assert.equal(system.multiplier, 2, "Multiplier should still be active at 3s");

  system.update(2.5); // total 5.5s
  assert.equal(system.multiplier, 1, "Multiplier should reset to 1 after duration");

  const pts = system.addMeteorScore(10);
  assert.equal(pts, 10, "Base score without multiplier");
});
