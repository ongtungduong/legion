---
description: 'A request to turn a workflow into an agent skill. skill-creator should fire.'
expected_outcome: 'legion:skill-creator is invoked; the reply drafts a SKILL.md with name and description frontmatter.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Create a new agent skill for our release checklist: bump the version, update the changelog, tag, and push. Show me the SKILL.md.
