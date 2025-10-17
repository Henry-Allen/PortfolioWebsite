import { INIT_SENTINEL } from './seedData';
import { resolvePath } from './resolvePath';
import { Vfs } from './vfs';

export interface IO {
  write: (text: string) => void;
  writeln: (text?: string) => void;
}

export interface CommandContext {
  cwd: string;
  home: string;
  vfs: Vfs;
  setCwd: (nextPath: string) => void;
}

export type Command = (args: string[], context: CommandContext, io: IO) => Promise<void> | void;

function formatColumns(items: string[]): string {
  if (items.length === 0) {
    return '';
  }

  const longest = items.reduce((max, item) => Math.max(max, item.length), 0);
  const columnWidth = Math.min(longest + 2, 32);
  const maxColumns = Math.max(1, Math.floor(80 / columnWidth));
  const rows = Math.ceil(items.length / maxColumns);
  const lines: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = '';
    for (let col = 0; col < maxColumns; col += 1) {
      const index = row + col * rows;
      if (index >= items.length) {
        continue;
      }

      const value = items[index];
      const isLast = col === maxColumns - 1;
      line += isLast ? value : value.padEnd(columnWidth, ' ');
    }
    lines.push(line.trimEnd());
  }

  return lines.join('\n');
}

const ls: Command = async (args, context, io) => {
  const targetInput = args[0] ?? context.cwd;
  const targetPath = resolvePath(targetInput, context.cwd, context.home);

  if (!(await context.vfs.exists(targetPath))) {
    io.writeln(`ls: no such file or directory: ${targetInput}`);
    return;
  }

  if (await context.vfs.isFile(targetPath)) {
    const segments = targetPath.split('/');
    io.writeln(segments.at(-1) ?? targetPath);
    return;
  }

  const entries = await context.vfs.readdir(targetPath);
  const sentinelName = INIT_SENTINEL.split('/').pop();
  const visibleEntries = sentinelName ? entries.filter((entry) => entry !== sentinelName) : entries;

  const decorated = await Promise.all(
    visibleEntries.map(async (entry) => {
      const fullPath = targetPath === '/' ? `/${entry}` : `${targetPath}/${entry}`;
      const isDir = await context.vfs.isDir(fullPath);
      return isDir ? `${entry}/` : entry;
    })
  );

  const output = formatColumns(decorated.sort((a, b) => a.localeCompare(b)));
  io.writeln(output);
};

const resume: Command = async (_, __, io) => {
  const label = 'Opening resume: ';
  const steps = 20;
  const barWidth = 20;
  for (let i = 0; i <= steps; i += 1) {
    const progress = Math.round((i / steps) * 100);
    const filledCount = Math.round((i / steps) * barWidth);
    const filled = '#'.repeat(filledCount);
    const empty = ' '.repeat(Math.max(0, barWidth - filledCount));
    io.write(`\x1b[2K\x1b[G${label}[${filled}${empty}] ${progress}%`);
    await sleep(50);
  }
  await sleep(500);
  io.writeln('');

  // Attempt to open in new tab from direct user gesture context
  let opened = false;
  if (typeof window !== 'undefined') {
    const w = window.open('/resume.pdf', '_blank');
    opened = !!w;
  }
  // Fallback to same-tab navigation if blocked
  if (!opened && typeof window !== 'undefined') {
    window.location.href = '/resume.pdf';
  }
};

const cd: Command = async (args, context, io) => {
  const targetInput = args[0];
  const nextPath = resolvePath(targetInput ?? context.home, context.cwd, context.home);

  const resolvedPath = await context.vfs.normalizePath(nextPath);
  if (!resolvedPath) {
    io.writeln(`cd: no such file or directory: ${targetInput ?? context.home}`);
    return;
  }

  if (!(await context.vfs.isDir(resolvedPath))) {
    io.writeln(`cd: not a directory: ${targetInput ?? nextPath}`);
    return;
  }

  context.setCwd(resolvedPath);
};

const pwd: Command = (_, context, io) => {
  io.writeln(context.cwd);
};

const cat: Command = async (args, context, io) => {
  const fileInput = args[0];
  if (!fileInput) {
    io.writeln('cat: missing file operand');
    return;
  }

  const targetPath = resolvePath(fileInput, context.cwd, context.home);

  const normalizedPath = await context.vfs.normalizePath(targetPath);
  if (!normalizedPath) {
    io.writeln(`cat: no such file or directory: ${fileInput}`);
    return;
  }

  if (!(await context.vfs.isFile(normalizedPath))) {
    io.writeln(`cat: ${fileInput}: Is a directory`);
    return;
  }

  if (!context.vfs.isReadable(targetPath)) {
    io.writeln('cat: permission denied');
    return;
  }

  const content = await context.vfs.readFile(normalizedPath);
  io.writeln(content);
};

const help: Command = async (_, __, io) => {
  io.writeln('Available commands:');
  io.writeln('  ls [path]       - list directory contents');
  io.writeln('  cd [path]       - change directory');
  io.writeln('  pwd             - print the current directory');
  io.writeln('  cat <file>      - print file contents (where permitted)');
  io.writeln('  openPortfolio   - launch the full portfolio overview');
  io.writeln('  resume          - open resume PDF in a new tab');
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const openPortfolio: Command = async (_, __, io) => {
  io.writeln('Fetching portfolio metadata...');
  await sleep(400);
  io.writeln('Resolving dependencies...');
  await sleep(500);
  for (let i = 1; i <= 5; i += 1) {
    io.writeln(`Downloading assets (${i}/5)...`);
    await sleep(300);
  }
  io.writeln('Verifying integrity...');
  await sleep(350);
  io.writeln('Installing...');
  await sleep(400);
  io.writeln('Launch: opening portfolio in a new tab.');
  await sleep(1000);

  // Try to open immediately to leverage the direct user gesture (prevents mobile popup blockers)
  let openedNewTab = false;
  if (typeof window !== 'undefined') {
    const newWin = window.open('/portfolio', '_blank');
    openedNewTab = !!newWin;
  }

  // If popup was blocked, gracefully fall back to same-tab navigation
  if (!openedNewTab && typeof window !== 'undefined') {
    window.location.href = '/portfolio';
  }
};

const commandHandlers: Record<string, Command> = {
  ls,
  cd,
  pwd,
  cat,
  openPortfolio,
  resume,
  help,
};

export function getCommand(name: string): Command | undefined {
  const lower = name.toLowerCase();
  return commandLookup[lower];
}

export const commands = commandHandlers;

const commandLookup: Record<string, Command> = Object.fromEntries(
  Object.entries(commandHandlers).map(([commandName, handler]) => [commandName.toLowerCase(), handler])
) as Record<string, Command>;
