import type { Stats } from "fs";
import {
  DIRECTORIES,
  FILES,
  HOME_DIR,
  INIT_SENTINEL,
  PREVIEWABLE_FILES,
  READABLE_FILES,
} from "./seedData";

const INDEXED_DB_OPTIONS = {
  fs: "IndexedDB",
  options: {},
};

const IN_MEMORY_FALLBACK = {
  fs: "InMemory",
};

type NodeLikeFs = typeof import("fs");

type BrowserFsModule = {
  configure: (options: Record<string, unknown>, cb: (err: Error | null) => void) => void;
  BFSRequire: (module: string) => unknown;
};

let browserFsInstance: BrowserFsModule | null = null;

async function loadBrowserFs(): Promise<BrowserFsModule> {
  if (browserFsInstance) {
    return browserFsInstance;
  }
  if (typeof globalThis.self === "undefined") {
    (globalThis as unknown as { self: typeof globalThis }).self = globalThis;
  }
  const mod = await import("browserfs");
  const BrowserFS = ((mod as unknown as { default?: unknown })?.default ?? mod) as BrowserFsModule;
  browserFsInstance = BrowserFS;
  return browserFsInstance;
}

export type VfsStats = Stats;

export class Vfs {
  private fs: NodeLikeFs | null = null;
  private ready: Promise<void> | null = null;

  async init(): Promise<void> {
    if (!this.ready) {
      this.ready = this.configureFileSystem();
    }
    await this.ready;
  }

  private async configureFileSystem(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await this.configure(INDEXED_DB_OPTIONS);
    } catch (error) {
      console.warn("Falling back to in-memory filesystem", error);
      await this.configure(IN_MEMORY_FALLBACK);
    }

    await this.seedIfNeeded();
  }

  private async configure(options: Record<string, unknown>): Promise<void> {
    const BrowserFS = await loadBrowserFs();
    return new Promise((resolve, reject) => {
      BrowserFS.configure(options, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        this.fs = BrowserFS.BFSRequire("fs") as NodeLikeFs;
        resolve();
      });
    });
  }

  private existsDirect(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.fs!.exists(path, (exists: boolean) => resolve(exists));
    });
  }

  private async seedIfNeeded(): Promise<void> {
    if (!this.fs) {
      throw new Error("Filesystem not initialized");
    }

    const alreadySeeded = await this.existsDirect(INIT_SENTINEL);
    if (alreadySeeded) {
      await this.ensureLatestSeed(false);
      return;
    }

    await this.ensureLatestSeed(true);
    await this.writeFile(INIT_SENTINEL, "initialized");
  }

  private async ensureLatestSeed(overwriteFiles: boolean): Promise<void> {
    for (const dir of DIRECTORIES) {
      await this.ensureDir(dir);
    }

    const entries = Object.entries(FILES);
    for (const [path, content] of entries) {
      const exists = await this.existsDirect(path);
      if (!exists || overwriteFiles) {
        await this.writeFile(path, content);
      }
    }
  }

  private ensureDir(path: string): Promise<void> {
    if (path === "/") {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.fs!.exists(path, (exists: boolean) => {
        if (exists) {
          resolve();
          return;
        }

        const parent = path.slice(0, path.lastIndexOf("/")) || "/";
        if (parent && parent !== path) {
          this.ensureDir(parent)
            .then(() => {
              this.fs!.mkdir(path, (err: NodeJS.ErrnoException | null) => {
                if (!err || err.code === "EEXIST") {
                  resolve();
                  return;
                }
                reject(err);
              });
            })
            .catch(reject);
          return;
        }

        this.fs!.mkdir(path, (err: NodeJS.ErrnoException | null) => {
          if (!err || err.code === "EEXIST") {
            resolve();
            return;
          }
          reject(err);
        });
      });
    });
  }

  private writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fs!.writeFile(path, content, "utf8", (err: NodeJS.ErrnoException | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async waitForReady(): Promise<void> {
    if (!this.ready) {
      await this.init();
      return;
    }
    await this.ready;
  }

  private readdirRaw(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.fs!.readdir(path, (err: NodeJS.ErrnoException | null, files: string[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(files);
      });
    });
  }

  private async normalizePathCase(path: string): Promise<string | null> {
    if (!this.fs) {
      throw new Error("Filesystem not initialized");
    }

    if (path === "/") {
      return "/";
    }

    const segments = path.split("/").filter(Boolean);
    let current = "/";

    for (const segment of segments) {
      let entries: string[];
      try {
        entries = await this.readdirRaw(current);
      } catch {
        return null;
      }

      const match =
        entries.find((entry) => entry === segment) ??
        entries.find((entry) => entry.toLowerCase() === segment.toLowerCase());

      if (!match) {
        return null;
      }

      current = current === "/" ? `/${match}` : `${current}/${match}`;
    }

    return current;
  }

  async normalizePath(path: string): Promise<string | null> {
    await this.waitForReady();
    return this.normalizePathCase(path);
  }

  private statRaw(path: string): Promise<VfsStats> {
    return new Promise((resolve, reject) => {
      this.fs!.stat(path, (err: NodeJS.ErrnoException | null, stats: VfsStats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stats);
      });
    });
  }

  async exists(path: string): Promise<boolean> {
    await this.waitForReady();
    const normalized = await this.normalizePathCase(path);
    return normalized !== null;
  }

  async stat(path: string): Promise<VfsStats> {
    await this.waitForReady();
    const normalized = await this.normalizePathCase(path);
    if (!normalized) {
      throw Object.assign(new Error(`ENOENT: no such file or directory, stat '${path}'`), {
        code: "ENOENT",
      });
    }
    return this.statRaw(normalized);
  }

  async isDir(path: string): Promise<boolean> {
    try {
      const stats = await this.stat(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async isFile(path: string): Promise<boolean> {
    try {
      const stats = await this.stat(path);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    await this.waitForReady();
    const normalized = await this.normalizePathCase(path);
    if (!normalized) {
      throw Object.assign(new Error(`ENOENT: no such file or directory, open '${path}'`), {
        code: "ENOENT",
      });
    }
    return new Promise((resolve, reject) => {
      this.fs!.readFile(normalized, "utf8", (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  async readdir(path: string): Promise<string[]> {
    await this.waitForReady();
    const normalized = await this.normalizePathCase(path);
    if (!normalized) {
      throw Object.assign(new Error(`ENOENT: no such file or directory, scandir '${path}'`), {
        code: "ENOENT",
      });
    }
    return this.readdirRaw(normalized);
  }

  isReadable(path: string): boolean {
    return READABLE_FILES.includes(path);
  }

  isPreviewable(path: string): boolean {
    return PREVIEWABLE_FILES.includes(path);
  }

  getHome(): string {
    return HOME_DIR;
  }

}

export const vfs = new Vfs();
