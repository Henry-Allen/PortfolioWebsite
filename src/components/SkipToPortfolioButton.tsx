"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SkipToPortfolioButton() {
  const pathname = usePathname();

  if (pathname?.startsWith("/portfolio")) {
    return null;
  }

  return (
    <div className="fixed right-6 top-8 z-50">
      <Link
        href="/portfolio"
        target="_blank"
        rel="noopener noreferrer"
        className="relative rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-base font-semibold text-white shadow-lg ring-2 ring-white/30 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
      >
        <span aria-hidden className="pointer-events-none absolute -inset-2 rounded-full bg-emerald-400/30 blur-md"></span>
        <span className="relative">Skip to Portfolio</span>
      </Link>
    </div>
  );
}
