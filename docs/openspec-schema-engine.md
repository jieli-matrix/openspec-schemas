# Building schemas on OpenSpec: engine notes

Every schema in this catalog is plain data that OpenSpec's engine interprets: a
`schema.yaml`, templates, and instruction text. This page records what that
engine actually does, so that a schema's design rests on code rather than
assumption. Read it before adding a schema or changing an artifact graph.

All links are pinned to OpenSpec
[`c794978`](https://github.com/Fission-AI/OpenSpec/tree/c794978f4f8845ce59693373c9dd882ee776588c)
(v1.14.3). `lean-tdd` forked from `79b6aa9`, and the schema contract below has not
changed between the two commits. When you upgrade the pin, re-check the linked
lines.

## The `schema.yaml` contract

The whole contract is three zod objects in
[`src/core/artifact-graph/types.ts#L29-L64`](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/types.ts#L29-L64):

| Object | Fields |
|---|---|
| artifact | `id`, `generates` (relative path or glob), `description`, `template`, `instruction?`, `requires` (default `[]`) |
| `apply` | `requires` (at least one artifact id), `tracks?` (path or glob, nullable), `instruction?` |
| schema | `name`, `version` (positive integer), `description?`, `artifacts` (1 to 1,000), `apply?` |

- **There is no other field.** Keys such as `optional:`, `when:`, `skipWhen:`, `phase:` or `post_apply:`
  do not exist. zod strips unknown keys **silently**, so a schema that uses them
  validates and the key does nothing. The reference says so:
  ["A field is misspelled … OpenSpec ignores it. Validation doesn't report the typo."](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/docs-lab/reference/schemas/schema-yaml.md?plain=1#L227)
- **Load-time checks:** duplicate artifact ids
  ([schema.ts#L53](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/schema.ts#L53)),
  `requires` cycles ([#L139](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/schema.ts#L139)),
  and unknown `apply.requires` ids ([#L100-L103](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/schema.ts#L100-L103)).
- **`apply.tracks` is only warned about.** `openspec schema validate` warns when
  it does not exactly equal some artifact's `generates`
  ([`findApplyTracksWarning`, schema.ts#L122](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/schema.ts#L122)).
  That equality matters for task progress; see [Apply](#apply).
- **References:** [`docs-lab/reference/schemas/schema-yaml.md`](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/docs-lab/reference/schemas/schema-yaml.md)
  and [`docs-lab/customize/schemas.md`](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/docs-lab/customize/schemas.md).

## Completion is file existence

- **An artifact is done when its output exists**
  ([`detectCompleted`, state.ts#L14](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/state.ts#L14)).
  Content is never read. An empty file, or one holding only the template, counts
  as done.
- **A glob artifact is done once one file matches**
  ([`resolveArtifactOutputs` / `artifactOutputExists`, outputs.ts#L335-L381](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/outputs.ts#L335-L381)).
  The engine cannot tell "all files written" from "one file written", so a
  family of files needs its own completeness ledger, such as tasks.md or an index
  file. Hidden directories never match
  ([`dot: false`, #L202](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/outputs.ts#L202)).
- **Planning is complete only when every artifact is done**
  ([`isComplete`, graph.ts#L166](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/graph.ts#L166)).
  `openspec status` reports this as `isPlanningComplete`.
- **`status` "Next" picks the first `ready` artifact in declaration order**
  ([`resolveNextStep`, change-status-policy.ts#L118-L123](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/change-status-policy.ts#L118-L123)),
  and so does `/opsx:continue`
  ([continue-change.ts#L93-L94](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/continue-change.ts#L93-L94)).
  An artifact that is never written keeps being offered as the next step.

## Optional artifacts

The engine has no notion of an optional artifact. The only built-in skip is
`skip_specs`, covered [below](#changes-without-spec-deltas). Everything else is
convention, honored or not by the generated skills:

- **`/opsx:propose` and `/opsx:ff` create only what apply needs.** That is
  `applyRequires` plus everything reachable through `requires`
  ([propose.ts#L148](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/propose.ts#L148)).
- **Instruction text can skip an artifact.** The same skills skip one whose
  `instruction` says it is conditional ("create only if…"), as spec-driven's
  `design` does
  ([#L152](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/propose.ts#L152)),
  and treat "dependencies \[as] enablers, not gates"
  ([#L153](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/propose.ts#L153)).
- **The archive skill warns about unfinished artifacts.** It lists any artifact
  that is neither `done` nor `skipped` and asks before archiving
  ([archive-change.ts#L95-L96](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/archive-change.ts#L95-L96)).

Patterns found in community schemas (catalog:
[`docs/customization.md#L413`](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/docs/customization.md?plain=1#L413)):

| Pattern | Example | Effect | Cost |
|---|---|---|---|
| Leaf artifact kept out of `apply.requires` and out of every `requires` | [cospec](https://github.com/aligned-team/cospec/blob/HEAD/docs/schemas.md), [recompose](https://github.com/recomposesh/recompose/blob/HEAD/openspec/schemas/recompose/schema.yaml) | never blocks apply | shown as `ready` forever; `/opsx:continue` offers it; archive warns |
| Condition stated in `instruction` | spec-driven `design` | propose/ff skip it | not checked; if a downstream artifact `requires` it, that artifact stays `blocked` |
| Always written, as a "None" stub | [intent-driven `adr.md`](https://github.com/intent-driven-dev/openspec-schemas/blob/main/openspec/schemas/intent-driven/schema.yaml) | `done`, so no warnings | one small file per change |
| Separate schema variants | [cospec](https://github.com/aligned-team/cospec) (one per commit type) | each graph stays strict | duplicated YAML; the variant is chosen at `new change` |
| Custom keys read by your own skill | [conduction](https://github.com/ConductionNL/integriq/blob/HEAD/openspec/schemas/conduction/schema.yaml) `optional:` / `skipWhen:` | core drops them | works only with that team's skill |

## Changes without spec deltas

- **The key.** `skip_specs` is a recognized `.openspec.yaml` key
  ([change-metadata/schema.ts#L30](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/change-metadata/schema.ts#L30)).
- **Set automatically.** `openspec new change` writes `skip_specs: true` when
  the schema has no artifact generating under `specs/`
  ([change-utils.ts#L171-L200](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/change-utils.ts#L171-L200)).
  The test is the path prefix
  ([`isSpecsArtifactPath`, outputs.ts#L241](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/outputs.ts#L241)),
  not an artifact id. A hand-made change needs the key added by hand.
- **Status.** Artifacts under `specs/` count as complete and show as `skipped`
  ([instruction-loader.ts#L301-L313](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/instruction-loader.ts#L301-L313)).
- **Validate.** Zero deltas becomes INFO instead of the ERROR "No deltas
  found", and files under `specs/` alongside the marker are an ERROR
  ([validator.ts#L545-L556](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/validation/validator.ts#L545-L556)).
- **Scope.** It covers only `specs/` paths. No equivalent exists for any other
  artifact.

## Apply

- **Apply waits for `apply.requires`.** Without an `apply` block, every
  artifact is required
  ([instructions.ts#L563](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/commands/workflow/instructions.ts#L563)).
  A missing transitive prerequisite produces "the schema says which are
  conditional" guidance instead of a hard stop
  ([#L637-L639](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/commands/workflow/instructions.ts#L637-L639)).
- **Apply's context.** `contextFiles` lists every existing output file of every
  artifact, with globs expanded to arrays
  ([#L591-L595](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/commands/workflow/instructions.ts#L591-L595)).
- **Progress counting is fussier than the apply instructions.** Apply itself
  reads `apply.tracks`, globs included
  ([#L604-L607](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/commands/workflow/instructions.ts#L604-L607)).
  But `list`, `view`, and the archive incomplete-task gate use `apply.tracks`
  only when it equals an artifact's `generates`. Otherwise they fall back to the
  artifact with id `tasks`
  ([task-progress.ts#L106-L112](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/task-progress.ts#L106-L112)),
  then to a literal `tasks.md`
  ([#L208](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/task-progress.ts#L208)).
  **Keep a `tasks` artifact that generates `tasks.md` and set
  `apply.tracks: tasks.md`.**
- **No phase exists after apply.** If a file written during apply is declared
  as an artifact, it is reported `ready` (and `/opsx:continue` writes it) as soon
  as its `requires` are met, which is *before* apply runs. superpowers-bridge
  [calls this an intentional misalignment](https://github.com/JiangWay/openspec-schemas/tree/main/superpowers-bridge)
  while it waits for a `post_apply` phase in core. The alternatives:
  - describe the file in `apply.instruction` and track it with a tasks.md
    checkbox, as [ml-research](https://github.com/idealo/openspec-schemas/tree/main/openspec/schemas/ml-research)
    does with `results.md`;
  - have apply write a receipt artifact that later artifacts `require`, as
    [superspec](https://github.com/danielhanold/superspec/blob/HEAD/openspec/schemas/superspec/schema.yaml)
    does with `apply.md`.

## Names the engine still assumes

The graph walkers are generic, but these spots hardcode spec-driven names:

| Name | Where | Consequence for a custom schema |
|---|---|---|
| `tasks` id, `tasks.md` | [task-progress.ts#L106-L112](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/task-progress.ts#L106-L112), [#L208](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/task-progress.ts#L208) | progress counts in `list`, `view`, archive |
| `proposal.md` | [archive.ts#L1461-L1467](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/archive.ts#L1461-L1467) | informative proposal validation at archive (warnings only; skipped if absent); `change show/list` titles |
| `specs/` prefix | [outputs.ts#L241](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/artifact-graph/outputs.ts#L241), [archive.ts#L1494](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/archive.ts#L1494) | `skip_specs`, delta validation, and archive's merge into `openspec/specs/` |
| `design` id or `…design.md` | [verify-change.ts#L141](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/verify-change.ts#L141) | `/opsx:verify` checks design adherence only if one exists |
| spec-driven capture table | [explore.ts#L220](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/core/templates/workflows/explore.ts#L220) | `/opsx:explore` falls back to "whichever artifact … fits" |

Archive merges only `specs/` deltas into `openspec/specs/`. Every other artifact
stays with the change in `changes/archive/`. Because `generates` may not leave the
change directory, durable output elsewhere has to be written in apply as a
second copy.

## Change metadata

`.openspec.yaml` warns about keys it does not know, except top-level `x-*` keys,
which are reserved for tools and teams
([change-metadata.ts#L18-L24](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/src/utils/change-metadata.ts#L18-L24)).
Put any schema-specific per-change metadata under `x-`.

## Version notes

- **Minimum version for multi-level globs is 1.3.1.** Before 1.3.1, apply's
  `contextFiles` silently dropped a glob artifact with more than one wildcard
  level (`a/*/b/*/c.md`), while `status` still reported it done.
  Fixed in 1.3.1
  ([CHANGELOG.md#L885](https://github.com/Fission-AI/OpenSpec/blob/c794978f4f8845ce59693373c9dd882ee776588c/CHANGELOG.md?plain=1#L885)).
  A schema relying on such globs should state the minimum version in its docs.
- **The schema contract is unchanged since the fork.**
  `types.ts`, `graph.ts`, `state.ts`, `schema.ts` and `resolver.ts` are
  identical between `79b6aa9` and `c794978`.
- **Forks are not updated.** `openspec update` never refreshes a project's schema
  fork, so compare upstream instruction changes by hand when upgrading.

## Adding a schema to this catalog

1. `openspec/schemas/<name>/schema.yaml` and `templates/`. Begin `schema.yaml` with a
   comment naming what it was forked or adapted from and what it keeps.
2. `docs/<name>/README.md` for the method, how to start a change, the loop, and
   attribution. Put design notes in `docs/<name>/explorations/` and a worked
   example in `docs/<name>/examples/`.
3. Add a row to the [catalog table](../README.md#schemas).
4. Update `test/openspec-schemas.test.mjs`. Its fixture copies the real catalog,
   but `catalogNames()` and the `list` / unknown-name assertions name the
   current schemas.
5. Run `openspec schema validate <name>`, then pilot one change with
   `openspec new change <change> --schema <name>` before recommending the schema
   as a project default.
