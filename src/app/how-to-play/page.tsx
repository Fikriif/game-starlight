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
  Crosshair,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { POWER_UP_CONFIGS } from "@/game/config/constants";

export const metadata: Metadata = {
  title: "Flight Manual & How to Play | Starfall Breakout",
  description:
    "Master starship controls, combat mechanics, enemy variations, and tactical power-ups in Starfall Breakout.",
};

const POWERUP_ICONS: Record<string, React.ElementType> = {
  rapid_fire: Zap,
  spread_shot: Target,
  energy_shield: Shield,
  repair_core: Heart,
  score_multiplier: Flame,
  nova_burst: Sparkles,
};

export default function HowToPlayPage() {
  const powerUpsList = Object.values(POWER_UP_CONFIGS);

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] font-mono arcade-grid selection:bg-cyan-400 selection:text-black">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060e22] border border-cyan-500/35 text-cyan-300 text-xs corner-bracket">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TACTICAL COMBAT DOSSIER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase text-glow-cyan">
            FLIGHT MANUAL
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans">
            Combat directives, navigation inputs, cosmic hazard analysis, and tactical power-up specifications for Sector 07 sorties.
          </p>
        </div>

        {/* Section 1: Controls (Desktop & Mobile) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <span>01 // NAVIGATION & DIRECTIONAL CONTROLS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop */}
            <div className="hud-panel p-5 border border-cyan-500/25 space-y-3 corner-bracket">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                <Keyboard className="w-4 h-4" />
                <span>Desktop (Mouse & Keyboard)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Maneuver Starship:</span>
                  <strong className="text-cyan-300">[W / A / S / D] or [Arrows]</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Aim Spaceship:</span>
                  <strong className="text-cyan-400">[Mouse Cursor]</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Fire Directional Blasters:</span>
                  <strong className="text-white">[Left Click] or [Space]</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Pause Sortie:</span>
                  <strong className="text-amber-300">[P] or [Escape]</strong>
                </li>
              </ul>
            </div>

            {/* Mobile */}
            <div className="hud-panel p-5 border border-slate-800 space-y-3 corner-bracket">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Mobile (Twin-Stick Touch)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Left Virtual Stick:</span>
                  <strong className="text-cyan-300">Move & Dodge</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Right Virtual Stick:</span>
                  <strong className="text-amber-300">Aim & Fire Blasters</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Auto-Fire Option:</span>
                  <strong className="text-white">HUD Toggle Available</strong>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#050a1a] border border-slate-800 clip-chamfer-xs">
                  <span className="text-slate-400">Pause Flight:</span>
                  <strong className="text-slate-300">Tap Top Right Visor</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Core Combat Systems */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>02 // COMBAT MECHANICS & 3-LIFE HULL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hud-card p-4.5 border border-slate-800 space-y-2 clip-chamfer-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>3 Hull Armor Cells</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Each sortie grants exactly 3 hull cells. Impacts consume 1 life and activate 2.2 seconds of phase invulnerability to prevent chain collision damage.
              </p>
            </div>

            <div className="hud-card p-4.5 border border-slate-800 space-y-2 clip-chamfer-xs">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>Directional Ballistics</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Projectiles travel strictly along the starship muzzle heading. Zero homing assist. Lead shots against fast hazards while executing evasive maneuvers.
              </p>
            </div>

            <div className="hud-card p-4.5 border border-slate-800 space-y-2 clip-chamfer-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>Streak Combo Multiplier</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Chain hazard destructions within 2.8 seconds to build your streak. Multipliers scale from 1.5x up to 3.0x Ultra Combo, multiplying all points earned.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Cosmic Hazards (6 Meteor Variants) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>03 // HAZARD CLASSIFICATIONS (6 VARIANTS)</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline-block">SECTOR 07 RADAR</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Standard Meteor */}
            <div className="hud-panel p-4 border border-orange-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-orange-300 text-xs">Standard Basalt</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-950/60 text-orange-300 border border-orange-500/30">
                  20 PTS • 2 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Basalt rock with glowing fiery fissures. Moves at moderate, predictable straight velocity. Baseline combat hazard.
              </p>
              <div className="p-2 bg-[#050a1a] border border-orange-500/20 text-[11px] text-orange-200/90 font-mono">
                <span className="font-bold text-orange-400">Directive:</span> Predictable vector. Primary source for point streaks and quantum drops.
              </div>
            </div>

            {/* 2. Speed Meteor */}
            <div className="hud-panel p-4 border border-cyan-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-cyan-300 text-xs">Speed Interceptor</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  35 PTS • 1 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Leaves an ionized cyan trail. Telegraphs a converging reticle and forward chevron before supersonic speed bursts!
              </p>
              <div className="p-2 bg-[#050a1a] border border-cyan-500/20 text-[11px] text-cyan-200/90 font-mono">
                <span className="font-bold text-cyan-400">Directive:</span> Watch the telegraph reticle. Lead your crosshairs ahead of its trajectory.
              </div>
            </div>

            {/* 3. Heavy Titan */}
            <div className="hud-panel p-4 border border-purple-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-purple-300 text-xs">Heavy Titan</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  75 PTS • 6 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Massive slow-moving dreadnought. Requires 6 blaster hits. Displays visible glowing fracture fissures that widen as HP drops.
              </p>
              <div className="p-2 bg-[#050a1a] border border-purple-500/20 text-[11px] text-purple-200/90 font-mono">
                <span className="font-bold text-purple-400">Directive:</span> Focus sustained fire. Widening cracks indicate impending structural failure.
              </div>
            </div>

            {/* 4. Splitting Meteor */}
            <div className="hud-panel p-4 border border-emerald-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-300 text-xs">Splitting Geode</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  40 PTS • 3 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Emerald crystalline cluster. Upon destruction, shatters into 2 independent crystal fragments (15 PTS each) on divergent headings.
              </p>
              <div className="p-2 bg-[#050a1a] border border-emerald-500/20 text-[11px] text-emerald-200/90 font-mono">
                <span className="font-bold text-emerald-400">Directive:</span> Maintain evasive distance before shattering to clear both shards.
              </div>
            </div>

            {/* 5. Explosive Meteor */}
            <div className="hud-panel p-4 border border-red-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-red-400 text-xs">Explosive Magma</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-red-950/60 text-red-400 border border-red-500/30">
                  50 PTS • 2 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Volatile core with an active countdown fuse ring. Triggers a 115px blast shockwave damaging hulls and igniting chain reactions.
              </p>
              <div className="p-2 bg-[#050a1a] border border-red-500/20 text-[11px] text-red-200/90 font-mono">
                <span className="font-bold text-red-400">Directive:</span> Stay outside the dashed blast ring. Detonations damage other meteors safely!
              </div>
            </div>

            {/* 6. Drifting Meteor */}
            <div className="hud-panel p-4 border border-indigo-500/30 space-y-2.5 clip-chamfer-xs">
              <div className="flex items-center justify-between">
                <strong className="text-indigo-300 text-xs">Drifting Comet</strong>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  35 PTS • 2 HP
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Leaves a celestial indigo particle wake while executing smooth, curved sinusoidal steering maneuvers across the flight arena.
              </p>
              <div className="p-2 bg-[#050a1a] border border-indigo-500/20 text-[11px] text-indigo-200/90 font-mono">
                <span className="font-bold text-indigo-400">Directive:</span> Account for lateral wave oscillations rather than assuming straight headings.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 6 Tactical Power-Ups */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>04 // TACTICAL POWER-UP CANISTERS</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Destroying meteors has an 18-22% probability to drop tactical quantum canisters.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerUpsList.map((p) => {
              const IconComp = POWERUP_ICONS[p.type] || Zap;
              return (
                <div
                  key={p.type}
                  className="hud-panel p-4 border space-y-2 clip-chamfer-xs"
                  style={{ borderColor: `${p.color}40` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 flex items-center justify-center clip-chamfer-xs"
                        style={{ backgroundColor: `${p.color}20` }}
                      >
                        <IconComp className="w-3.5 h-3.5" style={{ color: p.color }} />
                      </div>
                      <strong className="text-xs text-white uppercase">{p.name}</strong>
                    </div>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5"
                      style={{ backgroundColor: `${p.color}20`, color: p.color }}
                    >
                      {p.duration > 0 ? `${p.duration}s` : "Instant"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">{p.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-4 text-center">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-8 py-3.5 btn-arcade-cyan text-sm cursor-pointer tracking-wider clip-chamfer-sm"
          >
            <span>LAUNCH MISSION NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
