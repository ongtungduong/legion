# Measuring a Skill Against a Baseline

Read this when setting up the baseline run (workflow step 2) or the re-run
that compares against it (step 7). The loop is RED/GREEN, as in test-driven
development: the baseline must fail before an instruction is written, and the
instruction is kept only if the re-run shows it fixed that failure.

## Contents

1. [The loop](#the-loop)
2. [Choosing prompts](#choosing-prompts)
3. [In a Claude Code plugin repo](#in-a-claude-code-plugin-repo)
4. [Anywhere else](#anywhere-else)
5. [Reading the result](#reading-the-result)
6. [When the model changes](#when-the-model-changes)

## The loop

1. **RED.** Run each prompt without the skill (new skill) or with the current
   version (changing a skill). One run per prompt is usually enough to see the
   failure. Write down what went wrong in the agent's own terms: the skipped
   step, the wrong default, the missing fact, the question it should not have
   needed to ask.
2. **Write.** Add or change only the instructions that target a recorded
   failure. A failure you did not observe is a guess; a guess is filler.
3. **GREEN.** Re-run the same prompts with the skill, several times each
   (3 is a workable default), because single runs vary.
4. **Compare** with-skill against baseline per prompt, then cut or rewrite.

## Choosing prompts

- 2-3 realistic task prompts phrased the way a user types them, including at
  least one that does not name the skill or its domain words.
- One near-miss "stays quiet" prompt: it shares the skill's vocabulary but
  belongs to another skill or to none. It guards the description against
  claiming too much, which the positive prompts cannot detect.
- For a discipline skill (one that must hold a rule), one pressure prompt
  where the user pushes to skip the rule.

## In a Claude Code plugin repo

Each prompt is a case folder for `claude plugin eval`, for example
`evals/plugin/<skill>-<behavior>/`:

- `prompt.md`: frontmatter with `description`, `expected_outcome`,
  `max_turns`, and `allowed_tools`, then the user prompt as the body.
- `graders/*.md`: one file per check. Kinds in use: `tool_used` (for example
  `tool: Skill` with an `input_match` regex on the skill name, which checks
  that the skill fired), `regex` (a `pattern` the reply must contain), and
  `llm` (PASS/FAIL criteria in prose for quality). A stays-quiet grader sets
  `min: 0` and `max: 0` on the `tool_used` check, with `arm: both`.

Each case runs in two arms, with the plugin and without it; the
without-plugin arm is the baseline for a new skill. For a change to an
existing skill, the RED run is the with-plugin arm before the edit. Run with a
pinned model, several runs per case, and a pass threshold, and record the
model, Claude Code version, and cost with the result, because trigger rates
move between versions. It costs tokens: run it on demand, not in CI.

## Anywhere else

Start a fresh subagent per prompt with no access to the draft and no hint of
what is being measured, so the baseline reflects what the agent does on its
own. For the GREEN run, give a second fresh subagent the skill folder and the
same prompt. Compare transcripts, not only final answers: wasted turns show
where instructions are vague or offer too many options.

## Reading the result

| Observation | Action |
|---|---|
| Baseline failed, with-skill passes | Keep the instruction |
| Both pass | The instruction adds nothing measurable; cut it or find the prompt where it matters |
| Both fail | The instruction does not work; rewrite it, then re-run |
| Stays-quiet prompt fires the skill | Narrow the description; re-run the positive prompts too |
| Positive prompt never fires the skill | Add the user's own phrasing to the description |

## When the model changes

A kept instruction is evidence about one model. Sort it by what it fixes:

- **Model behavior** (a skipped step, a wrong default, a reasoning shortcut):
  it lasts only as long as that weakness. Re-run its baseline on each new
  default model; once the baseline passes there, it is a cut candidate.
- **Facts the model cannot have or controls it must not own** (project
  conventions, exact commands, permissions, safety and evidence gates): a
  better model does not make these redundant. A no-delta result is not
  enough to cut one; cut it only when the fact or the risk is gone.
