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

export default function ProjectDeployOptimizationDetailsButton({ children }: { children?: ClickableChild }) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div style="display:grid; gap:16px;">
      <p style="color:rgba(255,255,255,0.85); font-size:14px; line-height:1.6;">
        Reduced Angular deploy times on Circle Ci and AWS by leveraging Docker and AMI caching to avoid reinstalling <code>node_modules</code> on every build.
        The pipeline builds a base image with dependencies once, then reuses it across application rebuilds, dramatically cutting CI/CD time and cost.
        This also would check the hash of the package-locks and the cached node_modules to see if they were the same, so if someone forgot to update the base image they would be notified to do so.
        With hundreds of modules this saved about 5 minuites per build, with their being a few builds each day this saves days worth of time and money in the long run.
      </p>

      <figure style="margin:0;">
        <img src="/DO1.png" alt="Docker layer caching diagram" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram 1: Old pipeline with no cached node_modules, very slow.
        </figcaption>
      </figure>

      <figure style="margin:0;">
        <img src="/DO2.png" alt="AWS CI/CD pipeline overview" style="width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.15);" />
        <figcaption style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.6);">
          Diagram 2: New pipeline with cached node_modules, much faster.
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
          title="Deploy Optimization — Details"
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
        title="Deploy Optimization — Details"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
