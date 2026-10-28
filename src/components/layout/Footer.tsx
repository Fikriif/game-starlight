import Link from "next/link";
import { Shield, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-cyan-500/20 bg-[#02040a]/95 text-slate-400 text-xs py-5 mt-auto font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-slate-200">STARFALL BREAKOUT</span>
            <span className="px-1.5 py-0.5 clip-chamfer-xs text-[9px] bg-cyan-950/70 text-cyan-300 border border-cyan-500/35">
              BUILD 1.0 // ARCADE
            </span>
          </div>
          <p className="text-slate-500 text-center md:text-left text-[11px]">
            Directional flight combat & tactical hazard defense.
          </p>
        </div>

        {/* Center: Controls Quick Hint */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] bg-[#050a1a] px-3 py-1.5 clip-chamfer-xs border border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>[W/A/S/D] MANEUVER</span>
          <span className="text-slate-700">|</span>
          <span>[MOUSE] AIM</span>
          <span className="text-slate-700">|</span>
          <span>[SPACE / CLICK] FIRE</span>
        </div>

        {/* Right: Security & Links */}
        <div className="flex items-center gap-5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Telemetry Verified</span>
          </div>
          <Link href="/how-to-play" className="hover:text-cyan-300 transition-colors">
            Flight Manual
          </Link>
          <Link href="/leaderboard" className="hover:text-cyan-300 transition-colors">
            Rankings
          </Link>
        </div>
      </div>
    </footer>
  );
}
