# Tasks

## 1. Existing-suite baseline

- [ ] 1.1 Inspect project files, CI, and nearby tests; run suites related to the to-do list before adding new tests or code; record commands, results, and preexisting failures, and retain those suites for regression.

## 2. Shape the public API around AC-1

- [ ] 2.1 Draft the First item test through `add_item()`; identify `count()` and `empty()` as public observations needed to assert the result. Review their call shapes and confirm AC-2 and AC-3 describe their behavior.
- [ ] 2.2 Test AC-2's new-list `count()` behavior, report a meaningful red failure, implement it, and rerun focused and related baseline checks.
- [ ] 2.3 Test AC-3's new-list `empty()` behavior, report a meaningful red failure, implement it, and rerun focused and related baseline checks.

## 3. Complete AC-1 through the public API

- [ ] 3.1 Run the First item test red for missing `add_item()` behavior; report the command and failure, implement the simplest sound add behavior, then rerun it with AC-2, AC-3, and related baseline checks.
- [ ] 3.2 Test Another item and AC-3's nonempty case through the public API; show red evidence where behavior is missing, implement it, rerun relevant checks, and report final commands and results. Refactor after green only if useful.
