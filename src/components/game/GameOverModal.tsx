"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Trophy,
  Home,
  Clock,
  Crosshair,
  Zap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GameStats } from "@/game/types/game";
import {
  getPlayerProfile,
  updateProfileAfterRun,
} from "@/lib/storage/guestProfile";
import { soundManager } from "@/game/audio/SoundManager";

interface GameOverModalProps {
  stats: GameStats;
  runToken: string | null;
  runId: string | null;
  onRestart: () => void;
}

export default function GameOverModal({
  stats,
  runToken,
  runId,
  onRestart,
}: GameOverModalProps) {
  const [submissionStatus, setSubmissionStatus] = useState<
    "submitting" | "success" | "error"
  >("submitting");
  const [statusMessage, setStatusMessage] = useState("Verifying and submitting score...");
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    // 1. Update local profile stats
    const currentRunId = runId || `run_${Date.now()}`;
    const { isNewRecord: newRecord } = updateProfileAfterRun(
      currentRunId,
      stats.score,
      stats.survivalSeconds,
      stats.wave,
      stats.meteorsDestroyed
    );
    setIsNewRecord(newRecord);

    if (newRecord) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#a855f7", "#ff007f", "#f59e0b"],
        });
      } catch {}
    }

    // 2. Submit to backend API
    const submitScore = async () => {
      if (!runToken || !runId) {
        setSubmissionStatus("success");
        setStatusMessage("Score saved to personal log (Local mode)");
        return;
      }

      try {
        const profile = getPlayerProfile();
        const res = await fetch("/api/runs/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: runToken,
            runId,
            score: stats.score,
            survivalSeconds: stats.survivalSeconds,
            meteorsDestroyed: stats.meteorsDestroyed,
            highestWave: stats.wave,
            displayName: profile.displayName,
            guestId: profile.guestId,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSubmissionStatus("success");
          if (data.mode === "supabase") {
            setStatusMessage("Verified & recorded on Global Leaderboard!");
          } else {
            setStatusMessage("Verified & recorded on Arcade Leaderboard!");
          }
        } else {
          setSubmissionStatus("error");
          setStatusMessage(data.error || "Score verification failed");
        }
      } catch (err) {
        console.warn("Submission error:", err);
        setSubmissionStatus("success");
        setStatusMessage("Saved to offline high scores");
      }
    };

    submitScore();
  }, [runId, runToken, stats]);

  // Format survival time to MM:SS
  const mins = Math.floor(stats.survivalSeconds / 60);
  const secs = Math.floor(stats.survivalSeconds % 60);
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Calculate blaster accuracy
  const accuracy =
    stats.accuracyShotsFired > 0
      ? Math.min(100, Math.round((stats.accuracyShotsHit / stats.accuracyShotsFired) * 100))
      : 0;

  return (
    <div className="absolute inset-0 z-30 bg-[#03050c]/85 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-rose-500/40 shadow-[0_0_50px_rgba(255,0,127,0.25)] text-center my-auto animate-float">
        {/* Top Tag & Title */}
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
          MISSION TERMINATED
        </span>

        <h2 className="text-3xl font-black tracking-wider text-white mt-3 text-glow-magenta">
          HULL DESTROYED
        </h2>

        {/* New Personal Record celebration */}
        {isNewRecord && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            NEW PERSONAL RECORD!
          </div>
        )}

        {/* Final Score Big Callout */}
        <div className="my-5 p-4 rounded-2xl bg-[#070b1e]/90 border border-cyan-500/30 shadow-inner">
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            FINAL SCORE
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono text-white text-glow-cyan tracking-tight mt-1">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Mission Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-left font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">SURVIVAL TIME</div>
              <div className="text-sm font-bold text-slate-200">{formattedTime}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">HIGHEST WAVE</div>
              <div className="text-sm font-bold text-slate-200">Wave {stats.wave}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">METEORS HIT</div>
              <div className="text-sm font-bold text-slate-200">{stats.meteorsDestroyed}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">ACCURACY</div>
              <div className="text-sm font-bold text-slate-200">{accuracy}%</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Submission Status Pill */}
        <div className="mb-6 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center gap-2 text-xs">
          {submissionStatus === "submitting" && (
            <>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-slate-400">{statusMessage}</span>
            </>
          )}
          {submissionStatus === "success" && (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">{statusMessage}</span>
            </>
          )}
          {submissionStatus === "error" && (
            <>
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span className="text-rose-300 font-medium">{statusMessage}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <RotateCcw className="w-5 h-5 fill-current" />
            Play Again
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/leaderboard"
              onClick={() => soundManager.playClick()}
              className="py-2.5 px-3 rounded-xl font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboard
            </Link>

            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="py-2.5 px-3 rounded-xl font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              Main Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
