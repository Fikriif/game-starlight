"use client";

import Link from "next/link";
import {
  Play,
  Trophy,
  BookOpen,
  User,
  Shield,
  Zap,
  Target,
  Crosshair,
  Flame,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import { usePlayerProfile } from "@/lib/storage/guestProfile";
import { soundManager } from "@/game/audio/SoundManager";

export default function HomePage() {
  const profile = usePlayerProfile();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#02040a] font-mono arcade-grid selection:bg-cyan-400 selection:text-black">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col items-center justify-center w-full">
        {/* Terminal Header & Arcade Hero Block */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060e22] border border-cyan-500/35 text-cyan-300 text-xs tracking-widest uppercase corner-bracket">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SORTIE READINESS // SECTOR 07 INTERCEPT</span>
          </div>

          {/* Arcade Title */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase text-glow-cyan leading-none">
              STARFALL
            </h1>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-widest text-cyan-400 uppercase flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 sm:w-16 bg-cyan-500/40" />
              <span>BREAKOUT</span>
              <span className="h-[1px] w-8 sm:w-16 bg-cyan-500/40" />
            </div>
          </div>

          {/* Microcopy - Natural, direct indie arcade tone */}
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-sans">
            High-speed ballistic flight survival. Manual directional blasters, escalating cosmic debris, and verified orbital rankings.
          </p>

          {/* Pilot Telemetry Pill (If player has profile/high score) */}
          {profile && (
            <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-[#060d22] border border-slate-800 text-xs text-slate-300 clip-chamfer-xs">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 text-[11px]">CALLSIGN:</span>
                <strong className="text-white">{profile.displayName}</strong>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 text-[11px]">BEST SCORE:</span>
                <strong className="text-amber-300">{profile.personalBestScore.toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* Primary Arcade Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/play"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-8 py-3.5 btn-arcade-cyan text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.3)] clip-chamfer-sm"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>LAUNCH SORTIE</span>
            </Link>

            <Link
              href="/how-to-play"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-6 py-3.5 btn-arcade-dark text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Flight Manual</span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-6 py-3.5 btn-arcade-dark text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Rankings</span>
            </Link>
          </div>
        </div>

        {/* Asymmetrical Flight Terminal & Threat Briefing */}
        <div className="mt-12 sm:mt-16 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Block: Flight Directive & Ballistics (7 cols) */}
          <div className="lg:col-span-7 hud-panel-strong p-5 sm:p-6 border border-cyan-500/25 corner-bracket flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
                    FLIGHT SPECIFICATIONS // MK-IV INTERCEPTOR
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 tracking-wider">REV 2.4</span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#050a1a] border border-slate-800/80 space-y-1 clip-chamfer-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>BALLISTIC AIMING</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                    Zero auto-lock or homing. Weapons track strictly to cursor crosshairs with physics-based projectile travel.
                  </p>
                </div>

                <div className="p-3 bg-[#050a1a] border border-slate-800/80 space-y-1 clip-chamfer-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>STREAK MULTIPLIERS</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                    Chaining rapid meteor strikes within 2.8s builds score multipliers up to 3.0x across 4 combat tiers.
                  </p>
                </div>

                <div className="p-3 bg-[#050a1a] border border-slate-800/80 space-y-1 clip-chamfer-xs">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>3-CELL HULL ARMOR</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                    Three segmented integrity cells with temporary phase-shift invulnerability upon sustaining impact.
                  </p>
                </div>

                <div className="p-3 bg-[#050a1a] border border-slate-800/80 space-y-1 clip-chamfer-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>TACTICAL CANISTERS</span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                    Drifting quantum canisters deliver Rapid Fire, Tri-Spreads, Force Shields, Hull Repairs, and Nova Bursts.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>Mouse / Touch Aim Enabled</span>
              </span>
              <span className="text-slate-500">WASD / Arrow Keys Maneuver</span>
            </div>
          </div>

          {/* Right Block: Threat Analysis Ticker (5 cols) */}
          <div className="lg:col-span-5 hud-panel p-5 sm:p-6 border border-slate-800 corner-bracket flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                    HAZARD CLASSIFICATION
                  </span>
                </div>
                <span className="text-[10px] text-amber-500/80 uppercase">DEBRIS RADAR</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {/* Standard */}
                <div className="flex items-center justify-between p-2.5 bg-[#040816] border border-slate-800/70 clip-chamfer-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-none bg-orange-500 rotate-45 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Standard Asteroid</div>
                      <div className="text-[10px] text-slate-500">Basalt core • 2 Hits</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">20 PTS</span>
                </div>

                {/* Speed Shard */}
                <div className="flex items-center justify-between p-2.5 bg-[#040816] border border-cyan-500/25 clip-chamfer-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-none bg-cyan-400 rotate-45 shrink-0 shadow-[0_0_8px_#00f0ff]" />
                    <div>
                      <div className="font-bold text-cyan-300 text-xs">Speed Shard</div>
                      <div className="text-[10px] text-cyan-500/80">Ion charge burst • 1 Hit</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold">35 PTS</span>
                </div>

                {/* Heavy Dense */}
                <div className="flex items-center justify-between p-2.5 bg-[#040816] border border-purple-500/25 clip-chamfer-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-none bg-purple-500 rotate-45 shrink-0" />
                    <div>
                      <div className="font-bold text-purple-300 text-xs">Heavy Meteorite</div>
                      <div className="text-[10px] text-purple-400/80">Fissure cracks • 6 Hits</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-purple-400 font-mono font-bold">75 PTS</span>
                </div>

                {/* Splitting Geode */}
                <div className="flex items-center justify-between p-2.5 bg-[#040816] border border-emerald-500/25 clip-chamfer-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-none bg-emerald-400 rotate-45 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-300 text-xs">Splitting Geode</div>
                      <div className="text-[10px] text-emerald-400/80">Fractures into twin shards</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">40 PTS</span>
                </div>

                {/* Explosive Magma */}
                <div className="flex items-center justify-between p-2.5 bg-[#040816] border border-rose-500/35 clip-chamfer-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-none bg-rose-500 rotate-45 shrink-0 animate-ping" />
                    <div>
                      <div className="font-bold text-rose-300 text-xs">Volatile Magma</div>
                      <div className="text-[10px] text-rose-400/80">Unstable countdown blast</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-400 font-mono font-bold">50 PTS</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>THREAT LEVEL: ESCALATING</span>
              <span className="text-amber-400 font-bold">5 COMBAT WAVES</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
