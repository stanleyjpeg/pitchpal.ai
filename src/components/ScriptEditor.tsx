"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ScriptEditor() {
  const [script, setScript] = useState(
    "Introducing our new hoodie: 100% cotton, oversized fit, and made for summer comfort."
  );
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const router = useRouter();

  const savePitchToSupabase = async (result: string) => {
    const { data, error } = await supabase
      .from("pitches")
      .insert([{ result }])
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to save pitch:", error);
      return null;
    }

    return data;
  };

  const handleAIAction = async (action: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: script, action }),
      });

      const data = await res.json();
      setScript(data.result);
      setSavedId(null); // Mark as unsaved after regeneration
    } catch (err) {
      console.error("❌ AI generation error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    setLoading(true);
    try {
      const saved = await savePitchToSupabase(script);
      if (saved?.id) {
        setSavedId(saved.id);
        router.push(`/pitch/${saved.id}`); // optional: auto-redirect
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-xl font-semibold mb-4">🎤 Your Pitch Script</h2>

      <textarea
        className="w-full min-h-[140px] p-3 border rounded-md text-gray-800 font-mono"
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => handleAIAction("improve")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          ✨ Improve
        </button>
        <button
          onClick={() => handleAIAction("regenerate")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          disabled={loading}
        >
          🔁 Regenerate
        </button>
        <button
          onClick={() => handleAIAction("tone")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          🎯 Change Tone
        </button>

        <button
          onClick={handleManualSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          💾 Save & Share
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-sm text-gray-500">⏳ Working...</p>
      )}
    </section>
  );
}
