---
name: orchestrating-subagents
description: >-
  Decides how the tasks of a plan, or the pieces of a large or read-heavy
  job, run: inline or on a subagent, on which model tier and effort by the
  cost of a wrong answer, with a self-contained brief and a short return
  contract, in which group it runs concurrently, with every result verified
  and failures escalated by verification, then effort, then model. Also
  designs multi-model agent setups (a lead agent with cheaper subagents,
  executor and advisor, a model per step) from the model-selection guidance
  of Anthropic. Use when work is about to be delegated, in any domain: "use
  subagents", "run this plan with agents", "split this across agents",
  "dispatch agents concurrently", "delegate the research", "orchestrate
  agents", which model each agent or step runs on, Haiku vs Sonnet vs Opus
  vs Fable, effort levels for agents, defining subagents in .claude/agents,
  cutting the cost of an agent pipeline, and before dispatching several
  subagents, even when the split looks obvious.
license: MIT
metadata:
  author: ongtungduong
---

# Subagent Orchestration

A subagent runs in its own context window, bills its tokens at its own
model's rate, and hands back a summary. That buys two things: the main
context stays lean for decisions, and cheaper models do the verbose reading.
It costs a brief, a wait, and a check of what comes back. Delegate when the
first two outweigh the third; otherwise do the work yourself.

## Workflow

1. **Check who may delegate.** The user's instructions and the harness win:
   if the harness says to spawn subagents only when the user asks, and the
   user has not, do the work inline and use steps 2 and 3 only to order it.
   A loaded skill that defines its own roles and tiers (such as
   `legion:auditing-security`) governs its own subagents; this skill fills
   only what it leaves open.

2. **Take the pieces, then decide what to delegate.**
   - **From a plan**: when an approved plan exists (from `legion:planning`
     or the user), its tasks are the pieces. Do not re-split them: read each
     task's Inputs, Scope, Depends on, Parallel with, and Done when, and
     dispatch the frontier (every task whose inputs exist) as step 6 says.
     A task too big for one subagent context goes back to the plan as a
     split, with the user told, rather than being split silently here.
   - **Without a plan**: multi-step work whose order is not obvious (several
     deliverables, shared decisions, irreversible steps) gets a plan first:
     call the Skill tool with `legion:planning`. A plain fan-out (read many
     sources for a digest, apply one check to many items, independent
     pieces with no order) is split here, by source or item.

   Then decide each piece by the shape of its work. The default is to do
   it yourself: one agent with good tools beats a team on most work, and a
   team spends several times the tokens per success. Delegate only where
   the shape says it pays:

   | Shape of the work | Run it | Why |
   |---|---|---|
   | Independent pieces, or reading that dwarfs the answer (research, a digest, one check over many items) | Delegated, in parallel | Decomposable work is where teams win, and the main context keeps only the digest |
   | Bigger than your remaining context | Delegated, one piece per window | Isolation is the only way it fits |
   | A check whose miss is expensive (security, a release gate) | 2 or 3 independent checkers on the same scope (voting) | Independent attempts catch what one misses; act on the union, verifying each finding |
   | A sequence where each step depends on the state the last one left (a rename chain, a constrained schedule, one bug) | One agent, in order | Split sequential work loses: every multi-agent setup scored worse on sequential planning |
   | Many tools against one shared state (one codebase, one environment, one document), including one change spread over several files | One agent | Coordination overhead grows with the number of tools, and hand-offs lose the state; disjoint files do not make one change independent |
   | Work you already do reliably in this context | Yourself | Once one agent mostly succeeds, more agents add errors faster than they add answers |
   | Failures that may share an unknown cause | Yourself, together first | Split, the shared cause is seen by no one |

   A piece that fails alone is not a reason to add agents: fix its brief,
   its tools, or its check first (step 8). The evidence behind each row,
   with its limits, is in [references/evidence.md](references/evidence.md);
   read it when the user questions a split or a row does not fit.

3. **Assign each piece by the cost of a wrong answer.** Take the model for
   each tier from the tier table in `legion:finding-skills`.

   | Piece | Tier | Why |
   |---|---|---|
   | Find files, run commands, read logs, extract or classify at volume | `cheap` | A wrong answer is cheap to spot |
   | Well-defined, repeated work: review, investigation, drafting, the workers of a bulk fan-out | `standard` | Repeated, well-scoped tasks rarely need a bigger model |
   | Edits, judgment calls, anything the main work builds on | `session`, or do it yourself | A misread here sends everything after it the wrong way |
   | A verdict the user relies on: final review, independent verification | `top` | A checker weaker than the work it checks is a formality |

   Small models do well on checkable, high-volume work and worse on long
   agentic loops: a task of many steps from a prose description takes
   `standard` at least, since a cheap model that needs three times the
   turns costs more. A clear spec alone does not make a task small: a
   migration or performance change with a clear spec still needs the
   main model.

4. **Set effort only where it pays.** Leave each subagent at its model's
   default effort, except when outcomes can be checked automatically (a
   test, a build, a validator, a schema): then dispatch the batch at
   `low` effort and re-run only the failures at `high`. This skill is the
   instruction that asks for those effort levels.

