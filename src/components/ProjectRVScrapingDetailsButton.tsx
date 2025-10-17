"use client";

import { cloneElement, isValidElement, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactElement } from "react";
import { PortfolioPreviewModal } from "./PortfolioPreviewModal";

type ClickableChildProps = {
  className?: string;
  onClick?: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
};

type ClickableChild = ReactElement<ClickableChildProps>;

export default function ProjectRVScrapingDetailsButton({ children }: { children?: ClickableChild }) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div style="display:grid; gap:16px;">
      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        Helped to creaet web scraping settings to scrape RV inventory data from diffrent RV dealerships website hosts.
        several diffrent RV dealerships would use diffrent host with diffrent API's for their backend.
        So for each of these we would have to analyze their api and find endpoints we could use to scrape their inventory data to store in our db.
      </p>

      <figure style="margin:0;">
        <img src="/RV1.png" alt="RV scraping flow diagram" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram: high-level overview of the scraping process.
        </figcaption>
      </figure>
    </div>
  `;

  if (children && isValidElement(children)) {
    const onOpen = () => setOpen(true);
    const origProps = (children.props ?? {}) as ClickableChildProps;
    const trigger = cloneElement<ClickableChildProps>(children as ClickableChild, {
      role: 'button',
      tabIndex: 0,
      onClick: (e) => {
        origProps.onClick?.(e);
        onOpen();
      },
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
        origProps.onKeyDown?.(e);
      },
      className: `${origProps.className ?? ''} cursor-pointer`.trim(),
    });

    return (
      <>
        {trigger}
        <PortfolioPreviewModal
          isOpen={open}
          title="RV Scraping — Details"
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
        title="RV Scraping — Details"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
