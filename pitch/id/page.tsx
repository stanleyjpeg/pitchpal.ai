// app/pitch/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { voiceOptions } from "@/components/VoiceSelector";

interface Pitch {
  id: string;
  result: string;
  // Add other fields if needed
}

export default function PublicPitchPage() {
  const { id } = useParams() as { id: string };
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [voiceId, setVoiceId] = useState<string>(voiceOptions?.[0]?.id ?? "default-voice");

  useEffect(() => {
    const fetchPitch = async () => {
      if (!supabase) {
        console.warn("Supabase client not configured; cannot load pitch.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading pitch:", error);
      } else {
        setPitch(data);
      }
      setLoading(false);
    };

    if (id) fetchPitch();
  }, [id]);

  if (loading) return <p className="p-4">Loading pitch...</p>;
  if (!pitch) return <p className="p-4 text-red-500">Pitch not found</p>;

  const encodedText = encodeURIComponent(pitch.result ?? "");
  const audioUrl = `/api/voice?text=${encodedText}&voiceId=${voiceId}`;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎤 Shared Pitch</h1>
      <p className="text-zinc-700 dark:text-zinc-300 border rounded p-4 bg-white dark:bg-zinc-900">
        {pitch.result}
      </p>
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/mpeg" />
      </audio>
      <a
        href={audioUrl}
        download={`pitch-${pitch.id}.mp3`}
        className="inline-block mt-2 px-4 py-2 text-sm border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        ⬇️ Download MP3
      </a>
    </main>
  );
}
