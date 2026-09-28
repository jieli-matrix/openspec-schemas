# Tasks

## 1. Standalone repository and schema fork

- [x] 1.1 Create the independent `openspec-lean-tdd-schema` repository with `README.md`, MIT `LICENSE`, and `openspec/schemas/lean-tdd/`; copy the current `spec-driven` schema and templates, set `name: lean-tdd`, record the upstream source revision, and verify `openspec schema validate lean-tdd` passes in a consuming project.
- [x] 1.2 Preserve the fork's proposal/specs/design/tasks artifact IDs, generated paths, dependencies, and apply tracking; compare the two schema graphs and verify `openspec instructions` can resolve every artifact after the bundle is copied.

## 2. Acceptance criteria and API design

- [x] 2.1 Update the spec instruction and template to separate normative acceptance criteria from grouped, short-named Given/When/Then scenarios while preserving OpenSpec delta syntax; add a sample change with one criterion and multiple cases, and verify `openspec validate <sample-change>` passes.
- [x] 2.2 Update design guidance and template for an optional public API sketch, test-call review, available lint/type checks, and requirements/design revision when tests reveal a gap; inspect generated design instructions and verify they express these decisions without requiring an API sketch for unrelated changes.

## 3. Baseline and criterion loop

- [x] 3.1 Update tasks guidance and template so the first tracked task discovers and runs related existing suites, records commands and preexisting failures, and retains those suites as regression checks; inspect generated tasks instructions and verify the sample tasks start with that baseline.
- [x] 3.2 Update tasks and apply guidance to turn a user-facing criterion into a simple system public API test, link supporting public feature requirements to that criterion and keep their tasks inside its group, make the focal happy path pass, and repeat for the next criterion or distinct case; review test-facing API shape, report meaningful red evidence, and rerun focused and related suites.
- [x] 3.3 Use the testing trophy as a guide for public API and integration checks, broader E2E checks when useful, and focused unit checks where they add distinct feedback; include static checks, optional nearby test comments, and criteria/design/tasks revision for new observable rules without language-specific commands or mandatory test ratios.

## 4. Consumer guidance and portability checks

- [x] 4.1 Add `examples/config.yaml` with only `schema: lean-tdd` and a user-driven README with a rendered workflow image, an attributed to-do walkthrough, and book/repository copyright distinction; verify the example reflects the schema guidance.
- [x] 4.2 Add a Git-remote starter command that installs the bundle and creates a Lean TDD change in one run; exercise its package bin in a disposable project and inspect the copied schema and change metadata.

## 5. Publication

- [x] 5.1 Publish the standalone repository at its Git remote and verify the README command can start a Lean TDD change in a fresh project.
