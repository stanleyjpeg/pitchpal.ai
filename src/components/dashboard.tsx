// app/dashboard/DashboardClient.tsx
"use client";

import React from "react";

type Pitch = {
  id: string;
  title?: string;
  description?: string;
  created_at: string;
};

// removed unused DashboardProps interface

export default function Dashboard({ pitches }: { pitches: Pitch[] }) {
  return (
    <div className="min-h-screen w-full flex flex-col p-6">
      <h1 className="text-3xl font-bold mb-6">Your Pitches</h1>
      <div className="flex-1">
        {pitches.length === 0 ? (
          <p className="text-gray-500">No pitches yet.</p>
        ) : (
          <ul className="space-y-4">
            {pitches.map((pitch: Pitch) => (
              <li key={pitch.id} className="p-4 bg-white rounded shadow">
                {pitch.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
