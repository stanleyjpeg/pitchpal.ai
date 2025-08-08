"use client";

import { useState } from "react";
import VoiceSelector, { voiceOptions } from "@/components/VoiceSelector";

// ✅ Declare the correct type
type Pitch = {
  id: string; // or `number` if that's how your Supabase table is set
  result: string;
};


export default function Dashboard({ pitches }: { pitches: Pitch[] }) {
  const [voiceId, setVoiceId] = useState(voiceOptions[0].id);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎧 Your AI Pitches</h1>

      <div className="mb-4">
        <label className="font-medium mr-2">Choose Voice:</label>
        <VoiceSelector selected={voiceId} onChange={setVoiceId} />
      </div>

      {pitches.map((pitch) => {
        const encodedText = encodeURIComponent(pitch.result);
        const audioUrl = `/api/voice?text=${encodedText}&voiceId=${voiceId}`;

        return (
          <div
            key={pitch.id}
            className="rounded-2xl p-4 bg-background shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#2e2e2e] transition-all hover:scale-[1.01]"
          >
            <p className="text-zinc-700 dark:text-zinc-300">{pitch.result}</p>

            <div className="mt-3 flex items-center gap-4">
              <audio
                src={audioUrl}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
                preload="none"
              />

              <a
                href={audioUrl}
                download={`pitch-${pitch.id}.mp3`}
                className="px-3 py-1 text-sm font-medium border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ⬇️ Download MP3
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
