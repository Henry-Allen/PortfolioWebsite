import ContactInfoButton from "../../components/ContactInfoButton";
import ProjectAIDetailsButton from "../../components/ProjectAIDetailsButton";
import ProjectShredForgeDetailsButton from "../../components/ProjectShredForgeDetailsButton";
import Image from "next/image";
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
        <div className="absolute inset-0 -z-10 blur-3xl [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
          <div className="mx-auto h-64 max-w-4xl bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-yellow-500/20" />
        </div>
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Available for interesting projects
          </span>
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
              className="h-28 w-28 rounded-full ring-1 ring-white/20 object-cover"
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
          </div>
        </div>
      </header>

      {/* Projects */}
      <Section title="Projects">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
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
          <Card>
            <h3 className="text-lg font-semibold flex items-center gap-2">RV Scraping <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
            <p className="mt-2 text-sm text-white/70">Web scraper for RV inventory data aggregation.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Node.js</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">TypeScript</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold flex items-center gap-2">Deploy Optimization <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
            <p className="mt-2 text-sm text-white/70">
              Improved Angular deploy times on AWS using Docker to skip `node_modules` installs.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Docker</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">AWS</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">CI/CD</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold flex items-center gap-2">AI Automation <Image src="/motomate.png" alt="Motomate logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
            <p className="mt-2 text-sm text-white/70">
              Authored agents docs and created scripts to auto‑run codex on Jira tickets.
            </p>
            <div className="mt-3">
              <ProjectAIDetailsButton />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">LLM</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Jira</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold flex items-center gap-2">ShredForge (WIP) <Image src="/csusm.png" alt="CSUSM logo" width={16} height={16} className="h-[1em] w-auto" /></h3>
            <p className="mt-2 text-sm text-white/70">
              Real‑time guitar note detection and scoring app for performance practice.
            </p>
            <div className="mt-3">
              <ProjectShredForgeDetailsButton />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Java</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">JavaFX</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">DSP</span>
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}
