# Design

## Context

OpenSpec loads project schemas from `openspec/schemas/<name>/`. A standalone repository can distribute a schema through its Git remote and README install command. The built-in [`spec-driven` schema](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml) supplies the artifact graph and delta spec conventions that Lean TDD should retain. The [Lean TDD working model](../../explorations/lean-tdd-insights.md) and [schema options](../../explorations/lean-tdd-schema-options.md) record the workflow decisions behind this fork.

This change's `skip_specs: true` applies only to the OpenSpec repository: the deliverable is an external schema, with no changed OpenSpec core behavior.

## Goals / Non-Goals

**Goals:**

- Ship an independently versioned, copyable `lean-tdd` schema with enough documentation and examples for another project to adopt it.
- Preserve OpenSpec's existing spec validation, archive, artifact paths, and checkbox progress model.
- Make the acceptance-criterion-to-test loop concrete while leaving language, test runner, and test boundary discovery to each consuming project.

**Non-Goals:**

- Add a test-plan artifact, new CLI states, or machine enforcement of red/green order.
- Require every project to have HTTP APIs, UI tests, static typing, or a particular test framework.
- Change OpenSpec's bundled default schema or switch this repository's own `openspec/config.yaml`.

## Decisions

### 1. Package as a standalone community schema

Use `openspec-lean-tdd-schema` as the repository name and this layout:

```text
openspec-lean-tdd-schema/
  README.md
  LICENSE
  package.json
  assets/lean-tdd-workflow.{mmd,png}
  openspec/schemas/lean-tdd/
    schema.yaml
    templates/{proposal,spec,design,tasks}.md
  scripts/start.mjs
  examples/config.yaml
  examples/sample-change/...
```

Fork the current `spec-driven` bundle, record its source revision in the README, set `name: lean-tdd`, and adapt the instructions and templates. Keep the original artifact IDs, generated paths, dependencies, and `apply.requires: [tasks]` / `apply.tracks: tasks.md`. The new repository uses the same MIT license and retains attribution to OpenSpec. Its Git remote is `https://github.com/jieli-matrix/openspec-schemas.git`.

This follows the copyable community-schema layout. Vendoring the fork in OpenSpec core would tie its release cadence to OpenSpec and make the experiment look like a new built-in default.

### 2. Keep acceptance criteria and grouped cases in delta specs

The `specs` instruction and `spec.md` template teach a list of acceptance criteria, each expressed as a `### Requirement:` heading plus a short normative statement. Put its distinct cases under that heading as `#### Scenario: <short descriptive name>` blocks; prefer Given/When/Then, and use When/Then where setup adds no information. Criterion IDs such as `AC-1` may help cross-reference; scenario names carry meaning, while file order supplies sequence. Separate the rule from its examples in the document.

Retain `## ADDED Requirements` / `## MODIFIED Requirements`, full-block modification rules, `## Purpose` for a new capability, and at least one nonempty scenario per requirement. This keeps current validation and archive behavior. The actual executable case lives in the project's test code; a nearby comment may refer to the criterion and scenario without maintaining a test-function registry in the spec.

