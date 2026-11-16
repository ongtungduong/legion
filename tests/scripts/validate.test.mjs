// Behavior tests for the repo checks. Each test copies the repo to a temp
// dir, applies one defect, and runs a script against the copy through
// LEGION_ROOT. Zero dependencies (node:test).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP = new Set(['.git', 'node_modules', path.join('evals', 'results'), path.join('evals', 'plugin', 'results'), '.legion']);

const copies = [];
after(() => { for (const dir of copies) fs.rmSync(dir, { recursive: true, force: true }); });

function copyRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legion-validate-'));
  copies.push(dir);
  fs.cpSync(REPO, dir, {
    recursive: true,
    filter: (src) => !SKIP.has(path.relative(REPO, src)),
  });
  return dir;
}

// CI is stripped so a local run and a CI run test the same thing; a test that
// needs CI behavior passes it in `env`.
function run(script, root, env = {}) {
  const { CI, ...base } = process.env;
  const res = spawnSync('node', [path.join(REPO, 'scripts', script)], {
    encoding: 'utf8',
    env: { ...base, LEGION_ROOT: root, ...env },
  });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

function edit(root, file, fn) {
  const p = path.join(root, file);
  fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')));
}

test('clean copy passes', () => {
  const root = copyRepo();
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
});

test('link out of the skill root fails', () => {
  const root = copyRepo();
  edit(root, 'skills/principles/references/security.md', (t) => `${t}\nSee [x](../../brainstorming/SKILL.md).\n`);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /leaves the skill root/);
});

test('non-executable hook fails', () => {
  const root = copyRepo();
  fs.chmodSync(path.join(root, 'hooks', 'session-start'), 0o644);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /hooks\/session-start is not executable/);
});

test('missing registered hook fails', () => {
  const root = copyRepo();
  edit(root, 'hooks/hooks.json', (t) => {
    const j = JSON.parse(t);
    j.hooks.Stop = [{ hooks: [{ type: "command", command: "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/not-there\"" }] }];
    return JSON.stringify(j, null, 2);
  });
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /hooks\/not-there is missing/);
});

test('workflow without a permissions block fails', () => {
  const root = copyRepo();
  edit(root, '.github/workflows/ci.yml', (t) => t.replace(/^permissions:[\s\S]*?(?=^jobs:)/m, ''));
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /ci\.yml: no top-level permissions block/);
});

test('action pinned by tag fails', () => {
  const root = copyRepo();
  edit(root, '.github/workflows/ci.yml', (t) => t.replace(/actions\/checkout@\S+/, 'actions/checkout@v6'));
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /ci\.yml: actions\/checkout@v6 is not pinned to a commit SHA/);
});

test('audit skeletons must match', () => {
  const root = copyRepo();
  edit(root, 'skills/code-review/references/performance-audit.md', (t) => t.replace('### Not checked', '### Gaps'));
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /audit skeletons differ/);
});

test('an *-audit.md without a report skeleton fails', () => {
  const root = copyRepo();
  fs.writeFileSync(path.join(root, 'skills/code-review/references/x-audit.md'), '# X audit\n');
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /x-audit\.md: no report skeleton/);
});

// Version-bump rule: the copy has no .git, so these tests make it a git repo,
// commit it, and tag the commit with the version it carries.
function git(root, ...args) {
  const res = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stderr);
}

function taggedCopy(tag = true) {
  const root = copyRepo();
  git(root, 'init', '-q');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'release');
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  if (tag) git(root, 'tag', `v${version}`);
  return { root, version };
}

