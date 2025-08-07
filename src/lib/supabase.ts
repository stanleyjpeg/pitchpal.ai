import { createClient } from "@supabase/supabase-js";

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🔒 Validate env variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in .env.local");
}

// ✅ Optional: Log only in development
if (process.env.NODE_ENV === "development") {
  console.log("✅ Supabase connected:", supabaseUrl);
}

// ✅ Export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
