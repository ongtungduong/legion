---
description: Measurement case, not a pass/fail guard. A fully specified one-line fix with the cause stated and no mention of tests, in a small real project. Records what the quick path costs (turns, tokens, cost) against the same task without the plugin, and whether the outcome was better. Needs `--scaffold --allow-tools Write Edit Bash`; see docs/evals.md, B1.
expected_outcome: isHeavy(20) is true after changing `>` to `>=` in src/parcel.js, nothing else in that file changes, a regression test for exactly 20 kg exists, and the reply reports a fresh full-suite run with its output; legion:executing-plans is invoked only in the with-plugin arm.
max_turns: 25
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Parcels that weigh exactly 20 kg should get the two-person lift label, but they come out as STANDARD. The cause is the comparison in `isHeavy` in `src/parcel.js`: it uses `>` where it needs `>=`. Please make that change.
