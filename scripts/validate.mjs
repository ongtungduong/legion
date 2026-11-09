#!/usr/bin/env node
// Structural checks for the Legion repo. Exit 1 on any error.
//
// Rules drawn from:
//   superpowers  - SKILL.md under 20,000 bytes; no dev material inside skills/
//   addy         - frontmatter contract; reference links must resolve
//   mattpocock   - cross-skill calls name the Skill tool with a real skill
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SKILLS_DIR, TRIGGERS_DIR, listSkills, readSkill, walk, rel } from './lib/skills.mjs';

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// agentskills.io fields, plus Claude Code's disable-model-invocation for user-invoked skills.
const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools', 'disable-model-invocation']);
const MAX_BYTES = 20000;
const WARN_LINES = 400;
const MAX_DESC = 1024;
const ROUTER = 'using-legion';

const skills = listSkills();
const known = new Set(skills);

// --- Per-skill checks -------------------------------------------------------
for (const name of skills) {
  const skill = readSkill(name);
  const where = `skills/${name}`;
  if (!skill) { err(`${where}: missing SKILL.md`); continue; }
  if (skill.error) { err(`${where}/SKILL.md: ${skill.error}`); continue; }
  const fm = skill.data;

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) err(`${where}: directory name must be kebab-case`);
  if (fm.name !== name) err(`${where}: frontmatter name "${fm.name}" must equal directory name`);
  for (const key of Object.keys(fm)) {
    if (!ALLOWED_KEYS.has(key)) err(`${where}: frontmatter key "${key}" is not allowed (${[...ALLOWED_KEYS].join(', ')})`);
  }

  const desc = fm.description ?? '';
  if (!desc) err(`${where}: description is required`);
  if (desc.length > MAX_DESC) err(`${where}: description is ${desc.length} chars (max ${MAX_DESC})`);
  const userInvoked = fm['disable-model-invocation'] === 'true';
  // agentskills.io: say what the skill does AND when to use it.
  if (!userInvoked && desc && !/\bUse (when|whenever|before|at)\b/.test(desc)) {
    err(`${where}: model-invoked description must state when to use it ("Use when ...")`);
  }
  if (!userInvoked && desc && /^Use\b/.test(desc)) {
    err(`${where}: description must start with what the skill does, then say when to use it`);
  }

  if (skill.bytes >= MAX_BYTES) err(`${where}/SKILL.md is ${skill.bytes} bytes (limit < ${MAX_BYTES}); move rarely needed parts to references/`);
  const lines = skill.text.split('\n').length;
  if (lines > WARN_LINES) warn(`${where}/SKILL.md has ${lines} lines (soft limit ${WARN_LINES})`);
  if (!/^# .+/m.test(skill.body)) err(`${where}/SKILL.md: needs a top-level "# Title" heading`);

  if (name !== ROUTER && !fs.existsSync(path.join(TRIGGERS_DIR, `${name}.json`))) {
    err(`${where}: missing evals/triggers/${name}.json`);
  }
}

// --- Files inside skills/ ---------------------------------------------------
const skillFiles = walk(SKILLS_DIR);
for (const file of skillFiles) {
  const base = path.basename(file);
  if (/^test-.*\.md$/.test(base) || base === 'CREATION-LOG.md' || /\.scenario\.md$/.test(base)) {
    err(`${rel(file)}: skill-development material must live under evals/ or tests/, not skills/`);
  }
}

// --- Cross-references and links --------------------------------------------
const mdFiles = [
  ...skillFiles.filter((f) => f.endsWith('.md')),
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'AGENTS.md'),
].filter((f) => fs.existsSync(f));

for (const file of mdFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/legion:([a-z0-9-]+)/g)) {
    if (!known.has(m[1])) err(`${rel(file)}: reference "legion:${m[1]}" does not match any skill`);
  }
  if (!file.startsWith(SKILLS_DIR)) continue;
  const noCode = text.replace(/```[\s\S]*?```/g, '');
  for (const m of noCode.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) err(`${rel(file)}: broken link "${m[1]}"`);
  }
}

// --- Router, README, trigger files -----------------------------------------
const router = readSkill(ROUTER);
if (!router) err(`skills/${ROUTER} is required (the session-start hook injects it)`);
const readme = fs.existsSync(path.join(ROOT, 'README.md')) ? fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8') : '';
if (!readme) err('README.md is missing');
for (const name of skills) {
  if (name === ROUTER) continue;
  const userInvoked = readSkill(name)?.data?.['disable-model-invocation'] === 'true';
  if (router && !userInvoked && !router.text.includes(`legion:${name}`)) {
    err(`skills/${ROUTER}: map does not route to legion:${name}`);
  }
  if (readme && !readme.includes(`\`${name}\``)) err(`README.md: skill table does not list \`${name}\``);
}
if (fs.existsSync(TRIGGERS_DIR)) {
  for (const f of fs.readdirSync(TRIGGERS_DIR).filter((f) => f.endsWith('.json'))) {
    const name = f.replace(/\.json$/, '');
    if (!known.has(name)) err(`evals/triggers/${f}: no skill named "${name}"`);
  }
}

// --- Manifests and hooks ----------------------------------------------------
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); }
  catch (e) { err(`${p}: ${e.code === 'ENOENT' ? 'missing' : 'invalid JSON (' + e.message + ')'}`); return null; }
}
const plugin = readJson('.claude-plugin/plugin.json');
const market = readJson('.claude-plugin/marketplace.json');
const pkg = readJson('package.json');
readJson('hooks/hooks.json');
const versions = {
  'plugin.json': plugin?.version,
  'marketplace.json': market?.plugins?.[0]?.version,
  'package.json': pkg?.version,
};
if (new Set(Object.values(versions)).size !== 1) {
  err(`version mismatch: ${Object.entries(versions).map(([k, v]) => `${k}=${v}`).join(', ')}`);
}
if (plugin && market && market.plugins?.[0]?.name !== plugin.name) err('marketplace.json plugin name differs from plugin.json');
const hook = path.join(ROOT, 'hooks', 'session-start');
if (!fs.existsSync(hook)) err('hooks/session-start is missing');
else if (!(fs.statSync(hook).mode & 0o111)) err('hooks/session-start is not executable (chmod +x)');

// --- Report -----------------------------------------------------------------
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`validate: ${skills.length} skills, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
