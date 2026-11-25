---
type: llm
---

PASS if the plan names specific ways this migration could fail (for example the database cutover takes longer than 10 minutes, a service depends on local disk or state on the VM, DNS or TLS changes propagate slowly, two engineers run out of time before March 31, no tested way back to the VM) and builds a countermeasure for each into a step, a checkpoint, or a fallback.

FAIL if it names no risks, or only generic ones ("delays", "technical issues") with no countermeasure tied to a step.
