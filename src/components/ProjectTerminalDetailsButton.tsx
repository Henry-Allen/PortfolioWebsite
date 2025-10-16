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

export default function ProjectTerminalDetailsButton({ children }: { children?: ClickableChild }) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div style="display:grid; place-items:center; text-align:center; padding:8px;">
      <p style="color:rgba(255,255,255,0.9); font-size:14px;">your already looking at it ;)</p>
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
          title="Terminal Portfolio — Details"
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
        title="Terminal Portfolio — Details"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
