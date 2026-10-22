"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Trophy,
  BookOpen,
  User,
  Shield,
  Zap,
  Target,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import { getPlayerProfile, LocalPlayerProfile } from "@/lib/storage/guestProfile";
import { soundManager } from "@/game/audio/SoundManager";

export default function HomePage() {
  const [profile, setProfile] = useState<LocalPlayerProfile | null>(null);

  useEffect(() => {
    setProfile(getPlayerProfile());
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050713]">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Cosmic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SECTOR 7 COSMIC CRISIS DETECTED</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase">
            STARFALL{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 text-glow-cyan">
              BREAKOUT
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
            Maneuver your high-velocity starship through relentless cosmic meteor storms. Deploy auto-targeting plasma blasters, capture tactical power-ups, and fight for glory on the global leaderboard.
          </p>

          {/* Pilot Quick Card (If available) */}
          {profile && (
            <div className="inline-flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs sm:text-sm font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilot: <strong className="text-white">{profile.displayName}</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Best: <strong className="text-amber-300">{profile.personalBestScore.toLocaleString()}</strong></span>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/play"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-black shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              LAUNCH MISSION NOW
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-base bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              Leaderboard
            </Link>

            <Link
              href="/how-to-play"
              onClick={() => soundManager.playClick()}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-medium text-base bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-purple-400" />
              Flight Manual
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Smart Auto-Blasters</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Targeting computers automatically track and fire upon the closest incoming hazards. Focus your maneuvers on dodging, weaving, and positioning.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">6 Tactical Power-Ups</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trigger Rapid Fire, Tri-Beam Spread Shots, Deflector Shields, Hull Repairs, 2X Score Multipliers, and screen-clearing Nova Bursts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">3-Life Survival & Ranks</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every sortie gives 3 hull integrity lives with invulnerability frames. Survive escalating waves and secure your spot on the online leaderboard.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
