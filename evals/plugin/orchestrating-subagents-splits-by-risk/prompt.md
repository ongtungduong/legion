---
description: 'A request for a subagent dispatch plan mixing verbose log reading, three independent code fixes, and a final review. Checks that pieces get models by the cost of a wrong answer, that parallel writers are isolated, and that results are checked before use.'
expected_outcome: 'legion:orchestrating-subagents is invoked; the plan puts log reading on the smallest model, keeps the fixes off it, runs the three fixes in parallel only in separate worktrees or disjoint files, puts the final review on a model at least as strong as the session, and says how each result is checked.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm going to use subagents for this and want the dispatch plan first; don't run anything yet.

1. Read the 60 CI log files in `ci-logs/` and list every failing test with its first error line.
2. Fix the failing tests in `billing/`, `auth/`, and `search/`; the failures look unrelated.
3. Review the merged change before I open the PR.

For each subagent: what it does, which model it runs on, whether it runs in parallel, what it returns, and how you check its result.
