---
name: executing-plans
description: >-
  Implements code spec-first and test-first: pins acceptance criteria, writes
  a failing test first and drives each change through red-green-refactor at
  public seams under the chosen coding principles, and gates every completion
  claim on fresh evidence.
  Executes a written plan task by task, deciding per task whether to work
  inline or dispatch a fresh subagent and reviewer, with a ledger that
  survives context compaction. Use when a plan is ready to execute,
  implement, or resume; when writing or changing production code without a
  plan, such as a feature, a bug fix whose cause is known, a pasted function,
  or unit tests for a function or code that has none yet, even when the
  request never mentions tests; and before saying work is done, fixed,
  passing, or ready to commit, or opening a PR.
license: MIT
metadata:
  author: ongtungduong
---

# Executing Plans

Every code change takes one path: pin what it must do, watch a test fail for
that, write the least code that passes, shape it with the chosen design
principles, and prove the result before claiming it. With a written plan you
take that path once per task; without one, the request is a plan of one task.

## The four rules

1. **Spec first.** Every change traces to an acceptance criterion; code that
   no criterion asks for is scope creep.
2. **Test first.** No production code without a test you watched fail for the
   expected reason. A test you never saw fail may pass for reasons unrelated
   to your change. Code written before its test is set aside and rebuilt from
   the test, because adapting it turns test-first into test-after. Only the
   user grants exceptions (throwaway spike, generated code, pure config).
3. **Principles.** Code follows the rule set loaded with
   `legion:coding-principles`; a documented repo convention wins where they
   disagree.
4. **Evidence.** No "done", "fixed", or "passing" without a check run in the
   same message and its output read; code and state change between the check
   and the claim.

## Pick the path

| Situation | Path |
|---|---|
| A written plan exists | Plan workflow |
| No plan, one or two seams: a function, a bug whose cause is known, tests for untested code | Quick path |
| No plan, several independent pieces, or the design is still open | Call the Skill tool with `legion:brainstorming` (intent unsettled) or `legion:writing-plans` (spec settled), then come back |
| A bug whose cause is unknown | Call the Skill tool with `legion:systematic-debugging` first; its regression test is your first RED |

## Quick path

1. **Pin the criteria** from the request, issue, or spec. If there are none and
   the change is not trivial, write them in one to three lines and confirm
   them with the user before coding.
2. **Load the principles** before the first test, even for a one-line change:
   call the Skill tool with `legion:coding-principles`; it names the set in
   one line and its rules shape the GREEN and REFACTOR steps.
3. **Run the TDD cycle** below, inline.
4. **Review if risky.** For a change to auth, secrets, untrusted input,
   persisted data, money, or concurrency, call the Skill tool with
   `legion:code-review` before claiming it.
5. **Run the evidence gate** and report in its format.

## Plan workflow

Progress:
- [ ] 1. Setup
- [ ] 2. Task loop, once per task
- [ ] 3. Final review
- [ ] 4. Finish

### 1. Setup

1. **Branch.** Do not implement on `main`/`master` without explicit consent;
   create a feature branch (or a worktree if the user wants isolation).
2. **Ledger** at `.legion/runs/<plan-basename>/progress.md`, first line
   `# Legion ledger - plan: <plan path>`. Add `.legion/` to `.gitignore` if
   missing and say so. If the ledger already names this plan, every
   `Task N: complete` line is done: resume at the first task without one.
3. **Read** the plan and the spec it names once; create one todo per task.
4. **Load the principles:** call the Skill tool with `legion:coding-principles`
   and load the plan's `Design principles` (pick them with that skill and
   ledger the choice if the plan has none).
5. **Pre-flight.** For each task that consumes what an earlier one produces,
   compare their Interfaces blocks and ledger each conflict with your ruling,
   or write `Pre-flight: no shared interfaces`.
6. **Choose the mode and model per task** (see "Inline or subagent") and
   ledger each as `Mode: Task N inline|subagent[+review] (<model>) - <reason>`,
   one line per task.

### 2. Task loop

1. **Start:** record `BASE=$(git rev-parse HEAD)`; re-read the task's own text.
2. **Implement.**
   - Inline: run the TDD cycle for each step, compare every command's output
     with the plan's expected output. Code wrong: call the Skill tool with
     `legion:systematic-debugging`. Plan wrong: make the smallest change that
     satisfies the spec and ledger the ruling.
   - Subagent: every implementer works in its own git worktree.
     1. `git status --porcelain` must be empty (the ledger is gitignored):
        a worktree sees only committed state.
     2. Write the task text to `.legion/runs/<plan>/task-N-brief.md`, then
        read [references/implementer-prompt.md](references/implementer-prompt.md).
     3. Dispatch with the Agent tool: `subagent_type: "general-purpose"`
        (never `fork`), `isolation: "worktree"`, and `model` from the model
        table. Pass absolute file paths, never pasted history. Ledger
        `Dispatch: Task N -> <model>, base <base7>`.
     4. Wait for its completion notice before touching the repo.
     5. Pin its head in your tree:
        `git branch -f legion/<plan>/task-N <head-sha>`. The harness may
        sweep its worktree, and the pin keeps the commits reachable.
     6. Confirm isolation held: your `git status --porcelain` is still empty,
        `HEAD` is still `BASE`, and `git log --oneline $BASE..legion/<plan>/task-N`
        lists only this task's commits.

     If the implementer returns BLOCKED on its isolation check, or anything
     leaked into your tree, ledger it, take the task inline from its current
     state, and run the rest of the plan inline.
