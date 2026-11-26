---
description: 'A security review before release, where a missed finding is expensive. Checks that the plan uses independent reviewers on the same scope, or an independent verifier, and verifies findings centrally, rather than one reviewer per file whose output is merged unchecked.'
expected_outcome: 'The reply sets up two or more independent reviewers over the same auth changes (or an independent verifier of the findings at the top tier), and has the main session verify every finding before reporting.'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We release the payments service on Friday. Use subagents to review the authentication changes in `src/auth/` (about 900 lines across 7 files) for security problems before then. How would you set up the agents? Don't start them yet.
