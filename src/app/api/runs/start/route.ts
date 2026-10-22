import { NextResponse } from "next/server";
import crypto from "crypto";
import { generateRunToken } from "@/lib/validation/runToken";

export async function POST(req: Request) {
  try {
    let body: { userId?: string | null; guestId?: string | null } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable for guest starts
    }

    const runId = crypto.randomUUID();
    const startTime = Date.now();

    const token = generateRunToken({
      runId,
      startTime,
      userId: body.userId || null,
      guestId: body.guestId || null,
    });

    return NextResponse.json({
      success: true,
      runId,
      startTime,
      token,
    });
  } catch (error) {
    console.error("Error creating run session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize game run" },
      { status: 500 }
    );
  }
}
