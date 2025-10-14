"use client";

import { useEffect } from "react";

interface PortfolioPreviewModalProps {
  isOpen: boolean;
  title: string;
  contentHtml: string;
  onClose: () => void;
}

export function PortfolioPreviewModal({
  isOpen,
  title,
  contentHtml,
  onClose,
}: PortfolioPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };


  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-[min(90vw,520px)] max-h-[80vh] overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-white/90">{title}</h3>
          <div
            className="max-h-[60vh] overflow-y-auto text-sm text-white/80 pr-4 -mr-4"
            style={{ scrollbarGutter: "stable" }}
          >
            <article
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
