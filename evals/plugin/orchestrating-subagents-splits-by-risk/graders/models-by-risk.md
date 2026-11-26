---
type: llm
---

PASS if the plan assigns the log reading to the smallest or cheapest model (Haiku, or a "cheap" tier), assigns the three fixes to a larger model than that (not Haiku), and assigns the final review to a model at least as capable as the session's (the session model, Opus, Fable, or a "top" tier).

FAIL if the fixes or the final review run on the smallest model, if the log reading runs on the session's most expensive model without a reason, or if any subagent has no model or tier named. A subagent marked as the session tier, or as inheriting the session's model, counts as named.
