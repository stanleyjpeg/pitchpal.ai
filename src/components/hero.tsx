import React from "react";

export default function Hero() {
  return (
    <section className="text-center py-24 px-6 bg-gradient-to-b from-[var(--background)] to-[#120233]">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
        AI-Powered Voice & Video Pitches
      </h2>
      <p className="text-lg text-white/80 mb-6">
        Paste your product link. Get a compelling pitch in seconds. No camera. No stress.
      </p>
      <a href="#try" className="inline-block btn-brand px-6 py-3 rounded-full text-lg">
        Try It Free
      </a>
    </section>
  );
}
