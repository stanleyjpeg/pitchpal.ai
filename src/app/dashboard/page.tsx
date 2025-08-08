// app/dashboard/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Dashboard from "./DashboardClient"; // ✅ adjust if file is in /components

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error fetching session:", sessionError);
  }

  // Fetch pitches for this user
  const { data: pitches, error } = await supabase
    .from("pitches")
    .select("*")
    .eq("user_id", session?.user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pitches:", error);
  }

  return <Dashboard pitches={pitches || []} />;
}
