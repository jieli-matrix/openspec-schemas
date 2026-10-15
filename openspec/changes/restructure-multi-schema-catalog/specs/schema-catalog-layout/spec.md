## ADDED Requirements

### Requirement: Each schema is one self-contained folder
Every schema SHALL live in `openspec/schemas/<name>/`, with `name` in its `schema.yaml` equal to the folder name. The folder SHALL contain only what OpenSpec reads: `schema.yaml` and the templates it references. No file in the folder SHALL depend on a path outside it, and schemas SHALL NOT share files with each other.

#### Scenario: Schema validates on its own
- **WHEN** a maintainer runs `openspec schema validate <name>` for any catalog schema
- **THEN** validation passes

#### Scenario: Installed copy is the whole schema
- **WHEN** a schema folder is copied alone into another project's `openspec/schemas/`
- **THEN** `openspec new change <change> --schema <name>` works there with no other file from this repository

### Requirement: Adding a schema needs no registry
The catalog SHALL be the set of folders under `openspec/schemas/` that contain a `schema.yaml`. No manifest, index, or CLI code SHALL need editing to add a schema.

#### Scenario: New schema folder
- **WHEN** a maintainer adds a valid `openspec/schemas/<new>/` folder
- **THEN** `openspec-schemas list` shows `<new>` and `openspec-schemas install <new>` installs it, with no other file changed

### Requirement: Schema docs, examples, and research stay out of installs
Material about a schema that OpenSpec does not read, including its README, diagrams, example changes, and research notes, SHALL live in `docs/<name>/`. It SHALL NOT be copied into projects.

#### Scenario: Lean TDD material
- **WHEN** a user installs `lean-tdd`
- **THEN** the installed folder has no README, image, example, or research file
- **AND** `docs/lean-tdd/` in this repository holds the lean-tdd README, workflow diagram, sample change, config example, and research notes, with working relative links

### Requirement: Root README is the catalog
The root `README.md` SHALL describe the repository as a collection of OpenSpec schemas. It SHALL list every catalog schema with its description and a link to `docs/<name>/`, and show the commands to list schemas, install one schema, install all schemas (project and `--user`), and start a change.

#### Scenario: Every schema is listed
- **WHEN** a reader opens the root README
- **THEN** each folder under `openspec/schemas/` has an entry linking to its `docs/<name>/` page
- **AND** the install commands use `npx github:jieli-matrix/openspec-schemas`

### Requirement: Package ships only the CLI and the catalog
The npm package SHALL be named `openspec-schemas`, and its files SHALL be limited to the CLI and `openspec/schemas/`. This repository's own OpenSpec changes, docs, and examples SHALL NOT be in the package.

#### Scenario: Packed contents
- **WHEN** a maintainer runs `npm pack --dry-run`
- **THEN** the listed files are the CLI, `package.json`, `README.md`, `LICENSE`, and files under `openspec/schemas/`
- **AND** nothing under `docs/` or `openspec/changes/` is listed
