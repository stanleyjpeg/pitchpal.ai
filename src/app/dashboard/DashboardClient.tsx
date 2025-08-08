// components/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";

interface Pitch {
  id: string;
  content: string;
  created_at: string;
}

export default function Dashboard({ pitches }: { pitches: Pitch[] }) {
  const [data, setData] = useState<Pitch[]>(pitches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: If you want real-time updates, hook Supabase here
  // useEffect(() => {
  //   const channel = supabase
  //     .channel('pitches')
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'pitches' }, payload => {
  //       setData((prev) => [payload.new as Pitch, ...prev]);
  //     })
  //     .subscribe();
  //   return () => { supabase.removeChannel(channel); };
  // }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading pitches...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Pitches</h1>

      {data.length === 0 ? (
        <p className="text-gray-500">You have no pitches yet. Try creating one!</p>
      ) : (
        <ul className="space-y-3">
          {data.map((pitch) => (
            <li
              key={pitch.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <p className="text-gray-800">{pitch.content}</p>
              <small className="text-gray-500">
                {new Date(pitch.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
