# 🚀 Starfall Breakout

A fast-paced, top-down cosmic arcade survival game built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **HTML5 Canvas**, and **Supabase**.

Pilot an aerospace-grade starship through relentless cosmic meteor storms, deploy automatic targeting blasters, collect tactical power-ups, and compete on the global verified leaderboard.

---

## 🌟 Key Features

### 🕹️ Core Gameplay Mechanics
- **Player Spaceship**: Controllable via keyboard (**WASD** / **Arrow Keys**) or mobile **Virtual Joystick** with smooth acceleration, inertia damping, and dual engine plasma trails.
- **3-Life Armor System**: Starts with 3 hull lives. Taking damage triggers 2.2 seconds of invulnerability with visual shield phasing.
- **Smart Auto-Targeting Blasters**: Firing computers auto-target the nearest incoming hazards or fire in the ship's facing vector.
- **Multi-Tier Hazard Classifications**:
  - **Small Meteor** (1 HP, 10 pts): Rapid and agile.
  - **Medium Meteor** (3 HP, 25 pts): Splits into 2 small meteor fragments upon destruction.
  - **Large Titan** (6 HP, 50 pts): Splits into 2 medium meteors upon destruction.
  - **Cosmic Pulsar** (2 HP, 40 pts): Moves with an erratic sinusoidal wobble at high speed.
- **6 Tactical Power-Ups**:
  1. ⚡ **Rapid Fire**: Doubles primary blaster firing rate (10s).
  2. 🔱 **Spread Shot**: Tri-beam spread laser volley (10s).
  3. 🛡️ **Energy Shield**: Absorbs one hit without losing life (12s).
  4. ❤️ **Repair Core**: Restores +1 starship life (up to max 3).
  5. ✖️2 **Score Multiplier**: Doubles all points earned (12s).
  6. 💥 **Nova Burst**: Triggers an expanding cosmic shockwave ring destroying all meteors on screen.
- **Wave & Difficulty Progression**: Hazard density, speed, and enemy tier variety scale smoothly every 25 seconds.
- **Procedural Audio Synthesizer**: Custom Web Audio API synthesizer for lasers, explosions, power-up chimes, shield deflections, and game over sequences with zero external asset dependencies or 404 errors.

---

## 🔒 Security & Anti-Cheat Validation
Scores are never blindly trusted from the browser:
- **Cryptographic Run Tokens**: Every run session initiates via `/api/runs/start`, returning an HMAC-SHA256 signed session token containing `runId` and server-issued `startTime`.
- **Elapsed Time Verification**: `/api/runs/submit` verifies that `survivalSeconds` matches the actual server time elapsed to prevent client speed-hacking.
- **Plausibility & Ceiling Checks**: Ensures reported score does not exceed the theoretical maximum yield for the meteors destroyed and time elapsed.
- **Idempotency**: Prevents replay attacks by tracking and rejecting duplicate submissions of the same `runId`.
- **Seamless Local Mode**: If Supabase credentials are not configured, the game operates in an offline local mode with in-memory persistence and local high score tracking.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (Custom cosmic arcade design system) |
| **Rendering** | HTML5 Canvas (Hardware accelerated, DPR scaling) |
| **Audio** | Web Audio API (Procedural sound synthesis) |
| **Database** | Supabase (PostgreSQL with Row Level Security) |
| **Icons** | Lucide React |
| **Testing** | Node.js Test Runner + `tsx` |

---

## 📁 Project Structure

```
game/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main Menu / Landing Page
│   │   ├── play/page.tsx          # Active Playable Game Arena
│   │   ├── leaderboard/page.tsx   # Global & Timeframe Leaderboard
│   │   ├── how-to-play/page.tsx   # Flight Manual & Controls Guide
│   │   ├── profile/page.tsx       # Pilot Profile & Callsign Manager
│   │   ├── layout.tsx             # Root Layout with Cosmic Metadata
│   │   ├── globals.css            # Custom Neon Glow & Arcade Utilities
│   │   └── api/
│   │       ├── runs/start/        # Session Token Generator (HMAC)
│   │       ├── runs/submit/       # Anti-Cheat Score Submission
│   │       └── leaderboard/       # Leaderboard Query Endpoint
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, CosmicBackground
│   │   ├── game/                  # GameCanvas, MobileControls, Modals
│   │   ├── hud/                   # GameHud, PowerUp Indicators
│   │   ├── leaderboard/           # LeaderboardTable
│   │   └── ui/                    # SoundToggle
│   ├── game/
│   │   ├── engine/GameEngine.ts   # Core Game Loop & Delta-Time Physics
│   │   ├── entities/              # Player, Meteor, Projectile, PowerUp, Particle, Text
│   │   ├── systems/               # CollisionSystem, SpawnSystem, ScoreSystem, DifficultySystem
│   │   ├── audio/SoundManager.ts  # Web Audio API Synthesizer
│   │   ├── config/constants.ts    # Game Tuning Parameters
│   │   └── types/game.ts          # Entity & System Type Definitions
│   └── lib/
│       ├── supabase/              # Client, Server, and Schema Types
│       ├── validation/            # HMAC Token & Anti-Cheat Validator
│       └── storage/               # Local High Score Store & Guest Profile
├── supabase/
│   └── migrations/
│       └── 20261022000000_initial_schema.sql # PostgreSQL Schema Migration
├── tests/
│   ├── collision.test.ts          # Collision Unit Tests
│   ├── scoring.test.ts            # Scoring & Multiplier Tests
│   └── validator.test.ts          # Run Token & Anti-Cheat Tests
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

If connecting to Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RUN_SIGNING_SECRET=your-secret-key-for-hmac
```
*(Note: Supabase credentials are optional. Without them, the game automatically uses the local arcade database mode).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Supabase Database Setup & Migrations

To apply the schema migrations to your Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase Dashboard.
3. Paste and run the contents of [`supabase/migrations/20261022000000_initial_schema.sql`](./supabase/migrations/20261022000000_initial_schema.sql).
4. This will create:
   - `profiles` table with automatic signup triggers.
   - `game_runs` table with constraints and ranking indexes.
   - Row Level Security (RLS) policies allowing public verified leaderboard reads and authorized inserts.
