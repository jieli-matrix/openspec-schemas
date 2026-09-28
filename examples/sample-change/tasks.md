# Tasks

## 1. Existing-suite baseline

- [ ] 1.1 Inspect project files, CI, and nearby tests; run suites related to the to-do list before adding new tests or code; record commands, results, and preexisting failures, and retain those suites for regression.

## 2. AC-1 Adding an item increases the count

- [ ] 2.1 Draft the First item test through `add_item()`; identify `count()` and `empty()` as public observations needed to assert AC-1. Review their call shapes and link their supporting requirements to AC-1.
- [ ] 2.2 Test the new-list `count()` behavior that supports AC-1, report a meaningful red failure, implement it, and rerun focused and related baseline checks.
- [ ] 2.3 Test the new-list `empty()` behavior that supports AC-1, report a meaningful red failure, implement it, and rerun focused and related baseline checks.
- [ ] 2.4 Run the First item test red for missing `add_item()` behavior; report the command and failure, implement the simplest sound add behavior, then rerun it with the supporting-feature and related baseline checks.
- [ ] 2.5 Test Another item and the nonempty `empty()` case through the public API; show red evidence where behavior is missing, implement it, rerun relevant checks, and report final commands and results. Refactor after green only if useful.
