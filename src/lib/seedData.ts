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
];

export const FILES: Record<string, string> = {
  "/System/Library/Core.txt": "dyld cache integrity verified. Core frameworks locked for root-only access.",
  "/System/bin/ls": "Mach-O universal binary\ncompiled for arm64e",
  "/Applications/Preview.app": "APPL\0\0\0\0 binary blob", // intentionally unreadable
  [`${HOME_DIR}/Documents/private.txt`]: "Encrypted personal notes. Access requires admin permission.",
  [`${HOME_DIR}/Downloads/something.dmg`]: "Binary disk image contents...",
};

export const PREVIEWABLE_FILES: string[] = [];

export const READABLE_FILES: string[] = [];

export const INIT_SENTINEL = "/.portfolio_initialized";