5. **Write each brief** from [assets/brief-template.md](assets/brief-template.md)
   when you dispatch a piece. A subagent starts with none of your context,
   so the brief carries:
   - one line on the goal and where this piece fits;
   - the scope: what it may read and change, and what it must leave alone
     ("read-only" when it is);
   - inputs as pointers (paths, URLs, commit ranges), not pasted content,
     and exact values (names, numbers, signatures) verbatim;
   - how it checks its own result before reporting (the test, build, or
     script to run), when one exists;
   - when it is done, and when to stop instead: a missing input or an
     ambiguity returns BLOCKED with the question, not a guess. A subagent
     cannot ask you mid-task, so without a stop condition it repeats
     steps, drifts from the task, or ends early, the commonest
     multi-agent failures;
   - absolute paths, so a worker that changes directory cannot misread
     them;
   - the return contract: a status, the answer in a few lines with
     `file:line` or source for each claim, and anything long written to a
     file whose path it returns.

   No session history, no summaries of earlier pieces it does not need,
   and no instruction to start subagents of its own.

6. **Dispatch.** Send every independent piece in the same message, so they
   run in parallel; one call per message runs them one after another. A
   dependent piece waits for its input and receives it as a pointer. Two
   writers never share files: give each its own worktree
   (`isolation: "worktree"`) or a disjoint set of files, and merge in one
   place. Background subagents notify you when done; keep working rather
   than polling.

7. **Verify before you use a result.** You are the only gate: results
   merged unchecked compound each other's errors, while a central check
   before merging contains them. Check each against its Done when and the
   goal, not only that it builds or reads well. A summary is a claim. Check it with
   the cheapest evidence that would expose it: open the cited `file:line`,
   re-run the test or build, spot-check a sample of extractions, compare
   pieces for conflicts. Check a `cheap` result before acting on it when
   acting is costly: a misread search result sends the main model to the
   wrong file. After merging, run the whole check once (the full suite,
   the build, the end-to-end read), since pieces that pass alone can fail
   together.

8. **Escalate a failed piece in this order**, re-running only what failed:
   1. give it a way to verify its own work (a test, a build, a script that
      calls the endpoint);
   2. raise effort one level;
   3. move to the next tier up, starting at a lower effort than the
      smaller model used.

   Effort does not add knowledge or skill the model lacks; past `high`,
   one more level can cost as much as the next model up. To fix a piece,
   resume the agent that did it (SendMessage keeps its context); to check
   a piece, start a fresh one, since the author cannot check itself.

9. **Keep state outside your context on long runs.** With more than a
   handful of pieces, keep a ledger in `.legion/runs/<topic>/ledger.md`:
   each piece, its status, and its result's path. Your memory of what was
   dispatched does not survive compaction; a controller without a ledger
   re-dispatches finished work, the most expensive failure there is.

When the user is designing a setup rather than dispatching in this session
(an application or API pipeline, agent definitions for a project, which
model a step should use), read [references/models.md](references/models.md)
for the models, prices, effort defaults, and compatibility facts, and
[references/patterns.md](references/patterns.md) for the lead-and-workers,
advisor, and model-switching patterns, the Claude Code settings, and how to
measure a setup before adopting it.

## Gotchas

- **An omitted `model` inherits the session's model**, usually the most
  expensive one, and silently undoes step 3. Name a tier on every
  dispatch. The built-in `Explore` subagent also runs on the session's
  model rather than always on the smallest one.
- **Everything a subagent returns stays in your context** and is re-read on
  every later turn. A contract of a status plus a few lines, with long
  output in a file, keeps the main context for decisions.
- **Parallel writers on one tree conflict**, and the conflict often shows
  only when the merged result is checked. Isolate them or run them in
  sequence.
- **Depth is one.** Subagents cannot start subagents in Claude Code, and a
  coordinator agent that only decides which agent to call adds a
  paraphrasing hop and its cost without adding a decision. The main
  session orchestrates.
- **Do not pre-judge a checker.** A brief for a reviewer or verifier that
  says "do not flag X" or "this is at most minor" turns the check into a
  formality. Let it raise the finding and decide it yourself.
- **Subagents report; they do not debate.** When pieces must challenge
  each other (competing hypotheses for one failure), independent reports
  never meet. Compare them yourself, or, where the harness offers agent
  teams whose members message each other, use those.
- **A review-and-fix loop needs clear criteria and a cap.** A fresh checker
  against stated criteria with the author fixing pays only when a round
  measurably improves the result; stop after two rounds or when a round
  finds nothing new, and decide the end yourself. Agents left to judge
  their own termination loop or stop early.
- **Simple routing belongs in code.** When the rule is "one model per step
  type", a lookup picks the model; asking a model to pick adds a call and
  a way to be wrong.
- **A model switch mid-conversation is not free.** The prompt cache belongs
  to the model that wrote it, so the first turn on a new model pays to
  cache the whole conversation, and a move down a tier loses the earlier
  reasoning. Switch at a natural break, after `/compact` or with a short
  written plan in a fresh session.

## Output format

Before dispatching three or more subagents, or when the user asks for the
plan, show the split:

```markdown
| # | Piece | Tier (model) | Effort | Runs | Returns | Checked by |
|---|---|---|---|---|---|---|
| 1 | <scope> | cheap (<alias>) | default | parallel A | <contract> | <evidence> |

Not delegated: <what you do yourself, and why>
```

After the run, report each piece's result as verified (with the evidence)
or unverified (with what is missing), then the merged check's outcome.
