import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samaira Studio ✦ content, reels & little internet magic",
  description:
    "A tiny content studio crafting reels and campaigns for brands that want to feel human. Browse our work and shop our products.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Samaira Studio",
    description: "Content, reels & little internet magic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${caveat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
