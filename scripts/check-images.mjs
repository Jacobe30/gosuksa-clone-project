#!/usr/bin/env node
/**
 * Build-time image integrity check.
 *
 * Scans every source file under src/ and every emitted bundle in public/assets
 * for references to image assets (/assets/*.{png,jpg,jpeg,webp,gif,svg,ico}),
 * then verifies each referenced file exists in public/assets and is non-empty.
 *
 * Exits non-zero and prints a report if any asset is missing or zero-size,
 * failing the build.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, resolve, relative } from "node:path";

const ROOT = resolve(process.cwd());
const ASSETS_DIR = join(ROOT, "public", "assets");
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"]);
const SCAN_DIRS = [join(ROOT, "src"), ASSETS_DIR];
const SCAN_EXT = new Set([".html", ".js", ".mjs", ".cjs", ".css", ".ts", ".tsx", ".jsx", ".json"]);

// Matches /assets/<filename>.<ext> inside strings, CSS url(), etc.
const REF_RE = /["'`(\s](\/?assets\/[A-Za-z0-9._\-]+\.(?:png|jpe?g|webp|gif|svg|ico))/gi;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const referenced = new Map(); // filename -> Set of source files
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (!SCAN_EXT.has(extname(file))) continue;
    let text;
    try { text = readFileSync(file, "utf8"); } catch { continue; }
    let m;
    REF_RE.lastIndex = 0;
    while ((m = REF_RE.exec(text)) !== null) {
      const name = m[1].replace(/^\/?assets\//, "");
      if (!referenced.has(name)) referenced.set(name, new Set());
      referenced.get(name).add(relative(ROOT, file));
    }
  }
}

const missing = [];
const empty = [];
for (const [name, sources] of referenced) {
  const path = join(ASSETS_DIR, name);
  if (!existsSync(path)) {
    missing.push({ name, sources: [...sources] });
    continue;
  }
  if (statSync(path).size === 0) {
    empty.push({ name, sources: [...sources] });
  }
}

const total = referenced.size;
if (missing.length === 0 && empty.length === 0) {
  console.log(`[check-images] OK — ${total} referenced image assets present and non-empty.`);
  process.exit(0);
}

console.error(`\n[check-images] FAILED — ${missing.length} missing, ${empty.length} zero-size (of ${total} referenced).`);
for (const { name, sources } of missing) {
  console.error(`  MISSING  public/assets/${name}`);
  for (const s of sources.slice(0, 3)) console.error(`           referenced by ${s}`);
}
for (const { name, sources } of empty) {
  console.error(`  ZERO     public/assets/${name}`);
  for (const s of sources.slice(0, 3)) console.error(`           referenced by ${s}`);
}
process.exit(1);
