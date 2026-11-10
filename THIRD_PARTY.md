# Third-party notices

Legion adapts material from the projects below. Each is MIT licensed unless
the table says otherwise; their notices are reproduced in full as the license
requires. Content was rewritten
and condensed, not copied wholesale, except where the table says a file was
copied; the table says what came from where.

| Legion file(s) | Adapted from |
|---|---|
| `hooks/session-start`, `hooks/hooks.json` | superpowers `hooks/session-start` |
| `skills/using-legion` | superpowers `using-superpowers`, addy `using-agent-skills` |
| `skills/brainstorming` | superpowers `brainstorming`; addy `spec-driven-development` (spec sections, boundaries) |
| `skills/brainstorming/references/grilling.md` | mattpocock `grilling` |
| `skills/brainstorming/references/adr-format.md` | mattpocock `ADR-FORMAT.md` |
| `skills/writing-plans` | superpowers `writing-plans`; addy `planning-and-task-breakdown` (vertical slices, sizing) |
| `skills/executing-plans` (+ references) | superpowers `executing-plans`, `subagent-driven-development` and its prompts, `test-driven-development`, `verification-before-completion`; mattpocock `tdd` (seams, anti-patterns); addy `constraint-driven-development` (the "guard the bar" checks), `source-driven-development` (version-sensitive APIs) |
| `skills/executing-plans/references/doubt-review.md` | addy `doubt-driven-development` (condensed) |
| `evals/plugin/` | addy `evals/plugin` (case layout and grader patterns) |
| `.github/workflows/ci.yml` | addy `.github/workflows/test-plugin-install.yml` (reduced to `npm test` and shellcheck) |
| `skills/systematic-debugging` | mattpocock `diagnosing-bugs`; superpowers `systematic-debugging` |
| `skills/systematic-debugging/scripts/hitl-loop.sh` | mattpocock `diagnosing-bugs/scripts/hitl-loop.template.sh` (adapted to Claude Code's `!` prefix) |
| `skills/executing-plans/assets/pr-body.md` | mattpocock `pr` (itself credited to Humanlayer `show-me`, Dex Horthy) |
| `skills/code-review` (+ references) | mattpocock `code-review` (two axes, smell baseline); addy `code-review-and-quality` (severity labels); superpowers `requesting-code-review`, `receiving-code-review`; Claude Code's built-in `/code-review` and the `code-review` plugin of anthropics/claude-plugins-official (Apache-2.0): method only, no text copied (target resolution, review angles: line scan, removed behavior, callers, reuse, simplification, altitude, scoped instruction files; a failure scenario per finding; independent validation of each finding; posting rules); awesome-skills `code-review-skill` (reuse check, quality anti-patterns, leftovers, size note, verdict line), condensed and rewritten |
| `skills/coding-principles/references/{system-design,coding,coding-existing-code}.md` | agent-rules-books `*/<book>.mini.md` (14 rule sets), rules selected, merged by topic, and rewritten |
| `skills/coding-principles/SKILL.md` | Topic routing replaces the per-book routing derived from agent-rules-books `docs/USAGE.md` and `docs/COMPATIBILITY.md` |
| `skills/security-principles/SKILL.md` | Cloudflare `security-audit/SKILL.md` (operating modes); addy `security-and-hardening` (build workflow, boundaries, gotchas) |
| `skills/security-principles/references/review.md` | Cloudflare `security-audit/SKILL.md` (core principles, severity anchors, universal execution safety, anti-patterns, nearly verbatim) |
| `skills/security-principles/references/security-checklist.md` | addy `references/security-checklist.md` (including upstream fixes `d1463fd` registry signatures and `30187c1` staged-secret scan without echo) |
| `skills/security-principles/references/audit.md` | Cloudflare `security-audit/SKILL.md` (full audit setup, write isolation, planning, budget, workflow), adapted to Claude Code subagents; report summary from addy `agents/security-auditor.md` |
| `skills/security-principles/references/{reconnaissance,hunting,attack-classes,validation-and-reporting}.md` and the ten domain companions | Cloudflare `security-audit/*.md`, copied with file names lowercased and cross-references updated; additions from addy `agents/security-auditor.md` and #736: secret patterns printed as file names only (the vendors' published token formats), owner-run dependency advisories, attacker personas in the coverage critic, the repo's security baseline in reconnaissance |
| `skills/security-principles/scripts/`, `tests/security-audit/` | Cloudflare `security-audit/validate-findings.cjs`, `validate-coverage-ledger.cjs`, `report-schema.json` and their tests, copied unchanged except the tests' require paths |
| `skills/coding-principles/references/{performance,performance-optimization,performance-web,audit}.md` | addy `performance-optimization` and its `references/optimization-patterns.md`, `references/performance-checklist.md`, `agents/web-performance-auditor.md` (metric-honesty rule), condensed and rewritten; design-for-load rules from agent-rules-books (`designing-data-intensive-applications`, `release-it`, `patterns-of-enterprise-application-architecture`, `a-philosophy-of-software-design`, `code-complete`) |
| `skills/skill-creator` | Same author: `duongot-skills/skill-creator` (MIT, ongtungduong), `name` renamed to match its directory, then aligned with Legion conventions: folded description, Gotchas, the Claude Code 20,000-byte limit (also a validator warning), and a baseline-first measurement step with `references/measuring.md` |
| `scripts/validate-spec.mjs` | Wraps `skills/skill-creator/scripts/validate_skill.py` |
| `scripts/validate.mjs`, `tests/` | superpowers `tests/skill-size`, `tests/skill-layout`; addy `scripts/validate-skills.js` |
| `scripts/trigger-evals.mjs`, `evals/triggers/` | addy `scripts/run-evals.js` (Tier 2 lexical routing) |

Source revisions used:

- superpowers: https://github.com/obra/superpowers @ `22f0b463e7a5` (2026-11-03, v7.0.2)
- addyosmani/agent-skills: https://github.com/addyosmani/agent-skills @ `301b02b12bff` (2026-11-01)
- mattpocock/skills: https://github.com/mattpocock/skills @ `4ae2317ddb22` (2026-10-31)
- agent-rules-books: https://github.com/ciembor/agent-rules-books @ `893a88a6fce3` (2026-09-10, v0.6)
- cloudflare/security-audit-skill: https://github.com/cloudflare/security-audit-skill @ `c1c8a8c14710` (2026-09-14)
- awesome-skills/code-review-skill: https://github.com/awesome-skills/code-review-skill @ `4850184dfd77` (2026-09-08)
- anthropics/claude-plugins-official: https://github.com/anthropics/claude-plugins-official, `plugins/code-review` v1.0.1 as installed on 2026-11-10 (Apache-2.0; ideas only, so no notice is reproduced below)
- Claude Code built-in `/code-review`: as shipped in Claude Code 2.1.322 (2026-11-10); ideas only

Note on agent-rules-books: its rule sets are practical instructions inspired by
the books, not book text and not substitutes for the books. Its own
`docs/CRITICISM.md` states that the project has had no legal review of that
derivation; Legion inherits that caveat.

---

## superpowers

```
MIT License

Copyright (c) 2025 Jesse Vincent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## addyosmani/agent-skills

```
MIT License

Copyright (c) 2025 Addy Osmani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## mattpocock/skills

```
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## agent-rules-books

```
MIT License

Copyright (c) 2026 Maciej Ciemborowicz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## cloudflare/security-audit-skill

```
MIT License

Copyright (c) 2025-2026 Cloudflare, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## awesome-skills/code-review-skill

```
MIT License

Copyright (c) 2025 awesome-skills

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
