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
    <section className="max-w-4xl mx-auto p-6 bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
      <h2 className="text-2xl font-bold mb-4">🎤 Your Pitch Script</h2>

      <textarea
        className="w-full min-h-[140px] p-3 border rounded-md text-gray-800 font-mono"
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => handleAIAction("improve")}
          className="btn-brand px-4 py-2 rounded"
          disabled={loading}
        >
          ✨ Improve
        </button>
        <button
          onClick={() => handleAIAction("regenerate")}
          className="btn-outline px-4 py-2 rounded"
          disabled={loading}
        >
          🔁 Regenerate
        </button>
        <button
          onClick={() => handleAIAction("tone")}
          className="btn-brand px-4 py-2 rounded"
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
        <div className="mt-4 space-y-3">
          <div className="h-4 rounded skeleton skeleton-dark" />
          <div className="h-4 rounded skeleton skeleton-dark w-5/6" />
          <div className="h-4 rounded skeleton skeleton-dark w-2/3" />
        </div>
      )}

      {savedId && (
        <div className="mt-4">
          <a
            href={`/pitch/${savedId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            🔗 View & Share Pitch
          </a>
        </div>
      )}
    </section>
  );
}
