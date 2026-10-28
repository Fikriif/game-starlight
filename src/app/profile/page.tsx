"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import {
  User,
  Trophy,
  Save,
  Check,
  Play,
  History,
  Shield,
} from "lucide-react";
import Link from "next/link";
import {
  usePlayerProfile,
  savePlayerProfile,
} from "@/lib/storage/guestProfile";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProfilePage() {
  const profile = usePlayerProfile();
  const [callsignInput, setCallsignInput] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const displayCallsign = callsignInput !== null ? callsignInput : profile.displayName;

  const handleSaveCallsign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayCallsign.trim()) return;

    soundManager.playClick();
    const updated = { ...profile, displayName: displayCallsign.trim().slice(0, 24) };
    savePlayerProfile(updated);
    setCallsignInput(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] font-mono arcade-grid selection:bg-cyan-400 selection:text-black">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-6">
        {/* Pilot Header Dossier */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 hud-panel-strong p-6 border border-cyan-500/30 corner-bracket">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#060b1e] border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)] clip-chamfer-xs">
              <User className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase text-glow-cyan">
                  {profile?.displayName || "Pilot"}
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 clip-chamfer-xs">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                IDENT: {profile?.guestId || "STANDBY"}
              </p>
            </div>
          </div>

          <Link
            href="/play"
            onClick={() => soundManager.playClick()}
            className="w-full sm:w-auto px-6 py-2.5 btn-arcade-cyan text-xs flex items-center justify-center gap-2 cursor-pointer clip-chamfer-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH SORTIE</span>
          </Link>
        </div>

        {/* Change Callsign Section */}
        <div className="hud-panel p-5 border border-slate-800 space-y-3 corner-bracket">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Pilot Identification (Callsign)
          </h2>
          <form onSubmit={handleSaveCallsign} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={displayCallsign}
              maxLength={24}
              onChange={(e) => setCallsignInput(e.target.value)}
              placeholder="Enter callsign..."
              className="flex-1 px-3.5 py-2 bg-[#050a1c] border border-slate-800 focus:border-cyan-400 text-white text-xs focus:outline-none transition-all clip-chamfer-xs"
            />
            <button
              type="submit"
              className="px-5 py-2 btn-arcade-dark text-xs flex items-center justify-center gap-1.5 cursor-pointer clip-chamfer-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">UPDATED</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SAVE CALLSIGN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Career Statistics Grid */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Career Telemetry Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="hud-panel p-3.5 border border-amber-500/30 clip-chamfer-xs">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">PERSONAL BEST</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5 text-glow-amber">
                {profile?.personalBestScore.toLocaleString() || 0}
              </div>
            </div>

            <div className="hud-panel p-3.5 border border-cyan-500/30 clip-chamfer-xs">
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider">MAX SURVIVAL</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {formatTime(profile?.bestSurvivalSeconds || 0)}
              </div>
            </div>

            <div className="hud-panel p-3.5 border border-purple-500/30 clip-chamfer-xs">
              <div className="text-[10px] text-purple-400 uppercase tracking-wider">TOTAL SORTIES</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {profile?.totalGamesPlayed || 0}
              </div>
            </div>

            <div className="hud-panel p-3.5 border border-rose-500/30 clip-chamfer-xs">
              <div className="text-[10px] text-rose-400 uppercase tracking-wider">HAZARDS HIT</div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {profile?.totalMeteorsDestroyed.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sorties Log */}
        <div className="hud-panel p-5 border border-slate-800 space-y-3 corner-bracket">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            Recent Sortie History
          </h2>

          {!profile?.recentRuns || profile.recentRuns.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-mono">
              No previous combat flights recorded. Launch a sortie to log telemetry.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-[#040816]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Survival</th>
                    <th className="py-2.5 px-3">Wave</th>
                    <th className="py-2.5 px-3 text-right">Hazards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profile.recentRuns.map((run, idx) => (
                    <tr key={run.runId || idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(run.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white text-glow-cyan">
                        {run.score.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        {formatTime(run.survivalSeconds)}
                      </td>
                      <td className="py-2.5 px-3 text-purple-300">
                        Wave {run.wave}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {run.meteorsDestroyed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
