# Design

## Context

The `lean-tdd` schema is a fork of OpenSpec's `spec-driven` schema at [`79b6aa9`](https://github.com/Fission-AI/OpenSpec/commit/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777). See proposal.md - Why for the observed instability. Reviewing the current bundle shows three causes:

- **Contradictory rules.** About 85% of `schema.yaml` (2,481 words) is upstream text, and the Lean TDD rules are appended after it. Where they disagree, agents tend to follow the plain upstream rule:

  | Artifact | Upstream text still present | Appended Lean TDD text |
  | --- | --- | --- |
  | specs | "each scenario is a potential test case"; WHEN/THEN format | criteria drive tests; GIVEN/WHEN/THEN |
  | specs | requirement = any behavior contract | "Give each new supporting public API feature its own requirement" |
  | design | "explains HOW to implement"; Context/Goals/Decisions/Risks/Migration | sketch the focal public call |
  | tasks | "Order tasks by dependency (what must be done first?)" | one group per criterion |

- **A built-in way back to one requirement per API.** In the `**Supports:**` pattern, the sample spec has three requirements, and only one of them is a criterion. Tasks 2.2 and 2.3 then test `count()` and `empty()` on their own.
- **Design is written without seeing the specs.** `design` requires only `proposal`. It describes modules and layers, and tasks then follow that layer order.

Upstream behavior this design relies on:

- Archive merges a delta into `openspec/specs/<capability>/spec.md`, matching requirements by normalized heading text (`src/core/specs-apply.ts`). ADDED appends a requirement. MODIFIED and REMOVED must match an existing heading exactly.
- The propose skill creates artifacts until every `apply.requires` artifact is done. Apply checks only `tasks` and its prerequisites (`src/commands/workflow/instructions.ts`).
- Task progress comes from checkboxes. The CLI does not check test order or results.

## Goals / Non-Goals

**Goals:**

- A spec that contains only acceptance criteria, where each scenario becomes exactly one acceptance test.
- Tasks that follow the spec's criteria in order, so a reviewer can check the mapping by comparing headings.
- A design.md whose job is reviewing the API the acceptance tests call.
- Instructions that state each rule once, with no upstream text that contradicts them.

**Non-Goals:**

- New artifacts, CLI changes, or machine checks of the spec-to-tasks mapping. A small lint script may follow if a pilot shows drift.
- Changes to the proposal artifact.
- Migrating changes already created with the current schema.

## Decisions

### 1. A requirement is an acceptance criterion; a scenario is one acceptance test

Every `### Requirement:` in a lean-tdd delta is a user-facing acceptance criterion with one SHALL/MUST sentence. Every `#### Scenario:` beneath it is exactly one automated acceptance test at the highest useful public boundary.

The APIs the test needs to set up or observe the outcome are **not** requirements. They appear only inside GIVEN/WHEN/THEN steps. In the to-do example, `count()` and `empty()` are part of how the `add_item()` test observes the outcome:

```md
### Requirement: Adding an item increases the count
The list SHALL increase its item count by one for each successful `add_item()` call.

#### Scenario: First item
- **GIVEN** a new list whose `count()` is zero and `empty()` is true
- **WHEN** the caller invokes `add_item("buy milk")`
- **THEN** `count()` is one and `empty()` is false

#### Scenario: Another item
- **GIVEN** a list whose `count()` is one
- **WHEN** the caller invokes `add_item("write tests")`
- **THEN** `count()` is two
```

A high-level acceptance test covers the focal API and every API it calls, so per-API tests add little feedback. A needed API becomes its own criterion only when it has its own outcome that a user can observe and that this change is meant to deliver.

*Alternative rejected: keep `**Supports:**` requirements.* They are what led agents to write a requirement and a test for every API.

### 2. Scenarios must prevent stubbed observations

Needed APIs get no tests of their own, so a criterion's scenarios together must show each one changing state. Otherwise a hardcoded stub could pass. In the example, "First item" moves `empty()` from true to false, and "Another item" shows that `count()` actually counts. The specs instruction states this in one sentence.

### 3. Spec order is implementation order

Criteria appear in the order they will be built, with prerequisite outcomes first. Dependencies are handled once, when the criteria are ordered in the spec. Tasks do not reorder them. Building `count()`, `empty()`, and `add_item()` in some order is a local detail inside one task.

### 4. AC numbers are change-local and appear only in tasks (Style Y)

Requirement headings carry only the outcome name. A change's criteria are numbered AC-1..AC-N by their position in its delta. When a change has several delta files, numbering runs across them in the order the proposal lists the capabilities. AC numbers appear only in that change's `tasks.md`.

Why: archive merges requirements into the main spec by heading. Numbered headings from separate changes pile up into a main spec like this:

```md
### Requirement: AC-1 Adding an item increases the count
### Requirement: AC-2 Blank items are rejected
### Requirement: AC-1 Removing an item decreases the count
### Requirement: AC-1 Duplicate items are merged
```

A later change that revises earlier behavior must MODIFY the earlier heading exactly. That change then has one "AC-1" copied from history next to its own new "AC-1". Plain names keep the main spec readable, and requirement name plus scenario name gives a stable identity:

