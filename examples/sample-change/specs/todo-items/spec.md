# Spec Delta

## Purpose

The to-do list lets callers add items and observe how many items it contains and whether it is empty.

## ADDED Requirements

### Requirement: Adding an item increases the count
The list SHALL increase its item count by one for each successful `add_item()` call.

#### Scenario: First item
- **GIVEN** a new list whose `count()` is zero and `empty()` is true
- **WHEN** the caller invokes `add_item("buy milk")`
- **THEN** `count()` is one and `empty()` is false

#### Scenario: Another item
- **GIVEN** a list whose `count()` is one
- **WHEN** the caller invokes `add_item("write tests")`
- **THEN** `count()` is two
