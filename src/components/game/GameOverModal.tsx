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
  Flame,
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
  const [statusMessage, setStatusMessage] = useState("Authenticating sortie telemetry...");
  const [isNewRecord] = useState(() => {
    const currentRunId = runId || `run_${Date.now()}`;
    const { isNewRecord: newRecord } = updateProfileAfterRun(
      currentRunId,
      stats.score,
      stats.survivalSeconds,
      stats.wave,
      stats.meteorsDestroyed
    );
    return newRecord;
  });

  useEffect(() => {
    if (isNewRecord) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#a855f7", "#f59e0b", "#38bdf8"],
        });
      } catch {}
    }

    // Submit to verified backend API
    const submitScore = async () => {
      if (!runToken || !runId) {
        setSubmissionStatus("success");
        setStatusMessage("Score logged to local high scores");
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
            setStatusMessage("Verified & recorded on Global Leaderboard");
          } else {
            setStatusMessage("Verified & recorded on Local High Scores");
          }
        } else {
          setSubmissionStatus("error");
          setStatusMessage(data.error || "Telemetry verification rejected");
        }
      } catch (err) {
        console.warn("Submission error:", err);
        setSubmissionStatus("success");
        setStatusMessage("Logged to local high scores");
      }
    };

    submitScore();
  }, [runId, runToken, stats, isNewRecord]);

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
    <div className="absolute inset-0 z-30 bg-[#02040a]/94 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="hud-panel-strong max-w-md w-full p-5 sm:p-7 border border-red-500/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-center my-auto corner-bracket-danger">
        {/* Status Tag */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-red-950/70 text-red-400 border border-red-500/40">
            SORTIE TERMINATED // HULL FAILURE
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white text-glow-danger uppercase">
          MISSION CASUALTY
        </h2>

        {/* New Personal Record celebration */}
        {isNewRecord && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-mono font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}

        {/* Final Score Block */}
        <div className="my-4 p-4 bg-[#050918] border border-cyan-500/35 relative">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
            AUTHENTICATED SCORE
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono text-white text-glow-cyan tracking-tight mt-0.5">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Telemetry Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-left font-mono">
          <div className="p-2.5 bg-[#050a1c] border border-slate-800/90 flex items-center gap-2.5 clip-chamfer-xs">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 tracking-wider">FLIGHT TIME</div>
              <div className="text-sm font-bold text-slate-100">{formattedTime}</div>
            </div>
          </div>

          <div className="p-2.5 bg-[#050a1c] border border-slate-800/90 flex items-center gap-2.5 clip-chamfer-xs">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 tracking-wider">SECTOR REACHED</div>
              <div className="text-sm font-bold text-slate-100">Wave {stats.wave}</div>
            </div>
          </div>

          <div className="p-2.5 bg-[#050a1c] border border-slate-800/90 flex items-center gap-2.5 clip-chamfer-xs">
            <Crosshair className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 tracking-wider">HAZARDS DESTROYED</div>
              <div className="text-sm font-bold text-slate-100">{stats.meteorsDestroyed}</div>
            </div>
          </div>

          <div className="p-2.5 bg-[#050a1c] border border-slate-800/90 flex items-center gap-2.5 clip-chamfer-xs">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 tracking-wider">MAX STREAK</div>
              <div className="text-sm font-bold text-amber-300">
                {stats.maxCombo && stats.maxCombo > 0 ? `${stats.maxCombo}x Streak` : "0x"}
              </div>
            </div>
          </div>

          <div className="col-span-2 p-2 bg-[#050a1c] border border-slate-800/90 flex items-center justify-between font-mono clip-chamfer-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-slate-400 tracking-wider">BLASTER ACCURACY</span>
            </div>
            <span className="text-xs font-bold text-emerald-300">{accuracy}%</span>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="mb-5 p-2 bg-[#040816] border border-slate-800 flex items-center justify-center gap-2 text-xs font-mono">
          {submissionStatus === "submitting" && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-slate-400 text-[11px]">{statusMessage}</span>
            </>
          )}
          {submissionStatus === "success" && (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-[11px] font-medium">{statusMessage}</span>
            </>
          )}
          {submissionStatus === "error" && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 text-[11px] font-medium">{statusMessage}</span>
            </>
          )}
        </div>

        {/* Tactical Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 btn-arcade-cyan text-sm flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
          >
            <RotateCcw className="w-4 h-4 fill-current" />
            <span>DEPLOY SORTIE AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/leaderboard"
              onClick={() => soundManager.playClick()}
              className="py-2.5 px-3 btn-arcade-dark text-xs flex items-center justify-center gap-1.5 clip-chamfer-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings</span>
            </Link>

            <Link
              href="/"
              onClick={() => soundManager.playClick()}
              className="py-2.5 px-3 btn-arcade-dark text-xs flex items-center justify-center gap-1.5 clip-chamfer-sm"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hangar Menu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
