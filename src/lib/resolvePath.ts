const ROOT_PATH = "/";

function normalizeHome(path: string, home: string): string {
  if (!path.startsWith("~")) {
    return path;
  }

  if (path === "~" || path.startsWith("~/")) {
    return path.replace(/^~(?=\/|$)/, home);
  }

  // Unsupported home formats such as ~user are treated as literal
  return path;
}

export function resolvePath(input: string, cwd: string, home = "/Users/guest"): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return cwd || ROOT_PATH;
  }

  const withHome = normalizeHome(trimmed, home);
  const isAbsolute = withHome.startsWith(ROOT_PATH);

  let combined: string;
  if (isAbsolute) {
    combined = withHome;
  } else {
    const base = cwd === ROOT_PATH ? ROOT_PATH : `${cwd}/`;
    combined = `${base}${withHome}`;
  }

  const rawParts = combined.split("/");
  const stack: string[] = [];

  for (const part of rawParts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      if (stack.length > 0) {
        stack.pop();
      }
      continue;
    }
    stack.push(part);
  }

  return stack.length === 0 ? ROOT_PATH : `${ROOT_PATH}${stack.join("/")}`;
}

export function resolveHomePath(home = "/Users/guest"): string {
  return home;
}
