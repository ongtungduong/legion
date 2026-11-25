#!/usr/bin/env bash
# Seeds the workspace: a project skill with the house rules for changing
# untested legacy modules (how seams are made here), and an untested service
# whose constructor reaches the network and the real clock. Run only with
# `--scaffold`.
set -euo pipefail

mkdir -p .claude/skills/legacy-seams src

cat > .claude/skills/legacy-seams/SKILL.md <<'SKILL'
---
name: legacy-seams
description: >-
  House rules for changing a module under src/ that has no tests: how this
  repo makes seams and where characterization tests go. Use when changing,
  fixing, or extending untested code under src/.
---

# Legacy seams

- Time: add a constructor parameter `clock = () => Date.now()`. Never use
  fake timers; they leak between test files in this repo.
- Collaborators that reach the network (`fetchRates`): pass the result in
  through the constructor, with today's call as the default.
- Characterization tests go in `test/characterization/<module>.test.js` and
  must pass on the code as it is before any change.
SKILL

cat > src/rates.js <<'JS'
export function fetchRates() {
  // Calls the rates service; there is no network in tests.
  throw new Error('rates service unreachable');
}
JS

cat > src/invoice.js <<'JS'
import { fetchRates } from './rates.js';

export class InvoiceService {
  constructor() {
    this.now = Date.now();
    this.rates = fetchRates();
  }

  total(invoice) {
    const subtotal = invoice.lines.reduce((sum, l) => sum + l.qty * l.unitCents, 0);
    const tax = Math.round(subtotal * this.rates[invoice.region]);
    return subtotal + tax;
  }
}
JS
