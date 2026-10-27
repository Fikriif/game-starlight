"use client";

import { Heart, Pause, Play, RotateCcw, Crosshair, Flame } from "lucide-react";
import SoundToggle from "../ui/SoundToggle";
import { ActivePowerUpState, ComboState, MeteorAlertInfo } from "@/game/types/game";

interface GameHudProps {
  score: number;
  lives: number;
  maxLives: number;
  wave: number;
  waveTitle?: string;
  waveTransition?: { wave: number; title: string } | null;
  comboState?: ComboState;
  survivalSeconds: number;
  activePowerUps: ActivePowerUpState[];
  isPaused: boolean;
  autoFire: boolean;
  meteorAlert?: MeteorAlertInfo | null;
  onToggleAutoFire: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
}

export default function GameHud({
  score,
  lives,
  maxLives,
  wave,
  waveTitle,
  waveTransition,
  comboState,
  survivalSeconds,
  activePowerUps,
  isPaused,
  autoFire,
  meteorAlert,
  onToggleAutoFire,
  onPauseToggle,
  onRestart,
}: GameHudProps) {
  // Format survival time to MM:SS
  const mins = Math.floor(survivalSeconds / 60);
  const secs = Math.floor(survivalSeconds % 60);
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="absolute inset-x-0 top-0 p-3 sm:p-5 pointer-events-none flex flex-col justify-between select-none z-20">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto w-full">
        {/* Left: Score & Wave & Combo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Score Display */}
          <div className="glass-panel px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex flex-col border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="text-[10px] tracking-widest text-cyan-400 font-mono uppercase">
              SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-glow-cyan text-white">
                {score.toLocaleString()}
              </span>
              {activePowerUps.some((p) => p.type === "score_multiplier") && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-500/50 animate-pulse">
                  2X
                </span>
              )}
            </div>
          </div>

          {/* Wave Badge */}
          <div className="glass-panel px-3 py-1.5 sm:py-2 rounded-xl border border-purple-500/30 flex flex-col hidden sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-widest text-purple-400 font-mono uppercase">
                WAVE
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-white text-glow-purple">
                {wave}
              </span>
            </div>
            {waveTitle && (
              <span className="text-[9px] font-mono tracking-wide text-purple-300/80 truncate max-w-[125px] uppercase">
                {waveTitle}
              </span>
            )}
          </div>

          {/* Dynamic Combo Multiplier Badge */}
          {comboState && comboState.count >= 2 && (
            <div className="glass-panel px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/40 bg-[#0d091a]/85 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-2 animate-pulse pointer-events-auto">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-300 text-glow-amber">
                    {comboState.multiplier.toFixed(1)}x
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400/90 uppercase hidden xs:inline">
                    {comboState.tierLabel || "STREAK"}
                  </span>
                </div>
                <div className="w-14 sm:w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-75"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, (comboState.timeRemaining / comboState.maxDuration) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Survival Timer & Aiming Directive */}
        <div className="flex flex-col items-center gap-1">
          <div className="glass-panel px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-blue-500/30 flex flex-col items-center">
            <span className="text-[10px] tracking-widest text-blue-300 font-mono uppercase">
              SURVIVAL
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white tracking-widest">
              {formattedTime}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-cyan-400/80 bg-slate-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
            <span>[MOUSE] AIM</span>
            <span>•</span>
            <span>[L-CLICK / SPACE] FIRE</span>
          </div>
        </div>

        {/* Right: Remaining Lives & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Auto-Fire Toggle Button */}
          <button
            onClick={onToggleAutoFire}
            className={`px-2.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              autoFire
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                : "bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Toggle Continuous Auto-Fire"
            aria-label="Toggle Continuous Auto-Fire"
          >
            <Crosshair className={`w-3.5 h-3.5 ${autoFire ? "text-cyan-400 animate-spin" : ""}`} />
            <span className="hidden sm:inline">AUTO-FIRE:</span>
            <span>{autoFire ? "ON" : "OFF"}</span>
          </button>

          {/* Starship Lives Indicators */}
          <div className="glass-panel px-3 py-2 rounded-xl border border-rose-500/30 flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: maxLives }).map((_, index) => {
              const hasLife = index < lives;
              return (
                <div
                  key={index}
                  className={`transition-all duration-300 transform ${
                    hasLife
                      ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100"
                      : "text-slate-700 scale-90"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      hasLife ? "fill-rose-500 text-rose-400" : "fill-slate-800 text-slate-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={onPauseToggle}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
            title={isPaused ? "Resume Game [P]" : "Pause Game [P]"}
            aria-label="Pause or Resume Game"
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Quick Restart Button */}
          <button
            onClick={onRestart}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-all shadow-sm cursor-pointer hidden xs:flex"
            title="Restart Mission"
            aria-label="Restart Mission"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <SoundToggle className="rounded-xl" />
        </div>
      </div>

      {/* Wave Transition Announcement Banner */}
      {waveTransition && (
        <div className="mt-4 mx-auto pointer-events-none z-30 animate-fade-in-down">
          <div className="px-6 py-2.5 rounded-2xl glass-panel border border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.35)] flex flex-col items-center gap-0.5 bg-[#050718]/90">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              WAVE {waveTransition.wave} INITIATED
            </div>
            <span className="text-base sm:text-xl font-black font-mono text-white text-glow-cyan tracking-wider uppercase">
              {waveTransition.title}
            </span>
          </div>
        </div>
      )}

      {/* Meteor Variant Detection Banner (Short, Non-Intrusive) */}
      {meteorAlert && !waveTransition && (
        <div
          className="mt-2.5 mx-auto px-4 py-1.5 rounded-full glass-panel border flex items-center gap-2.5 shadow-lg transition-all animate-fade-in-down pointer-events-auto"
          style={{
            borderColor: `${meteorAlert.color}80`,
            boxShadow: `0 0 16px ${meteorAlert.color}35`,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: meteorAlert.color }}
          />
          <strong
            className="text-xs font-mono font-bold tracking-wider uppercase"
            style={{ color: meteorAlert.color }}
          >
            {meteorAlert.label}
          </strong>
          <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
            — {meteorAlert.description}
          </span>
        </div>
      )}

      {/* Active Power-Up Timers Bar (Floating Sub-HUD) */}
      {activePowerUps.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pointer-events-auto">
          {activePowerUps.map((p) => {
            const pct = (p.timeRemaining / p.totalDuration) * 100;
            return (
              <div
                key={p.type}
                className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 border shadow-sm transition-all"
                style={{ borderColor: `${p.color}66` }}
              >
                <span className="text-xs font-bold" style={{ color: p.color }}>
                  {p.name}
                </span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-300">
                  {p.timeRemaining.toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
