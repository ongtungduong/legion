# Plan workflow

Read this when a written plan exists. The four rules, the TDD cycle, the
evidence gate, and the rulings policy in `SKILL.md` still apply to every task.

Progress:
- [ ] 1. Setup
- [ ] 2. Task loop, once per task
- [ ] 3. Final review
- [ ] 4. Finish

## 1. Setup

1. **Branch.** Do not implement on `main`/`master` without explicit consent;
   create a feature branch (or a worktree if the user wants isolation).
2. **Ledger** at `.legion/runs/<plan-basename>/progress.md`, first line
   `# Legion ledger - plan: <plan path>`. Add `.legion/*`, `!.legion/specs/`,
   `!.legion/plans/` to `.gitignore` if missing and say so (specs and plans stay
   committed; everything else in `.legion/` is scratch). If the ledger already names this plan, every
   `Task N: complete` line is done: resume at the first task without one.
3. **Read** the plan and the spec it names once; create one todo per task.
4. **Load the standards:** call the Skill tool with `legion:coding-principles`
   and load the plan's `Design principles` (pick them with that skill and
   ledger the choice if the plan has none). When the plan's `Performance`
   line is not `none`, also read that skill's `performance` reference; when
   its `Security` line is not `none`, also call the Skill tool with
   `legion:security-principles`. A plan without those lines gets them from
   the quick path's trigger lists, ledgered. Each task brief then names the matching checklist paths.
5. **Pre-flight.** For each task that consumes what an earlier one produces,
   compare their Interfaces blocks and ledger each conflict with your ruling,
   or write `Pre-flight: no shared interfaces`.
6. **Choose the mode and model per task** (see "Inline or subagent") and
   ledger each as `Mode: Task N inline|subagent[+review] (<model>) - <reason>`,
   one line per task.

## 2. Task loop

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
        read `references/implementer-prompt.md`.
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
   2. Read `references/task-reviewer-prompt.md`
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
   the final run; the bar held (evidence gate step 4) over `BASE..<tip>`;
   every expected output was compared; every deviation has a
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

## 3. Final review

Call the Skill tool with `legion:code-review` for `git merge-base main HEAD`
to `HEAD`, at deep depth, passing the plan's Review
focus and pointing the reviewer at the ledger's `Ruling:` lines. Grade each
finding by its effect on a real user, then:

- Critical / Important: fix in one pass, each with a test that fails first;
  ledger `Final: fixed <finding> - <test> RED->GREEN`.
- Minor: ledger `Final: minor (deferred): <one line>`; do not fix.
- A finding you decide not to fix: ledger it as a ruling with its cost.

## 4. Finish

Run the evidence gate over the whole branch: the full suite, the build, and a
line-by-line check of the spec's success criteria. In the final message, list
every `Ruling:` under "Rulings I made" and every deferred minor under
"Deferred minors", in order and complete. Offer merge locally, open a PR (body
from `assets/pr-body.md`, its Rulings section from the ledger), keep
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
  | Lookup: find files, run tests, read logs, summarize | `haiku` |
  | Implementer | `sonnet` |
  | Task reviewer | `sonnet`; `opus` for a `+review` task |
  | Final review | the models `legion:code-review` names for deep depth |

  `haiku` never edits code: a wrong lookup is cheap to spot, a wrong edit
  costs review rounds on a larger model. An implementer that returns BLOCKED
  for lack of judgment, or fails review twice, is re-dispatched with `effort`
  one level higher when the Agent tool takes that parameter, and on `opus`
  only if that fails too; ledger it. Otherwise leave `effort` unset, so each
  model runs at its default. `fable` has no tier here yet, so do not pick it.
  If the Agent tool's model list changes, keep the tiers (cheap, standard,
  most capable) and ledger the alias you chose.
- One implementer at a time. A worktree isolates the files, but each task
  builds on the commits before it and integrates by fast-forward.
- Only writers get a worktree. Reviewers and lookups are read-only and work
  from the diff package and absolute paths.
- Without a subagent tool, run inline and never pretend to dispatch.

## Gotchas

- Conversation memory does not survive compaction. After one, trust the ledger
  and `git log` over your recollection; controllers that lost their place have
  re-done entire completed task sequences.
- Cut review ranges from the recorded `BASE`, never `HEAD~1`, which silently
  drops all but the last commit of a multi-commit task.
- `git clean -fdx` deletes the gitignored part of `.legion/` (ledger, briefs). Recover state from
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
