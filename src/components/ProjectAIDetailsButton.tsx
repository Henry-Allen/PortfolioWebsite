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

export default function ProjectAIDetailsButton({ children }: { children?: ClickableChild }) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div style="display:grid; gap:16px;">
      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        Previously we were running codex on jira tickets manually, which was time consuming and offset the value of the AI.
        So to fix this we created an automated process to run every time a ticket was created with the codex tag to automatically run codex on the ticket.
        We noticed that codex often wouldnt get stuff right on the first run and often required developers to manually fix its mistakes so we changed our workflow to a plan first method.
        This allowed us to see what codex would do beforehand quickly and either fix its plan or approve it and get codex working on the ticket.
      </p>

      <figure style="margin:0;">
        <img src="/AI1.png" alt="AI automation diagram 1" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram 1: High-level overview of the AI agent orchestration.
        </figcaption>
      </figure>

      <figure style="margin:0;">
        <img src="/AI2.png" alt="AI automation diagram 2" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram 2: Detailed flow for ticket ingestion and action planning.
        </figcaption>
      </figure>

      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        Additionlly we also had to make newe agent.md files for our repos explaining our entire file structure and coding practices that codex would need to follow.
        This also help with individual devlopers own ai agents they would use like Windsurf or Codex to improve the efficiency of their work as well.
      </p>
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
          title="AI Automation — Details"
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
        title="AI Automation — Details"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
