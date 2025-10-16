"use client";

import { cloneElement, isValidElement, useState } from "react";
import { PortfolioPreviewModal } from "./PortfolioPreviewModal";

export default function ProjectShredForgeDetailsButton({ children }: { children?: React.ReactElement<any> }) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div style="display:grid; gap:16px;">
      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        ShredForge is a real-time guitar practice companion. The app listens to your playing,
        detects notes in real time, and scores accuracy and timing to help improve performance.
        This is a work in progress—more diagrams and details will be added as the project evolves.
      </p>

      <figure style="margin:0;">
        <img src="/SF1.png" alt="ShredForge use-case diagram" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram 1: High-level use case overview for ShredForge.
        </figcaption>
      </figure>

      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        Planned features include connection to online tab libraries(Songsterr), tempo control, and detailed analytics
        for pitch accuracy and rhythm consistency over time.
      </p>
    </div>
  `;

  if (children && isValidElement(children)) {
    const onOpen = () => setOpen(true);
    const origProps = (children.props ?? {}) as any;
    const trigger = cloneElement(children as any, {
      role: 'button',
      tabIndex: 0,
      onClick: (e: React.MouseEvent) => {
        origProps.onClick?.(e);
        onOpen();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
        origProps.onKeyDown?.(e);
      },
      className: `${origProps.className ?? ''} cursor-pointer`.trim(),
    } as any);

    return (
      <>
        {trigger}
        <PortfolioPreviewModal
          isOpen={open}
          title="ShredForge — Details"
          contentHtml={contentHtml}
          onClose={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
      >
        View details
      </button>
      <PortfolioPreviewModal
        isOpen={open}
        title="ShredForge — Details"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
