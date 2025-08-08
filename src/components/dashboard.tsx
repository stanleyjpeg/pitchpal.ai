// app/dashboard/DashboardClient.tsx
"use client";

import React from "react";

type Pitch = {
  id: string;
  title?: string;
  description?: string;
  created_at: string;
};

interface DashboardProps {
  pitches: Pitch[];
}

export default function Dashboard({ pitches }: DashboardProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Pitches</h1>

      {pitches.length === 0 ? (
        <div className="text-gray-500">No pitches yet. Go create one!</div>
      ) : (
        <ul className="space-y-4">
          {pitches.map((pitch) => (
            <li
              key={pitch.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">
                {pitch.title || "Untitled Pitch"}
              </h2>
              {pitch.description && (
                <p className="text-gray-600 mt-1">{pitch.description}</p>
              )}
              <span className="block text-sm text-gray-400 mt-2">
                {new Date(pitch.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
