## Context

The repository was built around one schema. The current layout:

- `openspec/schemas/lean-tdd/` holds `schema.yaml` and `templates/`.
- The root `README.md` is the lean-tdd guide. Its diagram is in `assets/`, its sample change and config example are in `examples/`, and its research notes are in `docs/explorations/`.
- `scripts/start.mjs` is exposed as the `openspec-lean-tdd` bin. It copies `lean-tdd` into a project if the folder is missing, then runs `openspec new change <name> --schema lean-tdd`.
- `package.json` is named `openspec-lean-tdd-schema`, while the Git remote is `jieli-matrix/openspec-schemas`.
- The repository uses OpenSpec on itself (`openspec/config.yaml`, schema `spec-driven`). Its two earlier changes are archived under `openspec/changes/archive/`.

A second schema is planned. It shares nothing with lean-tdd, and its content is not part of this change.

The reference catalog, intent-driven-dev/openspec-schemas, also uses one folder per schema under `openspec/schemas/`, with a catalog README at the root. It has no installer: users ask an agent to clone the repository and copy a folder. Its guide sends user-level installs to `$HOME/.openspec/schemas/`, a path OpenSpec 1.2.0 never reads.

OpenSpec 1.2.0 resolves a schema in this order (`dist/core/artifact-graph/resolver.js`):

1. `<project>/openspec/schemas/<name>/`
2. The user-level directory: `$XDG_DATA_HOME/openspec/schemas/<name>/`. Without `XDG_DATA_HOME`, it is `%LOCALAPPDATA%\openspec\schemas\<name>\` on Windows and `~/.local/share/openspec/schemas/<name>/` elsewhere.
3. The schemas built into the OpenSpec package

## Goals / Non-Goals

**Goals:**
- Adding a schema is one new folder under `openspec/schemas/` plus a `docs/<name>/` page.
- One short command lists schemas, installs one or more by name, installs all of them, and starts a change.
- Installs can target a project or the user-level directory that OpenSpec actually reads.
- What reaches a user's project is exactly the schema, with no docs or examples.

**Non-Goals:**
- Updating, overwriting, or diffing schemas that are already installed.
- Keeping the `openspec-lean-tdd` command or the old `npm exec ... -- openspec-lean-tdd` invocation working.
- Per-schema command aliases.
- Writing the second schema.
- Companion skills (like the reference repo's `skills.txt`), version pinning, and releases.

## Decisions

### The catalog is the folder listing
A schema exists when `openspec/schemas/<name>/schema.yaml` exists. The CLI finds schemas by reading that directory at run time, relative to its own location in the package.
- *Alternative:* a `schemas.json` manifest. Rejected because it can drift from the folders, and adding a schema would mean editing two places.

### Installed folder = repository folder; everything else goes in `docs/<name>/`
The rule is "if it is inside `openspec/schemas/<name>/`, it is installed". The CLI copies the folder whole, with no filter list. Lean-tdd's other material moves to `docs/lean-tdd/`:

```
docs/lean-tdd/
├── README.md            ← current root README, links rebased
├── assets/              ← lean-tdd-workflow.{mmd,png}
├── examples/            ← config.yaml, sample-change/
└── explorations/        ← lean-tdd-insights.md, lean-tdd-schema-options.md
```

Keeping the README next to its diagram and examples keeps its relative links working on GitHub.
- *Alternative:* a README inside each schema folder, as the reference repo does, with the installer skipping it. Rejected for two reasons: the installer would need a filter, and a shipped README would link to images and examples that are not shipped.
- *Alternative:* shared root `assets/` and `examples/` folders. Rejected because they mix schemas that share nothing, and a second schema would bring name clashes.

### One bin named after the package, for `npx github:` invocation
`package.json` is renamed `openspec-schemas` and has a single `bin` entry, `openspec-schemas`, pointing to `bin/openspec-schemas.mjs`. When `npx` (`npm exec`) is given a package spec without a command, it runs the package's only bin, or the bin matching the package name. So this works:

```sh
npx github:jieli-matrix/openspec-schemas list
npx github:jieli-matrix/openspec-schemas install lean-tdd
npx github:jieli-matrix/openspec-schemas install --all [--user]
npx github:jieli-matrix/openspec-schemas new lean-tdd my-change
```

`files` becomes `["bin", "openspec/schemas"]`. npm always adds `package.json`, `README.md`, and `LICENSE`.
- *Alternative:* keep `npm exec --yes --package=git+https://... -- <bin>`. Rejected because it is long, and the user asked for the shorter form. It still works with the new bin name if someone needs it.

