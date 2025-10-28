export const HOME_DIR = "/Users/guest";

export const DIRECTORIES: string[] = [
  "/System",
  "/System/Library",
  "/System/bin",
  "/Applications",
  "/Users",
  HOME_DIR,
  `${HOME_DIR}/Desktop`,
  `${HOME_DIR}/Documents`,
  `${HOME_DIR}/Downloads`,
  "/.secrets",
  "/games",
];

export const FILES: Record<string, string> = {
  "/System/Library/Core.txt": "dyld cache integrity verified. Core frameworks locked for root-only access.",
  "/System/bin/ls": "Mach-O universal binary\ncompiled for arm64e",
  "/Applications/Preview.app": "APPL\0\0\0\0 binary blob", // intentionally unreadable
  [`${HOME_DIR}/Documents/private.txt`]: "Encrypted personal notes. Access requires admin permission.",
  [`${HOME_DIR}/Downloads/something.dmg`]: "Binary disk image contents...",
  "/.secrets/haunted.txt": "Boo",
  "/.secrets/README.txt": "Konami code will unlock the way to the real challenge.",
  "/.secrets/ascii.txt": "Consult /public/ascii-art.txt for the full reveal.\n",
  "/games/README.txt": [
    "Welcome to the hidden arcade!",
    "Available games:",
    "  - snake.sh",
    "  - hangman.sh",
    "  - frogger.sh",
    "",
    "Run one with: run <game>.sh",
  ].join("\n"),
  "/games/snake.sh": "#!/bin/bash\n# TODO: Build Snake someday.\n",
  "/games/hangman.sh": "#!/bin/bash\n# TODO: Build Hangman someday.\n",
  "/games/frogger.sh": "#!/bin/bash\n# TODO: Build Frogger someday.\n",
};

export const PREVIEWABLE_FILES: string[] = [];

export const READABLE_FILES: string[] = [
  "/.secrets/haunted.txt",
  "/.secrets/README.txt",
  "/.secrets/ascii.txt",
  "/games/README.txt",
  "/games/snake.sh",
  "/games/hangman.sh",
  "/games/frogger.sh",
];

export const INIT_SENTINEL = "/.portfolio_initialized";
