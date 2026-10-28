import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CosmicBackground from "@/components/layout/CosmicBackground";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Galactic Leaderboard | Starfall Breakout",
  description:
    "View top pilots, highest survival scores, and competitive rankings on the Starfall Breakout global leaderboard.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] font-mono arcade-grid selection:bg-cyan-400 selection:text-black">
      <CosmicBackground />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#060e22] border border-cyan-500/35 text-cyan-300 text-xs corner-bracket">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>GLOBAL PILOT REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase text-glow-cyan">
            ORBITAL RANKINGS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-lg mx-auto">
            Verified flight telemetry from Sector 07 sorties. Ranked by authenticated score, survival duration, and wave escalation.
          </p>
        </div>

        {/* Table */}
        <LeaderboardTable />
      </main>

      <Footer />
    </div>
  );
}
