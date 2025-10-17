import ContactInfoButton from "../../components/ContactInfoButton";
import ProjectAIDetailsButton from "../../components/ProjectAIDetailsButton";
import ProjectShredForgeDetailsButton from "../../components/ProjectShredForgeDetailsButton";
import Image from "next/image";
import ProjectTerminalDetailsButton from "../../components/ProjectTerminalDetailsButton";
import ProjectDeployOptimizationDetailsButton from "../../components/ProjectDeployOptimizationDetailsButton";
import ProjectRVScrapingDetailsButton from "../../components/ProjectRVScrapingDetailsButton";
export const metadata = {
  title: "Henry Allen — Portfolio",
  description: "A modern, thoughtfully designed developer portfolio.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-14">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight text-white/90">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.08]">
      {children}
      <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 translate-y-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 transition-all duration-500 group-hover:bottom-0 group-hover:opacity-100" />
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      {/* Hero */}
      <header className="relative mx-auto w-full max-w-6xl px-6 pt-14 pb-10">
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Henry Allen
            </h1>
            <Image
              src="/henry.png"
              alt="Henry Allen headshot"
              width={112}
              height={112}
              priority
              className="h-28 w-28 rounded-full object-cover"
            />
          </div>
          <p className="max-w-2xl text-pretty text-white/70">
            Full‑stack engineer focused on building cinematic, user‑centric experiences. I love
            crafting performant interfaces, robust systems, and tools that feel delightful.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/Henry-Allen"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/william-allen-b72b72387/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              LinkedIn
            </a>
            <ContactInfoButton email="heman7557@gmail.com" phone="(720) 496 7648" />
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              Resume
            </a>
          </div>
        </div>
      </header>

      {/* Projects */}
      <Section title="Projects">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectRVScrapingDetailsButton>
            <Card>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-white/15">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/80"><path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"/></svg>
                <span>View details</span>
              </div>
              <h3 className="text-lg font-semibold flex items-center gap-2">RV Scraping <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
              <p className="mt-2 text-sm text-white/70">Web scraper for RV inventory data aggregation.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Node.js</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">TypeScript</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
              </div>
            </Card>
          </ProjectRVScrapingDetailsButton>
          <ProjectDeployOptimizationDetailsButton>
            <Card>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-white/15">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/80"><path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"/></svg>
                <span>View details</span>
              </div>
              <h3 className="text-lg font-semibold flex items-center gap-2">Deploy Optimization <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
              <p className="mt-2 text-sm text-white/70">
                Improved Angular deploy times on AWS using Docker to skip `node_modules` installs.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Docker</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">AWS</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">DevOps</span>
              </div>
            </Card>
          </ProjectDeployOptimizationDetailsButton>
          <ProjectAIDetailsButton>
            <Card>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-white/15">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/80"><path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"/></svg>
                <span>View details</span>
              </div>
              <h3 className="text-lg font-semibold flex items-center gap-2">AI Automation <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
              <p className="mt-2 text-sm text-white/70">
                Authored agents docs and created scripts to auto‑run codex on Jira tickets.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">LLM</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Jira</span>
              </div>
            </Card>
          </ProjectAIDetailsButton>
          <ProjectShredForgeDetailsButton>
            <Card>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-white/15">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/80"><path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"/></svg>
                <span>View details</span>
              </div>
              <h3 className="text-lg font-semibold flex items-center gap-2">ShredForge (WIP) <Image src="/csusm.png" alt="CSUSM logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
              <p className="mt-2 text-sm text-white/70">
                Real‑time guitar note detection and scoring app for performance practice.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Java</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">JavaFX</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">DSP</span>
              </div>
            </Card>
          </ProjectShredForgeDetailsButton>
          <ProjectTerminalDetailsButton>
            <Card>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-white/15">
                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/80"><path fill="currentColor" d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7Zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"/></svg>
                <span>View details</span>
              </div>
              <h3 className="text-lg font-semibold">Terminal Portfolio</h3>
              <p className="mt-2 text-sm text-white/70">
                Cinematic, terminal‑style portfolio that emulates a remote Mac shell experience.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Next.js</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">TypeScript</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">xterm.js</span>
              </div>
            </Card>
          </ProjectTerminalDetailsButton>
        </div>
      </Section>
    </main>
  );
}
