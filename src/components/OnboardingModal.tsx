import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";


function OnboardingModal({ onClose }: { onClose: () => void }) {
  // Show modal by default
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus trap
  useEffect(() => {
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    dialogRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables).filter(el => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previouslyFocused.current?.focus?.();
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-0 max-w-4xl w-full flex flex-col items-center border-2 border-indigo-200 dark:border-indigo-700 overflow-hidden animate-fadeIn"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="onboarding-title"
      >
        {/* Logo at the top */}
        <div className="w-full flex justify-center bg-gradient-to-r from-indigo-500 to-purple-500 py-12 px-4">
          <img src="/logo.svg" alt="PitchPal Logo" className="h-28 w-28 drop-shadow-xl" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors focus:outline-none"
          aria-label="Close onboarding"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-4 px-8 py-12 w-full max-w-2xl">
          <h2 id="onboarding-title" className="text-4xl font-extrabold text-center text-zinc-900 dark:text-white mb-2 tracking-tight">
            Welcome to PitchPal!
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 text-center mb-4 max-w-xl">
            Your AI-powered pitch creation assistant. Let's get you started!
          </p>
          <ol className="list-decimal list-inside text-left text-zinc-700 dark:text-zinc-200 space-y-2 text-lg w-full max-w-lg mx-auto">
            <li>Paste a product link or description (Shopify, TikTok, Etsy, or your own).</li>
            <li>Pick your style, platform, and pitch length.</li>
            <li>Generate your script, voiceover, and video preview instantly.</li>
            <li>Edit, download, or share your pitch with one click!</li>
          </ol>
          <button
            className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-200"
            onClick={onClose}
            autoFocus
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingModal;
