# Claude models for agent work

Facts from Anthropic's "Which Claude model should you build with? Fable,
Opus, Sonnet, or Haiku" (https://claude.dev/blog/which-claude-model-should-you-build-with/,
published 2026-11-09, read 2026-11-25). Benchmarks are Anthropic's own.
Prices and defaults change: before quoting one as current, check the
platform docs, and when this file and the docs disagree, the docs win.

## Contents

- Start here
- Model by task
- The four models
- Trade-offs
- Compatibility before migrating

## Start here

- Not sure: **Opus 5.5 at `medium`** (its default; the default model in
  Claude Code; half Fable 5.2's token price).
- Well-scoped everyday work (a bug fix, a feature against a spec):
  **Sonnet 5.5**. A clear spec alone is not enough: a migration or a
  performance optimization with a clear spec can still need Opus 5.5, or
  Fable 5.2 if it is major.
- The simplest high-volume work (classification, routing, extraction) and
  side tasks for a larger model: **Haiku 5.5**.
- The hardest technical work in coding, finance, and the sciences, long
  unattended runs, or when Opus 5.5 at `high` still falls short:
  **Fable 5.2**.
- Claude Mythos 5.2 (cybersecurity and life-sciences research) is
  available only through verification programs.

## Model by task

| Task | Start on | Starting effort |
|---|---|---|
| Everyday engineering and debugging; multi-PR features | Opus 5.5 | `medium`, then `high` |
| Classification, routing, tagging, high-volume extraction | Haiku 5.5 | `medium` |
| Subagents that search files, read logs, or summarize | Haiku 5.5 or Sonnet 5.5 | model default |
| Chat and interactive sessions | Sonnet 5.5 (Haiku 5.5 for simple chat at volume) | `low` or `medium` |
| Well-scoped coding: bug fixes, iteration, spec-driven work | Sonnet 5.5 | `medium`, then `high` |
| Everyday documents, slides, spreadsheets | Sonnet 5.5 (Opus 5.5 for a complex financial model or large source material) | `high` on the API, `medium` in Claude Code |
| Repeated agent tasks: investigation, review, drafting | Sonnet 5.5 | `medium` |
| Computer use and vision-heavy loops | Opus 5.5 | `medium` |
| Major refactors and migrations, architecture, leading many subagents | Fable 5.2 | `medium`, then `high` |
| Deep research; scientific or quantitative analysis | Fable 5.2 | `medium`, then `high` |

## The four models

| | Haiku 5.5 | Sonnet 5.5 | Opus 5.5 | Fable 5.2 |
|---|---|---|---|---|
| Built for | High volume, cost-sensitive | Fast, capable, well-scoped | Complex coding and knowledge work, daily | The most ambitious open-ended technical work |
| Latency | Fastest | Fast | Moderate | Moderate |
| Input / output, $ per M tokens | 0.10 / 0.50 up to a 100K prompt; 0.50 / 2.50 above | 2 / 10 | 4 / 20 | 8 / 40 |
| Cache reads, $ per M | 0.01 up to 100K; 0.05 above | 0.10 | 0.20 | 0.20 |
| Context / max output | 1M / 128K | 1M / 128K | 1M / 128K | 1M / 128K |
| Thinking on the API | Adaptive, on by default, can be off | Adaptive, on by default; `between_tools` skips upfront thinking | Always on | Always on |
| Default effort, API | `medium` | `high` (`medium` in Claude Code) | `medium` | `high` (`medium` in Claude Code) |
| Fast mode | No | No | Yes | Yes |

Prices are Claude API list prices.

## Trade-offs

**Cost per finished task, not per token.** A pricier model can finish for
less: Opus 5.5 at `high` matched Fable 5.1 at `max` on Terminal-Bench 3.0
with half the tokens, and Fable 5.2 at `high` matched Opus 5.5 at `max` on
FrontierCode 2.0 for about half the cost. Before raising Opus 5.5 past
`high`, test Fable 5.2. Price the hardest tasks, not only typical ones: on
one 20-problem benchmark two problems carried 43% of the spend.

**Effort.** Opus 5.5 on SWE-bench Pro: `medium` scored about 2.5 points
below `high` for about 70% of the cost; `low` about 8 points below for a
third; `xhigh` about 1.4 points above for 2.5 times the cost. Past `high`,
one more level can cost as much as the next model up, so test that model at
a lower effort instead. Effort adds latency and never adds knowledge.

**Verify, then retry failures.** When outcomes are checkable, run
everything low and re-run only failures high: Opus 5.5 at `low` with
failures re-run at `high` passed about 97% for about $0.17 a task, against
95.3% for $0.29 with every task at `high`.

**Latency.** For replies a person waits on, start Sonnet 5.5 at `low` or
`medium`. For speed without losing capability, pay for fast mode on Opus
5.5 or Fable 5.2.

**Context.** Every turn resends the context; on long runs most input bills
as cache reads (about $0.03 a turn at 150K tokens, $0.004 at 20K on Opus
5.5). The bigger the main model, the more a lean main context matters:
keep its context for decisions and let cheaper subagents do the verbose
reading. Haiku 5.5 pays off most on short prompts (a twentieth of Sonnet
5.5's input price); for prompts that are always long, compare it with
Sonnet 5.5 on cost per finished task.

## Compatibility before migrating

Build for the strictest model: keep history append-only, send
`tool_choice: auto` with `strict: true` tools, read content blocks by
`type`, and write prompts precise enough for the most literal model.

- Fable 5.2 preserves thinking on every API account: the API returns 400
  when anything before a Fable 5.2 thinking block changed (system prompt,
  tools, an earlier message), unless you opt in to dropping that thinking.
  Claude Code, the Agent SDK, and Managed Agents need no change.
- Opus 5.5 and Fable 5.2 always think; turning thinking off is an error.
  Haiku 5.5 can turn it off at `high` effort or below.
- `tool_choice` of `any` or `tool` returns 400 on Sonnet 5.5, Opus 5.5, and
  Fable 5.2: use `auto`, mark the tool `strict: true`, and say in the
  prompt when to use it.
- Computer use on the 5.5 models and Fable 5.2 works only through the
  `computer_toolset_20260801` toolset (Claude API, and Claude models on
  Google Cloud, Google managed).
- Haiku 4.5 to 5.5: replace `budget_tokens` with an effort level; drop
  non-default `temperature`, `top_p`, `top_k` (400); end `messages` with a
  user turn (a final assistant turn returns 400).
- Opus 5.5, Sonnet 5.5, and Fable 5.2 run safety classifiers that most
  often flag cybersecurity and biology. In Claude Code a flagged request can
  re-run on an older model with a notice in the transcript (Opus 4.8 for
  cybersecurity, Opus 5 for biology).
