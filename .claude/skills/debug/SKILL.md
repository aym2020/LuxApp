---
name: debug
description: Diagnose and fix LuxApp bugs using reproduction, root-cause analysis, minimal changes, and focused regression tests; use for broken features, flaky tests, or unexpected UI behavior.
---
# LuxApp debugging

1. State observed behavior and expected behavior; collect reproducible steps, environment, logs, and exact error messages.
2. Inspect the relevant implementation and its callers, data contracts, persistence, routing, and tests before editing.
3. Form a falsifiable root-cause hypothesis. Distinguish a code defect from stale state, test infrastructure, configuration, or data.
4. Reproduce with the smallest practical test. Avoid mutating production data or changing unrelated behavior.
5. Implement the smallest maintainable correction. Preserve established naming, APIs, and UI conventions.
6. Add or update a regression test that fails before the fix where feasible.
7. Run focused tests first, then appropriate critical checks. Isolate servers and ports; do not terminate unrelated processes.
8. If a suite fails, independently verify whether it also fails on the untouched target branch.
9. Report root cause, files changed, test evidence, unresolved limitations, and risks. Never push or deploy without authorization.
