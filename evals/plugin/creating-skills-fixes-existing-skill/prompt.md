---
description: 'Fixture case. Review and fix an existing skill that has spec and quality defects. creating-skills should fire and catch the defects a quick read misses. Needs `--scaffold`.'
expected_outcome: 'legion:creating-skills is invoked; the reply finds that the plain-scalar description breaks on ": ", that the name does not match the directory, that references/environments.md does not exist, and that the capitalized rules have no reasons, and shows a corrected SKILL.md.'
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Review `skills/deploy-helper` and fix whatever is wrong with it. Show me the corrected SKILL.md.
