"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxSrc) {
          setLightboxSrc(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, lightboxSrc]);

  useEffect(() => {
    if (!isOpen || !articleRef.current) return;
    const root = articleRef.current;
    const onClick = (e: Event) => {
      const tgt = e.target as HTMLElement | null;
      if (tgt && tgt.tagName === 'IMG') {
        e.stopPropagation();
        const img = tgt as HTMLImageElement;
        if (img.src) setLightboxSrc(img.src);
      }
    };
    // Set cursor for any current images
    Array.from(root.querySelectorAll('img')).forEach((img) => {
      (img as HTMLImageElement).style.cursor = 'zoom-in';
    });
    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
    };
  }, [isOpen, contentHtml, lightboxSrc]);

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
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/20 transition hover:bg-white/15 hover:text-white"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M6.225 4.811 4.811 6.225 9.586 11l-4.775 4.775 1.414 1.414L11 12.414l4.775 4.775 1.414-1.414L12.414 11l4.775-4.775-1.414-1.414L11 9.586 6.225 4.811Z"/></svg>
        </button>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-white/90">{title}</h3>
          <div
            className="max-h-[60vh] overflow-y-auto text-sm text-white/80 pr-4 -mr-4"
            style={{ scrollbarGutter: "stable" }}
          >
            <article
              className="leading-relaxed"
              ref={articleRef}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </div>
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => { e.stopPropagation(); setLightboxSrc(null); }}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxSrc}
              alt="Preview"
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <button
            type="button"
            aria-label="Close image preview"
            onClick={(e) => { e.stopPropagation(); setLightboxSrc(null); }}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-white/20 transition hover:bg-white/15"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M6.225 4.811 4.811 6.225 9.586 11l-4.775 4.775 1.414 1.414L11 12.414l4.775 4.775 1.414-1.414L12.414 11l4.775-4.775-1.414-1.414L11 9.586 6.225 4.811Z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
