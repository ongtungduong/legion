---
description: 'A recurring operational problem with no known cause and no code in sight. debugging should fire and gather evidence before proposing a fix.'
expected_outcome: 'legion:debugging is invoked; the reply sets out how to show the problem on real data and what changed around when it started, and ranks candidate causes before any fix.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

For two weeks, about a third of our support requests have been answered late, and nothing obvious changed. Find out why.
