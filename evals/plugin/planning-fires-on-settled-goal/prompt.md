---
description: 'A settled engineering goal with a fixed date and a request for the plan. planning should fire.'
expected_outcome: 'legion:planning is invoked; the reply is a plan of ordered steps, each with an outcome and a way to check it is done.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We agreed to move our three web services and their Postgres database off the single VM they run on and onto Kubernetes before our hosting contract ends on March 31. Two backend engineers, and no outage longer than 10 minutes. Write the detailed plan with the steps to get it done.
