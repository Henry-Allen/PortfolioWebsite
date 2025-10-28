import type { IDisposable } from '@xterm/xterm';
import { Terminal } from '@xterm/xterm';
import { commands, getCommand } from './commands';
import type { CommandContext, IO } from './commands';
import { resolvePath } from './resolvePath';
import { INIT_SENTINEL } from './seedData';
import { Vfs, vfs } from './vfs';

type GrecaptchaRenderParameters = {
  sitekey: string;
  callback: (token: string) => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
};

type Grecaptcha = {
  render: (container: HTMLElement, parameters: GrecaptchaRenderParameters) => number;
  reset: (opt_widgetId?: number) => void;
  ready?: (callback: () => void) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const KONAMI_SEQUENCE = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'] as const;
const RECAPTCHA_SITE_KEY = '6LdMb_orAAAAAMQAt2IqQCD3tsv4C-q1nXp3tpm8';

let recaptchaPromise: Promise<Grecaptcha | null> | null = null;

async function loadRecaptcha(): Promise<Grecaptcha | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.grecaptcha) {
    return window.grecaptcha;
  }

  if (recaptchaPromise) {
    return recaptchaPromise;
  }

  recaptchaPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(window.grecaptcha ?? null);
    };
    script.onerror = () => {
      resolve(null);
    };
    const target = document.body ?? document.head ?? document.documentElement;
    target.appendChild(script);
  });

  return recaptchaPromise;
}

const PROMPT_SUFFIX = ' $ ';
const ROOT_DIR = '/';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|\S+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const [, doubleQuoted, singleQuoted] = match;
    if (doubleQuoted !== undefined) {
      tokens.push(doubleQuoted);
    } else if (singleQuoted !== undefined) {
      tokens.push(singleQuoted);
    } else {
      tokens.push(match[0]);
    }
  }

  return tokens;
}

export class TerminalManager {
  private term: Terminal;
  private vfs: Vfs;
  private cwd: string = ROOT_DIR;
  private buffer = '';
  private history: string[] = [];
  private historyIndex: number = 0;
  private dataDisposable: IDisposable | null = null;
  private booting = true;
  private locked = false;
  private konamiIndex = 0;
  private overlay: HTMLElement | null = null;
  private captchaWidgetId: number | null = null;
  private readonly konamiSequence = KONAMI_SEQUENCE;

  constructor(term: Terminal, filesystem: Vfs = vfs) {
    this.term = term;
    this.vfs = filesystem;
  }

  async start(): Promise<void> {
    await this.vfs.init();
    this.cwd = ROOT_DIR;
    await this.runBootSequence();
    this.attachInput();
    this.printPrompt();
  }

  dispose(): void {
    this.dataDisposable?.dispose();
    this.overlay?.remove();
    this.overlay = null;
    this.captchaWidgetId = null;
  }

  private attachInput(): void {
    this.booting = false;
    this.dataDisposable = this.term.onData((data) => {
      if (this.booting) {
        return;
      }
      this.handleInput(data);
    });
  }

  private printPrompt(): void {
    this.buffer = '';
    this.historyIndex = this.history.length;
    this.term.write(`${this.cwd}${PROMPT_SUFFIX}`);
  }

  private setPromptLine(line: string): void {
    // Clear current line after prompt for history navigation
    const promptText = `${this.cwd}${PROMPT_SUFFIX}`;
    const clearSequence = '\r' + ' '.repeat(promptText.length + this.buffer.length) + '\r';
    this.term.write(clearSequence);
    this.term.write(promptText + line);
    this.buffer = line;
  }

  private trackKonami(input: string): boolean {
    const token = this.mapKonamiToken(input);
    if (!token) {
      this.konamiIndex = 0;
      return false;
    }

    const expected = this.konamiSequence[this.konamiIndex];
    if (token === expected) {
      this.konamiIndex += 1;
      const completed = this.konamiIndex === this.konamiSequence.length;
      if (completed) {
        this.konamiIndex = 0;
        void this.triggerKonamiSequence();
        return true;
      }
      if (token === 'B' || token === 'A') {
        return true;
      }
      return this.konamiIndex > 1;
    }

    if (token === this.konamiSequence[0]) {
      this.konamiIndex = 1;
      return false;
    }

    this.konamiIndex = 0;
    return false;
  }

