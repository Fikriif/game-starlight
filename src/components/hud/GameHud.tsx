"use client";

import { useEffect, useState } from "react";
import { Heart, Pause, Play, RotateCcw, Shield, Zap } from "lucide-react";
import SoundToggle from "../ui/SoundToggle";
import { ActivePowerUpState } from "@/game/types/game";

interface GameHudProps {
  score: number;
  lives: number;
  maxLives: number;
  wave: number;
  survivalSeconds: number;
  activePowerUps: ActivePowerUpState[];
  isPaused: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
}

export default function GameHud({
  score,
  lives,
  maxLives,
  wave,
  survivalSeconds,
  activePowerUps,
  isPaused,
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
        {/* Left: Score & Multiplier */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-2 rounded-xl flex flex-col border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
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
          <div className="glass-panel px-3 py-2 rounded-xl border border-purple-500/30 flex flex-col hidden sm:flex">
            <span className="text-[10px] tracking-widest text-purple-400 font-mono uppercase">
              WAVE
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white text-glow-purple">
              {wave}
            </span>
          </div>
        </div>

        {/* Center: Survival Timer */}
        <div className="glass-panel px-4 py-2 rounded-xl border border-blue-500/30 flex flex-col items-center">
          <span className="text-[10px] tracking-widest text-blue-300 font-mono uppercase">
            SURVIVAL
          </span>
          <span className="text-lg sm:text-xl font-black font-mono text-white tracking-widest">
            {formattedTime}
          </span>
        </div>

        {/* Right: Remaining Lives & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
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
