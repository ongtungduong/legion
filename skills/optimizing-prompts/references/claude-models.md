# Claude Model and API Facts for Prompts

Read this when the target prompt names a model or the API, or touches
prefill, thinking, effort, tools, search, subagents, agent loops, output
length, or JSON output.

Sources (read 2026-11-25), all under
https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/:
`claude-prompting-best-practices`, `prompting-claude-opus-5-5`,
`prompting-claude-sonnet-5-5`, `prompting-claude-haiku-5-5`. The pages
change with each release; when a fact here decides the rewrite, say so in
Notes and point the user to the model's guide.

## Contents

1. [All current models](#all-current-models)
2. [Opus 5.5](#opus-55)
3. [Sonnet 5.5](#sonnet-55)
4. [Haiku 5.5](#haiku-55)
5. [Older models](#older-models)
6. [Ready-made lines](#ready-made-lines)

## All current models

- **Prefill is gone.** From 4.6 on, prefilling the last assistant turn
  returns a 400. Replace it by what it was for: structured outputs or a tool
  schema for a format (a tool with an enum field for classification);
  "Respond directly without preamble" plus post-processing to skip
  preambles; the cut-off text moved into the user turn to continue it.
- **`budget_tokens` is gone** (a 400 from 4.7 on). Thinking is adaptive;
  control it with `output_config.effort`. `max_tokens` is the hard limit and
  counts thinking too, even when thinking is not returned: a value sized for
  an older non-thinking model cuts replies off.
- **Effort, not prompt lines, controls thinking.** On the 5.5 models a
  prompt line telling the model to think less, or to answer directly, does
  not reliably reduce thinking. Lower the effort level instead.
- **Asking for reasoning in the response can be refused.** A prompt, skill,
  or tool description that asks the model to write out its thinking or
  reasoning in the reply may be declined with `stop_reason: "refusal"`,
  category `reasoning_extraction`. Remove such lines; a short explanation of
  the answer or a summary of actions is still fine. Developers read
  reasoning from summarized thinking (`display: "summarized"`).
- **Code reads blocks by `type`,** never by position: a reply can start with
  a thinking or progress-update block.
- **Changing `effort` or `system` mid-conversation breaks the cache** and
  can invalidate thinking blocks. Add standing prompt text from the first
  request; change instructions later in the newest turn.
- **User text never goes inside a `tool_result` block.** The 5.5 models
  resist prompt injection and may treat it as untrusted. Mid-turn user input
  is a text block after the last `tool_result` in the same user message;
  harness notices go in a separate system message, never in the same block
  as the user's words.
- Write the prompt's style the way the output should look, say what to do
  instead of what not to do, and name the specific patterns to avoid rather
  than a vague "avoid a generic look" (which swaps one default for another).

## Opus 5.5

- Thinking always on; `thinking: {"type": "disabled"}` returns a 400.
  Default effort `medium` (Opus 5: `high`); at the same level it thinks more
  than Opus 5. Reserve `xhigh`/`max` for measured gains. For long agentic
  coding turns, `max_tokens` 128,000 has worked well.
- Migrating a thinking-disabled prompt: start at `low` effort; "Answer
  directly without deliberating." can cut thinking further (measure
  quality); remove "don't think" rules and requests to write reasoning in
  the reply.
- Chat system prompts: remove "think carefully before answering" lines;
  replies start sooner with no clear quality loss. For multi-turn chat,
  optionally add the "treat that answer as done" line below; leave it out of
  long analyses and agentic work.
- Unattended agent loops: progress updates can end a turn with text, so a
  loop that treats any text-only end as done stops early. Keep a task list
  the model updates; if a turn ends with items open and no stated blocker,
  send "Your task list still has open items: <items>. Continue with them. If
  one is blocked, say what is blocking it." Stop after two or three
  automatic continuations.
- Loosely specified multi-app tasks: it starts fast and can miss context;
  add the "explore broadly" line below, and keep untrusted content out of
  what it searches.
- Highly responsive to elapsed time: a harness line such as
  `elapsed 340s / 1200s` steers pace; the budget is advisory.
- Pasted third-party content: mark it as in `guardrails.md` (pasted-content
  tags).
- Dense visual inputs (technical drawings): give higher-resolution images
  and a crop or code tool.

## Sonnet 5.5

- Effort recalibrated from Sonnet 5: re-sweep. Default `high`; agentic
  coding `medium` (well specified) or `high`; chat and latency-sensitive
  work `medium` or `low`. At `low`/`medium` on long agentic tasks it pauses
  to check in more and may skip verification.
- Lowest thinking: `thinking: {"type": "between_tools"}`, accepted only at
  `high` or below, with no other thinking field. Remove "don't think" lines:
  they can make it write internal XML tags in visible output.
- Scope: at every effort it tends to add tests, docs, and small files the
  user did not ask for. Use the "keep working" and "stop and report" lines
  below; at `xhigh`/`max` also the "no extra review rounds" line.
- Open-ended asks ("show me what you can do") can lead to building when
  only ideas were wanted: say so, or add the "ideas, options, or a plan"
  line below.
- JSON answers that need several reasoning steps: at `low`/`medium` it often
  answers without thinking. With adaptive thinking, end the system prompt
  with "Think the problem through before you answer." With structured
  outputs, treat `stop_reason: "max_tokens"` as a failure even if the JSON
  parses. Without structured outputs it may reason in the text and put JSON
  last: parse the last JSON value, not first `{` to last `}`.
- Chat and knowledge work: it sometimes answers from training data. Remove
  "only use tools when strictly necessary" / "minimize tool calls", then add
  the "check specifics that may have changed" line below.
- Coding: at `low` it may report a change done without running a check; add
  the verification paragraph below.
- Tool names: it may call `bash` for `Bash`; accept unambiguous matches or
  return an error naming the exact tool.

## Haiku 5.5

- Effort: `low` for chat and simple high-volume work (in long agent prompts
  it may then skip a search, stop early, or skip a check); `medium` default;
  `high` for knowledge work, long agent tasks, strict instruction following.
  Thinking can be disabled at `low` to `high`.
- Search: give today's date ("The current date is {{current_date}}.") in the
  system prompt or the search tool description. With a long system prompt
  or at `low`, add the "training data ends" line below. Do not write "search
  for any present-day factual question regardless of confidence": it
  doubled needless searches with no accuracy gain.
- With thinking off and structured JSON output, it may skip a needed tool
  call: use adaptive thinking, or add "The JSON output format applies to your
  final answer only. When you need a tool, call it first, with no text
  before the call, and write the JSON once you have the results."
- Long coding-agent system prompts at `low`: it may stop early; add the
  "keep working" and "stop and report" lines below, and the verification
  paragraph.
- Chatbots and support assistants: add the "rules hold for the whole
  conversation" line in `guardrails.md`; use `high` effort for the most
  instruction-sensitive work.
- No server-side fallback for refusals: the client must handle
  `stop_reason: "refusal"`.

## Older models

- Opus 4.5 and later respond strongly to the system prompt: soften
  "CRITICAL: You MUST use this tool when ..." to "Use this tool when ...".
- Opus 4.6 and Opus 5 delegate to subagents readily: say when to use one
  (parallel, independent work) and when to work directly.
- Opus 5 runs long and verifies well unprompted: ask for concision, and
  remove carried-over self-check lines.
- Fable 5.1 writes few progress updates and formats lightly: ask for
  updates, and drop long anti-markdown blocks.
- With thinking disabled on Opus 4.5, the word "think" itself steers it;
  use "consider" or "evaluate".

## Ready-made lines

Anthropic's tested wording; quote it rather than paraphrase.

- Keep working (Sonnet 5.5, Haiku 5.5): "Keep working until everything the
  user asked for is done, and only stop to ask when you can't go on without
  the user or before a risky step."
- Stop and report: "When the work the user asked for is done and checked,
  stop and report. Don't add features, tests, files, docs, or refactors that
  weren't asked for. If you think one would help, mention it at the end
  instead of doing it."
- No extra review rounds (Sonnet 5.5 at `xhigh`/`max`): "When the work the
  user asked for is done and its checks pass, stop and report. Don't start
  extra rounds of review or hardening on your own, and don't launch reviewer
  subagents unless the user asked for a review. If you think a deeper review
  is worth doing, say so at the end."
- Ideas only: "When the user asks for ideas, options, or a plan, give them
  that and stop. Don't start building or changing anything until they say to
  go ahead."
- Verification (coding agents): "When you change code that can be run,
  built, or type-checked, run a real check that exercises the change before
  reporting it done: the project's tests, type-checker, or build, or the
  changed command itself." Add: a syntax-only check or one that failed to
  start does not count; install missing declared dependencies with the
  project's own package manager and lockfile, never with sudo or the system
  package manager; if no real check can run, say which and why instead of
  reporting done.
- Fresh facts (Sonnet 5.5): "Use the search tool to check specifics that may
  have changed since your training, such as what is allowed, required, or
  charged, even when you feel confident. For researched work such as a
  report or a comparison, gather current sources rather than writing from
  your training knowledge."
- Training data ends (Haiku 5.5, after the date line): "Your training data
  ends well before today's date. Records, office holders, prices, versions,
  rules, and anything "latest" may have changed since then, so search for
  those before you answer, even when you feel sure. Facts that can't change
  need no search. When the answer depends on where the user is, put the
  user's country or region in the search query."
- Answer done (Opus 5.5 multi-turn chat): "Once you have answered something,
  treat that answer as done. On later turns, focus your thinking on what the
  user is asking now, and don't go back over an earlier answer unless the
  user asks about it or points out a problem with it."
- Explore broadly (Opus 5.5 multi-app tasks): "Before taking any action,
  explore broadly with tool calls: list and open the emails, documents,
  spreadsheet tabs, and records across the available apps that could be
  relevant to this task, including ones the task does not explicitly
  mention, and use what you find."
- Time matters (no sensible time budget): "Time matters here: do not spend
  time that can be avoided, and the earlier a correct result is obtained,
  the better."
