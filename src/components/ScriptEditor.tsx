"use client";

import React, { useState } from "react";
import { useToast } from "./Toast";
import { supabase } from "@/lib/supabase";
// import { useRouter } from "next/navigation";

export default function ScriptEditor() {
  const [script, setScript] = useState(
    "Introducing our new hoodie: 100% cotton, oversized fit, and made for summer comfort."
  );
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { showToast } = useToast();
  // const router = useRouter();

  const savePitchToSupabase = async (result: string) => {
    if (!supabase) {
      alert("Storage is not configured.");
      return null;
    }
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

  const handleAIAction = async (_action: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl: "",
          description: script,
          tone: "Confident",
          platform: "Landing Page",
          length: "30s",
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.script)) {
        setScript(data.script.join("\n"));
        showToast({ type: "success", message: "Script generated successfully." });
      } else if (typeof data.result === "string") {
        setScript(data.result);
        showToast({ type: "success", message: "Script updated." });
      } else {
        throw new Error("Invalid response from generator");
      }
      setSavedId(null); // Clear saved ID after changing script
    } catch (err) {
      console.error("❌ AI generation error:", err);
      showToast({ type: "error", message: "Something went wrong. Please try again." });
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
        showToast({ type: "success", message: "Pitch saved. Share your link!" });
        // Optional redirect:
        // router.push(`/pitch/${saved.id}`);
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      showToast({ type: "error", message: "Save failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span role="img" aria-label="microphone">🎤</span> Your Pitch Script
      </h2>

      <textarea
        className="w-full min-h-[140px] p-4 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-gray-100 font-mono bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition mb-4 text-base"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        aria-label="Pitch script editor"
      />

      <div className="flex flex-wrap gap-4 mt-2">
        <button
          onClick={() => handleAIAction("improve")}
          className="bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          disabled={loading}
        >
          ✨ Improve
        </button>
        <button
          onClick={() => handleAIAction("regenerate")}
          className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 focus:ring-4 focus:ring-indigo-200 text-gray-800 dark:text-gray-100 px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          disabled={loading}
        >
          🔁 Regenerate
        </button>
        <button
          onClick={() => handleAIAction("tone")}
          className="bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          disabled={loading}
        >
          🎯 Change Tone
        </button>
        <button
          onClick={handleManualSave}
          className="bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          disabled={loading}
        >
          💾 Save & Share
        </button>
      </div>

      {loading && (
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 rounded bg-gray-200 dark:bg-zinc-700 w-full" />
          <div className="h-4 rounded bg-gray-200 dark:bg-zinc-700 w-5/6" />
          <div className="h-4 rounded bg-gray-200 dark:bg-zinc-700 w-2/3" />
        </div>
      )}

      {savedId && (
        <div className="mt-6">
          <a
            href={`/pitch/${savedId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-zinc-800 text-white px-5 py-2 rounded-lg hover:bg-zinc-700 transition"
          >
            🔗 View & Share Pitch
          </a>
        </div>
      )}
    </section>
  );
}
