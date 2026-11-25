---
type: llm
---

PASS if the reply notes that `references/environments.md` does not exist in the skill folder and either asks for its contents, marks it TODO, or removes the reference.

FAIL if the corrected SKILL.md still points at the missing file without saying it is missing.
