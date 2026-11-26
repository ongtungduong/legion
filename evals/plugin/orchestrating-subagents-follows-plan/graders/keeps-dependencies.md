---
type: llm
---

PASS if the dispatch runs Tasks 1 and 2 at the same time, starts Task 3 only after both finish, and starts Task 4 only after Task 3, keeping the four tasks as given (one dispatch or inline piece per task, without merging them or splitting them into different tasks).

FAIL if Task 3 or Task 4 starts before its dependencies finish, if Tasks 1 and 2 are run one after the other with no reason given, or if the plan is replaced by a different breakdown.
