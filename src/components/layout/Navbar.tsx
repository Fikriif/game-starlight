"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Trophy, BookOpen, User, Menu, X, Play } from "lucide-react";
import SoundToggle from "../ui/SoundToggle";
import { usePlayerProfile } from "@/lib/storage/guestProfile";

export default function Navbar() {
  const pathname = usePathname();
  const profile = usePlayerProfile();
  const displayName = profile.displayName;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Play", href: "/play", icon: Play },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "How to Play", href: "/how-to-play", icon: BookOpen },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/25 bg-[#02040a]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 clip-chamfer-xs border border-cyan-400/60 bg-[#060c22] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)] group-hover:border-cyan-300 transition-colors">
            <Crosshair className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-black tracking-wider text-white text-base sm:text-lg">
              STARFALL
            </span>
            <span className="font-bold tracking-widest text-[9px] uppercase px-1.5 py-0.5 clip-chamfer-xs bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              ARCADE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 clip-chamfer-xs text-xs uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 glow-cyan-sm font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Sound Toggle & Pilot Badge */}
        <div className="flex items-center gap-2.5">
          <SoundToggle />

          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 clip-chamfer-xs bg-[#050a1c] border border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-slate-300 transition-all"
            title="Pilot Profile"
          >
            <span className="w-1.5 h-1.5 rounded-none bg-cyan-400 animate-pulse rotate-45" />
            <span className="truncate max-w-[110px] text-slate-200">{displayName}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white clip-chamfer-xs hover:bg-slate-800/60"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-500/25 bg-[#030714]/98 px-4 pt-3 pb-4 space-y-1 font-mono">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 clip-chamfer-xs text-xs uppercase tracking-wider font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-2 text-xs text-slate-400 font-mono">
            <span>PILOT:</span>
            <span className="text-cyan-300">{displayName}</span>
          </div>
        </div>
      )}
    </header>
  );
}
