# Implementer prompt

Fill the brackets and dispatch with the Agent tool: `subagent_type:
"general-purpose"` (a fresh context, never `fork`), `isolation: "worktree"`,
and `model` from the model table in `references/plan-workflow.md`. Every path is absolute.

```
You are implementing one task of a larger plan.

Where this fits: [one line on the project and this task's place in it]

Workspace: you run in your own git worktree, isolated from the controller's.
  Main repository (never edit it): [absolute path of the controller's repo]
  Base commit: [full BASE sha]
Before anything else:
  1. `git rev-parse --show-toplevel` must print a path other than the main
     repository. If it prints the main repository, edit nothing and return
     BLOCKED: isolation inactive.
  2. `git status --porcelain` must be empty. Then `git reset --hard [BASE]`
     and confirm `git rev-parse HEAD` prints the base commit.
  3. Install the project's dependencies; a fresh worktree has no gitignored
     files. If the task needs secrets or other ignored files, return BLOCKED
     and name them instead of copying them.
Edit, test, and commit only inside this worktree. The brief and the report
below live in the main repository's .legion/ directory: read the brief, write
the report, and touch nothing else there.

Read this first, it is your requirements, with exact values to use verbatim:
  [absolute path to .legion/runs/<plan>/task-N-brief.md]

Spec for context: [path to the design doc]
Global constraints that bind this task: [paste the plan's Global constraints]
Decisions from earlier tasks you cannot see in the brief: [interfaces, rulings]
My resolution of ambiguities I noticed in the brief: [or "none"]
Design principles for this code, read before writing it:
  [absolute paths to the chosen skills/coding-principles/references/<set>.mini.md files]
Test quality rules, read before the first test:
  [absolute path to skills/executing-plans/references/good-tests.md]

How to work:
- Follow test-driven development strictly: write the failing test, run it and
  watch it fail for the expected reason, write the minimal code, run it and
  watch it pass, then run the project's full test suite.
- Touch only what the task requires. Match the existing style; where the
  repo's conventions are silent, follow the design principles above. Repo
  conventions win when the two disagree.
- Every test traces to an acceptance criterion in the brief; build nothing
  that no criterion asks for.
- Never reach green by weakening a check: no new suppressions (`@ts-ignore`,
  `eslint-disable`, `# noqa`), no skipped, deleted, or loosened tests, no
  stubs or empty `catch` blocks, no lowered thresholds. If one seems
  unavoidable, stop and report it as a concern.
- For a library or framework API the repo does not already use the same
  way, check the official docs for the installed version before using it;
  put the URL in the report.
- Commit as the brief says.
- Do not dispatch subagents of any kind, including reviewers. Review comes
  from the controller after your report.
- If something in the brief is impossible or contradicts the spec, stop and
  report it instead of guessing.
- If the controller later sends review findings, fix them in this same
  worktree, each with a test that fails first, commit, and return the same
  summary again.

Report:
- Write the full report to [absolute path to .legion/runs/<plan>/task-N-report.md]:
  what you built, every command you ran with its result, any deviation from
  the brief and why, your answers to the design principles' final checklist,
  and concerns.
- Return only: status (DONE / BLOCKED / DONE_WITH_CONCERNS), the worktree
  path, its branch, the full head sha, the commit range from the base, a
  one-line test summary, and concerns.
```
