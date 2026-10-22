import Link from "next/link";
import { Shield, Sparkles, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-cyan-500/10 bg-[#03050c]/90 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-slate-200">STARFALL BREAKOUT</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v1.0.0 ARCADE
            </span>
          </div>
          <p className="text-slate-500 text-center md:text-left">
            Skill-based arcade survival. Blast meteors, collect cosmic power-ups, conquer the storm.
          </p>
        </div>

        {/* Center: Controls Quick Hint */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>[W/A/S/D] or [ARROWS] to Maneuver</span>
          <span className="text-slate-600">|</span>
          <span>[P] or [ESC] to Pause</span>
        </div>

        {/* Right: Security & Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Cheat Verified</span>
          </div>
          <Link href="/how-to-play" className="hover:text-cyan-300 transition-colors">
            Controls & Guide
          </Link>
          <Link href="/leaderboard" className="hover:text-cyan-300 transition-colors">
            Leaderboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
