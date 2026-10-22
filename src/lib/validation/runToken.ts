import crypto from "crypto";

const SERVER_SECRET =
  process.env.RUN_SIGNING_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "starfall-breakout-cosmic-secret-key-2026-fallback";

export interface RunTokenPayload {
  runId: string;
  startTime: number; // Unix timestamp in ms
  userId?: string | null;
  guestId?: string | null;
}

export function generateRunToken(payload: RunTokenPayload): string {
  const data = JSON.stringify(payload);
  const dataBase64 = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SERVER_SECRET)
    .update(dataBase64)
    .digest("base64url");
  return `${dataBase64}.${signature}`;
}

export function verifyRunToken(token: string): RunTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [dataBase64, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SERVER_SECRET)
      .update(dataBase64)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const jsonStr = Buffer.from(dataBase64, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as RunTokenPayload;

    if (!payload.runId || !payload.startTime) return null;

    return payload;
  } catch {
    return null;
  }
}
