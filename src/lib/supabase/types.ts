export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_runs: {
        Row: {
          id: string;
          user_id: string | null;
          guest_identifier: string | null;
          display_name: string;
          score: number;
          survival_seconds: number;
          meteors_destroyed: number;
          highest_wave: number;
          verification_status: "verified" | "flagged" | "local";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_identifier?: string | null;
          display_name: string;
          score: number;
          survival_seconds: number;
          meteors_destroyed?: number;
          highest_wave?: number;
          verification_status?: "verified" | "flagged" | "local";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_identifier?: string | null;
          display_name?: string;
          score?: number;
          survival_seconds?: number;
          meteors_destroyed?: number;
          highest_wave?: number;
          verification_status?: "verified" | "flagged" | "local";
          created_at?: string;
        };
      };
    };
  };
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  display_name: string;
  score: number;
  survival_seconds: number;
  meteors_destroyed: number;
  highest_wave: number;
  created_at: string;
  is_guest: boolean;
}
