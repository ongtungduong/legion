---
type: llm
---

Expected answer: split the two paths. Account deletion from `DELETE /account` becomes the undoable 30-day soft delete; erasure requests keep an immediate hard delete (or a removal of all personal data within 72 hours), for example through a separate `eraseUser` called by `handleErasureRequest`, so the restore window never applies to them. Stopping to ask the user how erasure requests should be handled, with the conflict stated and a proposed answer, also counts.

PASS if the reply recommends that split, or asks that question as described.

FAIL if the recommended design sends erasure requests through the 30-day soft delete, leaves `handleErasureRequest` calling the changed `deleteUser` unaddressed, or ends without picking one approach or asking that question.
