export const HOME_DIR = "/Users/guest";
export const PORTFOLIO_DIR = `${HOME_DIR}/Desktop/portfolio`;

export const DIRECTORIES: string[] = [
  "/System",
  "/System/Library",
  "/System/bin",
  "/Applications",
  "/Users",
  HOME_DIR,
  `${HOME_DIR}/Desktop`,
  PORTFOLIO_DIR,
  `${HOME_DIR}/Documents`,
  `${HOME_DIR}/Downloads`,
];

export const FILES: Record<string, string> = {
  "/READ_ME_FIRST.txt": `Psst... the good stuff lives on the guest account. Try running \`cd ~/Desktop/portfolio\` and then \`open skills.md\` to crack it open.`,
  "/System/Library/Core.txt": "dyld cache integrity verified. Core frameworks locked for root-only access.",
  "/System/bin/ls": "Mach-O universal binary\ncompiled for arm64e",
  "/Applications/Preview.app": "APPL\0\0\0\0 binary blob", // intentionally unreadable
  [`${HOME_DIR}/Documents/private.txt`]: "Encrypted personal notes. Access requires admin permission.",
  [`${HOME_DIR}/Downloads/something.dmg`]: "Binary disk image contents...",
  [`${PORTFOLIO_DIR}/skills.md`]: `# Skills

- TypeScript, React, Next.js
- Node.js, GraphQL, REST API design
- CSS architectures (Tailwind, CSS Modules), design systems
- DevOps basics: Docker, CI/CD pipelines, monitoring
- Product-focused: UX collaboration, rapid prototyping, storytelling`,
  [`${PORTFOLIO_DIR}/experience.md`]: `# Experience

## Senior Frontend Engineer - Arc Light Labs
*2021 - Present*
- Led the rebuild of the design system powering 12 products, cutting UI defect reports by 35%.
- Delivered performance audits that reduced critical path JS by 40%.

## Frontend Engineer - Signalwave
*2018 - 2021*
- Built real-time monitoring dashboards used by 4,000+ ops engineers.
- Piloted accessibility initiatives that brought WCAG AA compliance across marketing web properties.`,
  [`${PORTFOLIO_DIR}/projects.md`]: `# Projects

### Terminal Portfolio
A cinematic, terminal-style portfolio that emulates a remote Mac shell experience.

### Storyboard
Interactive story-pitch platform with collaborative feedback cycles for creative teams.

### Lighthouse Keeper
Automation toolkit that wraps Lighthouse in polished reporting for non-technical stakeholders.`,
  [`${PORTFOLIO_DIR}/contact.md`]: `# Contact

- Email: [henry@henryallen.dev](mailto:henry@henryallen.dev)
- GitHub: [github.com/henryallen](https://github.com/henryallen)
- LinkedIn: [in/henry-allen](https://www.linkedin.com/in/henry-allen/)

Let's build something cinematic together.`,
};

export const PREVIEWABLE_FILES: string[] = [
  `${PORTFOLIO_DIR}/skills.md`,
  `${PORTFOLIO_DIR}/experience.md`,
  `${PORTFOLIO_DIR}/projects.md`,
  `${PORTFOLIO_DIR}/contact.md`,
];

export const READABLE_FILES: string[] = [
  "/READ_ME_FIRST.txt",
  ...PREVIEWABLE_FILES,
];

export const INIT_SENTINEL = "/.portfolio_initialized";
