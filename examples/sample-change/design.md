# Design

## Context

The cart can already be read by the export action.

## Decisions

Expose one export call that returns CSV content and a download filename. Review the call shape and errors through the acceptance tests before implementing serialization. Use the public export action as the main test boundary.

## Risks / Trade-offs

- CSV escaping errors could affect exported rows; add a focused check if the public tests leave this risk unclear.
