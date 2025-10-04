# Terminal Portfolio

A cinematic, terminal-inspired portfolio experience that emulates connecting to a remote Mac host. Built with Next.js, xterm.js, and BrowserFS to provide a fully client-side shell, virtual filesystem, and Mac-style preview windows for portfolio content.

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to launch the terminal. The boot sequence runs automatically and drops you at the root directory (`/`).

## What You Can Do

- `help` lists the available simulated commands.
- Press Tab to autocomplete or list suggestions during navigation.
- Portfolio previews can be closed from the red titlebar control or by clicking the shaded backdrop.
- `ls`, `cd`, `pwd`, `cat`, and `open` all support absolute paths, relative paths, `.`/`..`, and `~` expansion.
- Navigate to the curated portfolio at `~/Desktop/portfolio` and use `open <file>.md` to reveal the Mac-style preview modal rendered from markdown.
- Explore the simulated filesystem layout (system folders, applications, user directories). Non-portfolio files surface permission errors when opened.
- `cat /READ_ME_FIRST.txt` hints at where the portfolio lives.

## Tech Stack

- Next.js (App Router, TypeScript)
- @xterm/xterm for terminal emulation (+ fit addon)
- BrowserFS with an IndexedDB backend for the virtual filesystem
- `marked` for markdown-to-HTML rendering inside the preview modal
- Tailwind-based styling for the terminal surface and modal chrome

## Architecture Notes

- `src/lib/vfs.ts`: Initializes BrowserFS, seeds the filesystem, and exposes helper methods for file operations and permissions.
- `src/lib/commands.ts`: Implements the command handlers and shared path resolution (`src/lib/resolvePath.ts`).
- `src/lib/terminalManager.ts`: Wires xterm.js to the command layer, including history, prompt management, and the boot sequence.
- `src/components/TerminalView.tsx`: Client-side component that mounts the terminal, handles the modal, and converts markdown to HTML.
- `src/components/PortfolioPreviewModal.tsx`: Mac-inspired modal for portfolio files.

## Development Tips

- The filesystem is persisted in IndexedDB when the browser supports it; use devtools to clear storage if you need a clean slate.
- `npm run lint` keeps the codebase aligned with the project ESLint config.
