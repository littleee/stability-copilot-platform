import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(packageRoot, "dist");
const cjsEntryPath = path.join(distDir, "index.js");
const esmEntryPath = path.join(distDir, "index.mjs");

if (!fs.existsSync(cjsEntryPath)) {
  throw new Error(`Missing CommonJS build output: ${cjsEntryPath}`);
}

const cjsExports = require(cjsEntryPath);
const exportNames = Object.keys(cjsExports).filter((name) =>
  /^[$A-Z_][0-9A-Z_$]*$/i.test(name),
);

const lines = [
  'import cjs from "./index.js";',
  "",
  ...exportNames.map((name) => `export const ${name} = cjs.${name};`),
  "",
  "export default cjs;",
  "",
];

fs.writeFileSync(esmEntryPath, lines.join("\n"), "utf8");
