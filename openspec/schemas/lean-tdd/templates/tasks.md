# Tasks

<!-- Lean TDD cycle below; OpenSpec tracks progress through the checkboxes. -->

## 1. Existing-suite baseline

- [ ] 1.1 Inspect project files, CI, and nearby tests; run suites related to the criteria before adding new tests or implementation; record commands, results, and preexisting failures here. Keep these suites in the regression set.

## 2. AC-1 through the system public API: <!-- user-facing criterion -->

- [ ] 2.1 Draft the simple happy-path test through <!-- focal public operation -->; identify the public query or setup calls needed to assert AC-1, review their contracts, and link any new supporting requirements to AC-1.
- [ ] 2.2 Under AC-1, test and implement each supporting public feature until the focal test can run; report meaningful red failures and rerun focused and related baseline suites.
- [ ] 2.3 Run the focal test red for the missing behavior, implement the simplest sound happy path, and rerun focal, supporting-feature, and related baseline checks.
- [ ] 2.4 Add any distinct cases and risk-driven checks using the testing trophy, then report final relevant-suite commands and results; refactor after green only if useful.

<!-- Repeat group 2 for the next acceptance criterion. Update specs, design,
     and tasks for a new observable rule. -->
