"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import ProModal and icons with SSR disabled for smaller bundles
const ProModal = dynamic(() => import("../components/ProModal"), { ssr: false });
const FaTwitter = dynamic(() => import("react-icons/fa").then(mod => mod.FaTwitter), { ssr: false });
const FaGithub = dynamic(() => import("react-icons/fa").then(mod => mod.FaGithub), { ssr: false });
const FaGlobe = dynamic(() => import("react-icons/fa").then(mod => mod.FaGlobe), { ssr: false });
const FaSpinner = dynamic(() => import("react-icons/fa").then(mod => mod.FaSpinner), { ssr: false });

// Constants
const TONES = ["Confident", "Playful", "Persuasive", "Chill"] as const;
const PLATFORMS = ["TikTok", "IG Reels", "Landing Page"] as const;
const LENGTHS = ["15s", "30s", "45s"] as const;
const VOICE_STYLES = [
  { label: "Male / Casual", value: "male-casual" },
  { label: "Male / Formal", value: "male-formal" },
  { label: "Female / Casual", value: "female-casual" },
  { label: "Female / Formal", value: "female-formal" },
];
const FREE_EXPORT_LIMIT = 3;

// LocalStorage hook with SSR safety
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((val: T) => {
    try {
      setValue(val);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  return [value, setStoredValue];
}

// API error handler returning user-friendly messages
type ApiLikeError = { message?: string; status?: number } | null | undefined;

function handleApiError(error: unknown, fallback: string): string {
  const err = (error as ApiLikeError) ?? undefined;
  if (err && typeof err === "object" && typeof err.message === "string") return err.message;
  if (err && typeof err === "object" && err.status === 429) return "Rate limit exceeded. Please try again later.";
  if (err && typeof err === "object" && err.status === 401) return "Please sign in to continue.";
  if (err && typeof err === "object" && err.status === 403) return "Access denied. Please check your subscription.";
  return fallback;
}

// Benefit UI component with icon and text
function Benefit({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-2 text-base font-medium shadow-sm">
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export {
  useLocalStorage,
  handleApiError,
  Benefit,
  TONES,
  PLATFORMS,
  LENGTHS,
  VOICE_STYLES,
  FREE_EXPORT_LIMIT,
  ProModal,
  FaTwitter,
  FaGithub,
  FaGlobe,
  FaSpinner,
};


//
// HowItWorks Step component
//
function HowItWorksStep({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-6 py-4 shadow-sm w-full max-w-xs text-center">
      <span className="text-3xl mb-1" aria-hidden="true">{icon}</span>
      <div className="font-semibold text-zinc-900 dark:text-white text-lg">{title}</div>
      <div className="text-zinc-500 dark:text-zinc-300 text-sm">{desc}</div>
    </div>
  );
}

//
// Testimonial component
//
function Testimonial({
  quote,
  name,
  avatar,
}: {
  quote: string;
  name: string;
  avatar: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-6 py-6 shadow-md w-full max-w-xs text-center">
      <img
        src={avatar}
        alt={`Avatar of ${name}`}
        className="w-12 h-12 rounded-full mb-2 object-cover mx-auto"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
        }}
        aria-hidden="true"
      />
      <blockquote className="italic text-zinc-700 dark:text-zinc-200 text-base mb-1">&ldquo;{quote}&rdquo;</blockquote>
      <div className="font-semibold text-indigo-600 text-sm">{name}</div>
    </div>
  );
}

//
// Onboarding modal component
//
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
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 rounded-none shadow-none p-8 max-w-none w-full h-full flex flex-col items-center justify-center gap-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl" aria-hidden="true">{steps[step].emoji}</span>
          <h2 className="text-xl font-bold mb-1">{steps[step].title}</h2>
          <p className="text-zinc-700 dark:text-zinc-200">{steps[step].desc}</p>
        </div>
        <div className="flex gap-2 w-full justify-between mt-2">
          <button
            className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition disabled:opacity-50"
            type="button"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={isFirst}
            aria-disabled={isFirst}
            aria-label="Back"
          >
            Back
          </button>
          {!isLast ? (
            <button
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium text-base hover:bg-indigo-500 transition"
              type="button"
              onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
              aria-label="Next"
            >
              Next
            </button>
          ) : (
            <button
              className="rounded-xl bg-zinc-900 text-white px-6 py-2 font-semibold text-base hover:bg-zinc-700 transition"
              type="button"
              onClick={onClose}
              aria-label="Get Started"
            >
              Get Started
            </button>
          )}
        </div>
        <div className="flex gap-1 mt-2" aria-label="Progress steps">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full ${
                i === step ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

//
// Limit modal for free tier export limits
//
function LimitModal({
  open,
  onClose,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center gap-6 text-center">
        <h2 id="limit-title" className="text-xl font-bold mb-2">Free Limit Reached</h2>
        <p>
          You&apos;ve reached your free export limit. Upgrade to PitchPal Pro for unlimited
          access!
        </p>
        <motion.button
          className="mt-2 rounded-xl bg-yellow-500 text-black px-4 py-2 font-medium text-base hover:bg-yellow-400 transition"
          onClick={onUpgrade}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="button"
          aria-label="Upgrade to Pro"
        >
          Upgrade to Pro
        </motion.button>
        <motion.button
          className="mt-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
          onClick={onClose}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="button"
          aria-label="Cancel upgrade"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

//
// Copy script button with copy-to-clipboard feedback
//
function CopyScriptButton({ script }: { script: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(script.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [script]);

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      aria-pressed={copied}
      aria-label="Copy script to clipboard"
    >
      {copied ? "Copied!" : "Copy Script"}
    </motion.button>
  );
}

//
// Download MP3 audio button with download state feedback
//
function DownloadAudioButton({ audioUrl }: { audioUrl: string }) {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = useCallback(async () => {
    setDone(false);
    try {
      setDownloading(true);
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pitchpal-voiceover.mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [audioUrl]);

  return (
    <motion.button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition disabled:opacity-60"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      aria-busy={downloading}
      aria-label="Download MP3 audio"
    >
      {done ? "Downloaded!" : downloading ? "Downloading..." : "Download MP3"}
    </motion.button>
  );
}

//
// Main ScriptOutput component with controlled inputs and selection
//
interface ScriptOutputProps {
  script: string[];
  onScriptChange: (idx: number, value: string) => void;
  voiceStyle: string;
  onVoiceStyleChange: (value: string) => void;
  onGenerateVoice: () => void;
  voiceLoading: boolean;
  voiceError: string | null;
  audioUrl: string | null;
  audioSupabaseUrl: string | null;
  onGenerateVideo: () => void;
  videoLoading: boolean;
  videoError: string | null;
  videoUrl: string | null;
  videoSupabaseUrl: string | null;
}

function ScriptOutput({
  script,
  onScriptChange,
  voiceStyle,
  onVoiceStyleChange,
  onGenerateVoice,
  voiceLoading,
  voiceError,
  audioUrl,
  audioSupabaseUrl,
  onGenerateVideo,
  videoLoading,
  videoError,
  videoUrl,
  videoSupabaseUrl,
}: ScriptOutputProps) {
  // Refs to inputs for focus management
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Focus first line input on mount or script update
  React.useEffect(() => {
    if (script.length > 0) {
      inputRefs.current[0]?.focus();
    }
  }, [script]);

  return (
    <motion.div
      key="script-output"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className="mt-4 bg-gradient-to-br from-indigo-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800 rounded-2xl p-6 flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 shadow-xl"
      aria-label="AI Pitch script output"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="mb-2 flex items-center gap-2 justify-center"
        role="status"
      >
        <span className="text-green-600 dark:text-green-400 text-lg font-bold">
          Pitch generated!
        </span>
      </motion.div>

      <div className="font-semibold mb-1 text-zinc-700 dark:text-zinc-200 text-lg">
        Your AI Pitch Script:
      </div>

      {/* Script editable lines */}
      {script.map((line, idx) => (
        <input
          key={idx}
          type="text"
          value={line}
          onChange={(e) => onScriptChange(idx, e.target.value)}
          className="w-full rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-base mb-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label={`Pitch line ${idx + 1}`}
          ref={el => {
            if (el) {
              inputRefs.current[idx] = el;
            }
          }}
        />
      ))}

      {/* Voice style selector & generate */}
      <div className="flex items-center gap-2 mt-4">
        <select
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={voiceStyle}
          onChange={(e) => onVoiceStyleChange(e.target.value)}
          aria-label="Select voice style"
        >
          {VOICE_STYLES.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <motion.button
          type="button"
          disabled={voiceLoading}
          onClick={onGenerateVoice}
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 font-semibold text-base hover:bg-zinc-700 transition disabled:opacity-60 flex items-center gap-2"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          aria-busy={voiceLoading}
          aria-label="Generate voiceover"
        >
          {voiceLoading ? "Generating..." : "Generate Voiceover"}
        </motion.button>
      </div>

      {voiceError && (
        <div
          className="text-red-500 text-sm text-center mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
          role="alert"
        >
          {voiceError}
        </div>
      )}

      {/* Audio player and cloud download link */}
      {audioUrl && (
        <audio controls className="w-full mt-3" aria-label="Audio playback">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      {audioSupabaseUrl && (
        <a
          href={audioSupabaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600 dark:text-blue-400 underline text-sm mt-1 hover:text-blue-800 dark:hover:text-blue-300"
          aria-label="Download audio from cloud"
        >
          Download from cloud
        </a>
      )}

      {/* Video preview generation */}
      <div className="flex items-center gap-2 mt-4">
        <motion.button
          type="button"
          disabled={videoLoading}
          onClick={onGenerateVideo}
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 font-semibold text-base hover:bg-zinc-700 transition disabled:opacity-60 flex items-center gap-2"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          aria-busy={videoLoading}
          aria-label="Generate video preview"
        >
          {videoLoading ? "Generating..." : "Generate Video Preview"}
        </motion.button>
      </div>

      {videoError && (
        <div
          className="text-red-500 text-sm text-center mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
          role="alert"
        >
          {videoError}
        </div>
      )}

      {videoUrl && (
        <video
          controls
          className="w-full mt-3 rounded-xl shadow"
          src={videoUrl}
          aria-label="Video preview"
        />
      )}
      {videoSupabaseUrl && (
        <a
          href={videoSupabaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600 dark:text-blue-400 underline text-sm mt-1 hover:text-blue-800 dark:hover:text-blue-300"
          aria-label="Download video from cloud"
        >
          Download video from cloud
        </a>
      )}

      {/* Export buttons */}
      {(script.length > 0 || audioUrl) && (
        <div className="flex gap-2 mt-4" aria-label="Export options">
          {script.length > 0 && <CopyScriptButton script={script} />}
          {audioUrl && <DownloadAudioButton audioUrl={audioUrl} />}
        </div>
      )}
    </motion.div>
  );
}

//
// Main content component containing all UI & logic
//
function HomeContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // LocalStorage for onboarding modal state
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage(
    "pitchpal_onboarded",
    false
  );

  // User Authentication States
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? "anon";

  // Pro status and export count for limits
  const [isPro, setIsPro] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  // UI states for modals, banners
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  // Accept all debug changes: move showProModal state here, remove top-level useState
  const [showProModal, setShowProModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Form submission and inputs
  const [inputMode, setInputMode] = useState<"url" | "desc">("url");
  const [productUrl, setProductUrl] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [tone, setTone] = useState(TONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [length, setLength] = useState(LENGTHS[0]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Script and media output states
  const [script, setScript] = useState<string[]>([]);
  const [voiceStyle, setVoiceStyle] = useState(VOICE_STYLES[0].value);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSupabaseUrl, setAudioSupabaseUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoSupabaseUrl, setVideoSupabaseUrl] = useState<string | null>(null);

  // Referral URL memo
  const referralUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/?ref=${userId !== "anon" ? userId : "your-id"}`;
  }, [userId]);

  // Has free tier export limit been reached?
  const isFreeLimitReached = !isPro && exportCount >= FREE_EXPORT_LIMIT;

  // Mark component mounted for client-only logic
  React.useEffect(() => setMounted(true), []);

  // Show onboarding modal if needed
  React.useEffect(() => {
    if (mounted && !onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [mounted, onboardingComplete]);

  // Autofill description if "template" query param present
  useEffect(() => {
    if (mounted && searchParams) {
      const template = searchParams.get("template");
      if (template) {
        setInputMode("desc");
        setDescription(template);
      }
    }
  }, [mounted, searchParams]);

  // Check pro status from user metadata
  useEffect(() => {
    const pro = Boolean(
      (user as { publicMetadata?: { pro?: unknown } } | null | undefined)?.publicMetadata?.pro
    );
    setIsPro(pro);
  }, [user]);
  
  // Referral tracking (can be moved to backend)
  useEffect(() => {
    async function trackReferral() {
      if (!user || userId === "anon" || !mounted || !searchParams) return;
      const referrerId = searchParams.get("ref");
      if (!referrerId || referrerId === userId) return;
      try {
        await fetch("/api/track-referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, referrerId }),
        });
      } catch {
        // ignore failures
      }
    }
    trackReferral();
    // Only include stable and relevant dependencies to avoid unnecessary reruns and type errors
  }, [mounted, searchParams, user, userId]);
    // Handlers for UI events

  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingComplete(true);
  }, [setOnboardingComplete]);

  const handleScriptChange = useCallback((idx: number, value: string) => {
    setScript((prev) => prev.map((line, i) => (i === idx ? value : line)));
  }, []);

  // Submit to generate pitch script
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isFreeLimitReached) {
        setShowLimitModal(true);
        return;
      }

      setLoading(true);
      setError(null);
      setScript([]);
      setAudioUrl(null);
      setAudioSupabaseUrl(null);
      setVoiceError(null);
      setVideoUrl(null);
      setVideoSupabaseUrl(null);
      setVideoError(null);

      try {
        const formData = new FormData();
        if (inputMode === "url") {
          formData.append("productUrl", productUrl);
        } else {
          formData.append("description", description);
          if (image) formData.append("image", image);
        }
        formData.append("tone", tone);
        formData.append("platform", platform);
        formData.append("length", length);

        const res = await fetch("/api/generate-script", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.script) {
          setScript(data.script);
          setExportCount((c) => c + 1);
        } else {
          setError(handleApiError(data, "Failed to generate script."));
        }
      } catch (err) {
        setError(handleApiError(err, "Network error. Please try again."));
      } finally {
        setLoading(false);
      }
    },
    [inputMode, productUrl, description, image, tone, platform, length, isFreeLimitReached]
  );

  // Generate voiceover handler
  const handleGenerateVoice = useCallback(async () => {
    if (isFreeLimitReached) {
      setShowLimitModal(true);
      return;
    }

    setVoiceLoading(true);
    setVoiceError(null);
    setAudioUrl(null);
    setAudioSupabaseUrl(null);

    try {
      const res = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.join(" "),
          voiceStyle,
        }),
      });
      const data = await res.json();

      if (res.ok && data.audioUrl) {
        setAudioUrl(data.audioUrl);

        // Upload audio to Supabase
        try {
          const blob = await (await fetch(data.audioUrl)).blob();
          const file = new File([blob], `voiceover-${Date.now()}.mp3`, { type: "audio/mpeg" });
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pitches")
            .upload(`${userId}/voiceover-${Date.now()}.mp3`, file, { upsert: true });
          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage.from("pitches").getPublicUrl(uploadData.path);
            setAudioSupabaseUrl(publicUrlData.publicUrl);
          }
        } catch (uploadErr) {
          console.warn("Supabase upload failed:", uploadErr);
        }

        setExportCount((c) => c + 1);
      } else {
        setVoiceError(handleApiError(data, "Failed to generate voiceover."));
      }
    } catch (err) {
      setVoiceError(handleApiError(err, "Network error. Please try again."));
    } finally {
      setVoiceLoading(false);
    }
  }, [script, voiceStyle, isFreeLimitReached, userId]);

  // Generate video preview handler
  const handleGenerateVideo = useCallback(async () => {
    if (isFreeLimitReached) {
      setShowLimitModal(true);
      return;
    }

    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    setVideoSupabaseUrl(null);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.join(" "),
          voiceStyle,
        }),
      });
      const data = await res.json();

      if (res.ok && data.videoUrl) {
        setVideoUrl(data.videoUrl);

        // Upload video to Supabase
        try {
          const blob = await (await fetch(data.videoUrl)).blob();
          const file = new File([blob], `video-${Date.now()}.mp4`, { type: "video/mp4" });
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pitches")
            .upload(`${userId}/video-${Date.now()}.mp4`, file, { upsert: true });
          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage.from("pitches").getPublicUrl(uploadData.path);
            setVideoSupabaseUrl(publicUrlData.publicUrl);
          }
        } catch (uploadErr) {
          console.warn("Supabase upload failed:", uploadErr);
        }

        setExportCount((c) => c + 1);
      } else {
        setVideoError(handleApiError(data, "Failed to generate video preview."));
      }
    } catch (err) {
      setVideoError(handleApiError(err, "Network error. Please try again."));
    } finally {
      setVideoLoading(false);
    }
  }, [script, voiceStyle, isFreeLimitReached, userId]);

  // Upgrade user to Pro in Clerk
  const setProInClerk = useCallback(async () => {
    if (!isSignedIn || !user) return;
    try {
      const token = await getToken();
      await fetch("/api/set-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (e) {
      console.error("Failed to set pro status:", e);
    }
  }, [isSignedIn, user, getToken]);

  // Copy referral URL to clipboard
  const copyReferralUrl = useCallback(() => {
    if (navigator.clipboard && referralUrl) {
      navigator.clipboard.writeText(referralUrl).catch(() => {
        // Fail silently
      });
    }
  }, [referralUrl]);

  //
  // JSX OUTPUT
  //
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-indigo-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-indigo-950 px-4 py-10">
      {/* Banner */}
      {showBanner && (
        <motion.div
          className="fixed top-0 left-0 w-full z-50 bg-indigo-700 text-white flex flex-col sm:flex-row items-center justify-center gap-4 px-4 py-3 shadow-lg"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
        >
          <span className="font-semibold text-lg">
            🚀 PitchPal is live! Join our waitlist for updates and early access.
          </span>
          <form
            onSubmit={e => {
              e.preventDefault();
              setShowBanner(false);
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="email"
              name="email"
              placeholder="Your email"
              required
              aria-label="Email for waitlist"
              className="rounded-lg px-3 py-1 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-white text-indigo-700 font-bold px-4 py-1 hover:bg-indigo-100 transition"
            >
              Notify Me
            </button>
          </form>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-white hover:text-indigo-200 text-2xl font-bold leading-none"
            aria-label="Close banner"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Hero, Benefits, Referrals, How it Works, Testimonials and Form sections go here */}
      {/* Please refer to previously detailed code for full layout */}

      {/* Main pitch form container */}
      <div
        id="pitchpal-form"
        className="w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 rounded-3xl shadow-2xl p-10 flex flex-col gap-10 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
      >
        <AnimatePresence initial={false}>
          {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
          {showLimitModal && (
            <LimitModal
              open={showLimitModal}
              onClose={() => setShowLimitModal(false)}
              onUpgrade={() => {
                setShowLimitModal(false);
                setShowProModal(true);
              }}
            />
          )}
        </AnimatePresence>

        {/* Form header and controls (see your original form JSX) */}

        {/* Refer to your previous implementation for full form UI and binding */}

        {/* ScriptOutput component render */}
        <AnimatePresence>
          {script.length > 0 && (
            <ScriptOutput
              script={script}
              onScriptChange={handleScriptChange}
              voiceStyle={voiceStyle}
              onVoiceStyleChange={setVoiceStyle}
              onGenerateVoice={handleGenerateVoice}
              voiceLoading={voiceLoading}
              voiceError={voiceError}
              audioUrl={audioUrl}
              audioSupabaseUrl={audioSupabaseUrl}
              onGenerateVideo={handleGenerateVideo}
              videoLoading={videoLoading}
              videoError={videoError}
              videoUrl={videoUrl}
              videoSupabaseUrl={videoSupabaseUrl}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer and other UI components as detailed before */}

      {/* Pro modal */}
      <ProModal
        open={showProModal}
        onClose={() => setShowProModal(false)}
        onSuccess={setProInClerk}
      />
    </div>
  );
}

//
// Export main component wrapped with Suspense fallback
//
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

// (removed erroneous local useEffect stub)

