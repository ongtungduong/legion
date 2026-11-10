#!/usr/bin/env node
// Structural checks for the Legion repo. Exit 1 on any error.
//
// Rules drawn from:
//   superpowers  - SKILL.md under 20,000 bytes; no dev material inside skills/
//   addy         - frontmatter contract; reference links must resolve
//   mattpocock   - cross-skill calls name the Skill tool with a real skill
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, SKILLS_DIR, TRIGGERS_DIR, ROUTER, listSkills, readSkill, walk, rel } from './lib/skills.mjs';

const errors = [];
const warnings = [];
const notes = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// agentskills.io fields, plus Claude Code's disable-model-invocation for user-invoked skills.
const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools', 'disable-model-invocation']);
const MAX_BYTES = 20000;
const WARN_LINES = 400;
const MAX_DESC = 1024;

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
  // agentskills.io: bundled files are referenced from the skill's own root;
  // a link into another skill breaks when skills are installed separately.
  const skillRoot = path.join(SKILLS_DIR, path.relative(SKILLS_DIR, file).split(path.sep)[0]);
  const noCode = text.replace(/```[\s\S]*?```/g, '');
  for (const m of noCode.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (path.relative(skillRoot, resolved).startsWith('..')) err(`${rel(file)}: link "${m[1]}" leaves the skill root`);
    else if (!fs.existsSync(resolved)) err(`${rel(file)}: broken link "${m[1]}"`);
  }
}

// --- Shared audit report skeleton -------------------------------------------
// Every skill's references/audit.md ends with the same report skeleton, so a
// system audit merges the reports of several skills into one shape. The
// skeleton is the "### " headings and the findings table header inside
// "## Report".
const auditSkeleton = (text) => {
  const report = text.split(/^## Report\s*$/m)[1] ?? '';
  return report.split('\n').filter((l) => /^### |^\| Severity/.test(l)).map((l) => l.trim()).join('\n');
};
const audits = skills
  .map((name) => path.join(SKILLS_DIR, name, 'references', 'audit.md'))
  .filter((f) => fs.existsSync(f));
const firstSkeleton = audits.length ? auditSkeleton(fs.readFileSync(audits[0], 'utf8')) : '';
for (const f of audits) {
  const sk = auditSkeleton(fs.readFileSync(f, 'utf8'));
  if (!sk) err(`${rel(f)}: no report skeleton under "## Report"`);
  else if (firstSkeleton && sk !== firstSkeleton) err(`audit skeletons differ: ${rel(audits[0])} vs ${rel(f)}`);
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
const hooksConfig = readJson('hooks/hooks.json');
const versions = {
  'plugin.json': plugin?.version,
  'marketplace.json': market?.plugins?.[0]?.version,
  'package.json': pkg?.version,
};
if (new Set(Object.values(versions)).size !== 1) {
  err(`version mismatch: ${Object.entries(versions).map(([k, v]) => `${k}=${v}`).join(', ')}`);
}
if (plugin && market && market.plugins?.[0]?.name !== plugin.name) err('marketplace.json plugin name differs from plugin.json');
// Every hook script hooks.json runs must exist and be executable.
const hookFiles = new Set(
  [...JSON.stringify(hooksConfig ?? {}).matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/(hooks\/[A-Za-z0-9._-]+)/g)].map((m) => m[1]),
);
if (!hookFiles.size) err('hooks/hooks.json registers no hook under ${CLAUDE_PLUGIN_ROOT}/hooks/');
for (const name of hookFiles) {
  const hook = path.join(ROOT, name);
  if (!fs.existsSync(hook)) err(`${name} is missing`);
  else if (!(fs.statSync(hook).mode & 0o111)) err(`${name} is not executable (chmod +x)`);
}

// --- Version bump -----------------------------------------------------------
// Installed plugin caches are keyed by version, so a change to what ships
// without a bump never reaches users. Compare against the latest v* tag; skip
// (with a note) when git, tags, or the tag's history are not available, as in
// a shallow CI checkout.
const SHIPPED = ['skills', 'hooks', '.claude-plugin'];
const parseVer = (v) => (/^\d+\.\d+\.\d+$/.test(v ?? '') ? v.split('.').map(Number) : null);
const cmpVer = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const git = (...args) => {
  const res = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return res.error || res.status !== 0 ? null : res.stdout;
};
const skipBump = (why) => notes.push(`version-bump check skipped: ${why}`);
if (git('rev-parse', '--show-cdup') === null) skipBump('not a git checkout');
else if (git('rev-parse', '--show-cdup').trim() !== '') skipBump('not at the root of a git checkout');
else {
  const tag = (git('tag', '--list', 'v*') ?? '').split('\n')
    .filter((t) => parseVer(t.slice(1)))
    .sort((a, b) => cmpVer(parseVer(a.slice(1)), parseVer(b.slice(1))))
    .pop();
  const current = parseVer(pkg?.version);
  if (!tag) skipBump('no v* tags (fetch them: git fetch --tags)');
  else if (!current) skipBump(`package.json version "${pkg?.version}" is not x.y.z`);
  else {
    const changed = git('diff', '--name-only', tag, '--', ...SHIPPED);
    const untracked = git('ls-files', '--others', '--exclude-standard', '--', ...SHIPPED);
    if (changed === null || untracked === null) skipBump(`cannot diff against ${tag} (shallow clone?)`);
    else {
      const files = [...changed.split('\n'), ...untracked.split('\n')].filter(Boolean);
      if (files.length && cmpVer(current, parseVer(tag.slice(1))) <= 0) {
        err(`${files.length} file(s) under ${SHIPPED.join(', ')} changed since ${tag} (e.g. ${files[0]}) but package.json is still ${pkg.version}; bump the version above ${tag.slice(1)} in package.json, plugin.json, and marketplace.json`);
      }
    }
  }
}

// --- CI workflows -----------------------------------------------------------
// Least privilege: a read-only token unless a job asks for more, and actions
// pinned to a commit SHA (a moved tag can ship new code into CI).
const workflowsDir = path.join(ROOT, '.github', 'workflows');
if (fs.existsSync(workflowsDir)) {
  for (const f of fs.readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f))) {
    const text = fs.readFileSync(path.join(workflowsDir, f), 'utf8');
    if (!/^permissions:/m.test(text)) err(`.github/workflows/${f}: no top-level permissions block`);
    for (const m of text.matchAll(/uses:\s*([^\s#]+)/g)) {
      if (!/@[0-9a-f]{40}$/.test(m[1])) err(`.github/workflows/${f}: ${m[1]} is not pinned to a commit SHA`);
    }
  }
}

// --- Report -----------------------------------------------------------------
for (const n of notes) console.log(`NOTE  ${n}`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`validate: ${skills.length} skills, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
