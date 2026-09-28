# Design

## Context

The to-do list has a user-facing add-item flow and a displayed item count.

## Decisions

Use the First item scenario as a walking skeleton: one user-level E2E check drives the add-item entry point through storage to the displayed count. Review the test-facing add-item call and empty-input behavior before implementation. Add integration checks for subsequent additions and input rejection where they give faster, distinct feedback.

## Risks / Trade-offs

- A count could update without retaining the item; the skeleton check observes both the list and count.
