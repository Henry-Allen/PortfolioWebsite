import { INIT_SENTINEL } from "./seedData";
import { resolvePath } from "./resolvePath";
import { PORTFOLIO_MARKDOWN } from "./portfolioContent";
import { Vfs } from "./vfs";

export interface IO {
  write: (text: string) => void;
  writeln: (text?: string) => void;
}

export interface CommandContext {
  cwd: string;
  home: string;
  vfs: Vfs;
  setCwd: (nextPath: string) => void;
  openPreview: (path: string, content: string) => void;
}

export type Command = (args: string[], context: CommandContext, io: IO) => Promise<void> | void;

function formatColumns(items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  const longest = items.reduce((max, item) => Math.max(max, item.length), 0);
  const columnWidth = Math.min(longest + 2, 32);
  const maxColumns = Math.max(1, Math.floor(80 / columnWidth));
  const rows = Math.ceil(items.length / maxColumns);
  const lines: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < maxColumns; col += 1) {
      const index = row + col * rows;
      if (index >= items.length) {
        continue;
      }

      const value = items[index];
      const isLast = col === maxColumns - 1;
      line += isLast ? value : value.padEnd(columnWidth, " ");
    }
    lines.push(line.trimEnd());
  }

  return lines.join("\n");
}

const ls: Command = async (args, context, io) => {
  const targetInput = args[0] ?? context.cwd;
  const targetPath = resolvePath(targetInput, context.cwd, context.home);

  if (!(await context.vfs.exists(targetPath))) {
    io.writeln(`ls: no such file or directory: ${targetInput}`);
    return;
  }

  if (await context.vfs.isFile(targetPath)) {
    const actualPath = await context.vfs.normalizePath(targetPath);
    const segments = (actualPath ?? targetPath).split("/");
    io.writeln(segments.at(-1) ?? targetPath);
    return;
  }

  const basePath = (await context.vfs.normalizePath(targetPath)) ?? targetPath;
  const entries = await context.vfs.readdir(targetPath);
  const sentinelName = INIT_SENTINEL.split("/").pop();
  const visibleEntries = sentinelName ? entries.filter((entry) => entry !== sentinelName) : entries;

  const decorated = await Promise.all(
    visibleEntries.map(async (entry) => {
      const fullPath = basePath === "/" ? `/${entry}` : `${basePath}/${entry}`;
      const isDir = await context.vfs.isDir(fullPath);
      return isDir ? `${entry}/` : entry;
    }),
  );

  const output = formatColumns(decorated.sort((a, b) => a.localeCompare(b)));
  io.writeln(output);
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
    io.writeln("cat: missing file operand");
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

  if (!context.vfs.isReadable(normalizedPath)) {
    io.writeln("cat: permission denied");
    return;
  }

  const content = await context.vfs.readFile(normalizedPath);
  io.writeln(content);
};

const help: Command = async (_, __, io) => {
  io.writeln("Available commands:");
  io.writeln("  ls [path]       - list directory contents");
  io.writeln("  cd [path]       - change directory");
  io.writeln("  pwd             - print the current directory");
  io.writeln("  cat <file>      - print file contents (where permitted)");
  io.writeln("  open <file>     - open readable files in the preview window");
  io.writeln("  openPortfolio   - launch the full portfolio overview");
};

const openPortfolio: Command = (_, context) => {
  context.openPreview("portfolio.md", PORTFOLIO_MARKDOWN);
};

const open: Command = async (args, context, io) => {
  const fileInput = args[0];
  if (!fileInput) {
    io.writeln("open: missing file operand");
    return;
  }

  const targetPath = resolvePath(fileInput, context.cwd, context.home);

  const normalizedPath = await context.vfs.normalizePath(targetPath);
  if (!normalizedPath) {
    io.writeln(`open: no such file or directory: ${fileInput}`);
    return;
  }

  if (!(await context.vfs.isFile(normalizedPath))) {
    io.writeln(`open: not a file: ${fileInput}`);
    return;
  }

  if (!context.vfs.isPreviewable(normalizedPath)) {
    io.writeln("open: permission denied");
    return;
  }

  const content = await context.vfs.readFile(normalizedPath);
  context.openPreview(normalizedPath, content);
};

const commandHandlers: Record<string, Command> = {
  ls,
  cd,
  pwd,
  cat,
  open,
  openPortfolio,
  help,
};

export function getCommand(name: string): Command | undefined {
  const lower = name.toLowerCase();
  return commandLookup[lower];
}

export const commands = commandHandlers;

const commandLookup: Record<string, Command> = Object.fromEntries(
  Object.entries(commandHandlers).map(([commandName, handler]) => [commandName.toLowerCase(), handler]),
) as Record<string, Command>;
