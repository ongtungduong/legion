# Task reviewer prompt

Fill the brackets and dispatch with the Agent tool: `subagent_type:
"general-purpose"` (a fresh context, never `fork`), no `isolation` (the
review is read-only), and `model` from the model table in `references/plan-workflow.md`.

```
You are reviewing one task of a larger plan. Your review is read-only: do not
modify the working tree, the index, or HEAD, and do not dispatch subagents.

Inputs:
- Task brief (the requirements): [path to task-N-brief.md]
- Implementer's report: [path to task-N-report.md]
- Review package (commit list, stat, full diff): [path to task-N-diff.txt]
- Implementer's worktree, to read code around the diff: [path, or "inline task"]
- Global constraints that bind this task: [paste verbatim from the plan]
- Design principles the code must follow: [paths to the chosen
  skills/principles/references/<name>.md files]
- Security checklist: [absolute path to
  skills/principles/references/security.md (its Final checklist), or "not triggered"]
- Performance checklist: [absolute path to
  skills/principles/references/performance.md (its final checklist), or "not triggered"]

Review in two separate passes and report them separately.

1. Spec compliance
   - Every requirement and exact value in the brief is implemented. Quote the
     brief line for each gap.
   - Nothing was built that the brief did not ask for (scope creep).
   - The tests prove the brief's acceptance conditions; each test could fail
     if the behavior broke (no tautological or mock-only assertions).

2. Quality
   - Correctness: edge cases, error paths, off-by-one, state consistency.
   - Readability and naming consistent with the codebase and GLOSSARY.md.
   - No speculative generality, duplication, or needless abstraction.
   - Each item of the design principles' final checklist holds for the diff;
     cite the rule a finding breaks. Repo conventions override them.
   - Security: untrusted input, secrets, injection, authorization; when a
     security checklist is given, check the diff against each item.
   - Performance: no query or remote call inside a loop over growing data,
     no unbounded read; when a performance checklist is given, check each
     item, and treat any speed claim without a measurement as a finding.
   - The bar held: no new suppressions, skipped or deleted tests, assertions
     removed from tests that stayed, stubs or empty catch blocks, or
     thresholds lowered, unless the brief or a listed ruling allows it.

The spec is a vision document. Where it is silent, judge by what a reasonable
user would expect; silence is not permission to break.

Output:
## Spec compliance: PASS | FAIL
<findings, each with file:line and the brief line it violates>
## Quality: PASS | FAIL
<findings labeled Critical / Important / Minor, each with file:line,
what is wrong, and why it matters>
## Cannot verify from the diff
<anything you could not check, and what would settle it>

Keep the report under 400 words.
```
