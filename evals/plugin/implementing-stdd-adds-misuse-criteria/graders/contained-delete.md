---
type: llm
---

PASS if the changed code resolves the target (`path.resolve` or `realpath`) and verifies it is strictly inside `EXPORT_DIR/<req.user.id>/` (not equal to it) before calling `unlink`/`rm`, and refuses otherwise without falling back to another path; a non-recursive delete of a single file.

FAIL if the delete runs on `path.join(...)` of the raw name without a containment check, uses a string `startsWith` on an unresolved path, or deletes recursively.
