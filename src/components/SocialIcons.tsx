"use client";

import dynamic from "next/dynamic";

// Dynamically import each icon with SSR disabled
const FaTwitter = dynamic(() => import("react-icons/fa").then(mod => mod.FaTwitter), { ssr: false });
const FaGithub = dynamic(() => import("react-icons/fa").then(mod => mod.FaGithub), { ssr: false });
const FaGlobe = dynamic(() => import("react-icons/fa").then(mod => mod.FaGlobe), { ssr: false });
const FaSpinner = dynamic(() => import("react-icons/fa").then(mod => mod.FaSpinner), { ssr: false });

export default function SocialIcons() {
  return (
    <div className="flex gap-4 text-2xl">
      <FaTwitter />
      <FaGithub />
      <FaGlobe />
      <FaSpinner className="animate-spin" />
    </div>
  );
}
