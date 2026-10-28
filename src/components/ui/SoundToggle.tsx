"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/game/audio/SoundManager";

function subscribeSound(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("starfall_sound_changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("starfall_sound_changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function SoundToggle({ className = "" }: { className?: string }) {
  const isMuted = useSyncExternalStore(
    subscribeSound,
    () => soundManager.getMuted(),
    () => false
  );

  const handleToggle = () => {
    const muted = soundManager.toggleMute();
    if (!muted) {
      soundManager.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-1.5 sm:p-2 clip-chamfer-xs bg-[#050a1c] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer ${className}`}
      title={isMuted ? "Unmute Sound" : "Mute Sound"}
      aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-amber-400" />
      ) : (
        <Volume2 className="w-4 h-4 text-cyan-400" />
      )}
    </button>
  );
}
