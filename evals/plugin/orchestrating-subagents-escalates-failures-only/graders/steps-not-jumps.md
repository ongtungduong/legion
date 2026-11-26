---
type: llm
---

PASS if the reply escalates in steps rather than jumping straight to the largest model at maximum effort: for example first letting the subagent run the validator on its own output (or finding why the failures happen), then raising effort one level, then trying the next model up (Opus 5.5) at a lower effort, or testing a larger model at `high` rather than `max`.

FAIL if the reply's recommended next step for the failures is Fable 5.2 at max effort with no smaller step considered.
