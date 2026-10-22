import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import GameCanvas from "@/components/game/GameCanvas";

export const metadata: Metadata = {
  title: "Play Mission | Starfall Breakout",
  description: "Take control of the starship and survive the incoming cosmic meteor barrage.",
};

export default function PlayPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#050713] overflow-hidden select-none">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-0 sm:p-4 flex flex-col justify-center items-center overflow-hidden">
        <GameCanvas />
      </main>
    </div>
  );
}
