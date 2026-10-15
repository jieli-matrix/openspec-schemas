## Why

The repository ships one schema, `lean-tdd`, through a single-purpose `openspec-lean-tdd` command, and its root README, assets, examples, and research notes all assume lean-tdd is the only schema. A second, unrelated schema is planned, so the layout and the installer must become a catalog: users pick a schema by name, or pull every schema at once, with one short command.

## What Changes

- Treat `openspec/schemas/` as the catalog. Each child folder holds exactly what one schema ships (`schema.yaml` and `templates/`) and nothing else. Schemas share no files.
- Move per-schema material that is not installed into `docs/<schema>/`: lean-tdd's README, workflow diagram, sample change and config example, and research notes go to `docs/lean-tdd/`.
- Rewrite the root README as a catalog: what the repository is, the list of schemas with links to their docs, and the install commands.
- Replace `scripts/start.mjs` with one generic CLI, `openspec-schemas`, runnable as `npx github:jieli-matrix/openspec-schemas <command>`:
  - `list` shows the schema names and descriptions.
  - `install <name>...` copies the named schemas into the project.
  - `install --all` copies every schema.
  - `--user` installs to OpenSpec's user-level schema directory instead of the project.
  - `new <schema> <change>` installs the schema if needed, then runs `openspec new change`.
- **BREAKING**: remove the `openspec-lean-tdd` command and the `npm exec ... -- openspec-lean-tdd <change>` invocation. Use `npx github:jieli-matrix/openspec-schemas new lean-tdd <change>`.
- Rename the npm package from `openspec-lean-tdd-schema` to `openspec-schemas` to match the Git remote, and ship the whole `openspec/schemas/` folder.
- Fix README links that still point to `docs/changes/`; those changes are now under `openspec/changes/archive/`.

Out of scope: updating or overwriting a schema that is already installed (the installer skips it), the second schema's content, and per-schema command aliases.

## Capabilities

### New Capabilities
- `schema-installer`: the `openspec-schemas` CLI. Covers listing schemas, installing named schemas or all of them into a project or the user-level directory, skipping schemas that are already installed, rejecting unknown names, and starting a change with a schema.
- `schema-catalog-layout`: the repository contract. One self-contained folder per schema under `openspec/schemas/`, adding a schema needs no registry edit, and docs, examples, and research live outside the installed folder.

### Modified Capabilities
<!-- None: openspec/specs/ is empty. -->

## Impact

- `package.json`: name, `bin`, and `files` change.
- `scripts/start.mjs` is replaced by `bin/openspec-schemas.mjs`.
- `README.md`, `assets/`, `examples/`, and `docs/explorations/` move or are rewritten.
- Anyone using the old `openspec-lean-tdd` one-liner must switch to `npx github:jieli-matrix/openspec-schemas new lean-tdd <change>`.
- Schemas already installed in projects are not touched.
