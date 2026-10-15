# Tasks

## 1. Schema instructions

- [x] 1.1 Rewrite the `specs` instruction per design decisions 1–4 and 8: requirement = criterion, scenario = one acceptance test, needed APIs only inside steps, anti-stub rule, spec order = implementation order, plain requirement names, and only the essential delta syntax. Verify that the instruction no longer mentions `**Supports:**`, `AC-` headings, or "potential test case".
- [x] 1.2 Rewrite the `design` instruction per decision 7: write design after the specs, with API by criterion, test boundaries, non-obvious decisions, and risks. Keep the forked graph unchanged, and verify that every `requires` list matches upstream `spec-driven`.
- [x] 1.3 Rewrite the `tasks` instruction per decision 5: a baseline group, then `## <n>. AC-<k> <requirement name>` in spec order, one checkbox per scenario, MODIFIED/REMOVED/RENAMED handling, and a final regression group, all in the default `X.Y` checkbox format. Verify that "Order tasks by dependency" and upstream's rules about where tests and docs go are gone.
- [x] 1.4 Rewrite the `apply` instruction per decision 6 as the only place the loop is described: baseline first, stub needed APIs, red for the scenario, implement, rerun focused and baseline suites, refactor only when useful, lower-level test as a justified exception, revise specs on a new observable outcome. Verify the loop wording no longer appears in the tasks or design instructions.
- [x] 1.5 Update the schema header comment to record what is kept from upstream on purpose. Run `wc -w` and record the new size against the current 2,481 words. Read every rewritten instruction from start to finish to check for leftover contradictions.

## 2. Templates

- [x] 2.1 Rewrite `templates/spec.md` with plain requirement names, a happy-path scenario first, and a short comment on the anti-stub rule. Remove the Supports comment.
- [x] 2.2 Rewrite `templates/design.md` with API by criterion, Test boundaries, Decisions, and Risks / Trade-offs.
- [x] 2.3 Rewrite `templates/tasks.md` with the projection layout from decision 5 in the default `X.Y` checkbox format.

## 3. Sample change and docs

- [x] 3.1 Rewrite `examples/sample-change/` so the spec has one requirement, "Adding an item increases the count", with First item and Another item. Design lists `add_item()`, `count()`, `empty()` under that criterion. Tasks are 1.1 baseline, 2.1 First item, 2.2 Another item, 3.1 final regression. Check that the sample follows the rewritten templates.
- [x] 3.2 Update the README walkthrough and `assets/lean-tdd-workflow.mmd` (replace step 3, "supporting public API features", with "stub the APIs the test calls"), re-render the PNG, and check that the README matches the sample.
- [x] 3.3 Update `docs/explorations/lean-tdd-insights.md` and `lean-tdd-schema-options.md` where they describe `AC-N` headings, `AC-1 / <scenario>` test comments, or supporting requirements. Point them to this change for the new model.

## 4. Pilot

- [ ] 4.1 In a disposable project, have an agent propose a small change with `--schema lean-tdd` and no extra prompting. Check that the spec has only criteria, task groups match spec order one to one, needed APIs appear only in design and the scenario steps, and no per-API tests are planned. Record what drifted and fix the instruction that caused it.
