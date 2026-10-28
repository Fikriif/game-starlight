import { NextResponse } from "next/server";
import {
  validateScoreSubmission,
  ScoreSubmissionPayload,
} from "@/lib/validation/scoreValidator";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { addLocalRun } from "@/lib/storage/localScoreStore";
import { Database } from "@/lib/supabase/types";

export async function POST(req: Request) {
  try {
    const body: ScoreSubmissionPayload = await req.json();

    // 1. Rigorous Anti-Cheat & Plausibility Validation
    const validation = validateScoreSubmission(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          verificationStatus: validation.verificationStatus,
        },
        { status: 400 }
      );
    }

    const {
      runId,
      score,
      survivalSeconds,
      meteorsDestroyed,
      highestWave,
      displayName,
      userId,
      guestId,
    } = body;

    // 2. Persist to Database if Supabase is configured
    if (isSupabaseConfigured && supabase) {
      const runInsertData: Database["public"]["Tables"]["game_runs"]["Insert"] = {
        id: runId,
        user_id: userId || null,
        guest_identifier: guestId || null,
        display_name: displayName.trim(),
        score,
        survival_seconds: Math.floor(survivalSeconds),
        meteors_destroyed: meteorsDestroyed,
        highest_wave: highestWave,
        verification_status: validation.verificationStatus,
      };

      const { data, error } = await supabase
        .from("game_runs")
        .insert([runInsertData])
        .select()
        .single();

      if (error) {
        console.error("Supabase run insert error:", error);
        // Fall back to local store if db error occurs
        addLocalRun({
          id: runId,
          displayName: displayName.trim(),
          score,
          survivalSeconds: Math.floor(survivalSeconds),
          meteorsDestroyed,
          highestWave,
          verificationStatus: "local",
          createdAt: new Date().toISOString(),
          isGuest: !userId,
        });

        return NextResponse.json({
          success: true,
          mode: "local_fallback",
          verificationStatus: "local",
          runId,
        });
      }

      return NextResponse.json({
        success: true,
        mode: "supabase",
        run: data,
        verificationStatus: validation.verificationStatus,
      });
    }

    // 3. Fallback: In-memory / local persistent mode
    const stored = addLocalRun({
      id: runId,
      displayName: displayName.trim(),
      score,
      survivalSeconds: Math.floor(survivalSeconds),
      meteorsDestroyed,
      highestWave,
      verificationStatus: "verified",
      createdAt: new Date().toISOString(),
      isGuest: !userId,
    });

    return NextResponse.json({
      success: true,
      mode: "local",
      verificationStatus: "verified",
      run: stored,
    });
  } catch (error) {
    console.error("Error submitting run:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process score submission" },
      { status: 500 }
    );
  }
}
