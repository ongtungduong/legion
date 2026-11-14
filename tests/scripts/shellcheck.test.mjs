// Behavior tests for scripts/shellcheck.mjs: it lints every shell script,
// skips with a note when shellcheck is missing locally, and fails in CI.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(REPO, 'scripts', 'shellcheck.mjs');
const dirs = [];
after(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); });

function tmp() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'legion-shellcheck-'));
  dirs.push(d);
  return d;
}

// A fake shellcheck that records its arguments and exits with `code`.
function fakeShellcheck(code) {
  const bin = tmp();
  const log = path.join(bin, 'args.log');
  fs.writeFileSync(path.join(bin, 'shellcheck'), `#!/bin/sh\necho "$@" >> "${log}"\nexit ${code}\n`, { mode: 0o755 });
  return { bin, log };
}

function fixtureRepo() {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'hooks'));
  fs.writeFileSync(path.join(root, 'hooks', 'hooks.json'), JSON.stringify({
    hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/start"' }] }] },
  }));
  fs.writeFileSync(path.join(root, 'hooks', 'start'), '#!/usr/bin/env bash\necho hi\n');
  fs.mkdirSync(path.join(root, 'tests'));
  fs.writeFileSync(path.join(root, 'tests', 'a.sh'), '#!/usr/bin/env bash\necho a\n');
  fs.mkdirSync(path.join(root, 'node_modules', 'x'), { recursive: true });
  fs.writeFileSync(path.join(root, 'node_modules', 'x', 'skip.sh'), 'echo skip\n');
  return root;
}

function run(root, env) {
  const { CI, ...base } = process.env;
  const res = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', env: { ...base, LEGION_ROOT: root, ...env } });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

test('lints registered hooks and *.sh files, not node_modules', () => {
  const root = fixtureRepo();
  const { bin, log } = fakeShellcheck(0);
  const { code, out } = run(root, { PATH: `${bin}:/usr/bin:/bin` });
  assert.equal(code, 0, out);
  const args = fs.readFileSync(log, 'utf8');
  assert.match(args, /hooks\/start/);
  assert.match(args, /tests\/a\.sh/);
  assert.doesNotMatch(args, /skip\.sh/);
});

test('a shellcheck finding fails the run', () => {
  const root = fixtureRepo();
  const { bin } = fakeShellcheck(1);
  const { code, out } = run(root, { PATH: `${bin}:/usr/bin:/bin` });
  assert.equal(code, 1, out);
});

test('missing shellcheck skips with a note locally', () => {
  const root = fixtureRepo();
  const { code, out } = run(root, { PATH: tmp() });
  assert.equal(code, 0, out);
  assert.match(out, /NOTE  shellcheck not installed; skipped/);
});

test('missing shellcheck fails in CI', () => {
  const root = fixtureRepo();
  const { code, out } = run(root, { PATH: tmp(), CI: 'true' });
  assert.equal(code, 1, out);
  assert.match(out, /ERROR shellcheck not installed/);
});
