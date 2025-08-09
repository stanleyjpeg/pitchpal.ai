import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { DarkModeToggle } from "../components/DarkModeToggle";
import "../styles/globals.css";

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
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="bg-background text-foreground min-h-screen h-full">
          {/* Google Analytics */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `}
              </Script>
            </>
          )}
          <DarkModeToggle />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

