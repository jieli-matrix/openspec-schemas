# Lean TDD schema for OpenSpec

A copyable OpenSpec community schema that starts with a full-path happy-path test, builds a thin working skeleton, and then fleshes out acceptance criteria with distinct cases.

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

Write each acceptance criterion as one normative `### Requirement:` block. Put short-named `#### Scenario:` cases under it, with the simplest happy path first. The first tracked task runs related existing suites and records preexisting failures. Then use a bones-out approach: write a user-level E2E test that crosses the full relevant path and build only enough code to make that skeleton work. Flesh it out one boundary or error case at a time, reporting each meaningful red failure and rerunning the skeleton and related suites after green.

Use the [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) as a guide: static checks support the work, a few E2E tests cover representative full flows, integration tests check interacting parts, and focused unit tests help with complex logic. Choose each test for the confidence and feedback it adds; there is no required test ratio.

## Validate this repository

The to-do list change in [`examples/sample-change`](examples/sample-change) shows one criterion, a first-item walking skeleton, and two follow-up cases. Run `node scripts/smoke.mjs` from this repository. It creates a disposable consuming project, installs the bundle, validates it and the sample change, resolves instructions for all artifacts, and checks both per-change and project-default selection. The script uses portable Node paths and temporary directories so it can run on Unix or Windows.

## License

MIT. The fork retains the OpenSpec Contributors attribution in [`LICENSE`](LICENSE).
