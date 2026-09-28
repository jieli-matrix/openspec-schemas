# Tasks

## 1. Existing-suite baseline

- [ ] 1.1 Inspect project files, CI, and nearby tests; run suites related to the criteria before adding new tests or implementation; record commands, results, and preexisting failures here. Keep these suites in the regression set.

## 2. Walking skeleton: <!-- AC-1 and its simplest happy-path scenario -->

- [ ] 2.1 Write one user-level E2E happy-path test that crosses all relevant layers for <!-- scenario -->; review the test-facing API and available static checks; run it red and report the meaningful failure in chat.
- [ ] 2.2 Build the thinnest working path to make that test green; rerun the skeleton test and related baseline suites, and record commands and results.

## 3. Flesh out AC-1: <!-- remaining named scenarios -->

- [ ] 3.1 Add the next distinct case at the useful E2E, integration, or unit boundary; show red evidence, implement the simplest sound behavior, and rerun focused, skeleton, and related baseline checks.
- [ ] 3.2 Repeat for remaining corner cases; refactor after green only when useful, then rerun affected and final relevant suites and report commands and results.

<!-- Repeat criterion groups as needed. Follow the testing trophy as a guide:
     static checks, a few representative E2E tests, integration tests for
     interactions, and focused unit tests for complex logic. No fixed ratios.
     If no new automated check is practical, state why and record alternative
     evidence. Update specs/design/tasks for a newly discovered observable rule. -->
