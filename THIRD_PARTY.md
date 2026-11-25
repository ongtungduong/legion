# Third-party notices

Legion adapts material from the projects below. Each is MIT licensed unless
the table says otherwise; their notices are reproduced in full as the license
requires. Content was rewritten
and condensed, not copied wholesale, except where the table says a file was
copied; the table says what came from where.

| Legion file(s) | Adapted from |
|---|---|
| `hooks/session-start`, `hooks/hooks.json` | superpowers `hooks/session-start` |
| `skills/find-skills` | superpowers `using-superpowers`, addy `using-agent-skills` |
| `skills/brainstorming` | superpowers `brainstorming`; addy `spec-driven-development` (spec sections, boundaries) |
| `skills/brainstorming/references/grilling.md` | mattpocock `grilling` |
| `skills/planning` | superpowers `writing-plans`; addy `planning-and-task-breakdown` (vertical slices, sizing) |
| `evals/plugin/` | addy `evals/plugin` (case layout and grader patterns) |
| `.github/workflows/ci.yml` | addy `.github/workflows/test-plugin-install.yml` (reduced to `npm test` and shellcheck) |
| `skills/std-development` | addy `spec-driven-development` (criteria before work, boundaries, Deferred list, delta specs, keeping the spec alive); addy `test-driven-development` (red-green-refactor, discovering the project's commands, test levels, real over mocks, anti-patterns). Merged and rewritten around the Unchanged and My-call criteria that baseline runs missed. superpowers `test-driven-development` and its `writing-good-tests.md` (name the break, mutation pass, change detectors, stand-in rules, hard-to-test as a design signal), `verification-before-completion` (revert to prove a check, every failure reported), `subagent-driven-development/task-reviewer-prompt.md` (Missing, Extra, Misunderstood) |
| `skills/debugging` | mattpocock `diagnosing-bugs`; superpowers `systematic-debugging` |
| `skills/debugging/assets/postmortem-template.md` | Google SRE Book, "Example Postmortem" (Appendix D): section structure only, wording Legion's own (the book is CC BY-NC-ND 4.0, so no text is copied) |
| `skills/skill-creator` | Same author: `duongot-skills/skill-creator` (MIT, ongtungduong), `name` renamed to match its directory, then aligned with Legion conventions: folded description, Gotchas, the Claude Code 20,000-byte limit (also a validator warning), and a baseline-first measurement step with `references/measuring.md` |
| `scripts/validate-spec.mjs` | Wraps `skills/skill-creator/scripts/validate_skill.py` |
| `scripts/validate.mjs`, `tests/` | superpowers `tests/skill-size`, `tests/skill-layout`; addy `scripts/validate-skills.js` |
| `scripts/trigger-evals.mjs`, `evals/triggers/` | addy `scripts/run-evals.js` (Tier 2 lexical routing) |

Source revisions used:

- superpowers: https://github.com/obra/superpowers @ `22f0b463e7a5` (2026-11-03, v7.0.2)
- addyosmani/agent-skills: https://github.com/addyosmani/agent-skills @ `301b02b12bff` (2026-11-01)
- mattpocock/skills: https://github.com/mattpocock/skills @ `4ae2317ddb22` (2026-10-31)

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
