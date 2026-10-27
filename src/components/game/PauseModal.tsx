"use client";

import { Play, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import SoundToggle from "../ui/SoundToggle";
import { soundManager } from "@/game/audio/SoundManager";

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export default function PauseModal({ onResume, onRestart }: PauseModalProps) {
  return (
    <div className="absolute inset-0 z-30 bg-[#050713]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-sm w-full p-6 sm:p-8 rounded-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.25)] text-center flex flex-col items-center">
        {/* Title */}
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
          <Play className="w-6 h-6 text-cyan-400 fill-cyan-400" />
        </div>
        <h2 className="text-2xl font-black tracking-widest text-white text-glow-cyan">
          MISSION PAUSED
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          System telemetry suspended. Ready to resume.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            Resume Flight [P]
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Restart Mission
          </button>

          <Link
            href="/"
            onClick={() => soundManager.playClick()}
            className="w-full py-3 px-4 rounded-xl font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            Abort to Main Menu
          </Link>
        </div>

        {/* Audio control at bottom */}
        <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
          <span>Audio Output</span>
          <SoundToggle />
        </div>
      </div>
    </div>
  );
}
