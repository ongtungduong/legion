# Testing a Reusable Prompt

Read this when the target is a prompt that will run many times (a system
prompt, a template, an agent brief, a classifier) and the reply's Notes
should say how to check the rewrite beats the original.

Source: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
(read 2026-11-25; its last part was read only in summary).

## Success criteria

Write two to four criteria the user can check, each:

- **Specific**: "classifies sentiment correctly", not "works well".
- **Measurable**: a number or a fixed scale. A hazy goal can still be
  counted: not "safe outputs" but "under 0.1% of 10,000 outputs flagged by
  the content filter".
- **Achievable** from a baseline, a benchmark, or a prior run.
- **Relevant**: what matters for this use (citation accuracy matters for a
  medical app, little for casual chat).

Most prompts need several dimensions: task accuracy, consistency, tone,
privacy, use of context, latency, cost.

## Test set

- Mirror the real input mix, plus edge cases: missing or irrelevant input,
  very long input, hostile or harmful input (for chat), and ambiguous cases
  where people would disagree.
- Prefer many cases graded automatically over a few graded by hand.
- Run the original and the rewrite on the same set and compare.

## Grading, cheapest first

| Method | Use for | Cost |
|---|---|---|
| Code (exact match, contains, parses) | labels, formats, required phrases | fast, reliable, no nuance |
| Model grader | tone, faithfulness, rule-following | fast, flexible; check it against a few hand grades first |
| Human | final calls on a sample | slow, expensive; avoid at volume |

A model grader gets a detailed rubric ("The answer must mention X in the
first sentence; if not, it is incorrect"), a constrained verdict (correct or
incorrect, or 1 to 5), and room to reason before the verdict. Use a
different model from the one being graded where practical.

## In the reply

Keep it to the Notes section: the criteria, five to ten example test inputs
including the edge cases that matter here, and how to grade them. Write a
full eval only if the user asks.
