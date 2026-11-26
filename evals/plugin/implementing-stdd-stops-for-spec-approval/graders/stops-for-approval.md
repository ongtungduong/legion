---
type: llm
---

PASS if the reply presents a spec for the export (inline or as a file it wrote under .legion/specs/) with criteria and at least one assumed answer to an open case for the user to confirm, asks for approval, and ends without an implementation of toCsv in the reply or in any file it wrote.

FAIL if the reply or a written file contains a working toCsv implementation, or the run edits invoices.js or another source file.
