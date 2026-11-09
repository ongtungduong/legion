---
name: defining-terms
description: >-
  Builds and sharpens the project's shared vocabulary by challenging fuzzy or
  conflicting terms and recording definitions in GLOSSARY.md. Use when
  terminology is fuzzy or contested, when one word is used for two concepts
  or two words for one, or when creating or editing GLOSSARY.md or
  GLOSSARY-MAP.md.
license: MIT
metadata:
  author: ongtungduong
---

# Defining Terms

Turn the words the user and the code use into one precise shared language,
written down as it settles. One agreed term replaces twenty words of
explanation and keeps names in code consistent with names in conversation.

This is the *active* work of changing the model. Reading `GLOSSARY.md` for
vocabulary is a habit of every skill, not this one.

## Workflow

1. **Locate the model.** A `GLOSSARY-MAP.md` at the root means several bounded
   contexts; read it to pick the right context's `GLOSSARY.md`. Otherwise use
   the root `GLOSSARY.md`. Create files only when there is something to
   write.
2. **Challenge conflicts immediately:** "The glossary defines *cancellation* as
   X, but you seem to mean Y. Which is it?"
3. **Sharpen fuzzy words** by proposing one canonical term: "By *account*, do
   you mean the Customer or the User?"
4. **Stress-test with concrete scenarios** that force the boundary between two
   concepts to be stated ("an order shipped in two parcels, one returned: is
   that a partial cancellation?").
5. **Cross-check the code.** When the user says how something works, check the
   code and surface contradictions.
6. **Write each resolved term at once.** Before the first edit to a glossary in
   this session, read [references/glossary-format.md](references/glossary-format.md).

## Gotchas

- The glossary holds definitions only. Implementation details, specs, and
  scratch notes put there rot quickly and mislead later readers.
- General programming concepts (timeouts, retries, error types) do not belong,
  however often the project uses them.
- Batching glossary updates until the end loses terms; write each one when it
  is resolved.
