# Test quality

Read before writing the first test of a session. A test earns its place only
if it would fail when the behavior it names broke.

## Good and bad

```
Good: test('retries a failing operation three times', async () => {
        let attempts = 0
        const op = async () => { attempts++; if (attempts < 3) throw new Error('fail'); return 'ok' }
        expect(await retry(op)).toBe('ok')
        expect(attempts).toBe(3)
      })

Bad:  test('retry works', async () => {
        const mock = jest.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce('ok')
        await retry(mock)
        expect(mock).toHaveBeenCalledTimes(2)   // asserts on the mock, not the behavior
      })
```

## Anti-patterns

- **Implementation-coupled** tests (mocking internal collaborators, testing
  private methods, checking the database instead of the interface) break on
  refactors that kept behavior.
- **Tautological** tests compute the expected value the way the code does
  (`expect(add(a, b)).toBe(a + b)`) and can never disagree. Take expected
  values from a literal, a worked example, or the spec.
- **Horizontal slicing** (all tests, then all code) tests imagined behavior.
  Each cycle should respond to what the last one taught you.
- **Over-mocking:** mock only true external boundaries (network, clock,
  systems you do not own), after checking what side effects the real
  dependency has. Keep test-only helpers out of production code.

## Checklist

- [ ] Every new behavior has a test that was seen failing first, for the
      expected reason.
- [ ] Tests assert on behavior at seams, not on mocks or internals.
- [ ] Every test traces to an acceptance criterion, and every criterion has a
      test.
- [ ] Expected values come from the spec, a literal, or a worked example.