function setVersion(root, version) {
  for (const f of ['package.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
    edit(root, f, (t) => t.replace(/"version": "[^"]+"/, `"version": "${version}"`));
  }
}

test('changed skill with the version of the latest tag fails', () => {
  const { root, version } = taggedCopy();
  edit(root, 'skills/skill-creator/SKILL.md', (t) => `${t}\nA change.\n`);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, new RegExp(`v${version.replace(/\./g, '\\.')}`));
  assert.match(out, /bump the version/);
});

test('changed skill with a bumped version passes', () => {
  const { root } = taggedCopy();
  edit(root, 'skills/skill-creator/SKILL.md', (t) => `${t}\nA change.\n`);
  setVersion(root, '99.0.0');
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
});

test('unchanged skills with the version of the latest tag pass', () => {
  const { root } = taggedCopy();
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
});

test('repo without tags skips the version-bump check', () => {
  const { root } = taggedCopy(false);
  edit(root, 'skills/skill-creator/SKILL.md', (t) => `${t}\nA change.\n`);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
  assert.match(out, /version-bump check skipped/);
});

test('in CI a version-bump check that cannot run fails', () => {
  const { root } = taggedCopy(false);
  const { code, out } = run('validate.mjs', root, { CI: 'true' });
  assert.equal(code, 1, out);
  assert.match(out, /ERROR version-bump check cannot run in CI: no v\* tags/);
});

test('bad frontmatter is reported, not thrown', () => {
  const root = copyRepo();
  edit(root, 'skills/skill-creator/SKILL.md', (t) => t.replace(/^---\n/, '--\n'));
  const { code, out } = run('trigger-evals.mjs', root);
  assert.equal(code, 1, out);
  assert.match(out, /frontmatter does not parse/);
  assert.doesNotMatch(out, /TypeError/);
});

// --- One row per rule ---------------------------------------------------------
// Each row applies one defect to a fresh copy and names the output that must
// report it. A rule with no row here can stop working without a red test.

const write = (root, file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};
const rm = (root, file) => fs.rmSync(path.join(root, file), { recursive: true, force: true });
const json = (root, file, fn) => edit(root, file, (t) => `${JSON.stringify(fn(JSON.parse(t)), null, 2)}\n`);
const DESC = 'Frobs widgets for the test fixture. Use when the user asks to frob a widget.';
// A new skill with the given frontmatter lines and body.
const newSkill = (root, name, fm = [`name: ${name}`, `description: ${DESC}`, 'license: MIT'], body = '# Title\n') =>
  write(root, `skills/${name}/SKILL.md`, `---\n${fm.join('\n')}\n---\n${body}`);
const quietCase = 'evals/plugin/skill-creator-stays-quiet-on-plan-request';

const validateRules = [
  ['skill directory without SKILL.md', (r) => fs.mkdirSync(path.join(r, 'skills/zz-empty')), /skills\/zz-empty: missing SKILL\.md/],
  ['unclosed frontmatter', (r) => edit(r, 'skills/skill-creator/SKILL.md', (t) => t.replace(/^---\n/, '--\n')), /skill-creator\/SKILL\.md: missing or unclosed frontmatter/],
  ['directory name not kebab-case', (r) => newSkill(r, 'Zz_Bad', ['name: Zz_Bad', `description: ${DESC}`]), /skills\/Zz_Bad: directory name must be kebab-case/],
  ['frontmatter name differs from directory', (r) => edit(r, 'skills/skill-creator/SKILL.md', (t) => t.replace('name: skill-creator', 'name: skill-maker')), /frontmatter name "skill-maker" must equal directory name/],
  ['frontmatter key not allowed', (r) => edit(r, 'skills/skill-creator/SKILL.md', (t) => t.replace('license: MIT', 'license: MIT\ntags: x')), /frontmatter key "tags" is not allowed/],
  ['description missing', (r) => newSkill(r, 'zz-new', ['name: zz-new']), /skills\/zz-new: description is required/],
  ['description too long', (r) => newSkill(r, 'zz-new', ['name: zz-new', `description: ${DESC} ${'x'.repeat(1024)}`]), /skills\/zz-new: description is \d+ chars \(max 1024\)/],
  ['description without when to use', (r) => newSkill(r, 'zz-new', ['name: zz-new', 'description: Frobs widgets.']), /skills\/zz-new: model-invoked description must state when to use it/],
  ['description that starts with Use', (r) => newSkill(r, 'zz-new', ['name: zz-new', 'description: Use when frobbing. Frobs widgets.']), /skills\/zz-new: description must start with what the skill does/],
  ['SKILL.md at the byte limit', (r) => newSkill(r, 'zz-new', undefined, `# Title\n${'x'.repeat(20000)}\n`), /zz-new\/SKILL\.md is \d+ bytes \(limit < 20000\)/],
  ['SKILL.md without a top-level heading', (r) => newSkill(r, 'zz-new', undefined, 'No heading.\n'), /zz-new\/SKILL\.md: needs a top-level "# Title" heading/],
  ['skill without a trigger file', (r) => rm(r, 'evals/triggers/writing-plans.json'), /skills\/writing-plans: missing evals\/triggers\/writing-plans\.json/],
  ['skill-development material inside skills/', (r) => write(r, 'skills/brainstorming/test-pressure.md', '# x\n'), /test-pressure\.md: skill-development material must live under evals\/ or tests\//],
  ['creation log inside skills/', (r) => write(r, 'skills/brainstorming/CREATION-LOG.md', '# x\n'), /CREATION-LOG\.md: skill-development material/],
  ['scenario file inside skills/',(r) => write(r, 'skills/brainstorming/a.scenario.md', '# x\n'), /a\.scenario\.md: skill-development material/],
  ['reference to an unknown legion skill', (r) => edit(r, 'README.md', (t) => `${t}\nSee legion:nope.\n`), /README\.md: reference "legion:nope" does not match any skill/],
  ['broken link inside a skill', (r) => edit(r, 'skills/skill-creator/SKILL.md', (t) => `${t}\nSee [x](references/nope.md).\n`), /skill-creator\/SKILL\.md: broken link "references\/nope\.md"/],
  ['router skill missing', (r) => rm(r, 'skills/using-legion'), /skills\/using-legion is required/],
  ['router map missing a skill', (r) => edit(r, 'skills/using-legion/SKILL.md', (t) => t.replaceAll('legion:skill-creator', 'legion-skill-creator')), /map does not route to legion:skill-creator/],
  ['README missing', (r) => rm(r, 'README.md'), /README\.md is missing/],
  ['README skill table missing a skill', (r) => edit(r, 'README.md', (t) => t.replaceAll('`skill-creator`', 'skill creator')), /README\.md: skill table does not list `skill-creator`/],
  ['trigger file for no skill', (r) => write(r, 'evals/triggers/ghost.json', '{}\n'), /evals\/triggers\/ghost\.json: no skill named "ghost"/],
  ['manifest missing', (r) => rm(r, '.claude-plugin/marketplace.json'), /\.claude-plugin\/marketplace\.json: missing/],
  ['manifest with invalid JSON', (r) => edit(r, '.claude-plugin/plugin.json', (t) => t.slice(0, -3)), /\.claude-plugin\/plugin\.json: invalid JSON/],
  ['manifest versions differ', (r) => json(r, '.claude-plugin/plugin.json', (j) => ({ ...j, version: '0.0.1' })), /version mismatch: plugin\.json=0\.0\.1/],
  ['marketplace plugin name differs', (r) => json(r, '.claude-plugin/marketplace.json', (j) => ({ ...j, plugins: [{ ...j.plugins[0], name: 'other' }] })), /marketplace\.json plugin name differs from plugin\.json/],
  ['hooks.json registers no hook', (r) => write(r, 'hooks/hooks.json', '{"hooks":{}}\n'), /hooks\/hooks\.json registers no hook/],
  // Behavioral eval cases (evals/plugin/).
  ['eval case without a prompt', (r) => rm(r, `${quietCase}/prompt.md`), /skill-creator-stays-quiet-on-plan-request: needs prompt\.md or case\.yaml/],
  ['eval prompt without expected_outcome', (r) => edit(r, `${quietCase}/prompt.md`, (t) => t.replace(/^expected_outcome:.*\n/m, '')), /skill-creator-stays-quiet-on-plan-request\/prompt\.md: frontmatter needs expected_outcome/],
  ['eval prompt without description', (r) => edit(r, `${quietCase}/prompt.md`, (t) => t.replace(/^description:.*\n/m, '')), /skill-creator-stays-quiet-on-plan-request\/prompt\.md: frontmatter needs description/],
  ['eval prompt with unclosed frontmatter', (r) => edit(r, `${quietCase}/prompt.md`, (t) => t.replace(/^---\n/, '--\n')), /skill-creator-stays-quiet-on-plan-request\/prompt\.md: missing or unclosed frontmatter/],
  ['eval case without graders', (r) => rm(r, `${quietCase}/graders`), /skill-creator-stays-quiet-on-plan-request: no graders/],
  ['grader with unclosed frontmatter', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replace(/^---\n/, '--\n')), /graders\/not-fired\.md: missing or unclosed frontmatter/],
  ['grader of an unknown type', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replace('type: tool_used', 'type: vibes')), /not-fired\.md: grader type "vibes" is not one of/],
  ['grader whose input_match is not a regex', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replace(/^input_match:.*$/m, "input_match: '(['")), /graders\/not-fired\.md: input_match is not a valid regex/],
  ['eval case named for no skill', (r) => fs.renameSync(path.join(r, quietCase), path.join(r, 'evals/plugin/nobody-stays-quiet-on-x')), /evals\/plugin\/nobody-stays-quiet-on-x: name must start with a skill name or "router-"/],
  ['quiet case that does not assert the skill stayed unused', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replace('max: 0', 'max: 1')), /skill-creator-stays-quiet-on-plan-request: a stays-quiet case needs a tool_used grader on Skill with max: 0 whose input_match matches legion:skill-creator/],
  ['quiet case whose max: 0 grader watches another tool', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replace('tool: Skill', 'tool: Bash')), /skill-creator-stays-quiet-on-plan-request: a stays-quiet case needs a tool_used grader on Skill/],
  ['quiet case whose max: 0 grader names another skill', (r) => edit(r, `${quietCase}/graders/not-fired.md`, (t) => t.replaceAll('skill-creator', 'writing-plans')), /skill-creator-stays-quiet-on-plan-request: a stays-quiet case needs a tool_used grader on Skill/],
  ['skill without a stays-quiet case', (r) => rm(r, quietCase), /skill-creator: no stays-quiet eval case in evals\/plugin\//],
  ['skill without a firing case', (r) => rm(r, 'evals/plugin/skill-creator-fires-on-new-skill'), /skill-creator: no firing eval case in evals\/plugin\//],
  ['firing case whose Skill grader names another skill', (r) => edit(r, 'evals/plugin/skill-creator-fires-on-new-skill/graders/skill-fired.md', (t) => t.replaceAll('skill-creator', 'brainstorming')), /skill-creator: no firing eval case in evals\/plugin\//],
  // Grader kinds (evals/grader-kinds.json): what each grader's delta is evidence of.
  ['grader-kinds.json missing', (r) => rm(r, 'evals/grader-kinds.json'), /evals\/grader-kinds\.json is missing/],
  ['grader-kinds.json with invalid JSON', (r) => write(r, 'evals/grader-kinds.json', '{not json'), /evals\/grader-kinds\.json: invalid JSON/],
  ['grader with no declared kind', (r) => json(r, 'evals/grader-kinds.json', (j) => { delete j['code-review-fires']['off-by-one']; return j; }), /code-review-fires\/graders\/off-by-one\.md: no kind in evals\/grader-kinds\.json/],
  ['grader kind that is not outcome or protocol', (r) => json(r, 'evals/grader-kinds.json', (j) => { j['code-review-fires']['off-by-one'] = 'vibes'; return j; }), /code-review-fires\/off-by-one: kind "vibes" is not one of outcome, protocol/],
  ['kind declared for a grader that does not exist', (r) => json(r, 'evals/grader-kinds.json', (j) => { j['code-review-fires'].ghost = 'outcome'; return j; }), /evals\/grader-kinds\.json: code-review-fires\/ghost names no grader/],
  ['kind declared for a case that does not exist', (r) => json(r, 'evals/grader-kinds.json', (j) => ({ ...j, 'code-review-ghost': { x: 'outcome' } })), /evals\/grader-kinds\.json: code-review-ghost\/x names no grader/],
  ['kind declared for a routing grader', (r) => json(r, 'evals/grader-kinds.json', (j) => { j['code-review-fires']['skill-fired'] = 'outcome'; return j; }), /code-review-fires\/skill-fired: a tool_used grader on Skill is a routing grader by type/],
  // Model tiers: a skill names a tier for a dispatch, never a model.
  ['skill that pins a model in a dispatch', (r) => edit(r, 'skills/brainstorming/references/grilling.md', (t) => `${t}\nDispatch it on \`model: "opus"\`.\n`), /brainstorming\/references\/grilling\.md:\d+: pins a model \(model: "opus"\); name a tier/],
];

for (const [name, mutate, expected] of validateRules) {
  test(`validate fails on: ${name}`, () => {
    const root = copyRepo();
    mutate(root);
    const { code, out } = run('validate.mjs', root);
    assert.equal(code, 1, out);
    assert.match(out, expected);
  });
}

test('a user-invoked skill needs no eval cases', () => {
  const root = copyRepo();
  edit(root, 'skills/skill-creator/SKILL.md', (t) => t.replace('license: MIT', 'license: MIT\ndisable-model-invocation: true'));
  rm(root, quietCase);
  rm(root, 'evals/plugin/skill-creator-fires-on-new-skill');
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
});

test('a SKILL.md over the soft line limit warns but passes', () => {
  const root = copyRepo();
  edit(root, 'skills/skill-creator/SKILL.md', (t) => `${t}${'\n'.repeat(400)}`);
  const { code, out } = run('validate.mjs', root);
  assert.equal(code, 0, out);
  assert.match(out, /WARN  skills\/skill-creator\/SKILL\.md has \d+ lines \(soft limit 400\)/);
});

const triggers = (root, name, fn) => json(root, `evals/triggers/${name}.json`, fn);
const triggerRules = [
  ['skill without a trigger file', (r) => rm(r, 'evals/triggers/writing-plans.json'), /writing-plans: missing evals\/triggers\/writing-plans\.json/],
  ['too few positive prompts', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, positive: j.positive.slice(0, 4) })), /skill-creator: needs at least 5 positive prompts/],
  ['too few negative prompts', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, negative: j.negative.slice(0, 1) })), /skill-creator: needs at least 2 negative prompts/],
  ['positive prompt that ranks another skill first', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, positive: [...j.positive, 'The checkout test fails with a TypeError, find out why'] })), /skill-creator: positive ranked #\d+ \(> top 1\): "The checkout test fails/],
  ['negative prompt that ranks the skill first', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, negative: [...j.negative, { prompt: 'Create a new skill and validate its SKILL.md' }] })), /skill-creator: negative prompt ranked this skill #1/],
  ['negative owner that is not a skill', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, negative: [...j.negative, { prompt: 'Review my diff', owner: 'ghost' }] })), /skill-creator: negative owner "ghost" is not a skill/],
  // Ranks code-review #1, systematic-debugging #2, and the named owner lower.
  ['negative prompt that ranks the skill above its owner', (r) => triggers(r, 'systematic-debugging', (j) => ({ ...j, negative: [...j.negative, { prompt: 'Review this pull request that fixes a flaky test', owner: 'writing-plans' }] })), /systematic-debugging: negative "Review this pull request that fixes a flaky test" ranks systematic-debugging #2 above its owner writing-plans #\d+/],
  ['rank-1 rate under the floor', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, positive: [...j.positive, ...Array.from({ length: 12 }, (_, i) => ({ prompt: `Review the diff of pull request ${i}`, top_k: 7 }))] })), /rank-1 rate \d+\.\d% is under the 90% floor/],
  // Two misses out of seven: the repo-wide rate stays above 90%, this skill's drops under 75%.
  ['one skill\'s rank-1 rate under the per-skill floor', (r) => triggers(r, 'skill-creator', (j) => ({ ...j, positive: [...j.positive, ...Array.from({ length: 2 }, (_, i) => ({ prompt: `Review the diff of pull request ${i}`, top_k: 7 }))] })), /skill-creator: rank-1 5\/7 \(71\.4%\) is under the 75% per-skill floor/],
  ['two near-duplicate descriptions', (r) => {
    const src = fs.readFileSync(path.join(r, 'skills/writing-plans/SKILL.md'), 'utf8');
    write(r, 'skills/zz-twin/SKILL.md', src.replace('name: writing-plans', 'name: zz-twin'));
    fs.copyFileSync(path.join(r, 'evals/triggers/writing-plans.json'), path.join(r, 'evals/triggers/zz-twin.json'));
  }, /descriptions too similar \(\d\.\d\d > 0\.35\): writing-plans \/ zz-twin|descriptions too similar \(\d\.\d\d > 0\.35\): zz-twin \/ writing-plans/],
];

for (const [name, mutate, expected] of triggerRules) {
  test(`trigger-evals fails on: ${name}`, () => {
    const root = copyRepo();
    mutate(root);
    const { code, out } = run('trigger-evals.mjs', root);
    assert.equal(code, 1, out);
    assert.match(out, expected);
  });
}

test('trigger-evals scores the router map row with the description', () => {
  const root = copyRepo();
  edit(root, 'skills/using-legion/SKILL.md', (t) => t.replace('| Creating, editing, or validating a skill |', '| Creating, editing, or validating a skill; quokka zeppelin |'));
  triggers(root, 'skill-creator', (j) => ({ ...j, positive: [...j.positive, 'quokka zeppelin'] }));
  const { code, out } = run('trigger-evals.mjs', root);
  assert.equal(code, 0, out);
});
