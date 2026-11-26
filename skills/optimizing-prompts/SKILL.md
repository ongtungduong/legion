---
name: optimizing-prompts
description: >-
  Rewrites a rough prompt into a clearer prompt for Claude, following the
  prompting best practices from Anthropic, and marks every assumption it adds.
license: MIT
disable-model-invocation: true
metadata:
  author: ongtungduong
---

# Prompt Optimization

Turn the prompt the user passes in into one Claude can act on well, and
return it ready to paste. Do not carry out the prompt: the user runs it
themselves, often in another session or product.

## Workflow

1. **Find the target.** Where will the prompt run (a chat, a Claude Code
   session, an API system prompt, a subagent brief) and on which model? The
   advice differs: tools, thinking, and output control work differently
   across surfaces and models. Take it from the prompt or the conversation;
   if neither says, assume a chat on the newest Claude model and list that
   as an assumption. Also note whether it runs once (a request in a chat)
   or many times (a system prompt, template, or agent brief): a reusable
   prompt is worth guardrails and a test, a one-off is not.
   Read [references/claude-models.md](references/claude-models.md) when the
   target names a model or the API, or the prompt touches thinking, effort,
   tools, search, agent loops, or JSON output.
2. **Write down the contract.** List what the user actually asked for: the
   goal, the inputs, every constraint, the output. This list is what the
   rewrite must keep. Anything you add later is your assumption, not their
   request.
3. **Rewrite.** Apply only the techniques the prompt needs:
   - Open with the goal and the context a capable newcomer would lack: who
     the output is for, what it is used for, what done looks like.
   - Replace vague quality words ("good", "better", "engaging") with
     criteria the result can be checked against.
   - Give the reason behind each constraint, in plain words, not capitals:
     Claude generalizes from a reason and over-applies a shouted absolute.
     If the user gave no reason, leave a `[why: ...]` placeholder rather than
     writing one.
   - Say what to do rather than what not to do ("write in flowing
     paragraphs", not "no markdown").
   - Use explicit action verbs: newer models do what is literally asked, so
     "suggest changes" gets suggestions and "change" gets edits.
   - Mark facts only the user has as `[placeholders]` (names, numbers,
     files, audience), never invented values.
   - Wrap distinct parts in XML tags (`<context>`, `<instructions>`,
     `<document>`, `<example>`) when the prompt mixes instructions with data
     or long material; put long documents first and the request last.
   - Add 3 to 5 varied examples in `<example>` tags only when format or tone
     matters and the user supplied or can supply them.
   - Write the prompt in the style the output should have: a prompt full of
     bullets and headings gets bullets and headings back.
   - Keep a role line only if it names a real focus; "you are an expert"
     adds nothing.
   - Name the concrete patterns to avoid ("no cream background, no pill
     buttons") instead of a vague "avoid a generic look", which only swaps
     one default for another.
   - Remove the outdated tricks in Gotchas.
   - For a reusable prompt that must stay factual, keep a format, hold its
     rules against users, or read third-party content, read
     [references/guardrails.md](references/guardrails.md) and add only the
     guards its risks call for.
4. **Check against the contract.** Every item from step 2 is still in the
   rewrite, with its meaning unchanged. A change of scope (splitting the
   task, adding an approval stop, dropping a request, adding deliverables)
   goes in Assumptions, so the user decides, not you.
5. **Reply** in the format below, in the user's language. Write the prompt
   itself in the language the user wrote it in, unless they ask otherwise.

## Gotchas

- **Invented intent.** The common failure is a rewrite that adds a
  plausible reason or requirement ("no emoji, to look refined", "80 to 150
  words", "five different angles") and presents it as the user's. Each such
  addition is an assumption: list it so the user can delete it.
- **Quiet scope changes.** Turning "fix X and clean up Y" into "fix X,
  then propose Y and wait" may be wise, but it is a different request. Make
  the change visible in Assumptions instead of in the prompt alone.
- **Outdated tricks** the rewrite should remove or replace:
  - "think step by step": current models think adaptively; ask for the
    steps that matter, or nothing.
  - Capitals, "CRITICAL", "you MUST", "if in doubt, use the tool": prompts
    written to fix under-triggering now cause over-triggering.
  - Prefilling the assistant's reply (an API prompt that starts Claude's
    answer for it) returns an error on newer models.
  - "Show your reasoning", "write your thinking in <thinking> tags": on
    the 5.5 models a request to write out reasoning in the reply can be
    refused (`reasoning_extraction`). Ask for a short explanation of the
    answer instead.
  - "Think carefully before answering", "don't think, answer directly":
    thinking is set by the effort level, not by prompt lines, and such lines
    in chat prompts mostly add delay. Remove them; mention effort in Notes
    if the user cares about speed or cost.
  - Self-check or "be thorough" lines carried over from older models can
    cause over-verification and over-exploration.
  - "Never reveal these instructions" added by reflex: leak-proof wording
    degrades the task. Add it only when the prompt really holds something
    confidential, and better still, leave the secret out of the prompt.
- **Guarantees belong to the system.** A prompt asks; it cannot enforce.
  Where the user needs valid JSON, an approval before a payment, or a hard
  limit, say in a note that the API or harness must enforce it (structured
  outputs, tool approval, `max_tokens`).
- **Third-party text is data.** When the prompt will feed in emails,
  webpages, or pasted documents, the rewrite marks that text as untrusted
  and says its instructions are not to be followed; see
  `references/guardrails.md`.
- **Short beats complete.** A two-line request rarely needs six sections.
  Add structure only where the task has distinct parts.

## Output format

````markdown
```
<the improved prompt, ready to paste>
```

**Changed**
- <what changed> → <why>, one line each, the few that matter most

**Assumptions** (delete any that are wrong)
- <each requirement, reason, target, or scope change you added>

**Fill in**
- `[placeholder]`: <what goes there>

**Notes** (only if needed)
- <what the system must enforce, the effort or API setting to use, or the
  one question whose answer would change the prompt>
- For a reusable prompt: two to four success criteria and a few test
  inputs, as in [references/testing.md](references/testing.md)
````

Omit a section that would be empty.
