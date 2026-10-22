import { verifyRunToken } from "./runToken";

export interface ScoreSubmissionPayload {
  token: string;
  runId: string;
  score: number;
  survivalSeconds: number;
  meteorsDestroyed: number;
  highestWave: number;
  displayName: string;
  userId?: string | null;
  guestId?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  verificationStatus: "verified" | "flagged" | "local";
}

// In-memory set to prevent double submission of the same runId
const submittedRunIds = new Set<string>();

export function validateScoreSubmission(
  payload: ScoreSubmissionPayload
): ValidationResult {
  const {
    token,
    runId,
    score,
    survivalSeconds,
    meteorsDestroyed,
    highestWave,
    displayName,
  } = payload;

  // 1. Basic Type & Range Checks
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing run verification token", verificationStatus: "flagged" };
  }

  if (!runId || typeof runId !== "string") {
    return { valid: false, error: "Missing or invalid run ID", verificationStatus: "flagged" };
  }

  if (typeof score !== "number" || score < 0 || !Number.isInteger(score)) {
    return { valid: false, error: "Invalid score value", verificationStatus: "flagged" };
  }

  if (
    typeof survivalSeconds !== "number" ||
    survivalSeconds < 0 ||
    !Number.isFinite(survivalSeconds)
  ) {
    return { valid: false, error: "Invalid survival seconds", verificationStatus: "flagged" };
  }

  if (
    typeof meteorsDestroyed !== "number" ||
    meteorsDestroyed < 0 ||
    !Number.isInteger(meteorsDestroyed)
  ) {
    return { valid: false, error: "Invalid meteors destroyed count", verificationStatus: "flagged" };
  }

  if (
    typeof highestWave !== "number" ||
    highestWave < 1 ||
    !Number.isInteger(highestWave)
  ) {
    return { valid: false, error: "Invalid highest wave value", verificationStatus: "flagged" };
  }

  if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
    return { valid: false, error: "Display name cannot be empty", verificationStatus: "flagged" };
  }

  // Sanitize display name length
  if (displayName.trim().length > 30) {
    return { valid: false, error: "Display name exceeds 30 characters", verificationStatus: "flagged" };
  }

  // 2. Idempotency Check: Prevent duplicate submissions
  if (submittedRunIds.has(runId)) {
    return { valid: false, error: "This run has already been submitted", verificationStatus: "flagged" };
  }

  // 3. Cryptographic Token Verification
  const tokenPayload = verifyRunToken(token);
  if (!tokenPayload) {
    return { valid: false, error: "Tampered or invalid run token", verificationStatus: "flagged" };
  }

  if (tokenPayload.runId !== runId) {
    return { valid: false, error: "Run ID mismatch with token", verificationStatus: "flagged" };
  }

  // 4. Elapsed Time Verification (Anti-Speedhack)
  const now = Date.now();
  const elapsedServerSeconds = (now - tokenPayload.startTime) / 1000;

  // Allow 5.0 seconds of latency / clock drift buffer
  if (survivalSeconds > elapsedServerSeconds + 5.0) {
    return {
      valid: false,
      error: "Reported survival duration exceeds actual elapsed server time",
      verificationStatus: "flagged",
    };
  }

  // 5. Plausibility Check: Maximum Theoretical Score
  // Max per meteor = 50 * 2 (multiplier) = 100.
  // Large splits into 2 medium (25*2 each) which split into 2 small (10*2 each).
  // Total potential yield per destroyed meteor chain <= 300 pts.
  // Passive survival bonus <= 10 pts per 10s * 2 = 2 pts/sec.
  // Generous ceiling factor of 2x for power-up bonuses:
  const maxMeteorsScore = meteorsDestroyed * 350;
  const maxSurvivalScore = survivalSeconds * 5;
  const maxTheoreticalScore = maxMeteorsScore + maxSurvivalScore + 500;

  if (score > maxTheoreticalScore) {
    return {
      valid: false,
      error: "Score exceeds maximum physically achievable points for this duration",
      verificationStatus: "flagged",
    };
  }

  // Mark as submitted to prevent replay
  submittedRunIds.add(runId);

  // Keep set size bounded
  if (submittedRunIds.size > 2000) {
    const firstKey = submittedRunIds.values().next().value;
    if (firstKey) submittedRunIds.delete(firstKey);
  }

  return { valid: true, verificationStatus: "verified" };
}
