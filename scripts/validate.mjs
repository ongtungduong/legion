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
import { ROOT, SKILLS_DIR, TRIGGERS_DIR, ROUTER, listSkills, readSkill, parseFrontmatter, walk, rel } from './lib/skills.mjs';
import { DECLARED_KINDS, isRoutingGrader, loadGraderKinds } from './lib/grader-kinds.mjs';

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
// Every audit report reference (references/audit.md or references/<name>-audit.md)
// ends with the same report skeleton, so a system audit merges the reports of
// several axes into one shape. The skeleton is the "### " headings and the
// findings table header inside "## Report".
const AUDIT_FILE = /^(?:[a-z0-9-]+-)?audit\.md$/;
const auditSkeleton = (text) => {
  const report = text.split(/^## Report\s*$/m)[1] ?? '';
  return report.split('\n').filter((l) => /^### |^\| Severity/.test(l)).map((l) => l.trim()).join('\n');
};
const audits = skills.flatMap((name) => {
  const dir = path.join(SKILLS_DIR, name, 'references');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => AUDIT_FILE.test(f)).sort().map((f) => path.join(dir, f));
});
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

// --- Behavioral eval cases (evals/plugin/) ----------------------------------
// `claude plugin eval` reads these; a malformed case fails only when someone
// pays for a run. Names say which skill a case tests. A firing case has a
// tool_used grader on Skill whose input_match matches that skill's call; a
// case named *-stays-quiet-* has one with max: 0. Every model-invoked skill
// needs at least one case of each kind; other cases may grade quality only.
const EVALS_DIR = path.join(ROOT, 'evals', 'plugin');
// Grader types of `claude plugin eval` (Claude Code 2.1.322 case schema).
const GRADER_TYPES = new Set(['llm', 'regex', 'tool_used', 'tool_order', 'file_exists', 'baseline']);
const modelSkills = skills.filter((s) => s !== ROUTER);
const casePrefixes = [...modelSkills, 'router'].sort((a, b) => b.length - a.length);
// The Skill tool input a call to legion:<name> produces, for input_match.
const skillCall = (name) => JSON.stringify({ skill: `legion:${name}` });
const cases = { fires: new Set(), quiet: new Set() };
// Every grader that is not a routing grader declares what its result is
// evidence of (scripts/lib/grader-kinds.mjs). Without a declared kind a new
// grader would count as proof that the plugin helps by default.
const { kinds: graderKinds, error: kindsError } = loadGraderKinds();
if (kindsError) err(kindsError);
const gradersSeen = new Map(); // case -> Map(grader name -> is routing)
if (fs.existsSync(EVALS_DIR)) {
  for (const entry of fs.readdirSync(EVALS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'results') continue;
    const where = `evals/plugin/${entry.name}`;
    const dir = path.join(EVALS_DIR, entry.name);
    const owner = casePrefixes.find((p) => entry.name.startsWith(`${p}-`));
    if (!owner) err(`${where}: name must start with a skill name or "router-"`);
    const quiet = entry.name.includes('-stays-quiet-');
    // The router's quiet case must cover a call to any skill.
    const watched = owner === 'router' ? modelSkills : [owner];

    const promptFile = path.join(dir, 'prompt.md');
    if (fs.existsSync(promptFile)) {
      const { data, error } = parseFrontmatter(fs.readFileSync(promptFile, 'utf8'));
      if (error) err(`${where}/prompt.md: ${error}`);
      else for (const key of ['description', 'expected_outcome']) if (!data[key]) err(`${where}/prompt.md: frontmatter needs ${key}`);
    } else if (!fs.existsSync(path.join(dir, 'case.yaml'))) err(`${where}: needs prompt.md or case.yaml`);

    const gradersDir = path.join(dir, 'graders');
    const graders = fs.existsSync(gradersDir) ? fs.readdirSync(gradersDir).filter((f) => f.endsWith('.md')) : [];
    if (!graders.length) { err(`${where}: no graders (graders/*.md)`); continue; }
    let assertsUsed = false, assertsUnused = false;
    for (const g of graders) {
      const { data, error } = parseFrontmatter(fs.readFileSync(path.join(gradersDir, g), 'utf8'));
      if (error) { err(`${where}/graders/${g}: ${error}`); continue; }
      if (!GRADER_TYPES.has(data.type)) err(`${where}/graders/${g}: grader type "${data.type}" is not one of ${[...GRADER_TYPES].join(', ')}`);
      const graderName = g.replace(/\.md$/, '');
      const routing = isRoutingGrader(data);
      if (!gradersSeen.has(entry.name)) gradersSeen.set(entry.name, new Map());
      gradersSeen.get(entry.name).set(graderName, routing);
      if (graderKinds && !routing && graderKinds[entry.name]?.[graderName] === undefined) {
        err(`${where}/graders/${g}: no kind in evals/grader-kinds.json (outcome: a result an agent without the plugin can also reach; protocol: Legion's own procedure or format)`);
      }
      let match = null;
      if (data.input_match) {
        try { match = new RegExp(data.input_match); }
        catch { err(`${where}/graders/${g}: input_match is not a valid regex`); continue; }
      }
      if (!owner || data.type !== 'tool_used' || data.tool !== 'Skill' || !match) continue;
      if (!watched.every((s) => match.test(skillCall(s)))) continue;
      if (data.max === '0') assertsUnused = true;
      else assertsUsed = true;
    }
    if (quiet && owner && !assertsUnused) {
      err(`${where}: a stays-quiet case needs a tool_used grader on Skill with max: 0 whose input_match matches legion:${watched.length === 1 ? owner : '<any skill>'}`);
    }
    if (assertsUnused && quiet) cases.quiet.add(owner);
    if (assertsUsed && !quiet) cases.fires.add(owner);
  }
}
for (const [caseName, declared] of Object.entries(graderKinds ?? {})) {
  for (const [graderName, kind] of Object.entries(declared ?? {})) {
    const routing = gradersSeen.get(caseName)?.get(graderName);
    if (routing === undefined) err(`evals/grader-kinds.json: ${caseName}/${graderName} names no grader in evals/plugin/`);
    else if (routing) err(`evals/grader-kinds.json: ${caseName}/${graderName}: a tool_used grader on Skill is a routing grader by type; remove its entry`);
    else if (!DECLARED_KINDS.includes(kind)) err(`evals/grader-kinds.json: ${caseName}/${graderName}: kind "${kind}" is not one of ${DECLARED_KINDS.join(', ')}`);
  }
}
for (const name of skills) {
  if (name === ROUTER || readSkill(name)?.data?.['disable-model-invocation'] === 'true') continue;
  if (!cases.fires.has(name)) err(`${name}: no firing eval case in evals/plugin/ (a case named ${name}-<behavior> with a tool_used grader on Skill that matches legion:${name})`);
  if (!cases.quiet.has(name)) err(`${name}: no stays-quiet eval case in evals/plugin/ (a case named ${name}-stays-quiet-<prompt>)`);
}

// --- Model tiers ------------------------------------------------------------
// A skill names a tier for a dispatch (cheap, standard, session, top), never a
// model: a pinned alias caps every later session at the model that was the
// best one when the line was written. The tier tables map tiers to aliases in
// backticks, which this rule leaves alone.
for (const file of walk(SKILLS_DIR, (f) => f.endsWith('.md'))) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const pin = line.match(/model:\s*"[A-Za-z0-9.-]+"/);
    if (pin) err(`${rel(file)}:${i + 1}: pins a model (${pin[0]}); name a tier (cheap, standard, session, top) and let the skill's tier table choose the model`);
  });
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
// (with a note) when git, tags, or the tag's history are not available locally;
// in CI (CI set) that is an error, because CI checks out full history and tags
// and a skip there would let an unbumped change through unnoticed.
const SHIPPED = ['skills', 'hooks', '.claude-plugin'];
const parseVer = (v) => (/^\d+\.\d+\.\d+$/.test(v ?? '') ? v.split('.').map(Number) : null);
const cmpVer = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const git = (...args) => {
  const res = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return res.error || res.status !== 0 ? null : res.stdout;
};
const skipBump = (why) => (process.env.CI
  ? err(`version-bump check cannot run in CI: ${why}`)
  : notes.push(`version-bump check skipped: ${why}`));
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
