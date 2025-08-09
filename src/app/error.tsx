"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-4">Please try again. If the problem persists, contact support.</p>
            <button className="bg-zinc-900 text-white px-4 py-2 rounded" onClick={() => reset()}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