```md
# tasks.md for merge-duplicate-items
## 1. AC-1 Adding an item increases the count (modified)
## 2. AC-2 Duplicate items are merged
```

Test comments name the requirement and scenario, for example `# Adding an item increases the count / First item`. They do not use the AC number, which only means something inside one change.

*Alternative rejected: a running number per capability.* Agents would have to find the highest existing number before each change, which is the kind of guess this change is meant to remove.

### 5. Tasks are a projection of the spec

```md
## 1. Baseline
- [ ] 1.1 Discover and run related existing suites; record commands, results, and preexisting failures.

## 2. AC-1 <requirement name>
- [ ] 2.1 <scenario name>: write the acceptance test, stub the APIs it calls, run red, implement, rerun focused and baseline suites.
- [ ] 2.2 <scenario name>: …

## N+2. Final regression
- [ ] (N+2).1 Run the full relevant suite and report commands and results.
```

Rules: AC groups follow spec order, and each AC group's tasks follow its scenarios in order. Numbering keeps the default checkbox format, starting at `## 1.` and `1.1`. Group 1 is the baseline, so AC-k is group k+1. The AC label in each heading carries the mapping, so the offset does not matter. Relying on IDs such as `0.1` would depend on CLI parsing behavior that the schema does not control. A MODIFIED criterion keeps its position and adds "(modified)" to its group heading. Its tasks update the existing tests. A REMOVED requirement gets a group after the criteria that deletes or rewrites its tests. A RENAMED requirement only needs its test comments updated, inside the group of the criterion that renamed it.

The tasks instruction drops upstream's "order by dependency" and its rule about where tests and docs go. In this layout every group already lands its own tests.

### 6. A red result belongs to the scenario

Before running red, stub every API the test calls so that it imports and passes the available lint and type checks. Then any assertion failure in the scenario is a valid red result, even if it fails on `count()` before reaching `add_item()`. Import, syntax, and type errors are not. Making the scenario green means implementing everything it calls.

A lower-level test is an exception and belongs to apply: complex logic the acceptance test cannot isolate, or feedback that is too slow. The agent states the reason when adding one. It is never a planned task for a simple needed API.

### 7. design.md describes the API the acceptance tests call

The artifact graph stays as forked: `design` requires `proposal`, and `tasks` requires `specs` and `design`. Ordering is done by instruction text only: the design instruction says to write design after the delta specs and to derive it from their criteria. Design is always written, because `tasks` requires it and it is now the only place the needed APIs are reviewed. The template sections:

- **API by criterion**: for each criterion in spec order, the focal call and the setup and observation calls its scenarios use, with signatures, return types, and error shape.
- **Test boundaries**: the test level for each criterion (public function, CLI, HTTP, UI) and why, guided by the testing trophy.
- **Decisions**: non-obvious choices only, with the alternatives considered. This includes migration when relevant.
- **Risks / Trade-offs**: what the acceptance tests cannot catch.

Goals/Non-Goals and Migration Plan are dropped as separate sections, because the proposal covers scope.

*Alternative considered: `design` requires `specs`.* That would enforce the order in the graph. It is deferred to keep the fork's artifact graph identical to upstream. If a pilot shows design being written before the specs, revisit it.

*Alternative considered: optional design (`tasks` requires only `specs`).* Small changes would skip it, but agents would also skip it when an API needed review, and the spec no longer lists the needed APIs anywhere else.

### 8. One home for each rule

Instructions are rewritten, not appended:

| Location | Holds only |
| --- | --- |
| `specs` instruction | criterion/scenario rules, ordering, anti-stub rule, essential delta syntax (operations, `####` scenarios, Purpose for new capabilities, full-block MODIFIED, exact capability paths, `skip_specs`) |
| `design` instruction | API by criterion and test boundaries |
| `tasks` instruction | the projection rules and the checkbox format |
| `apply` instruction | baseline-first, the red/green/regress/refactor loop, the lower-level-test exception, revising specs when a failure reveals a new outcome |
| templates | the document's shape, with minimal comments that do not repeat instructions |

The proposal instruction and template stay as they are. Upstream text that only restates generic spec-driven advice is removed. Text that validation or archive depends on stays.

## Risks / Trade-offs

- **Transitive coverage can hide a broken API** → Decision 2's anti-stub rule. Apply may add a justified lower-level test.
- **Agents may still order tasks by dependency** → The tasks instruction says why the spec order already carries dependencies, and the sample shows the one-to-one layout. A heading-alignment lint is a possible follow-up.
- **Plain headings lose the cross-reference shorthand** → AC-N stays available inside each change's tasks. Durable references use the requirement name.
- **The graph still lets design be written before specs** → The design instruction and template are organized around the criteria, which pushes agents to write specs first. A graph change remains the fallback.
- **The fork drifts further from upstream** → Upstream comparisons now focus on the essential delta syntax and the artifact contract, recorded in the schema header comment.
- **Changes created with the old schema stay in the old shape** → No migration. Old specs with `AC-N` headings and `**Supports:**` blocks still validate and archive.
