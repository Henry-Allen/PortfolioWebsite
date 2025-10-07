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
      return;
    }

    for (const dir of DIRECTORIES) {
      await this.ensureDir(dir);
    }

    const entries = Object.entries(FILES);
    for (const [path, content] of entries) {
      await this.writeFile(path, content);
    }

    await this.writeFile(INIT_SENTINEL, "initialized");
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

  async exists(path: string): Promise<boolean> {
    await this.waitForReady();
    return this.existsDirect(path);
  }

  async stat(path: string): Promise<VfsStats> {
    await this.waitForReady();
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
    return new Promise((resolve, reject) => {
      this.fs!.readFile(path, "utf8", (err: NodeJS.ErrnoException | null, data: string) => {
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
