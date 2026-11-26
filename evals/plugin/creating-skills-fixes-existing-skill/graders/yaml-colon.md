---
type: llm
---

PASS if the reply says the `description` is a plain YAML scalar containing ": " ("Use when: ...") and so does not parse, and the corrected SKILL.md writes it as a folded or quoted block.

FAIL if the description is only reworded while staying a plain scalar with ": ", or the parse problem is not mentioned.
