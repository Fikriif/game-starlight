import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import {
  BookOpen,
  Keyboard,
  Smartphone,
  Target,
  Shield,
  Zap,
  Heart,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { POWER_UP_CONFIGS } from "@/game/config/constants";

export const metadata: Metadata = {
  title: "Flight Manual & How to Play | Starfall Breakout",
  description:
    "Master starship controls, combat mechanics, enemy variations, and tactical power-ups in Starfall Breakout.",
};

export default function HowToPlayPage() {
  const powerUpsList = Object.values(POWER_UP_CONFIGS);

  return (
    <div className="min-h-screen flex flex-col bg-[#050713]">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PILOT BRIEFING PROTOCOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            FLIGHT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-rose-400 text-glow-cyan">
              MANUAL
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Essential combat directives, controls, threat analysis, and power-up telemetry to survive Sector 7.
          </p>
        </div>

        {/* Section 1: Controls (Desktop & Mobile) */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Keyboard className="w-6 h-6 text-cyan-400" />
            1. Navigation & Directional Aiming Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Keyboard className="w-4 h-4" />
                <span>Desktop (Mouse & Keyboard)</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-mono">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Maneuver Starship:</span>
                  <strong className="text-cyan-300">[W / A / S / D] or [Arrows]</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Aim Spaceship:</span>
                  <strong className="text-cyan-400">[Mouse Cursor]</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Fire Directional Blaster:</span>
                  <strong className="text-emerald-400">[Left Click] or [Space]</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Pause Flight:</span>
                  <strong className="text-amber-300">[P] or [Escape]</strong>
                </li>
              </ul>
            </div>

            {/* Mobile */}
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Mobile (Twin-Stick Touch)</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-mono">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Left Virtual Joystick:</span>
                  <strong className="text-cyan-300">Move & Dodge</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Right Virtual Joystick:</span>
                  <strong className="text-rose-400">Aim & Fire Blasters</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Auto-Fire Option:</span>
                  <strong className="text-emerald-400">HUD Toggle Available</strong>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Pause / Settings:</span>
                  <strong className="text-amber-300">Tap Top Right HUD</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Core Gameplay Mechanics */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-purple-400" />
            2. Skill-Based Directional Combat & 3-Life Armor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Heart className="w-5 h-5 fill-rose-500" />
                <span>3 Hull Lives</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You enter combat with exactly 3 lives. Collisions reduce 1 life and grant 2.2 seconds of phase invulnerability to prevent chain damage.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                <Target className="w-5 h-5" />
                <span>Skill Directional Aim</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Projectiles travel straight along the starship muzzle. Zero auto-homing. Lead your shots against fast-moving meteors while executing evasive maneuvers.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Zap className="w-5 h-5" />
                <span>Wave Progression</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Waves advance every 25 seconds. Later waves introduce higher hazard density, faster meteors, and erratic pulsars.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Meteor Classifications */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-rose-400" />
            3. Cosmic Hazard Classifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 text-sm">Small Meteor</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">10 PTS</span>
              </div>
              <p className="text-xs text-slate-400">Fast and agile. 1 Hit to destroy. Ideal for quick target clearing.</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-sm">Medium Meteor</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">25 PTS</span>
              </div>
              <p className="text-xs text-slate-400">Requires 3 Hits. On destruction, splits into 2 small meteor fragments!</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300 text-sm">Large Titan</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">50 PTS</span>
              </div>
              <p className="text-xs text-slate-400">Massive durability (6 Hits). Upon obliteration, fractures into 2 medium meteors.</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-sm">Cosmic Pulsar</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">40 PTS</span>
              </div>
              <p className="text-xs text-slate-400">High speed with sinusoidal wobble. Dangerous trajectory across the arena.</p>
            </div>
          </div>
        </section>

        {/* Section 4: 6 Tactical Power-Ups */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            4. Tactical Power-Up Drops
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Destroying meteors has an 18-22% chance to drop collectible quantum canisters.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerUpsList.map((p) => (
              <div
                key={p.type}
                className="glass-panel p-4 rounded-xl border space-y-2"
                style={{ borderColor: `${p.color}40` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <strong className="text-sm text-white">{p.name}</strong>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${p.color}20`, color: p.color }}
                  >
                    {p.duration > 0 ? `${p.duration}s` : "Instant"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Button to Launch Game */}
        <div className="pt-6 text-center">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
          >
            <span>Proceed to Flight Deck</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
