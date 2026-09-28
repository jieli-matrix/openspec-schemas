# Proposal

## Why

The default spec-driven workflow records requirements and scenarios, but it does not guide a team through using those scenarios as executable, behavior-focused tests while preserving existing test coverage. A standalone Lean TDD schema can make that practice easy to try and review without changing OpenSpec's core workflow.

## What Changes

- Create and publish an independent `openspec-lean-tdd-schema` repository with a copyable `openspec/schemas/lean-tdd/` bundle forked from the current `spec-driven` schema.
- Adapt schema instructions and templates so acceptance criteria remain normative requirements, related Given/When/Then test cases stay grouped as scenarios, and the implementation loop starts with a baseline of related existing suites.
- Guide agents to sketch and review public API calls through tests and available static checks, report meaningful red failures, implement the simplest sound behavior, keep existing suites in the regression set, and refactor only when useful after green.
- Provide a minimal `config.yaml` example, an illustrated to-do walkthrough, and a Git-remote command that installs the schema and starts a change.

## Capabilities

### New Capabilities

None in OpenSpec core. The new workflow is distributed through a separate repository.

### Modified Capabilities

None. OpenSpec's default schema, CLI behavior, and existing project specs remain unchanged.

## Impact

The deliverable is a public third-party repository containing the `lean-tdd` schema bundle, example, starter command, and documentation. Consumers install it from its Git remote and select it per change or in `openspec/config.yaml`. This proposal adds no runtime dependency or behavior change to the OpenSpec package.
