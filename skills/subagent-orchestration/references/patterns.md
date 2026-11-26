# Multi-model patterns and how to measure them

From Anthropic's "Which Claude model should you build with?"
(https://claude.dev/blog/which-claude-model-should-you-build-with/, read
2026-11-25), with orchestration lessons from superpowers, addyosmani/agent-skills,
and mattpocock/skills. Model names and prices are in `models.md` beside this
file.

## Contents

- Choosing a pattern
- Subagents on smaller models
- Lead and workers (bulk fan-out)
- Executor and advisor
- Switching the main model
- Routing in code
- Claude Code settings
- Measuring a setup

## Choosing a pattern

| Work | Pattern | Skip it when |
|---|---|---|
| One perspective on one artifact | One agent, no orchestration | Never the wrong start: it is the baseline every other pattern must beat |
| Verbose reading for a small digest | A subagent on a smaller model | The reading fits the main context with room to spare |
| Independent pieces, or work bigger than one context | Lead and workers | One chain of dependent steps, or it fits one window |
| Mostly routine turns with rare hard decisions | Executor and advisor | You have not measured the executor's consult rate |
| Different phases need different models | Switch at a natural break | Mid-task, with a large uncompacted history |
| A step-type-to-model rule | Routing in code | The rule needs judgment a lookup cannot make |
| Pieces must challenge each other's conclusions | Agent teams (members message each other), where the harness offers them | A verdict on a known artifact, where independent reports merged by the lead suffice |

A sequence with human judgment between steps (spec, then plan, then build)
stays with the human as orchestrator: an agent that runs the chain on their
behalf paraphrases at every hand-off and removes the checkpoints that catch
wrong-direction work.

## Subagents on smaller models

Keep small models on work where a mistake is cheap to spot (finding files,
running tests, reading logs) and keep edits and judgment calls on the main
model. A subagent definition in a project's `.claude/agents/`:

```markdown
---
name: log-reader
description: Reads test output and logs, and reports each failing case. Use after a test run.
tools: Read, Grep, Glob, Bash
model: haiku
---

Read the logs you're given. For each failure, report the file, the test name
and the first error line. Don't edit any files.
```

That file belongs to the user's project, where naming a model is their
choice; a Legion skill names a tier instead.

## Lead and workers (bulk fan-out)

A top-tier lead splits the task, hands the pieces to many cheaper workers in
parallel, and merges what comes back. On an internal defect search over
about 22 million tokens of source, an Opus 5.5 lead with up to 25 Sonnet 5.5
workers cost about a third less than Opus 5.5 alone at default effort, with
about the same score. Claude Managed Agents offers the same as multiagent
orchestration (a coordinator and a roster of workers).

What makes it work, from superpowers and mattpocock runs:

- Workers share pointers, not pasted text: a spec, ticket, notes file, or
  commit range. One observed dispatch was 42K characters, 99% of it pasted
  history.
- An exploration pass may write notes to a shared file outside the repo, so
  each worker reads the notes instead of exploring again.
- With a task graph, dispatch the frontier (every piece whose inputs are
  ready) and start the next pieces as merges unblock them.
- Each writer works in its own worktree and branch; one place merges.
- Review each piece against its brief (missing, extra, misunderstood), then
  review the merged whole once on the strongest model available.

## Executor and advisor

The advisor tool (beta) pairs a cheaper executor with a stronger advisor
the executor can consult partway; most tokens bill at the executor's rate.
It helps only when the advisor adds capability the executor lacks and the
executor asks, which it does less often at low effort. Anthropic's cost guide
found that across four pairings none clearly beat its executor alone, and an
Opus 5.5 executor at `high` with a Fable 5.1 advisor gained 1.7 points for
about 2.1 times the money, at the edge of run-to-run noise. Measure the
consult rate first.

Accepted pairs: a Sonnet 5.5 executor accepts Fable 5.2, Opus 5.5, Opus 5,
or Sonnet 5.5 as advisor; a Fable 5.2 executor accepts only Fable 5.2 or
Mythos 5.2.

## Switching the main model

- The prompt cache belongs to the model that wrote it: the first turn on a
  new model pays the cache-write price on the whole conversation. In Claude
  Code run `/compact` first or start a fresh session from a short written
  plan; on the API open the new model's conversation with a summary.
- Thinking blocks a model can read: Opus 5.5 reads Sonnet 5.5's and Haiku
  5.5's; Sonnet 5.5 reads Haiku 5.5's; Fable 5.2 reads Opus 5.5's, Sonnet
  5.5's, and Haiku 5.5's. A move down a tier loses the earlier reasoning, and
  a move from Fable 5.2 to any other model drops its reasoning. The API drops
  blocks a model cannot read and the request still succeeds.

## Routing in code

When the routing rule is simple, such as one model for each step type, let
code pick the model rather than asking a model to.

## Claude Code settings

- `model:` in a subagent definition sets its model;
  `CLAUDE_CODE_SUBAGENT_MODEL` sets the default for subagents that name
  none.
- The built-in `Explore` subagent runs on the session's model (on the API,
  capped at Opus). For cheap exploration, define a project subagent named
  `Explore` with `model: haiku`.
- The `haiku` alias resolves to Haiku 5.5 on the Anthropic API (Claude Code
  v2.1.293 or later) but still to Haiku 4.5 on Bedrock, Google Cloud,
  Microsoft Foundry, and Claude Platform on AWS. `ANTHROPIC_DEFAULT_HAIKU_MODEL`
  pins what it resolves to.
- `opusplan` (Opus plans, Sonnet executes) puts code edits on the smaller
  model, the reverse of the split above. Measure it on your own tasks before
  making it the default.

## Measuring a setup

1. Pull real tasks that have outcome checks.
2. Run each candidate at two or three effort levels, each in its own session
   so runs do not share cache.
3. Record cost per task from the `usage` field.
4. Plot score against spend; keep a multi-model setup only if it beats every
   single-model point. A gain of a point or two can be run-to-run noise.
5. Shadow-run the winner on a slice of real traffic before cutting over.

Quick check in Claude Code: run one backlog task on two models with `/model`
and compare `/usage`.
