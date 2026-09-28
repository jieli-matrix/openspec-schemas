# Lean TDD schema for OpenSpec

A copyable OpenSpec community schema that turns a user-facing acceptance criterion into a test at the system public API, grows the public behavior needed to run it, and repeats for the next criterion.

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

Write each user-facing acceptance criterion, often first expressed through the UI, as one normative `### Requirement:` block with short-named `#### Scenario:` cases. The first tracked task runs related existing suites and records preexisting failures. For bones-out development, take a simple happy path and draft a test through the system public API. If that test needs new public queries or setup calls, specify and implement them as features. Then make the focal test pass, rerun related suites, and take the next criterion or distinct case through the same loop. A public API test can cover all relevant implementation layers without a UI or E2E harness.

Use the [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) as a guide: static checks support the work, public API or integration tests check interacting parts, broader E2E tests cover representative flows when useful, and focused unit tests help with complex logic. Choose each test for the confidence and feedback it adds; there is no required test ratio.

## Validate this repository

The to-do list change in [`examples/sample-change`](examples/sample-change) starts with `add_item()` and adds `count()` and `empty()` as public features needed to test it. Run `node scripts/smoke.mjs` from this repository. It creates a disposable consuming project, installs the bundle, validates it and the sample change, resolves instructions for all artifacts, and checks both per-change and project-default selection. The script uses portable Node paths and temporary directories so it can run on Unix or Windows.

## License

MIT. The fork retains the OpenSpec Contributors attribution in [`LICENSE`](LICENSE).
