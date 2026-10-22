import test from "node:test";
import assert from "node:assert/strict";
import { generateRunToken, verifyRunToken } from "../src/lib/validation/runToken";
import { validateScoreSubmission } from "../src/lib/validation/scoreValidator";

test("generateRunToken creates verifiable HMAC token", () => {
  const token = generateRunToken({
    runId: "run-test-123",
    startTime: Date.now() - 5000,
    guestId: "guest-test",
  });

  const payload = verifyRunToken(token);
  assert.notEqual(payload, null);
  assert.equal(payload?.runId, "run-test-123");
  assert.equal(payload?.guestId, "guest-test");
});

test("verifyRunToken rejects tampered signature", () => {
  const token = generateRunToken({
    runId: "run-test-tamper",
    startTime: Date.now(),
  });

  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.forgedSignature12345`;

  const payload = verifyRunToken(tamperedToken);
  assert.equal(payload, null, "Tampered signature must fail verification");
});

test("validateScoreSubmission approves valid plausible score run", () => {
  const startTime = Date.now() - 60000; // 60 seconds ago
  const runId = `valid_run_${Date.now()}`;
  const token = generateRunToken({ runId, startTime });

  const result = validateScoreSubmission({
    token,
    runId,
    score: 850,
    survivalSeconds: 58,
    meteorsDestroyed: 24,
    highestWave: 3,
    displayName: "TestPilot",
  });

  assert.equal(result.valid, true);
  assert.equal(result.verificationStatus, "verified");
});

test("validateScoreSubmission rejects time manipulation (speedhack)", () => {
  const startTime = Date.now() - 5000; // only 5 seconds ago
  const runId = `speedhack_run_${Date.now()}`;
  const token = generateRunToken({ runId, startTime });

  const result = validateScoreSubmission({
    token,
    runId,
    score: 1200,
    survivalSeconds: 300, // claims 5 minutes in a 5 second session!
    meteorsDestroyed: 40,
    highestWave: 5,
    displayName: "CheatPilot",
  });

  assert.equal(result.valid, false);
  assert.match(result.error || "", /exceeds actual elapsed server time/);
});

test("validateScoreSubmission rejects physically impossible scores", () => {
  const startTime = Date.now() - 30000; // 30 seconds ago
  const runId = `cheat_run_${Date.now()}`;
  const token = generateRunToken({ runId, startTime });

  const result = validateScoreSubmission({
    token,
    runId,
    score: 999999, // Impossible score for 2 meteors!
    survivalSeconds: 28,
    meteorsDestroyed: 2,
    highestWave: 1,
    displayName: "HackerPilot",
  });

  assert.equal(result.valid, false);
  assert.match(result.error || "", /exceeds maximum physically achievable/);
});

test("validateScoreSubmission rejects duplicate submissions (idempotency)", () => {
  const startTime = Date.now() - 10000;
  const runId = `idempotent_run_${Date.now()}`;
  const token = generateRunToken({ runId, startTime });

  const firstSubmission = validateScoreSubmission({
    token,
    runId,
    score: 150,
    survivalSeconds: 8,
    meteorsDestroyed: 4,
    highestWave: 1,
    displayName: "PilotOnce",
  });
  assert.equal(firstSubmission.valid, true);

  // Submitting the same runId again must be rejected!
  const duplicateSubmission = validateScoreSubmission({
    token,
    runId,
    score: 150,
    survivalSeconds: 8,
    meteorsDestroyed: 4,
    highestWave: 1,
    displayName: "PilotOnce",
  });
  assert.equal(duplicateSubmission.valid, false);
  assert.match(duplicateSubmission.error || "", /already been submitted/);
});