3. **Review** every subagent task and every task marked `+review`.
   1. Write the package to `.legion/runs/<plan>/task-N-diff.txt`:
      `git log --oneline $BASE..<tip>; git diff --stat $BASE..<tip>; git diff -U10 $BASE..<tip>`.
      `<tip>` is `legion/<plan>/task-N` for a subagent task and `HEAD` for
      an inline one.
   2. Read [references/task-reviewer-prompt.md](references/task-reviewer-prompt.md)
      and dispatch a fresh, read-only reviewer: no worktree, `model` from the
      table. Spec compliance and quality must both pass.
   3. Send findings back to whoever implemented:
      - a subagent implementer: SendMessage it while `git worktree list`
        still shows its worktree; otherwise dispatch a new one whose reset
        target is the pinned head;
      - re-pin after each round, then re-review the fix.
   4. After three rounds without convergence, rule on each open finding.
4. **Completion contract**, all with evidence from this session: every named
   test exists and was seen failing, then passing; the full suite passed on
   the final run; every expected output was compared; every deviation has a
   ruling; the design principles' final checklist is answered for the task's
   code. For a subagent task, inspect the diff yourself; its report is not
   evidence.
5. **Integrate a subagent task:**
   1. `git merge --ff-only legion/<plan>/task-N`.
   2. `git worktree remove <its path>`.
   3. `git branch -d legion/<plan>/task-N <its worktree branch>`.

   A failed fast-forward means the base moved. Rule on it; never force it.
6. **Ledger, in the same call as the commit or merge,** one line per task,
   never a range: `Task N: complete (commits <base7>..<head7>, tests: <command> -> <result>)`.
   A resume after compaction trusts these lines to know where to restart.
   A `Dispatch:` line with no `complete` line means review resumes from the
   pinned `legion/<plan>/task-N`.

### 3. Final review

Call the Skill tool with `legion:code-review` for `git merge-base main HEAD`
to `HEAD`, on `opus`, passing the plan's Review
focus and pointing the reviewer at the ledger's `Ruling:` lines. Grade each
finding by its effect on a real user, then:

- Critical / Important: fix in one pass, each with a test that fails first;
  ledger `Final: fixed <finding> - <test> RED->GREEN`.
- Minor: ledger `Final: minor (deferred): <one line>`; do not fix.
- A finding you decide not to fix: ledger it as a ruling with its cost.

### 4. Finish

Run the evidence gate over the whole branch: the full suite, the build, and a
line-by-line check of the spec's success criteria. In the final message, list
every `Ruling:` under "Rulings I made" and every deferred minor under
"Deferred minors", in order and complete. Offer merge locally, open a PR, keep
the branch, or discard it, and wait for the user's choice. Delete
`.legion/runs/<plan>/` only after they choose.

## Inline or subagent

Decide per task yourself; the user's explicit choice overrides. A fresh
subagent buys an unbiased context and keeps this one small; it costs a cold
start (it re-reads what you already know), tokens, and anything the brief
leaves out.

| Signal | Inline | Subagent |
|---|---|---|
| Plan length | 1-3 tasks | 4 or more, where one context would carry every task's detail into compaction |
| Task | XS-S, fully pinned by its test and signature | M, or judgment the brief can still state completely |
| Coupling | Consumes interfaces still changing in this session, or needs conversation knowledge the plan lacks | Self-contained: the brief and the files are enough |
| Your context | Plenty left | About half used, or after a compaction |

- Use a subagent when the task is self-contained and at least one other
  subagent signal holds; otherwise work inline. An XS task stays inline
  unless your context is about half used: a worktree's cold start and
  dependency install cost more than the task. Re-decide when a task turns
  out bigger than its size or your context runs long, and ledger the change.
- Work inline, whatever the signals, when the Agent tool has no `isolation`
  parameter or an isolation check has failed in this run. Without a worktree
  a writing subagent edits your tree.
- Add `+review` (a fresh task reviewer, even for inline work) when a shipped
  mistake would be costly: auth, secrets, untrusted input, data migration,
  money (prices, totals, discounts, payments), concurrency.
- Name the model on every dispatch:

  | Dispatch | `model` |
  |---|---|
  | Implementer: XS-S, one file, fully pinned by its test and signature | `haiku` |
  | Implementer: M, several files, or judgment; any `+review` task | `sonnet` |
  | Task reviewer | `sonnet`; `opus` for a `+review` task |
  | Final review (both `legion:code-review` reviewers) | `opus` |

  A `haiku` implementer that returns BLOCKED for lack of judgment, or fails
  review twice, is re-dispatched on `sonnet`; ledger it. `fable` has no tier
  here yet, so do not pick it. If the Agent tool's model list changes, keep
  the tiers (cheap, standard, most capable) and ledger the alias you chose.