  private mapKonamiToken(input: string): (typeof KONAMI_SEQUENCE)[number] | null {
    switch (input) {
      case '\u001b[A':
        return 'UP';
      case '\u001b[B':
        return 'DOWN';
      case '\u001b[D':
        return 'LEFT';
      case '\u001b[C':
        return 'RIGHT';
      default: {
        if (input.length === 1) {
          const lower = input.toLowerCase();
          if (lower === 'b') {
            return 'B';
          }
          if (lower === 'a') {
            return 'A';
          }
        }
        return null;
      }
    }
  }

  private handleInput(data: string): void {
    if (this.locked) {
      return;
    }

    const consumedByKonami = this.trackKonami(data);
    if (consumedByKonami) {
      return;
    }

    switch (data) {
      case '\u0003': // Ctrl+C
        this.term.write('^C\r\n');
        this.buffer = '';
        this.printPrompt();
        break;
      case '\r':
      case '\n':
        this.executeCommand(this.buffer);
        break;
      case '\u007F': // Backspace
        if (this.buffer.length > 0) {
          this.buffer = this.buffer.slice(0, -1);
          this.term.write('\b \b');
        }
        break;
      case '\t': // Tab
        void this.handleTabCompletion();
        break;
      case '\u001b[A': // Up arrow
        this.navigateHistory(-1);
        break;
      case '\u001b[B': // Down arrow
        this.navigateHistory(1);
        break;
      default:
        if (data.startsWith('\u001b')) {
          // Ignore other control sequences
          return;
        }
        this.buffer += data;
        this.term.write(data);
        break;
    }
  }

  private async triggerKonamiSequence(): Promise<void> {
    if (this.locked) {
      return;
    }

    this.locked = true;
    this.buffer = '';
    this.historyIndex = this.history.length;
    this.term.write('\x1b[2J\x1b[H');
    this.term.write('\x1b[?25l');

    const overlay = this.createOverlay();
    if (!overlay) {
      this.term.write('Konami sequence activated, but display overlay failed.\r\n');
      this.term.write('\x1b[?25h');
      this.locked = false;
      this.printPrompt();
      return;
    }

    const message = document.createElement('div');
    message.className = 'konami-overlay__message';
    overlay.appendChild(message);

    const lines = ['So you found my secret', 'not many make it this far', "hope you're ready for a real challenge"];
    for (const line of lines) {
      await this.typeLine(message, line);
      await sleep(700);
    }

    await sleep(3000);
    await this.presentCaptcha(overlay);
  }

  private createOverlay(): HTMLElement | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const element = this.term.element;
    const parent = element?.parentElement;
    if (!parent) {
      return null;
    }

    const computed = window.getComputedStyle(parent);
    if (computed.position === 'static') {
      parent.style.position = 'relative';
    }

    const overlay = document.createElement('div');
    overlay.className = 'konami-overlay';
    parent.appendChild(overlay);
    this.overlay = overlay;

    requestAnimationFrame(() => {
      overlay.classList.add('konami-overlay--visible');
    });

