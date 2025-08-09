"use client";

import React from "react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)]/70 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="PitchPal" className="h-7 w-7" />
          <h1 className="text-xl font-bold text-white">PitchPal</h1>
        </div>
        <ul className="hidden md:flex space-x-6 text-sm font-medium text-white/80">
          <li><a href="#how" className="hover:text-white">How It Works</a></li>
          <li><a href="#gallery" className="hover:text-white">Demo Gallery</a></li>
          <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
          <li><a href="#rewards" className="hover:text-white">Rewards</a></li>
        </ul>
        <a href="#try" className="btn-brand px-4 py-2 rounded-full transition">Try Free</a>
      </div>
    </nav>
  );
}
