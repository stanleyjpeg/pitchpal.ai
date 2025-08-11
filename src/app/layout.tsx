import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { ToastProvider } from "../components/Toast";
import "../styles/globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pitchpal-ai-five.vercel.app"),
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
    <>
      <Head>
        <title>PitchPal – AI-Powered Voice & Video Pitches</title>
        <meta name="description" content="Create persuasive product pitches in seconds with AI-powered voice and video. Paste your product link, pick your style, and get a compelling pitch instantly!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cool-flan-7be6b6.netlify.app/" />
        <meta property="og:title" content="PitchPal – AI-Powered Voice & Video Pitches" />
        <meta property="og:description" content="Create persuasive product pitches in seconds with AI-powered voice and video. Paste your product link, pick your style, and get a compelling pitch instantly!" />
        <meta property="og:image" content="/logo.svg" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PitchPal – AI-Powered Voice & Video Pitches" />
        <meta name="twitter:description" content="Create persuasive product pitches in seconds with AI-powered voice and video. Paste your product link, pick your style, and get a compelling pitch instantly!" />
        <meta name="twitter:image" content="/logo.svg" />
      </Head>
      <ClerkProvider>
        <html lang="en" className="h-full">
          <body className="bg-background text-foreground min-h-screen h-full">
            <ToastProvider>
              <DarkModeToggle />
              {children}
              <Analytics />
            </ToastProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}

