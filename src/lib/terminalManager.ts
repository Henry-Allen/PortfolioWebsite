import type { IDisposable } from "@xterm/xterm";
import { Terminal } from "@xterm/xterm";
import { commands } from "./commands";
import type { Command, CommandContext, IO } from "./commands";
import { resolvePath } from "./resolvePath";
import { INIT_SENTINEL } from "./seedData";
import { Vfs, vfs } from "./vfs";

const PROMPT_SUFFIX = " $ ";
const ROOT_DIR = "/";

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
  private buffer = "";
  private history: string[] = [];
  private historyIndex: number = 0;
  private dataDisposable: IDisposable | null = null;
  private booting = true;

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
    this.buffer = "";
    this.historyIndex = this.history.length;
    this.term.write(`${this.cwd}${PROMPT_SUFFIX}`);
  }

  private setPromptLine(line: string): void {
    // Clear current line after prompt for history navigation
    const promptText = `${this.cwd}${PROMPT_SUFFIX}`;
    const clearSequence = "\r" + " ".repeat(promptText.length + this.buffer.length) + "\r";
    this.term.write(clearSequence);
    this.term.write(promptText + line);
    this.buffer = line;
  }

  private handleInput(data: string): void {
    switch (data) {
      case "\u0003": // Ctrl+C
        this.term.write("^C\r\n");
        this.buffer = "";
        this.printPrompt();
        break;
      case "\r":
      case "\n":
        this.executeCommand(this.buffer);
        break;
      case "\u007F": // Backspace
        if (this.buffer.length > 0) {
          this.buffer = this.buffer.slice(0, -1);
          this.term.write("\b \b");
        }
        break;
      case "\t": // Tab
        void this.handleTabCompletion();
        break;
      case "\u001b[A": // Up arrow
        this.navigateHistory(-1);
        break;
      case "\u001b[B": // Down arrow
        this.navigateHistory(1);
        break;
      default:
        if (data.startsWith("\u001b")) {
          // Ignore other control sequences
          return;
        }
        this.buffer += data;
        this.term.write(data);
        break;
    }
  }

  private async handleTabCompletion(): Promise<void> {
    const originalBuffer = this.buffer;
    const tokens = tokenize(originalBuffer);
    const endsWithWhitespace = /\s$/.test(originalBuffer);
    const fragment = endsWithWhitespace ? "" : tokens[tokens.length - 1] ?? "";
    const isCommandContext = tokens.length <= 1 && !endsWithWhitespace;
    const prefix = originalBuffer.slice(0, originalBuffer.length - fragment.length);

    let completions: string[];
    if (isCommandContext) {
      completions = this.getCommandCompletions(fragment);
    } else {
      completions = await this.getPathCompletions(fragment);
    }

    if (this.buffer !== originalBuffer) {
      return;
    }

    if (completions.length === 0) {
      this.term.write("");
      return;
    }

    if (completions.length === 1) {
      const completion = completions[0];
      let newBuffer = `${prefix}${completion}`;
      const needsTrailingSpace =
        (isCommandContext && !newBuffer.endsWith(" ")) ||
        (!isCommandContext && !completion.endsWith("/") && !newBuffer.endsWith(" "));
      if (needsTrailingSpace) {
        newBuffer += " ";
      }
      this.setPromptLine(newBuffer);
      return;
    }

    const formatted = this.formatCompletionList(completions);
    this.term.write("\r\n" + formatted.replace(/\n/g, "\r\n") + "\r\n");
    this.printPrompt();
    this.term.write(originalBuffer);
    this.buffer = originalBuffer;
  }

  private getCommandCompletions(fragment: string): string[] {
    return Object.keys(commands)
      .filter((name) => name.startsWith(fragment))
      .sort((a, b) => a.localeCompare(b));
  }

  private async getPathCompletions(fragment: string): Promise<string[]> {
    if (fragment === "~") {
      return ["~/"];
    }
    if (fragment === "..") {
      return ["../"];
    }
    if (fragment === ".") {
      return ["./"];
    }

    const home = this.vfs.getHome();
    let dirInput = "";
    let partial = fragment;

    if (fragment.endsWith("/")) {
      dirInput = fragment;
      partial = "";
    } else {
      const slashIndex = fragment.lastIndexOf("/");
      if (slashIndex >= 0) {
        dirInput = fragment.slice(0, slashIndex + 1);
        partial = fragment.slice(slashIndex + 1);
      }
    }

    const dirForResolve = dirInput || (fragment.startsWith("/") ? "/" : ".");
    let resolvedDir: string;
    try {
      resolvedDir = resolvePath(dirInput || dirForResolve, this.cwd, home);
    } catch {
      return [];
    }

    if (!(await this.vfs.exists(resolvedDir)) || !(await this.vfs.isDir(resolvedDir))) {
      return [];
    }

    const entries = await this.vfs.readdir(resolvedDir);
    const sentinelName = INIT_SENTINEL.split("/").pop();
    const suggestions: string[] = [];

    for (const entry of entries) {
      if (sentinelName && entry === sentinelName) {
        continue;
      }
      if (!entry.startsWith(partial)) {
        continue;
      }
      const fullPath = resolvedDir === "/" ? `/${entry}` : `${resolvedDir}/${entry}`;
      const isDir = await this.vfs.isDir(fullPath);
      suggestions.push(`${dirInput}${entry}${isDir ? "/" : ""}`);
    }

    suggestions.sort((a, b) => a.localeCompare(b));
    return suggestions;
  }

  private formatCompletionList(items: string[]): string {
    if (items.length === 0) {
      return "";
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
        columns.push(isLast ? value : value.padEnd(columnWidth, " "));
      }
      lines.push(columns.join("").trimEnd());
    }

    return lines.join("\n");
  }

  private navigateHistory(delta: number): void {
    if (this.history.length === 0) {
      return;
    }

    this.historyIndex = Math.min(
      this.history.length,
      Math.max(0, this.historyIndex + delta),
    );

    const entry = this.history[this.historyIndex] ?? "";
    this.setPromptLine(entry);
  }

  private async executeCommand(rawInput: string): Promise<void> {
    this.term.write("\r\n");
    const input = rawInput.trim();
    if (input) {
      this.history.push(input);
      this.historyIndex = this.history.length;
    } else {
      this.historyIndex = this.history.length;
    }

    this.buffer = "";

    if (!input) {
      this.printPrompt();
      return;
    }

    const [commandName, ...args] = tokenize(input);
    const command = (commands as Record<string, Command | undefined>)[commandName];

    if (!command) {
      this.term.writeln(`${commandName}: command not found`);
      this.printPrompt();
      return;
    }

    const io: IO = {
      write: (text: string) => {
        this.term.write(text.replace(/\n/g, "\r\n"));
      },
      writeln: (text = "") => {
        const formatted = text.replace(/\n/g, "\r\n");
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
    const lines = [
      "[ OK ] Initializing network...",
      "[ OK ] Mounting remote volume...",
      "[ OK ] Authenticating...",
    ];

    for (const line of lines) {
      this.term.writeln(line);
      await sleep(500);
    }

    const steps = 20;
    for (let i = 0; i <= steps; i += 1) {
      const progress = Math.round((i / steps) * 100);
      const filled = "#".repeat(i);
      const empty = " ".repeat(steps - i);
      this.term.write(`\rBoot progress: [${filled}${empty}] ${progress}%`);
      await sleep(70);
    }
    this.term.write("\rBoot progress: [####################] 100%\r\n");
    await sleep(350);
    this.term.writeln("Connected to remote host: portfolio@henry.local");
    await sleep(350);
    this.term.writeln("");
    this.term.writeln("Type 'help' to list available commands.");
    this.term.writeln("Hint: run openPortfolio to explore the portfolio overview." );
    await sleep(200);
  }
}

export const terminalManagerFactory = (
  terminal: Terminal,
): TerminalManager => new TerminalManager(terminal, vfs);
