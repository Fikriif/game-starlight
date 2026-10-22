"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import {
  User,
  Trophy,
  Clock,
  Crosshair,
  Flame,
  Save,
  Check,
  Play,
  History,
  Shield,
} from "lucide-react";
import Link from "next/link";
import {
  getPlayerProfile,
  savePlayerProfile,
  LocalPlayerProfile,
} from "@/lib/storage/guestProfile";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProfilePage() {
  const [profile, setProfile] = useState<LocalPlayerProfile | null>(null);
  const [callsign, setCallsign] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const p = getPlayerProfile();
    setProfile(p);
    setCallsign(p.displayName);
  }, []);

  const handleSaveCallsign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !callsign.trim()) return;

    soundManager.playClick();
    const updated = { ...profile, displayName: callsign.trim().slice(0, 24) };
    savePlayerProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050713]">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#070b1e] rounded-[14px] flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {profile?.displayName || "Pilot"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                ID: {profile?.guestId || "Connecting..."}
              </p>
            </div>
          </div>

          <Link
            href="/play"
            onClick={() => soundManager.playClick()}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Next Mission
          </Link>
        </div>

        {/* Change Callsign Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Pilot Identification (Callsign)
          </h2>
          <form onSubmit={handleSaveCallsign} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={callsign}
              maxLength={24}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="Enter your pilot callsign..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 text-white font-mono text-sm focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Callsign</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Career Statistics Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Career Flight Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-amber-500/20">
              <div className="text-[11px] font-mono text-amber-400 uppercase">PERSONAL BEST</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                {profile?.personalBestScore.toLocaleString() || 0}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-blue-500/20">
              <div className="text-[11px] font-mono text-blue-400 uppercase">LONGEST SURVIVAL</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                {formatTime(profile?.bestSurvivalSeconds || 0)}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-purple-500/20">
              <div className="text-[11px] font-mono text-purple-400 uppercase">TOTAL SORTIES</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                {profile?.totalGamesPlayed || 0}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-rose-500/20">
              <div className="text-[11px] font-mono text-rose-400 uppercase">METEORS HIT</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                {profile?.totalMeteorsDestroyed.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sorties Log */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Recent Flight Telemetry
          </h2>

          {!profile?.recentRuns || profile.recentRuns.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-mono">
              No previous combat flights recorded. Launch a mission to log telemetry.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Survival</th>
                    <th className="py-2.5 px-3">Wave</th>
                    <th className="py-2.5 px-3 text-right">Meteors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profile.recentRuns.map((run, idx) => (
                    <tr key={run.runId || idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400">
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
