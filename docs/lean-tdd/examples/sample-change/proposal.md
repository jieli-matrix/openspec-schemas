# Proposal

## Why

People using a to-do list need the item count to reflect what they have added.

## What Changes

- Add items through `add_item()` and expose `count()` and `empty()` so callers can observe list state.

## Capabilities

### New Capabilities

- `todo-items`: Add items and report their count and whether the list is empty.

### Modified Capabilities

None.

## Impact

Adds a small public list API and its item storage behavior.
