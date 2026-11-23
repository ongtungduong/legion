// What a grader's result is evidence of. Zero dependencies.
//
//   routing   the skill fired, or stayed quiet (a tool_used grader on Skill).
//             Known from the grader's type, never declared.
//   protocol  Legion's own procedure or format: a named report line, a
//             heading, a plugin file that was read, a step order. An agent
//             that never saw the plugin fails it by construction.
//   lift      an outcome the plugin is expected to improve: a result a user
//             who never heard of Legion would still call better (the cause
//             found, the question that mattered asked) that the baseline is
//             expected to miss. Its with-minus-without delta is the evidence
//             that the plugin helps; a lift grader the baseline also passes
//             measures nothing and gets a harder prompt or is cut.
//   guard     an outcome the baseline is expected to reach too (the plain
//             answer given, the obvious bug found). It shows the plugin does
//             no harm: only a regression counts, a zero delta is the expected
//             result.
//
// Lift and guard are both outcome graders. The kind is declared before a run,
// so a result cannot reclassify the grader that produced it. Every grader that
// is not a routing grader declares its kind in evals/grader-kinds.json, so a
// new grader cannot count as evidence by default.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './skills.mjs';

export const KINDS_FILE = path.join(ROOT, 'evals', 'grader-kinds.json');
export const DECLARED_KINDS = ['lift', 'guard', 'protocol'];
export const OUTCOME_KINDS = ['lift', 'guard'];

// `tool` is frontmatter in a grader file and `config.tool` in a run result.
export const isRoutingGrader = (grader) =>
  grader?.type === 'tool_used' && (grader.tool ?? grader.config?.tool) === 'Skill';

// { kinds: { <case>: { <grader>: <kind> } } | null, error: message | null }
export function loadGraderKinds() {
  const name = 'evals/grader-kinds.json';
  if (!fs.existsSync(KINDS_FILE)) return { kinds: null, error: `${name} is missing` };
  let kinds;
  try { kinds = JSON.parse(fs.readFileSync(KINDS_FILE, 'utf8')); }
  catch { return { kinds: null, error: `${name}: invalid JSON` }; }
  if (!kinds || typeof kinds !== 'object' || Array.isArray(kinds)) return { kinds: null, error: `${name}: must be an object of cases` };
  return { kinds, error: null };
}

// The kind of one grader of one case; 'unclassified' when nothing declares it
// (a case that was renamed or removed since the run).
export function kindOf(kinds, caseName, grader) {
  if (isRoutingGrader(grader)) return 'routing';
  const declared = kinds?.[caseName]?.[grader.name];
  return DECLARED_KINDS.includes(declared) ? declared : 'unclassified';
}
