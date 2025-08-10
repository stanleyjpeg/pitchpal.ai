"use client";

import React from "react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="PitchPal" className="h-8 w-8" />
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">PitchPal</h1>
        </div>
        <ul className="hidden md:flex space-x-8 text-base font-medium text-gray-700 dark:text-white/80">
          <li><a href="#how" className="hover:text-indigo-600 dark:hover:text-white transition-colors">How It Works</a></li>
          <li><a href="#gallery" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Demo Gallery</a></li>
          <li><a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Testimonials</a></li>
          <li><a href="#rewards" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Rewards</a></li>
        </ul>
        <a
          href="#try"
          className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-full shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Try Free
        </a>
      </div>
    </nav>
  );
}
