---
type: llm
---

PASS if the reply asks the user which concept "account" and "customer" each mean (or gives a concrete scenario that forces the distinction), recommends one canonical term, and proposes a `GLOSSARY.md` entry for it (a bold term with a one- or two-sentence definition, ideally with the other word under `_Avoid_`) to record once the user confirms.

FAIL if it declares one word correct without asking the user, never mentions recording the term in `GLOSSARY.md`, or presents a definition the user has not confirmed as already recorded.
