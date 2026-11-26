# Evidence behind the delegation rules

Read when the user questions a split, or when a piece fits no row of the
table in step 2. Figures are as the sources report them, on their
benchmarks and models; treat them as direction, not as a forecast for this
task. Measure your own setup before adopting it (`patterns.md`, "Measuring
a setup").

## Contents

- Anthropic: simplest first, and the workflow patterns
- Kim et al.: when a team beats one agent
- Cemri et al.: how multi-agent systems fail
- What follows for this skill

## Anthropic: simplest first, and the workflow patterns

"Building effective agents" (Anthropic, 2024-12-19,
https://www.anthropic.com/research/building-effective-agents, read
2026-11-26):

- Find "the simplest solution possible, and only increasing complexity
  when needed". Agentic systems trade latency and cost for task
  performance; add complexity "only when it demonstrably improves
  outcomes".
- Patterns, each with its condition:
  - prompt chaining: fixed subtasks, with a programmatic gate between steps;
  - routing: distinct categories handled better apart (cheap model for easy
    inputs, stronger for hard);
  - parallelization: sectioning for independent subtasks, voting when
    several attempts raise confidence (several reviewers for
    vulnerabilities);
  - orchestrator-workers: subtasks that cannot be predicted in advance;
  - evaluator-optimizer: clear criteria, and feedback that measurably
    improves the output.
- Autonomous agents bring "higher costs, and the potential for compounding
  errors"; they need ground truth from the environment at each step and a
  stopping condition.
- Tools deserve as much care as prompts. Make mistakes hard to make
  (poka-yoke): their coding agent misused relative paths until the tool
  required absolute ones.

## Kim et al.: when a team beats one agent

"Towards a Science of Scaling Agent Systems" (Google Research, Google
DeepMind, MIT; arXiv 2512.08296, v3 2026-04-08). 260 configurations, five
architectures (single agent; independent, centralized, decentralized,
hybrid teams), three model families, six benchmarks.

| Finding | Figure |
|---|---|
| Decomposable work (financial analysis) | centralized team +80.8% over one agent |
| Sequential planning (PlanCraft) | every team worse: -39% to -70% |
| Software engineering (SWE-bench Verified) | every team worse: -2% to -15% |
| Tool-heavy work | coordination cost grows with the number of tools |
| Capability ceiling | above about 45% single-agent success, more agents gave negative returns |
| Error amplification against one agent | independent 17.2x, centralized 4.4x |
| Token overhead against one agent | independent +58%, centralized +285%, hybrid +515% |

The paper's claim: "architecture-task alignment determines collaborative
success", not the number of agents. Limits: a fixed budget and fixed tools,
six benchmarks, a predictive model with R² about 0.4. Several per-benchmark
figures above were read from an extracted summary of the paper, not its
full text.

## Cemri et al.: how multi-agent systems fail

"Why Do Multi-Agent LLM Systems Fail?" (UC Berkeley; arXiv 2503.13657, v3
2025-10-26). 1,642 traces from 7 frameworks, failure rates of 41% to 86.7%,
14 failure modes in three groups (share of failures):

- system design: step repetition 15.7%, unaware of termination 12.4%,
  disobeying the task specification 11.8%;
- misalignment between agents: reasoning-action mismatch 13.2%, task
  derailment 7.4%, failing to ask for clarification 6.8%;
- verification: incorrect 9.1%, missing or incomplete 8.2%, premature
  termination 6.2%.

Clearer role specifications and a topology change with one owner of
termination raised task success by up to about 15 points, but not to
reliability. In the paper's words, failure "is not merely a function of
challenges in the underlying model": the design of the system matters.
Benchmarks are coding and math.

## What follows for this skill

| Rule | Evidence |
|---|---|
| Default to doing it yourself; delegate by the shape of the work | Anthropic, simplest first; Kim, alignment over agent count |
| Parallel only for independent, decomposable pieces | Kim, +80.8% decomposable against -39% to -70% sequential |
| One agent for sequential or tool-heavy work on one state | Kim, sequential planning, SWE-bench, tool count |
| Voting for expensive misses | Anthropic, parallelization by voting |
| A done condition and BLOCKED-with-a-question in every brief | Cemri, termination, specification, and clarification failures |
| The main session is the only merge gate and owns termination | Kim, 17.2x against 4.4x; Cemri, verification failures and termination ownership |
| Capped review-and-fix rounds with clear criteria | Anthropic, evaluator-optimizer; Cemri, step repetition |
| Absolute paths in briefs | Anthropic, poka-yoke |
| Fix the brief, tools, or check before adding agents | Anthropic, tools over prompts; Cemri, design over model |
