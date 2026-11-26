# Subagent brief

Copy, fill, and send as the dispatch prompt. Delete a line that does not
apply; keep the return contract.

```markdown
Goal: <one line: what this piece achieves and where it fits in the larger work>

Scope:
- You may read: <paths, sources, or "anything in the repo">
- You may change: <paths, or "nothing: this task is read-only">
- Leave alone: <what must not change>

Inputs (read these first):
- <absolute path or URL>: <what it holds>
- Exact values to use verbatim: <names, numbers, signatures, formats>

Decisions already made: <interfaces or rulings from earlier pieces this one
cannot know; omit if none>

Before you report, check your result: <the test, build, script, or
comparison to run, and what passing looks like>

Done when: <the condition that ends this piece>. If an input is missing or
the task is ambiguous, stop and return BLOCKED with your question; do not
guess, and do not widen the scope.

Do not start subagents of your own.

Return, in this shape and nothing more:
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED (<what is missing>)
- Answer: <a few lines; each claim with file:line or its source>
- Check: <what you ran and its result>
- Details: <path of the file holding anything longer than a few lines>
```
