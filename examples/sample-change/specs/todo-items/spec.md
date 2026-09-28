# Spec Delta

## Purpose

The to-do list helps users keep track of their items and see an accurate count as they add work to complete.

## ADDED Requirements

### Requirement: AC-1 Adding an item increases the count
The system SHALL increase the to-do item count by one for each nonblank item added. Empty input SHALL leave the count unchanged.

#### Scenario: First item
- **GIVEN** an empty to-do list showing a count of zero
- **WHEN** the user adds a nonblank item
- **THEN** the item appears in the list and the count is one

#### Scenario: Another item
- **GIVEN** a to-do list showing a count of one
- **WHEN** the user adds another nonblank item
- **THEN** both items appear and the count is two

#### Scenario: Empty input
- **GIVEN** a to-do list showing a count of one
- **WHEN** the user submits an empty item
- **THEN** no item is added and the count remains one
