#!/usr/bin/env bash
# Seeds the workspace: a skills repo with one skill that has the defects a
# review should catch: a plain-scalar description with ": " in it (invalid
# YAML), a name that differs from its directory, a reference to a file that
# does not exist, and capitalized directives with no reason. It lives under
# skills/, not .claude/skills/, so Claude Code does not load it. Run only with
# `--scaffold`.
set -euo pipefail

mkdir -p skills/deploy-helper

cat > skills/deploy-helper/SKILL.md <<'SKILL'
---
name: deploy_helper
description: Helps with deploys. Use when: deploying, rolling back, or checking a release.
---

# Deploy helper

ALWAYS run the smoke tests before deploying. NEVER deploy on Fridays.

1. Read references/environments.md for the list of environments.
2. Run `make deploy ENV=<env>`.
3. If the smoke tests fail, roll back with `make rollback ENV=<env>`.
SKILL
