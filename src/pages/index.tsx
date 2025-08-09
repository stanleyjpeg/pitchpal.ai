"use client";

import { useState } from "react";
import OnboardingModal from "../components/OnboardingModal";

export default function Home() {
  const [showModal, setShowModal] = useState(true);

  return (
    <>
      {showModal && <OnboardingModal onClose={() => setShowModal(false)} />}
      {!showModal && (
        <main
          style={{
            padding: 20,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1>Welcome to PitchPal</h1>
          <p>Your main homepage content here.</p>
        </main>
      )}
    </>
  );
}
