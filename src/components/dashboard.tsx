import React, { useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";

type Pitch = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
};

export default function Dashboard() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPitches() {
      try {
        const res = await fetch("/api/pitches");
        if (!res.ok) throw new Error("Failed to fetch pitches");
        const data = await res.json();
        setPitches(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchPitches();
  }, []);

  const handleAddPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add pitch");
      const newPitch = await res.json();
      setPitches((prev) => [newPitch, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      alert(err.message || "Error adding pitch");
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <span className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid mb-4"></span>
          <p className="text-center text-gray-500">Loading pitches...</p>
        </div>
      </ClientOnly>
    );
  }

  if (error) {
    return <ClientOnly><p className="p-6 text-center text-red-600">{error}</p></ClientOnly>;
  }

  return (
    <ClientOnly>
      <main className="min-h-screen w-full flex flex-col p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-white text-center">
          Your Pitches
        </h1>
        {/* ...existing code... */}
        <form
          onSubmit={handleAddPitch}
          className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-xl w-full mx-auto border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400 text-center">
            Create New Pitch
          </h2>
          <input
            type="text"
            placeholder="Pitch Title"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={submitting}
          />
          <textarea
            placeholder="Description (optional)"
            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid mr-2"></span>
                Adding...
              </span>
            ) : (
              "Add Pitch"
            )}
          </button>
        </form>

        <div className="max-w-5xl w-full mx-auto">
          {pitches.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
              You haven't created any pitches yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pitches.map((pitch) => (
                <li
                  key={pitch.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-400 outline-none"
                  tabIndex={0}
                  aria-label={`Pitch titled ${pitch.title}`}
                >
                  <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    {pitch.title}
                  </h2>
                  {pitch.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {pitch.description}
                    </p>
                  )}
                  <time
                    className="text-sm text-gray-400 dark:text-gray-500"
                    dateTime={pitch.created_at}
                  >
                    Created on {pitch.created_at.slice(0, 10)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </ClientOnly>
  );
}
