declare module "browserfs" {
  type ConfigureOptions = Record<string, unknown>;
  type ConfigureCallback = (err: Error | null) => void;

  interface BrowserFSStatic {
    configure(options: ConfigureOptions, cb: ConfigureCallback): void;
    BFSRequire(module: string): unknown;
  }

  const BrowserFS: BrowserFSStatic;
  export default BrowserFS;
}
