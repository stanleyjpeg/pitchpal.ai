import Dashboard from "@/components/dashboard";
import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
  const { data: pitches, error } = await supabase.from("pitches").select("*");

  if (error) {
    return <div className="p-6 text-red-500">Error loading pitches</div>;
  }

  return <Dashboard pitches={pitches || []} />;
}
