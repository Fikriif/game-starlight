-- Starfall Breakout: Initial Schema Migration
-- Creates profiles, game_runs tables, ranking indexes, and RLS policies

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Game Runs Table
CREATE TABLE IF NOT EXISTS public.game_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_identifier TEXT,
  display_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  survival_seconds INTEGER NOT NULL CHECK (survival_seconds >= 0),
  meteors_destroyed INTEGER NOT NULL DEFAULT 0 CHECK (meteors_destroyed >= 0),
  highest_wave INTEGER NOT NULL DEFAULT 1 CHECK (highest_wave >= 1),
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'flagged', 'local')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for game_runs
ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;

-- Leaderboard ranking indexes
CREATE INDEX IF NOT EXISTS idx_game_runs_ranking 
  ON public.game_runs (score DESC, survival_seconds DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_game_runs_created_at 
  ON public.game_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_runs_user_id 
  ON public.game_runs (user_id);

-- Game Runs Policies:
-- Anyone can view verified runs (for leaderboard)
CREATE POLICY "Verified game runs are viewable by everyone."
  ON public.game_runs FOR SELECT
  USING (verification_status = 'verified');

-- Authenticated users or server edge functions can insert runs
CREATE POLICY "Users or Edge Functions can insert game runs."
  ON public.game_runs FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (user_id IS NULL AND guest_identifier IS NOT NULL)
  );

-- Function to handle user signups automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', 'Star-Pilot-' || SUBSTRING(new.id::text FROM 1 FOR 6)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
