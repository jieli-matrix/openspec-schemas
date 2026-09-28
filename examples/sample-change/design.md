# Design

## Context

The to-do list needs a small public API for adding items and observing state.

## Decisions

Start with `add_item()` as the focal public method. A test of its first successful call needs `count()` and `empty()` to observe the result. Treat those queries as public features with their own requirements and tests; get their new-list behavior working first. Then run the `add_item()` test red for missing add behavior and implement it through the needed layers. Test another addition after the first case passes.

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
