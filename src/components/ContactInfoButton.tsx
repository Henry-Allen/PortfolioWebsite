"use client";

import { useState } from "react";
import { PortfolioPreviewModal } from "./PortfolioPreviewModal";

interface ContactInfoButtonProps {
  email: string;
  phone?: string;
}

export default function ContactInfoButton({ email, phone }: ContactInfoButtonProps) {
  const [open, setOpen] = useState(false);

  const contentHtml = `
    <div>
      <div style="display:grid; gap:12px; font-size:14px; color:rgba(255,255,255,0.85);">
        <div>
          <div style="font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:4px;">Email</div>
          <div style="color:rgba(255,255,255,0.85);">${email}</div>
        </div>
        ${phone ? `<div><div style="font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:4px;">Phone</div><div style=\"color:rgba(255,255,255,0.85);\">${phone}</div></div>` : ""}
      </div>
    </div>
  `;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
      >
        Contact
      </button>
      <PortfolioPreviewModal
        isOpen={open}
        title="Contact"
        contentHtml={contentHtml}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
