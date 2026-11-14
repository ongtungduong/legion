#!/usr/bin/env node
// Runs shellcheck on every shell script: the hooks hooks.json registers and
// every *.sh file. Skips with a note when shellcheck is not installed locally;
// in CI (CI set) a missing shellcheck is an error.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, walk, rel } from './lib/skills.mjs';

const SKIP_DIRS = new Set(['.git', 'node_modules', '.legion', path.join('evals', 'results'), path.join('evals', 'plugin', 'results')]);

let hooksConfig = '';
try { hooksConfig = fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8'); } catch { /* validate.mjs reports it */ }
const hooks = [...hooksConfig.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/(hooks\/[A-Za-z0-9._-]+)/g)].map((m) => path.join(ROOT, m[1]));

const scripts = [];
for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(ROOT, entry.name);
  if (SKIP_DIRS.has(entry.name)) continue;
  const skip = (f) => [...SKIP_DIRS].some((d) => rel(f).startsWith(d + path.sep));
  scripts.push(...walk(dir, (f) => f.endsWith('.sh') && !skip(f)));
}
const files = [...new Set([...hooks.filter((f) => fs.existsSync(f)), ...scripts])].sort();

const res = spawnSync('shellcheck', files, { cwd: ROOT, encoding: 'utf8' });
if (res.error?.code === 'ENOENT') {
  if (process.env.CI) { console.log('ERROR shellcheck not installed'); process.exit(1); }
  console.log('NOTE  shellcheck not installed; skipped');
  process.exit(0);
}
process.stdout.write(res.stdout ?? '');
process.stderr.write(res.stderr ?? '');
console.log(`shellcheck: ${files.length} files, ${res.status === 0 ? 'clean' : 'findings'}`);
process.exit(res.status === 0 ? 0 : 1);
