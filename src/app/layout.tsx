import '../styles/globals.css'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { DarkModeToggle } from "../components/DarkModeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitchPal – AI Product Pitch Generator",
  description: "Generate short, confident product pitches, voiceovers, and video previews for your e-commerce products with AI.",
  openGraph: {
    title: "PitchPal – AI Product Pitch Generator",
    description: "Generate short, confident product pitches, voiceovers, and video previews for your e-commerce products with AI.",
    url: "https://pitchpal.ai",
    siteName: "PitchPal",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "PitchPal Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchPal – AI Product Pitch Generator",
    description: "Generate short, confident product pitches, voiceovers, and video previews for your e-commerce products with AI.",
    images: ["/logo.svg"],
    creator: "@yourhandle",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="description" content="Generate short, confident product pitches, voiceovers, and video previews for your e-commerce products with AI." />
        </head>
        <body className="bg-background text-foreground min-h-screen">
          <DarkModeToggle />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
