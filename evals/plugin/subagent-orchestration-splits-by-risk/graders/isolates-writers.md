---
type: llm
---

PASS if the plan runs the three fix subagents in parallel only with separate worktrees, branches, or explicitly disjoint files, or runs them one after another because they might share files, and merges their changes in one place.

FAIL if three subagents edit the same working tree in parallel with no isolation and no statement that their files do not overlap.
