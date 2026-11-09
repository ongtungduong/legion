#!/usr/bin/env node
// Runs skill-creator's agentskills.io validator on every skill. Fails on any
// error and, stricter than the validator itself, on any warning: skill-creator
// says to review every warning before delivering, and in this repo that review
// ends in a fix.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, SKILLS_DIR, listSkills } from './lib/skills.mjs';

const validator = path.join(SKILLS_DIR, 'skill-creator', 'scripts', 'validate_skill.py');
let failed = 0;
for (const name of listSkills()) {
  const run = spawnSync('python3', ['-I', validator, path.join(SKILLS_DIR, name), '--json'], { encoding: 'utf8' });
  if (run.error) { console.log(`ERROR python3 not runnable: ${run.error.message}`); process.exit(1); }
  let report;
  try { report = JSON.parse(run.stdout); } catch { console.log(`ERROR ${name}: validator output not JSON: ${run.stderr || run.stdout}`); failed++; continue; }
  const issues = [...report.errors.map((e) => `ERROR ${e}`), ...report.warnings.map((w) => `WARN  ${w}`)];
  if (issues.length) { failed++; for (const i of issues) console.log(`${name}: ${i}`); }
}
console.log(`validate-spec: ${listSkills().length} skills checked against agentskills.io, ${failed} with issues`);
process.exit(failed ? 1 : 0);
