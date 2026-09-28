# Lean TDD workflow: schema options

## Decision to review

**Recommendation:** pilot a project committed `lean-tdd` schema forked from `spec-driven`. Keep `proposal → specs/design → tasks → apply`, the existing delta spec format, and checkbox task tracking. Write each acceptance criterion as a requirement with several grouped scenarios. Prefer Given/When/Then steps, while allowing When/Then when setup adds nothing. Make a related-suite baseline the first tracked task, before the first new test or implementation. Put test-tool discovery in the schema guidance; use `openspec/config.yaml` to select the schema and add only project facts the agent cannot readily discover. Run a change with `--schema lean-tdd` before choosing it as the project default.

This design note preceded the schema implementation. The [research note](lean-tdd-insights.md) distinguishes Brian Okken's public Lean TDD material from this OpenSpec adaptation.

## Current OpenSpec behavior

The bundled [`spec-driven` schema](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml) defines four artifacts. Proposal identifies affected capabilities; delta specs describe observable behavior with requirements and WHEN/THEN scenarios; design records implementation decisions when warranted; tasks are a checkbox implementation checklist. Specs and design both depend on proposal, and tasks depends on both. The schema's `apply` block requires tasks, tracks `tasks.md`, and supplies apply guidance. See also the [schema reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/schema-yaml.md) and [default schema reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/spec-driven/index.md).

```text
                 ┌─ specs ──┐
proposal ────────┤          ├─ tasks ─ apply
                 └─ design ─┘
```

The current spec guidance already favors observable behavior and testable scenarios. The task guidance already asks each task to state how completion is verified. The missing emphasis for Lean TDD is **how criteria group cases**, **which existing tests establish the baseline**, **when** a new check is written and run, **which behavior boundary** it exercises, and whether a check adds distinct value. The current apply instruction says to work through tasks and mark them done; it does not guide the baseline or a test first loop. [schema.yaml](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml).

OpenSpec's schema model can change artifact dependencies, templates, per artifact instructions, and `apply.instruction`. A project schema lives under `openspec/schemas/<name>/` and can be checked out with the repository. `config.yaml` selects the project default schema and injects context, artifact rules, and advisory apply guidance. Existing changes retain their selected schema in `.openspec.yaml`. [Schema customization](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/customize/schemas.md); [project configuration](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/customize/project-config.md).

## Options

| Option | What changes | Benefit | Cost or limit |
| --- | --- | --- | --- |
| A. Config only | Add `rules.tasks` and `operations.apply.guidance` to `config.yaml`. | Smallest pilot; no schema fork. | Guidance stays additive to `spec-driven`; the workflow identity and defaults do not travel as one reusable schema. |
| **B. Fork the schema** | Commit `openspec/schemas/lean-tdd/` with adapted instructions and templates; select it per change or in config. | Versioned, portable workflow; matches the preference for something easy to check out and apply. | A fork is a snapshot and needs manual reconciliation when the built in schema improves. |
| C. New test artifact | Add `acceptance-tests.md` or similar before tasks or apply. | Reviewable mapping from spec cases to planned tests. | Adds another artifact and mapping to maintain; repeating the case text would duplicate the spec. |
| D. New CLI lifecycle | Add machine enforced red/green states or post apply evidence. | Stronger enforcement and status reporting. | Requires product and CLI changes beyond today's schema contract; premature before a schema pilot shows the need. |

Option B is the best first implementation candidate. Option A remains useful for local tuning within B. Option C should follow a demonstrated gap in `spec.md` and `tasks.md`, not a desire to make the workflow look more test driven. The first version can keep requirements and test examples visually distinct **inside one requirement block**: the normative sentence states the criterion, and its scenarios contain the cases.