**Alternative considered: `acceptance-tests.md`.** [Anvil's schema](https://github.com/jikkujoyce/openspec-schemas/blob/main/schemas/anvil/schema.yaml) demonstrates that adding an artifact is straightforward: its `test-plan.md` depends on specs and review, then tasks depends on the test plan. We could likewise add `id: acceptance-tests`, `generates: acceptance-tests.md`, a template, and a dependency from tasks. Anvil's [test-plan template](https://github.com/jikkujoyce/openspec-schemas/blob/main/schemas/anvil/templates/test-plan.md) maps each spec scenario to a test file/function and maintains red/green state. That mapping is useful when a team needs to review exact test locations before implementation or audit coverage afterward.

For v1, the grouped scenarios already express the acceptance cases, the first task records existing suites, and nearby test comments can connect cases to executable tests. A separate artifact would introduce a second list to keep in sync without adding a distinct decision. OpenSpec detects a custom artifact's file but does not validate its scenario-to-test mapping; archive retains that file with the change while only delta specs become the lasting capability spec. If a pilot shows that test-location planning or coverage review is missing, add a later `acceptance-tests.md` artifact containing **references** to spec scenarios, baseline suites, and planned test locations, rather than another copy of Given/When/Then text. Its presence would gate tasks; content checks would still need agent review or separate tooling.

### 3. Put the baseline and criterion loop in tasks and apply guidance

The tasks template begins with a tracked existing-suite baseline task. Its instruction tells the agent to inspect project files, CI, and nearby tests, run suites related to the criteria before adding a new test or implementation, and record commands, results, and preexisting failures. Those suites remain in the regression set after each criterion and at final review.

After the baseline, choose a user-facing acceptance criterion and draft a simple happy-path test at the system public API. If testing its focal operation needs new public queries or setup calls, specify their observable behavior as separate requirements linked to the focal criterion and keep their implementation tasks inside that criterion's group. Then run the focal test red for the intended missing behavior and implement the simplest sound happy path through the needed layers. Move to the next criterion or distinct case and repeat. The apply instruction reviews test-facing calls, names, types, and errors with available lint/static checks; reports meaningful red commands and failure summaries in chat; reruns focused and existing related suites; and refactors after green only when useful. If a failure exposes a new user-visible rule, update specs, design, tasks, and tests before continuing. Store detailed failure logs only when useful.

The design template adds an optional API sketch for changes that introduce public calls, including the queries needed to observe the focal operation's result. Requirements and design may evolve as tests reveal gaps. The testing trophy is a heuristic: static checks support the work, public API or integration checks cover interacting parts, broader E2E checks cover representative flows when useful, and focused unit checks help with complex logic. The guidance avoids fixed test ratios and tests of private implementation steps already covered by behavior checks. A no-new-test exception needs a stated reason and alternative evidence.

### 4. Keep project configuration small and portable

`examples/config.yaml` contains only `schema: lean-tdd`. The README starts with `npm exec --package=git+https://github.com/jieli-matrix/openspec-schemas.git -- openspec-lean-tdd your-openspec-change`; npm fetches the Git repository, then its package bin copies the bundle into the consuming project and runs `openspec new change <name> --schema lean-tdd`. The command leaves the project default alone. The README embeds a rendered workflow image and keeps the to-do example, then explains the optional default switch. Teams can add project facts that repository inspection cannot discover. The generic schema contains no language, package manager, runner, or hardcoded test commands.

### 5. Verify the bundle as a consumer would

The standalone repository includes a to-do list sample adapted from Brian Okken's *Lean TDD: TDD Without the Waste*, with the criterion “Adding an item increases the count.” Its `add_item()` test needs `count()` and `empty()` as public observations, so the sample specifies those features as supporting AC-1 and builds them within the AC-1 task group before completing `add_item()`. The README credits Okken for the approach and example, distinguishes this independent schema adaptation from the book, and retains OpenSpec's license attribution. Internally, run the starter command in a disposable project, check copied schema and change metadata, then validate the schema and sample change. The README focuses on starting and understanding the workflow; a pilot in a real project remains the way to judge the agent guidance.

## Risks / Trade-offs

- **Prompt guidance cannot prove test order or outcomes** → Keep baseline, red evidence, and regression runs explicit in tracked tasks and review command/result reports; do not claim CLI enforcement.
- **A schema fork can drift from upstream** → Record the source revision and compare changed upstream schema instructions/templates before each release.
- **Examples can accidentally become language-specific policy** → Use one neutral sample for spec shape and config; discover each consuming project's test tooling during its baseline task.
- **Git-remote installation needs a public repository** → Publish the repository and exercise the README command from a fresh project.

## Migration Plan

Publish the standalone repository and let adopters run the Git-remote starter command. Pilot it on one change with `--schema lean-tdd`; after review, projects may set `schema: lean-tdd` in `openspec/config.yaml`. Existing changes retain their recorded schema. To stop using the fork, select `spec-driven` for new changes; no core migration is required.
