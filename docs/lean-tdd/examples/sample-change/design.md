# Design

## API by criterion

### Adding an item increases the count

The focal call is `add_item()`. The scenarios observe its effect through `count()` and `empty()`. All three are new.

```text
items = TodoList()
items.count()             -> 0
items.empty()             -> true
items.add_item("buy milk")
items.count()             -> 1
items.empty()             -> false
```

- `TodoList()` -> an empty list; no errors.
- `add_item(text)` -> nothing; no errors in this change.
- `count()` -> the number of items; no errors.
- `empty()` -> true exactly when `count()` is zero; no errors.

## Module boundaries

**Net complexity:** adds one class, `TodoList`, with three methods. No new dependencies and no internal boundaries.

## Test boundaries

The `TodoList` methods are the public API, so each scenario is one test against them. `count()` and `empty()` get no tests of their own. The two scenarios cover them: First item moves `empty()` from true to false, and Another item shows that `count()` counts past one.

## Risks / Trade-offs

- The acceptance tests do not check item contents or order. A later criterion that lists items would cover them.
