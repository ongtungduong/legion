---
description: 'Fixture case, needs `--scaffold`. Two skills fit the job (the project skill house-skill-writer and legion:skill-creator) and the project CLAUDE.md names the project one. find-skills should follow the project instruction and not load its own skill-creator. Harness limit (measured 2026-11-23): the eval session lists neither the project skill nor CLAUDE.md up front, so the agent loads legion:skill-creator before it finds the instruction and `legion-skill-creator-not-fired` (a with-only indicator, not scored) stays red; `project-skill-fired` and `house-format` carry the outcome.'
expected_outcome: 'The project skill house-skill-writer is invoked and legion:skill-creator is not; the drafted SKILL.md has the house Steps and Rollback sections.'
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Create a new agent skill for our release checklist: bump the version, update the changelog, tag, and push. Show me the SKILL.md.
