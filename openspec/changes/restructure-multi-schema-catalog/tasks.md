## 1. Move lean-tdd material out of the installed folder

- [x] 1.1 `git mv` `README.md` → `docs/lean-tdd/README.md`, `assets/` → `docs/lean-tdd/assets/`, `examples/` → `docs/lean-tdd/examples/`, `docs/explorations/` → `docs/lean-tdd/explorations/`
- [x] 1.2 Rebase every relative link in `docs/lean-tdd/README.md`: the diagram, examples, explorations, `LICENSE` (`../../LICENSE`), and the two change links (now `../../openspec/changes/archive/2026-10-15-*/design.md`)
- [x] 1.3 Replace the old `npm exec ... -- openspec-lean-tdd` section in `docs/lean-tdd/README.md` with `npx github:jieli-matrix/openspec-schemas new lean-tdd your-openspec-change`, and point the config example link at `examples/config.yaml`
- [x] 1.4 Grep the repo (excluding `openspec/changes/archive/`) for `assets/`, `examples/`, `docs/explorations`, `docs/changes`, and `openspec-lean-tdd`, and fix any remaining stale paths
- [x] 1.5 Confirm `openspec/schemas/lean-tdd/` holds only `schema.yaml` and `templates/`, and that `openspec schema validate lean-tdd` passes

## 2. Test harness

- [x] 2.1 Add `test/openspec-schemas.test.mjs` using `node:test`. Add helpers that create a temporary project and a temporary `XDG_DATA_HOME`, and run `bin/openspec-schemas.mjs` as a child process with those settings
- [x] 2.2 Add a stub `openspec` executable, placed first on `PATH`, that records its arguments and working directory, for the `new` tests
- [x] 2.3 Add `"test": "node --test"` to `package.json` scripts

## 3. CLI: list and install by name

- [x] 3.1 Write failing tests for: `list` output sorted with descriptions; `install lean-tdd` into the current directory; `install` into `--dir`; `--dir` that does not exist; usage error for `install` with no names
- [x] 3.2 Create `bin/openspec-schemas.mjs` (shebang, `parseArgs`). Discover the catalog from `../openspec/schemas/*/schema.yaml` relative to the script, and read `description:` with a regex
- [x] 3.3 Implement `list`, and `install <name>...` into `<dir>/openspec/schemas/` with `mkdirSync` + `cpSync`, so the tests in 3.1 pass

## 4. CLI: install rules

- [x] 4.1 Write failing tests for: unknown name among valid names (nothing copied, available names printed, non-zero exit); an existing target is skipped with its files unchanged while the others install; `install --all`
- [x] 4.2 Validate all names before copying, skip and report existing targets, and implement `--all`, so the tests in 4.1 pass

## 5. CLI: user-level installs

- [x] 5.1 Write failing tests for: `install lean-tdd --user` with `XDG_DATA_HOME` set (copies into `$XDG_DATA_HOME/openspec/schemas/`); `--user` together with `--dir` is a usage error
- [x] 5.2 Implement user-level directory resolution, mirroring OpenSpec's `getGlobalDataDir()` (XDG → Windows `%LOCALAPPDATA%` → `~/.local/share`), so the tests in 5.1 pass
- [x] 5.3 Add a test that is skipped when `openspec` is not on PATH: after `install --all --user`, `openspec schema which lean-tdd --json` in a bare project reports the user-level path

## 6. CLI: start a change

- [x] 6.1 Write failing tests using the stub `openspec`: `new lean-tdd add-login` installs into the project and calls `openspec new change add-login --schema lean-tdd` in the project directory; with the schema already at user level, nothing is copied; an invalid change name prints usage and installs nothing; `config.yaml` is unchanged; the exit status passes through
- [x] 6.2 Implement `new` (reusing the install path and resolution check, `spawnSync` with `OPENSPEC_TELEMETRY=0` and the Windows `shell` flag carried over from `start.mjs`), so the tests in 6.1 pass
- [x] 6.3 Delete `scripts/start.mjs`

## 7. Package and catalog README

- [x] 7.1 Update `package.json`: name `openspec-schemas`, `bin` `{ "openspec-schemas": "./bin/openspec-schemas.mjs" }`, `files` `["bin", "openspec/schemas"]`
- [x] 7.2 Run `npm pack --dry-run` and check that only the CLI, `package.json`, `README.md`, `LICENSE`, and `openspec/schemas/**` are listed
- [x] 7.3 Write the root `README.md` as a catalog: what the repo is; prerequisites (OpenSpec CLI, Node ≥ 20.19, git); a schema table with descriptions and `docs/<name>/` links; commands for `list`, `install <name>`, `install --all`, `install --all --user`, and `new`; license
- [x] 7.4 Run `npm test` and make sure all tests pass

## 8. End-to-end check from the Git remote

- [x] 8.1 Locally, check that `npx --package=. openspec-schemas list` and `npm exec --package=file:$PWD -- openspec-schemas list` run from a scratch directory
- [x] 8.2 After pushing, in a scratch OpenSpec project, run each README command via `npx github:jieli-matrix/openspec-schemas` and check the results with `openspec schema which`
- [ ] 8.3 Push a trivial commit and re-run `npx github:jieli-matrix/openspec-schemas list` to see whether npx picks up the new commit. If it is stale, document the workaround in the README
