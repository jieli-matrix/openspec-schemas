# Design

## Module boundaries

**Net complexity:** adds one class, `TodoList`, with three methods. No new dependencies and no internal boundaries.

### `TodoList` (public, new)

- **Usage:**
  ```python
  items = TodoList()
  items.count()               # -> 0
  items.empty()               # -> True
  items.add_item("buy milk")  # Adding an item increases the count
  items.count()               # -> 1
  items.empty()               # -> False
  ```
  No call raises in this change.
- **Hides:** how items are stored. Callers never touch the collection or keep their own count, and `empty()` reads the same storage as `count()`, so the two cannot disagree.
- **Abstraction:** a to-do list that holds items by their text.
- **Specifics:** none yet. A rule about item text, such as rejecting blank items, would belong in `add_item()`, not in its callers.

## Test boundaries

The `TodoList` methods are the public API, so each scenario is one test against them. `count()` and `empty()` get no tests of their own. The two scenarios cover them: First item moves `empty()` from true to false, and Another item shows that `count()` counts past one.

## Risks / Trade-offs

- The acceptance tests do not check item contents or order. A later criterion that lists items would cover them.
