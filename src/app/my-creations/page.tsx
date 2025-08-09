"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyCreationsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [files, setFiles] = useState<{ name: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const fetchFiles = async () => {
      if (!supabase) {
        setError("Storage is not configured.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.storage.from("pitches").list(`${user.id}/`, { limit: 100 });
        if (error) throw error;
        setFiles(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load files.");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [user, isLoaded, isSignedIn]);

  const handleDownload = async (name: string) => {
    if (!user) return;
    if (!supabase) return;
    const { data, error } = await supabase.storage.from("pitches").download(`${user.id}/${name}`);
    if (error) return alert("Download failed");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (name: string) => {
    if (!user) return;
    if (!confirm(`Delete ${name}?`)) return;
    if (!supabase) return;
    const { error } = await supabase.storage.from("pitches").remove([`${user.id}/${name}`]);
    if (error) return alert("Delete failed");
    setFiles(files.filter(f => f.name !== name));
  };

  const handleFavorite = (name: string) => {
    setFavorites(favs => favs.includes(name) ? favs.filter(f => f !== name) : [...favs, name]);
  };

  if (!isLoaded) return <div className="p-8">Loading...</div>;
  if (!isSignedIn) return <div className="p-8">Please sign in to view your creations.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Creations</h1>
      {loading && <div>Loading files...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && files.length === 0 && <div>No files found.</div>}
      <ul className="space-y-4">
        {files.map(file => (
          <li key={file.name} className="flex items-center justify-between border rounded px-4 py-2">
            <div className="flex items-center gap-3">
              <button onClick={() => handleFavorite(file.name)} className="text-xl">
                {favorites.includes(file.name) ? "★" : "☆"}
              </button>
              <span>{file.name}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDownload(file.name)} className="bg-blue-600 text-white px-3 py-1 rounded">Download</button>
              <button onClick={() => handleDelete(file.name)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 