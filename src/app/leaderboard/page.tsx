import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Trophy, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Galactic Leaderboard | Starfall Breakout",
  description:
    "View top pilots, highest survival scores, and competitive rankings on the Starfall Breakout global leaderboard.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050713]">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>GLOBAL PILOT REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            GALACTIC{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 text-glow-cyan">
              LEADERBOARD
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Verified scores from ace pilots worldwide. Ranked by highest score, survival time, and mission timestamp.
          </p>
        </div>

        {/* Table */}
        <LeaderboardTable />
      </main>

      <Footer />
    </div>
  );
}
