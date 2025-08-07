"use client";

import React from "react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">PitchPal</h1>
        <ul className="flex space-x-6 text-sm font-medium text-gray-600">
          <li><a href="#how" className="hover:text-black">How It Works</a></li>
          <li><a href="#gallery" className="hover:text-black">Demo Gallery</a></li>
          <li><a href="#testimonials" className="hover:text-black">Testimonials</a></li>
          <li><a href="#rewards" className="hover:text-black">Rewards</a></li>
        </ul>
        <a
          href="#try"
          className="bg-black text-white px-4 py-2 rounded-full hover:opacity-90 transition"
        >
          Try Free
        </a>
      </div>
    </nav>
  );
}
