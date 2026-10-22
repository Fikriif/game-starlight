"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/game/audio/SoundManager";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.getMuted());
  }, []);

  const handleToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center justify-center cursor-pointer ${className}`}
      title={isMuted ? "Unmute Sound" : "Mute Sound"}
      aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
    >
      {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
    </button>
  );
}