    return overlay;
  }

  private async typeLine(target: HTMLElement, text: string): Promise<void> {
    target.textContent = '';
    for (const char of text) {
      target.textContent += char;
      await sleep(65 + Math.random() * 55);
    }
  }

  private async presentCaptcha(overlay: HTMLElement): Promise<void> {
    const prompt = document.createElement('div');
    prompt.className = 'konami-overlay__prompt';
    prompt.textContent = 'Click the checkbox to prove you are human:';
    overlay.appendChild(prompt);

    const captchaContainer = document.createElement('div');
    captchaContainer.className = 'konami-overlay__captcha';
    overlay.appendChild(captchaContainer);

    const grecaptcha = await loadRecaptcha();
    if (!grecaptcha) {
      captchaContainer.textContent = 'CAPTCHA failed to load. Returning to terminal...';
      await sleep(2000);
      await this.releaseKonami(overlay);
      return;
    }

    let rendered = false;
    await new Promise<void>((resolve) => {
      const render = () => {
        try {
          this.captchaWidgetId = grecaptcha.render(captchaContainer, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: () => {
              resolve();
            },
            theme: 'dark',
          });
          rendered = true;
        } catch (error) {
          console.error('reCAPTCHA render failed', error);
          resolve();
        }
      };
      if (grecaptcha.ready) {
        grecaptcha.ready(render);
      } else {
        render();
      }
    });

    if (!rendered) {
      captchaContainer.textContent = 'CAPTCHA failed to render. Returning to terminal...';
      await sleep(2000);
      await this.releaseKonami(overlay);
      return;
    }

    await this.releaseKonami(overlay);
  }

  private async releaseKonami(overlay: HTMLElement): Promise<void> {
    overlay.classList.remove('konami-overlay--visible');
    await sleep(350);
    overlay.remove();
    this.overlay = null;
    this.captchaWidgetId = null;
    this.locked = false;
    this.konamiIndex = 0;
    this.term.write('\x1b[2J\x1b[H');
    this.term.write('\x1b[?25h');
    this.printPrompt();
    this.term.focus();
  }

  private async handleTabCompletion(): Promise<void> {
    const originalBuffer = this.buffer;
    const tokens = tokenize(originalBuffer);
    const endsWithWhitespace = /\s$/.test(originalBuffer);
    const fragment = endsWithWhitespace ? '' : tokens[tokens.length - 1] ?? '';
    const isCommandContext = tokens.length <= 1 && !endsWithWhitespace;
    const prefix = originalBuffer.slice(0, originalBuffer.length - fragment.length);

    let completions: string[];
    if (isCommandContext) {
      completions = this.getCommandCompletions(fragment);
    } else {
      const commandRoot = tokens[0]?.toLowerCase();
      const directoriesOnly = commandRoot === 'cd';
      completions = await this.getPathCompletions(fragment, { directoriesOnly });
    }

    if (this.buffer !== originalBuffer) {
      return;
    }

    if (completions.length === 0) {
      this.term.write('');
      return;
    }

    if (completions.length === 1) {
      const completion = completions[0];
      let newBuffer = `${prefix}${completion}`;
      const needsTrailingSpace =
        (isCommandContext && !newBuffer.endsWith(' ')) || (!isCommandContext && !completion.endsWith('/') && !newBuffer.endsWith(' '));
      if (needsTrailingSpace) {
        newBuffer += ' ';
      }
      this.setPromptLine(newBuffer);
      return;
    }

    const formatted = this.formatCompletionList(completions);
    this.term.write('\r\n' + formatted.replace(/\n/g, '\r\n') + '\r\n');
    this.printPrompt();
    this.term.write(originalBuffer);
    this.buffer = originalBuffer;
  }

  private getCommandCompletions(fragment: string): string[] {
    const lowerFragment = fragment.toLowerCase();
    return Object.keys(commands)
      .filter((name) => name.toLowerCase().startsWith(lowerFragment))
      .sort((a, b) => a.localeCompare(b));
  }

  private async getPathCompletions(fragment: string, options: { directoriesOnly: boolean } = { directoriesOnly: false }): Promise<string[]> {
    if (fragment === '~') {
      return ['~/'];
    }
    if (fragment === '..') {
      return ['../'];
    }
    if (fragment === '.') {
      return ['./'];
    }

    const home = this.vfs.getHome();
    let dirInput = '';
    let partial = fragment;

    if (fragment.endsWith('/')) {
      dirInput = fragment;
      partial = '';
    } else {
      const slashIndex = fragment.lastIndexOf('/');
      if (slashIndex >= 0) {
        dirInput = fragment.slice(0, slashIndex + 1);
        partial = fragment.slice(slashIndex + 1);
      }
    }

    const dirForResolve = dirInput || (fragment.startsWith('/') ? '/' : '.');
    let resolvedDir: string;
    try {
      resolvedDir = resolvePath(dirInput || dirForResolve, this.cwd, home);
    } catch {
      return [];
    }

    if (!(await this.vfs.exists(resolvedDir)) || !(await this.vfs.isDir(resolvedDir))) {
      return [];
    }

    let entries = await this.vfs.readdir(resolvedDir);
    if (options.directoriesOnly) {
      const dirChecks = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = resolvedDir === '/' ? `/${entry}` : `${resolvedDir}/${entry}`;
          return (await this.vfs.isDir(fullPath)) ? entry : null;
        })
      );
      entries = dirChecks.filter((entry): entry is string => entry !== null);
    }
    const sentinelName = INIT_SENTINEL.split('/').pop();
    const suggestions: string[] = [];
    const partialLower = partial.toLowerCase();

    for (const entry of entries) {
      if (sentinelName && entry === sentinelName) {
        continue;
      }
      if (!entry.toLowerCase().startsWith(partialLower)) {
        continue;
      }
      const fullPath = resolvedDir === '/' ? `/${entry}` : `${resolvedDir}/${entry}`;
      const isDir = await this.vfs.isDir(fullPath);
      suggestions.push(`${dirInput}${entry}${isDir ? '/' : ''}`);
    }

    suggestions.sort((a, b) => a.localeCompare(b));
    return suggestions;
  }

  private formatCompletionList(items: string[]): string {
    if (items.length === 0) {
      return '';
    }

    const sorted = [...items].sort((a, b) => a.localeCompare(b));
    const longest = sorted.reduce((max, item) => Math.max(max, item.length), 0);
    const columnWidth = Math.min(longest + 2, 32);
    const maxColumns = Math.max(1, Math.floor(80 / columnWidth));
    const rows = Math.ceil(sorted.length / maxColumns);
    const lines: string[] = [];

    for (let row = 0; row < rows; row += 1) {
      const columns: string[] = [];
      for (let col = 0; col < maxColumns; col += 1) {
        const index = row + col * rows;
        if (index >= sorted.length) {
          continue;
        }
        const value = sorted[index];
        const isLast = col === maxColumns - 1;
        columns.push(isLast ? value : value.padEnd(columnWidth, ' '));
      }
      lines.push(columns.join('').trimEnd());
    }

    return lines.join('\n');
  }

  private navigateHistory(delta: number): void {
    if (this.history.length === 0) {
      return;
    }

    this.historyIndex = Math.min(this.history.length, Math.max(0, this.historyIndex + delta));

    const entry = this.history[this.historyIndex] ?? '';
    this.setPromptLine(entry);
  }

  private async executeCommand(rawInput: string): Promise<void> {
    this.term.write('\r\n');
    const input = rawInput.trim();
    if (input) {
      this.history.push(input);
      this.historyIndex = this.history.length;
    } else {
      this.historyIndex = this.history.length;
    }

    this.buffer = '';

    if (!input) {
      this.printPrompt();
      return;
    }

    const [commandName, ...args] = tokenize(input);
    const command = getCommand(commandName);

    if (!command) {
      this.term.writeln(`${commandName}: command not found`);
      this.printPrompt();
      return;
    }

    const io: IO = {
      write: (text: string) => {
        this.term.write(text.replace(/\n/g, '\r\n'));
      },
      writeln: (text = '') => {
        const formatted = text.replace(/\n/g, '\r\n');
        this.term.write(`${formatted}\r\n`);
      },
    };

    const context: CommandContext = {
      cwd: this.cwd,
      home: this.vfs.getHome(),
      vfs: this.vfs,
      setCwd: (nextPath: string) => {
        this.cwd = nextPath;
      },
      cols: this.term.cols ?? 80,
    };

    try {
      await Promise.resolve(command(args, context, io));
    } catch (error) {
      io.writeln(`Error: ${(error as Error).message}`);
    }

    this.printPrompt();
  }

  private async runBootSequence(): Promise<void> {
    this.booting = true;
    const lines = ['[ OK ] Initializing network...', '[ OK ] Mounting remote volume...', '[ OK ] Authenticating...'];

    for (const line of lines) {
      this.term.writeln(line);
      await sleep(500);
    }

    // Disable line wrap to ensure updates stay on one line on narrow/mobile screens
    this.term.write('\x1b[?7l');

    const steps = 20;
    {
      const label = 'Loading MotoMate projects: ';
      for (let i = 0; i <= steps; i += 1) {
        const progress = Math.round((i / steps) * 100);
        const reserved = 2 /*[]*/ + 1 /*space*/ + 4; /*min % digits*/
        const barWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + reserved)));
        const filledCount = Math.round((i / steps) * barWidth);
        const filled = '#'.repeat(filledCount);
        const empty = ' '.repeat(Math.max(0, barWidth - filledCount));
        this.term.write(`\x1b[2K\x1b[G${label}[${filled}${empty}] ${progress}%`);
        await sleep(70);
      }
      const finalBarWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + 2 + 1 + 4)));
      this.term.write(`\x1b[2K\x1b[G${label}[${'#'.repeat(finalBarWidth)}] 100%\r\n`);
    }
    await sleep(350);

    {
      const label = 'Loading AI agent projects: ';
      for (let i = 0; i <= steps; i += 1) {
        const progress = Math.round((i / steps) * 100);
        const reserved = 2 + 1 + 4;
        const barWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + reserved)));
        const filledCount = Math.round((i / steps) * barWidth);
        const filled = '#'.repeat(filledCount);
        const empty = ' '.repeat(Math.max(0, barWidth - filledCount));
        this.term.write(`\x1b[2K\x1b[G${label}[${filled}${empty}] ${progress}%`);
        await sleep(70);
      }
      const finalBarWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + 2 + 1 + 4)));
      this.term.write(`\x1b[2K\x1b[G${label}[${'#'.repeat(finalBarWidth)}] 100%\r\n`);
    }
    await sleep(350);

    {
      const label = 'Loading Scraping projects: ';
      for (let i = 0; i <= steps; i += 1) {
        const progress = Math.round((i / steps) * 100);
        const reserved = 2 + 1 + 4;
        const barWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + reserved)));
        const filledCount = Math.round((i / steps) * barWidth);
        const filled = '#'.repeat(filledCount);
        const empty = ' '.repeat(Math.max(0, barWidth - filledCount));
        this.term.write(`\x1b[2K\x1b[G${label}[${filled}${empty}] ${progress}%`);
        await sleep(70);
      }
      const finalBarWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + 2 + 1 + 4)));
      this.term.write(`\x1b[2K\x1b[G${label}[${'#'.repeat(finalBarWidth)}] 100%\r\n`);
    }
    await sleep(350);

    {
      const label = 'Boot progress: ';
      for (let i = 0; i <= steps; i += 1) {
        const progress = Math.round((i / steps) * 100);
        const reserved = 2 + 1 + 4;
        const barWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + reserved)));
        const filledCount = Math.round((i / steps) * barWidth);
        const filled = '#'.repeat(filledCount);
        const empty = ' '.repeat(Math.max(0, barWidth - filledCount));
        this.term.write(`\x1b[2K\x1b[G${label}[${filled}${empty}] ${progress}%`);
        await sleep(35);
      }
      const finalBarWidth = Math.max(0, Math.min(20, (this.term.cols ?? 80) - (label.length + 2 + 1 + 4)));
      this.term.write(`\x1b[2K\x1b[G${label}[${'#'.repeat(finalBarWidth)}] 100%\r\n`);
    }
    await sleep(350);

    // Re-enable line wrap after boot sequence
    this.term.write('\x1b[?7h');

    this.term.writeln('Connected to remote host: portfolio@henry.local');
    await sleep(350);
    this.term.writeln('');
    this.term.writeln("Type 'help' to list available commands.");
    this.term.writeln(`Hint: run \x1b[32mopenPortfolio\x1b[0m to explore the portfolio overview.`);
    this.term.writeln(`Hint: or run \x1b[32mresume\x1b[0m to open the resume.`);
    await sleep(200);
  }
}

export const terminalManagerFactory = (terminal: Terminal): TerminalManager => new TerminalManager(terminal, vfs);
