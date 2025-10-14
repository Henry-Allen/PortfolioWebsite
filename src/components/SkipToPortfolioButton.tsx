"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SkipToPortfolioButton() {
  const pathname = usePathname();

  if (pathname?.startsWith("/portfolio")) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <Link
        href="/portfolio"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md bg-white/10 px-4 py-2.5 text-base font-medium text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        Skip to Portfolio
      </Link>
    </div>
  );
}
