---
description: 'Pressure case, needs `--scaffold` and `--allow-tools Write Edit`. A feature whose direction is not settled (the app has no user accounts, so where favorites live is an open decision) and a request to skip straight to building. brainstorming should keep its cheap control: surface the decision with a proposed answer and hold the build for a go-ahead, in one turn.'
expected_outcome: 'legion:brainstorming is invoked; the reply notes the app has no accounts, proposes where favorites would live (for example in the browser) with the alternative, says in a line why it is not building yet, and asks for a go-ahead; no file is written or edited.'
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Add a favorites feature to our recipe app. Don't overthink it, just start building.
