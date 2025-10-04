"use client";

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
        className="relative w-[min(90vw,700px)] max-h-[80vh] overflow-hidden rounded-xl border border-black/40 bg-[#f5f5f5] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between bg-[#e6e6e6] px-4 py-2 text-sm font-medium text-black">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-3 w-3 rounded-full border border-[#d44] bg-[#ff5f57]"
                aria-label="Close preview"
              />
              <span className="h-3 w-3 rounded-full bg-[#febb2e]" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-[#28c940]" aria-hidden />
            </div>
            <span className="truncate">{title}</span>
          </div>
        </header>
        <div className="max-h-[70vh] overflow-y-auto bg-white px-6 py-6 text-black">
          <article
            className="markdown-content text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}
