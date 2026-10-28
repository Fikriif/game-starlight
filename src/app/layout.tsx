import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starfall Breakout | Fast-Paced Cosmic Arcade Survival",
  description:
    "Pilot your starship, blast through relentless meteor swarms, collect tactical power-ups, and climb the global leaderboard in this high-intensity arcade survival game.",
  keywords: [
    "Starfall Breakout",
    "arcade game",
    "space survival",
    "browser game",
    "HTML5 canvas game",
    "retro arcade",
  ],
  authors: [{ name: "Starfall Breakout Team" }],
  openGraph: {
    title: "Starfall Breakout | Cosmic Arcade Survival",
    description: "Survive the cosmic storm. Destroy incoming meteors, gather power-ups, and reach the top of the leaderboard.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#02040a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[#02040a] text-[#f1f5f9] antialiased selection:bg-[#00f0ff] selection:text-black">
        {children}
      </body>
    </html>
  );
}
