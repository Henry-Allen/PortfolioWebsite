import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Henry Allen — Terminal Portfolio",
  description: "A cinematic, terminal-style portfolio experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <div className="fixed right-4 top-4 z-50">
          <Link
            href="/portfolio"
            className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Skip to Portfolio
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}
