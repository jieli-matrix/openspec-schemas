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

| Call | Inputs | Output | Errors |
| --- | --- | --- | --- |
| `TodoList()` | none | empty list | none |
| `add_item(text)` | item text | none | none in this change |
| `count()` | none | number of items | none |
| `empty()` | none | true exactly when `count()` is zero | none |

## Test boundaries

The `TodoList` methods are the public API, so each scenario is one test against them. `count()` and `empty()` get no tests of their own. The two scenarios cover them: First item moves `empty()` from true to false, and Another item shows that `count()` counts past one.

## Risks / Trade-offs

- The acceptance tests do not check item contents or order. A later criterion that lists items would cover them.
