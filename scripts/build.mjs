import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = resolve(projectRoot, "dist");

if (dirname(distDirectory) !== projectRoot) {
  throw new Error("Refusing to clean an unexpected build directory.");
}

rmSync(distDirectory, { recursive: true, force: true });

const compiler = resolve(projectRoot, "node_modules/typescript/bin/tsc");
for (const config of [
  "tsconfig.build.esm.json",
  "tsconfig.build.cjs.json",
  "tsconfig.build.types.json",
]) {
  const result = spawnSync(process.execPath, [compiler, "--project", config], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const commonJsDirectory = resolve(distDirectory, "cjs");
mkdirSync(commonJsDirectory, { recursive: true });
writeFileSync(
  resolve(commonJsDirectory, "package.json"),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
);