**Anvil confirms Option C is easy to implement.** Its [schema](https://github.com/jikkujoyce/openspec-schemas/blob/main/schemas/anvil/schema.yaml) adds a `test-plan.md` artifact between specs/review and tasks, and its [template](https://github.com/jikkujoyce/openspec-schemas/blob/main/schemas/anvil/templates/test-plan.md) maps spec scenarios to named test files/functions with red/green state. OpenSpec's artifact graph can do the same for `acceptance-tests.md`; technical difficulty is not the reason to defer it. The decision is whether a separate, reviewable test mapping adds value beyond grouped scenarios, the baseline task, and test code. For v1, keep those cases in specs. If a pilot needs explicit test-location planning or coverage audit, add a compact artifact that references scenarios instead of repeating their Given/When/Then text. OpenSpec tracks the custom file's presence, but validation does not check its mapping, and archive keeps it with the change rather than merging it into main capability specs.

## Proposed schema shape

Start with `openspec schema fork spec-driven lean-tdd`, then review the fork before selecting it. Keep the same artifact IDs and paths so existing validation, archive, and spec sync behavior continue to find delta specs and tasks. Keep `apply.tracks: tasks.md` exactly equal to the tasks artifact's `generates: tasks.md`; OpenSpec otherwise cannot reliably associate progress with that artifact. [Schema YAML reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/schema-yaml.md).

| Schema entry | Proposed change from `spec-driven` |
| --- | --- |
| `proposal` | Keep its purpose and capability inventory. Avoid adding a separate test strategy section here. |
| `specs` | Keep `## ADDED Requirements` or `## MODIFIED Requirements`, plus `### Requirement:` and `#### Scenario:`. Name each requirement for an acceptance criterion, with a concise normative statement and multiple grouped cases. Give scenarios short descriptive names; numbering is optional. Prefer Given/When/Then steps. Do not demand one automated test for every internal path. |
| `design` | Keep conditional use. When a new public API is involved, sketch its inputs, outputs, errors, and types for test review; revise those choices as tests expose awkward calls. Record a useful test boundary when it needs explanation. |
| `tasks` | Put an existing-suite baseline first: discover the project's test tooling from its files and CI, find related tests, run them, and record the command and initial result. Then group work by criterion. Each behavior task identifies its scenarios by name, focused new tests, related existing suites, and verification command. A nearby test comment may link a function to the criterion and scenario name. |
| `apply` | In `instruction`, run the baseline task before any criterion work. Keep those suites in the regression set; after each criterion run the new focused cases and related existing suites. Guide API review, reporting the red command and failure summary in chat, the simplest sound implementation, optional refactoring, and the final relevant suite run. |

Suggested **replacement guidance** for the fork's `tasks.instruction` and `apply.instruction` (an excerpt, not a complete `schema.yaml`):

```yaml
# In the existing tasks artifact
instruction: |
  First add a tracked task to inspect project files, CI, and nearby tests
  to discover the language, test framework, conventions, and commands.
  Run the existing suites related to the acceptance criteria. Record their
  commands and initial results under the baseline task so later tasks
  reuse the same regression set. Do not assume a particular test runner.
  Then organize tasks by criterion and its grouped scenarios. For each
  behavior task, identify the first useful failing check, API review,
  focused test command, and related existing suites to rerun. Include
  the simplest sound implementation and regression checks in the same
  task or group. Refactor after green only to remove duplication or make
  structure clearer, then rerun affected tests. Add a second test level
  only for a distinct risk or materially better feedback.
  Keep the existing checkbox format.

# In the existing apply block
instruction: |
  Complete the existing-suite baseline task before writing new behavior.
  Keep those suites in the regression set throughout the change. Work
  through one criterion at a time: review the API through test calls and
  available lint or static type checks; run a focused check and see the
  expected failure when feasible;
  report the command and failure summary in chat; implement the simplest
  sound solution that passes; rerun focused and related existing suites.
  Refactor only if removing duplication or clarifying structure helps,
  then rerun affected tests. A nearby test comment can name the criterion
  and short scenario title; a stored failure log is optional. If a failure
  reveals a missing user-visible expectation, update the criterion,
  scenarios, design, and tasks before continuing. Report commands and results
  before marking the task complete.
  Run the full relevant suite before completing the change. If a failing
  automated check is impractical, explain the alternative evidence.
```

Example **task content**, not an additional artifact:

```md
## 1. Existing test baseline

- [ ] 1.1 Discover this project's test tooling from its files and CI, inspect tests related to AC-1, run the related suites, and record their commands and any existing failures before adding a new test or code.

## 2. Reject an invalid schema selection

- [ ] 2.1 For AC-1's “Unknown name” and “No schemas available” scenarios in specs/workflow-selection/spec.md, review the public call through tests and available lint or type checks, report the red command and failure summary in chat, implement the simplest sound error behavior, rerun focused and baseline suites, and refactor only if it improves clarity or removes duplication.
```

The schema's `apply.instruction` is returned while apply is ready. The CLI still tracks checkbox completion rather than test runs; when all tasks are done, it returns its standard `all_done` message. Therefore any final regression check that matters should appear in the task's completion condition, and the agent should report the command and result. Red evidence belongs in chat as a command and concise failure summary; stored logs are optional for deeper investigation. [Apply instruction generation](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/src/commands/workflow/instructions.ts); [apply skill template](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/src/core/templates/workflows/apply-change.ts).

## What project config contributes

The portable Lean TDD method belongs in the schema. The agent discovers each repository's language, framework, test commands, and conventions by reading its project files, CI, and nearby tests during the baseline task. The general `config.yaml` example therefore needs only the schema selection:

```yaml
schema: lean-tdd # Select after the per-change pilot
```

Projects may add `context`, `rules`, or `operations.apply.guidance` for constraints that repository inspection cannot resolve, such as a required external test service or a team-specific test boundary. Do not copy a language or runner command into the reusable schema or generic config example. Config can add guidance but cannot change artifact structure or enforce test execution. [Project configuration](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/customize/project-config.md); [config.yaml reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/configuration/config-yaml.md).

For a pilot, leave the project's `schema: spec-driven` setting in place and create one change with `--schema lean-tdd`. If that works, switching the project default is a separate decision. Existing changes record their schema choice in `.openspec.yaml`; changing the default does not migrate them. [Schema customization](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/customize/schemas.md).

## Boundaries and risks

- **Guidance is not enforcement.** The schema can ask an agent to demonstrate a failing test first and report it in chat, but current status and validation do not verify the order of test and code edits or retain chat evidence. If enforcement matters, that is a later CLI feature.
- **Checkboxes are the progress model.** `apply.tracks` parses Markdown tasks, not test output. A checked task can be wrong; review still needs actual test results and behavior evidence. [Schema YAML reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/schema-yaml.md).
- **Delta specs remain the product contract.** Keep `specs/<capability>/spec.md` and current requirement/scenario syntax. Changing only the prose of a custom schema does not change `openspec validate` or archive semantics. [Default schema reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/spec-driven/index.md).
- **Given is a writing preference, not a parser gate.** A nonempty `#### Scenario:` body passes the scenario count; the current parser does not enforce Given/When/Then words. Keep the normative requirement body and at least one nonempty scenario. For a new capability, keep the required Purpose section. [Scenario reader](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/src/core/parsers/requirement-text.ts); [default schema](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml).
- **Scenario names carry identity.** Prefer short descriptive names and use file order for sequence. Optional numbers become part of the scenario name; changing them later can look like losing a scenario when a requirement is modified. [Scenario comparison](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/src/core/specs-apply.ts).
- **The existing suites stay in scope.** Recording a baseline does not make preexisting failures new regressions, and adding acceptance tests must not replace or remove related existing tests. Rerun both the focused tests and related suites after each criterion.
- **Not every change needs the same test form.** A characterization test, manual observation, or static check may be the right first signal for a refactor, UI detail, or documentation change. The task should state the chosen evidence and why it is sufficient.
- **Fork upkeep is real.** `openspec update` does not update project schema forks. The team must compare upstream schema improvements when it upgrades. [Schema customization](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/customize/schemas.md).

## Pilot and review decision

Pilot one change with a user visible behavior and existing automated test harness. Validate the fork with `openspec schema validate lean-tdd` and the drafted change with `openspec validate <change>`. Review whether: (1) related suites ran and their baseline was recorded before criterion work, (2) a grouped scenario became a useful first failing check and its command and failure summary were reported in chat, (3) the simplest sound implementation passed focused and existing suites, (4) any refactor removed duplication or clarified structure while tests stayed green, and (5) tests were added only where they gave distinct feedback. Compare the experience with a recent `spec-driven` change of similar size; count extra artifacts, repeated acceptance text, and any slow or brittle checks.

If the pilot improves feedback without creating duplicate documentation, select `lean-tdd` in project config and consider publishing it as a bundled schema. If the friction is mainly weak prompts, revise the fork. If the blocker is proof of test order or post apply evidence, propose a CLI change with that specific requirement.

**Review questions:** Should Lean TDD be opt in at first? Which real change should be the pilot?
