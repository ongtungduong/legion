# Third-party notices

Legion adapts material from the projects below. Each is MIT licensed; their
notices are reproduced in full as the license requires. Content was rewritten
and condensed, not copied wholesale; the table says what came from where.

| Legion file(s) | Adapted from |
|---|---|
| `hooks/session-start`, `hooks/hooks.json` | superpowers `hooks/session-start` |
| `skills/using-legion` | superpowers `using-superpowers`, addy `using-agent-skills` |
| `skills/brainstorming` | superpowers `brainstorming`; addy `spec-driven-development` (spec sections, boundaries) |
| `skills/brainstorming/references/grilling.md` | mattpocock `grilling` |
| `skills/brainstorming/references/adr-format.md` | mattpocock `ADR-FORMAT.md` |
| `skills/defining-terms` (+ references) | mattpocock `domain-modeling`, `GLOSSARY-FORMAT.md` |
| `skills/writing-plans` | superpowers `writing-plans`; addy `planning-and-task-breakdown` (vertical slices, sizing) |
| `skills/executing-plans` (+ references) | superpowers `executing-plans`, `subagent-driven-development` and its prompts, `test-driven-development`, `verification-before-completion`; mattpocock `tdd` (seams, anti-patterns); addy `constraint-driven-development` (the "guard the bar" checks), `source-driven-development` (version-sensitive APIs) |
| `skills/executing-plans/references/doubt-review.md` | addy `doubt-driven-development` (condensed) |
| `evals/plugin/` | addy `evals/plugin` (case layout and grader patterns) |
| `.github/workflows/ci.yml` | addy `.github/workflows/test-plugin-install.yml` (reduced to `npm test` and shellcheck) |
| `skills/systematic-debugging` | mattpocock `diagnosing-bugs`; superpowers `systematic-debugging` |
| `skills/code-review` (+ references) | mattpocock `code-review` (two axes, smell baseline); addy `code-review-and-quality` (severity labels); superpowers `requesting-code-review`, `receiving-code-review` |
| `skills/coding-principles/references/*.mini.md` | agent-rules-books `*/<book>.mini.md`, copied unchanged (14 files) |
| `skills/coding-principles/SKILL.md` | Routing and conflict rules derived from agent-rules-books `docs/USAGE.md` and `docs/COMPATIBILITY.md` |
| `skills/security-and-hardening` (+ references) | addy `security-and-hardening`, `references/security-checklist.md` |
| `skills/skill-creator` | Same author: `duongot-skills/skill-creator` (MIT, ongtungduong), copied unchanged except `name`, renamed to match its directory |
| `scripts/validate-spec.mjs` | Wraps `skills/skill-creator/scripts/validate_skill.py` |
| `scripts/validate.mjs`, `tests/` | superpowers `tests/skill-size`, `tests/skill-layout`; addy `scripts/validate-skills.js` |
| `scripts/trigger-evals.mjs`, `evals/triggers/` | addy `scripts/run-evals.js` (Tier 2 lexical routing) |

Source revisions used:

- superpowers: https://github.com/obra/superpowers @ `22f0b463e7a5` (2026-11-03, v7.0.2)
- addyosmani/agent-skills: https://github.com/addyosmani/agent-skills @ `301b02b12bff` (2026-11-01)
- mattpocock/skills: https://github.com/mattpocock/skills @ `4ae2317ddb22` (2026-10-31)
- agent-rules-books: https://github.com/ciembor/agent-rules-books @ `893a88a6fce3` (2026-09-10, v0.6)

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
