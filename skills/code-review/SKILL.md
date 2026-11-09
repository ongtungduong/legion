---
name: code-review
description: >-
  Reviews a change on two separate axes, Spec (does it do what was asked, no
  more and no less) and Standards (correctness, tests, security, repo
  conventions), using parallel fresh-context reviewers and severity labels,
  and handles responding to review feedback. Use when reviewing a diff,
  branch, commit range, or pull request, when asked to "review since X" or to
  check work before merge, when a plan's final review is due, or when
  addressing reviewer comments, including when the diff is pasted inline.
license: MIT
metadata:
  author: ongtungduong
---

# Code Review

Review **Spec** and **Standards** separately and report them side by side. A
change can implement the wrong thing while following every convention, or the
right thing while breaking them; merging the two axes lets one mask the other.

## Workflow

1. **Pin the range.** Use the user's fixed point (SHA, branch, tag, `main`),
   else `git merge-base main HEAD`. Run `git rev-parse <base>` and confirm the
   diff is non-empty before anything else. Write the package to a file:
   `git log --oneline <base>..HEAD; git diff --stat <base>...HEAD; git diff -U10 <base>...HEAD`.
   For a pasted diff with no repo, review the pasted text.
2. **Find the spec:** issue references in commit messages, a path the user
   gave, a doc under `docs/legion/` matching the branch, else ask. No spec
   means the Spec axis reports "no spec available".
3. **Find the standards:** `CONTRIBUTING.md`, `CODING_STANDARDS.md`,
   `AGENTS.md`/`CLAUDE.md`, lint configs. Add the design principles: the
   plan's `Design principles` sets, or the ones `legion:coding-principles`
   picks for this diff (call the Skill tool with it; naming the sets is
   enough, the reviewers read their files). The checklist and smell baseline
   live in [references/review-checklists.md](references/review-checklists.md):
   pass its absolute path to the Standards reviewer, and read it yourself only
   when you review without subagents. Precedence: documented repo standard,
   then design principles, then the smell baseline; skip what tooling already
   enforces.
4. **Review both axes in parallel.** Read
   [references/reviewer-prompts.md](references/reviewer-prompts.md) and
   dispatch the Spec and Standards reviewers at the same time with the Agent
   tool: `subagent_type: "general-purpose"` (a fresh context, never `fork`),
   no worktree (they are read-only), and `model: "sonnet"`, or `"opus"` for a
   final whole-branch review. Without a subagent tool, do two separate passes
   and say the review was not independent.
5. **Report** in the format below, without merging or re-ranking across axes.

## Output format

```markdown
## Spec
<findings, each quoting the spec line it concerns>

## Standards
<one line on what was done well>
<findings, each with file:line and a severity label>

Summary: <count per axis>; worst on Spec: <...>; worst on Standards: <...>
```

| Label | Meaning |
|---|---|
| Critical | Blocks merge: security hole, data loss, broken behavior |
| Important | Fix before merge: wrong logic, missing requirement, test gap |
| Minor | Optional: polish, naming, small simplification |
| FYI | No action; context only |

Lead with what matters: one structural problem *is* the review even when
there are ten nits. Most of a review's value sits in a few findings, so order
each axis by severity, and once Minor findings pass five, fold them into one
line per file so they cannot bury the Critical and Important ones.

## Receiving feedback

When your own work is being reviewed, read
[references/receiving-review.md](references/receiving-review.md) before acting
on any comment.

## Gotchas

- Use three dots for the diff (`<base>...HEAD`, against the merge-base) and two
  for the log (`<base>..HEAD`); two-dot diffs include unrelated changes that
  landed on the base branch.
- A bad ref or empty diff should fail at step 1, not inside two parallel
  subagents that then review nothing.
- A review in the author's own context shares the author's blind spots; the
  fresh context is what makes it a review.
- Reviewers are read-only and never dispatch further reviewers; a second
  opinion they spawn is a duplicate seat at full cost.
- Smells are judgment calls ("possible feature envy"), never hard violations.
