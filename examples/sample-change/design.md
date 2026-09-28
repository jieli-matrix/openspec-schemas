# Design

## Context

The to-do list needs a small public API for adding items and observing state.

## Decisions

Start with AC-1 and `add_item()` as its focal public method. A test of its first successful call needs `count()` and `empty()` to observe the result. Give those queries public feature requirements explicitly linked to AC-1, and get their new-list behavior working first. Then run the `add_item()` test red for missing add behavior and implement it through the needed layers. Test another addition before closing AC-1; only then move to the next user-facing criterion.

The intended call shape is:

```text
items = TodoList()
items.count()             -> 0
items.empty()             -> true
items.add_item("buy milk")
items.count()             -> 1
items.empty()             -> false
```

## Risks / Trade-offs

- `count()` and `empty()` could be hardcoded for a new list; the `add_item()` test checks that both change with the list state.
