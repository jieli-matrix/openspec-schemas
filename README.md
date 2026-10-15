# OpenSpec Schemas

A catalog of custom workflow schemas for [OpenSpec](https://github.com/Fission-AI/OpenSpec). Each schema is a self-contained folder under [`openspec/schemas/`](openspec/schemas/).

## Schemas

| Schema | Description | Docs |
|---|---|---|
| `lean-tdd` | OpenSpec artifacts for a Lean TDD cycle driven by acceptance criteria | [docs/lean-tdd](docs/lean-tdd/README.md) |

## Install

Requires the [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec), Node.js 20.19+, and git.

```sh
# Show the available schemas
npx github:jieli-matrix/openspec-schemas list

# Copy one or more schemas into openspec/schemas/ of the current project
npx github:jieli-matrix/openspec-schemas install lean-tdd

# Copy every schema into the current project
npx github:jieli-matrix/openspec-schemas install --all

# Install every schema once for all your projects (recommended for --all)
npx github:jieli-matrix/openspec-schemas install --all --user

# Install a schema if needed, then run `openspec new change my-change --schema lean-tdd`
npx github:jieli-matrix/openspec-schemas new lean-tdd my-change
```

- `--dir <path>` targets another project; `--user` installs to `~/.local/share/openspec/schemas` (or `$XDG_DATA_HOME/openspec/schemas`).
- Installed schemas are skipped, never overwritten, and your default schema is left unchanged.

## License

MIT; see [LICENSE](LICENSE). Each schema's docs page lists its own attributions.
