// app/dashboard/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Dashboard from "./DashboardClient"; // Adjust path if necessary
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  // 1️⃣ Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error fetching session:", sessionError);
  }

  // Redirect to sign-in if no session
  if (!session) {
    redirect("/login");
  }

  // 2️⃣ Fetch pitches for this user
  const { data: pitches, error } = await supabase
    .from("pitches")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pitches:", error);
  }

  // 3️⃣ Render dashboard
  return (
    <div className="min-h-screen w-full bg-white">
      <Dashboard pitches={pitches ?? []} />
    </div>
  );
}
