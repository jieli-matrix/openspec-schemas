# Lean TDD: a working model for OpenSpec

## Source and status

This note combines [Brian Okken's Lean TDD site](https://leantdd.com/), its [sample Chapter 1](https://leantdd.com/downloads/lean-tdd-chapter-1-sample.pdf) (v1.0.1, 2026), and our proposed OpenSpec adaptation. The sample does not include the book's detailed Lean TDD, team, or AI chapters. The sections below describe **our working model**, including choices that may differ from Okken's method. The companion [schema options note](lean-tdd-schema-options.md) maps the first version to OpenSpec's current validation contract.

## The insight from Lean TDD

Okken wants tests to give developers fast, reusable feedback about behavior people care about. He points to duplicated developer and system tests, late QA handoffs, rigid micro steps, excessive mocking, and tests tied to implementation details as sources of wasted effort. He treats test first thinking as asking how we will know a feature works before writing it. [LeanTDD.com](https://leantdd.com/); [Chapter 1](https://leantdd.com/downloads/lean-tdd-chapter-1-sample.pdf), pp. 2–7.

For OpenSpec, we want to go further in one respect: writing an automated test exposes a proposed public API. The test's calls, types, errors, and names are design choices worth reviewing before implementation. This is **our addition**, not a claim about a required step in Okken's book.

## The reader should see a connected chain

```text
Acceptance criterion / requirement (the outcome)
    ├─ Given/When/Then scenario A ── automated test A
    ├─ Given/When/Then scenario B ── automated test B
    └─ Given/When/Then scenario C ── automated test C
             │
             └─ API and design decisions exposed by the tests
```

Start with a **list of acceptance criteria**. Give each criterion a stable identifier so its cases, automated tests, and later review evidence can refer to it. One criterion can expand into several cases: a normal path, an error, a boundary, or another materially different behavior. Keep those cases together under their criterion so a reader can see why each test exists. Give each case a short, descriptive name; its place in the spec can show the reading order without an opaque case ID.

For the first version, use OpenSpec's existing delta format. Each acceptance criterion becomes a `### Requirement:` block with a normative requirement sentence. Each case becomes a `#### Scenario:` under that requirement. This keeps the **requirement statement** separate from its **test examples** while grouping all cases for one criterion. It also means the spec can pass today's validation and archive path without adding a second test document.

| Part | What it answers | What to avoid |
| --- | --- | --- |
| Criterion / requirement statement | What outcome and cross-case rule must hold for a user or caller? | Implementation steps or test framework syntax. |
| Scenario / test case | Which concrete example will prove or challenge that criterion? Prefer **Given / When / Then** steps. | Cases scattered under unrelated requirements or coupled to private implementation details. |

Put the criterion ID in the requirement heading and a short behavior name in each scenario heading. Design decisions and tasks can refer to the criterion and scenario name without repeating the same rule in several documents. The scenarios' order in the file usually provides enough sequence; numbering is optional, and the descriptive name should still carry the meaning.

Keep a short **API sketch** in design when a new public call is involved: name, inputs, outputs, errors, and relevant types. It may evolve as the tests are written. The spec gives the criterion and grouped cases; design explains the API choices; the test code supplies the executable cases. A case can have a stable ID even while its test location is still unknown.

Once a case becomes an automated test, a short comment near the test function can name its criterion and scenario, such as `AC-1 / Unknown name`. Test names can stay natural for the framework; the spec does not need a maintained list of function names.

### Example that fits the current delta format

The example is illustrative, not a proposed change to OpenSpec's schema resolver.

```md
# Spec Delta

## Purpose
Lets callers recover from an unknown schema selection by showing valid choices.

## ADDED Requirements

### Requirement: AC-1 Unknown schema names give callers usable choices
The system SHALL identify an unknown schema name and report the schemas
the caller can select.

#### Scenario: Unknown name
- **GIVEN** `spec-driven` and `lean-tdd` are available
- **WHEN** a caller selects `missing`
- **THEN** the error identifies `missing` and lists both available schemas

#### Scenario: No schemas available
- **GIVEN** no schemas are available
- **WHEN** a caller selects `missing`
- **THEN** the error identifies `missing` and reports an empty choice list
```

This example uses a single normative criterion with two cases and includes the Purpose needed for a new capability. A modified capability uses `## MODIFIED Requirements`, omits Purpose, and copies the full existing requirement block before editing it. The API sketch and test function names belong in design and code rather than in this delta. Given is preferred for readability, but When/Then alone remains acceptable when there is no meaningful setup. Current validation recognizes a nonempty scenario body under `#### Scenario:`; it does not require the words Given, When, and Then. [Delta spec guidance](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml); [scenario counting](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/src/core/parsers/requirement-text.ts).

## Run the related tests before the first criterion

After drafting the criteria, **before adding a new test or implementing the first criterion**, inspect the repository's existing tests, project files, CI configuration, and documentation. Discover the language, test framework, related suites, fixtures, conventions, and commands from that evidence. Run the related suites once as a baseline and record the result, including any failures that already exist. Do not assume a runner from the Lean TDD schema.

Keep those existing suites in the regression set for the whole change. New acceptance tests join them; they do not replace them. After each criterion, run its focused cases **and** the related existing suites. Run the full relevant suite before calling the change complete. If a preexisting failure remains, distinguish it from a new regression in the result. This baseline is a separate preparation step before the per-criterion red/green loop, and the schema should make it a tracked task. Record its command and initial result under that task so later tasks can reuse the same regression set.

## Review the API before implementing it

An executable test needs a call it can make. Before production behavior exists, define only enough of the public API to let the test import and call it: signatures, types, error shape, and perhaps a stub that raises a clear “not implemented” error. Run the project's linter and static type checker on that API and the tests where those checks are available. Then review the test code as a user of the API: are the names clear, are inputs and outputs natural, and is the call actually needed?

The first meaningful red result should be attributable to missing **behavior**, not a typo, broken import, or type error. Lint and type checks help separate those failures. A deliberate “not implemented” error can confirm the test reaches the proposed API, but the test's assertions still need to describe the expected behavior. A stub is a tool for API review, not a request to design every internal class before implementation. If the API feels wrong, change the sketch and test together while the cost is low.

## Requirements, design, and tests can inform each other

Requirements and design are not a one-way gate before tests. A case may reveal a missing rule; a typed test may reveal an awkward return value; implementation may expose an adjacent behavior. A test failure can also reveal a behavior we had not considered. Diagnose the failure first: if it exposes a distinct user-visible expectation, add or revise the acceptance criterion and its scenarios, then update design and tests as needed. Keep those links coherent rather than leaving the test to silently redefine the intended behavior.

The acceptance criteria still lead the work. A discovered adjacent behavior needs its own criterion or case **when it changes what users can observe or what must be independently verified**. If it is an internal path already exercised by a high-level API test, another test for that path may add little value. This is a judgment about coverage and feedback, not a rule against unit tests.

## A test trophy for this workflow

For a web project, the intended mix is:

```text
              Few UI tests
       UI behavior and integration

             Many API tests
  Highest useful public API or service boundary

        Few focused unit tests
  Complex behavior needing faster or clearer feedback

     Lint and static type checks throughout
```

UI tests should prove UI behavior, such as interaction, rendering, and wiring. They should not carry the bulk of API behavior cases through a browser. API tests should cover most behavior at the highest stable boundary that still gives useful speed and diagnosis; for a package or CLI, that may be a public function or command rather than HTTP. Add focused unit tests for complex behavior when API tests are too slow, cannot isolate a risk clearly, or leave an important edge opaque. Test observable behavior at every level rather than mirroring private methods. This is **our preferred distribution**, not a fixed numerical ratio or a claim that every project has the same layers.

## The proposed loop

0. **Establish the existing-suite baseline.** With the criteria in view, discover the project's test tooling and commands, inspect and run related tests, and retain them in the regression set for every iteration.
1. **Choose one acceptance criterion.** Expand it into grouped Given/When/Then scenarios covering distinct behavior.
2. **Clarify the requirement and initial API design.** Record the normative outcome in the requirement body, sketch the public call and types, and define only enough API shape for tests to use it.
3. **Write and review automated test functions.** Express the scenarios in the project's test framework; run available lint and static type checks; review the API through the test calls. Revise the requirement or design when this reveals a gap.
4. **Get a meaningful failing test.** Run the new case and confirm that it fails for the missing behavior. Report the command and a concise failure summary in chat. Store detailed output only when it helps a deeper investigation. If the failure reveals a missing expectation, revise the criteria and cases before proceeding.
5. **Implement the simplest sound solution.** Write the smallest clear implementation that satisfies the criterion; simplicity can be the right final design. Run the focused cases and related existing suites until they pass.
6. **Refactor only when useful.** After green, remove real duplication or clarify structure in code or tests where it improves the result. Rerun the affected tests and related suites. Do not make a refactor pass ceremonial.
7. **Assess adjacent functionality.** Add a scenario or criterion for a distinct user-visible outcome or uncovered risk. Do not add tests for internal implementation paths already covered adequately by the public API tests.
8. **Repeat for the next criterion.** Keep the requirement, grouped scenarios, API design, and automated tests consistent as understanding changes.

The loop is deliberately iterative. It allows requirements and design to grow from tests without making tests the sole source of product intent. It also avoids forcing a new test for every internal step. The related suites remain part of the feedback loop throughout.

## Review evidence

A nearby test comment can name the criterion and short scenario title. For the red step, report the command, the relevant failing assertion or error, and why that failure represents missing behavior **in chat**. A stored log or trace is optional supporting material when the summary is not enough to understand a problem. When a failure changes the intended outcome, update the criterion and scenarios before treating the new test as the contract.

The first version deliberately retains OpenSpec's `### Requirement:` and `#### Scenario:` structure. That structure carries the criterion and its grouped cases through validation and archive while the schema changes the writing and implementation guidance. [Default schema](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/schemas/spec-driven/schema.yaml); [schema reference](https://github.com/Fission-AI/OpenSpec/blob/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777/docs-lab/reference/schemas/spec-driven/index.md).
