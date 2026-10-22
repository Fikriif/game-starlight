"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Clock,
  Crosshair,
  Zap,
  RotateCw,
  Search,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";
import { LeaderboardEntry } from "@/lib/supabase/types";
import { getPlayerProfile } from "@/lib/storage/guestProfile";

export default function LeaderboardTable() {
  const [timeframe, setTimeframe] = useState<"all-time" | "weekly" | "today">("all-time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState<string>("local");
  const [playerDisplayName, setPlayerDisplayName] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=50`);
      const data = await res.json();
      if (data.success && data.entries) {
        setEntries(data.entries);
        setSource(data.source || "local");
      }
    } catch (err) {
      console.warn("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const profile = getPlayerProfile();
    setPlayerDisplayName(profile.displayName);
    fetchLeaderboard();
  }, [timeframe]);

  const filteredEntries = entries.filter((e) =>
    e.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Controls Bar: Timeframe Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Timeframe Segmented Control */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 w-full sm:w-auto">
          {(
            [
              { id: "all-time", label: "All-Time" },
              { id: "weekly", label: "This Week" },
              { id: "today", label: "Today" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                timeframe === tab.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pilot callsign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Leaderboard"
            aria-label="Refresh Leaderboard"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Database Mode Badge */}
      <div className="flex items-center justify-between text-xs px-2 font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            Storage:{" "}
            <strong className="text-slate-200 uppercase">
              {source === "supabase" ? "Supabase Cloud Database" : "Arcade High Score Engine"}
            </strong>
          </span>
        </div>
        <span>Total Records: {filteredEntries.length}</span>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/15 bg-slate-950/60 text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Pilot Callsign</th>
                <th className="py-3.5 px-4 text-right">Score</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">Survival</th>
                <th className="py-3.5 px-4 text-center hidden md:table-cell">Wave</th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">Meteors</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading orbital telemetry...</span>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Trophy className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-base font-semibold text-slate-300">No qualifying runs found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? "Try a different callsign filter" : "Be the first pilot to register a high score!"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => {
                  const isCurrentPlayer =
                    playerDisplayName &&
                    row.display_name.toLowerCase() === playerDisplayName.toLowerCase();

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isCurrentPlayer
                          ? "bg-cyan-500/10 hover:bg-cyan-500/15"
                          : "hover:bg-slate-900/40"
                      }`}
                    >
                      {/* Rank Medal / Number */}
                      <td className="py-4 px-4 sm:px-6 text-center font-mono font-bold">
                        {row.rank === 1 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                            <Medal className="w-4 h-4 fill-amber-400" />
                          </div>
                        ) : row.rank === 2 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/50 flex items-center justify-center">
                            <Medal className="w-4 h-4 fill-slate-300" />
                          </div>
                        ) : row.rank === 3 ? (
                          <div className="w-7 h-7 mx-auto rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/50 flex items-center justify-center">
                            <Medal className="w-4 h-4 fill-amber-600" />
                          </div>
                        ) : (
                          <span className="text-slate-400">#{row.rank}</span>
                        )}
                      </td>

                      {/* Callsign */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{row.display_name}</span>
                              {isCurrentPlayer && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4 text-right font-mono font-black text-white text-base text-glow-cyan">
                        {row.score.toLocaleString()}
                      </td>

                      {/* Survival Duration */}
                      <td className="py-4 px-4 text-right font-mono text-slate-300 hidden sm:table-cell">
                        {formatTime(row.survival_seconds)}
                      </td>

                      {/* Highest Wave */}
                      <td className="py-4 px-4 text-center font-mono text-purple-300 font-bold hidden md:table-cell">
                        Wave {row.highest_wave}
                      </td>

                      {/* Meteors Destroyed */}
                      <td className="py-4 px-4 text-right font-mono text-slate-300 hidden lg:table-cell">
                        {row.meteors_destroyed}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-500 hidden sm:table-cell">
                        {formatDate(row.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
