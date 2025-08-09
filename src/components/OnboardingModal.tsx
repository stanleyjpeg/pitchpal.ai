import { useState } from "react";

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      emoji: "👋",
      title: "Welcome to PitchPal!",
      desc: "PitchPal helps you create persuasive product pitches in seconds. Let's get started!",
    },
    {
      emoji: "🔗",
      title: "Paste a Product Link or Description",
      desc: "Just drop in your Shopify, TikTok, or Etsy link—or write a quick description of your product.",
    },
    {
      emoji: "✨",
      title: "Pick Your Style & Platform",
      desc: "Choose your tone, platform, and pitch length. Tailor your pitch for TikTok, IG Reels, or a landing page.",
    },
    {
      emoji: "🚀",
      title: "Generate & Export Instantly",
      desc: "Get your AI-generated script, voiceover, and video preview. Edit, download, or share with one click!",
    },
  ];

  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 0 20px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: "3rem", textAlign: "center" }}>
          {steps[step].emoji}
        </div>
        <h2 style={{ marginTop: 16, textAlign: "center" }}>{steps[step].title}</h2>
        <p style={{ marginTop: 8, textAlign: "center", color: "#555" }}>
          {steps[step].desc}
        </p>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            disabled={isFirst}
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            style={{ opacity: isFirst ? 0.5 : 1 }}
          >
            Back
          </button>
          {!isLast && (
            <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>
              Next
            </button>
          )}
          {isLast && <button onClick={onClose}>Finish</button>}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
