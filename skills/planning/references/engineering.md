# Planning software, infrastructure, and data work

Read at step 2 when the work changes code, configuration, infrastructure, a
schema, or stored data. These rules add to the workflow in SKILL.md; where
both speak, the more specific rule here applies.

## Contents

- Step 2: what to read in the repo
- Step 4: tasks as vertical slices
- Step 5: deploy safety
- Step 6: the task fields for code
- Step 8: extra self-review lines
- Gotchas

## Step 2: what to read in the repo

Steps written from the spec alone name files that do not exist, commands the
repo does not have, and changes its deploy cannot survive. Read, and record:

- the code paths the spec touches, and the closest existing feature built
  the same way: its files, layering, naming, and tests are the pattern the
  new tasks follow;
- the project's own commands (test, lint, typecheck, build, migrate, run)
  from its scripts, CI configuration, and contributing docs. Never assume a
  default such as `npm test`; they go in the plan's Checks line;
- the standing bar (contributing docs, agent instructions, CI gates, PR
  template), copied verbatim into Global constraints;
- how the work ships: deploy style (rolling, blue-green, clients that update
  late, scheduled jobs), and every consumer of a schema, API, event, or
  config the spec changes. These decide whether step 5 applies;
- code owners and required reviewers, each approval a task.

## Step 4: tasks as vertical slices

- Fix the contracts the slices share first (schema, types, an API or event
  shape, a file format, a function signature), in a small task whose
  Produces line states each exactly. Two parallel streams that each "define
  the API as needed" produce two APIs.
- Each task delivers one working path through every layer it touches
  (storage, logic, interface, test), not one layer at a time.
- Every task leaves the system building with the check command green and
  could merge alone. A task that breaks the build until a later one lands is
  two tasks in the wrong order, or needs a flag that keeps the unfinished
  path off.
- Size by files touched, and split anything large:

  | Size | Files touched | Example |
  |---|---|---|
  | XS | 1 | One validation rule, one config value |
  | S | 1-2 | One endpoint or component with its test |
  | M | 3-5 | One feature slice through every layer |
  | L, XL | 6+ | Split it |

- Tasks that may run in parallel after their contract task touch disjoint
  files; migrations, shared state, and a chain of dependencies run in
  sequence.

## Step 5: deploy safety

A task that changes a schema, stored data, a public API or event, shared
config, or infrastructure while an older version still runs ships in
compatible stages: expand, migrate, switch, and contract in a later deploy,
or behind a flag. Each such task names its rollback and the signal that says
the stage is safe to keep. Data written in a new shape often cannot be
rolled back by redeploying old code. Read `rollout-safety.md` beside this
file for the patterns.

## Step 6: the task fields for code

In the template, a code task fills:

- **Scope** with the exact files: create `path`; modify `path`; test `path`;
- **Produces** with exact names, signatures, columns, endpoints, or flags;
- the first checkbox with the failing test it starts with, the command that
  runs it, and why it fails;
- **Check** with a command from the Checks line and its expected result;
- a checkpoint every two or three tasks: the full check command, the
  end-to-end path, and a review.

Watch points for code: empty input, concurrent writes, permissions, existing
data that breaks the new rule.

## Step 8: extra self-review lines

- [ ] every file, function, command, and migration number a task names
      exists as written or is created by an earlier task's Produces line;
- [ ] every check uses a command from the plan's Checks line;
- [ ] every task leaves the build and checks green;
- [ ] every task that step 5 covers is compatible with the version running
      beside it and names its rollback.

## Gotchas

- A name or path that drifts between tasks (`orderTotal` in task 3,
  `totalCents` in task 6) is the most common code-plan bug.
- A plan with function bodies has written the code instead. Write
  interfaces, files, and checks.
- Layered tasks ("all migrations", then "all API", then "all UI") cannot be
  checked until the end, and nothing merges alone.
- A rename or a column drop in one migration looks atomic in the diff and is
  not atomic in production: the old version still runs during the deploy.
- The dependency added with its first use, and the table with its first
  reader, beat a standalone "setup" task.
