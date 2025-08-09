import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read from environment variables (may be undefined at build time on some hosts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only when both env vars are present
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase && process.env.NODE_ENV !== "production") {
  // Avoid throwing at import time to keep the app buildable without envs
  console.warn("Supabase env vars are missing; uploads will be skipped.");
}
