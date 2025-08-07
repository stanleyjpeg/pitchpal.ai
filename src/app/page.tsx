"use client";
import '../styles/globals.css'
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ProModal } from "../components/ProModal";
import { useSearchParams } from "next/navigation";
const FaTwitter = dynamic(() => import("react-icons/fa").then(mod => mod.FaTwitter), { ssr: false });
const FaGithub = dynamic(() => import("react-icons/fa").then(mod => mod.FaGithub), { ssr: false });
const FaGlobe = dynamic(() => import("react-icons/fa").then(mod => mod.FaGlobe), { ssr: false });
const FaSpinner = dynamic(() => import("react-icons/fa").then(mod => mod.FaSpinner), { ssr: false });

const TONES = ["Confident", "Playful", "Persuasive", "Chill"];
const PLATFORMS = ["TikTok", "IG Reels", "Landing Page"];
const LENGTHS = ["15s", "30s", "45s"];
const VOICE_STYLES = [
  { label: "Male / Casual", value: "male-casual" },
  { label: "Male / Formal", value: "male-formal" },
  { label: "Female / Casual", value: "female-casual" },
  { label: "Female / Formal", value: "female-formal" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [inputMode, setInputMode] = useState<"url" | "desc">("url");
  const [productUrl, setProductUrl] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [tone, setTone] = useState(TONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState(VOICE_STYLES[0].value);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id || "anon";
  const [audioSupabaseUrl, setAudioSupabaseUrl] = useState<string | null>(null);
  const [videoSupabaseUrl, setVideoSupabaseUrl] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const FREE_EXPORT_LIMIT = 3;
  const isFreeLimitReached = !isPro && exportCount >= FREE_EXPORT_LIMIT;
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  // Remove email/emailSubmitted state and handleEmailSubmit

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("pitchpal_onboarded");
      if (!seen) setShowOnboarding(true);
    }
  }, []);

  // Template autofill logic
  useEffect(() => {
    if (mounted && searchParams) {
      const template = searchParams.get("template");
      if (template) {
        setInputMode("desc");
        setDescription(template);
      }
    }
  }, [searchParams, mounted]);

  useEffect(() => {
    if (user && user.publicMetadata?.pro) {
      setIsPro(true);
    } else {
      setIsPro(false);
    }
  }, [user]);

  useEffect(() => {
    // Referral tracking logic
    async function trackReferral() {
      if (!user || userId === 'anon' || !mounted || !searchParams) return;
      const referrerId = searchParams.get('ref');
      if (!referrerId || referrerId === userId) return;
      // Check if referral already exists
      const { data: existing, error: fetchError } = await supabase
        .from('referrals')
        .select('id')
        .eq('user_id', userId)
        .single();
      if (!existing && !fetchError) {
        // Insert referral
        await supabase.from('referrals').insert({ user_id: userId, referrer_id: referrerId });
      }
    }
    trackReferral();
  }, [user, userId, searchParams, mounted]);

  function handleCloseOnboarding() {
    setShowOnboarding(false);
    localStorage.setItem("pitchpal_onboarded", "1");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFreeLimitReached) { setShowLimitModal(true); return; }
    setLoading(true);
    setError(null);
    setScript([]);
    setAudioUrl(null);
    setVoiceError(null);
    setAudioSupabaseUrl(null);
    setVideoUrl(null);
    setVideoSupabaseUrl(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl: inputMode === "url" ? productUrl : undefined,
          description: inputMode === "desc" ? description : undefined,
          tone,
          platform,
          length,
        }),
      });
      const data = await res.json();
      if (res.ok && data.script) {
        setScript(data.script);
        setExportCount(c => c + 1);
      } else {
        setError(data.error || "Failed to generate script.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleScriptChange(idx: number, value: string) {
    setScript(s => s.map((line, i) => (i === idx ? value : line)));
  }

  async function handleGenerateVoice() {
    if (isFreeLimitReached) { setShowLimitModal(true); return; }
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
        // Upload to Supabase
        const blob = await (await fetch(data.audioUrl)).blob();
        const file = new File([blob], `voiceover-${Date.now()}.mp3`, { type: "audio/mpeg" });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pitches")
          .upload(`${userId}/voiceover-${Date.now()}.mp3`, file, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("pitches").getPublicUrl(uploadData.path);
          setAudioSupabaseUrl(publicUrlData.publicUrl);
        }
        setExportCount(c => c + 1);
      } else {
        setVoiceError(data.error || "Failed to generate voiceover.");
      }
    } catch (err) {
      setVoiceError("Network error. Please try again.");
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleGenerateVideo() {
    if (isFreeLimitReached) { setShowLimitModal(true); return; }
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
        // Upload to Supabase
        const blob = await (await fetch(data.videoUrl)).blob();
        const file = new File([blob], `video-${Date.now()}.mp4`, { type: "video/mp4" });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pitches")
          .upload(`${userId}/video-${Date.now()}.mp4`, file, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("pitches").getPublicUrl(uploadData.path);
          setVideoSupabaseUrl(publicUrlData.publicUrl);
        }
        setExportCount(c => c + 1);
      } else {
        setVideoError(data.error || "Failed to generate video preview.");
      }
    } catch (err) {
      setVideoError("Network error. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  }

  async function setProInClerk() {
    if (!isSignedIn || !user) return;
    const token = await getToken();
    await fetch("/api/set-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id }),
    });
  }

  // Remove email/emailSubmitted state and handleEmailSubmit

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-indigo-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-indigo-950 px-4 py-10">
      {/* Launch Banner */}
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 w-full z-50 bg-indigo-700 text-white flex flex-col sm:flex-row items-center justify-center gap-4 px-4 py-3 shadow-lg"
        >
          <span className="font-semibold text-lg">🚀 PitchPal is live! Join our waitlist for updates and early access.</span>
          <form action="https://formspree.io/f/yourformid" method="POST" className="flex gap-2 items-center">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              required
              className="rounded-lg px-3 py-1 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button type="submit" className="rounded-lg bg-white text-indigo-700 font-bold px-4 py-1 hover:bg-indigo-100 transition">Notify Me</button>
          </form>
          <button onClick={() => setShowBanner(false)} className="ml-2 text-white hover:text-indigo-200 text-2xl font-bold leading-none">×</button>
        </motion.div>
      )}
      {/* Hero/Landing Section */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-6 mb-10 mt-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo.svg" alt="PitchPal logo" width={96} height={96} className="mb-2" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Instantly Create <span className="text-indigo-600">Persuasive</span> Product Pitches
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg max-w-xl mt-2">
            PitchPal uses AI to generate short, confident scripts, voiceovers, and video previews for your e-commerce products. No video skills needed—just paste a link or description and get a ready-to-use pitch in seconds!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Benefit icon="💬" text="AI-written, editable scripts" />
          <Benefit icon="🎤" text="Realistic voiceovers" />
          <Benefit icon="📹" text="Video previews" />
          <Benefit icon="⚡" text="1-click export & share" />
        </div>
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <motion.a
            href="#pitchpal-form"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="inline-block rounded-2xl bg-indigo-600 text-white px-8 py-4 font-bold text-xl shadow-lg hover:bg-indigo-500 transition"
            aria-label="Try PitchPal Free"
          >
            Try PitchPal Free
          </motion.a>
          <a
            href="/explore"
            className="mt-2 inline-block rounded-xl border border-indigo-600 text-indigo-600 bg-white px-6 py-2 font-semibold text-base shadow hover:bg-indigo-50 transition"
            aria-label="Explore Demo Gallery"
          >
            🌟 Explore Demo Gallery
          </a>
          <a
            href="/templates"
            className="mt-2 inline-block rounded-xl border border-indigo-400 text-indigo-500 bg-white px-6 py-2 font-semibold text-base shadow hover:bg-indigo-50 transition"
            aria-label="Script Templates"
          >
            📝 Script Templates
          </a>
        </div>
      </section>
      {/* Referral Section */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-4 mb-10 text-center">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 w-full flex flex-col items-center shadow">
          <h2 className="text-xl font-bold text-indigo-700 mb-2">🎁 Invite Friends, Get Rewards!</h2>
          <p className="text-zinc-700 mb-3">Share your unique link. When a friend signs up and creates a pitch, you both get a bonus export!</p>
          <div className="flex items-center gap-2 w-full justify-center">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${userId !== 'anon' ? userId : 'your-id'}`}
              className="w-2/3 px-3 py-2 rounded-l-lg border border-indigo-300 bg-white text-indigo-700 font-mono text-sm focus:outline-none"
            />
            <button
              className="px-4 py-2 rounded-r-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
              onClick={() => {
                navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${userId !== 'anon' ? userId : 'your-id'}`);
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </section>
      {/* How it Works Section */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-6 mb-10 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">How it works</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
          <HowItWorksStep icon="🔗" title="1. Paste a product link or description" desc="Just drop in your Shopify, TikTok, or Etsy link—or write a quick description." />
          <HowItWorksStep icon="✨" title="2. Pick your style & platform" desc="Choose your tone, platform, and pitch length. Hit Generate!" />
          <HowItWorksStep icon="🚀" title="3. Get your pitch & export" desc="Edit, download, or share your AI script, voice, and video instantly." />
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="w-full max-w-2xl flex flex-col items-center gap-6 mb-10 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">What users are saying</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
          <Testimonial
            quote="PitchPal made my TikTok Shop videos so much easier. The AI script was spot on!"
            name="Ada O."
            avatar="/avatar1.jpg"
          />
          <Testimonial
            quote="I love how fast and simple it is. I had a voiceover and video in minutes."
            name="James T."
            avatar="/avatar2.jpg"
          />
          <Testimonial
            quote="The export and edit options are a game changer for my Shopify store."
            name="Fatima S."
            avatar="/avatar3.jpg"
          />
        </div>
      </section>
      {/* Main Form Section */}
      <div id="pitchpal-form" className="w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 rounded-3xl shadow-2xl p-10 flex flex-col gap-10 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
        <AnimatePresence>
          {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
          {showLimitModal && <LimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} onUpgrade={() => { setShowLimitModal(false); setShowProModal(true); }} />}
        </AnimatePresence>
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.svg" alt="PitchPal logo" width={120} height={30} className="dark:invert" />
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">PitchPal</h1>
          <p className="text-zinc-500 dark:text-zinc-300 text-center text-base">AI Voice/Video Product Pitch Generator</p>
        </div>
        <motion.form layout className="flex flex-col gap-6" onSubmit={handleSubmit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex gap-2 justify-center mb-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 shadow-sm ${inputMode === "url" ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"}`}
              onClick={() => setInputMode("url")}
              type="button"
            >
              Product URL
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 shadow-sm ${inputMode === "desc" ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"}`}
              onClick={() => setInputMode("desc")}
              type="button"
            >
              Description + Image
            </motion.button>
          </div>
          {inputMode === "url" ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="product-url" className="text-zinc-700 dark:text-zinc-200 font-medium">Product URL</label>
              <input
                id="product-url"
                type="url"
                placeholder="Paste product URL (Shopify, TikTok, etc.)"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-base bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <label htmlFor="product-description" className="text-zinc-700 dark:text-zinc-200 font-medium">Product Description</label>
              <textarea
                id="product-description"
                placeholder="Enter product description..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-base bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                required
              />
              <label htmlFor="product-image" className="text-zinc-700 dark:text-zinc-200 font-medium">Product Image (optional)</label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                className="w-full text-sm"
                onChange={e => setImage(e.target.files?.[0] || null)}
              />
            </>
          )}
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="tone-select" className="text-zinc-700 dark:text-zinc-200 font-medium">Tone</label>
              <select
                id="tone-select"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="platform-select" className="text-zinc-700 dark:text-zinc-200 font-medium">Platform</label>
              <select
                id="platform-select"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
              >
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="length-select" className="text-zinc-700 dark:text-zinc-200 font-medium">Length</label>
              <select
                id="length-select"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={length}
                onChange={e => setLength(e.target.value)}
              >
                {LENGTHS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <motion.button
            type="submit"
            className="mt-2 w-full rounded-2xl bg-indigo-600 text-white py-3 font-bold text-lg hover:bg-indigo-500 transition disabled:opacity-60 shadow-lg flex items-center justify-center gap-2"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            aria-label="Generate Pitch"
          >
            {loading ? <FaSpinner className="animate-spin h-5 w-5" /> : null}
            {loading ? "Generating..." : "Generate Pitch"}
          </motion.button>
        </motion.form>
        {error && <div className="text-red-500 text-sm text-center font-semibold mt-2">{error}</div>}
        <AnimatePresence>
          {script.length > 0 && (
            <motion.div
              key="script-output"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-gradient-to-br from-indigo-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800 rounded-2xl p-6 flex flex-col gap-3 border border-zinc-200 dark:border-zinc-800 shadow-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-2 flex items-center gap-2 justify-center"
              >
                <span className="text-green-600 dark:text-green-400 text-lg font-bold">Pitch generated!</span>
                <FaSpinner className="hidden" />
              </motion.div>
              <div className="font-semibold mb-1 text-zinc-700 dark:text-zinc-200 text-lg">Your AI Pitch Script:</div>
              {script.map((line, idx) => (
                <input
                  key={idx}
                  value={line}
                  onChange={e => handleScriptChange(idx, e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-base mb-1 shadow-sm"
                />
              ))}
              <div className="flex items-center gap-2 mt-4">
                <select
                  className="rounded-lg border px-2 py-2 bg-white dark:bg-zinc-900"
                  value={voiceStyle}
                  onChange={e => setVoiceStyle(e.target.value)}
                >
                  {VOICE_STYLES.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
                <motion.button
                  className="rounded-xl bg-zinc-900 text-white px-4 py-2 font-semibold text-base hover:bg-zinc-700 transition disabled:opacity-60"
                  onClick={handleGenerateVoice}
                  disabled={voiceLoading}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                >
                  {voiceLoading ? "Generating..." : "Generate Voiceover"}
                </motion.button>
              </div>
              {voiceError && <div className="text-red-500 text-sm text-center mt-2">{voiceError}</div>}
              {audioUrl && (
                <audio controls className="w-full mt-3">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              {audioSupabaseUrl && (
                <a href={audioSupabaseUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 underline text-sm mt-1">Download from cloud</a>
              )}
              <div className="flex items-center gap-2 mt-4">
                <motion.button
                  className="rounded-xl bg-zinc-900 text-white px-4 py-2 font-semibold text-base hover:bg-zinc-700 transition disabled:opacity-60"
                  onClick={handleGenerateVideo}
                  disabled={videoLoading}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.03 }}
                >
                  {videoLoading ? "Generating..." : "Generate Video Preview"}
                </motion.button>
              </div>
              {videoError && <div className="text-red-500 text-sm text-center mt-2">{videoError}</div>}
              {videoUrl && (
                <video controls className="w-full mt-3 rounded-xl shadow" src={videoUrl} />
              )}
              {videoSupabaseUrl && (
                <a href={videoSupabaseUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 underline text-sm mt-1">Download video from cloud</a>
              )}
              {(script.length > 0 || audioUrl) && (
                <div className="flex gap-2 mt-4">
                  {script.length > 0 && (
                    <CopyScriptButton script={script} />
                  )}
                  {audioUrl && (
                    <DownloadAudioButton audioUrl={audioUrl} />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 sm:hidden pointer-events-none">
        <motion.a
          href="#pitchpal-form"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          className="pointer-events-auto inline-block rounded-2xl bg-indigo-600 text-white px-8 py-4 font-bold text-lg shadow-lg hover:bg-indigo-500 transition max-w-xs"
          aria-label="Try PitchPal Free (Mobile)"
        >
          Try PitchPal Free
        </motion.a>
      </div>
      {/* Footer */}
      <footer className="w-full flex flex-col items-center gap-2 mt-12 mb-2 text-zinc-500 dark:text-zinc-400 text-sm">
        <div className="flex gap-4 mb-1">
          <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600" aria-label="Twitter"><FaTwitter size={20} /></a>
          <a href="https://github.com/stanleyjpeg/pitchpal2" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600" aria-label="GitHub"><FaGithub size={20} /></a>
          <a href="https://pitchpal.ai" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600" aria-label="Website"><FaGlobe size={20} /></a>
        </div>
        <div>© {new Date().getFullYear()} PitchPal. Built with ❤️ by Stanley Okeke.</div>
      </footer>
    </div>
  );
}

// --- Utility Components ---

import { useState as useClientState } from "react";

function CopyScriptButton({ script }: { script: string[] }) {
  const [copied, setCopied] = useClientState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(script.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <motion.button
      className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
      onClick={handleCopy}
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
    >
      {copied ? "Copied!" : "Copy Script"}
    </motion.button>
  );
}

function DownloadAudioButton({ audioUrl }: { audioUrl: string }) {
  const [downloading, setDownloading] = useClientState(false);
  const [done, setDone] = useClientState(false);
  async function handleDownload() {
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
    setDownloading(false);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }
  return (
    <motion.button
      className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
      onClick={handleDownload}
      type="button"
      disabled={downloading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
    >
      {done ? "Downloaded!" : downloading ? "Downloading..." : "Download MP3"}
    </motion.button>
  );
}

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      title: "Welcome to PitchPal!",
      emoji: "👋",
      desc: "PitchPal helps you create persuasive product pitches in seconds. Let's get started!",
    },
    {
      title: "Paste a Product Link or Description",
      emoji: "🔗",
      desc: "Just drop in your Shopify, TikTok, or Etsy link—or write a quick description of your product.",
    },
    {
      title: "Pick Your Style & Platform",
      emoji: "✨",
      desc: "Choose your tone, platform, and pitch length. Tailor your pitch for TikTok, IG Reels, or a landing page.",
    },
    {
      title: "Generate & Export Instantly",
      emoji: "🚀",
      desc: "Get your AI-generated script, voiceover, and video preview. Edit, download, or share with one click!",
    },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center gap-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">{steps[step].emoji}</span>
          <h2 className="text-xl font-bold mb-1">{steps[step].title}</h2>
          <p className="text-zinc-700 dark:text-zinc-200 text-center">{steps[step].desc}</p>
        </div>
        <div className="flex gap-2 w-full justify-between mt-2">
          <button
            className="rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition disabled:opacity-50"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={isFirst}
            type="button"
          >
            Back
          </button>
          {!isLast ? (
            <button
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium text-base hover:bg-indigo-500 transition"
              onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
              type="button"
            >
              Next
            </button>
          ) : (
            <button
              className="rounded-xl bg-zinc-900 text-white px-6 py-2 font-semibold text-base hover:bg-zinc-700 transition"
              onClick={onClose}
              type="button"
            >
              Get Started
            </button>
          )}
        </div>
        <div className="flex gap-1 mt-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full ${i === step ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LimitModal({ open, onClose, onUpgrade }: { open: boolean, onClose: () => void, onUpgrade: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center gap-6">
        <h2 className="text-xl font-bold mb-2">Free Limit Reached</h2>
        <p className="text-zinc-700 dark:text-zinc-200 text-center">You’ve reached your free export limit. Upgrade to PitchPal Pro for unlimited access!</p>
        <motion.button
          className="mt-2 rounded-xl bg-yellow-500 text-black px-4 py-2 font-medium text-base hover:bg-yellow-400 transition"
          onClick={onUpgrade}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="button"
        >
          Upgrade to Pro
        </motion.button>
        <motion.button
          className="mt-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
          onClick={onClose}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="button"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

function Benefit({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-2 text-base font-medium shadow-sm">
      <span className="text-xl">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function HowItWorksStep({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-6 py-4 shadow-sm w-full max-w-xs">
      <span className="text-3xl mb-1">{icon}</span>
      <div className="font-semibold text-zinc-900 dark:text-white text-lg">{title}</div>
      <div className="text-zinc-500 dark:text-zinc-300 text-sm">{desc}</div>
    </div>
  );
}

function Testimonial({ quote, name, avatar }: { quote: string; name: string; avatar: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-6 py-6 shadow-md w-full max-w-xs">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full mb-2 object-cover" />
      <div className="italic text-zinc-700 dark:text-zinc-200 text-base mb-1">“{quote}”</div>
      <div className="font-semibold text-indigo-600 text-sm">{name}</div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
