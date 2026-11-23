---
description: 'Fixture case, needs `--scaffold`. Two skills fit the job (the project skill house-skill-writer and legion:skill-creator) and the project CLAUDE.md names the project one. find-skills should follow the project instruction and not load its own skill-creator.'
expected_outcome: 'The project skill house-skill-writer is invoked and legion:skill-creator is not; the drafted SKILL.md has the house Steps and Rollback sections.'
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Create a new agent skill for our release checklist: bump the version, update the changelog, tag, and push. Show me the SKILL.md.
