// src/pages/Dashboard.tsx
import React from "react";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import StepProgress from "../components/stepProgress";
import ScriptEditor from "../components/ScriptEditor";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <Hero />
      <StepProgress step={1} />
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur">
        <ScriptEditor />
      </div>
      {/* Add Features, Gallery, Testimonials, Rewards */}
    </>
  );
}
