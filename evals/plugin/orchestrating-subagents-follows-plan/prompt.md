---
description: 'An approved plan with four tasks and stated dependencies, and a request to run it with subagents. Checks that the orchestration takes the plan tasks as its pieces, keeps their dependencies, and does not re-split the plan.'
expected_outcome: 'legion:orchestrating-subagents is invoked; tasks 1 and 2 run in parallel, task 3 waits for both, task 4 waits for task 3; each task is one subagent (or done inline) with a named model or tier; the plan is not re-split into different tasks.'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Here's our approved plan. Run it with subagents; first show me how you'll dispatch it, don't start yet.

- Task 1: Summarize the 30 customer interview notes in `research/interviews/` into the top pain points with counts. Depends on: none. Done when: every pain point cites the interview files it came from.
- Task 2: Pull last quarter's support-ticket tags from `data/tickets.csv` and count tickets per tag. Depends on: none. Done when: the counts sum to the number of rows in the file.
- Task 3: Write a two-page findings memo that ranks the problems using Tasks 1 and 2. Depends on: Tasks 1 and 2. Done when: each ranked problem cites both an interview count and a ticket count.
- Task 4: Review the memo for unsupported claims. Depends on: Task 3. Done when: every claim is traced to Task 1 or Task 2 output or flagged.
