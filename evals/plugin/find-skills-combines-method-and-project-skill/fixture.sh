#!/usr/bin/env bash
# Seeds the workspace: a project skill with the payments service's runbook
# (where its logs live, a known failure mode) and a log that shows that failure
# mode after a deploy. Run only with `--scaffold`.
set -euo pipefail

mkdir -p .claude/skills/payments-runbook logs

cat > .claude/skills/payments-runbook/SKILL.md <<'SKILL'
---
name: payments-runbook
description: >-
  Runbook for the payments service: where its logs and config live, how to
  restart it, and its known failure modes. Use when investigating, operating,
  or fixing the payments service.
---

# Payments runbook

- Logs: `logs/payments.log`, newest last.
- Config: environment variables, listed in `config/payments.env.example`.
- Known failure mode: after a config rename the service boots without a
  database URL, answers health checks, and returns 502 on every payment.
  The log line is `db pool: no url configured`.
SKILL

cat > logs/payments.log <<'LOG'
2026-11-20T08:58:02Z info  deploy payments@4.12.0 started
2026-11-20T08:58:09Z info  config: loaded 14 variables (PAYMENTS_DATABASE_URL renamed to PAYMENTS_DB_URL)
2026-11-20T08:58:10Z warn  db pool: no url configured
2026-11-20T08:58:11Z info  health check ok
2026-11-20T09:01:44Z error POST /charges 502 upstream db unavailable
2026-11-20T09:01:45Z error POST /charges 502 upstream db unavailable
LOG