### Subcommands and flags

| Command | Behaviour |
|---|---|
| `list` | name + `description` per schema, sorted |
| `install <name>... \| --all` | copy to the project (`--dir`, default cwd) or the user level (`--user`) |
| `new <schema> <change>` | install into the project if the schema resolves neither in the project nor at user level, then `openspec new change <change> --schema <schema>` |

Arguments are parsed with `node:util` `parseArgs`. The package has no dependencies; Node ≥ 20.19 is already required. The description is read with a regex for the top-level `description:` line in `schema.yaml`, instead of adding a YAML parser. Both current and planned schemas use a single-line description.

`--user` and `--dir` together is a usage error. `new` keeps today's default of installing into the project, because it is about one project.

### User-level path mirrors OpenSpec
The CLI computes the user-level directory exactly as OpenSpec's `getGlobalDataDir()` does: `XDG_DATA_HOME`, then `%LOCALAPPDATA%` on Windows, then `~/.local/share`, each followed by `openspec/schemas`. This avoids the reference repo's `$HOME/.openspec` mistake. `new` checks this directory and the project before deciding to install.

### Validate first, then copy; skip existing targets
`install` resolves every requested name against the catalog before copying anything, so a typo leaves the target untouched. A target folder that already exists is skipped and reported, never merged or overwritten. Updating schemas is out of scope, and skipping is the only behaviour that cannot destroy local edits.

### Tests use `node:test` with temporary directories and a fake `openspec`
`test/openspec-schemas.test.mjs` runs the CLI as a child process for each spec scenario. Each run gets a temporary project directory and `XDG_DATA_HOME`. For `new`, a stub `openspec` executable early on `PATH` records its arguments, so the tests don't need the real CLI or network access. One scenario uses the real `openspec`, when it is installed, to check that `schema which` resolves the user-level install. `npm test` runs `node --test`. `test/` is not in `files`, so it is not shipped.

## Risks / Trade-offs

- [The `npx github:` form needs `git` on PATH and fetches the repository on each cold run] → This is the same cost as today's `git+https` form. The README lists `git` as a prerequisite.
- [npx may run a cached copy instead of the latest commit] → Verify during implementation by pushing a commit and re-running. If it is stale, document `npx github:jieli-matrix/openspec-schemas#main` or clearing the cache.
- [`npx` asks "Ok to proceed?" on first use] → Acceptable for interactive use; `npx -y` skips it in scripts.
- [The `description` regex misses a multi-line YAML description] → The `list` output falls back to an empty description. The catalog-layout spec keeps descriptions on one line by convention, and `openspec schema validate` still covers correctness.
- [Breaking: existing users of `openspec-lean-tdd` get "command not found"] → Accepted by the user. The lean-tdd docs page and the root README show the replacement `new lean-tdd <change>` command.
- [OpenSpec changes its user-level resolution in a future version] → The tests pin the 1.2.0 rules. The design notes the source location so the rules can be re-checked on upgrade.

## Migration Plan

1. Move the lean-tdd material into `docs/lean-tdd/` with `git mv` so history is kept, and rebase its links. This includes the archived change links, which now point to `openspec/changes/archive/2026-10-15-*/design.md`.
2. Add the CLI and its tests, then delete `scripts/start.mjs`.
3. Update `package.json` and write the root catalog README.
4. Push. Then from a scratch project, run each README command through `npx github:jieli-matrix/openspec-schemas`.

Rollback is reverting the commit. Projects that already installed `lean-tdd` are never touched.

## Open Questions

None blocking. The second schema's name and docs page arrive with its own change.
