import React from "react";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import StepProgress from "../components/stepProgress";
import ScriptEditor from "../components/ScriptEditor";

// Inside your main component



export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <StepProgress step={1} />
      <ScriptEditor />
      {/* Add Features, Gallery, Testimonials, Rewards */}
    </>
  );
}
