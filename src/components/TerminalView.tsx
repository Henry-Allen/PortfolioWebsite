"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import { marked } from "marked";
import "@xterm/xterm/css/xterm.css";
import { PortfolioPreviewModal } from "./PortfolioPreviewModal";
import { TerminalManager } from "@/lib/terminalManager";
import { vfs } from "@/lib/vfs";

marked.setOptions({
  gfm: true,
  breaks: true,
});

interface ModalState {
  open: boolean;
  title: string;
  html: string;
}

const createInitialModalState = (): ModalState => ({
  open: false,
  title: "",
  html: "",
});

export function TerminalView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<TerminalManager | null>(null);
  const [modalState, setModalState] = useState<ModalState>(() => createInitialModalState());

  useEffect(() => {
    let isActive = true;
    let resizeHandler: (() => void) | null = null;
    let term: Terminal | null = null;
    let manager: TerminalManager | null = null;
    let fitAddon: FitAddon | null = null;

    const bootstrap = async () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const addonModule = await import("@xterm/addon-fit");
      if (!isActive || !containerRef.current) {
        return;
      }

      const { FitAddon: FitAddonCtor } = addonModule;

      term = new Terminal({
        convertEol: true,
        cursorBlink: true,
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: 14,
        lineHeight: 1.25,
        theme: {
          background: "#000000",
          foreground: "#FFFFFF",
          cursor: "#FFFFFF",
        },
      });

      fitAddon = new FitAddonCtor();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();
      term.focus();

      manager = new TerminalManager(term, vfs, {
        onPreview: (path, content) => {
          if (!isActive) {
            return;
          }
          const title = path.split("/").pop() ?? path;
          const html = marked.parse(content) as string;
          setModalState({
            open: true,
            title,
            html,
          });
        },
      });

      managerRef.current = manager;
      await manager.start();

      resizeHandler = () => {
        fitAddon?.fit();
      };
      window.addEventListener("resize", resizeHandler);
    };

    void bootstrap();

    return () => {
      isActive = false;
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      managerRef.current = null;
      manager?.dispose();
      term?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!modalState.open) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalState(createInitialModalState());
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalState.open]);

  const handleClose = useCallback(() => {
    setModalState(createInitialModalState());
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <PortfolioPreviewModal
        isOpen={modalState.open}
        title={modalState.title}
        contentHtml={modalState.html}
        onClose={handleClose}
      />
    </div>
  );
}
