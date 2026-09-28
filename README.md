# Lean TDD schema for OpenSpec

A copyable OpenSpec community schema that keeps acceptance criteria and their cases together, starts implementation with related existing tests, and guides one criterion through a useful red/green loop at a time.

The bundle is forked from OpenSpec's `spec-driven` schema at [`79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777`](https://github.com/Fission-AI/OpenSpec/commit/79b6aa9c98f1e36795b2bc4ef2a8f770c6d3a777). Its four artifacts and apply tracking are unchanged. The schema is guidance for an agent; OpenSpec does not enforce test order or inspect test results.

## Install in a project

Install the [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec) and initialize the consuming project with `openspec init` if needed. From a checkout of this repository, copy the complete bundle into that project's `openspec/schemas/` directory:

```sh
mkdir -p /path/to/project/openspec/schemas
cp -R openspec/schemas/lean-tdd /path/to/project/openspec/schemas/
cd /path/to/project
openspec schema validate lean-tdd
```

On Windows PowerShell, use `Copy-Item -Recurse openspec/schemas/lean-tdd <project>/openspec/schemas/` from the checkout. Copy the directory itself, including `schema.yaml` and `templates/`.

Try it for one change while keeping your project's default:

```sh
openspec new change my-feature --schema lean-tdd
openspec status --change my-feature
```

After a pilot, optionally set the project default by putting the contents of [`examples/config.yaml`](examples/config.yaml) in the project's `openspec/config.yaml`. New changes then use `lean-tdd` without `--schema`; existing changes retain their recorded schema. Add project-specific context or rules only when useful. The reusable schema does not prescribe a language or test runner.

## Workflow

Write each acceptance criterion as one normative `### Requirement:` block. Put distinct, short-named `#### Scenario:` cases under it, preferably with Given/When/Then steps. The first tracked task discovers and runs related existing suites and records preexisting failures. For each criterion, write behavior checks at a useful public boundary, review the API through test calls, report a meaningful red failure in chat, implement the simplest sound behavior, then run focused and related suites. Refactor after green when it improves clarity or removes duplication. Use a few UI checks for UI behavior and focused unit checks when they add distinct feedback.

## Validate this repository

The sample change in [`examples/sample-change`](examples/sample-change) shows one criterion with two cases and an existing-suite baseline task. Run `node scripts/smoke.mjs` from this repository. It creates a disposable consuming project, installs the bundle, validates it and the sample change, resolves instructions for all artifacts, and checks both per-change and project-default selection. The script uses portable Node paths and temporary directories so it can run on Unix or Windows.

## License

MIT. The fork retains the OpenSpec Contributors attribution in [`LICENSE`](LICENSE).
