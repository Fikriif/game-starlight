"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Trophy, BookOpen, User, Menu, X, Play } from "lucide-react";
import SoundToggle from "../ui/SoundToggle";
import { getPlayerProfile } from "@/lib/storage/guestProfile";

export default function Navbar() {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("Pilot");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const profile = getPlayerProfile();
    setDisplayName(profile.displayName);
  }, []);

  const navLinks = [
    { name: "Play", href: "/play", icon: Play },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "How to Play", href: "/how-to-play", icon: BookOpen },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#050713]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all">
            <div className="w-full h-full bg-[#070b1e] rounded-[7px] flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 text-lg sm:text-xl">
              STARFALL
            </span>
            <span className="ml-1.5 font-bold tracking-widest text-xs uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              BREAKOUT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Sound Toggle & Callsign */}
        <div className="flex items-center gap-3">
          <SoundToggle />

          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[120px]">{displayName}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-500/20 bg-[#070b1e]/95 backdrop-blur-xl px-4 pt-3 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2 text-xs text-slate-400 font-mono">
            <span>Callsign:</span>
            <span className="text-cyan-300">{displayName}</span>
          </div>
        </div>
      )}
    </header>
  );
}
