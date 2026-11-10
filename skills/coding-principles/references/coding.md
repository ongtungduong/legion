# Coding

Read this before writing or reshaping a function, class, or module.
Distilled from Clean Code, A Philosophy of Software Design, Code Complete,
and The Pragmatic Programmer. Where those books disagree (many small
functions against deep modules), the rule here is the reconciled one: split
by what a reader must hold in mind, never by line count.

The repo's documented conventions and the surrounding code's style win over
every rule below.

## Before the first line

- Restate the requirement and what done means. Starting from a proposed
  solution, check its fit with the architecture, the conventions, and the
  error policy first.
- Design the interface before the body: the name, the inputs, the result,
  how it fails, and what the caller may stay ignorant of. For a non-trivial
  interface compare two shapes and keep the one that asks less of callers.
- Sketch a complex routine as intent-level steps, then turn the steps into
  code.
- Build in small verifiable increments. A first working version is not done
  if it makes the next change harder.

## Interfaces and modules

- An interface is small, explicit, and hard to misuse: no required call
  order, no mode flag, no knob that exposes an internal choice. Common
  cases need no configuration.
- Hide representation, bookkeeping, normalization, and messy edge handling
  inside the module that owns them. Expose behavior, not raw data to be
  navigated (`a.b().c().d()`).
- Every helper, wrapper, layer, option, and parameter must hide more
  complexity than it adds. No abstraction for one caller's hypothetical
  future, and no generality the current evidence does not ask for.
- Keep state, behavior, and the invariants that bind them together. Split
  only when each part can be understood alone.
- One authoritative place for each rule, mapping, validation, and
  configuration meaning; everything else derives from it. The third copy of
  the same knowledge is the moment to give it an owner; two similar-looking
  lines may be coincidence.
- Keep construction, framework, persistence, and vendor details out of
  business behavior.

## Functions

- One job at one level of abstraction, readable top-down: intent first,
  detail below.
- Setup, validation, computation, and side effects are separate phases, not
  interleaved.
- Few, meaningful parameters. No boolean flag that switches behavior, no
  output parameter, no grab-bag; when arguments travel together, name the
  concept.
- A function either answers or changes state. Anything that mutates says so
  in its name, with no side effect a caller would not expect.
- Do not split a function into pieces that only make sense together, and do
  not let one function do two jobs that change for different reasons.

## Names and data

- A name says what the thing is for, in the domain's vocabulary: one term
  per concept, one concept per term. A name that is hard to choose is a
  sign the abstraction is wrong.
- Make meaning explicit: units, ranges, encodings, and ownership live in
  names, constants, or types, not in the reader's memory. No magic values.
- Choose types that make invalid states hard to represent: an enumeration
  for a closed set, a boolean only for a true yes/no, a value type for a
  primitive that carries rules.
- Smallest scope, initialized where declared, one meaning per variable.

## Control flow

- Shallow nesting, guard clauses for the exceptional cases, a named
  predicate for a compound condition, and a normal path that stays visible.
- A loop's start, end, and step are obvious. No expression that depends on
  a side effect, and no clever one-liner.
- A stable mapping (codes, categories, conversions) can be a table when the
  table is clearer than the branches and stays validated.
- Define awkward cases away where possible: change the interface or the
  invariant so the invalid state cannot occur, instead of making every
  caller check for it.

## Errors and contracts

- Validate input at the trust boundary, and use the parsed value after it.
  Inside the boundary, assert programmer assumptions; do not re-validate at
  every layer.
- Tell the kinds apart: a programmer error or impossible state fails
  loudly; an expected business failure is a typed result or domain error; a
  retryable failure is marked as such.
- Handle an error at the level that can do something about it, keep its
  diagnostic context, and never continue from a corrupted state. No empty
  catch, and no null-like sentinel where the language offers an explicit
  optional or result.
- Contracts (preconditions, invariants, who owns cleanup) sit next to the
  abstraction they protect, in code where possible.

## State, resources, concurrency

- Shared mutable state, globals, ambient context, and temporal coupling are
  costs: avoid them, or make ownership and ordering explicit.
- Whoever acquires a resource (handle, lock, connection, subscription)
  releases it on every path, success or failure.
- When concurrency enters, isolate the threading policy from the logic,
  keep shared mutable state minimal, define shutdown, and test the
  timing-sensitive behavior.

## Comments and consistency

- A comment says what the code cannot: why, a constraint, a warning, an
  interface contract, a non-obvious fact. A comment that narrates the code
  is a prompt to fix the name or the structure.
- Follow the file's existing formatting, naming, and idioms. A private
  dialect in one module is complexity, even when it is better in isolation.
- Understand generated or pasted code before relying on it. Code that works
  for reasons nobody can explain is not finished.

## Tests

- Tests are production code: readable, deterministic, and aligned with the
  contract they protect.
- Test through the public interface. Do not make an interface shallow or
  leaky for the convenience of a test.
- Beyond the happy path, cover the boundary values, invalid input, and each
  failure contract.

## When

- a function mixes phases or abstraction levels, is hard to name, or needs
  a comment to explain its flow: split or rename it before adding logic.
- adding a flag, special case, or conditional: ask first whether the owning
  module can remove the invalid state or offer a stronger operation.
- a framework, vendor, or storage quirk leaks inward: add or strengthen the
  local adapter.
- the same fact appears in several places: choose one owner and derive the
  rest.
- cleanup starts to spread: cut back to the smallest change that keeps the
  requested work safe and readable.
- tempted to optimize: measure first, and hide the optimization behind the
  interface.

## Final checklist

- Can a reader follow the change locally, without reconstructing hidden
  state or jumping across files?
- Do names, types, and interfaces carry the meaning without narration?
- Does every new function, parameter, option, and abstraction earn its
  place?
- Is each piece of knowledge in one place?
- Is mutation explicit, the normal path clear, and every error handled or
  deliberately propagated with its context?
- Is input validated at the boundary, and are impossible states either
  unrepresentable or asserted?
- Are resources released on every path, and is shared state visible?
- Do tests protect the changed contract, including boundary and failure
  cases, and were they run?
- Does the change match the surrounding conventions and stay small enough
  to review?
