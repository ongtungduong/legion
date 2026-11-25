---
type: llm
---

PASS if the changed code takes the clock as a constructor parameter (a function such as `clock = () => Date.now()`) and takes the rates through the constructor with `fetchRates()` as the default, and the tests use those parameters rather than fake timers or a module mock of `rates.js`.

FAIL if the tests use fake timers (`mock.timers`, `useFakeTimers`), mock the `rates.js` module, or the reply leaves the constructor calling the real clock and `fetchRates()` with no way to pass them in.
