"use client";

import { Play, RotateCcw, Home, Crosshair } from "lucide-react";
import Link from "next/link";
import SoundToggle from "../ui/SoundToggle";
import { soundManager } from "@/game/audio/SoundManager";

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export default function PauseModal({ onResume, onRestart }: PauseModalProps) {
  return (
    <div className="absolute inset-0 z-30 bg-[#02040a]/88 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="hud-panel-strong max-w-sm w-full p-6 sm:p-7 border border-cyan-500/40 shadow-[0_0_40px_rgba(0,0,0,0.95)] text-center flex flex-col items-center corner-bracket">
        {/* Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#060e22] text-cyan-400 border border-cyan-500/40 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>FLIGHT SUSPENDED</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white text-glow-cyan uppercase mb-1">
          TACTICAL STANDBY
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-5">
          Avionics held in stasis. Ready to engage.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 btn-arcade-cyan text-sm flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME FLIGHT [P]</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 btn-arcade-dark text-xs flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>RESTART SORTIE</span>
          </button>

          <Link
            href="/"
            onClick={() => soundManager.playClick()}
            className="w-full py-2.5 px-4 btn-arcade-dark text-xs flex items-center justify-center gap-2 clip-chamfer-sm"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>ABORT TO HANGAR</span>
          </Link>
        </div>

        {/* Quick Controls Reminder */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>AIM: MOUSE</span>
          </div>
          <div className="flex items-center gap-2">
            <span>SOUND:</span>
            <SoundToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
