## ADDED Requirements

### Requirement: Runs from the Git remote with a short command
The package SHALL expose exactly one command, `openspec-schemas`, so that `npx github:jieli-matrix/openspec-schemas <command>` runs it without naming the command.

#### Scenario: Short invocation selects the CLI
- **WHEN** a user runs `npx github:jieli-matrix/openspec-schemas list`
- **THEN** npm runs `openspec-schemas list` from the package fetched from the Git remote

### Requirement: Lists available schemas
`openspec-schemas list` SHALL print every schema in the catalog, sorted by name, with the `description` from its `schema.yaml`.

#### Scenario: Catalog with schemas
- **WHEN** a user runs `openspec-schemas list`
- **THEN** the output has one line per catalog schema, giving its name and description
- **AND** the command exits with status 0

### Requirement: Installs schemas by name into a project
`openspec-schemas install <name>...` SHALL copy each named schema folder into `<project>/openspec/schemas/<name>/`. The project is the current directory, or the directory given by `--dir <path>`. The command SHALL create `openspec/schemas/` if it does not exist.

#### Scenario: One schema into the current directory
- **WHEN** a user runs `openspec-schemas install lean-tdd` from a project directory
- **THEN** `openspec/schemas/lean-tdd/` in that project matches the catalog's `lean-tdd` folder file for file
- **AND** no other schema is copied

#### Scenario: Several schemas into another directory
- **WHEN** a user runs `openspec-schemas install lean-tdd <other> --dir ../app`
- **THEN** both schemas are copied into `../app/openspec/schemas/`

#### Scenario: Project directory does not exist
- **WHEN** `--dir` names a path that is not an existing directory
- **THEN** the command prints an error naming that path, copies nothing, and exits with a non-zero status

### Requirement: Installs every schema
`openspec-schemas install --all` SHALL install every schema in the catalog, following the same rules as installing by name.

#### Scenario: Pull the whole catalog
- **WHEN** a user runs `openspec-schemas install --all`
- **THEN** every schema listed by `openspec-schemas list` is present under `openspec/schemas/` in the project

### Requirement: Installs to the user-level schema directory
With `--user`, `install` SHALL copy schemas into OpenSpec's user-level schema directory instead of a project. That directory is `$XDG_DATA_HOME/openspec/schemas` when `XDG_DATA_HOME` is set. Otherwise it is `%LOCALAPPDATA%\openspec\schemas` on Windows and `~/.local/share/openspec/schemas` elsewhere. These are the same rules OpenSpec uses to resolve user-level schemas.

#### Scenario: Install all for every project
- **WHEN** a user runs `openspec-schemas install --all --user` with `XDG_DATA_HOME` unset on macOS or Linux
- **THEN** every catalog schema is present under `~/.local/share/openspec/schemas/`
- **AND** `openspec schema which <name>` in any project without its own copy reports the user-level path

#### Scenario: XDG_DATA_HOME is set
- **WHEN** `XDG_DATA_HOME=/data` and a user runs `openspec-schemas install lean-tdd --user`
- **THEN** the schema is copied to `/data/openspec/schemas/lean-tdd/`

### Requirement: Leaves installed schemas untouched
When a schema folder already exists at the target, `install` SHALL skip that schema without changing any of its files, report that it was skipped, and still install the other requested schemas.

#### Scenario: One requested schema already installed
- **WHEN** the project already has `openspec/schemas/lean-tdd/` with local edits and a user runs `openspec-schemas install --all`
- **THEN** the local `lean-tdd` files are unchanged and the output says `lean-tdd` was skipped
- **AND** every other catalog schema is installed and the command exits with status 0

### Requirement: Rejects unknown schema names before copying
When any requested name is not in the catalog, `install` and `new` SHALL print the unknown names and the available names, copy nothing, and exit with a non-zero status.

#### Scenario: Typo among valid names
- **WHEN** a user runs `openspec-schemas install lean-tdd lean-tddd`
- **THEN** the output names `lean-tddd` as unknown and lists the available schemas
- **AND** `lean-tdd` is not installed either

#### Scenario: Nothing requested
- **WHEN** a user runs `openspec-schemas install` with no names and without `--all`
- **THEN** the command prints usage and exits with a non-zero status

### Requirement: Starts a change with a schema
`openspec-schemas new <schema> <change>` SHALL make the schema available to the project and then run `openspec new change <change> --schema <schema>` in the project directory, which is the current directory or `--dir <path>`. If the schema exists neither in the project nor in the user-level directory, the command SHALL first install it into the project. It SHALL NOT change the project's `openspec/config.yaml`, and it SHALL exit with the status of `openspec new change`.

#### Scenario: Schema not yet available
- **WHEN** a user runs `openspec-schemas new lean-tdd add-login` in a project that has no `lean-tdd` schema
- **THEN** `openspec/schemas/lean-tdd/` is installed in the project
- **AND** `openspec/changes/add-login/` is created with schema `lean-tdd`
- **AND** `openspec/config.yaml` is unchanged

#### Scenario: Schema already installed at user level
- **WHEN** `lean-tdd` exists in the user-level directory but not in the project, and a user runs `openspec-schemas new lean-tdd add-login`
- **THEN** nothing is copied into the project and the change is created with schema `lean-tdd`

#### Scenario: Invalid change name
- **WHEN** the change name is not kebab-case (for example `Add Login`)
- **THEN** the command prints usage, installs nothing, and exits with a non-zero status
