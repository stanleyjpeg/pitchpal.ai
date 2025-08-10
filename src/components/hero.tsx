import React from "react";

export default function Hero() {
  return (
    <section className="text-center py-28 px-6 bg-gradient-to-b from-indigo-900 via-indigo-800 to-[#120233]">
      <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight">
        AI-Powered Voice & Video Pitches
      </h2>
      <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
        Paste your product link. Get a compelling pitch in seconds. No camera. No stress.
      </p>
      <a
        href="#try"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        Try It Free
      </a>
    </section>
  );
}
