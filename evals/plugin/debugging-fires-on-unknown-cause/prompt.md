---
description: 'A recurring problem in a data pipeline with no known cause and no code in sight. debugging should fire and gather evidence before proposing a fix.'
expected_outcome: 'legion:debugging is invoked; the reply sets out how to show the problem on real run data and what changed around when it started, and ranks candidate causes before any fix.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

For two weeks, about a third of our nightly data pipeline runs have finished after the 6 a.m. deadline, and nothing obvious changed. Find out why.
