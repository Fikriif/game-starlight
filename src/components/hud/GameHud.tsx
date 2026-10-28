"use client";

import { Shield, AlertTriangle, Pause, Play, RotateCcw, Crosshair, Flame, Zap } from "lucide-react";
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

  // Hull integrity calculations
  const hullPct = Math.round((lives / maxLives) * 100);
  const isCritical = lives === 1;
  const isDamaged = lives === 2;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none flex flex-col select-none z-20">
      {/* Integrated Avionics Visor Header */}
      <div className="w-full bg-[#040816]/95 border-b border-cyan-500/30 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.9)] relative backdrop-blur-md">
        {/* Left Telemetry: Score, Multiplier, Wave */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Score Display */}
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
              SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-white text-glow-cyan tracking-tight">
                {score.toLocaleString()}
              </span>
              {activePowerUps.some((p) => p.type === "score_multiplier") && (
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse">
                  2X ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800/80 hidden sm:block" />

          {/* Wave & Sector */}
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                SECTOR
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                WAVE {wave.toString().padStart(2, "0")}
              </span>
            </div>
            {waveTitle && (
              <span className="text-[10px] font-mono text-slate-300 truncate max-w-[140px] uppercase">
                {waveTitle}
              </span>
            )}
          </div>

          {/* Combo Multiplier Meter */}
          {comboState && comboState.count >= 2 && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#060b1e] border border-amber-500/50 pointer-events-auto corner-bracket-amber">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-300 text-glow-amber">
                    {comboState.multiplier.toFixed(1)}x
                  </span>
                  <span className="text-[8px] font-mono font-bold tracking-wider text-amber-400/90 uppercase hidden xs:inline">
                    {comboState.tierLabel || "STREAK"}
                  </span>
                </div>
                <div className="w-14 sm:w-16 h-1 bg-slate-900 rounded-none overflow-hidden mt-1 border border-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-75"
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

        {/* Center: Mission Chronometer & Controls Hint */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
              FLIGHT TIME
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-slate-100 tracking-wider">
              {formattedTime}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2 font-mono text-[9px] text-slate-400 tracking-wider">
            <span>[MOUSE] AIM</span>
            <span className="text-slate-600">•</span>
            <span>[CLICK / SPACE] FIRE</span>
          </div>
        </div>

        {/* Right Telemetry: Hull Armor Cells & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* 3-Cell Segmented Hull Integrity Gauge */}
          <div
            className={`px-2.5 py-1.5 border flex flex-col justify-center transition-all ${
              isCritical
                ? "bg-red-950/60 border-red-500/80 shadow-[0_0_14px_rgba(239,68,68,0.4)] animate-pulse corner-bracket-danger"
                : isDamaged
                ? "bg-amber-950/40 border-amber-500/60 corner-bracket-amber"
                : "bg-[#060c20] border-slate-700/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider uppercase">
                <Shield
                  className={`w-3 h-3 ${
                    isCritical
                      ? "text-red-400"
                      : isDamaged
                      ? "text-amber-400"
                      : "text-cyan-400"
                  }`}
                />
                <span
                  className={
                    isCritical
                      ? "text-red-300 font-black tracking-widest"
                      : isDamaged
                      ? "text-amber-300"
                      : "text-slate-300"
                  }
                >
                  {isCritical ? "CRITICAL HULL" : `HULL ${hullPct}%`}
                </span>
              </div>
            </div>

            {/* 3 Armor Battery Cells */}
            <div className="flex items-center gap-1">
              {Array.from({ length: maxLives }).map((_, idx) => {
                const filled = idx < lives;
                return (
                  <div
                    key={idx}
                    className={`w-4 sm:w-5 h-2 transition-all duration-200 border ${
                      filled
                        ? isCritical
                          ? "bg-red-500 border-red-400 shadow-[0_0_6px_#ef4444]"
                          : isDamaged
                          ? "bg-amber-400 border-amber-300 shadow-[0_0_5px_#f59e0b]"
                          : "bg-cyan-400 border-cyan-300 shadow-[0_0_5px_#00f0ff]"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Auto-Fire Toggle */}
          <button
            onClick={onToggleAutoFire}
            className={`px-2 py-1.5 border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer clip-chamfer-xs ${
              autoFire
                ? "bg-cyan-500/25 text-cyan-300 border-cyan-400 glow-cyan-sm"
                : "bg-[#060b1e] text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
            }`}
            title="Toggle Continuous Auto-Fire"
            aria-label="Toggle Continuous Auto-Fire"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">AUTO:</span>
            <span>{autoFire ? "ON" : "OFF"}</span>
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={onPauseToggle}
            className="p-1.5 sm:p-2 bg-[#060b1e] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer clip-chamfer-xs"
            title={isPaused ? "Resume Flight [P]" : "Pause Flight [P]"}
            aria-label="Pause or Resume Flight"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Quick Restart Button */}
          <button
            onClick={onRestart}
            className="p-1.5 sm:p-2 bg-[#060b1e] border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-all cursor-pointer clip-chamfer-xs hidden xs:flex"
            title="Restart Mission"
            aria-label="Restart Mission"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <SoundToggle />
        </div>
      </div>

      {/* Wave Transition Directive (Tactical Briefing Banner) */}
      {waveTransition && (
        <div className="mt-4 mx-auto pointer-events-none z-30">
          <div className="px-6 py-2.5 hud-panel-strong border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col items-center gap-0.5 corner-bracket">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SECTOR ESCALATION // WAVE {waveTransition.wave.toString().padStart(2, "0")}
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-white text-glow-cyan tracking-wider uppercase">
              {waveTransition.title}
            </span>
          </div>
        </div>
      )}

      {/* Meteor Hazard Detection Ticker */}
      {meteorAlert && !waveTransition && (
        <div
          className="mt-2.5 mx-auto px-4 py-1.5 hud-panel border flex items-center gap-2.5 shadow-md pointer-events-auto transition-all corner-bracket"
          style={{ borderColor: `${meteorAlert.color}80` }}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: meteorAlert.color }} />
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

      {/* Active Power-Ups Telemetry Bar */}
      {activePowerUps.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pointer-events-auto">
          {activePowerUps.map((p) => {
            const pct = (p.timeRemaining / p.totalDuration) * 100;
            return (
              <div
                key={p.type}
                className="hud-panel px-2.5 py-1 flex items-center gap-2 border shadow-sm clip-chamfer-xs"
                style={{ borderColor: `${p.color}66` }}
              >
                <Zap className="w-3 h-3" style={{ color: p.color }} />
                <span className="text-[11px] font-mono font-bold" style={{ color: p.color }}>
                  {p.name}
                </span>
                <div className="w-10 h-1 bg-slate-900 rounded-none overflow-hidden border border-slate-800">
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: p.color,
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
