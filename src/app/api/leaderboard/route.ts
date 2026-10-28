import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getLocalLeaderboard } from "@/lib/storage/localScoreStore";
import { LeaderboardEntry } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const timeframe = (searchParams.get("timeframe") as "all-time" | "weekly" | "today") || "all-time";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("game_runs")
        .select("id, display_name, score, survival_seconds, meteors_destroyed, highest_wave, created_at, user_id")
        .eq("verification_status", "verified");

      const now = new Date();
      if (timeframe === "today") {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", oneDayAgo);
      } else if (timeframe === "weekly") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", sevenDaysAgo);
      }

      const { data, error } = await query
        .order("score", { ascending: false })
        .order("survival_seconds", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(limit);

      interface SupabaseGameRunRow {
        id: string;
        display_name: string;
        score: number;
        survival_seconds: number;
        meteors_destroyed: number;
        highest_wave: number;
        created_at: string;
        user_id?: string | null;
      }

      if (!error && data) {
        const entries: LeaderboardEntry[] = (data as unknown as SupabaseGameRunRow[]).map((row, idx) => ({
          rank: idx + 1,
          id: row.id,
          display_name: row.display_name,
          score: row.score,
          survival_seconds: row.survival_seconds,
          meteors_destroyed: row.meteors_destroyed,
          highest_wave: row.highest_wave,
          created_at: row.created_at,
          is_guest: !row.user_id,
        }));

        return NextResponse.json({
          success: true,
          source: "supabase",
          entries,
        });
      }
      console.warn("Supabase query error or empty, falling back to local store:", error);
    }

    // Local in-memory leaderboard
    const entries = getLocalLeaderboard(timeframe, limit);
    return NextResponse.json({
      success: true,
      source: "local",
      entries,
    });
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
