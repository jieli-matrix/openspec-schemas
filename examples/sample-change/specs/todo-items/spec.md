# Spec Delta

## Purpose

The to-do list lets callers add items and observe how many items it contains and whether it is empty.

## ADDED Requirements

### Requirement: AC-1 Adding an item increases the count
The list SHALL increase its item count by one for each successful `add_item()` call.

#### Scenario: First item
- **GIVEN** a new list whose `count()` is zero and `empty()` is true
- **WHEN** the caller invokes `add_item("buy milk")`
- **THEN** `count()` is one and `empty()` is false

#### Scenario: Another item
- **GIVEN** a list whose `count()` is one
- **WHEN** the caller invokes `add_item("write tests")`
- **THEN** `count()` is two

### Requirement: AC-2 Count reports the number of items
The list's `count()` method SHALL report the number of items it contains.

#### Scenario: New list has zero items
- **GIVEN** a newly created list
- **WHEN** the caller invokes `count()`
- **THEN** the result is zero

### Requirement: AC-3 Empty reports whether the list has items
The list's `empty()` method SHALL be true exactly when its item count is zero.

#### Scenario: New list is empty
- **GIVEN** a newly created list
- **WHEN** the caller invokes `empty()`
- **THEN** the result is true

#### Scenario: List with an item is not empty
- **GIVEN** a list containing one item
- **WHEN** the caller invokes `empty()`
- **THEN** the result is false
