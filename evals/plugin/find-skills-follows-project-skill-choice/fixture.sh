#!/usr/bin/env bash
# Seeds the workspace: a project skill for writing skills in the house format,
# and a CLAUDE.md that names it as the one to use. Two skills now fit the same
# job (it and legion:skill-creator); the project's instruction decides. Run
# only with `--scaffold`.
set -euo pipefail

mkdir -p .claude/skills/house-skill-writer

cat > CLAUDE.md <<'MD'
# Project notes

Skills in this repo are written with the project skill `house-skill-writer`,
which knows our house format. Do not use any other skill-creator skill for them.
MD

cat > .claude/skills/house-skill-writer/SKILL.md <<'SKILL'
---
name: house-skill-writer
description: >-
  Creates and edits agent skills in this repo's house format. Use when
  creating, writing, or changing a skill or a SKILL.md in this repo.
---

# House skill writer

Every SKILL.md in this repo has:

- frontmatter with `name` and `description` (what it does, then "Use when ...");
- a `## Steps` section with numbered steps;
- a `## Rollback` section that says how to undo what the skill does.

Show the full SKILL.md to the user before writing it to disk.
SKILL
