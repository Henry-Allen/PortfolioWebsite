import Link from "next/link";
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
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            William Henry Allen
          </h1>
          <p className="max-w-2xl text-pretty text-white/70">
            Full‑stack engineer focused on building cinematic, user‑centric experiences. I love
            crafting performant interfaces, robust systems, and tools that feel delightful.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium transition-colors hover:bg-white/90"
            >
              Back to Terminal
            </Link>
            <a
              href="https://github.com/Henry-Allen"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              GitHub
            </a>
            <a
              href="mailto:heman7557@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              Contact
            </a>
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
            <h3 className="text-lg font-semibold">RV Scraping</h3>
            <p className="mt-2 text-sm text-white/70">Web scraper for RV inventory data aggregation.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Node.js</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Cheerio</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Deploy Optimization</h3>
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
            <h3 className="text-lg font-semibold">AI Automation</h3>
            <p className="mt-2 text-sm text-white/70">
              Authored agents docs and created scripts to auto‑run codex on Jira tickets.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">LLM</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Automation</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">ShredForge (WIP)</h3>
            <p className="mt-2 text-sm text-white/70">
              Real‑time guitar note detection and scoring app for performance practice.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">DSP</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">Web Audio</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">TypeScript</span>
            </div>
          </Card>
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Intern Full Stack Engineer — Motomate123</h3>
                <p className="text-sm text-white/60">2021 – 2022</p>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
                Angular · Node.js
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Learned the basics of Angular and Node.js and shipped UI refinements and improvements.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Junior Full Stack Engineer — Motomate123</h3>
                <p className="text-sm text-white/60">2025 – Present</p>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
                Web · Automation
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Built features like RV scraping and AI automation to accelerate workflows and insights.
            </p>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {[
            "TypeScript",
            "JavaScript",
            "HTML",
            "CSS",
            "SCSS",
            "C++",
            "Node.js",
            "Angular",
            "Next.js",
            "Tailwind",
            "Docker",
            "CI/CD",
            "UX Collaboration",
            "Rapid Prototyping",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/80"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <h2 className="text-xl font-semibold">Let’s build something cinematic together</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            I’m always open to discussing new opportunities, collaborations, or ideas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:heman7557@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium transition-colors hover:bg-white/90"
            >
              Email me
            </a>
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
          </div>
        </div>
      </section>
    </main>
  );
}
