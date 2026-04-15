import fs from "fs";
import path from "path";

export function getProjectRoot(): string {
  if (process.env.DR_WELNES_PROJECT_ROOT) {
    return process.env.DR_WELNES_PROJECT_ROOT;
  }

  let currentDir = process.cwd();

  while (true) {
    if (fs.existsSync(path.join(currentDir, ".git"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return process.cwd();
    }

    currentDir = parentDir;
  }
}

export function getContentDir(): string {
  return path.join(getProjectRoot(), "content");
}

export function getPublicDir(): string {
  return path.join(getProjectRoot(), "public");
}
