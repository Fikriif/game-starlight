"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trophy,
  Medal,
  RotateCw,
  Search,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";
import { LeaderboardEntry } from "@/lib/supabase/types";
import { usePlayerProfile } from "@/lib/storage/guestProfile";

export default function LeaderboardTable() {
  const [timeframe, setTimeframe] = useState<"all-time" | "weekly" | "today">("all-time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState<string>("local");
  const profile = usePlayerProfile();
  const playerDisplayName = profile.displayName;

  const fetchLeaderboard = useCallback(async () => {
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
  }, [timeframe]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=50`);
        const data = await res.json();
        if (!ignore && data.success && data.entries) {
          setEntries(data.entries);
          setSource(data.source || "local");
        }
      } catch (err) {
        if (!ignore) console.warn("Failed to load leaderboard:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
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
    <div className="w-full max-w-5xl mx-auto space-y-4 font-mono">
      {/* Controls Bar: Timeframe Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Timeframe Segmented Control */}
        <div className="hud-panel p-1 flex items-center gap-1 w-full sm:w-auto border border-slate-800">
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
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer clip-chamfer-xs ${
                timeframe === tab.id
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 glow-cyan-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search callsign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#050a1a] border border-slate-800 focus:border-cyan-500/60 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all clip-chamfer-xs"
            />
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2 bg-[#050a1a] border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50 clip-chamfer-xs"
            title="Refresh Leaderboard"
            aria-label="Refresh Leaderboard"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Database Mode Badge */}
      <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            REGISTRY:{" "}
            <strong className="text-slate-200 uppercase">
              {source === "supabase" ? "Supabase Cloud Database" : "Arcade High Score Engine"}
            </strong>
          </span>
        </div>
        <span>QUALIFIED SORTIES: {filteredEntries.length}</span>
      </div>

      {/* Leaderboard Table Card */}
      <div className="hud-panel-strong border border-cyan-500/25 overflow-hidden shadow-2xl corner-bracket">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#040816] text-[10px] tracking-wider text-slate-400 uppercase">
                <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Pilot Callsign</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Survival</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Wave</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Hazards</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading orbital telemetry...</span>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Trophy className="w-7 h-7 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-300">No qualifying sorties found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? "Try a different callsign query" : "Be the first pilot to register a high score in this timeframe!"}
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
                          : row.rank === 1
                          ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                          : "hover:bg-slate-900/40"
                      }`}
                    >
                      {/* Rank Medal / Number */}
                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold">
                        {row.rank === 1 ? (
                          <div className="w-6 h-6 mx-auto bg-amber-500/20 text-amber-300 border border-amber-500/60 flex items-center justify-center clip-chamfer-xs">
                            <Medal className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                        ) : row.rank === 2 ? (
                          <div className="w-6 h-6 mx-auto bg-slate-300/20 text-slate-200 border border-slate-300/60 flex items-center justify-center clip-chamfer-xs">
                            <Medal className="w-3.5 h-3.5 fill-slate-300" />
                          </div>
                        ) : row.rank === 3 ? (
                          <div className="w-6 h-6 mx-auto bg-amber-700/20 text-amber-400 border border-amber-700/60 flex items-center justify-center clip-chamfer-xs">
                            <Medal className="w-3.5 h-3.5 fill-amber-600" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">#{row.rank}</span>
                        )}
                      </td>

                      {/* Callsign */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#060b1e] border border-slate-700 flex items-center justify-center shrink-0 clip-chamfer-xs">
                            <User className="w-3 h-3 text-cyan-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{row.display_name}</span>
                              {isCurrentPlayer && (
                                <span className="text-[9px] px-1 py-0.2 bg-cyan-500/25 text-cyan-300 border border-cyan-400 font-mono font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400/80">
                              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-right font-black text-white text-sm sm:text-base text-glow-cyan">
                        {row.score.toLocaleString()}
                      </td>

                      {/* Survival Duration */}
                      <td className="py-3.5 px-4 text-right text-slate-300 hidden sm:table-cell font-mono">
                        {formatTime(row.survival_seconds)}
                      </td>

                      {/* Highest Wave */}
                      <td className="py-3.5 px-4 text-center text-cyan-300 font-bold hidden md:table-cell font-mono">
                        Wave {row.highest_wave}
                      </td>

                      {/* Meteors Destroyed */}
                      <td className="py-3.5 px-4 text-right text-slate-300 hidden lg:table-cell font-mono">
                        {row.meteors_destroyed}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-slate-500 hidden sm:table-cell font-mono">
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
