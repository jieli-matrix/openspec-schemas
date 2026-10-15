# Proposal

## Why

Agents using the `lean-tdd` schema follow its Lean TDD shape only some of the time. Specs drift back to one requirement per API method, tasks follow dependency order instead of the acceptance criteria, and design.md becomes an architecture document. An explicit prompt usually corrects the behavior, which points to the schema itself. The fork kept spec-driven's instructions word for word and appended the Lean TDD rules after them. Several upstream rules, such as "Order tasks by dependency", contradict the appended ones. The `**Supports:**` requirement pattern also invites a requirement and a test for every API an acceptance test touches.

## What Changes

- **BREAKING** Every spec requirement is an acceptance criterion, and every scenario is exactly one automated acceptance test. Remove the `**Supports:**` requirement pattern. The APIs an acceptance test needs, such as `count()` and `empty()` for `add_item()`, appear only inside that criterion's GIVEN/WHEN/THEN steps and get no requirement or test of their own.
- The order of criteria in the spec is the implementation order. Authors put prerequisite outcomes first.
- **BREAKING** Requirement headings carry plain outcome names with no `AC-N` prefix. AC numbers are change-local, assigned by position, and used only in `tasks.md`.
- `tasks.md` is a one-to-one projection of the spec: a baseline group, then one group per criterion in spec order (`## N. AC-N <requirement name>`), with one checkbox per scenario.
- design.md describes the API the acceptance tests call and the test boundary for each criterion. It now depends on specs, so it is written from the criteria.
- Rewrite each instruction and template as a single, consistent Lean TDD text in place of the spec-driven text plus appended Lean TDD rules. Each rule lives in one place; the red/green/regress loop lives only in the apply instruction.
- Update the sample change, README, workflow image, and Lean TDD working model to match.

## Capabilities

### New Capabilities

None. This repository distributes a schema and has no OpenSpec capability specs.

### Modified Capabilities

None.

## Impact

Changes `openspec/schemas/lean-tdd/` (schema.yaml and all four templates), `examples/sample-change/`, `README.md`, `assets/lean-tdd-workflow.{mmd,png}`, and `docs/explorations/lean-tdd-insights.md`. Existing changes created with the current schema keep working: artifact IDs, paths, delta syntax, and checkbox tracking are unchanged. Their specs and tasks follow the old shape until rewritten. The proposal artifact is unchanged.
