# Tasks

## 1. Existing-suite baseline

- [ ] 1.1 Inspect project files, CI, and nearby tests; run suites related to the criteria before adding new tests or implementation; record commands, results, and preexisting failures here. Keep these suites in the regression set.

## 2. AC-1 through the system public API: <!-- user-facing criterion -->

- [ ] 2.1 Draft the simple happy-path test through <!-- focal public operation -->; identify the public query or setup calls needed to assert its result, review their contracts, and add requirements for any new observable behavior.
- [ ] 2.2 Test and implement each new supporting public behavior until the focal test can run; report meaningful red failures and rerun focused and related baseline suites.
- [ ] 2.3 Run the focal test red for the missing behavior, implement the simplest sound happy path, and rerun focal, supporting-feature, and related baseline checks.

## 3. Next user-facing criterion or distinct AC-1 case: <!-- ID and name -->

- [ ] 3.1 Write its next behavior test at the system public API or another useful boundary, show meaningful red evidence, and implement the simplest sound behavior.
- [ ] 3.2 Rerun focused and related suites, refactor after green only when useful, then report final relevant-suite commands and results.

<!-- Repeat criterion groups as needed. Follow the testing trophy as a guide:
     public API/integration checks for interactions, broader E2E checks when
     useful, focused unit checks for complex logic, and static checks. No fixed
     ratios and no requirement for a UI or E2E harness.
     If no new automated check is practical, state why and record alternative
     evidence. Update specs/design/tasks for a newly discovered observable rule. -->