- One implementer at a time. A worktree isolates the files, but each task
  builds on the commits before it and integrates by fast-forward.
- Only writers get a worktree. Reviewers and lookups are read-only and work
  from the diff package and absolute paths.
- Without a subagent tool, run inline and never pretend to dispatch.

## The TDD cycle

1. **Name the seams.** A seam is a public boundary where behavior is observed
   without reaching inside: a function signature, module interface, endpoint,
   or CLI. Use the plan's seams if it names them. If the right seam is
   unclear, say so: a hard test is design feedback. Use `GLOSSARY.md` terms in
   test names when it exists.
2. **RED:** one minimal test for one behavior, named for the behavior ("rejects
   an empty cart"). Before writing it, name the production change that would
   make it fail; if you cannot, the test proves nothing. Before the first test
   of a session, read [references/good-tests.md](references/good-tests.md).
3. **Verify RED:** run it. It must fail (not error) because the behavior is
   missing, with the message you expected.
4. **GREEN:** the simplest code that passes. No options, parameters, or
   features the test does not demand.
5. **Verify GREEN:** run the test, then the project's **full** suite. Report
   every failure by name, including ones you did not cause.
6. **REFACTOR** only while green, by the loaded principles: remove the smell
   that most blocks the next change, re-run after each step, add no behavior.
7. **Next slice:** one seam, one test, one minimal implementation per cycle.

For a bug, the first test reproduces the reported symptom. For existing code
without tests, first write characterization tests that pin what it does today,
even where that looks wrong, then change it (the
`working-effectively-with-legacy-code` set covers breaking dependencies to get
a seam). Those tests stay in the suite; they are the point, not scaffolding.

## The evidence gate

1. **Identify** the command that proves the exact claim (table below).
2. **Run** it fresh and complete, not a narrower subset.
3. **Read** the whole output: exit code, failure count, warnings.
4. **Report** the result. If the output contradicts the claim, lead with the
   actual status; what you could not check here is unverified, never done.

| Claim | Evidence required | Not enough |
|---|---|---|
| Tests pass | The suite's output showing 0 failures | An earlier run; "should pass" |
| Build succeeds | The build command exiting 0 | Lint passing; logs looking fine |
| Bug fixed | The original symptom's reproduction now passing | The code changed |
| Regression test works | Seen failing without the fix, passing with it | Passing once |
| Requirements met | A line-by-line check against the spec or plan | Tests passing |
| Subagent finished | The diff in version control, inspected | Its report |

```
Verified: `npm test` -> 48 passed, 0 failed; `npm run build` -> exit 0.
Criteria: <each acceptance criterion> -> <test that proves it>.
Principles: <set(s)>; final checklist answered.
Unverified: deploy to staging (needs your credentials).
```

## Rulings, not stalls

Conflicts, ambiguities, and plan defects are yours to decide: the spec is the
binding authority, the plan argues from it, and your judgment settles what
neither answers. Ledger each as `Ruling: <decision> - <why> - <cost if wrong>`
and continue; an unledgered deviation is a decision the user never sees.
Do not pause between tasks to ask "should I continue?".

Stop and ask only for: an irreversible or destructive operation; a
security-sensitive action; a side effect outside the working tree that needs
consent (merge, push to a shared branch, publish); a plan so broken that every
path is a guess.

## Gotchas

- "The request didn't ask for tests" does not lift the test-first rule: it
  governs how code gets written, not what was asked.
- A new test that passes on its first run is testing existing behavior or
  nothing; fix the test before writing code. An erroring test (import
  failure, typo) is not RED either.
- A green run of one test file is not a green suite. The task bounds what you
  change, not what you verify.
- "Should", "probably", and "looks good" are claims without evidence; replace
  them with the command and its output.
- Conversation memory does not survive compaction. After one, trust the ledger
  and `git log` over your recollection; controllers that lost their place have
  re-done entire completed task sequences.
- Cut review ranges from the recorded `BASE`, never `HEAD~1`, which silently
  drops all but the last commit of a multi-commit task.
- `git clean -fdx` deletes `.legion/` (it is gitignored). Recover state from
  `git log` if that happens.
- A dispatch with no model named inherits the session's model, usually the
  most expensive one.
- `subagent_type: "fork"` copies the parent conversation into the subagent;
  start every subagent fresh (`general-purpose`), or it inherits the bias it
  was meant to escape.
- A native worktree branches from the repo's default branch, not from your
  feature branch, unless the user has set `worktree.baseRef: "head"`. The
  implementer's reset to `BASE` is what puts the earlier tasks' commits under
  it; without the reset the task builds on stale code.
- A worktree is a fresh checkout: gitignored files (`node_modules`, `.env`,
  build output) are missing. The implementer installs dependencies itself;
  secrets come only through a `.worktreeinclude` the user owns, never copied
  by an agent.
- Bash runs inside a subagent's worktree only from Claude Code 2.1.203. On
  older versions, and when a workflow script starts the agent, the isolation
  check catches the shared tree.
- An implementer that spawns its own reviewer duplicates the task review at
  full cost. The prompts forbid it; treat it as a defect if it happens.
