# Spec Delta

## Purpose

Cart export lets users take a portable record of their current cart contents before checkout or sharing it elsewhere.

## ADDED Requirements

### Requirement: AC-1 Export the current cart
The system SHALL export the current cart as a CSV file with a header and one row per item.

#### Scenario: Populated cart
- **GIVEN** a cart containing two items
- **WHEN** the user exports the cart
- **THEN** the downloaded CSV contains the header and two item rows

#### Scenario: Empty cart
- **GIVEN** an empty cart
- **WHEN** the user exports the cart
- **THEN** the downloaded CSV contains only the header
