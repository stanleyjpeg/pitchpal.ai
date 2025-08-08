// components/DashboardClient.tsx
"use client";

import React from "react";

type Pitch = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

interface DashboardProps {
  pitches: Pitch[];
}

export default function Dashboard({ pitches }: DashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Pitches</h1>

      {pitches.length === 0 ? (
        <p className="text-gray-500">No pitches yet. Create one to get started!</p>
      ) : (
        <ul className="space-y-4">
          {pitches.map((pitch) => (
            <li
              key={pitch.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow"
            >
              <h2 className="text-xl font-semibold">{pitch.title}</h2>
              <p className="text-gray-700 mt-1">{pitch.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(pitch.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}